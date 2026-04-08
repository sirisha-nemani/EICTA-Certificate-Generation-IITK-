// Import React — required to use JSX syntax in this file
import React from 'react'

// Import useNavigate from React Router — gives us a function to programmatically navigate to a route
import { useNavigate } from 'react-router-dom'

// Define and export the CTA (Call To Action) component
// This renders a full-width banner section that encourages the user to log in
export default function CTA() {

  // useNavigate returns a navigate function — calling navigate('/login') sends the user to the login page
  const navigate = useNavigate()

  return (
    // <section> semantic HTML element — marks this as a standalone content section
    // "hp-cta-section" — CSS class for background color, vertical padding, and width
    <section className="hp-cta-section">

      {/* Centered content wrapper — limits max-width and adds horizontal padding */}
      {/* "hp-container" — reusable layout class shared across all page sections */}
      <div className="hp-container">

        {/* The visual card/box in the center of the CTA section */}
        {/* "hp-cta-card" — CSS class for background gradient, border-radius, padding, and centered content */}
        <div className="hp-cta-card">

          {/* Main heading of the CTA card — poses a call-to-action question */}
          {/* "hp-cta-title" — CSS class for large font size, white color, and bottom margin */}
          <h2 className="hp-cta-title">Ready to Get Your Certificate?</h2>

          {/* Subtitle text below the heading — brief supporting message */}
          {/* "hp-cta-subtitle" — CSS class for slightly smaller size and muted/lighter color */}
          <p className="hp-cta-subtitle">
            Login now to access your verified digital credentials
          </p>

          {/* Login button — navigates the user to /login when clicked */}
          {/* "hp-cta-btn" — CSS class for button background, padding, font, and hover effects */}
          {/* onClick fires an arrow function that calls navigate to redirect to the login route */}
          <button
            className="hp-cta-btn"
            onClick={() => navigate('/login')}
          >
            {/* Email icon SVG displayed to the left of the button text */}
            {/* width/height sets icon size; stroke="currentColor" inherits the button text color */}
            <svg width="18" height="18" fill="none" stroke="currentColor"
                 strokeWidth="2" viewBox="0 0 24 24">
              {/* Draws the rectangular envelope body of the email icon */}
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              {/* Draws the V-shaped flap/fold at the top of the envelope */}
              <polyline points="22,6 12,13 2,6" />
            </svg>

            {/* Button label text shown next to the icon */}
            Login with Email
          </button>

        </div>
      </div>
    </section>
  )
}
