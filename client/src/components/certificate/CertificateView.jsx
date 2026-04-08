// ─────────────────────────────────────────────────────────────────────────────
// CertificateView.jsx
//
// HTML/CSS version of the EICTA certificate — used for the on-screen
// zoom-able preview inside CertificatePreview.jsx.
//
// Layout: Landscape  1050 × 743 px  (A4-landscape proportions at 96 dpi)
// Matches the reference design exactly:
//   • 3-column logo row with vertical dividers
//   • Gold horizontal rule
//   • Gold "Certificate" italic title
//   • Centered body text with mixed font weights
//   • QR code bottom-left, signature block bottom-right
//   • Footer strip spanning full width
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'

// QRCodeSVG renders an inline SVG QR code – no network request needed.
import { QRCodeSVG } from 'qrcode.react'

// ── Logo assets ───────────────────────────────────────────────────────────────
// LEFT  — Indian national government emblem
import indianEmblem from '../../assets/Indian-emblem.png'
// CENTER — IIT Kanpur circular crest / seal
import iitkLogo     from '../../assets/iitk logo.png'
// RIGHT  — EICTA / TAG consortium circular logo
import tagLogo      from '../../assets/tag-logo.png'

// ─────────────────────────────────────────────────────────────────────────────
// CertificateView
//
// Props:
//   credential — object from MOCK_CREDENTIALS (or real API later):
//     { id, program, course, issued, fromDate, toDate }
// ─────────────────────────────────────────────────────────────────────────────
export default function CertificateView({ credential }) {

  // ── Data bindings ──────────────────────────────────────────────────────────
  // These will be replaced by real user/API data in a future sprint.
  const recipientName = 'Student Name'
  const college       = 'College Name'
  const program       = credential?.program  || 'Faculty Development Program'
  const course        = credential?.course   || 'Course Name'
  const issued        = credential?.issued   || '02-02-2026'
  const fromDate      = credential?.fromDate || '01-01-2026'
  const toDate        = credential?.toDate   || '31-01-2026'

  // URL encoded into the QR code — the public certificate verification page.
  const verifyUrl = `https://portal.eicta.iitk.ac.in/verify/${credential?.id ?? '001'}`

  return (
    // ── Outermost certificate paper ─────────────────────────────────────────
    // cp-cert: 1050 × 743 px white rectangle, flex column, landscape A4 ratio.
    <div className="cp-cert">

      {/* Gold decorative border: 1.5px gold line inset 10px from each edge */}
      <div className="cp-cert-border" />

      {/* ── All content sits inside this padded inner wrapper ── */}
      <div className="cp-cert-inner">

        {/* ════════════════════════════════════════════════════
            LOGO ROW
            Three sections separated by thin vertical dividers.
            LEFT  : Indian emblem  +  MeitY ministry text
            CENTER: IIT Kanpur circular logo
            RIGHT : EICTA/TAG logo
            ════════════════════════════════════════════════════ */}
        <div className="cp-cert-logos">

          {/* ── LEFT: Indian emblem + MeitY text ── */}
          <div className="cp-logo-left">
            {/* Indian national emblem (circular lion-pillar crest) */}
            <img src={indianEmblem} alt="Indian Emblem" className="cp-logo-emblem" />
            {/* Ministry name block: Hindi script + English bold uppercase */}
            <div className="cp-meity-block">
              {/* Hindi text — small, italic, lighter weight */}
              <p className="cp-meity-hindi">
                इलेक्ट्रॉनिकी एवं<br />
                सूचना प्रौद्योगिकी मंत्रालय
              </p>
              {/* English text — bold, uppercase, slightly larger */}
              <p className="cp-meity-english">
                MINISTRY OF<br />
                ELECTRONICS AND<br />
                INFORMATION TECHNOLOGY
              </p>
            </div>
          </div>

          {/* ── Vertical divider between LEFT and CENTER ── */}
          <div className="cp-logo-divider" />

          {/* ── CENTER: IIT Kanpur circular crest ── */}
          <div className="cp-logo-center">
            <img src={iitkLogo} alt="IIT Kanpur" className="cp-logo-iitk" />
          </div>

          {/* ── Vertical divider between CENTER and RIGHT ── */}
          <div className="cp-logo-divider" />

          {/* ── RIGHT: EICTA TAG logo ── */}
          <div className="cp-logo-right">
            {/* EICTA / TAG consortium circular logo */}
            <img src={tagLogo} alt="EICTA Consortium" className="cp-logo-tag" />
          </div>

        </div>
        {/* ══ END LOGO ROW ══ */}

        {/* ════════════════════════════════════════════════════
            TITLE SECTION — centered
            ════════════════════════════════════════════════════ */}

        {/* "EICTA Consortium" — gold, bold, ~19px */}
        <p className="cp-cert-consortium">EICTA Consortium</p>

        {/* Subtitle in parentheses — smaller, grey */}
        <p className="cp-cert-consortium-sub">
          (A Joint Initiative of MeitY and IITs, NITs and IIITs)
        </p>

        {/* "Certificate" — the centrepiece heading.
            Large, italic, serif (Times New Roman), gold. */}
        <p className="cp-cert-title">Certificate</p>

        {/* ════════════════════════════════════════════════════
            BODY TEXT BLOCK — all centered, Times New Roman
            Line structure matches reference image exactly:
              1. "This is to certify that"
              2. "Dr. / Mr. / Ms. [Name] of"       ← "of" on same line
              3. "[College Name]"
              4. "has completed the [Program] on"
              5. "[Course Name]"
              6. "from [date] to [date]"
            ════════════════════════════════════════════════════ */}
        <div className="cp-cert-body">

          {/* Line 1 — preamble */}
          <p>This is to certify that</p>

          {/* Line 2 — recipient + "of" on the same line (matches reference image) */}
          <p className="cp-recipient">
            Dr. / Mr. / Ms.&nbsp;<strong>{recipientName}</strong>&nbsp;of
          </p>

          {/* Line 3 — college / institution name, bold */}
          <p className="cp-college">
            <strong>{college}</strong>
          </p>

          {/* Line 4 — program completion line; program name is bold inline */}
          <p>
            has completed the&nbsp;<strong>{program}</strong>&nbsp;on
          </p>

          {/* Line 5 — course name, bold, slightly larger via CSS */}
          <p className="cp-course">
            <strong>{course}</strong>
          </p>

          {/* Line 6 — date range */}
          <p>from {fromDate} to {toDate}</p>

        </div>
        {/* ══ END BODY TEXT ══ */}

        {/* ════════════════════════════════════════════════════
            BOTTOM ROW
            LEFT:  QR code + "Date of Issue" label
            RIGHT: Signature line + professor name + role
            Both blocks sit on the same bottom baseline.
            ════════════════════════════════════════════════════ */}
        <div className="cp-cert-bottom">

          {/* QR code block (bottom-left) */}
          <div className="cp-cert-qr-block">
            {/* Inline SVG QR code encoding the verification URL.
                size=80  → 80×80 px square
                level="M" → medium error-correction (up to ~15% damage recovery)
                includeMargin=false → no extra white padding (CSS handles spacing) */}
            <QRCodeSVG
              value={verifyUrl}
              size={80}
              level="M"
              includeMargin={false}
            />
            {/* Issue date label directly below the QR code */}
            <p className="cp-cert-issue-date">Date of Issue: {issued}</p>
          </div>

          {/* Signature block (bottom-right) */}
          <div className="cp-cert-sig-block">
            {/* Decorative horizontal line above the name = signature space */}
            <div className="cp-cert-sig-line" />
            {/* Professor's name — bold */}
            <p className="cp-cert-prof">Prof. B. V. Phani</p>
            {/* Role / title — smaller, blue */}
            {/* &amp; renders a literal & in HTML */}
            <p className="cp-cert-prof-role">
              Chief Investigator, E&amp;ICT Academy, IIT Kanpur
            </p>
          </div>

        </div>
        {/* ══ END BOTTOM ROW ══ */}

      </div>
      {/* ══ END INNER CONTENT ══ */}

      {/* ── Footer strip: full-width light-grey band at page bottom ── */}
      <div className="cp-cert-footer-strip">
        EICT Academies: IIT Kanpur, IIT Guwahati, IIT Roorkee, MNIT Jaipur,
        IIITDM Jabalpur, NIT Patna, NIT Warangal
      </div>

    </div>
  )
}
