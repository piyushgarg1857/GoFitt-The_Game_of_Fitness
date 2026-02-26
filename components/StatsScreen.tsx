import { FC, ReactNode } from 'react';
import { Run, UserStats } from '../lib/api';
import { Footprints, Shield, Zap, Map as MapIcon, Target, Award, Flame, TrendingUp, Clock } from 'lucide-react';

interface Achievement {
    id: number;
    name: string;
    description: string;
    unlocked: boolean;
    icon: ReactNode;
}

const StatsScreen: FC<{ runHistory: Run[]; userStats: UserStats | null }> = ({ runHistory, userStats }) => {
    const achievements: Achievement[] = userStats ? [
        { id: 1, name: 'First Steps', description: 'Complete your first run.', unlocked: userStats.totalDistance > 0, icon: <Footprints className="w-6 h-6" /> },
        { id: 2, name: 'Territory Novice', description: 'Claim your first territory.', unlocked: userStats.territories > 0, icon: <Shield className="w-6 h-6" /> },
        { id: 3, name: '10K Runner', description: 'Run 10km total.', unlocked: userStats.totalDistance >= 10, icon: <Zap className="w-6 h-6" /> },
        { id: 4, name: 'Urban Explorer', description: 'Claim 10 territories.', unlocked: userStats.territories >= 10, icon: <MapIcon className="w-6 h-6" /> },
        { id: 5, name: 'Marathoner', description: 'Run a total of 42.2km.', unlocked: userStats.totalDistance >= 42.2, icon: <Target className="w-6 h-6" /> },
        { id: 6, name: 'Streak Master', description: '7-day active streak.', unlocked: userStats.activeStreak >= 7, icon: <Flame className="w-6 h-6" /> },
        { id: 7, name: 'Century Club', description: 'Run a total of 100km.', unlocked: userStats.totalDistance >= 100, icon: <Award className="w-6 h-6" /> },
    ] : [];

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;

    const totalDistance = runHistory.reduce((sum, r) => sum + r.distance, 0);
    const totalDuration = runHistory.reduce((sum, r) => sum + r.duration, 0);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-32">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Analytics
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Review your performance history.</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-700 mb-3 border border-gray-100">
                        <Footprints className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Total Distance</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-700 mb-3 border border-gray-100">
                        <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalDuration}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Active Time</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-700 mb-3 border border-gray-100">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{runHistory.length}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Total Logs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col max-h-[500px]">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        Activity Logs
                    </h2>
                    <div className="space-y-2 overflow-y-auto scrollbar-hide flex-1 pr-2">
                        {runHistory.length > 0 ? runHistory.map(run => (
                            <div key={run.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                        <Footprints className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-semibold text-sm">{run.distance} km Recorded</p>
                                        <p className="text-gray-500 text-xs">{run.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-900 font-semibold text-sm">{run.duration} min</p>
                                    <p className="text-gray-500 text-xs">{run.pace} /km</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 border border-dashed rounded-xl border-gray-200 flex flex-col items-center">
                                <Footprints className="w-8 h-8 text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm font-medium">No activity records found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            Milestones
                        </h2>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            {unlockedCount} / {totalAchievements} Unlocked
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {achievements.map(achievement => (
                            <div key={achievement.id} className={`p-4 rounded-2xl border transition-all duration-300 ${achievement.unlocked
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-transparent border-dashed border-gray-200 opacity-50'
                                }`}>
                                <div className={`${achievement.unlocked ? 'text-gray-800' : 'text-gray-400'} mb-3`}>
                                    {achievement.icon}
                                </div>
                                <h3 className={`font-semibold text-sm ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {achievement.name}
                                </h3>
                                <p className={`text-xs mt-1 ${achievement.unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {achievement.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsScreen;
