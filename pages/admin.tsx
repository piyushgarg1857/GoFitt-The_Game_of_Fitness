import { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import SEO from '../components/SEO';
import Link from 'next/link';
import {
    Users, Activity, Map as MapIcon, Footprints, Trophy, TrendingUp,
    Search, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2,
    Shield, BarChart2, Flame, Zap, LogOut, Home, RefreshCw, X, Check,
    Video, MessageSquare, Ban, Eye, Star, Send, Film, Upload,
    CheckCircle, Clock, AlertCircle, XCircle, User, LayoutDashboard,
} from 'lucide-react';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gofitt_token');
}
async function adminFetch(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

interface DashStats { totalUsers: number; totalRuns: number; totalTerritories: number; totalActivities: number; totalDistance: number; totalPoints: number; avgStreak: number; }
interface UserItem { id: string; username: string; email: string; avatar_url: string; total_points: number; total_distance: number; active_streak: number; activity_banned: boolean; created_at: string; }
interface ActivityItem { id: string; username: string; type: string; text: string; created_at: string; }
interface FeedbackItem { id: string; user_id: string; username: string; email: string; type: string; message: string; rating: number; status: string; admin_reply: string; created_at: string; }
interface UserProfile { id: string; username: string; email: string; avatar_url: string; total_points: number; total_distance: number; active_streak: number; activity_banned: boolean; created_at: string; last_active: string; }

type Tab = 'overview' | 'users' | 'activities' | 'feedback' | 'trailer';

const Admin: NextPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

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
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editForm, setEditForm] = useState({ username: '', total_points: 0, total_distance: 0, active_streak: 0 });
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [viewingProfile, setViewingProfile] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Activities
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [actPage, setActPage] = useState(1);
    const [actTotalPages, setActTotalPages] = useState(1);
    const [actLoading, setActLoading] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [fbPage, setFbPage] = useState(1);
    const [fbTotalPages, setFbTotalPages] = useState(1);
    const [fbLoading, setFbLoading] = useState(false);
    const [replyingFb, setReplyingFb] = useState<FeedbackItem | null>(null);
    const [replyText, setReplyText] = useState('');

    // Trailer
    const [trailer, setTrailer] = useState<any | null>(null);
    const [trailerForm, setTrailerForm] = useState({ url: '', title: '', description: '' });
    const [trailerSaving, setTrailerSaving] = useState(false);

    const fetchOverview = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const data = await adminFetch('/api/admin/stats');
            if (data.success) { setStats(data.stats); setRecentUsers(data.recentUsers); setRecentActivities(data.recentActivities); }
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }, []);

    const fetchUsers = useCallback(async (page = 1, search = '') => {
        setUsersLoading(true);
        try {
            const data = await adminFetch(`/api/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
            if (data.success) { setUsers(data.users); setUserPage(data.pagination.page); setUserTotalPages(data.pagination.totalPages); }
        } catch (e: any) { setError(e.message); }
        setUsersLoading(false);
    }, []);

    const fetchActivities = useCallback(async (page = 1) => {
        setActLoading(true);
        try {
            const data = await adminFetch(`/api/admin/activities?page=${page}&limit=20`);
            if (data.success) { setActivities(data.activities); setActPage(data.pagination.page); setActTotalPages(data.pagination.totalPages); }
        } catch (e: any) { setError(e.message); }
        setActLoading(false);
    }, []);

    const fetchFeedback = useCallback(async (page = 1) => {
        setFbLoading(true);
        try {
            const data = await adminFetch(`/api/admin/feedback?page=${page}&limit=20`);
            if (data.success) { setFeedback(data.feedback); setFbPage(data.pagination.page); setFbTotalPages(data.pagination.totalPages); }
        } catch (e: any) { setError(e.message); }
        setFbLoading(false);
    }, []);

    const fetchTrailer = useCallback(async () => {
        try {
            const data = await adminFetch('/api/admin/trailer');
            if (data.success && data.trailer) { setTrailer(data.trailer); setTrailerForm({ url: data.trailer.url, title: data.trailer.title, description: data.trailer.description }); }
        } catch (_) { }
    }, []);

    useEffect(() => { fetchOverview(); }, [fetchOverview]);
    useEffect(() => {
        if (activeTab === 'users') fetchUsers(1, userSearch);
        if (activeTab === 'activities') fetchActivities(1);
        if (activeTab === 'feedback') fetchFeedback(1);
        if (activeTab === 'trailer') fetchTrailer();
    }, [activeTab]);
    useEffect(() => { const t = setTimeout(() => { if (activeTab === 'users') fetchUsers(1, userSearch); }, 400); return () => clearTimeout(t); }, [userSearch]);

    const handleDeleteUser = async (userId: string) => {
        try { await adminFetch('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ userId }) }); setDeletingUserId(null); fetchUsers(userPage, userSearch); fetchOverview(); showToast('User deleted'); } catch (e: any) { alert('Delete failed: ' + e.message); }
    };
    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try { await adminFetch('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId: editingUser.id, updates: editForm }) }); setEditingUser(null); fetchUsers(userPage, userSearch); showToast('User updated'); } catch (e: any) { alert('Update failed: ' + e.message); }
    };
    const handleBanToggle = async (user: UserItem) => {
        const action = user.activity_banned ? 'unban' : 'ban';
        try { await adminFetch('/api/admin/ban', { method: 'POST', body: JSON.stringify({ userId: user.id, action }) }); fetchUsers(userPage, userSearch); showToast(action === 'ban' ? 'User banned from activity feed' : 'User unbanned'); } catch (e: any) { alert('Ban failed: ' + e.message); }
    };
    const handleViewProfile = async (userId: string) => {
        setProfileLoading(true); setViewingProfile({});
        try { const data = await adminFetch(`/api/admin/user-profile?userId=${userId}`); if (data.success) setViewingProfile(data); } catch (e: any) { alert('Profile load failed: ' + e.message); setViewingProfile(null); }
        setProfileLoading(false);
    };
    const handleFbStatusChange = async (fbId: string, status: string) => {
        try { await adminFetch('/api/admin/feedback', { method: 'PATCH', body: JSON.stringify({ feedbackId: fbId, status }) }); fetchFeedback(fbPage); showToast('Status updated'); } catch (e: any) { alert(e.message); }
    };
    const handleFbReply = async () => {
        if (!replyingFb) return;
        try { await adminFetch('/api/admin/feedback', { method: 'PATCH', body: JSON.stringify({ feedbackId: replyingFb.id, status: 'replied', admin_reply: replyText }) }); setReplyingFb(null); setReplyText(''); fetchFeedback(fbPage); showToast('Reply saved'); } catch (e: any) { alert(e.message); }
    };
    const handleFbDelete = async (fbId: string) => {
        if (!confirm('Delete this feedback?')) return;
        try { await adminFetch('/api/admin/feedback', { method: 'DELETE', body: JSON.stringify({ feedbackId: fbId }) }); fetchFeedback(fbPage); showToast('Feedback deleted'); } catch (e: any) { alert(e.message); }
    };
    const handleSaveTrailer = async () => {
        if (!trailerForm.url.trim()) { alert('Trailer URL is required'); return; }
        setTrailerSaving(true);
        try { await adminFetch('/api/admin/trailer', { method: 'POST', body: JSON.stringify(trailerForm) }); fetchTrailer(); showToast('Trailer saved!'); } catch (e: any) { alert(e.message); }
        setTrailerSaving(false);
    };

    const fbStatusColor: Record<string, string> = { unread: 'bg-red-500/10 text-red-400 border-red-500/30', read: 'bg-blue-500/10 text-blue-400 border-blue-500/30', replied: 'bg-green-500/10 text-green-400 border-green-500/30', dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
    const fbTypeColor: Record<string, string> = { bug: 'bg-red-500/10 text-red-400', feature: 'bg-purple-500/10 text-purple-400', general: 'bg-cyan-500/10 text-cyan-400' };

    if (error === 'Admin access required') return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center p-8"><Shield className="w-16 h-16 text-red-500 mx-auto mb-4" /><h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1><p className="text-gray-400 mb-6">You don't have admin privileges.</p><Link href="/dashboard" className="px-6 py-3 bg-cyan-500 text-gray-900 font-bold rounded-xl">Go to Dashboard</Link></div>
        </div>
    );
    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" /><p className="text-gray-400 text-sm">Loading Admin Panel...</p></div>
        </div>
    );

    const tabs = [
        { key: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
        { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { key: 'activities', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
        { key: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'trailer', label: 'Trailer', icon: <Film className="w-4 h-4" /> },
    ];

    return (
        <>
            <SEO 
                title="GoFit Admin Panel" 
                description="GoFit Admin Dashboard for managing users and platform activity."
                noindex={true}
            />

            <div className="min-h-screen bg-gray-950 text-white font-['Inter']">
                {/* Toast */}
                {toast && <div className="fixed top-4 right-4 z-[100] px-5 py-3 bg-emerald-500 text-gray-900 font-semibold rounded-xl shadow-xl animate-slideDown flex items-center gap-2"><CheckCircle className="w-4 h-4" />{toast}</div>}

                {/* Header */}
                <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20"><Shield className="w-5 h-5 text-white" /></div>
                            <h1 className="text-lg font-bold tracking-tight font-['Outfit']">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">GoFit</span>
                                <span className="text-gray-500 ml-1.5 font-normal text-sm">Admin</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchOverview} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"><RefreshCw className="w-5 h-5" /></button>
                            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><Home className="w-4 h-4" /> Dashboard</Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-900 rounded-xl mb-8 w-fit overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {[
                                    { label: 'Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30', ic: 'text-cyan-400' },
                                    { label: 'Runs', value: stats.totalRuns, icon: <Footprints className="w-5 h-5" />, color: 'from-lime-500/20 to-emerald-500/20 border-lime-500/30', ic: 'text-lime-400' },
                                    { label: 'Territories', value: stats.totalTerritories, icon: <MapIcon className="w-5 h-5" />, color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30', ic: 'text-purple-400' },
                                    { label: 'Activities', value: stats.totalActivities, icon: <Activity className="w-5 h-5" />, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30', ic: 'text-amber-400' },
                                    { label: 'Distance km', value: stats.totalDistance, icon: <TrendingUp className="w-5 h-5" />, color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30', ic: 'text-rose-400' },
                                    { label: 'Total XP', value: stats.totalPoints, icon: <Zap className="w-5 h-5" />, color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30', ic: 'text-yellow-400' },
                                    { label: 'Avg Streak', value: `${stats.avgStreak}d`, icon: <Flame className="w-5 h-5" />, color: 'from-orange-500/20 to-red-500/20 border-orange-500/30', ic: 'text-orange-400' },
                                ].map((c, i) => (
                                    <div key={i} className={`bg-gradient-to-br ${c.color} backdrop-blur-sm p-4 rounded-2xl border flex flex-col gap-3 hover:scale-[1.03] transition-transform`}>
                                        <div className={c.ic}>{c.icon}</div>
                                        <div><p className="text-2xl font-bold text-white">{c.value}</p><p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{c.label}</p></div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Recent Users</h3>
                                    <div className="space-y-3">
                                        {recentUsers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-700 relative overflow-hidden">
                                                        <Image fill src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="object-cover" />
                                                    </div>
                                                    <div><p className="font-semibold text-sm">{user.username}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                                                </div>
                                                <div className="text-right"><p className="text-sm font-bold text-cyan-400">{user.total_points} XP</p><p className="text-xs text-gray-500">{user.total_distance} km</p></div>
                                            </div>
                                        ))}
                                        {recentUsers.length === 0 && <p className="text-center text-gray-600 py-6 text-sm">No users yet</p>}
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> Recent Activity</h3>
                                    <div className="space-y-2">
                                        {recentActivities.map(act => (
                                            <div key={act.id} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'run_completed' ? 'bg-lime-400' : act.type === 'territory_claimed' ? 'bg-purple-400' : 'bg-cyan-400'}`} />
                                                <div className="flex-1 min-w-0"><p className="text-sm text-gray-300 truncate">{act.text}</p><p className="text-xs text-gray-600 mt-1">{new Date(act.created_at).toLocaleString()}</p></div>
                                            </div>
                                        ))}
                                        {recentActivities.length === 0 && <p className="text-center text-gray-600 py-6 text-sm">No activity yet</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="text" placeholder="Search by username or email..." className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-orange-500/50 outline-none transition-all" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                            </div>
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
                                                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto" /></td></tr>
                                            ) : users.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-12 text-gray-600">No users found</td></tr>
                                            ) : users.map(user => (
                                                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" className="w-8 h-8 rounded-full bg-gray-700" />
                                                            <div>
                                                                <span className="font-semibold">{user.username}</span>
                                                                {user.activity_banned && <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/15 text-red-400 border border-red-500/30 rounded-md">Banned</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 hidden sm:table-cell">{user.email}</td>
                                                    <td className="p-4 text-right font-bold text-cyan-400">{user.total_points}</td>
                                                    <td className="p-4 text-right text-gray-400 hidden sm:table-cell">{user.total_distance} km</td>
                                                    <td className="p-4 text-right hidden md:table-cell"><span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-md">{user.active_streak}d</span></td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {/* View Profile */}
                                                            <button onClick={() => handleViewProfile(user.id)} className="p-2 hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 rounded-lg transition-colors" title="View Profile"><Eye className="w-4 h-4" /></button>
                                                            {/* Edit */}
                                                            <button onClick={() => { setEditingUser(user); setEditForm({ username: user.username, total_points: user.total_points, total_distance: user.total_distance, active_streak: user.active_streak }); }} className="p-2 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                                            {/* Ban/Unban */}
                                                            <button onClick={() => handleBanToggle(user)} className={`p-2 rounded-lg transition-colors ${user.activity_banned ? 'hover:bg-green-500/10 text-green-500 hover:text-green-400' : 'hover:bg-amber-500/10 text-gray-500 hover:text-amber-400'}`} title={user.activity_banned ? 'Unban from activity' : 'Ban from activity'}><Ban className="w-4 h-4" /></button>
                                                            {/* Delete */}
                                                            {deletingUserId === user.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"><Check className="w-4 h-4" /></button>
                                                                    <button onClick={() => setDeletingUserId(null)} className="p-2 bg-gray-800 text-gray-400 rounded-lg"><X className="w-4 h-4" /></button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setDeletingUserId(user.id)} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {userTotalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                                        <p className="text-sm text-gray-500">Page {userPage} of {userTotalPages}</p>
                                        <div className="flex gap-2">
                                            <button disabled={userPage <= 1} onClick={() => fetchUsers(userPage - 1, userSearch)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                            <button disabled={userPage >= userTotalPages} onClick={() => fetchUsers(userPage + 1, userSearch)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── ACTIVITIES ── */}
                    {activeTab === 'activities' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-800"><h3 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> All Activity Logs</h3></div>
                                <div className="divide-y divide-gray-800/50">
                                    {actLoading ? <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto" /></div>
                                        : activities.length === 0 ? <div className="text-center py-12 text-gray-600 text-sm">No activity logs</div>
                                            : activities.map(act => (
                                                <div key={act.id} className="flex items-center gap-4 p-4 hover:bg-gray-800/20 transition-colors">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.type === 'run_completed' ? 'bg-lime-500/10 text-lime-400' : act.type === 'territory_claimed' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                        {act.type === 'run_completed' ? <Footprints className="w-5 h-5" /> : act.type === 'territory_claimed' ? <MapIcon className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0"><p className="text-sm text-gray-200">{act.text}</p><div className="flex items-center gap-3 mt-1"><span className="text-xs text-gray-500">@{act.username}</span><span className="text-xs text-gray-600">{new Date(act.created_at).toLocaleString()}</span></div></div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${act.type === 'run_completed' ? 'bg-lime-500/10 text-lime-500' : act.type === 'territory_claimed' ? 'bg-purple-500/10 text-purple-500' : 'bg-cyan-500/10 text-cyan-500'}`}>{act.type.replace('_', ' ')}</span>
                                                </div>
                                            ))}
                                </div>
                                {actTotalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                                        <p className="text-sm text-gray-500">Page {actPage} of {actTotalPages}</p>
                                        <div className="flex gap-2">
                                            <button disabled={actPage <= 1} onClick={() => fetchActivities(actPage - 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                            <button disabled={actPage >= actTotalPages} onClick={() => fetchActivities(actPage + 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── FEEDBACK ── */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400" /> User Feedback</h3>
                                    <span className="text-sm text-gray-500">{feedback.filter(f => f.status === 'unread').length} unread</span>
                                </div>
                                <div className="divide-y divide-gray-800/50">
                                    {fbLoading ? <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto" /></div>
                                        : feedback.length === 0 ? <div className="text-center py-12 text-gray-600 text-sm">No feedback yet</div>
                                            : feedback.map(fb => (
                                                <div key={fb.id} className="p-5 hover:bg-gray-800/10 transition-colors">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gray-700 shrink-0 relative overflow-hidden">
                                                                <Image fill src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.username}`} alt="" className="object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{fb.username || 'Anonymous'}</p>
                                                                <p className="text-xs text-gray-500">{fb.email} · {new Date(fb.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${fbTypeColor[fb.type] || 'bg-gray-500/10 text-gray-400'}`}>{fb.type}</span>
                                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md border ${fbStatusColor[fb.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>{fb.status}</span>
                                                        </div>
                                                    </div>
                                                    {fb.rating > 0 && <div className="flex gap-0.5 mt-2 ml-12">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />)}</div>}
                                                    <p className="mt-3 ml-12 text-sm text-gray-300 leading-relaxed">{fb.message}</p>
                                                    {fb.admin_reply && <div className="mt-2 ml-12 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-sm text-blue-300"><span className="font-semibold text-blue-400">Admin reply: </span>{fb.admin_reply}</div>}
                                                    <div className="flex items-center gap-2 mt-3 ml-12">
                                                        <button onClick={() => { setReplyingFb(fb); setReplyText(fb.admin_reply || ''); }} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"><Send className="w-3 h-3" /> Reply</button>
                                                        {fb.status !== 'read' && <button onClick={() => handleFbStatusChange(fb.id, 'read')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"><CheckCircle className="w-3 h-3" /> Mark Read</button>}
                                                        {fb.status !== 'dismissed' && <button onClick={() => handleFbStatusChange(fb.id, 'dismissed')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"><XCircle className="w-3 h-3" /> Dismiss</button>}
                                                        <button onClick={() => handleFbDelete(fb.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors ml-auto"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                </div>
                                {fbTotalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                                        <p className="text-sm text-gray-500">Page {fbPage} of {fbTotalPages}</p>
                                        <div className="flex gap-2">
                                            <button disabled={fbPage <= 1} onClick={() => fetchFeedback(fbPage - 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                            <button disabled={fbPage >= fbTotalPages} onClick={() => fetchFeedback(fbPage + 1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TRAILER ── */}
                    {activeTab === 'trailer' && (
                        <div className="space-y-6 animate-fadeIn max-w-2xl">
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Film className="w-5 h-5 text-pink-400" /> App Trailer</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Trailer URL <span className="text-gray-600 normal-case font-normal">(YouTube embed or direct mp4)</span></label>
                                        <input type="url" value={trailerForm.url} onChange={e => setTrailerForm({ ...trailerForm, url: e.target.value })} placeholder="https://www.youtube.com/embed/..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-pink-500/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Title</label>
                                        <input type="text" value={trailerForm.title} onChange={e => setTrailerForm({ ...trailerForm, title: e.target.value })} placeholder="GoFit — The Game of Fitness" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-pink-500/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Description</label>
                                        <textarea rows={3} value={trailerForm.description} onChange={e => setTrailerForm({ ...trailerForm, description: e.target.value })} placeholder="Describe the app trailer..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-pink-500/50 outline-none transition-all resize-none" />
                                    </div>
                                    <button onClick={handleSaveTrailer} disabled={trailerSaving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/20 transition-all disabled:opacity-50">
                                        {trailerSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Save Trailer
                                    </button>
                                </div>
                            </div>
                            {trailerForm.url && (
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                                    <h4 className="font-semibold text-gray-300 mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-gray-500" /> Preview</h4>
                                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-800">
                                        {trailerForm.url.includes('youtube') || trailerForm.url.includes('youtu.be') ? (
                                            <iframe src={trailerForm.url} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                        ) : (
                                            <video src={trailerForm.url} controls className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    {trailerForm.title && <p className="mt-3 font-bold text-white">{trailerForm.title}</p>}
                                    {trailerForm.description && <p className="mt-1 text-sm text-gray-400">{trailerForm.description}</p>}
                                    {trailer?.updated_at && <p className="mt-2 text-xs text-gray-600">Last updated: {new Date(trailer.updated_at).toLocaleString()}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── EDIT USER MODAL ── */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold flex items-center gap-2"><Edit2 className="w-5 h-5 text-blue-400" /> Edit User</h3><button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500"><X className="w-5 h-5" /></button></div>
                            <div className="flex items-center gap-4 mb-6 p-3 bg-gray-800/50 rounded-xl">
                                <img src={editingUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingUser.username}`} alt="" className="w-12 h-12 rounded-full" />
                                <div><p className="font-bold">{editingUser.username}</p><p className="text-xs text-gray-500">{editingUser.email}</p></div>
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Username</label><input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" /></div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Points</label><input type="number" value={editForm.total_points} onChange={e => setEditForm({ ...editForm, total_points: parseInt(e.target.value) || 0 })} className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" /></div>
                                    <div><label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Dist (km)</label><input type="number" step="0.1" value={editForm.total_distance} onChange={e => setEditForm({ ...editForm, total_distance: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" /></div>
                                    <div><label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 block">Streak</label><input type="number" value={editForm.active_streak} onChange={e => setEditForm({ ...editForm, active_streak: parseInt(e.target.value) || 0 })} className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" /></div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                                <button onClick={handleUpdateUser} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USER PROFILE MODAL ── */}
                {viewingProfile && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-emerald-400" /> User Profile</h3>
                                <button onClick={() => setViewingProfile(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
                            </div>
                            {profileLoading ? <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" /></div> : viewingProfile.profile ? (
                                <div className="p-6 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center gap-5 p-5 bg-gray-800/50 rounded-2xl">
                                        <img src={viewingProfile.profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingProfile.profile.username}`} alt="" className="w-16 h-16 rounded-full border-2 border-gray-700" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-xl font-bold">{viewingProfile.profile.username}</p>
                                                {viewingProfile.profile.activity_banned && <span className="px-2 py-0.5 text-xs bg-red-500/15 text-red-400 border border-red-500/30 rounded-md font-semibold">Activity Banned</span>}
                                            </div>
                                            <p className="text-sm text-gray-400">{viewingProfile.profile.email}</p>
                                            <p className="text-xs text-gray-600 mt-1">Joined {new Date(viewingProfile.profile.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[{ label: 'XP Points', value: viewingProfile.profile.total_points, color: 'text-cyan-400' }, { label: 'Distance', value: `${viewingProfile.profile.total_distance} km`, color: 'text-lime-400' }, { label: 'Streak', value: `${viewingProfile.profile.active_streak}d`, color: 'text-orange-400' }].map((s, i) => (
                                            <div key={i} className="bg-gray-800/50 rounded-xl p-4 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>
                                        ))}
                                    </div>
                                    {/* Recent Runs */}
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2"><Footprints className="w-4 h-4 text-lime-400" /> Recent Runs ({viewingProfile.runs?.length || 0})</h4>
                                        <div className="space-y-2">
                                            {(viewingProfile.runs || []).slice(0, 5).map((r: any) => (
                                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-xl text-sm">
                                                    <span className="text-gray-300">{r.distance?.toFixed(2)} km</span>
                                                    <span className="text-gray-500">{Math.round((r.duration || 0) / 60)} min</span>
                                                    <span className="text-cyan-400 font-semibold">{r.points} XP</span>
                                                    <span className="text-gray-600 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                            {(!viewingProfile.runs || viewingProfile.runs.length === 0) && <p className="text-gray-600 text-sm text-center py-3">No runs yet</p>}
                                        </div>
                                    </div>
                                    {/* Territories */}
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><MapIcon className="w-4 h-4 text-purple-400" /> Territories ({viewingProfile.territories?.length || 0})</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(viewingProfile.territories || []).map((t: any) => (
                                                <span key={t.id} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs">{t.area_sq_meters >= 10000 ? `${(t.area_sq_meters / 10000).toFixed(1)} ha` : `${Math.round(t.area_sq_meters)} m²`}</span>
                                            ))}
                                            {(!viewingProfile.territories || viewingProfile.territories.length === 0) && <p className="text-gray-600 text-sm">No territories claimed</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* ── FEEDBACK REPLY MODAL ── */}
                {replyingFb && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold flex items-center gap-2"><Send className="w-5 h-5 text-blue-400" /> Reply to Feedback</h3><button onClick={() => setReplyingFb(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500"><X className="w-5 h-5" /></button></div>
                            <div className="p-4 bg-gray-800/50 rounded-xl mb-4"><p className="text-sm text-gray-300">{replyingFb.message}</p><p className="text-xs text-gray-600 mt-2">From: {replyingFb.username} · {new Date(replyingFb.created_at).toLocaleDateString()}</p></div>
                            <textarea rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Your reply..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 outline-none resize-none transition-all" />
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setReplyingFb(null)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors">Cancel</button>
                                <button onClick={handleFbReply} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send Reply</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Admin;
