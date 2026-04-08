// VerifiedCard.jsx
// Green checkmark "Verified" badge card.
// Static content — no props required.

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// VerifiedCard — shows the green verified status badge
// ─────────────────────────────────────────────────────────────
export default function VerifiedCard() {
  return (
    <div className="cdp-card">
      <div className="cdp-verified-inner">
        {/* Green circular checkmark */}
        <div className="cdp-verified-icon-wrap">
          <CheckIcon />
        </div>

        <p className="cdp-verified-title">Verified</p>
        <p className="cdp-verified-sub">
          This certificate has been verified and is authentic
        </p>
      </div>
    </div>
  )
}
