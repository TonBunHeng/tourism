import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import logoImg from '../../assets/tourism_logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login } = useAuth();
  const { showToast } = useTravel();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to role home
  useEffect(() => {
    if (isAuthenticated && user) {
      const fromPath = location.state?.from?.pathname;
      const target = getRoleRedirectPath(user, fromPath);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const loggedIn = await login({ email: email.trim(), password });
      showToast('Welcome back! Signed in successfully.', 'success');
      const fromPath = location.state?.from?.pathname;
      const target = getRoleRedirectPath(loggedIn, fromPath);
      navigate(target, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (loggedUser) => {
    if (loggedUser) {
      const fromPath = location.state?.from?.pathname;
      const target = getRoleRedirectPath(loggedUser, fromPath);
      navigate(target, { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#003E83]/10 dark:bg-blue-900/30 p-2.5 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-900/40">
            <img src={logoImg} alt="AngkorVerses Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign In to AngkorVerses
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Access your tourist itinerary, reservations, or management dashboard
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-700 dark:text-zinc-300">
                Password
              </label>
              <span className="text-[11px] text-[#003E83] dark:text-blue-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Social Sign-In */}
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
            <span className="shrink-0 mx-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Or sign in with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
          </div>

          <GoogleLoginButton onSuccess={handleGoogleSuccess} />
        </div>

        {/* Bottom Switch */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
          <span>Don't have an account yet? </span>
          <Link
            to="/register"
            className="font-bold text-[#003E83] dark:text-blue-400 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
