import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import './styles/globals.css';
import { initAppearance } from './utils/Theme';
import { AlertProvider } from './context/AlertContext';
import { LanguageProvider } from './i18n';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  useEffect(() => {
    initAppearance();
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AlertProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 transition-colors duration-200">
            <AppRoutes />
          </div>
        </AlertProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;