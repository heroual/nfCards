import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUk7t1UDxCqbIJdFaTMUgBUEDCRidhJA8",
  authDomain: "nfcard-e390e.firebaseapp.com",
  projectId: "nfcard-e390e",
  storageBucket: "nfcard-e390e.firebasestorage.app",
  messagingSenderId: "299681972119",
  appId: "1:299681972119:web:82fae505a760841672ced2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);