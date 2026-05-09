import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmzkHGCx3vf6FPZUNMdMphGAnDqb6JPjQ",
  authDomain: "encurtador-links-senai.firebaseapp.com",
  projectId: "encurtador-links-senai",
  storageBucket: "encurtador-links-senai.firebasestorage.app",
  messagingSenderId: "910094002894",
  appId: "1:910094002894:web:c0c6b355e31204283efe9f"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
