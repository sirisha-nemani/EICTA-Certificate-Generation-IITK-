// ─────────────────────────────────────────────────────────────────────────────
// CertificatePdfPage.jsx
//
// Route: /certificate/pdf/:id
//
// A clean, distraction-free PDF-only viewer page.
// Renders: dark top bar (Back + Download) + the PDF iframe.
// No zoom controls, no sidebar — just the certificate PDF.
//
// Used when the user clicks "Download" on the certificate detail page.
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

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// CertificatePdfPage
// ─────────────────────────────────────────────────────────────
export default function CertificatePdfPage() {
  const navigate   = useNavigate()
  const { id }     = useParams()

  // Resolve credential from the shared data file (same as CertificatePage)
  const credential = getCredentialByIndex(id)

  // QR code data URL — undefined while generating, null on failure, string when ready
  const [qrDataUrl,  setQrDataUrl]  = useState(undefined)

  // Blob URL of the rendered PDF — used for the Download action
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

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

  // Download: trigger an anchor-click on the ready blob URL
  const handleDownload = () => {
    if (!pdfBlobUrl) return
    const a      = document.createElement('a')
    a.href       = pdfBlobUrl
    a.download   = `EICTA-Certificate-${credential.certificateId}.pdf`
    a.click()
  }

  return (
    <div className="cpdf-page">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="cpdf-topbar">
        <button
          className="cpdf-back-btn"
          onClick={() => navigate(`/certificate/${id}`)}
          aria-label="Back to Certificate"
        >
          <ArrowLeftIcon />
          <span>Back</span>
        </button>

        <span className="cpdf-title">Certificate PDF</span>

        <button
          className="cpdf-download-btn"
          onClick={handleDownload}
          disabled={!pdfBlobUrl}
          title={pdfBlobUrl ? 'Download PDF' : 'Generating PDF…'}
        >
          <DownloadIcon />
          <span>{pdfBlobUrl ? 'Download PDF' : 'Generating…'}</span>
        </button>
      </header>

      {/* ── PDF viewer area ───────────────────────────────────── */}
      <div className="cpdf-viewer-area">
        {/*
          Wait until QR is resolved (not undefined) before mounting CertificateViewer.
          This ensures the PDF is generated exactly once — with the QR code already in place.
        */}
        {qrDataUrl !== undefined ? (
          <CertificateViewer
            docProps={docProps}
            onBlobReady={setPdfBlobUrl}
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
  )
}
