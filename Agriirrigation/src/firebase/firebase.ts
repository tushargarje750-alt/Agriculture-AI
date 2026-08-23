import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

/* AUTH */
import { getAuth } from "firebase/auth";

/* FIRESTORE (optional admin data) */
import { getFirestore } from "firebase/firestore";

/* REALTIME DATABASE (ESP32 sensors) */
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL, // ⭐ REQUIRED
};

const app = initializeApp(firebaseConfig);

getAnalytics(app);

/* EXPORT SERVICES */

export const auth = getAuth(app);

/* Firestore */
export const firestore = getFirestore(app);

/* Realtime DB */
export const database = getDatabase(app);