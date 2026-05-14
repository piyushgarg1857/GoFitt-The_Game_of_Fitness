import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import type { NextPage } from 'next';
import Image from 'next/image';
import SEO from '../components/SEO';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<api.UserProfile | null>(null);
  const { addToast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const user = await api.fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setShowAuth(false);
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
    checkAuth();
  }, [checkAuth]);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    checkAuth();
  };

  // SWR hooks for data fetching
  const { data: userStats, mutate: mutateUserStats } = useSWR(
    isLoggedIn ? 'userStats' : null,
    api.getUserStats,
    { refreshInterval: 15000, fallbackData: null }
  );

  const { data: leaderboardData = [] } = useSWR(
    isLoggedIn ? 'leaderboard' : null,
    api.getLeaderboard,
    { refreshInterval: 15000 }
  );

  const { data: runHistory = [] } = useSWR(
    isLoggedIn ? 'runs' : null,
    api.getRuns,
    { refreshInterval: 15000 }
  );

  const { data: activities = [] } = useSWR(
    isLoggedIn ? 'activities' : null,
    api.getActivities,
    { refreshInterval: 5000 }
  );

  const handleRefreshProfile = useCallback(() => {
    mutateUserStats();
  }, [mutateUserStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/logo.png" alt="GoFit" width={80} height={80} className="mx-auto mb-6 rounded-2xl animate-pulse object-cover" />
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
      <SEO 
        title="GoFit Dashboard" 
        description="View your fitness statistics, track progress, and manage your GoFit profile."
      />

      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center justify-center transition-colors">
        <AuthModal
          isOpen={showAuth && !isLoggedIn}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />

        <div className="w-full h-[100dvh] bg-white flex flex-col overflow-hidden relative">
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-2 lg:ml-4">
              <Image src="/logo.png" alt="GoFit" width={32} height={32} className="rounded-full border border-gray-100 object-cover" />
              <h1 className="text-xl font-bold tracking-tight text-gray-900 font-outfit">GoFit</h1>
            </div>
            <div className="flex items-center gap-3">
              {userStats && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Level {userStats.level}</p>
                  <p className="text-xs text-gray-500">Rank #{userStats.rank}</p>
                </div>
              )}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 transition-all cursor-pointer relative">
                {currentUser?.avatar_url ? (
                  <Image src={currentUser.avatar_url} alt="Profile" fill className="object-cover" />
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
                onRefresh={handleRefreshProfile}
              />
            </div>
          </main>

          <nav className="flex-shrink-0 flex justify-center gap-2 p-2 pt-3 border-t border-gray-100 bg-white/90 backdrop-blur-lg fixed bottom-0 w-full sm:static z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-4 w-full max-w-md gap-2">
            <NavItem label="Home" icon={<BarChart2 className="w-6 h-6" />} isActive={activeTab === 'dashboard'} onClick={() => { SoundManager.playClick(); setActiveTab('dashboard'); }} />
            <NavItem label="Map" icon={<MapIcon className="w-6 h-6" />} isActive={activeTab === 'map'} onClick={() => { SoundManager.playClick(); setActiveTab('map'); }} />
            <NavItem label="Stats" icon={<Trophy className="w-6 h-6" />} isActive={activeTab === 'stats'} onClick={() => { SoundManager.playClick(); setActiveTab('stats'); }} />
            <NavItem label="Profile" icon={<User className="w-6 h-6" />} isActive={activeTab === 'profile'} onClick={() => { SoundManager.playClick(); setActiveTab('profile'); }} />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Home;