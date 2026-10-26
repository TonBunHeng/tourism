import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  Compass, 
  Building2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import logoImg from '../../assets/tourism_logo.png';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, register } = useAuth();
  const { showToast } = useTravel();

  const [role, setRole] = useState('user'); // 'user' | 'business_owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

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
    setErrors({});

    if (!name.trim()) {
      setErrorMessage('Please enter your full name or business organization name.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const registeredUser = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
      });

      showToast(`Welcome! Your account has been registered as ${role.replace('_', ' ')}.`, 'success');
      const fromPath = location.state?.from?.pathname;
      const target = getRoleRedirectPath(registeredUser, fromPath);
      navigate(target, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check the entered details.');
      if (err.errors) setErrors(err.errors);
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
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#003E83]/10 dark:bg-blue-900/30 p-2.5 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-900/40">
            <img src={logoImg} alt="AngkorVerses Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create an AngkorVerses Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Join the Cambodian tourism ecosystem to explore, book, or host travelers
          </p>
        </div>

        {/* Role Selection Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
            Select Your Account Type:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                role === 'user'
                  ? 'border-[#003E83] bg-blue-50/70 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 ring-2 ring-[#003E83]'
                  : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Compass className="w-5 h-5 text-[#003E83] dark:text-blue-400" />
                {role === 'user' && <CheckCircle2 className="w-4 h-4 text-[#003E83] dark:text-blue-400" />}
              </div>
              <span className="font-extrabold text-xs">Tourist / Traveler</span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
                Explore sights, book tours & plan itineraries
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('business_owner')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                role === 'business_owner'
                  ? 'border-[#003E83] bg-blue-50/70 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 ring-2 ring-[#003E83]'
                  : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {role === 'business_owner' && <CheckCircle2 className="w-4 h-4 text-[#003E83] dark:text-blue-400" />}
              </div>
              <span className="font-extrabold text-xs">Business & Guide</span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
                Host properties, tours & manage bookings
              </span>
            </button>
          </div>
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
              {role === 'business_owner' ? 'Business or Guide Full Name *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'business_owner' ? 'e.g., Angkor Eco-Trek Adventures' : 'e.g., Sokha Dara'}
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:outline-none transition-all"
              />
            </div>
            {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Email Address *
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
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:outline-none transition-all"
                />
              </div>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Social Registration */}
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
            <span className="shrink-0 mx-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Or sign up with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
          </div>

          <GoogleLoginButton onSuccess={handleGoogleSuccess} />
        </div>

        {/* Bottom Switch */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-[#003E83] dark:text-blue-400 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
