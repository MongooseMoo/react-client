import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import EditorWindow from "./components/editor/editorWindow";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/editor", element: <EditorWindow /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

function registerServiceWorker() {
  console.log("Attempting to register service worker...");
  if ("serviceWorker" in navigator) {
    console.log("Service Worker is supported in this browser");
    window.addEventListener("load", () => {
      console.log("Window loaded, registering service worker...");
      navigator.serviceWorker
        .register("/ntfy-service-worker.js")
        .then((registration) => {
          console.log("ServiceWorker registered successfully:", registration);
          console.log("ServiceWorker scope:", registration.scope);

          if (registration && registration.active) {
            console.log(
              "ServiceWorker is already active, starting SSE connection..."
            );
          } else {
            console.log(
              "ServiceWorker is not yet active, waiting for activation..."
            );
            registration?.addEventListener("activate", () => {
              if (registration && registration.active) {
                console.log(
                  "ServiceWorker activated, starting SSE connection..."
                );
              }
            });
          }

          // Set up message listener
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data.type === "NTFY_MESSAGE") {
              // Call your client.ts function to handle the notification
              // For example:
              // client.showNotification(event.data.payload);
              console.log("Received NTFY message:", event.data.payload);
            } else if (event.data.type === "SSE_STATUS") {
              console.log("SSE Status:", event.data.status);
            } else {
              console.log("Received unknown message type:", event.data.type);
            }
          });
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error);
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);
        });
    });
  } else {
    console.warn("Service Worker is not supported in this browser");
  }
}

// Wrap the registerServiceWorker call in a try-catch block
try {
  registerServiceWorker();
  console.log("registerServiceWorker called successfully");
} catch (error) {
  console.error("Error calling registerServiceWorker:", error);
  console.error("Error stack:", error.stack);
}
