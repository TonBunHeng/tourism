import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../services/authService';
import GoogleButton from '../../components/common/GoogleButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(err);
    }
  }, [location.search]);

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
        if (from?.pathname?.startsWith('/') && !from.pathname.startsWith('//')) {
          navigate({
            pathname: from.pathname,
            search: from.search || '',
            hash: from.hash || '',
          }, { replace: true });
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#002D62] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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

          {/* Google Sign-In */}
          <div className="space-y-4 mb-6">
            <GoogleButton text="Sign in with Google" />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
                Or sign in with email
              </span>
              <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
            </div>
          </div>

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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] dark:focus:ring-blue-500 transition"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] dark:focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-900/10 transition flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-zinc-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#002D62] dark:text-blue-400 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
