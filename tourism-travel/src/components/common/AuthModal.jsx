import { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle,
  User,
  Mail,
  Lock,
  Building2,
  Compass,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import GoogleLoginButton from './GoogleLoginButton';
import logoImg from '../../assets/tourism_logo.png';

export default function AuthModal() {
  const navigate = useNavigate();
  const { authModal, closeAuthModal, login, register } = useAuth();
  const { showToast } = useTravel();

  const [modeOverride, setModeOverride] = useState(null);
  const isLogin = modeOverride !== null ? modeOverride : authModal.mode === 'login';

  const [selectedRole, setSelectedRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  if (!authModal.isOpen) return null;

  const handleClose = () => {
    setModeOverride(null);
    closeAuthModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrors({});

    if (!isLogin) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name or business name.');
        return;
      }
      if (password !== passwordConfirmation) {
        setErrorMessage('Password and Confirm Password do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      let loggedUser = null;
      if (isLogin) {
        loggedUser = await login({ email: email.trim(), password });
        showToast('Signed in successfully!', 'success');
      } else {
        loggedUser = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          role: selectedRole,
        });
        showToast(`Registration successful! Welcome as ${selectedRole.replace('_', ' ')}.`, 'success');
      }
      handleClose();
      if (loggedUser) {
        const dest = getRoleRedirectPath(loggedUser);
        navigate(dest);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden p-6 sm:p-8 space-y-5 my-auto max-h-[92vh] overflow-y-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#003E83]/10 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2 p-2 border border-blue-200/60 dark:border-blue-900/40">
            <img
              src={logoImg}
              alt="AngkorVerses"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Join AngkorVerses'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
            {isLogin
              ? 'Sign in to access your itinerary, reservations, or business dashboard.'
              : 'Create an account to explore Cambodian heritage, tours, and services.'}
          </p>
        </div>

        {/* Tab switch capsule */}
        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setModeOverride(true); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
              isLogin
                ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-[#60a5fa] shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setModeOverride(false); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
              !isLogin
                ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-[#60a5fa] shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/80 rounded-2xl text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selection when creating account */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="block font-bold text-gray-700 dark:text-zinc-300">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    selectedRole === 'user'
                      ? 'border-[#003E83] bg-blue-50/70 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 ring-1 ring-[#003E83]'
                      : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Compass className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                    {selectedRole === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />}
                  </div>
                  <span className="font-extrabold text-xs">Tourist / Traveler</span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">Explore & book trips</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('business_owner')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    selectedRole === 'business_owner'
                      ? 'border-[#003E83] bg-blue-50/70 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-300 ring-1 ring-[#003E83]'
                      : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedRole === 'business_owner' && <CheckCircle2 className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />}
                  </div>
                  <span className="font-extrabold text-xs">Business & Guide</span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">List hospitality services</span>
                </button>
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                {selectedRole === 'business_owner' ? 'Business or Guide Name *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedRole === 'business_owner' ? 'e.g., Angkor Heritage Retreat' : 'e.g., Sokha Dara'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
              {errors.name && <p className="text-red-600 dark:text-red-400 text-[11px] mt-1">{errors.name[0]}</p>}
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>
            {errors.email && <p className="text-red-600 dark:text-red-400 text-[11px] mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Sign In (Google) */}
          {isLogin && (
            <div className="pt-2 space-y-3">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
                <span className="shrink-0 mx-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-zinc-800"></div>
              </div>
              <div>
                <GoogleLoginButton
                  onSuccess={(loggedUser) => {
                    handleClose();
                    if (loggedUser) {
                      const dest = getRoleRedirectPath(loggedUser);
                      navigate(dest);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
