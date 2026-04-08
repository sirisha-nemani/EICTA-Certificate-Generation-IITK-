// Import React and the useState hook — useState lets us track local component state
import React, { useState } from 'react'

// Import useNavigate from React Router — lets us programmatically navigate to other pages/routes
import { useNavigate } from 'react-router-dom'

// Import the EICTA logo image file to display in the navbar brand area
import eictaLogo from '../../assets/eicta-logo.png'

// Define and export the Navbar component — renders the sticky top navigation bar
export default function Navbar() {

  // useNavigate returns a function we call to redirect the user to a different route
  const navigate = useNavigate()

  // imgError — boolean state that tracks whether the logo image failed to load
  // setImgError — function to update imgError; starts as false (no error yet)
  const [imgError, setImgError] = useState(false)

  // scrollTo — helper function that smoothly scrolls the page to a section by its HTML id
  // "id" is the string id of the target HTML element (e.g. 'faq', 'features')
  const scrollTo = (id) => {
    // Look up the element in the DOM using document.getElementById
    const el = document.getElementById(id)
    // If the element exists, scroll to it smoothly and align it to the top of the viewport
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    // <nav> semantic HTML element — tells browsers and screen readers this is a navigation region
    // "hp-nav" — CSS class that styles the navbar background, position, and shadow
    <nav className="hp-nav">

      {/* Inner wrapper that centers and constrains the navbar content width */}
      {/* "hp-nav-inner" — CSS class for flex layout, max-width, and horizontal padding */}
      <div className="hp-nav-inner">

        {/* ── Brand ── */}
        {/* Clicking the brand area scrolls back to the very top of the page */}
        {/* window.scrollTo scrolls the window to coordinates { top: 0 } with smooth animation */}
        <div className="hp-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>

          {/* Conditional rendering: if the logo image failed to load, show a fallback letter "E" */}
          {imgError ? (
            // Fallback element shown when the logo image cannot be loaded
            // "hp-nav-logo-fallback" — CSS class styles this as a colored square with a letter
            <div className="hp-nav-logo-fallback">E</div>
          ) : (
            // The actual logo image — shown when imgError is false (image loaded successfully)
            <img
              src={eictaLogo}           // Source path of the logo image file
              alt="EICTA Consortium"    // Alt text for accessibility / screen readers
              className="hp-nav-logo"   // CSS class that sets the logo size and shape
              onError={() => setImgError(true)} // If the image fails to load, set imgError to true, triggering the fallback
            />
          )}

          {/* Vertical divider line between the logo and the portal name text */}
          {/* "hp-nav-divider" — CSS class draws a thin vertical separator */}
          <div className="hp-nav-divider" />

          {/* Text label shown next to the logo — identifies the portal name */}
          {/* "hp-nav-portal-name" — CSS class sets font size, weight, and color */}
          <span className="hp-nav-portal-name">Digital Credentials Portal</span>
        </div>

        {/* ── Links ── */}
        {/* Container for the right-side navigation buttons */}
        {/* "hp-nav-links" — CSS class arranges buttons side by side with a gap */}
        <div className="hp-nav-links">

          {/* FAQ button — clicking it smoothly scrolls the page down to the FAQ section */}
          {/* "hp-nav-faq-btn" — CSS class styles this as a ghost/text-style button */}
          <button className="hp-nav-faq-btn" onClick={() => scrollTo('faq')}>
            FAQ
          </button>

          {/* Login button — clicking it navigates the user to the /login route */}
          {/* "hp-nav-login-btn" — CSS class styles this as a filled/primary-style button */}
          <button className="hp-nav-login-btn" onClick={() => navigate('/login')}>
            Login
          </button>

        </div>

      </div>
    </nav>
  )
}
