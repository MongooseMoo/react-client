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
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/ntfy-service-worker.js")
        .then((registration) => {
          console.log("ServiceWorker registered:", registration);

          // Start the SSE connection once the ServiceWorker is active
          if (registration && registration.active) {
            registration.active.postMessage({ type: "START_SSE" });
          } else {
            registration?.addEventListener("activate", () => {
              if (registration && registration.active) {
                registration.active.postMessage({ type: "START_SSE" });
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
            }
          });
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error);
        });
    });
  }
}

registerServiceWorker();
