// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: 'AIzaSyCt72a4kw3lDrqNowFXoLO7EfkbQRgZWt0',
  authDomain: "reactchatapp-1795a.firebaseapp.com",
  projectId: "reactchatapp-1795a",
  storageBucket: "reactchatapp-1795a.appspot.com",
  messagingSenderId: "35162794527",
  appId: "1:35162794527:web:a20ff30a7b01a032a2832a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();