// Import React — needed to write JSX and use React components
import React from 'react'

// Import routing components from React Router v6:
// - BrowserRouter: provides URL-based routing using the browser's history API
// - Routes: container that holds all Route definitions
// - Route: maps a URL path to a component
// - Navigate: programmatically redirects the user to a different route
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import the AuthProvider — wraps the app so every component can access auth state (user, login, logout, etc.)
import { AuthProvider }       from './context/AuthContext'

// Import the public Home page — shown at the "/" root path
import Home                   from './pages/Home'

// Import the Login page — handles OTP-based user authentication at "/login"
import LoginPage              from './pages/LoginPage'

// Import the Dashboard page — shows the user's credentials list at "/dashboard"
import Dashboard              from './components/dashboard/Dashboard'

// Import the Certificate Detail page — HTML preview + zoom controls at "/certificate/:id"
import CertificatePage        from './pages/CertificatePage'

// Import the Certificate PDF page — clean dark PDF viewer at "/certificate/pdf/:id"
// Opened when the user clicks "Download" on the detail page.
import CertificatePdfPage     from './pages/CertificatePdfPage'

// Import the ProtectedRoute component — wraps routes that require the user to be logged in
import ProtectedRoute         from './components/common/ProtectedRoute'

// Define and export the root App component — this is what main.jsx renders
export default function App() {
  return (
    // AuthProvider wraps everything so that login/logout state is available
    // to any component anywhere in the app via the useAuth() hook
    <AuthProvider>
      {/* BrowserRouter enables client-side routing — the page URL changes without full reloads */}
      <BrowserRouter>
        {/* Routes renders only the first Route whose path matches the current URL */}
        <Routes>
          {/* Public homepage — accessible by anyone, no login required */}
          <Route path="/"        element={<Home />} />

          {/* OTP-based login page — accessible by anyone, no login required */}
          <Route path="/login"   element={<LoginPage />} />

          {/* Protected dashboard — only logged-in users can access this route.
              ProtectedRoute checks if a user is authenticated; if not, it redirects to /login */}
          <Route
            path="/dashboard"
            element={
              // ProtectedRoute acts as a guard — it only renders its children if the user is logged in
              <ProtectedRoute>
                {/* Dashboard is the page shown to authenticated users */}
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected certificate detail page — /certificate/0, /certificate/1, etc.
              Shows: HTML preview with zoom controls + sidebar + Credential Details.
              Desktop: two-column layout.  Mobile: stacked. */}
          <Route
            path="/certificate/:id"
            element={
              <ProtectedRoute>
                <CertificatePage />
              </ProtectedRoute>
            }
          />

          {/* Protected PDF viewer page — /certificate/pdf/0, /certificate/pdf/1, etc.
              Clean dark page with just the PDF iframe and a Download button.
              Opened when the user clicks "Download" on the detail page. */}
          <Route
            path="/certificate/pdf/:id"
            element={
              <ProtectedRoute>
                <CertificatePdfPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route — catches any URL that doesn't match the routes above.
              "replace" means the /unknown URL won't be added to browser history,
              so hitting Back won't loop back to the unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
