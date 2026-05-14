import { FC, useState, useEffect, ReactNode } from 'react';
import { Settings, LogOut, Edit2, Star, Heart, Mountain, Zap, Flame, Map as MapIcon, History, Award, Users, Footprints, Shield, ChevronRight } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { SettingsModal } from './SettingsModal';
import { UserSearchModal } from './UserSearchModal';
import { useToast } from './Toast';
import Image from 'next/image';

const AttributeCard: FC<{ label: string; value: number; icon: ReactNode; color: string; sub: string }> = ({ label, value, icon, color, sub }) => (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md border border-gray-100 dark:border-gray-700/50 p-5 rounded-2xl relative group hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 ring-1 ring-black/5 dark:ring-white/10`}>
                {icon}
            </div>
            <span className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{Math.round(value)}</span>
        </div>
        <h4 className="text-gray-900 dark:text-gray-100 font-medium">{label}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{sub}</p>
        <div className="w-full h-1 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, value)}%` }} />
        </div>
    </div>
);

interface ProfileScreenProps {
    userStats: api.UserStats | null;
    runHistory: api.Run[];
    currentUser: api.UserProfile | null;
    onRefresh: () => void;
}

const ProfileScreen: FC<ProfileScreenProps> = ({ userStats, runHistory, currentUser, onRefresh }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const { addToast } = useToast();

    useEffect(() => {
        if (currentUser) {
            setAvatarUrl(currentUser.avatar_url || '');
        }
    }, [currentUser]);

    useEffect(() => {
        const loadData = async () => {
            if (userStats) {
                const [reqs, achs] = await Promise.all([
                    api.getFriendRequests(),
                    Promise.resolve(api.checkAchievements(userStats)),
                ]);
                setPendingRequests(reqs);
                setAchievements(achs);
            }
        };
        loadData();
    }, [userStats]);

    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sky',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Storm',
    ];

    const handleLogout = () => {
        SoundManager.playClick();
        api.logout();
    };

    const handleAvatarSelect = async (url: string) => {
        setAvatarUrl(url);
        const res = await api.updateProfile({ avatar_url: url });
        if (res.success) {
            addToast('Profile updated', 'success');
            onRefresh();
        } else {
            addToast('Failed to update profile', 'error');
        }
        setIsEditingAvatar(false);
    };

    const handleAcceptRequest = async (reqId: string) => {
        const res = await api.acceptFriendRequest(reqId);
        if (res.success) {
            SoundManager.playSuccess();
            setPendingRequests(prev => prev.filter(r => r.id !== reqId));
            addToast('Request accepted', 'success');
        } else {
            addToast('Failed to accept request', 'error');
        }
    };

    // Calculate Stats
    const endurance = Math.min(100, (userStats?.totalDistance || 0) * 2);
    const speed = runHistory.length > 0 ? Math.min(100, 1000 / (runHistory.reduce((acc, r) => acc + (r.duration / r.distance), 0) / runHistory.length)) : 0;
    const willpower = Math.min(100, (userStats?.activeStreak || 0) * 10);
    const explorer = Math.min(100, (userStats?.territories || 0) * 5);

    if (!userStats) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]">
            <div className="w-12 h-12 rounded-full border-2 border-gray-200 border-t-cyan-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading profile data</p>
        </div>
    );

    return (
        <div className="relative max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            {/* Header / Hero */}
            <header className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex gap-3 h-full items-start">
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={handleLogout} className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
                    <div className="w-28 h-28 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 group-hover:shadow-md transition-all p-1 relative">
                        <Image fill src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent'} alt="Profile" className="object-cover rounded-full" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow border border-gray-100 dark:border-gray-700 text-gray-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {currentUser?.username || 'Hunter'}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-semibold tracking-wide border border-cyan-100 dark:border-cyan-500/20">
                                Rank #{userStats.rank}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
                                <Star className="w-3.5 h-3.5 text-gray-400" />
                                Lvl {userStats.level}
                            </span>
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto md:mx-0">
                        {userStats.level > 10 ? 'Advanced athlete member' : 'Member in training'}
                    </p>

                    <div className="space-y-4 max-w-sm mx-auto md:mx-0">
                        <div>
                            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                <span>Health Status</span>
                                <span className="text-gray-900 dark:text-gray-200">{userStats.hp} / {userStats.maxHp} HP</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(userStats.hp / userStats.maxHp) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                <span>Experience</span>
                                <span className="text-gray-900 dark:text-gray-200">{userStats.xp} / {userStats.xpToNextLevel} XP</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(userStats.xp / userStats.xpToNextLevel) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Avatar Selector Inline Drawer */}
            {isEditingAvatar && (
                <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Choose Avatar</h3>
                        <button onClick={() => setIsEditingAvatar(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Cancel</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x">
                        {avatars.map((url, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    SoundManager.playClick();
                                    handleAvatarSelect(url);
                                }}
                                className={`shrink-0 snap-center w-16 h-16 rounded-full border-2 overflow-hidden transition-all duration-200 hover:scale-105 ${avatarUrl === url ? 'border-cyan-500 shadow-md shadow-cyan-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 ring-1 ring-black/5 dark:ring-white/10'}`}
                            >
                                <div className="relative w-full h-full">
                                    <Image fill src={url} className="bg-gray-50 dark:bg-gray-900 object-cover" alt={`Avatar option ${i}`} sizes="64px" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <AttributeCard label="Endurance" value={endurance} icon={<Mountain className="w-5 h-5" />} color="bg-cyan-500" sub="Aggregate Distance" />
                <AttributeCard label="Speed" value={speed} icon={<Zap className="w-5 h-5" />} color="bg-indigo-500" sub="Average Pace" />
                <AttributeCard label="Consistency" value={willpower} icon={<Flame className="w-5 h-5" />} color="bg-orange-500" sub="Active Streak" />
                <AttributeCard label="Exploration" value={explorer} icon={<MapIcon className="w-5 h-5" />} color="bg-purple-500" sub="Territories Mapped" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity History</h3>
                        <button className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1 group">
                            View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
                        {runHistory.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                <Footprints className="w-10 h-10 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="font-medium">No activity recorded yet.</p>
                                <p className="text-sm mt-1">Your logged runs will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {runHistory.slice(0, 5).map(run => (
                                    <div key={run.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                                                <History className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{run.distance} km Run</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">{run.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900 dark:text-white">{run.duration}m</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{run.pace} /km</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Achievements Collection */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Milestones</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm">
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {achievements.map((achievement) => (
                                <div key={achievement.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${achievement.unlocked
                                    ? 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-sm'
                                    : 'bg-transparent border border-dashed border-gray-200 dark:border-gray-800 opacity-40'
                                    }`}>
                                    <div className={`${achievement.unlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                                        {achievement.icon === 'footprints' && <Footprints className="w-6 h-6 md:w-7 md:h-7" />}
                                        {achievement.icon === 'shield' && <Shield className="w-6 h-6 md:w-7 md:h-7" />}
                                        {achievement.icon === 'trophy' && <Award className="w-6 h-6 md:w-7 md:h-7" />}
                                        {achievement.icon === 'flame' && <Flame className="w-6 h-6 md:w-7 md:h-7" />}
                                        {achievement.icon === 'map' && <MapIcon className="w-6 h-6 md:w-7 md:h-7" />}
                                        {achievement.icon === 'zap' && <Zap className="w-6 h-6 md:w-7 md:h-7" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Allies Request Section */}
            <div className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 p-6 md:p-8 rounded-3xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network & Allies</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect with other athletes</p>
                    </div>
                    <button onClick={() => setIsSearchOpen(true)} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl text-sm transition-all hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Expand Network
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 dark:border-gray-700/50 dark:hover:border-gray-600 transition-colors bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <img
                                    src={req.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender?.username}`}
                                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    alt="Sender"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{req.sender?.username}</h4>
                                    <p className="text-xs text-gray-500">Connection pending</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
                            >
                                Accept
                            </button>
                        </div>
                    ))}

                    {pendingRequests.length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                            <div className="text-gray-500 dark:text-gray-400 text-sm">No new connection requests.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
