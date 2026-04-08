// Import React — required to use JSX syntax in this file
import React from 'react'

// Import useNavigate from React Router — lets us programmatically navigate to other routes on button click
import { useNavigate } from 'react-router-dom'

// Define and export the Footer component — renders the bottom section of the landing page
export default function Footer() {

  // useNavigate returns a navigate function used to redirect users to other pages
  const navigate = useNavigate()

  // scrollTo — helper function that smoothly scrolls the page to a section by its HTML element id
  // "id" is the string id of the target element (e.g. 'faq', 'features')
  const scrollTo = (id) => {
    // Look up the element in the DOM by its id attribute
    const el = document.getElementById(id)
    // If the element is found, scroll it into view with smooth animation aligned to the top of the viewport
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    // <footer> semantic HTML element — tells browsers and screen readers this is the page footer
    // "hp-footer" — CSS class for footer background color, text color, and overall layout
    <footer className="hp-footer">

      {/* ── Main columns ── */}
      {/* The upper part of the footer containing the three informational columns */}
      {/* "hp-footer-main" — CSS class for background color and vertical padding of the main area */}
      <div className="hp-footer-main">

        {/* Centered content wrapper — constrains max-width and adds horizontal padding */}
        {/* "hp-container" — reusable layout class shared across all sections */}
        <div className="hp-container">

          {/* Grid wrapper that lays out the three columns side by side */}
          {/* "hp-footer-grid" — CSS class sets up a responsive 3-column grid layout */}
          <div className="hp-footer-grid">

            {/* Col 1 — Portal info */}
            {/* First column: portal name and a short description */}
            <div>
              {/* Column heading — the portal's display name */}
              {/* "hp-footer-col-title" — CSS class for font weight, size, and bottom margin */}
              <p className="hp-footer-col-title">Digital Credentials Portal</p>

              {/* Short description of the portal — &amp; renders as the & character */}
              {/* "hp-footer-col-desc" — CSS class for muted/lighter text color and line height */}
              <p className="hp-footer-col-desc">
                Secure access to your E&amp;ICT Academy certificates. Verified,
                tamper-proof, and available on demand.
              </p>
            </div>

            {/* Col 2 — Quick links */}
            {/* Second column: buttons that navigate to common page sections */}
            <div>
              {/* Column heading */}
              <p className="hp-footer-col-title">Quick Links</p>

              {/* Unordered list of navigation link items */}
              {/* "hp-footer-link-list" — CSS class removes default list styling and adds vertical spacing */}
              <ul className="hp-footer-link-list">

                {/* Login link — navigates the user to the /login route */}
                <li>
                  <button onClick={() => navigate('/login')}>Login</button>
                </li>

                {/* FAQ link — smoothly scrolls to the FAQ section on the page */}
                <li>
                  <button onClick={() => scrollTo('faq')}>FAQ</button>
                </li>

                {/* Features link — smoothly scrolls to the Features section on the page */}
                <li>
                  <button onClick={() => scrollTo('features')}>Features</button>
                </li>

              </ul>
            </div>

            {/* Col 3 — Support */}
            {/* Third column: support contact information */}
            <div>
              {/* Column heading */}
              <p className="hp-footer-col-title">Support</p>

              {/* Introductory line before the email address */}
              {/* "hp-footer-support-text" — CSS class for muted text color and small font size */}
              <p className="hp-footer-support-text">
                For any queries, please contact us at:
              </p>

              {/* Mailto link — clicking this opens the user's default email client with the address pre-filled */}
              {/* href="mailto:..." tells the browser to open an email composition window */}
              {/* "hp-footer-support-email" — CSS class styles this as a highlighted, underlined email link */}
              <a
                href="mailto:support@eict.academy"
                className="hp-footer-support-email"
              >
                support@eict.academy
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      {/* The thin bar at the very bottom of the footer showing the copyright notice */}
      {/* "hp-footer-bottom" — CSS class for background color, vertical padding, and centered text */}
      <div className="hp-footer-bottom">
        {/* Copyright text — &amp; renders the & character; shows the current year and organization name */}
        <p>© 2026 E&amp;ICT Academy. All rights reserved.</p>
      </div>

    </footer>
  )
}
