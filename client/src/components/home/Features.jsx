// Import React — required to use JSX syntax in this file
import React from 'react'

// features — a static array of objects, each representing one feature card to display
// Each object has: variant (color theme), icon (SVG element), title (heading), and desc (description)
const features = [
  {
    // variant — a string used to apply a color-specific CSS modifier class to the icon wrapper
    variant: 'purple',

    // icon — an inline SVG element representing a shield (used for the "Secure Authentication" card)
    icon: (
      // SVG: 24x24 px, no fill, stroked lines with width 2, viewBox defines the coordinate space
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        {/* Shield path shape — represents security/protection */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),

    // title — the heading text displayed at the top of this feature card
    title: 'Secure Authentication',

    // desc — the short description paragraph shown below the title on this card
    desc:  'Email-based OTP verification ensures only authorised users can access their certificates. No passwords to remember — just your registered email.',
  },
  {
    // variant — "teal" applies a teal color theme to the icon background wrapper
    variant: 'teal',

    // icon — an inline SVG of a download arrow (used for the "Instant Downloads" card)
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        {/* Horizontal tray / base line at the bottom of the download icon */}
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        {/* Downward-pointing chevron arrow */}
        <polyline points="7 10 12 15 17 10" />
        {/* Vertical line of the download arrow */}
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),

    // title — heading for the second feature card
    title: 'Instant Downloads',

    // desc — description for the second feature card
    desc:  'Download your certificates instantly in high-quality PDF format, anytime, anywhere. Multiple downloads supported with no restrictions.',
  },
  {
    // variant — "blue" applies a blue color theme to the icon background wrapper
    variant: 'blue',

    // icon — an inline SVG of a padlock (used for the "Data Privacy" card)
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        {/* Padlock body — a rounded rectangle for the lower part of the lock */}
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        {/* Padlock shackle — the curved U-shaped arc at the top of the lock */}
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),

    // title — heading for the third feature card
    title: 'Data Privacy',

    // desc — description for the third feature card
    desc:  'Your personal information and credentials are encrypted and stored securely. We follow strict data-protection standards to keep your data safe.',
  },
]

// Define and export the Features component — renders the "Why Choose Our Portal?" section
export default function Features() {
  return (
    // <section> semantic HTML element marks this as a self-contained content section
    // id="features" — allows the page to scroll here when scrollTo('features') is called from other components
    // "hp-features" — CSS class for section background color and vertical padding
    <section id="features" className="hp-features">

      {/* Centered content container — limits max-width and adds horizontal padding */}
      {/* "hp-container" — reusable CSS class used across sections for consistent centering */}
      <div className="hp-container">

        {/* Section heading block — contains the title and subtitle above the cards */}
        {/* "hp-section-head" — CSS class centers the text and adds bottom margin */}
        <div className="hp-section-head">
          {/* Section title — "hp-section-title" sets font size and weight; "hp-section-title-h3" modifies size for h3 */}
          <h3 className="hp-section-title hp-section-title-h3">Why Choose Our Portal?</h3>
          {/* Section subtitle — smaller muted text below the main title */}
          {/* "hp-section-subtitle" — CSS class for lighter font color and smaller size */}
          <p className="hp-section-subtitle">Secure, fast, and reliable certificate management</p>
        </div>

        {/* Cards grid — renders one card per item in the features array */}
        {/* "hp-features-grid" — CSS class sets up a 3-column responsive grid layout */}
        <div className="hp-features-grid">

          {/* Loop over the features array and render a card for each feature object */}
          {features.map((f) => (
            // Outer card wrapper — key={f.title} is required by React when rendering lists (must be unique)
            // "hp-feature-card" — CSS class for card background, border-radius, padding, and shadow
            <div key={f.title} className="hp-feature-card">

              {/* Icon + title row — sits side by side on mobile, stacked on desktop */}
              <div className="hp-feature-header">
                <div className={`hp-feature-icon-wrap ${f.variant}`}>
                  {f.icon}
                </div>
                <h3 className="hp-feature-title">{f.title}</h3>
              </div>

              {/* Card description paragraph — the explanation text below the title */}
              {/* "hp-feature-desc" — CSS class for muted color, font size, and line height */}
              <p className="hp-feature-desc">{f.desc}</p>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
