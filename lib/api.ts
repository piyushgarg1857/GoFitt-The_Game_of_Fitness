// GoFit API Client - MongoDB/NoSQL Backend
// Replaces Supabase client with REST API calls

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    total_distance: number;
    total_points: number;
    active_streak: number;
    avatar_url?: string;
    level?: number;
    rank?: number;
}

export interface UserStats {
    level: number;
    xp: number;
    xpToNextLevel: number;
    territories: number;
    totalDistance: number;
    rank: number;
    activeStreak: number;
    caloriesBurned: number;
    hp: number;
    maxHp: number;
}

export interface Run {
    id: string;
    date: string;
    distance: number;
    duration: number;
    pace: string;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    level: number;
    territories: number;
    total_points: number;
    avatar_url?: string;
}

export interface Activity {
    id: string;
    user_id: string;
    username: string;
    type: string;
    text: string;
    created_at: string;
}

// Token management
function getToken(): string | null {
    // We use HttpOnly cookies, so we don't have direct access to the token in JS.
    // Return a dummy value if we have a cached user to allow API requests to proceed.
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gofitt_token') || (localStorage.getItem('gofitt_user') ? 'httponly-cookie-active' : null);
}

function setToken(token: string) {
    if (typeof window !== 'undefined' && token) {
        // We can still store it for fallback, but it's not strictly necessary.
        localStorage.setItem('gofitt_token', token);
    }
}

async function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('gofitt_token');
        localStorage.removeItem('gofitt_user');
    }
    // Call the logout endpoint to clear the HttpOnly cookie
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout error:', e);
    }
}

function getCachedUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('gofitt_user');
    if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
}

function setCachedUser(user: UserProfile) {
    localStorage.setItem('gofitt_user', JSON.stringify(user));
}

// API request helper
async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
}

// ===== Auth APIs =====
export async function registerUser(username: string, email: string, password: string) {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });

    if (data.success) {
        setToken(data.token);
        setCachedUser(data.user);
    }

    return data;
}

export async function loginUser(email: string, password: string) {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data.success) {
        setToken(data.token);
        setCachedUser(data.user);
    }

    return data;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
    try {
        const token = getToken();
        if (!token) return null;

        const data = await apiRequest('/api/auth/me');
        if (data.success) {
            setCachedUser(data.user);
            return data.user;
        }
        return null;
    } catch {
        return getCachedUser();
    }
}

export async function logout() {
    await removeToken();
    window.location.reload();
}

export function isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('gofitt_user') || !!localStorage.getItem('gofitt_token');
}

export function getCurrentUser(): UserProfile | null {
    return getCachedUser();
}

// ===== Stats APIs =====
export async function getUserStats(): Promise<UserStats | null> {
    try {
        const data = await apiRequest('/api/user/stats');
        return data.success ? data.stats : null;
    } catch {
        return null;
    }
}

// ===== Profile APIs =====
export async function updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
        const data = await apiRequest('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        if (data.success) {
            setCachedUser(data.user);
        }
        return data;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ===== Runs APIs =====
export async function getRuns(): Promise<Run[]> {
    try {
        const data = await apiRequest('/api/runs');
        return data.success ? data.runs : [];
    } catch {
        return [];
    }
}

export async function saveRun(distance: number, duration: number, path: [number, number][]): Promise<{ success: boolean; error?: string }> {
    try {
        const data = await apiRequest('/api/runs', {
            method: 'POST',
            body: JSON.stringify({ distance, duration, path }),
        });
        return data;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ===== Territory APIs =====
export async function getTerritories() {
    try {
        const data = await apiRequest('/api/territories');
        return data.success ? data.territories : [];
    } catch {
        return [];
    }
}

export async function createTerritory(coordinates: any, center: [number, number], area: number) {
    try {
        const data = await apiRequest('/api/territories', {
            method: 'POST',
            body: JSON.stringify({ coordinates, center, area }),
        });
        return data;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ===== Leaderboard APIs =====
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
        const data = await apiRequest('/api/leaderboard');
        return data.success ? data.leaderboard : [];
    } catch {
        return [];
    }
}

// ===== Activities / Realtime Feed =====
export async function getActivities(): Promise<Activity[]> {
    try {
        const data = await apiRequest('/api/activities');
        return data.success ? data.activities : [];
    } catch {
        return [];
    }
}

// ===== Friends APIs =====
export async function searchUsers(query: string): Promise<UserProfile[]> {
    try {
        const data = await apiRequest(`/api/users/search?q=${encodeURIComponent(query)}`);
        return data.success ? data.users : [];
    } catch {
        return [];
    }
}

export async function sendFriendRequest(receiverId: string) {
    try {
        const data = await apiRequest('/api/friends', {
            method: 'POST',
            body: JSON.stringify({ receiverId }),
        });
        return data;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getFriendRequests() {
    try {
        const data = await apiRequest('/api/friends');
        return data.success ? data.requests : [];
    } catch {
        return [];
    }
}

export async function acceptFriendRequest(requestId: string) {
    try {
        const data = await apiRequest('/api/friends', {
            method: 'PUT',
            body: JSON.stringify({ requestId }),
        });
        return data;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ===== Achievements (client-side computed) =====
export function checkAchievements(stats: UserStats) {
    return [
        { id: 1, name: 'First Steps', description: 'Complete your first run.', unlocked: stats.totalDistance > 0, icon: 'footprints' },
        { id: 2, name: 'Territory Novice', description: 'Claim your first territory.', unlocked: stats.territories > 0, icon: 'shield' },
        { id: 3, name: 'Marathoner', description: 'Run 42km total.', unlocked: stats.totalDistance >= 42, icon: 'trophy' },
        { id: 4, name: 'Streak Master', description: 'Reach a 7-day streak.', unlocked: stats.activeStreak >= 7, icon: 'flame' },
        { id: 5, name: 'Explorer', description: 'Claim 10 territories.', unlocked: stats.territories >= 10, icon: 'map' },
        { id: 6, name: 'Speed Demon', description: 'Reach Level 10.', unlocked: stats.level >= 10, icon: 'zap' },
    ];
}
