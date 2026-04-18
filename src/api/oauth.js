import http from "./http";

/**
 * Google OAuth Login/Signup
 * Initiates OAuth flow with Google
 */
export const loginWithGoogle = async (googleToken) => {
  try {
    const { data } = await http.post("/auth/oauth/google", {
      token: googleToken,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Google sign-in failed");
  }
};

/**
 * Apple OAuth Login/Signup
 * Initiates OAuth flow with Apple
 */
export const loginWithApple = async (appleToken, appleUser) => {
  try {
    const { data } = await http.post("/auth/oauth/apple", {
      token: appleToken,
      user: appleUser,
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Apple sign-in failed");
  }
};

/**
 * Initialize Google OAuth SDK
 * Call this once on app initialization
 */
export const initGoogleAuth = (clientId) => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: resolve,
      });
      resolve();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: resolve,
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
};

/**
 * Trigger Google OAuth Sign-In
 */
export const triggerGoogleSignIn = () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  }
};

/**
 * Initialize AppleID SDK
 * Call this once on app initialization
 */
export const initAppleAuth = () => {
  return new Promise((resolve, reject) => {
    if (window.AppleID) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Trigger Apple Sign In
 */
export const triggerAppleSignIn = () => {
  if (window.AppleID) {
    window.AppleID.auth.init({
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
      teamId: import.meta.env.VITE_APPLE_TEAM_ID,
      keyId: import.meta.env.VITE_APPLE_KEY_ID,
      redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI,
      usePopup: true,
    });
  }
};

/**
 * Handle Google OAuth Response
 */
export const handleGoogleCredentialResponse = async (response) => {
  try {
    const result = await loginWithGoogle(response.credential);
    return result;
  } catch (error) {
    console.error("Google OAuth Error:", error);
    throw error;
  }
};

/**
 * Handle Apple OAuth Response
 */
export const handleAppleResponse = async (response) => {
  try {
    const result = await loginWithApple(
      response.authorization.id_token,
      response.user
    );
    return result;
  } catch (error) {
    console.error("Apple OAuth Error:", error);
    throw error;
  }
};
