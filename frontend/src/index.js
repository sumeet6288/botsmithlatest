import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { registerServiceWorker } from "@/utils/pushNotifications";

// Register service worker on app load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker()
      .then(() => console.log('✅ Service Worker initialized'))
      .catch((error) => console.error('❌ Service Worker initialization failed:', error));
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
