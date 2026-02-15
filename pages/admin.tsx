import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
    Users, Activity, Map as MapIcon, Footprints, Trophy, TrendingUp,
    Search, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2,
    Shield, BarChart2, Flame, Zap, LogOut, Home, RefreshCw, X, Check,
} from 'lucide-react';

// Token helper (reuse from api.ts pattern)
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gofitt_token');
}

async function adminFetch(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

interface DashStats {
    totalUsers: number;
    totalRuns: number;
    totalTerritories: number;
    totalActivities: number;
    totalDistance: number;
    totalPoints: number;
    avgStreak: number;
}

interface UserItem {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    total_points: number;
    total_distance: number;
    active_streak: number;
    created_at: string;
}

interface ActivityItem {
    id: string;
    username: string;
    type: string;
    text: string;
    created_at: string;
}

type Tab = 'overview' | 'users' | 'activities';

const Admin: NextPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Overview
    const [stats, setStats] = useState<DashStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<UserItem[]>([]);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

    // Users
    const [users, setUsers] = useState<UserItem[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [usersLoading, setUsersLoading] = useState(false);

    // Activities
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [actPage, setActPage] = useState(1);
    const [actTotalPages, setActTotalPages] = useState(1);
    const [actLoading, setActLoading] = useState(false);

    // Editing user
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState({ username: '', total_points: 0, total_distance: 0, active_streak: 0 });

    // Delete confirmation
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Fetch overview
    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminFetch('/api/admin/stats');
            if (data.success) {
                setStats(data.stats);
                setRecentUsers(data.recentUsers);
                setRecentActivities(data.recentActivities);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (page = 1, search = '') => {
        setUsersLoading(true);
        try {
            const data = await adminFetch(`/api/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
            if (data.success) {
                setUsers(data.users);
                setUserPage(data.pagination.page);
                setUserTotalPages(data.pagination.totalPages);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setUsersLoading(false);
    }, []);

    // Fetch activities
    const fetchActivities = useCallback(async (page = 1) => {
        setActLoading(true);
        try {
            const data = await adminFetch(`/api/admin/activities?page=${page}&limit=20`);
            if (data.success) {
                setActivities(data.activities);
                setActPage(data.pagination.page);
                setActTotalPages(data.pagination.totalPages);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setActLoading(false);
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers(1, userSearch);
        if (activeTab === 'activities') fetchActivities(1);
    }, [activeTab]);

    // Delete user
    const handleDeleteUser = async (userId: string) => {
        try {
            await adminFetch('/api/admin/users', {
                method: 'DELETE',
                body: JSON.stringify({ userId }),
            });
            setDeletingUserId(null);
            fetchUsers(userPage, userSearch);
            fetchOverview();
        } catch (e: any) {
            alert('Delete failed: ' + e.message);
        }
    };

    // Update user
    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            await adminFetch('/api/admin/users', {
                method: 'PUT',
                body: JSON.stringify({
                    userId: editingUser.id,
                    updates: editForm,
                }),
            });
            setEditingUser(null);
            fetchUsers(userPage, userSearch);
        } catch (e: any) {
            alert('Update failed: ' + e.message);
        }
    };

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'users') fetchUsers(1, userSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [userSearch]);

    // Error / Access denied screen
    if (error === 'Admin access required') {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center p-8">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">You don't have admin privileges.</p>
                    <Link href="/dashboard" className="px-6 py-3 bg-cyan-500 text-gray-900 font-bold rounded-xl hover:bg-cyan-400 transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>GoFit Admin Panel</title>
                <meta name="description" content="GoFit Admin Dashboard - Manage users, monitor activity, and track platform growth." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gray-950 text-white font-['Inter']">
                {/* Top Bar */}
                <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight font-['Outfit']">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">GoFit</span>
                                    <span className="text-gray-500 ml-1.5 font-normal text-sm">Admin</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchOverview} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors" title="Refresh">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                                <Home className="w-4 h-4" /> Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-gray-900 rounded-xl mb-8 w-fit">
                        {[
                            { key: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
                            { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
                            { key: 'activities', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as Tab)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ============ OVERVIEW TAB ============ */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {[
                                    { label: 'Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30', iconColor: 'text-cyan-400' },
                                    { label: 'Runs', value: stats.totalRuns, icon: <Footprints className="w-5 h-5" />, color: 'from-lime-500/20 to-emerald-500/20 border-lime-500/30', iconColor: 'text-lime-400' },
                                    { label: 'Territories', value: stats.totalTerritories, icon: <MapIcon className="w-5 h-5" />, color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30', iconColor: 'text-purple-400' },
                                    { label: 'Activities', value: stats.totalActivities, icon: <Activity className="w-5 h-5" />, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30', iconColor: 'text-amber-400' },
                                    { label: 'Distance (km)', value: stats.totalDistance, icon: <TrendingUp className="w-5 h-5" />, color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30', iconColor: 'text-rose-400' },
                                    { label: 'Total XP', value: stats.totalPoints, icon: <Zap className="w-5 h-5" />, color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30', iconColor: 'text-yellow-400' },
                                    { label: 'Avg Streak', value: `${stats.avgStreak}d`, icon: <Flame className="w-5 h-5" />, color: 'from-orange-500/20 to-red-500/20 border-orange-500/30', iconColor: 'text-orange-400' },
                                ].map((card, i) => (
                                    <div key={i} className={`bg-gradient-to-br ${card.color} backdrop-blur-sm p-4 rounded-2xl border flex flex-col gap-3 hover:scale-[1.03] transition-transform`}>
                                        <div className={`${card.iconColor}`}>{card.icon}</div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{card.value}</p>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Recent Users */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-cyan-400" /> Recent Users
                                    </h3>
                                    <div className="space-y-3">
                                        {recentUsers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="w-9 h-9 rounded-full bg-gray-700" />
                                                    <div>
                                                        <p className="font-semibold text-sm">{user.username}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-cyan-400">{user.total_points} XP</p>
                                                    <p className="text-xs text-gray-500">{user.total_distance} km</p>
                                                </div>
                                            </div>
                                        ))}
                                        {recentUsers.length === 0 && (
                                            <p className="text-center text-gray-600 py-6 text-sm">No users yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activities */}
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-amber-400" /> Recent Activity
                                    </h3>
                                    <div className="space-y-2">
                                        {recentActivities.map(act => (
                                            <div key={act.id} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'run_completed' ? 'bg-lime-400' :
                                                        act.type === 'territory_claimed' ? 'bg-purple-400' : 'bg-cyan-400'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-300 truncate">{act.text}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{new Date(act.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {recentActivities.length === 0 && (
                                            <p className="text-center text-gray-600 py-6 text-sm">No activity yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ USERS TAB ============ */}
                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Search */}
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                            </div>

                            {/* Users Table */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                                <th className="text-left p-4">User</th>
                                                <th className="text-left p-4 hidden sm:table-cell">Email</th>
                                                <th className="text-right p-4">Points</th>
                                                <th className="text-right p-4 hidden sm:table-cell">Distance</th>
                                                <th className="text-right p-4 hidden md:table-cell">Streak</th>
                                                <th className="text-right p-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12">
                                                        <Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto" />
                                                    </td>
                                                </tr>
                                            ) : users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-gray-600">No users found</td>
                                                </tr>
                                            ) : users.map(user => (
                                                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="w-8 h-8 rounded-full bg-gray-700" />
                                                            <span className="font-semibold">{user.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 hidden sm:table-cell">{user.email}</td>
                                                    <td className="p-4 text-right font-bold text-cyan-400">{user.total_points}</td>
                                                    <td className="p-4 text-right text-gray-400 hidden sm:table-cell">{user.total_distance} km</td>
                                                    <td className="p-4 text-right hidden md:table-cell">
                                                        <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-md">
                                                            {user.active_streak}d
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(user);
                                                                    setEditForm({
                                                                        username: user.username,
                                                                        total_points: user.total_points,
                                                                        total_distance: user.total_distance,
                                                                        active_streak: user.active_streak,
                                                                    });
                                                                }}
                                                                className="p-2 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            {deletingUserId === user.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors" title="Confirm">
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => setDeletingUserId(null)} className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors" title="Cancel">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setDeletingUserId(user.id)} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors" title="Delete">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {userTotalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                                        <p className="text-sm text-gray-500">Page {userPage} of {userTotalPages}</p>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={userPage <= 1}
                                                onClick={() => fetchUsers(userPage - 1, userSearch)}
                                                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                disabled={userPage >= userTotalPages}
                                                onClick={() => fetchUsers(userPage + 1, userSearch)}
                                                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ ACTIVITIES TAB ============ */}
                    {activeTab === 'activities' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-800">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-amber-400" /> All Activity Logs
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-800/50">
                                    {actLoading ? (
                                        <div className="text-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto" />
                                        </div>
                                    ) : activities.length === 0 ? (
                                        <div className="text-center py-12 text-gray-600 text-sm">No activity logs</div>
                                    ) : activities.map(act => (
                                        <div key={act.id} className="flex items-center gap-4 p-4 hover:bg-gray-800/20 transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.type === 'run_completed' ? 'bg-lime-500/10 text-lime-400' :
                                                    act.type === 'territory_claimed' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'
                                                }`}>
                                                {act.type === 'run_completed' ? <Footprints className="w-5 h-5" /> :
                                                    act.type === 'territory_claimed' ? <MapIcon className="w-5 h-5" /> :
                                                        <Activity className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-200">{act.text}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500">@{act.username}</span>
                                                    <span className="text-xs text-gray-600">{new Date(act.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${act.type === 'run_completed' ? 'bg-lime-500/10 text-lime-500' :
                                                    act.type === 'territory_claimed' ? 'bg-purple-500/10 text-purple-500' : 'bg-cyan-500/10 text-cyan-500'
                                                }`}>
                                                {act.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {actTotalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                                        <p className="text-sm text-gray-500">Page {actPage} of {actTotalPages}</p>
                                        <div className="flex gap-2">
                                            <button disabled={actPage <= 1} onClick={() => fetchActivities(actPage - 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button disabled={actPage >= actTotalPages} onClick={() => fetchActivities(actPage + 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ============ EDIT USER MODAL ============ */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 animate-slideUp shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-blue-400" /> Edit User
                                </h3>
                                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6 p-3 bg-gray-800/50 rounded-xl">
                                <img src={editingUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingUser.username}`} alt="" className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold">{editingUser.username}</p>
                                    <p className="text-xs text-gray-500">{editingUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Points</label>
                                        <input
                                            type="number"
                                            value={editForm.total_points}
                                            onChange={e => setEditForm({ ...editForm, total_points: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Dist (km)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editForm.total_distance}
                                            onChange={e => setEditForm({ ...editForm, total_distance: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Streak</label>
                                        <input
                                            type="number"
                                            value={editForm.active_streak}
                                            onChange={e => setEditForm({ ...editForm, active_streak: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleUpdateUser} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Admin;
