import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import './styles/globals.css';
import { initAppearance } from './utils/Theme';
import { AlertProvider } from './context/AlertContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  useEffect(() => {
    initAppearance();
  }, []);

  return (
    <ErrorBoundary>
      <AlertProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 transition-colors duration-200">
          <AppRoutes />
        </div>
      </AlertProvider>
    </ErrorBoundary>
  );
}

export default App;