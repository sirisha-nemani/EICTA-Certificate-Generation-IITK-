// ─────────────────────────────────────────────────────────────────────────────
// CertificatePage.jsx
//
// Route: /certificate/:id
//
// PREVIEW MODE — shows an HTML/CSS certificate preview with zoom controls.
// Clicking "Download" routes to /certificate/pdf/:id (clean PDF viewer).
// Clicking "Email" opens a modal to send the certificate as a PDF attachment.
// Clicking "Full Screen" (or pressing F) enters browser fullscreen on the viewer.
//
// Layout:
//   DESKTOP (≥1024 px): sticky top bar + two-column (preview left, sidebar right)
//                        + full-width Credential Details below
//   MOBILE (<768 px):   top bar + Email button + stacked sections
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useParams }                            from 'react-router-dom'
import QRCode                                                from 'qrcode'

import { useAuth }            from '../context/AuthContext'
import { getCredentialByIndex } from '../data/mockCredentials'

import CertificateView    from '../components/certificate/CertificateView'
import PreviewControls    from '../components/certificate/PreviewControls'
import CertificateSidebar from '../components/certificate/CertificateSidebar'
import CredentialDetails  from '../components/certificate/CredentialDetails'
import EmailModal         from '../components/certificate/EmailModal'

import '../styles/certificate.css'
import '../styles/certificate-page.css'

// Natural dimensions of <CertificateView> (matches the HTML/CSS certificate layout)
const CERT_W = 1050
const CERT_H = 743

// ── Inline SVG icons — no external dependency ─────────────────
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ExpandIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3"  x2="14" y2="10" />
    <line x1="3"  y1="21" x2="10" y2="14" />
  </svg>
)

const ShrinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3"  y2="21" />
    <line x1="21" y1="3"  x2="14" y2="10" />
  </svg>
)

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// CertificatePage
// ─────────────────────────────────────────────────────────────
export default function CertificatePage() {
  const navigate          = useNavigate()
  const { id }            = useParams()
  const { user }          = useAuth()

  // Resolve credential from shared mock data (0-based URL index)
  const credential = getCredentialByIndex(id)

  // ── State ─────────────────────────────────────────────────────
  // zoom: current preview scale factor (steps through ZOOM_STEPS in PreviewControls)
  const [zoom,           setZoom]           = useState(0.75)

  // showEmailModal: toggles the EmailModal overlay
  const [showEmailModal, setShowEmailModal] = useState(false)

  // isFullscreen: mirrors document.fullscreenElement so the button icon updates live
  const [isFullscreen,   setIsFullscreen]   = useState(false)

  // qrDataUrl: undefined = generating | null = failed | string = ready
  const [qrDataUrl,      setQrDataUrl]      = useState(undefined)

  // ── Refs ──────────────────────────────────────────────────────
  // viewerWrapRef: attached to the HTML preview container for Fullscreen API
  const viewerWrapRef = useRef(null)

  // ── Derived values ────────────────────────────────────────────
  const verifyUrl = `https://portal.eicta.iitk.ac.in/verify/${credential.id}`

  // Scaled pixel dimensions for the zoom scroll-box
  const scaledW = Math.round(zoom * CERT_W)
  const scaledH = Math.round(zoom * CERT_H)

  // ── Generate QR code once per credential ─────────────────────
  useEffect(() => {
    setQrDataUrl(undefined)
    QRCode.toDataURL(verifyUrl, { width: 128, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(()  => setQrDataUrl(null))
  }, [verifyUrl])

  // ── docProps for EmailModal → CertificateDocument ────────────
  // Memoised so the PDF is not regenerated on unrelated parent re-renders.
  const docProps = useMemo(() => ({
    studentName: credential.studentName,
    collegeName: credential.collegeName,
    courseName:  credential.course,
    startDate:   credential.fromDate,
    endDate:     credential.toDate,
    issueDate:   credential.issued,
    program:     credential.program,
    qrDataUrl,
  }), [credential, qrDataUrl])

  // ── Fullscreen API helpers ────────────────────────────────────
  const handleFullScreen = useCallback(() => {
    const el = viewerWrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      if (el.requestFullscreen)        el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    } else {
      if (document.exitFullscreen)        document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
  }, [])

  // Track fullscreen changes so the button icon stays in sync
  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange',       sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange',       sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  // F key toggles fullscreen (ignored if user is typing in an input/textarea)
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'f' && e.key !== 'F') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      handleFullScreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleFullScreen])

  // ── Actions ───────────────────────────────────────────────────
  // "Download" routes to the clean PDF page instead of directly downloading
  const handleDownload = () => navigate(`/certificate/pdf/${id}`)

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="cdp-page">

      {/* ══════════════════════════════════════════════════════════
          STICKY TOP BAR
          LEFT:  ← Back to Dashboard
          RIGHT: Download · Full Screen · Email  (desktop only)
      ═══════════════════════════════════════════════════════════ */}
      <header className="cdp-topbar">
        <button
          className="cdp-back-btn"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to Dashboard"
        >
          <ArrowLeftIcon />
          <span>Back to Dashboard</span>
        </button>

        {/* Desktop action buttons */}
        <div className="cdp-topbar-actions">
          <button
            className="cdp-action-btn"
            onClick={handleDownload}
            title="Download certificate PDF"
          >
            <DownloadIcon />
            Download
          </button>

          <button
            className="cdp-action-btn"
            onClick={handleFullScreen}
            title={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen (F)`}
          >
            {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
            {isFullscreen ? 'Exit' : 'Full Screen'}
          </button>

          <button
            className="cdp-action-btn"
            onClick={() => setShowEmailModal(true)}
            title="Email certificate"
          >
            <EmailIcon />
            Email
          </button>
        </div>
      </header>
      {/* ══ END TOP BAR ══ */}

      {/* ══════════════════════════════════════════════════════════
          SCROLLABLE CONTENT AREA
      ═══════════════════════════════════════════════════════════ */}
      <div className="cdp-content">

        {/* Mobile-only "Email Certificate" button — hidden on desktop */}
        <button
          className="cdp-mobile-email-btn"
          onClick={() => setShowEmailModal(true)}
          aria-label="Email Certificate"
        >
          <EmailIcon />
          Email Certificate
        </button>

        {/* ── Two-column main row ─────────────────────────────── */}
        <div className="cdp-main-row">

          {/* LEFT — HTML preview card */}
          <div className="cdp-left">
            <div className="cdp-cert-card">

              {/* Card header: title (left) + zoom controls (right) */}
              <div className="cdp-cert-card-header">
                <h2 className="cdp-cert-card-title">Certificate</h2>
                <PreviewControls zoom={zoom} onZoom={setZoom} />
              </div>

              {/*
                HTML viewer wrap — this element receives the Fullscreen API.
                cdp-preview-scroll handles overflow/scrolling at the current zoom level.
                The inner positioned div provides the exact scaled dimensions so the
                scroll-box knows how large the content is, while the absolute child
                applies the CSS transform (which doesn't affect layout by itself).
              */}
              <div className="cdp-html-viewer-wrap" ref={viewerWrapRef}>
                <div className="cdp-preview-scroll">
                  {/* Scroll-box sizing: zoom × natural cert size */}
                  <div style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
                    {/* Visual transform: scale from top-left origin */}
                    <div style={{
                      position:        'absolute',
                      top:             0,
                      left:            0,
                      transformOrigin: 'top left',
                      transform:       `scale(${zoom})`,
                      width:           CERT_W,
                      height:          CERT_H,
                    }}>
                      <CertificateView credential={credential} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* ── END LEFT ── */}

          {/* RIGHT — sidebar cards */}
          <div className="cdp-right">
            <CertificateSidebar credential={credential} shareUrl={verifyUrl} />
          </div>
          {/* ── END RIGHT ── */}

        </div>
        {/* ══ END MAIN ROW ══ */}

        {/* Full-width Credential Details grid */}
        <CredentialDetails credential={credential} />

      </div>
      {/* ══ END CONTENT ══ */}

      {/* ── Email Modal ─────────────────────────────────────────── */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        defaultEmail={user?.email || ''}
        docProps={docProps}
        credential={credential}
      />

    </div>
  )
}
