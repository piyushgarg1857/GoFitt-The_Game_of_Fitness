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
        addToast(isLogin ? 'Authentication successful' : 'Account provisioned successfully', 'success');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md border border-gray-100 shadow-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="GoFit" className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover border border-gray-100 shadow-sm" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join GoFit'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Enter credentials to access dashboard' : 'Create your athletic profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400"
              placeholder="Password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 hover:text-gray-900 text-sm transition-colors font-medium"
          >
            {isLogin ? (
              <span>New to GoFit? <span className="underline underline-offset-2 text-gray-900">Sign Up</span></span>
            ) : (
              <span>Already registered? <span className="underline underline-offset-2 text-gray-900">Sign In</span></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}