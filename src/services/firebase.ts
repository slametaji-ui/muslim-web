import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC6cJXrTleTrd5AQJS5xsMtXLvywunggRY",
  authDomain: "qolbi-muslim-app.firebaseapp.com",
  projectId: "qolbi-muslim-app",
  storageBucket: "qolbi-muslim-app.firebasestorage.app",
  messagingSenderId: "761442687414",
  appId: "1:761442687414:web:e0f250b915bc1ed9218917",
  measurementId: "G-J5D7RMSL7J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, analytics, messaging };
