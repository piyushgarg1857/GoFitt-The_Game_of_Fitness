import { FC, ReactNode } from 'react';
import { Shield, Footprints, Flame, Zap, Target, Trophy, Activity as ActivityIcon, TrendingUp } from 'lucide-react';
import { UserStats, LeaderboardEntry, Activity, UserProfile } from '../lib/api';

const StatCard: FC<{ title: string; value: string | number; icon: ReactNode; gradient: string }> = ({ title, value, icon, gradient }) => (
    <div className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col gap-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm dark:shadow-none group cursor-default`}>
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${gradient}`} />
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
            {icon}
        </div>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white relative z-10">{value}</p>
    </div>
);

const XpBar: FC<{ currentXp: number; requiredXp: number; level: number }> = ({ currentXp, requiredXp, level }) => {
    const percentage = (currentXp / requiredXp) * 100;
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-lime-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">LVL {level}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{currentXp} / {requiredXp} XP</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden relative">
                <div
                    className="bg-gradient-to-r from-lime-500 to-cyan-500 dark:from-lime-400 dark:to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/60 rounded-full" />
                </div>
            </div>
        </div>
    );
};

const CircularProgress: FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        fill="transparent"
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(progress * 100)}%</span>
                </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">{label}</span>
            <span className="text-xs text-gray-500">{Math.round(value)}/{max}</span>
        </div>
    );
};

interface DashboardScreenProps {
    userStats: UserStats | null;
    leaderboardData: LeaderboardEntry[];
    activities: Activity[];
    currentUser: UserProfile | null;
}

const DashboardScreen: FC<DashboardScreenProps> = ({ userStats, leaderboardData, activities, currentUser }) => {

    if (!userStats) return (
        <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-lime-500/20 flex items-center justify-center animate-pulse">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your stats...</p>
        </div>
    );

    return (
        <div className="space-y-6 p-4 md:p-6 pb-24">
            {/* Welcome Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-lime-400">{currentUser?.username || 'Hunter'}</span>!
                    </h1>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold">Level {userStats.level}</span>
                        <span className="text-gray-600 dark:text-gray-400">{userStats.level > 10 ? 'Elite Hunter' : 'Trailblazer'}</span>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Rank</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-cyan-500 dark:from-lime-400 dark:to-cyan-400">#{userStats.rank}</p>
                </div>
            </div>

            {/* XP Bar */}
            <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-xl p-5 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/5 to-lime-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:from-cyan-500/10 group-hover:to-lime-500/10 transition-colors pointer-events-none" />
                <XpBar currentXp={userStats.xp} requiredXp={userStats.xpToNextLevel} level={userStats.level} />
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Territories" value={userStats.territories} icon={<Shield className="w-5 h-5 text-purple-400" />} gradient="bg-purple-500" />
                <StatCard title="Total Dist" value={`${userStats.totalDistance} km`} icon={<Footprints className="w-5 h-5 text-lime-400" />} gradient="bg-lime-500" />
                <StatCard title="Streak" value={`${userStats.activeStreak} Days`} icon={<Flame className="w-5 h-5 text-orange-500" />} gradient="bg-orange-500" />
                <StatCard title="Calories" value={`${userStats.caloriesBurned} kcal`} icon={<Zap className="w-5 h-5 text-yellow-400" />} gradient="bg-yellow-500" />
            </div>

            {/* Weekly Goal Progress */}
            <div className="bg-white/60 dark:bg-gray-800/20 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" /> Weekly Goals
                </h2>
                <div className="flex justify-around items-center">
                    <CircularProgress value={userStats.totalDistance % 50} max={50} label="Distance (km)" color="text-cyan-500 dark:text-cyan-400" />
                    <CircularProgress value={Math.min(userStats.activeStreak, 7)} max={7} label="Active Days" color="text-lime-500 dark:text-lime-400" />
                    <CircularProgress value={userStats.territories % 20} max={20} label="Territories" color="text-purple-500 dark:text-purple-400" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Leaderboard */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> Top Players</h2>
                    <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3 shadow-md dark:shadow-none">
                        {leaderboardData.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No players yet. Be the first!</p>
                        ) : leaderboardData.slice(0, 5).map((player) => (
                            <div key={player.rank} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${player.name === currentUser?.username
                                    ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-transparent'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg text-sm ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-yellow-900 shadow-lg shadow-yellow-500/30' :
                                            player.rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800' :
                                                player.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {player.rank}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{player.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Lvl {player.level} • {player.territories} Zones</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Live Feed
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </h2>
                    <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3 shadow-md dark:shadow-none">
                        {activities.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No activities yet. Start running to be the first! 🏃</p>
                        ) : activities.slice(0, 5).map(activity => (
                            <div key={activity.id} className="flex gap-3 items-start group">
                                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mt-2 shrink-0 animate-pulse group-hover:scale-125 transition-transform" />
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activity.text}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(activity.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
