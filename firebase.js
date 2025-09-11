// Import the functions you need from the SDKs you need
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxnwGi1xE2SznL7nMmPKvZORMHcYSaDH8",
  authDomain: "myfirstproject-4c07d.firebaseapp.com",
  projectId: "myfirstproject-4c07d",
  storageBucket: "myfirstproject-4c07d.appspot.com",
  messagingSenderId: "436008014146",
  appId: "1:436008014146:web:3066f30e4876d02723f8db",
  measurementId: "G-HSVLT0BKB1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
