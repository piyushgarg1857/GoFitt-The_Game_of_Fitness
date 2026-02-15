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
    // Dynamic achievements based on real stats
    const achievements: Achievement[] = userStats ? [
        { id: 1, name: 'First Steps', description: 'Complete your first run.', unlocked: userStats.totalDistance > 0, icon: <Footprints className="w-8 h-8" /> },
        { id: 2, name: 'Territory Novice', description: 'Claim your first territory.', unlocked: userStats.territories > 0, icon: <Shield className="w-8 h-8" /> },
        { id: 3, name: '10K Runner', description: 'Run 10km total.', unlocked: userStats.totalDistance >= 10, icon: <Zap className="w-8 h-8" /> },
        { id: 4, name: 'Urban Explorer', description: 'Claim 10 territories.', unlocked: userStats.territories >= 10, icon: <MapIcon className="w-8 h-8" /> },
        { id: 5, name: 'Marathoner', description: 'Run a total of 42.2km.', unlocked: userStats.totalDistance >= 42.2, icon: <Target className="w-8 h-8" /> },
        { id: 6, name: 'Streak Master', description: '7-day active streak.', unlocked: userStats.activeStreak >= 7, icon: <Flame className="w-8 h-8" /> },
        { id: 7, name: 'Century Club', description: 'Run a total of 100km.', unlocked: userStats.totalDistance >= 100, icon: <Award className="w-8 h-8" /> },
    ] : [];

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;

    // Compute summary stats
    const totalDistance = runHistory.reduce((sum, r) => sum + r.distance, 0);
    const totalDuration = runHistory.reduce((sum, r) => sum + r.duration, 0);
    const avgPace = runHistory.length > 0 && totalDistance > 0 ? totalDuration / totalDistance : 0;

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-cyan-400" /> Statistics
                </h1>
                {userStats && (
                    <span className="text-sm font-bold text-gray-500">Level {userStats.level}</span>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 text-center">
                    <Footprints className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{totalDistance.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Total km</p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 text-center">
                    <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{totalDuration}</p>
                    <p className="text-xs text-gray-500">Total min</p>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 dark:border-gray-700/50 text-center">
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{runHistory.length}</p>
                    <p className="text-xs text-gray-500">Runs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Run History */}
                <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-md dark:shadow-none">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Footprints className="w-5 h-5 text-lime-400" /> Run History
                    </h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                        {runHistory.length > 0 ? runHistory.map(run => (
                            <div key={run.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group">
                                <div>
                                    <p className="text-gray-900 dark:text-white font-medium group-hover:text-cyan-500 transition-colors">{run.distance} km</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{run.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-cyan-600 dark:text-cyan-400 font-medium">{run.duration} min</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{run.pace} /km</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <Footprints className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No runs recorded yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Start running to see your history here!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-md dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" /> Achievements
                        </h2>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                            {unlockedCount}/{totalAchievements}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {achievements.map(achievement => (
                            <div key={achievement.id} className={`p-3 rounded-xl border transition-all duration-300 ${achievement.unlocked
                                    ? 'bg-gradient-to-br from-cyan-500/10 to-lime-500/10 dark:from-cyan-500/20 dark:to-lime-500/20 border-cyan-500/30 dark:border-cyan-500/50 hover:scale-[1.02]'
                                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 grayscale'
                                }`}>
                                <div className={`${achievement.unlocked ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-600'} mb-2`}>
                                    {achievement.icon}
                                </div>
                                <h3 className={`font-semibold text-sm ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                    {achievement.name}
                                </h3>
                                <p className={`text-xs mt-1 ${achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-600'}`}>
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
