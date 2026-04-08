// CertificateSidebar.jsx
// Composes the four right-panel cards in order:
//   1. IssuanceCard    — issuing authority + timestamp
//   2. OrgInfoCard     — E&ICT Academy description
//   3. VerifiedCard    — green verified badge
//   4. ShareCard       — social share buttons
//
// Props:
//   credential – full credential object
//   shareUrl   – verification URL for share links

import IssuanceCard   from './IssuanceCard'
import OrgInfoCard    from './OrgInfoCard'
import VerifiedCard   from './VerifiedCard'
import ShareCard      from './ShareCard'

// ─────────────────────────────────────────────────────────────
// CertificateSidebar
// ─────────────────────────────────────────────────────────────
export default function CertificateSidebar({ credential, shareUrl }) {
  return (
    <>
      <IssuanceCard
        authority={credential.issuingAuthority}
        timestamp={credential.issuanceTimestamp}
      />

      <OrgInfoCard />

      <VerifiedCard />

      <ShareCard
        shareUrl={shareUrl}
        courseName={credential.course}
      />
    </>
  )
}
