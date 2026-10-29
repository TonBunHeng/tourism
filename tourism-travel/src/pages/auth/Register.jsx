import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Briefcase, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../services/authService';
import GoogleButton from '../../components/common/GoogleButton';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // 'user' or 'business_owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Siem Reap');
  const [bio, setBio] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      if (res?.success && res.data?.user) {
        const userRole = normalizeRole(res.data.user.role);
        if (userRole === 'business_owner') {
          navigate('/business/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        const firstErrorKey = Object.keys(err.errors)[0];
        setErrorMessage(err.errors[firstErrorKey][0] || err.message);
      } else {
        setErrorMessage(err.message || 'Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#002D62] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Choose your account type and start discovering or managing tourism in Cambodia
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200/80 dark:border-zinc-800 rounded-3xl">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  role === 'user'
                    ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${role === 'user' ? 'bg-[#002D62] text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'}`}>
                  <Compass size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Tourist / Explorer</span>
                    {role === 'user' && <CheckCircle2 size={13} className="text-[#002D62] dark:text-blue-400" />}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    Explore destinations, chat with AI, save favorites & book tours.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('business_owner')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  role === 'business_owner'
                    ? 'border-amber-600 dark:border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${role === 'business_owner' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'}`}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Business Owner</span>
                    {role === 'business_owner' && <CheckCircle2 size={13} className="text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    List restaurant, hotel or tour services and manage bookings.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Google Quick Registration */}
          <div className="space-y-4 mb-6">
            <GoogleButton 
              text={`Continue with Google as ${role === 'business_owner' ? 'Business Owner' : 'Tourist'}`} 
              role={role} 
            />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
                Or register with email
              </span>
              <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'business_owner' ? 'Sokha Chanthou' : 'VIT Vong'}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Password (min 8 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Province / City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                  >
                    <option value="Siem Reap">Siem Reap (Angkor)</option>
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kampot">Kampot</option>
                    <option value="Kep">Kep</option>
                    <option value="Preah Sihanouk">Preah Sihanouk (Kompong Som)</option>
                    <option value="Koh Kong">Koh Kong</option>
                    <option value="Mondulkiri">Mondulkiri</option>
                    <option value="Ratanakiri">Ratanakiri</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                {role === 'business_owner' ? 'Business Description & Tourism Category' : 'Travel Interests & Bio'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder={role === 'business_owner' ? 'e.g., Traditional Khmer Restaurant in Siem Reap specializing in Amok...' : 'e.g., Heritage lover excited to photograph ancient Khmer temples...'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-zinc-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#002D62] dark:text-blue-400 hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
