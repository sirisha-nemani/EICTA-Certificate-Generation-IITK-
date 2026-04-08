// Import the React library — required to use JSX syntax and React features
import React from 'react'

// Import ReactDOM's client-side renderer — used to mount the React app into the HTML page
import ReactDOM from 'react-dom/client'

// Import the root App component — this is the top-level component that contains the entire application
import App from './App'

// Import the global CSS stylesheet — applies base styles to the whole app
import './styles/globals.css'

// Find the HTML element with id="root" in index.html, create a React root on it,
// then render the App component inside it.
// ReactDOM.createRoot is the modern React 18 way to mount a React application.
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode is a development helper wrapper — it runs extra checks and
  // warnings during development to help catch potential problems early.
  // It does NOT affect the production build.
  <React.StrictMode>
    {/* Render the entire application — all routes and providers live inside App */}
    <App />
  </React.StrictMode>
)
