import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import tourismLogo from '../../assets/images/tourism_logo.png';
import { useLanguage } from '../../i18n';

const MINIMUM_LOADING_TIME = 900;

export default function RouteLoadingOverlay() {
  const { pathname } = useLocation();
  const { currentLang } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const viewKey = `${pathname}:${currentLang}`;
  const previousView = useRef(viewKey);

  // Keep the first view behind the loader as well, including after a browser refresh.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), MINIMUM_LOADING_TIME);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useLayoutEffect(() => {
    if (previousView.current === viewKey) return undefined;
    previousView.current = viewKey;

    setIsLoading(true);
    const timeoutId = window.setTimeout(() => setIsLoading(false), MINIMUM_LOADING_TIME);
    return () => window.clearTimeout(timeoutId);
  }, [viewKey]);

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Loading page' : ''}
      </span>
      {isLoading && (
        <div className="route-loading-overlay" aria-hidden="true">
          <div className="route-loading-content">
            <div className="route-loading-ring">
              <img src={tourismLogo} alt="" className="route-loading-logo" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
