import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight, Ban, AlertTriangle, Loader2 } from "lucide-react";
import { getInitialTheme, applyTheme, isDarkTheme, THEME_CHANGE_EVENT } from "../../utils/Theme";
import authService from "../../services/authService";
import { useAlert } from "../../context/AlertContext";

export default function Login() {
  const { showInfo } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isIpBlocked, setIsIpBlocked] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return isDarkTheme(getInitialTheme());
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail && typeof e.detail.isDark === "boolean") {
        setIsDarkMode(e.detail.isDark);
      } else {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    applyTheme(nextTheme);
    setIsDarkMode(!isDarkMode);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setIsIpBlocked(false);

    try {
      const res = await authService.login(formData);
      if (res.success) {
        const destination = location.state?.from?.pathname || "/dashboard";
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(res.message || "Invalid login credentials.");
      }
    } catch (err) {
      if (err?.error === 'IP_BLOCKED' || err?.ip_blocked) {
        setIsIpBlocked(true);
        setErrorMessage(err.message || "Access Denied: Your IP address has been blocked by system administrators.");
      } else {
        setErrorMessage(err.message || "Failed to authenticate with API.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-150">
      {/* Clean, professional container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-sm overflow-hidden p-6 sm:p-8 relative">
        <button
          type="button"
          onClick={handleToggleTheme}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-md text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>

        <div>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              Administrator Sign In
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5">
              Enter your credentials to access the management portal
            </p>
          </div>

            {/* Error / IP Blocked Notice */}
            {errorMessage && (
              <div className={`mb-4 p-3 rounded-md border flex items-start gap-2.5 ${
                isIpBlocked
                  ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60 text-xs'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40 text-xs font-medium'
              }`}>
                {isIpBlocked ? (
                  <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-medium">
                    {errorMessage}
                  </p>
                  {isIpBlocked && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                      Your IP address has been restricted from accessing AngkorVerses. Contact your Super Admin to unblock.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@tourism.gov.kh"
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#003E83] focus:border-[#003E83] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-zinc-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      showInfo("Please contact the Super Administrator (admin@tourism.gov.kh) to securely reset your credentials.", "Password Reset Request"); 
                    }}
                    className="text-xs text-[#003E83] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#003E83] focus:border-[#003E83] text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-gray-300 dark:border-zinc-700 text-[#003E83] focus:ring-[#003E83] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-zinc-400">Remember session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#003E83] hover:bg-[#002e62] text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
}
