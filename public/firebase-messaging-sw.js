// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// "Default" Firebase app (important for initialization)
firebase.initializeApp({
  apiKey: "AIzaSyDKxg-QBiI9C5-kwoPyRkCCVaZNRe0ICdM",
  authDomain: "raincheck-k6xpe.firebaseapp.com",
  projectId: "raincheck-k6xpe",
  storageBucket: "raincheck-k6xpe.firebasestorage.app",
  messagingSenderId: "172960932877",
  appId: "1:172960932877:web:85632877066fdb81006144",
  measurementId: ""
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
