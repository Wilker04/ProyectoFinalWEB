// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt6lDF3PXPGzXDAp9rhwocOZL38pHcgoI",
  authDomain: "proyectofinalweb-8f800.firebaseapp.com",
  projectId: "proyectofinalweb-8f800",
  storageBucket: "proyectofinalweb-8f800.appspot.com",
  messagingSenderId: "867065543761",
  appId: "1:867065543761:web:b4ec57f746702ce0b48c70",
  measurementId: "G-JZ4L73R973"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const realtimeDb = getDatabase();
export const storage = getStorage();
export const analytics = getAnalytics(app);