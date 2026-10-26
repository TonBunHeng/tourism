import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTravel } from "../../context/TravelContext";

export default function GoogleLoginButton({ onSuccess, onError }) {
  const { googleLogin } = useAuth();
  const { showToast } = useTravel();
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Fetch user info from Google using the received access token
        const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = userInfoRes.data;

        // Authorize with backend API
        const user = await googleLogin({
          access_token: tokenResponse.access_token,
          google_id: profile.sub,
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
        });

        showToast(`Welcome ${profile.name || "Traveler"}! Signed in with Google.`, "success");
        if (onSuccess) onSuccess(user);
      } catch (err) {
        console.error("Google Sign In Error:", err);
        showToast(err.message || "Google Sign-In failed. Please try again.", "error");
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google OAuth Error:", errorResponse);
      const msg = errorResponse?.error_description || "Google Sign-In was cancelled or failed.";
      showToast(msg, "error");
      if (onError) onError(errorResponse);
    },
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/80 border border-gray-300 dark:border-zinc-700 rounded-md text-xs font-semibold text-gray-800 dark:text-zinc-100 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span>{loading ? "Connecting with Google..." : "Continue with Google"}</span>
    </button>
  );
}
