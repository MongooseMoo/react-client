import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { register } from './serviceWorker';

// Sentry Configuration
Sentry.init({
  dsn: "https://2356c3ef12dad1afcb30defd749d96f1@new.q-continuum.net/2",
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/client\.rustytelephone\.net\//],
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Dynamic import for EditorWindow
const EditorWindow = lazy(() => import("./components/editor/editorWindow"));

// Router Configuration
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/editor", element: <Suspense fallback={<div>Loading Editor...</div>}><EditorWindow /></Suspense> },
]);

// React DOM Rendering
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Performance Monitoring
reportWebVitals(console.log);

// Service Worker Registration
register();
