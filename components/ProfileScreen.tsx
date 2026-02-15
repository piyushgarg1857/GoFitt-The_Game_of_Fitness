import { FC, useState, useEffect, ReactNode } from 'react';
import { Settings, LogOut, Edit2, Star, Heart, Mountain, Zap, Flame, Map as MapIcon, History, Award, Users, Footprints, Shield, Target } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { SettingsModal } from './SettingsModal';
import { UserSearchModal } from './UserSearchModal';
import { useToast } from './Toast';

const AttributeCard: FC<{ label: string; value: number; icon: ReactNode; color: string; sub: string }> = ({ label, value, icon, color, sub }) => (
    <div className="bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${color.replace('bg-', 'text-').replace('500', '400')}`}>
                {icon}
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(value)}</span>
        </div>
        <h4 className="text-gray-600 dark:text-gray-400 font-medium text-sm">{label}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-600 mb-3">{sub}</p>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 group-hover:brightness-125`} style={{ width: `${Math.min(100, value)}%` }} />
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
            addToast('Avatar updated! 🎨', 'success');
            onRefresh();
        } else {
            addToast('Failed to update avatar', 'error');
        }
        setIsEditingAvatar(false);
    };

    const handleAcceptRequest = async (reqId: string) => {
        const res = await api.acceptFriendRequest(reqId);
        if (res.success) {
            SoundManager.playSuccess();
            setPendingRequests(prev => prev.filter(r => r.id !== reqId));
            addToast('Ally added! 🤝', 'success');
        } else {
            addToast('Failed to accept request', 'error');
        }
    };

    // Calculate RPG Stats
    const endurance = Math.min(100, (userStats?.totalDistance || 0) * 2);
    const speed = runHistory.length > 0 ? Math.min(100, 1000 / (runHistory.reduce((acc, r) => acc + (r.duration / r.distance), 0) / runHistory.length)) : 0;
    const willpower = Math.min(100, (userStats?.activeStreak || 0) * 10);
    const explorer = Math.min(100, (userStats?.territories || 0) * 5);

    if (!userStats) return (
        <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
                <Users className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-8 pb-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl">
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/10 dark:from-cyan-500/20 to-transparent" />

                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar & Level Ring */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-30 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-80 transition-opacity" />
                        <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-lime-400 cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800">
                                <img src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent'} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-1.5 border border-gray-200 dark:border-gray-700 shadow-lg">
                                <Edit2 className="w-4 h-4 text-gray-900 dark:text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-cyan-500/30 dark:border-cyan-500/50 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Lvl {userStats.level}</span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentUser?.username || 'Hunter'}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                Rank #{userStats.rank}
                            </span>
                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                                {userStats.level > 10 ? 'Elite Runner' : 'Rookie Runner'}
                            </span>
                        </div>

                        {/* HP & XP Progress */}
                        <div className="max-w-md w-full space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500 fill-red-500" /> Health (HP)</span>
                                    <span className="font-bold text-red-500">{userStats.hp} / {userStats.maxHp}</span>
                                </div>
                                <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-500" style={{ width: `${(userStats.hp / userStats.maxHp) * 100}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span>XP Progress</span>
                                    <span>{userStats.xp} / {userStats.xpToNextLevel}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${(userStats.xp / userStats.xpToNextLevel) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors shadow-sm dark:shadow-none">
                            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={handleLogout} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-colors flex items-center gap-2">
                            <LogOut className="w-6 h-6 text-red-600 dark:text-red-500" />
                            <span className="text-sm font-bold text-red-600 dark:text-red-500 hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Avatar Selector Drawer */}
                {isEditingAvatar && (
                    <div className="bg-gray-50 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4">
                        <p className="text-xs text-gray-500 text-center mb-3 font-medium">Choose your avatar</p>
                        <div className="flex justify-center gap-3 overflow-x-auto pb-2">
                            {avatars.map((url, i) => (
                                <button key={i} onClick={() => {
                                    SoundManager.playClick();
                                    handleAvatarSelect(url);
                                }} className={`relative shrink-0 w-14 h-14 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${avatarUrl === url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-transparent hover:border-cyan-400/50'}`}>
                                    <img src={url} className="w-full h-full" alt={`Avatar ${i}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RPG Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AttributeCard label="Endurance" value={endurance} icon={<Mountain className="w-5 h-5 text-emerald-400" />} color="bg-emerald-500" sub="Total Distance" />
                <AttributeCard label="Speed" value={speed} icon={<Zap className="w-5 h-5 text-yellow-400" />} color="bg-yellow-500" sub="Avg Pace" />
                <AttributeCard label="Willpower" value={willpower} icon={<Flame className="w-5 h-5 text-orange-400" />} color="bg-orange-500" sub="Streak" />
                <AttributeCard label="Exploration" value={explorer} icon={<MapIcon className="w-5 h-5 text-purple-400" />} color="bg-purple-500" sub="Territories" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Runs */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-cyan-500 dark:text-cyan-400" /> Mission History
                    </h3>
                    <div className="space-y-3">
                        {runHistory.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
                                <Footprints className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                                No missions completed yet. Start running!
                            </div>
                        ) : (
                            runHistory.slice(0, 5).map(run => (
                                <div key={run.id} className="group flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:border-cyan-500/30 transition-all shadow-sm dark:shadow-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-cyan-500/10 dark:group-hover:bg-cyan-500/20 transition-colors">
                                            <Footprints className="w-6 h-6 text-gray-400 group-hover:text-cyan-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{run.distance} km Run</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{run.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{run.duration}m</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                {run.pace} /km
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Badges / Collection */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> Collection
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center border transition-all duration-300 ${achievement.unlocked
                                    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-cyan-500/20 dark:border-cyan-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:scale-105'
                                    : 'bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-50 grayscale'
                                }`}>
                                <div className={`mb-2 ${achievement.unlocked ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {achievement.icon === 'footprints' && <Footprints className="w-8 h-8" />}
                                    {achievement.icon === 'shield' && <Shield className="w-8 h-8" />}
                                    {achievement.icon === 'trophy' && <Award className="w-8 h-8" />}
                                    {achievement.icon === 'flame' && <Flame className="w-8 h-8" />}
                                    {achievement.icon === 'map' && <MapIcon className="w-8 h-8" />}
                                    {achievement.icon === 'zap' && <Zap className="w-8 h-8" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* My Allies Section */}
            <div className="bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> My Allies
                    </h3>
                    <button onClick={() => setIsSearchOpen(true)} className="text-xs font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider transition-colors">Find Hunters</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Pending Requests */}
                    {pendingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src={req.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender?.username}`} alt="Sender" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{req.sender?.username}</h4>
                                    <p className="text-xs text-orange-500 font-bold">Wants to ally</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Accept
                            </button>
                        </div>
                    ))}

                    {pendingRequests.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                            No pending requests. Use "Find Hunters" to connect with players!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
