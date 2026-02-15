import React, { FC, useState, useEffect } from 'react';
import { Settings, X, Bell, Volume2, Moon, Ruler, ChevronRight } from 'lucide-react';
import { SoundManager } from '../lib/sound';

export const SettingsModal: FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);
    const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
    const [darkMode, setDarkMode] = useState(true);

    // Load settings on mount
    useEffect(() => {
        const storedNotifs = localStorage.getItem('gofit_notifications');
        const storedSound = localStorage.getItem('gofit_sound');
        const storedUnits = localStorage.getItem('gofit_units');
        const storedDarkMode = localStorage.getItem('gofit_darkmode');

        if (storedNotifs !== null) setNotifications(storedNotifs === 'true');
        if (storedSound !== null) setSound(storedSound === 'true');
        if (storedUnits) setUnits(storedUnits as 'metric' | 'imperial');

        // Dark mode logic
        if (storedDarkMode !== null) {
            setDarkMode(storedDarkMode === 'true');
            if (storedDarkMode === 'true') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            // Default to dark
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Persist settings
    const toggleNotifications = () => {
        SoundManager.playToggle();
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('gofit_notifications', String(newVal));
        if (newVal) {
            // Request permission if enabling
            if ('Notification' in window && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        }
    };

    const toggleSound = () => {
        // Play sound BEFORE toggling off, or AFTER toggling on
        // Logic: If currently true, we are turning OFF. Play one last sound.
        // If currently false, we are turning ON. We can't play until state updates... 
        // Actually SoundManager checks localStorage.

        // We update localstorage immediately so subsequent calls work.
        const newVal = !sound;
        setSound(newVal);
        localStorage.setItem('gofit_sound', String(newVal));

        // If we just turned it on, play a success sound to confirm
        if (newVal) setTimeout(() => SoundManager.playSuccess(), 50);
    };

    const toggleDarkMode = () => {
        SoundManager.playToggle();
        const newVal = !darkMode;
        setDarkMode(newVal);
        localStorage.setItem('gofit_darkmode', String(newVal));
        if (newVal) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const toggleUnits = () => {
        SoundManager.playClick();
        const newVal = units === 'metric' ? 'imperial' : 'metric';
        setUnits(newVal);
        localStorage.setItem('gofit_units', newVal);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 text-left">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">General</h3>

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={toggleNotifications}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400"><Bell className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                                    <p className="text-xs text-gray-500">Get updates and challenges</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full relative transition-colors ${notifications ? 'bg-cyan-500/20 ring-1 ring-cyan-500/50' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${notifications ? 'right-1 bg-cyan-500 dark:bg-cyan-400' : 'left-1 bg-white dark:bg-gray-500'}`}></div>
                            </div>
                        </div>

                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={toggleSound}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400"><Volume2 className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Sound Effects</p>
                                    <p className="text-xs text-gray-500">In-game audio cues</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full relative transition-colors ${sound ? 'bg-purple-500/20 ring-1 ring-purple-500/50' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${sound ? 'right-1 bg-purple-500 dark:bg-purple-400' : 'left-1 bg-white dark:bg-gray-500'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preferences</h3>

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={toggleDarkMode}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400"><Moon className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                    <p className="text-xs text-gray-500">Ease your eyes</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-cyan-500/20 ring-1 ring-cyan-500/50' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${darkMode ? 'right-1 bg-cyan-500 dark:bg-cyan-400' : 'left-1 bg-white dark:bg-gray-500'}`}></div>
                            </div>
                        </div>

                        {/* Units Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group" onClick={toggleUnits}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg text-green-600 dark:text-green-400"><Ruler className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Units</p>
                                    <p className="text-xs text-gray-500">{units === 'metric' ? 'Metric (km, kg)' : 'Imperial (mi, lbs)'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <span>{units.toUpperCase()}</span>
                                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-600">GoFit v1.0.2 Beta</p>
                </div>
            </div>
        </div>
    );
};
