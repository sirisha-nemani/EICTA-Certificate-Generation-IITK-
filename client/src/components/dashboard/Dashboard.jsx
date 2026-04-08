// Import React — required to write JSX
import React from 'react'

// Import useNavigate from React Router — gives us a function to programmatically change the page URL
import { useNavigate } from 'react-router-dom'

// Import the useAuth hook — gives this component access to the current user and the logout function
import { useAuth } from '../../context/AuthContext'

// Import the CredentialCard component — used to render each credential as a card in the list
import CredentialCard from './CredentialCard'

// Import the EICTA logo image — displayed in the navigation bar
import eiectaLogo from '../../assets/eicta-logo.png'

// Import the dashboard-specific CSS styles — scoped styles for layout, navbar, cards, etc.
import '../../styles/dashboard.css'

/* ── Icons ── */

// LogoutIcon: an SVG icon that looks like a door with an arrow — used on the logout button.
// It renders as a pure inline SVG so no image file is needed.
const LogoutIcon = () => (
  // SVG canvas: 15x15 pixels, no fill, uses the current text color for the stroke
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    {/* Left rectangle — represents a door or panel */}
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    {/* Arrowhead pointing right — represents "exit" direction */}
    <polyline points="16 17 21 12 16 7"/>
    {/* Horizontal line — the shaft of the exit arrow */}
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

// ArrowLeftIcon: an SVG icon of a left-pointing arrow — used on the "Back" button.
const ArrowLeftIcon = () => (
  // SVG canvas: 15x15 pixels, no fill, uses current text color
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Horizontal line — the shaft of the back arrow */}
    <line x1="19" y1="12" x2="5" y2="12"/>
    {/* Arrowhead pointing left */}
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

/* ── Mock credential data ──────────────────────────────────────
   Replace with real API call when backend endpoint is ready
   ─────────────────────────────────────────────────────────── */

// MOCK_CREDENTIALS is a hardcoded array of credential objects used for development/demo purposes.
// Each object represents one certificate the user has earned.
// TODO: Replace this with a real API call to fetch credentials from the backend.
const MOCK_CREDENTIALS = [
  {
    id: 1,                                             // Unique ID for this credential (used as the React key)
    program: 'Faculty Development Program',            // The name of the program the credential belongs to
    specialization: 'Electronics',                    // The specialization or track within the program
    course: 'Advanced Embedded Systems Design',        // The specific course the certificate is for
    issued: '02/02/2025',                              // The date the certificate was issued (DD/MM/YYYY format)
  },
  {
    id: 2,                                             // Unique ID for the second credential
    program: 'Faculty Development Program',            // Same program, different course
    specialization: 'Communication Technology',        // Different specialization
    course: 'IoT and Wireless Communication',          // The course this certificate covers
    issued: '17/02/2026',                              // Issue date for this certificate
  },
]

/* ════════════════════════════════════════
   Dashboard page
   ════════════════════════════════════════ */

// Dashboard is the main authenticated page — shows the user their list of earned credentials.
// It also includes a navigation bar with the logo, user email, and a logout button.
export default function Dashboard() {
  // useNavigate returns a function we can call to change the current URL/page
  const navigate          = useNavigate()

  // Get the current user object and the logout function from the auth context
  const { user, logout }  = useAuth()

  // Assign the mock credentials array to a local variable.
  // When a real API is wired up, this line will be replaced with state from a useEffect/API call.
  const credentials       = MOCK_CREDENTIALS

  // handleLogout: called when the user clicks either logout button.
  // It clears the auth state and redirects to the login page.
  const handleLogout = () => {
    logout()         // Clears the token from localStorage and sets user to null in AuthContext
    navigate('/login') // Redirect to the login page after logging out
  }

  // handleBack: called when the user clicks the "Back" button.
  // It navigates to the public home page.
  const handleBack = () => {
    navigate('/') // Go back to the root "/" home page
  }

  return (
    // Outermost page wrapper — applies the full-page background and layout styles
    <div className="db-page">

      {/* ══════════════════════════════════
          NAVBAR — full viewport width
          ══════════════════════════════════ */}
      {/* The navigation bar that appears at the top of the dashboard */}
      <nav className="db-nav">
        {/* Inner container — constrains the navbar content to a max width and pads the sides */}
        <div className="db-nav-inner">

          {/* Left side of the navbar — contains the logo and portal title */}
          <div className="db-nav-brand">
            {/* EICTA logo image — loaded from the assets folder */}
            <img
              src={eiectaLogo}          // Path to the logo image file
              alt="EICTA"              // Accessible text shown if the image doesn't load
              className="db-nav-logo"   // CSS class for sizing and styling
              // onError: if the logo image fails to load (e.g. missing file),
              // hide the broken image and show the fallback text instead
              onError={e => {
                e.target.style.display = 'none'         // Hide the broken <img> element
                e.target.nextSibling.style.display = 'block' // Show the fallback text span
              }}
            />
            {/* Fallback text shown only when the logo image fails to load.
                Hidden by default (display: none) — shown via the onError handler above. */}
            <span className="db-nav-logo-fallback" style={{ display: 'none' }}>IFACET</span>

            {/* A thin vertical divider line between the logo and the portal title */}
            <div className="db-nav-divider" />

            {/* The portal name text displayed next to the logo */}
            <span className="db-nav-title">
              Digital Credentials<br /> {/* Line break between the two words */}
              Portal
            </span>
          </div>

          {/* Right side of the navbar — shows the logged-in user's email and logout controls */}
          <div className="db-nav-right">

            {/* Email info block — shows who is currently logged in.
                Hidden on mobile screens via CSS (the db-nav-user-info class) */}
            <div className="db-nav-user-info">
              {/* Label text above the email address */}
              <p className="db-nav-user-label">Logged in as</p>
              {/* The user's email address — uses optional chaining (?.) in case user is null,
                  and falls back to '—' if the email is not available */}
              <p className="db-nav-user-email">{user?.email || '—'}</p>
            </div>

            {/* Logout button — full text version shown on desktop screens.
                Calls handleLogout when clicked. */}
            <button className="db-nav-logout-btn" onClick={handleLogout}>
              <LogoutIcon /> {/* The SVG exit/door icon displayed before the text */}
              Logout
            </button>

            {/* Logout button — icon-only version shown on mobile screens.
                aria-label provides accessible text since there is no visible label. */}
            <button
              className="db-nav-logout-icon-btn"  // CSS class hides this on desktop, shows it on mobile
              onClick={handleLogout}               // Calls the same logout handler
              aria-label="Logout"                  // Screen reader description of this button
            >
              <LogoutIcon /> {/* Same SVG icon as the desktop button */}
            </button>

          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════ */}
      {/* The main scrollable content area below the navbar */}
      <main className="db-main">

        {/* Back button — navigates the user to the home page when clicked */}
        <button className="db-back-btn" onClick={handleBack}>
          <ArrowLeftIcon /> {/* Left arrow SVG icon */}
          Back
        </button>

        {/* Page header section — title and credential count */}
        <div className="db-header">
          {/* Main heading text prompting the user to pick a credential */}
          <h1 className="db-header-title">
            Select your credential to continue
          </h1>
          {/* Shows how many credentials were found — the number is bolded */}
          <p className="db-header-count">
            <strong>{credentials.length}</strong> credentials found
          </p>
        </div>

        {/* Credential cards list — one CredentialCard is rendered for each credential object */}
        <div className="db-credential-list">
          {/* Map over the credentials array — for each item, render a CredentialCard */}
          {credentials.map((cred, idx) => (
            <CredentialCard
              key={cred.id}        // Unique key prop required by React when rendering lists — uses the credential's id
              credential={cred}    // Pass the full credential object as a prop to CredentialCard
              index={idx}          // Pass the array index so CredentialCard can build the certificate URL (/certificate/0, etc.)
            />
          ))}
        </div>

      </main>
    </div>
  )
}
