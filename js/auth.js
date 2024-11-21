import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { generateId } from './utils.js';

export async function createAccount(email, password, fullName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      fullName,
      created: new Date().toISOString()
    });

    return {
      id: user.uid,
      email: user.email,
      fullName
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      id: user.uid,
      email: user.email
    };
  } catch (error) {
    throw new Error('Invalid credentials');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error('Error signing out');
  }
}