import { FC, useState, useEffect } from 'react';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { SoundManager } from '../lib/sound';
import { useToast } from './Toast';

export const UserSearchModal: FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<api.UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const { addToast } = useToast();

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const users = await api.searchUsers(query);
                setResults(users);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    if (!isOpen) return null;

    const handleSendRequest = async (userId: string, username: string) => {
        const res = await api.sendFriendRequest(userId);
        if (res.success) {
            SoundManager.playSuccess();
            setSentRequests(prev => new Set(Array.from(prev).concat(userId)));
            addToast(`Friend request sent to ${username}! 🤝`, 'success');
        } else {
            addToast(res.error || 'Failed to send request', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-cyan-500" /> Find Hunters
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-cyan-500 rounded-xl outline-none text-gray-900 dark:text-white transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                                <span>Scanning network...</span>
                            </div>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                                            <p className="text-xs text-gray-500">Lvl {Math.floor((user.total_points || 0) / 100) + 1}</p>
                                        </div>
                                    </div>
                                    {sentRequests.has(user.id) ? (
                                        <span className="text-xs font-bold text-green-500 px-3 py-1.5 bg-green-500/10 rounded-full">Sent ✓</span>
                                    ) : (
                                        <button
                                            onClick={() => handleSendRequest(user.id, user.username)}
                                            className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-full transition-all transform hover:scale-110"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : query.length >= 2 ? (
                            <div className="text-center py-8 text-gray-500">No hunters found with that signal.</div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">Enter at least 2 characters to search.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
