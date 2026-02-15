import { useState } from 'react';
import { loginUser, registerUser } from '../lib/api';
import { useToast } from './Toast';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await loginUser(email, password);
      } else {
        if (username.length < 3) {
          addToast('Username must be at least 3 characters', 'warning');
          setLoading(false);
          return;
        }
        result = await registerUser(username, email, password);
      }

      if (result.success) {
        addToast(isLogin ? 'Welcome back, Hunter! 🎮' : 'Account created! Welcome to GoFit! 🚀', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl shadow-cyan-500/10 animate-slideUp">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-2xl font-black text-gray-900">G</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Welcome Back' : 'Join GoFit'}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin ? 'Enter your credentials to continue' : 'Create your hunter profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 text-white border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all placeholder-gray-600"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 text-white border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all placeholder-gray-600"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 text-white border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all placeholder-gray-600"
              placeholder="Password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-lime-500 text-gray-900 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              <span>{isLogin ? 'Login' : 'Create Account'}</span>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 hover:text-cyan-400 text-sm transition-colors"
          >
            {isLogin ? (
              <span>New to GoFit? <span className="text-cyan-400 font-semibold">Create account</span></span>
            ) : (
              <span>Already a hunter? <span className="text-cyan-400 font-semibold">Login</span></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}