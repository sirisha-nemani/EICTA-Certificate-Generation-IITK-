// Import React — required to use JSX syntax in this file
import React from 'react'

// Import useNavigate from React Router — lets us send the user to a different page on button click
import { useNavigate } from 'react-router-dom'

// Import the graduation photo used in the right column of the hero section
import graduationImg from '../../assets/graduation.jpg'

// Define and export the Hero component — the large intro banner at the top of the landing page
export default function Hero() {

  // useNavigate returns a navigate function we can call to redirect to another route
  const navigate = useNavigate()

  // scrollTo — helper that smoothly scrolls the page to any section by its HTML element id
  // "id" is passed as a string, e.g. 'features'
  const scrollTo = (id) => {
    // Find the HTML element with the matching id attribute
    const el = document.getElementById(id)
    // If the element was found, scroll it into view with smooth animation, aligned to the top
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    // <section> semantic HTML element — marks this as a distinct content section
    // "hp-hero" — CSS class that applies the hero background color, padding, and min-height
    <section className="hp-hero">

      {/* Inner wrapper that centers content and sets up the two-column layout */}
      {/* "hp-hero-inner" — CSS class for flex/grid layout and max-width constraint */}
      <div className="hp-hero-inner">

        {/* ── Left column ── */}
        {/* Contains the badge, heading, description text, and action buttons */}
        {/* "hp-hero-left" — CSS class controls width and vertical spacing of the left side */}
        <div className="hp-hero-left">

          {/* Badge — small pill-shaped label above the main heading */}
          {/* "hp-hero-badge" — CSS class styles the badge with background color, border-radius, and padding */}
          <div className="hp-hero-badge">
            {/* Small colored dot shown to the left of the badge text */}
            {/* "hp-hero-badge-dot" — CSS class makes it a small circle with a green/accent color */}
            <span className="hp-hero-badge-dot" />
            {/* Badge text — &amp; renders as the & character in HTML */}
            Secure &amp; Verified Certificates
          </div>

          {/* Main heading for the hero section */}
          {/* "hp-hero-title" — CSS class sets the large font size and line height */}
          <h1 className="hp-hero-title">
            {/* First part of the heading — plain text */}
            {/* {' '} inserts a space between "Access Your" and the colored span */}
            Access Your{' '}
            {/* Highlighted/accented part of the heading — shown in a different color */}
            {/* "hp-hero-title-accent" — CSS class applies the brand accent color (e.g. blue or purple) */}
            <span className="hp-hero-title-accent">Digital Certificates</span>
          </h1>

          {/* Short description paragraph below the heading */}
          {/* "hp-hero-desc" — CSS class sets font size, color (muted), and max-width */}
          <p className="hp-hero-desc">
            {/* &amp; renders as & in HTML; the text describes the portal's value */}
            Securely access and download your E&amp;ICT Academy course completion
            certificates. Verified, tamper-proof, and available anytime—right at
            your fingertips.
          </p>

          {/* Container for the two CTA buttons side by side */}
          {/* "hp-hero-buttons" — CSS class uses flex to lay the buttons out in a row with a gap */}
          <div className="hp-hero-buttons">

            {/* Primary "Get Started" button — navigates the user to the login page */}
            {/* "hp-btn-primary" — CSS class applies the filled, high-contrast button style */}
            <button className="hp-btn-primary" onClick={() => navigate('/login')}>

              {/* Inline SVG icon (log-in arrow) displayed to the left of the button label */}
              {/* width/height set the icon size; stroke="currentColor" makes it inherit the button's text color */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {/* Draws the rectangular door/panel shape of the login icon */}
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                {/* Draws the right-pointing arrow chevron */}
                <polyline points="10 17 15 12 10 7" />
                {/* Draws the horizontal line of the arrow */}
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>

              {/* Button label text */}
              Get Started
            </button>

            {/* Secondary "Learn More" button — scrolls the page down to the Features section */}
            {/* "hp-btn-secondary" — CSS class applies the outlined/ghost button style */}
            <button className="hp-btn-secondary" onClick={() => scrollTo('features')}>
              {/* Button label text */}
              Learn More

              {/* Inline SVG chevron-down icon displayed to the right of the button label */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {/* Draws the downward-pointing chevron (V-shape) */}
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

          </div>
        </div>

        {/* ── Right column — graduation photo ── */}
        {/* Contains the decorative image shown on the right side of the hero */}
        {/* "hp-hero-right" — CSS class controls width, alignment, and possible decorative border/shadow */}
        <div className="hp-hero-right">
          {/* Graduation photo image */}
          <img
            src={graduationImg}                              // Path to the imported graduation image
            alt="Graduates celebrating their achievement"   // Descriptive alt text for accessibility
            className="hp-hero-photo"                       // CSS class for sizing, border-radius, and object-fit
          />
        </div>

      </div>
    </section>
  )
}
