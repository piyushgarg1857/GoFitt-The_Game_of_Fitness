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
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-300 relative group ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
      {icon}
    </div>
    <span className="text-xs font-medium mt-1">{label}</span>
    {isActive && (
      <div className="absolute -bottom-0 w-8 h-0.5 bg-gray-900 dark:bg-white rounded-full shadow-sm" />
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

  const fetchData = useCallback(async () => {
    try {
      const user = await api.fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setShowAuth(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="GoFit" className="w-20 h-20 mx-auto mb-6 rounded-2xl animate-pulse object-cover" />
          <div className="flex items-center gap-3 text-gray-500 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading Workspace</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>GoFit Dashboard</title>
        <meta name="description" content="Professional Fitness Tracking" />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-900 font-['Inter'] flex flex-col items-center justify-center sm:p-4 transition-colors">
        <AuthModal
          isOpen={showAuth && !isLoggedIn}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />

        <div className="w-full sm:max-w-2xl h-[100dvh] sm:h-[90vh] sm:max-h-[850px] bg-white sm:border border-gray-200 sm:rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="GoFit" className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
              <h1 className="text-xl font-bold tracking-tight text-gray-900 font-['Outfit']">GoFit</h1>
            </div>
            <div className="flex items-center gap-3">
              {userStats && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Level {userStats.level}</p>
                  <p className="text-xs text-gray-500">Rank #{userStats.rank}</p>
                </div>
              )}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 transition-all cursor-pointer">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
            </div>
          </header>

          <main className={`flex-grow min-h-0 bg-gray-50 relative flex flex-col ${activeTab === 'map' ? '' : 'overflow-y-auto pb-20 sm:pb-0 scrollbar-hide'}`}>
            <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }} className="flex-1">
              <DashboardScreen
                userStats={userStats}
                leaderboardData={leaderboardData}
                activities={activities}
                currentUser={currentUser}
              />
            </div>

            <div style={{ display: activeTab === 'map' ? 'flex' : 'none' }} className="flex-1 flex flex-col min-h-0">
              <MapScreen currentUser={currentUser} />
            </div>

            <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }}>
              <StatsScreen runHistory={runHistory} userStats={userStats} />
            </div>

            <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
              <ProfileScreen
                userStats={userStats}
                runHistory={runHistory}
                currentUser={currentUser}
                onRefresh={fetchData}
              />
            </div>
          </main>

          <nav className="flex-shrink-0 grid grid-cols-4 gap-2 p-2 pt-3 border-t border-gray-100 bg-white/90 backdrop-blur-lg fixed bottom-0 w-full sm:static sm:w-auto z-20 pb-safe">
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