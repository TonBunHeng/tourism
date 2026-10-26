/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import AlertModal from '../components/common/AlertModal';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Cancel',
    isConfirm: false,
    customIcon: null
  });

  const resolverRef = useRef(null);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  /**
   * General purpose alert popup
   */
  const showAlert = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setAlertState({
        isOpen: true,
        type: options.type || 'info',
        title: options.title || '',
        message: options.message || '',
        confirmText: options.confirmText || (options.isConfirm ? 'Confirm' : 'OK'),
        cancelText: options.cancelText || 'Cancel',
        isConfirm: Boolean(options.isConfirm),
        customIcon: options.customIcon || null
      });
    });
  }, []);

  /**
   * Confirmation dialog returning Promise<boolean>
   */
  const showConfirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return showAlert({
      type: opts.type || 'danger',
      title: opts.title || 'Confirmation',
      message: opts.message || 'Are you sure you want to proceed?',
      confirmText: opts.confirmText || (opts.type === 'danger' || !opts.type ? 'Delete' : 'Confirm'),
      cancelText: opts.cancelText || 'Cancel',
      isConfirm: true,
      customIcon: opts.customIcon
    });
  }, [showAlert]);

  /**
   * Success alert popup
   */
  const showSuccess = useCallback((message, title = 'Success', options = {}) => {
    return showAlert({
      type: 'success',
      title,
      message,
      confirmText: options.confirmText || 'OK',
      isConfirm: false,
      ...options
    });
  }, [showAlert]);

  /**
   * Error alert popup
   */
  const showError = useCallback((message, title = 'Error', options = {}) => {
    return showAlert({
      type: 'error',
      title,
      message,
      confirmText: options.confirmText || 'Close',
      isConfirm: false,
      ...options
    });
  }, [showAlert]);

  /**
   * Warning alert popup
   */
  const showWarning = useCallback((message, title = 'Warning', options = {}) => {
    return showAlert({
      type: 'warning',
      title,
      message,
      confirmText: options.confirmText || 'Understood',
      isConfirm: false,
      ...options
    });
  }, [showAlert]);

  /**
   * Information alert popup
   */
  const showInfo = useCallback((message, title = 'Information', options = {}) => {
    return showAlert({
      type: 'info',
      title,
      message,
      confirmText: options.confirmText || 'OK',
      isConfirm: false,
      ...options
    });
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeAlert
      }}
    >
      {children}
      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        isConfirm={alertState.isConfirm}
        customIcon={alertState.customIcon}
        onConfirm={handleConfirm}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;
