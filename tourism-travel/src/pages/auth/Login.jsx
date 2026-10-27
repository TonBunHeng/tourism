import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Briefcase, 
  UserCheck,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../services/authService';
import logoImg from '../../assets/images/tourism_logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await login({ email: email.trim(), password });
      if (res?.success && res.data?.user) {
        const userRole = normalizeRole(res.data.user.role);
        if (from) {
          navigate(from, { replace: true });
        } else if (userRole === 'business_owner') {
          navigate('/business/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#003E83] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
          <img 
            src={logoImg} 
            alt="AngkorVerses Logo" 
            className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
          />
          <div className="text-left">
            <span className="block font-black text-2xl tracking-tight bg-gradient-to-r from-[#003E83] to-blue-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
              AngkorVerses
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-zinc-400">
              Tourist & Business Portal
            </span>
          </div>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Access your travel itineraries, bookings, and business hub
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-8 shadow-xl border border-slate-200/80 dark:border-zinc-800 rounded-3xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003E83] dark:focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003E83] dark:focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-900/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Sign-in Presets
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleAutofill('vit.vong@example.com', 'password123')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1 font-bold text-[#003E83] dark:text-blue-400">
                  <UserCheck size={13} />
                  <span>Tourist User</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                  vit.vong@example.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAutofill('owner@angkor-restaurant.com', 'password123')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Briefcase size={13} />
                  <span>Business Owner</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                  owner@angkor-restaurant.com
                </div>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-zinc-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#003E83] dark:text-blue-400 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>

        {/* Staff note */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-500">
          Ministry Admins & Guides:{' '}
          <a 
            href="http://localhost:5174" 
            target="_blank" 
            rel="noreferrer"
            className="text-slate-700 dark:text-zinc-300 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Sign in at Admin Portal (Port 5174)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
