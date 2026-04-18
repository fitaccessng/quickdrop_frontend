/**
 * Global OAuth Initialization
 * Loads Google SDK once at app startup to avoid multiple initializations
 */

let googleSDKLoaded = false;

export const initializeGoogleSDK = () => {
  if (googleSDKLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    // Check if already loaded via window.google
    if (window.google?.accounts?.id) {
      googleSDKLoaded = true;
      resolve();
      return;
    }

    // Load Google SDK script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleSDKLoaded = true;
      resolve();
    };

    script.onerror = () => {
      console.error('Failed to load Google SDK');
      resolve(); // Resolve anyway to prevent blocking
    };

    document.body.appendChild(script);
  });
};

export const getGoogleSDK = () => {
  return window.google?.accounts?.id;
};
