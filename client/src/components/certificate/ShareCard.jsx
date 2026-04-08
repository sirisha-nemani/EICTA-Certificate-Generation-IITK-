// ShareCard.jsx
// "Share this Achievement!" card with LinkedIn, X (Twitter), and Facebook buttons.
//
// Props:
//   shareUrl   – the public verification URL encoded into the share links
//   courseName – course title used as the shared text snippet

// ── SVG icons ────────────────────────────────────────────────
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5"  r="3" />
    <circle cx="6"  cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" />
  </svg>
)

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const TwitterIcon = () => (
  /* X / Twitter logo */
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// ShareCard
// ─────────────────────────────────────────────────────────────
export default function ShareCard({ shareUrl, courseName }) {
  const text = `I completed "${courseName}" — E&ICT Academy, IIT Kanpur!`
  const encodedUrl  = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(text)

  const openLinkedIn = () =>
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')

  const openTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank')

  const openFacebook = () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')

  return (
    <div className="cdp-card">
      {/* Header */}
      <div className="cdp-share-head">
        <ShareIcon />
        <h3 className="cdp-share-title">Share this Achievement!</h3>
      </div>

      <p className="cdp-share-sub">
        Share your certificate with your network and celebrate your accomplishment
      </p>

      {/* Share buttons */}
      <div className="cdp-share-btns">
        <button className="cdp-share-btn cdp-share-btn--linkedin" onClick={openLinkedIn}>
          <LinkedInIcon />
          Share on LinkedIn
        </button>

        <button className="cdp-share-btn cdp-share-btn--twitter" onClick={openTwitter}>
          <TwitterIcon />
          Share on X (Twitter)
        </button>

        <button className="cdp-share-btn cdp-share-btn--facebook" onClick={openFacebook}>
          <FacebookIcon />
          Share on Facebook
        </button>
      </div>
    </div>
  )
}
