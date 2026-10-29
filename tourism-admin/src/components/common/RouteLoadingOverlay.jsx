import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import tourismLogo from '../../assets/images/tourism_logo.png';

const ROUTE_TRANSITION_MS = 600;

export default function RouteLoadingOverlay() {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Avoid blocking on initial mount since ProtectedRoute and individual pages handle initial loading
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return undefined;
    }

    // Snappy, non-blocking visual feedback when switching routes
    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, ROUTE_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="route-loading-overlay pointer-events-none" aria-hidden="true">
      <div className="route-loading-content pointer-events-none">
        <div className="route-loading-ring">
          <img src={tourismLogo} alt="" className="route-loading-logo" />
        </div>
      </div>
    </div>
  );
}
