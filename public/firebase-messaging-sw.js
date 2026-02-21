importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC6cJXrTleTrd5AQJS5xsMtXLvywunggRY",
    authDomain: "qolbi-muslim-app.firebaseapp.com",
    projectId: "qolbi-muslim-app",
    storageBucket: "qolbi-muslim-app.firebasestorage.app",
    messagingSenderId: "761442687414",
    appId: "1:761442687414:web:e0f250b915bc1ed9218917",
    measurementId: "G-J5D7RMSL7J"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-muslimapp.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
