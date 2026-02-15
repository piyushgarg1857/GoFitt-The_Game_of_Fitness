import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { BarChart2, User, Trophy, Map as MapIcon, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { useToast } from '../components/Toast';
import AuthModal from '../components/AuthModal';

// Components
import DashboardScreen from '../components/DashboardScreen';
import MapScreen from '../components/MapScreen';
import StatsScreen from '../components/StatsScreen';
import ProfileScreen from '../components/ProfileScreen';

type Tab = 'dashboard' | 'map' | 'stats' | 'profile';

const NavItem: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-300 relative group ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
      {icon}
    </div>
    <span className="text-xs font-medium mt-1">{label}</span>
    {isActive && (
      <div className="absolute -bottom-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
    )}
  </button>
);

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [userStats, setUserStats] = useState<api.UserStats | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<api.LeaderboardEntry[]>([]);
  const [runHistory, setRunHistory] = useState<api.Run[]>([]);
  const [activities, setActivities] = useState<api.Activity[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<api.UserProfile | null>(null);
  const { addToast } = useToast();

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const user = await api.fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setShowAuth(false);

        // Fetch all data in parallel
        const [stats, lb, runs, acts] = await Promise.all([
          api.getUserStats(),
          api.getLeaderboard(),
          api.getRuns(),
          api.getActivities(),
        ]);

        setUserStats(stats);
        setLeaderboardData(lb);
        setRunHistory(runs);
        setActivities(acts);
      } else {
        setShowAuth(true);
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime polling every 5 seconds for activities, 15 for full data
    const activityInterval = setInterval(async () => {
      if (api.isLoggedIn()) {
        const acts = await api.getActivities();
        setActivities(acts);
      }
    }, 5000);

    const dataInterval = setInterval(() => {
      if (api.isLoggedIn()) {
        fetchData();
      }
    }, 15000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(dataInterval);
    };
  }, [fetchData]);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    fetchData();
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
            <span className="text-3xl font-black text-gray-900">G</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Initializing GoFit...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GoFit Dashboard - The Game of Fitness</title>
        <meta name="description" content="Track your fitness journey with GoFit - the ultimate fitness RPG" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-['Inter'] flex flex-col items-center justify-center sm:p-4 transition-colors">
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuth && !isLoggedIn}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />

        <div className="w-full sm:max-w-2xl h-[100dvh] sm:h-[90vh] sm:max-h-[850px] bg-white sm:bg-white/50 dark:bg-gray-950/80 backdrop-blur-xl sm:border border-gray-200 dark:border-gray-800 sm:rounded-3xl shadow-2xl dark:shadow-cyan-500/5 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
            <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-cyan-500 dark:from-lime-400 dark:to-cyan-400 font-['Outfit']">GoFit</h1>
            <div className="flex items-center gap-3">
              {userStats && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Level {userStats.level}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rank #{userStats.rank}</p>
                </div>
              )}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 ring-2 ring-transparent hover:ring-cyan-500/50 transition-all cursor-pointer">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-lime-500" />
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className={`flex-grow min-h-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 relative flex flex-col ${activeTab === 'map' ? '' : 'overflow-y-auto pb-20 sm:pb-0 scrollbar-hide'
            }`}>
            {/* Dashboard */}
            <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }} className="flex-1">
              <DashboardScreen
                userStats={userStats}
                leaderboardData={leaderboardData}
                activities={activities}
                currentUser={currentUser}
              />
            </div>

            {/* Map - needs full height, no overflow scroll */}
            <div style={{ display: activeTab === 'map' ? 'flex' : 'none' }} className="flex-1 flex flex-col min-h-0">
              <MapScreen currentUser={currentUser} />
            </div>

            {/* Stats */}
            <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
              <StatsScreen runHistory={runHistory} userStats={userStats} />
            </div>

            {/* Profile */}
            <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
              <ProfileScreen
                userStats={userStats}
                runHistory={runHistory}
                currentUser={currentUser}
                onRefresh={fetchData}
              />
            </div>
          </main>

          {/* Navigation */}
          <nav className="flex-shrink-0 grid grid-cols-4 gap-2 p-2 pt-3 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg fixed bottom-0 w-full sm:static sm:w-auto z-20 pb-safe">
            <NavItem label="Home" icon={<BarChart2 className="w-6 h-6" />} isActive={activeTab === 'dashboard'} onClick={() => { SoundManager.playClick(); setActiveTab('dashboard'); }} />
            <NavItem label="Map" icon={<MapIcon className="w-6 h-6" />} isActive={activeTab === 'map'} onClick={() => { SoundManager.playClick(); setActiveTab('map'); }} />
            <NavItem label="Stats" icon={<Trophy className="w-6 h-6" />} isActive={activeTab === 'stats'} onClick={() => { SoundManager.playClick(); setActiveTab('stats'); }} />
            <NavItem label="Profile" icon={<User className="w-6 h-6" />} isActive={activeTab === 'profile'} onClick={() => { SoundManager.playClick(); setActiveTab('profile'); }} />
          </nav>
        </div>
      </div>
    </>
  );
};

export default Home;