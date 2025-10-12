// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Firebase config (web credentials provided) - updated to the project the user requested
const firebaseConfig = {
  apiKey: "AIzaSyDRY3jdPdofQjyp-LH9kGJkp6ty28IcdOU",
  authDomain: "dm-bcv4.firebaseapp.com",
  projectId: "dm-bcv4",
  storageBucket: "dm-bcv4.firebasestorage.app",
  messagingSenderId: "666851736526",
  appId: "1:666851736526:web:c578822532f63f7a60499f",
  measurementId: "G-39JL538ZLB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth: use AsyncStorage persistence for native, normal for web
let auth;
try {
  auth = Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };

// Firestore
export const db = getFirestore(app);

// Initialize Analytics only on web (analytics isn't available in React Native SDK)
let analytics = null;
try {
  if (Platform.OS === 'web') {
    // import lazily to avoid bundling analytics on native
    // eslint-disable-next-line global-require
    const { getAnalytics } = require('firebase/analytics');
    analytics = getAnalytics(app);
  }
} catch (e) {
  // analytics may not be available or initialization may fail on native
  analytics = null;
}

export { analytics };

// Google Sign-In Client IDs (from Google Cloud Console)
export const GOOGLE_CLIENT_IDS = {
  // Web Client ID (OAuth 2.0 client from Google Cloud Console)
  web: "",
  
  // Android Client ID (from Google Cloud Console - Android client)
  android: "AIzaSyDCaAPSixOE-l13hmVl9ApnWoL-qxu6HN8",
  
  // iOS Client ID (from Google Cloud Console - iOS client)
  ios: "",
};

// Backward compatibility
export const GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_IDS.web;

// Android API key (useful for native SDKs / maps / other Android-specific services)
export const ANDROID_API_KEY = 'AIzaSyDCaAPSixOE-l13hmVl9ApnWoL-qxu6HN8';
