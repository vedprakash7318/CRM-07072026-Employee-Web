import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./Redux/Store.js";
import "./axiosInterceptor.js";

import { onMessage } from "firebase/messaging";
import { messaging } from "./Features/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

// 🔔 FOREGROUND NOTIFICATION
onMessage(messaging, (payload) => {
  const title = payload.notification?.title || "New Notification";
  const body = payload.notification?.body || "";

  // 🔊 SOUND
  const audio = new Audio("/ring1.mp3");
  audio.play().catch(() => {});

  const url = payload.data?.url;

  toast(
    <div onClick={() => { if(url) window.location.href = url; }} style={{ cursor: url ? "pointer" : "default" }}>
      <strong>{title}</strong>
      <div>{body}</div>
    </div>
  );
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
  </StrictMode>
);
