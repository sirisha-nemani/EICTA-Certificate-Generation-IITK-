// Import React — required to use JSX in this file
import React from 'react'

// steps — a static array of objects describing each step in the certificate retrieval process
// Each object has: number (display number), title (step name), and desc (explanation text)
const steps = [
  {
    // number — the step number displayed in the circle badge above the step
    number: '1',

    // title — the short label for this step
    title:  'Enter Email',

    // desc — the longer explanation of what the user does in this step
    desc:   'Provide your registered email address used during course enrollment with E&ICT Academy.',
  },
  {
    // number — step 2 badge
    number: '2',

    // title — step 2 short label
    title:  'Verify OTP',

    // desc — explanation of the OTP verification step
    desc:   'Enter the one-time password sent to your email for secure identity verification.',
  },
  {
    // number — step 3 badge
    number: '3',

    // title — step 3 short label
    title:  'Download',

    // desc — explanation of the final download step
    desc:   'Access your dashboard and download your verified certificates in high-quality PDF format.',
  },
]

// Define and export the HowItWorks component — renders the "How It Works" 3-step process section
export default function HowItWorks() {
  return (
    // <section> semantic HTML element marks this as an independent content section
    // id="how-it-works" — anchor ID allowing other elements to scroll here programmatically
    // "hp-how" — CSS class for background color, vertical padding, and section spacing
    <section id="how-it-works" className="hp-how">

      {/* Centered content container — limits max-width and applies horizontal padding */}
      {/* "hp-container" — reusable layout class shared across all sections */}
      <div className="hp-container">

        {/* Section heading block — title and subtitle above the steps */}
        {/* "hp-section-head" — CSS class centers the text and adds bottom margin */}
        <div className="hp-section-head">
          {/* Section title — displayed as an h3 element */}
          {/* "hp-section-title" and "hp-section-title-h3" together set font size and weight */}
          <h3 className="hp-section-title hp-section-title-h3">How It Works</h3>

          {/* Subtitle — smaller descriptive text below the main heading */}
          {/* "hp-section-subtitle" — CSS class for muted color and smaller font */}
          <p className="hp-section-subtitle">Get your certificate in three simple steps</p>
        </div>

        {/* Steps container — positions the step cards and the connector line */}
        {/* "hp-how-grid" — CSS class sets up the horizontal layout for the three steps */}
        <div className="hp-how-grid">

          {/* Decorative dashed horizontal line connecting the step circles visually */}
          {/* aria-hidden="true" hides this purely decorative element from screen readers */}
          {/* "hp-how-connector" — CSS class positions this line behind the step circles */}
          <div className="hp-how-connector" aria-hidden="true" />

          {/* Loop over the steps array and render a step card for each item */}
          {steps.map((step) => (
            // Step card wrapper — key={step.number} is required by React for list rendering (must be unique)
            // "hp-step" — CSS class for step card layout: flex column, centered alignment
            <div key={step.number} className="hp-step">

              {/* Numbered circle badge — shows the step number (1, 2, or 3) */}
              {/* "hp-step-circle" — CSS class makes this a round, filled, accent-colored circle */}
              <div className="hp-step-circle">{step.number}</div>

              {/* Step title — the short name for this step */}
              {/* "hp-step-title" — CSS class for font weight, size, and top/bottom margin */}
              <h3 className="hp-step-title">{step.title}</h3>

              {/* Step description — the explanatory paragraph below the title */}
              {/* "hp-step-desc" — CSS class for muted text color, font size, and centered alignment */}
              <p className="hp-step-desc">{step.desc}</p>

            </div>
          ))}

        </div>

      </div>
    </section>
  )
}
