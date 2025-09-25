import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Main Styles
import './index.css';

// Context and Main App Component
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';

// Import all your view components that will become pages
import { ProjectsView } from './components/dashboard/ProjectsView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { PlaygroundView } from './components/dashboard/PlaygroundView';
import { DataView } from './components/dashboard/DataView';

// Define the application's routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.jsx acts as the root layout
    // These children routes will be rendered inside App.jsx's <Outlet />
    children: [
      { path: "projects", element: <ProjectsView /> },
      { path: "playground", element: <PlaygroundView /> },
      { path: "data", element: <DataView /> },
      { path: "analytics", element: <AnalyticsView /> },
      { path: "settings", element: <SettingsView /> },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>,
);