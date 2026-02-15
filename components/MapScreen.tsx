import { useState, useEffect, useRef, FC } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { Footprints, Satellite, Mountain, Timer, MapPin } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { useToast } from './Toast';

interface MapScreenProps {
    currentUser: api.UserProfile | null;
}

const MapScreen: FC<MapScreenProps> = ({ currentUser }) => {
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
    const [isRunning, setIsRunning] = useState(false);
    const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentDistance, setCurrentDistance] = useState(0);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const isRunningRef = useRef(isRunning);
    const { addToast } = useToast();

    // Timer for elapsed time display
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, startTime]);

    // Format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Initialize Map
    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: [77.2090, 28.6139],
            zoom: 4,
            projection: { name: 'mercator' } as any,
        });

        map.current.on('style.load', () => {
            addSourcesAndLayers();
            fetchAndDrawTerritories();
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
            showAccuracyCircle: true,
        });
        map.current.addControl(geolocate, 'bottom-right');

        geolocate.on('geolocate', (e) => {
            const { longitude, latitude } = (e as any).coords;
            map.current?.flyTo({
                center: [longitude, latitude],
                zoom: 16,
                speed: 1.2,
                curve: 1.5,
                easing: (t) => t,
                essential: true,
            });
        });

        setTimeout(() => {
            geolocate.trigger();
        }, 1000);

        // Poll for new territories every 10 seconds
        const pollInterval = setInterval(() => {
            fetchAndDrawTerritories();
        }, 10000);

        return () => {
            clearInterval(pollInterval);
        };
    }, []);

    // Handle Map Style Changes
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(mapStyle);
            map.current.once('style.load', () => {
                addSourcesAndLayers();
                fetchAndDrawTerritories();
            });
        }
    }, [mapStyle]);

    // Update Ref
    useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

    // Geolocation Handling with watchPosition
    useEffect(() => {
        if (!map.current) return;

        let watchId: number;

        if (isRunning) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    const newCoord: [number, number] = [longitude, latitude];

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

                        // Calculate live distance
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
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isRunning]);

    // Start/Stop Logic
    useEffect(() => {
        if (isRunning) {
            setStartTime(Date.now());
            setCurrentPath([]);
            setElapsedTime(0);
            setCurrentDistance(0);

            if (map.current) {
                const source = map.current.getSource('current-path') as mapboxgl.GeoJSONSource;
                if (source) source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });

                const geolocateControl = (map.current as any)?._controls?.find((c: any) => c instanceof mapboxgl.GeolocateControl) as mapboxgl.GeolocateControl;
                if (geolocateControl) geolocateControl.trigger();
            }
        } else {
            if (startTime && currentPath.length > 1) {
                const line = turf.lineString(currentPath);
                const distance = turf.length(line, { units: 'kilometers' });
                const duration = (Date.now() - startTime) / 1000;

                if (distance > 0.01) {
                    api.saveRun(distance, duration, currentPath).then(res => {
                        if (res.success) {
                            SoundManager.playSuccess();
                            addToast(`Run saved! ${distance.toFixed(2)} km in ${(duration / 60).toFixed(1)} min 🏃`, 'success');
                        } else {
                            addToast(res.error || 'Failed to save run', 'error');
                        }
                    });
                }
                setStartTime(null);
            }
        }
    }, [isRunning]);

    const addSourcesAndLayers = () => {
        if (!map.current) return;
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
                paint: {
                    'line-color': '#22d3ee',
                    'line-width': 5,
                    'line-opacity': 0.9,
                    'line-blur': 1,
                },
            });
            // Glow effect layer
            map.current.addLayer({
                id: 'current-path-glow',
                type: 'line',
                source: 'current-path',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#22d3ee',
                    'line-width': 12,
                    'line-opacity': 0.2,
                    'line-blur': 4,
                },
            });
        }
        if (!map.current.getSource('territories')) {
            map.current.addSource('territories', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });
            map.current.addLayer({
                id: 'territories-fill',
                type: 'fill',
                source: 'territories',
                paint: {
                    'fill-color': '#a3e635',
                    'fill-opacity': 0.35,
                },
            });
            map.current.addLayer({
                id: 'territories-outline',
                type: 'line',
                source: 'territories',
                paint: {
                    'line-color': '#a3e635',
                    'line-width': 2,
                    'line-opacity': 0.8,
                },
            });
        }
    };

    const fetchAndDrawTerritories = async () => {
        const territories = await api.getTerritories();
        if (territories && map.current) {
            const features = territories
                .filter((t: any) => t.coordinates && Array.isArray(t.coordinates[0]))
                .map((t: any) => turf.polygon([t.coordinates[0]], { id: t.id, username: t.username }));
            const source = map.current.getSource('territories') as mapboxgl.GeoJSONSource;
            if (source) {
                source.setData(turf.featureCollection(features) as any);
            }
        }
    };

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

            const res = await api.createTerritory([closedPath], center.geometry.coordinates as [number, number], area);

            if (res.success) {
                setIsRunning(false);
                SoundManager.playSuccess();
                addToast(`Territory Claimed! Area: ${Math.round(area)} sq meters 🏴`, 'success');
            } else {
                if (res.error === 'Not authenticated') {
                    addToast('You must be logged in to claim territory!', 'warning');
                }
            }
        }
    };

    return (
        <div className="w-full flex-1 relative" style={{ minHeight: 0 }}>
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Live Stats Overlay (when running) */}
            {isRunning && (
                <div className="absolute top-4 left-4 right-4 bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-4 flex items-center justify-around shadow-2xl animate-slideDown">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <Timer className="w-3 h-3" />
                            <span>Time</span>
                        </div>
                        <p className="text-xl font-bold text-white font-mono">{formatTime(elapsedTime)}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <Footprints className="w-3 h-3" />
                            <span>Distance</span>
                        </div>
                        <p className="text-xl font-bold text-cyan-400 font-mono">{currentDistance} km</p>
                    </div>
                    <div className="w-px h-10 bg-gray-700" />
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>Points</span>
                        </div>
                        <p className="text-xl font-bold text-lime-400 font-mono">{currentPath.length}</p>
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full px-4">
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
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-red-500/30 animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 to-lime-500 text-gray-900 shadow-cyan-500/30 hover:shadow-cyan-500/50'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <div className="w-4 h-4 bg-white rounded-sm" />
                            Stop Run
                        </>
                    ) : (
                        <>
                            <Footprints className="w-6 h-6" />
                            Start Run
                        </>
                    )}
                </button>

                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-200 dark:border-gray-700 flex gap-1 shadow-lg">
                    <button onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${mapStyle.includes('satellite') ? 'bg-cyan-500 text-gray-900 shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><Satellite className="w-3 h-3" /> Satellite</button>
                    <button onClick={() => setMapStyle('mapbox://styles/mapbox/outdoors-v12')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${mapStyle.includes('outdoors') ? 'bg-lime-500 text-gray-900 shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}><Mountain className="w-3 h-3" /> Terrain</button>
                    <button onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v11')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${mapStyle.includes('dark') ? 'bg-purple-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Dark</button>
                </div>
            </div>
        </div>
    );
};

export default MapScreen;
