// IssuanceCard.jsx
// Displays "Issuance Details": issuing authority + timestamp.
// Used inside CertificateSidebar on the certificate detail page.

// ── SVG icons (inline, no icon library needed) ───────────────
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// IssuanceCard
//
// Props:
//   authority  – string, e.g. "E&ICT Academy, IIT Kanpur"
//   timestamp  – string, e.g. "Sunday, February 2, 2025 at 05:30:00 AM"
// ─────────────────────────────────────────────────────────────
export default function IssuanceCard({ authority, timestamp }) {
  return (
    <div className="cdp-card">
      <h3 className="cdp-issuance-title">Issuance Details</h3>

      {/* Issuing authority row */}
      <div className="cdp-issuance-row">
        <div className="cdp-issuance-icon">
          <BuildingIcon />
        </div>
        <div>
          <p className="cdp-issuance-label">Issuing Authority</p>
          <p className="cdp-issuance-value">{authority}</p>
        </div>
      </div>

      {/* Timestamp row */}
      <div className="cdp-issuance-row">
        <div className="cdp-issuance-icon">
          <CalendarIcon />
        </div>
        <div>
          <p className="cdp-issuance-label">Issuance Timestamp</p>
          <p className="cdp-issuance-value">{timestamp}</p>
        </div>
      </div>
    </div>
  )
}
