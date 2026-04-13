// ─────────────────────────────────────────────────────────────────────────────
// CertificatePdfPage.jsx
//
// Route: /certificate/pdf/:id
//
// A clean, distraction-free PDF-only viewer page.
// Renders: dark top bar (Back to Dashboard + Zoom Controls) + the PDF iframe.
// No download button here — download lives solely on the PDF detail page.
//
// Used when the user clicks "Preview" on the dashboard credential card.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams }       from 'react-router-dom'
import QRCode                           from 'qrcode'

import CertificateViewer                from '../components/certificate/CertificateViewer'
import { getCredentialByIndex }         from '../data/mockCredentials'

import '../styles/certificate-pdf.css'

// ── Icons ──────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8"  y1="11" x2="14"   y2="11" />
  </svg>
)

const ZoomInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8"  x2="11"   y2="14" />
    <line x1="8"  y1="11" x2="14"   y2="11" />
  </svg>
)

const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
)

// Discrete zoom steps; default is 1.00 (100%)
const ZOOM_STEPS   = [0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00]
const DEFAULT_ZOOM = 1.00

// ─────────────────────────────────────────────────────────────
// CertificatePdfPage
// ─────────────────────────────────────────────────────────────
export default function CertificatePdfPage() {
  const navigate   = useNavigate()
  const { id }     = useParams()

  // Resolve credential from the shared data file (same as CertificatePage)
  const credential = getCredentialByIndex(id)

  // QR code data URL — undefined while generating, null on failure, string when ready
  const [qrDataUrl, setQrDataUrl] = useState(undefined)

  // Zoom state — starts at 100%
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  // Public verification URL encoded into the certificate QR code
  const verifyUrl = `https://portal.eicta.iitk.ac.in/verify/${credential.id}`

  // Generate QR code once on mount (or whenever the credential changes)
  useEffect(() => {
    setQrDataUrl(undefined)
    QRCode.toDataURL(verifyUrl, { width: 128, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(()  => setQrDataUrl(null))   // proceed without QR on failure
  }, [verifyUrl])

  // Props forwarded to <CertificateDocument> inside CertificateViewer
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

  // ── Zoom helpers ──────────────────────────────────────────────
  const zoomIdx   = ZOOM_STEPS.findIndex(z => Math.abs(z - zoom) < 0.01)
  const canZoomOut = zoomIdx > 0
  const canZoomIn  = zoomIdx < ZOOM_STEPS.length - 1

  const doZoomOut = () => canZoomOut && setZoom(ZOOM_STEPS[zoomIdx - 1])
  const doZoomIn  = () => canZoomIn  && setZoom(ZOOM_STEPS[zoomIdx + 1])
  const doReset   = () => setZoom(DEFAULT_ZOOM)

  return (
    <div className="cpdf-page">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="cpdf-topbar">

        {/* Left — back to dashboard */}
        <button
          className="cpdf-back-btn"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to Dashboard"
        >
          <ArrowLeftIcon />
          <span>Back to Dashboard</span>
        </button>

        <span className="cpdf-title">Certificate Preview</span>

        {/* Right — zoom controls */}
        <div className="cpdf-zoom-bar">
          <button
            className="cpdf-zoom-btn"
            onClick={doZoomOut}
            disabled={!canZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOutIcon />
            <span>Zoom Out</span>
          </button>

          <span className="cpdf-zoom-level" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>

          <button
            className="cpdf-zoom-btn"
            onClick={doReset}
            title="Reset zoom to 100%"
            aria-label="Reset zoom"
          >
            <ResetIcon />
            <span>Reset</span>
          </button>

          <button
            className="cpdf-zoom-btn"
            onClick={doZoomIn}
            disabled={!canZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomInIcon />
            <span>Zoom In</span>
          </button>
        </div>

      </header>

      {/* ── PDF viewer area ───────────────────────────────────── */}
      <div className="cpdf-viewer-area">
        {/*
          CSS zoom applied to the content wrapper — this scales the entire
          viewer (including the iframe) proportionally and affects layout
          so the scroll-box sizes correctly at every zoom level.
        */}
        <div style={{ zoom: zoom, flexShrink: 0, width: '100%', maxWidth: 920 }}>
          {/*
            Wait until QR is resolved (not undefined) before mounting CertificateViewer.
            This ensures the PDF is generated exactly once — with the QR code already in place.
          */}
          {qrDataUrl !== undefined ? (
            <CertificateViewer
              docProps={docProps}
              onBlobReady={() => {}}
            />
          ) : (
            /* QR still generating — show the same loading UI that CertificateViewer would show */
            <div className="cdp-viewer-wrap">
              <div className="cdp-viewer-loading">
                <div className="cdp-spinner" />
                <span>Preparing certificate…</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
