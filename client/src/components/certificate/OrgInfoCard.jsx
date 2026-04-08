// OrgInfoCard.jsx
// Displays the E&ICT Academy organisation description card.
// Static content — no props required.

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// OrgInfoCard — E&ICT Academy, IIT Kanpur description
// ─────────────────────────────────────────────────────────────
export default function OrgInfoCard() {
  return (
    <div className="cdp-card">
      {/* Header: icon + org name */}
      <div className="cdp-org-header">
        <div className="cdp-org-icon">
          <BuildingIcon />
        </div>
        <p className="cdp-org-name">E&amp;ICT Academy, IIT Kanpur</p>
      </div>

      {/* Description */}
      <p className="cdp-org-desc">
        The Electronics &amp; ICT (E&amp;ICT) Academy is a government-supported
        initiative aimed at improving the employability of graduates and diploma
        holders across various disciplines.
      </p>
    </div>
  )
}
