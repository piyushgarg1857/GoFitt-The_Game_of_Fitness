import { useState, useEffect, useRef, FC } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { Footprints, Satellite, Mountain, Timer, MapPin, Navigation } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { useToast } from './Toast';

interface MapScreenProps {
    currentUser: api.UserProfile | null;
}

// ─── Deterministic per-user territory colors ──────────────────────────────────
const TERRITORY_COLORS = [
    '#f43f5e', '#fb923c', '#facc15', '#a3e635', '#34d399',
    '#22d3ee', '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#e040fb',
    '#00bcd4', '#ff9f43', '#a29bfe', '#fd79a8', '#55efc4',
];

function colorForUser(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return TERRITORY_COLORS[hash % TERRITORY_COLORS.length];
}

// ─── Component ────────────────────────────────────────────────────────────────
const MapScreen: FC<MapScreenProps> = ({ currentUser }) => {
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
    const [isRunning, setIsRunning] = useState(false);
    const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentDistance, setCurrentDistance] = useState(0);

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const hasFlownIn = useRef(false);
    // Last known user position — used to restore the dot after style changes
    const lastPos = useRef<[number, number] | null>(null);
    const locationWatchId = useRef<number | null>(null);
    // Prevents mapStyle effect from calling setStyle on first render
    // (map is already created with the initial style — calling setStyle again
    //  triggers a double style-load that wipes all sources on mount)
    const isFirstStyleLoad = useRef(true);
    const { addToast } = useToast();

    // ── Fly to current location smoothly ──────────────────────────────────────
    const flyToCurrentLocation = () => {
        if (!map.current || !lastPos.current) return;
        map.current.flyTo({
            center: lastPos.current,
            zoom: 17,
            curve: 1.4,
            speed: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            essential: true,
        });
    };

    // ── Timer ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, startTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ── Update custom location dot (circle layer — GPU, never drifts) ──────────
    const updateLocationDot = (lng: number, lat: number) => {
        if (!map.current) return;
        lastPos.current = [lng, lat];
        const src = map.current.getSource('user-location') as mapboxgl.GeoJSONSource;
        if (src) {
            src.setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [lng, lat] },
            } as any);
        }
    };

    // ── Init Map ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle,
            // Start from orbit — dramatic flyTo fires on first GPS fix
            center: [78.9629, 20.5937],   // India center
            zoom: 1.5,
            // Mercator from the start — no projection switching that would
            // silently wipe sources and break the territory initial load.
            projection: { name: 'mercator' } as any,
            pitchWithRotate: false,
            dragRotate: false,
            touchPitch: false,
            fadeDuration: 400,
        });

        // ── style.load fires on initial load AND after every setStyle() call.
        //    Both times we need to re-add sources (they're wiped on style change)
        //    and re-fetch territory data.
        map.current.on('style.load', () => {
            addSourcesAndLayers();
            fetchAndDrawTerritories();
            // Restore location dot after style change
            if (lastPos.current) {
                updateLocationDot(lastPos.current[0], lastPos.current[1]);
            }
        });

        // ── No NavigationControl — we provide our own locate-me button instead

        // ── Start GPS tracking once map is ready.
        //    We use navigator.geolocation.watchPosition directly so the location
        //    dot is driven by our custom GPU circle layer (no DOM element →
        //    zero drift during pinch-zoom on mobile).
        map.current.once('load', () => {
            if (!navigator.geolocation) return;

            locationWatchId.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const { longitude, latitude } = pos.coords;

                    // Update the GPU-rendered location dot
                    updateLocationDot(longitude, latitude);

                    // Space-dive animation — fires exactly once on first GPS fix
                    if (!hasFlownIn.current) {
                        hasFlownIn.current = true;
                        map.current?.flyTo({
                            center: [longitude, latitude],
                            zoom: 17,
                            curve: 3.5,       // high curve = dramatic parabolic arc
                            speed: 0.55,      // slow for cinematic feel
                            easing: (t) => t < 0.5
                                ? 4 * t * t * t
                                : 1 - Math.pow(-2 * t + 2, 3) / 2,
                            essential: true,
                        });
                    }
                },
                (err) => {
                    console.error('Geolocation error', err);
                    addToast('Enable location access to see your position on the map.', 'warning');
                },
                { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
            );
        });

        // ── Poll for new territories every 10 s
        const pollInterval = setInterval(() => { fetchAndDrawTerritories(); }, 10000);

        return () => {
            clearInterval(pollInterval);
            if (locationWatchId.current !== null) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Style change ───────────────────────────────────────────────────────────
    // IMPORTANT: Skip the very first run.
    // The map is already constructed with `mapStyle` as its initial style.
    // Without this guard, React would call setStyle(same-style) right after
    // mount — triggering a second style.load that wipes all sources silently.
    useEffect(() => {
        if (isFirstStyleLoad.current) {
            isFirstStyleLoad.current = false;
            return; // skip — map was already built with this style
        }
        if (map.current) {
            map.current.setStyle(mapStyle);
            // style.load handler fires → re-adds sources + territories automatically
        }
    }, [mapStyle]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Running ref ────────────────────────────────────────────────────────────
    useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
    const isRunningRef = useRef(isRunning);

    // ── Geolocation watch while running (path tracking) ───────────────────────
    useEffect(() => {
        if (!map.current) return;
        let watchId: number;

        if (isRunning) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    const newCoord: [number, number] = [longitude, latitude];

                    // Also keep the dot updated
                    updateLocationDot(longitude, latitude);

                    setCurrentPath(prev => {
                        const updated = [...prev, newCoord];
                        const source = map.current?.getSource('current-path') as mapboxgl.GeoJSONSource;
                        if (source) {
                            source.setData({
                                type: 'Feature',
                                properties: {},
                                geometry: { type: 'LineString', coordinates: updated },
                            });
                        }
                        if (updated.length > 1) {
                            const line = turf.lineString(updated);
                            const dist = turf.length(line, { units: 'kilometers' });
                            setCurrentDistance(Math.round(dist * 100) / 100);
                        }
                        checkForTerritory(updated);
                        return updated;
                    });
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    addToast('Location access failed. Please enable GPS.', 'error');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Start / Stop ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (isRunning) {
            setStartTime(Date.now());
            setCurrentPath([]);
            setElapsedTime(0);
            setCurrentDistance(0);

            if (map.current) {
                const source = map.current.getSource('current-path') as mapboxgl.GeoJSONSource;
                if (source) source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
                // Fly to current location when starting a run
                flyToCurrentLocation();
            }
        } else {
            if (startTime && currentPath.length > 1) {
                const line = turf.lineString(currentPath);
                const distance = turf.length(line, { units: 'kilometers' });
                const duration = (Date.now() - startTime) / 1000;

                if (distance > 0.01) {
                    api.saveRun(distance, duration, currentPath).then(r => {
                        const res = r as { success: boolean; error?: string };
                        if (res.success) {
                            SoundManager.playSuccess();
                            addToast(`Run saved! ${distance.toFixed(2)} km in ${(duration / 60).toFixed(1)} min`, 'success');
                        } else {
                            addToast(res.error || 'Failed to save run', 'error');
                        }
                    });
                }
                setStartTime(null);
            }
        }
    }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Sources & Layers ──────────────────────────────────────────────────────
    const addSourcesAndLayers = () => {
        if (!map.current) return;

        // ── Current run path ──
        if (!map.current.getSource('current-path')) {
            map.current.addSource('current-path', {
                type: 'geojson',
                data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
            });
            map.current.addLayer({
                id: 'current-path-layer',
                type: 'line',
                source: 'current-path',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#22d3ee', 'line-width': 5, 'line-opacity': 0.9, 'line-blur': 1 },
            });
            map.current.addLayer({
                id: 'current-path-glow',
                type: 'line',
                source: 'current-path',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#22d3ee', 'line-width': 12, 'line-opacity': 0.2, 'line-blur': 4 },
            });
        }

        // ── Territories ──
        if (!map.current.getSource('territories')) {
            map.current.addSource('territories', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            // Filled polygon using per-feature color
            map.current.addLayer({
                id: 'territories-fill',
                type: 'fill',
                source: 'territories',
                paint: {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': [
                        'case',
                        ['==', ['get', 'user_id'], currentUser?.id ?? ''],
                        0.5,
                        0.3,
                    ],
                },
            });

            // Outline
            map.current.addLayer({
                id: 'territories-outline',
                type: 'line',
                source: 'territories',
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': [
                        'case',
                        ['==', ['get', 'user_id'], currentUser?.id ?? ''],
                        3, 1.5,
                    ],
                    'line-opacity': 0.9,
                },
            });

            // ── Territory labels — GPU symbol layer (never drifts) ──
            // Unlike DOM Markers, symbol layers live on the map canvas and are
            // perfectly anchored at any zoom on any device.
            map.current.addSource('territory-labels', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });
            map.current.addLayer({
                id: 'territory-labels',
                type: 'symbol',
                source: 'territory-labels',
                minzoom: 10,
                layout: {
                    'text-field': ['get', 'username'],
                    'text-size': [
                        'interpolate', ['linear'], ['zoom'],
                        10, 9, 14, 12, 17, 14,
                    ],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-anchor': 'center',
                    'text-max-width': 8,
                    'text-allow-overlap': false,
                },
                paint: {
                    'text-color': ['get', 'color'],
                    'text-halo-color': '#000',
                    'text-halo-width': 1.5,
                    'text-opacity': [
                        'interpolate', ['linear'], ['zoom'],
                        10, 0, 11, 1,
                    ],
                },
            });

            // Click popup
            map.current.on('click', 'territories-fill', (e) => {
                if (!e.features || e.features.length === 0) return;
                const props = e.features[0].properties as any;
                const color = props.color || '#a3e635';
                const isOwn = props.user_id === currentUser?.id;

                const date = props.created_at
                    ? new Date(props.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Unknown';

                const area = props.area_sq_meters
                    ? props.area_sq_meters >= 10000
                        ? `${(props.area_sq_meters / 10000).toFixed(2)} hectares`
                        : `${Math.round(props.area_sq_meters).toLocaleString()} m²`
                    : 'Unknown';

                const html = `
                    <div style="background:#0f172a;border:1.5px solid ${color};border-radius:14px;padding:14px 16px;min-width:180px;font-family:Inter,sans-serif;box-shadow:0 0 20px ${color}55;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                            <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;flex-shrink:0;">M</div>
                            <div>
                                <p style="margin:0;font-weight:700;font-size:15px;color:#fff;">
                                    ${props.username || 'Unknown'}
                                    ${isOwn ? ' <span style="font-size:11px;background:#22d3ee22;color:#22d3ee;border-radius:6px;padding:1px 6px;">You</span>' : ''}
                                </p>
                                <p style="margin:0;font-size:11px;color:#94a3b8;">Territory Owner</p>
                            </div>
                        </div>
                        <div style="border-top:1px solid #1e293b;padding-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                            <div>
                                <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Area</p>
                                <p style="margin:0;font-size:13px;font-weight:600;color:${color};">${area}</p>
                            </div>
                            <div>
                                <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Claimed</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:#e2e8f0;">${date}</p>
                            </div>
                        </div>
                    </div>`;

                if (popupRef.current) popupRef.current.remove();
                popupRef.current = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: false,
                    className: 'territory-popup',
                    maxWidth: '260px',
                    offset: 10,
                })
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(map.current!);
            });

            map.current.on('mouseenter', 'territories-fill', () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'territories-fill', () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            });
        }

        // ── Custom user-location dot (GPU circle — replaces GeolocateControl DOM dot)
        // Circle layers are rendered on the map canvas. They are NOT DOM elements,
        // so they NEVER drift during pinch-zoom on mobile.
        if (!map.current.getSource('user-location')) {
            map.current.addSource('user-location', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            // Outer accuracy/pulse ring
            map.current.addLayer({
                id: 'user-location-halo',
                type: 'circle',
                source: 'user-location',
                paint: {
                    'circle-radius': 20,
                    'circle-color': '#111827',
                    'circle-opacity': 0.15,
                    'circle-stroke-color': '#111827',
                    'circle-stroke-width': 1.5,
                    'circle-stroke-opacity': 0.5,
                },
            });

            // Solid inner dot
            map.current.addLayer({
                id: 'user-location-dot',
                type: 'circle',
                source: 'user-location',
                paint: {
                    'circle-radius': 7,
                    'circle-color': '#111827',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2.5,
                    'circle-opacity': 1,
                },
            });
        }
    };

    // ── Fetch & Draw Territories ──────────────────────────────────────────────
    const fetchAndDrawTerritories = async () => {
        const territories = await api.getTerritories();
        if (!territories || !map.current) return;

        const polygonFeatures: any[] = [];
        const labelFeatures: any[] = [];

        territories
            .filter((t: any) => t.coordinates && Array.isArray(t.coordinates[0]))
            .forEach((t: any) => {
                const color = colorForUser(t.user_id || t.username || 'default');

                const polygon = turf.polygon([t.coordinates[0]], {
                    id: t.id,
                    user_id: t.user_id,
                    username: t.username,
                    color,
                    area_sq_meters: t.area_sq_meters,
                    created_at: t.created_at,
                });
                polygonFeatures.push(polygon);

                try {
                    const center = turf.centerOfMass(polygon);
                    labelFeatures.push(turf.point(
                        center.geometry.coordinates,
                        { username: t.username || '?', color },
                    ));
                } catch (_) { }
            });

        const polySource = map.current.getSource('territories') as mapboxgl.GeoJSONSource;
        if (polySource) polySource.setData(turf.featureCollection(polygonFeatures) as any);

        const labelSource = map.current.getSource('territory-labels') as mapboxgl.GeoJSONSource;
        if (labelSource) labelSource.setData(turf.featureCollection(labelFeatures) as any);
    };

    // ── Territory Claim Check ─────────────────────────────────────────────────
    const checkForTerritory = async (path: [number, number][]) => {
        if (path.length < 10) return;

        const startPoint = turf.point(path[0]);
        const currentPoint = turf.point(path[path.length - 1]);
        const distanceToStart = turf.distance(startPoint, currentPoint, { units: 'meters' });
        const pathLength = turf.length(turf.lineString(path), { units: 'meters' });

        if (distanceToStart < 30 && pathLength > 100) {
            const closedPath = [...path, path[0]];
            const polygon = turf.polygon([closedPath]);
            const area = turf.area(polygon);
            const center = turf.center(polygon);

            const res = await api.createTerritory(
                [closedPath],
                center.geometry.coordinates as [number, number],
                area
            ) as { success: boolean; error?: string };

            if (res.success) {
                setIsRunning(false);
                SoundManager.playSuccess();
                addToast(`Territory Claimed! Area: ${Math.round(area)} sq meters`, 'success');
                fetchAndDrawTerritories();
            } else if (res.error === 'Not authenticated') {
                addToast('You must be logged in to claim territory!', 'warning');
            }
        }
    };

    // ─── JSX ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full flex-1 relative" style={{ minHeight: 0 }}>
            {/* Map container */}
            <div ref={mapContainer} className="absolute inset-0" style={{ touchAction: 'none' }} />

            {/* Popup styling */}
            <style>{`
                .territory-popup .mapboxgl-popup-content {
                    background: transparent !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 14px !important;
                }
                .territory-popup .mapboxgl-popup-tip { display: none; }
                .territory-popup .mapboxgl-popup-close-button {
                    color: #94a3b8; font-size: 18px;
                    right: 6px; top: 4px;
                    background: transparent; border: none; cursor: pointer; line-height: 1;
                }
            `}</style>

            {/* Live Stats Overlay (while running) */}
            {isRunning && (
                <div className="absolute top-4 left-4 right-4 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 flex items-center justify-around shadow-2xl animate-slideDown z-10">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <Timer className="w-3 h-3" /><span>Time</span>
                        </div>
                        <p className="text-xl font-bold text-white font-mono">{formatTime(elapsedTime)}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <Footprints className="w-3 h-3" /><span>Distance</span>
                        </div>
                        <p className="text-xl font-bold text-cyan-400 font-mono">{currentDistance} km</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <MapPin className="w-3 h-3" /><span>Points</span>
                        </div>
                        <p className="text-xl font-bold text-lime-400 font-mono">{currentPath.length}</p>
                    </div>
                </div>
            )}

            {/* Locate-Me button — pinned bottom-right, above the nav bar on mobile */}
            <button
                onClick={flyToCurrentLocation}
                title="Go to my location"
                className="absolute right-4 bottom-[160px] sm:bottom-[130px] z-10
                    w-11 h-11 rounded-full
                    bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
                    border border-gray-200 dark:border-gray-700
                    shadow-lg shadow-black/20
                    flex items-center justify-center
                    transition-all active:scale-90 hover:scale-105
                    hover:shadow-cyan-500/30 hover:border-cyan-400
                    group"
            >
                <Navigation
                    className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400
                               transition-colors fill-cyan-500/20"
                />
            </button>

            {/* Bottom controls */}
            <div className="absolute bottom-[80px] sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full px-4 z-10">

                {/* Map Style Switcher */}
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1.5 rounded-full border border-gray-200 dark:border-gray-700 flex gap-1 shadow-xl">
                    <button
                        onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${mapStyle.includes('satellite')
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Satellite className="w-3 h-3" /> Satellite
                    </button>
                    <button
                        onClick={() => setMapStyle('mapbox://styles/mapbox/outdoors-v12')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${mapStyle.includes('outdoors')
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Mountain className="w-3 h-3" /> Terrain
                    </button>
                    <button
                        onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v11')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${mapStyle.includes('dark')
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Dark
                    </button>
                </div>

                {/* Start / Stop Run */}
                <button
                    onClick={() => {
                        if (!currentUser) {
                            addToast('Please log in first!', 'warning');
                            return;
                        }
                        if (!isRunning) SoundManager.playStart();
                        else SoundManager.playClick();
                        setIsRunning(!isRunning);
                    }}
                    className={`px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ${isRunning
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-white text-gray-900 shadow-sm border border-gray-100 hover:bg-gray-50'
                        }`}
                >
                    {isRunning ? (
                        <><div className="w-4 h-4 bg-white rounded-sm" />Stop Run</>
                    ) : (
                        <><Footprints className="w-6 h-6" />Start Run</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MapScreen;
