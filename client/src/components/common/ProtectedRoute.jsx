// Import React — required to write JSX
import React from 'react'

// Import Navigate from React Router — used to programmatically redirect the user to another route
import { Navigate } from 'react-router-dom'

// Import the useAuth hook — gives this component access to the current user and loading state
import { useAuth } from '../../context/AuthContext'

// ProtectedRoute is a wrapper component that guards routes requiring authentication.
// It accepts "children" — the component(s) that should only be shown to logged-in users.
// Usage in App.jsx: <ProtectedRoute><Dashboard /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  // Destructure "user" and "loading" from the auth context.
  // "user" is the logged-in user object (or null if not logged in).
  // "loading" is true while the app is still checking localStorage for a saved session.
  const { user, loading } = useAuth()

  // If the auth check is still in progress, show a centered loading spinner.
  // This prevents a flash where the app briefly redirects to /login before
  // realizing the user actually has a valid saved session.
  if (loading) {
    return (
      // Outer container: fills the full screen height and centers its content
      <div style={{
        minHeight: '100vh',        // Takes up the full viewport height
        display: 'flex',           // Use flexbox so we can center the spinner
        alignItems: 'center',      // Center vertically
        justifyContent: 'center',  // Center horizontally
        background: '#F0F2F5',     // Light grey background to match the app's color scheme
      }}>
        {/* Spinner element: a circle with a partially colored border that rotates */}
        <div style={{
          width: 40,                                       // 40px wide circle
          height: 40,                                      // 40px tall circle
          border: '3px solid #E9ECEF',                     // Light grey border on all sides (the "track")
          borderTop: '3px solid #3B5BDB',                  // Blue border on the top side (the "spinner arc")
          borderRadius: '50%',                             // Makes the div a perfect circle
          animation: 'db-spin 0.75s linear infinite',      // Applies a CSS spinning animation defined in dashboard.css
        }} />
      </div>
    )
  }

  // Auth check is complete — decide what to render:
  // - If "user" is truthy (user is logged in), render the child components (e.g. <Dashboard />)
  // - If "user" is null (user is NOT logged in), redirect them to the /login page.
  //   "replace" means this redirect replaces the current history entry,
  //   so the user can't click "Back" to return to the protected route.
  return user ? children : <Navigate to="/login" replace />
}
