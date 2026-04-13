// Import React and the useState hook — useState is used to track which accordion item is open
import React, { useState } from 'react'

// faqs — a static array of objects, each representing one FAQ question and its answer
// Each object has: q (question string) and a (answer string)
const faqs = [
  {
    // q — the question text shown in the accordion header button
    q: 'How do I access my certificate?',
    // a — the answer text shown when this accordion item is expanded
    a: 'Simply login using your registered email address. You\'ll receive an OTP for verification, and once verified, you can access your certificates from the dashboard. The entire process takes less than a minute.',
  },
  {
    q: 'What if I don\'t receive the OTP?',
    a: 'First, check your spam or junk mail folder. If the OTP is still not found, ensure you are using the exact email address you registered with during course enrollment. You can request a new OTP after 60 seconds. If the problem persists, contact us at support@eict.academy and we\'ll resolve it promptly.',
  },
  {
    q: 'Can I download my certificate multiple times?',
    a: 'Yes, absolutely! You can download your certificate as many times as you need. Simply log in to your account and head to the Downloads section of your dashboard. Your certificate will always be available for re-download at no extra charge.',
  },
  {
    q: 'What format are the certificates in?',
    a: 'Certificates are issued in high-quality PDF format, making them suitable for printing and digital sharing. Each certificate also contains a unique QR code and verification ID that can be used to confirm its authenticity instantly.',
  },
  {
    q: 'How do I verify the authenticity of my certificate?',
    a: 'Every certificate contains a unique QR code and verification ID. Simply scan the QR code with any camera app, or visit our verification portal and enter the certificate ID. The system will confirm the certificate\'s validity, including the holder\'s name, course details, and date of completion.',
  },
]

/* ChevronIcon — a small helper component that renders a downward-pointing chevron (>) SVG icon */
/* This is defined separately so it could be reused, but it is not used in the final render (the chevron SVG is inlined instead) */
function ChevronIcon() {
  return (
    // SVG element — 20x20 px, no fill, stroked with width 2.2
    // "hp-accordion-chevron" — CSS class that handles the rotation transform animation on open/close
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2"
         viewBox="0 0 24 24" className="hp-accordion-chevron">
      {/* Draws the V-shaped chevron pointing downward */}
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// Define and export the FAQ component — renders the accordion-style FAQ section
export default function FAQ() {

  // openIdx — tracks the index of the currently open accordion item (null means all are closed)
  // setOpenIdx — function to update openIdx when a user clicks an accordion header
  // useState(null) initializes it to null, meaning no item is open by default
  const [openIdx, setOpenIdx] = useState(null)

  // toggle — called when the user clicks an accordion header button
  // "idx" is the index of the clicked item in the faqs array
  // If the clicked item is already open (prev === idx), close it by setting to null
  // If a different item is clicked, open it by setting openIdx to that idx
  const toggle = (idx) => setOpenIdx(prev => (prev === idx ? null : idx))

  return (
    // <section> semantic element marks this as its own content section on the page
    // id="faq" — anchor ID so the navbar and scrollTo function can scroll here
    // "hp-faq" — CSS class for section background, padding, and spacing
    <section id="faq" className="hp-faq">

      {/* Centered content container — constrains max-width and adds horizontal padding */}
      {/* "hp-container" — reusable layout class used across all page sections */}
      <div className="hp-container">

        {/* Section heading block — just the title (no subtitle for this section) */}
        {/* "hp-section-head" — CSS class centers text and adds bottom margin */}
        <div className="hp-section-head">
          {/* Section heading — displayed as an h2 (larger than the h3 used in other sections) */}
          {/* "hp-section-title" — CSS class for font size and weight */}
          <h2 className="hp-section-title">Frequently Asked Questions</h2>
        </div>

        {/* Accordion wrapper — contains all the FAQ accordion items */}
        {/* "hp-accordion-wrap" — CSS class for max-width, centering, and vertical gap between items */}
        <div className="hp-accordion-wrap">

          {/* Loop over the faqs array and render an accordion item for each question */}
          {faqs.map((item, idx) => {

            // isOpen — boolean that is true only when this item's index matches the open index
            const isOpen = openIdx === idx

            return (
              // Accordion item container — key={idx} is the React list key (index used since faqs are static)
              // Dynamically adds " hp-open" class when this item is expanded
              // "hp-accordion-item" — base CSS class for border, background, and rounded corners
              <div
                key={idx}
                className={`hp-accordion-item${isOpen ? ' hp-open' : ''}`}
              >

                {/* Accordion header — the clickable button row showing the question */}
                {/* "hp-accordion-header" — CSS class for flex layout (space-between), padding, and cursor */}
                {/* onClick calls toggle with this item's index to open or close it */}
                {/* aria-expanded tells screen readers whether this accordion is currently expanded */}
                <button
                  className="hp-accordion-header"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  {/* Question text displayed in the accordion header */}
                  {/* "hp-accordion-question" — CSS class for font weight and text color */}
                  <span className="hp-accordion-question">{item.q}</span>

                  {/* Chevron icon wrapper — rotates 180° when the item is open */}
                  {/* Dynamically adds "hp-open" class when open for additional CSS targeting */}
                  {/* inline style handles the rotation transform, transition animation, and color change */}
                  <span className={`hp-accordion-chevron${isOpen ? ' hp-open' : ''}`}
                        style={{ transition: 'transform 0.3s ease, color 0.2s ease',  // Smooth rotation and color transition
                                 transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', // Flips the chevron upward when open
                                 color: isOpen ? '#3B5BDB' : '#6c757d',                // Blue when open, grey when closed
                                 display: 'flex', alignItems: 'center', flexShrink: 0 }}>

                    {/* Simple filled downward arrow triangle */}
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M6 9L1 3h10z" fill="currentColor" />
                    </svg>
                  </span>
                </button>

                {/* Accordion body — the collapsible area that shows the answer */}
                {/* CSS on "hp-accordion-body" handles show/hide via max-height or display toggling */}
                <div className="hp-accordion-body">
                  {/* Answer paragraph — shown when the accordion item is open */}
                  {/* "hp-accordion-answer" — CSS class for font size, color, and padding */}
                  <p className="hp-accordion-answer">{item.a}</p>
                </div>

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}
