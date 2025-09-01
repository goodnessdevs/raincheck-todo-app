import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "raincheck-k6xpe",
  "appId": "1:172960932877:web:85632877066fdb81006144",
  "storageBucket": "raincheck-k6xpe.firebasestorage.app",
  "apiKey": "AIzaSyDKxg-QBiI9C5-kwoPyRkCCVaZNRe0ICdM",
  "authDomain": "raincheck-k6xpe.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "172960932877"
};

// Initialize Firebase
let firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebaseApp;
