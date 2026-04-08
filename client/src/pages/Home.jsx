// Import React — required for JSX to work in this file
import React from 'react'

// Import the Navbar component — displays the top navigation bar
import Navbar      from '../components/home/Navbar'

// Import the Hero component — displays the large banner/intro section at the top of the page
import Hero        from '../components/home/Hero'

// Import the Features component — shows the three feature cards (Secure Auth, Downloads, Privacy)
import Features    from '../components/home/Features'

// Import the HowItWorks component — shows the 3-step process section
import HowItWorks  from '../components/home/HowItWorks'

// Import the FAQ component — shows the accordion of frequently asked questions
import FAQ         from '../components/home/FAQ'

// Import the CTA component — shows the "Call To Action" banner prompting users to log in
import CTA         from '../components/home/CTA'

// Import the Footer component — shows the bottom section with links and contact info
import Footer      from '../components/home/Footer'

// Import the CSS file that styles all home page components
import '../styles/home.css'

// Define and export the Home page component — this is the main landing page of the app
export default function Home() {
  return (
    // Outer wrapper div for the entire home page — "hp-page" applies page-level layout styles
    <div className="hp-page">

      {/* Render the top navigation bar */}
      <Navbar />

      {/* Render the hero/banner section */}
      <Hero />

      {/* Render the features section */}
      <Features />

      {/* Render the "How It Works" step-by-step section */}
      <HowItWorks />

      {/* Render the FAQ accordion section */}
      <FAQ />

      {/* Render the call-to-action banner */}
      <CTA />

      {/* Render the footer at the bottom of the page */}
      <Footer />

    </div>
  )
}
