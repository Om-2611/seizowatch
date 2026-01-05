// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu8r1Kzku23NNurLoZNYzmbHmnoeq8CCY",
  authDomain: "seizowatch.firebaseapp.com",
  databaseURL: "https://seizowatch-default-rtdb.firebaseio.com",
  projectId: "seizowatch",
  storageBucket: "seizowatch.firebasestorage.app",
  messagingSenderId: "372204846158",
  appId: "1:372204846158:web:adc6ded878be2905b9971f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, off };
