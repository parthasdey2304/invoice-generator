import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the app is running in Electron
 * and provide Electron-specific functionality
 */
export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState(null);

  useEffect(() => {
    // Check if we're running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    }
  }, []);

  // Navigation listener for Electron menu actions
  useEffect(() => {
    if (electronAPI) {
      const handleNavigate = (event, route) => {
        // You can use this with React Router
        window.location.hash = route;
      };

      electronAPI.onNavigate(handleNavigate);

      return () => {
        electronAPI.removeNavigateListener();
      };
    }
  }, [electronAPI]);

  const saveFile = async (options) => {
    if (electronAPI) {
      return await electronAPI.showSaveDialog(options);
    }
    return null;
  };

  const openFile = async (options) => {
    if (electronAPI) {
      return await electronAPI.showOpenDialog(options);
    }
    return null;
  };

  const getAppVersion = async () => {
    if (electronAPI) {
      return await electronAPI.getVersion();
    }
    return null;
  };

  return {
    isElectron,
    electronAPI,
    saveFile,
    openFile,
    getAppVersion,
    platform: electronAPI?.platform || 'web'
  };
};
