importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBBYo1Zgim-Z-snKUFLQwe9vjblqRXCbNA",
  messagingSenderId: "380846726921",
  appId: "1:380846726921:web:9002bf1e3fadc900aebdd8",
  projectId: "crmadmin-d988f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
    sound: "default",
    requireInteraction: true,
    data: payload.data // pass the data (which includes url) to the notification event
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/main';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab to the URL
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
