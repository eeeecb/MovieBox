// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANBzWjHohwvzFuU4X7RD9BNx3C4KCYqdA",
  authDomain: "moviebox-36a3.firebaseapp.com",
  projectId: "moviebox-36a3",
  storageBucket: "moviebox-36a3.firebasestorage.app",
  messagingSenderId: "624126096018",
  appId: "1:624126096018:web:70b122a4f9c28ea654ac4b",
  measurementId: "G-RB3Q30ET88"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
