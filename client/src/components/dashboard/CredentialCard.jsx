// Import React — required to write JSX
import React from 'react'

// Import useNavigate from React Router — gives us a function to programmatically navigate to another page
import { useNavigate } from 'react-router-dom'

/* ── Icons ── */

// EyeIcon: an SVG icon that looks like an eye — used on the "Preview" button.
// It renders as an inline SVG so no external image file is needed.
const EyeIcon = () => (
  // SVG canvas: 15x15 pixels, no fill color, uses the parent element's text color for the stroke
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Outer eye shape — the curved path forming the eyelid outline */}
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    {/* Inner circle — the pupil/iris of the eye */}
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

// PdfIcon: an SVG icon that looks like a document with a folded corner — used on the "PDF" button.
const PdfIcon = () => (
  // SVG canvas: 14x14 pixels, no fill, uses parent text color for the stroke
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    {/* Document outline — a rectangle with a folded top-right corner */}
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    {/* The folded corner tab at the top right of the document */}
    <polyline points="14 2 14 8 20 8"/>
    {/* Bottom horizontal line — simulates a line of text in the document */}
    <line x1="9" y1="15" x2="15" y2="15"/>
    {/* Shorter upper line — simulates another line of text (shorter, near the top) */}
    <line x1="9" y1="11" x2="11" y2="11"/>
  </svg>
)

/* ════════════════════════════════════════
   CredentialCard
   ════════════════════════════════════════ */

// CredentialCard is a single card component that displays the details of one credential/certificate.
// It receives two props:
//   - credential: an object containing the program, specialization, course, and issue date
//   - index: the position of this credential in the list (used to build the certificate URL)
export default function CredentialCard({ credential, index }) {
  // useNavigate returns a function we can call to navigate to a different page
  const navigate = useNavigate()

  // Destructure the individual fields out of the credential prop object for easy use below
  const { program, specialization, course, issued } = credential

  // Build a display title like "Credential 1", "Credential 2", etc.
  // index is 0-based, so we add 1 to make it human-readable (1-based)
  const title = `Credential ${index + 1}`

  // handlePreview: routes to the PDF viewer page (react-pdf iframe, clean viewer)
  const handlePreview = () => navigate(`/certificate/pdf/${index}`)

  // handlePDF: routes to the HTML zoom-preview page (zoom controls, email, fullscreen)
  const handlePDF = () => navigate(`/certificate/${index}`)

  return (
    // Card wrapper element — contains all the card's content, styled by db-card CSS class
    <div className="db-card">

      {/* ── Left: credential info ── */}
      {/* Left section of the card — displays all the text information about the credential */}
      <div className="db-card-content">

        {/* Card title — e.g. "Credential 1" or "Credential 2" */}
        <h3 className="db-card-title">{title}</h3>

        {/* Program and specialization line — e.g. "Faculty Development Program • Electronics" */}
        <p className="db-card-program">
          {program} {/* The name of the program, always shown */}
          {/* Only show the bullet and specialization if a specialization value exists */}
          {specialization && (
            <>
              {/* Bullet separator between program name and specialization */}
              <span>•</span>
              {specialization} {/* The specialization text, e.g. "Electronics" */}
            </>
          )}
        </p>

        {/* Meta information block — shows course name and issue date */}
        <div className="db-card-meta">
          {/* Course row — label in bold followed by the course name styled as a link */}
          <p className="db-card-meta-row">
            <b>Course:</b>{' '} {/* The {' '} adds a space between the label and the value */}
            {/* Course name — styled to look like a link (blue text) via the CSS class */}
            <span className="db-card-meta-link">{course}</span>
          </p>
          {/* Issued date row — label in bold followed by the plain date string */}
          <p className="db-card-meta-row">
            <b>Issued:</b>{' '} {/* Same space technique as the course row */}
            {issued} {/* The date the certificate was issued, e.g. "02/02/2025" */}
          </p>
        </div>

      </div>

      {/* ── Right: desktop action buttons ── */}
      {/* Button group shown only on desktop screens (hidden on mobile via CSS) */}
      <div className="db-card-actions">
        {/* Preview button — opens the certificate preview page when clicked */}
        <button className="db-btn-preview" onClick={handlePreview}>
          <EyeIcon /> {/* Eye SVG icon displayed before the button text */}
          Preview
        </button>
        {/* PDF button — navigates to the preview page where the user can download the PDF */}
        <button className="db-btn-pdf" onClick={handlePDF}>
          <PdfIcon /> {/* Document SVG icon displayed before the button text */}
          PDF
        </button>
      </div>

      {/* ── Mobile: single full-width button ── */}
      {/* A single "View Certificate" button shown only on mobile screens (hidden on desktop via CSS).
          It performs the same action as the desktop "Preview" button. */}
      <button className="db-btn-view-cert" onClick={handlePreview}>
        View Certificate
      </button>

    </div>
  )
}
