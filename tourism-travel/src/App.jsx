import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './routes/AppRoutes';
import './styles/globals.css';
import { AuthProvider } from './context/AuthContext';
import { TravelProvider } from './context/TravelContext';
import { AlertProvider } from './context/AlertContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '992178086409-a9j45bl7piu53vlfbihe1c9sgpv0itsb.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AlertProvider>
        <AuthProvider>
          <TravelProvider>
            <AppRoutes />
          </TravelProvider>
        </AuthProvider>
      </AlertProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
