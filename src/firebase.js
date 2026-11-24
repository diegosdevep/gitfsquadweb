import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { browserLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider, initializeAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "giftsquad-523aa.firebaseapp.com",
  projectId: "giftsquad-523aa",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const firebaseConfigurado = Boolean(firebaseConfig.apiKey && firebaseConfig.appId && siteKey);

const app = firebaseConfigurado ? initializeApp(firebaseConfig) : null;

if (app) {
  if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = app
  ? initializeAuth(app, { persistence: browserLocalPersistence, popupRedirectResolver: browserPopupRedirectResolver })
  : null;
export const functions = app ? getFunctions(app, "southamerica-east1") : null;
export const googleProvider = new GoogleAuthProvider();
