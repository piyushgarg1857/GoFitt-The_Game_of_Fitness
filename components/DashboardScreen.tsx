import { FC, ReactNode } from 'react';
import { Shield, Footprints, Flame, Zap, Target, Trophy, Activity as ActivityIcon, TrendingUp } from 'lucide-react';
import { UserStats, LeaderboardEntry, Activity, UserProfile } from '../lib/api';

const StatCard: FC<{ title: string; value: string | number; icon: ReactNode }> = ({ title, value, icon }) => (
    <div className={`relative overflow-hidden bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-100 flex flex-col gap-3 hover:border-gray-200 transition-all duration-300 shadow-sm cursor-default`}>
        <div className="flex items-center justify-between text-gray-500">
            <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-700 ring-1 ring-black/5">
                {icon}
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
);

const XpBar: FC<{ currentXp: number; requiredXp: number; level: number }> = ({ currentXp, requiredXp, level }) => {
    const percentage = (currentXp / requiredXp) * 100;
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200">Level {level}</span>
                    <span className="text-sm font-medium text-gray-500">Milestone Progress</span>
                </div>
                <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{currentXp} / {requiredXp} XP</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                <div
                    className="bg-gray-800 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const CircularProgress: FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-800 transition-all duration-1000 ease-out"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{Math.round(progress * 100)}%</span>
                </div>
            </div>
            <span className="text-xs text-gray-600 font-medium text-center">{label}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">{Math.round(value)}/{max}</span>
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
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Aggregating Statistics</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 pb-32">
            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Detailed metrics for {currentUser?.username || 'Hunter'}.</p>
                </div>
            </div>

            {/* XP Container */}
            <div className="bg-white backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <XpBar currentXp={userStats.xp} requiredXp={userStats.xpToNextLevel} level={userStats.level} />
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Distance" value={`${userStats.totalDistance} km`} icon={<Footprints className="w-5 h-5" />} />
                <StatCard title="Calories Burned" value={`${userStats.caloriesBurned} kcal`} icon={<Zap className="w-5 h-5" />} />
                <StatCard title="Active Streak" value={`${userStats.activeStreak} Days`} icon={<Flame className="w-5 h-5" />} />
                <StatCard title="Territories" value={userStats.territories} icon={<Shield className="w-5 h-5" />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Weekly Targets */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-gray-400" /> Weekly Objectives
                        </h2>
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <CircularProgress value={userStats.totalDistance % 50} max={50} label="Distance" />
                        <CircularProgress value={Math.min(userStats.activeStreak, 7)} max={7} label="Activity" />
                        <CircularProgress value={userStats.territories % 20} max={20} label="Map Control" />
                    </div>
                </div>

                <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    {/* Leaderboard */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-gray-400" /> Top Rankings
                        </h2>
                        <div className="space-y-3 flex-1">
                            {leaderboardData.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 border border-dashed rounded-xl border-gray-200">No rankings available</div>
                            ) : leaderboardData.slice(0, 5).map((player) => (
                                <div key={player.rank} className={`flex items-center justify-between py-2 px-3 rounded-xl border ${player.name === currentUser?.username
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-transparent border-transparent hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-600 rounded">
                                            {player.rank}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{player.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-gray-700">Lvl {player.level}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Network Feed */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <ActivityIcon className="w-5 h-5 text-gray-400" /> Network Activity
                        </h2>
                        <div className="space-y-4 flex-1">
                            {activities.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 border border-dashed rounded-xl border-gray-200">No recent network activity.</div>
                            ) : activities.slice(0, 5).map(activity => (
                                <div key={activity.id} className="flex gap-3 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-800 leading-snug">{activity.text.replace(/🏃/g, '').replace(/🔥/g, '').replace(/🏴/g, '').trim()}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{new Date(activity.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
