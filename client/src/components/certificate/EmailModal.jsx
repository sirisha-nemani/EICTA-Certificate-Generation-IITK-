// ─────────────────────────────────────────────────────────────────────────────
// EmailModal.jsx
//
// Modal popup for sending a certificate via email.
// Matches the design in the reference screenshots.
//
// Props:
//   isOpen       – boolean — whether the modal is visible
//   onClose      – fn — called when user clicks Cancel or backdrop
//   defaultEmail – string — pre-filled email (logged-in user's email)
//   docProps     – object — props forwarded to <CertificateDocument> (includes qrDataUrl)
//                  PDF is generated inside this modal on Send click (no pre-baked blob needed)
//   credential   – object — full credential record (for studentName, courseName, certificateId)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import api from '../../services/api'
import CertificateDocument from './CertificateDocument'
import '../../styles/email-modal.css'

// ── Icons ──────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6"  y1="6" x2="18" y2="18" />
  </svg>
)

// ─────────────────────────────────────────────────────────────
// EmailModal
// ─────────────────────────────────────────────────────────────
export default function EmailModal({ isOpen, onClose, defaultEmail = '', docProps, credential }) {
  const [email,  setEmail]  = useState(defaultEmail)
  const [status, setStatus] = useState('idle')   // 'idle' | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg] = useState('')
  const inputRef            = useRef(null)

  // Sync pre-filled email when prop changes (e.g. user logs in while modal is open)
  useEffect(() => { setEmail(defaultEmail) }, [defaultEmail])

  // Focus the input and reset state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setErrMsg('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Close on Escape key
  const handleClose = useCallback(() => {
    if (status === 'loading') return   // prevent closing while sending
    setStatus('idle')
    setErrMsg('')
    onClose()
  }, [status, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleClose])

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (status === 'loading') return

    // Basic client-side validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrMsg('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrMsg('')

    try {
      // Generate the certificate PDF on demand.
      // pdf() returns a PDF instance from @react-pdf/renderer.
      // toBlob() converts it to a Blob, which we then base64-encode.
      let pdfBase64 = null
      if (docProps) {
        const blob    = await pdf(<CertificateDocument {...docProps} />).toBlob()
        const dataUrl = await blobToBase64(blob)
        // Strip the "data:application/pdf;base64," prefix — backend needs raw base64
        pdfBase64 = dataUrl.split(',')[1]
      }

      await api.post('/certificate/send-email', {
        email,
        pdfBase64,
        studentName:   credential?.studentName   || 'Student',
        courseName:    credential?.course        || 'Certificate Course',
        certificateId: credential?.certificateId || 'N/A',
      })

      setStatus('success')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send email. Please try again.'
      setErrMsg(msg)
      setStatus('error')
    }
  }

  // Don't render anything when closed — keeps DOM clean
  if (!isOpen) return null

  return (
    // ── Backdrop — clicking it closes the modal ───────────────
    <div className="em-backdrop" onClick={handleClose} aria-modal="true" role="dialog"
      aria-labelledby="em-modal-title">

      {/* ── Modal box — stop backdrop click propagating into modal ── */}
      <div className="em-modal" onClick={e => e.stopPropagation()}>

        {/* Close × */}
        <button className="em-close-btn" onClick={handleClose} aria-label="Close">
          <XIcon />
        </button>

        {/* ── Success state ─────────────────────────────────── */}
        {status === 'success' ? (
          <div className="em-success">
            <div className="em-success-icon">✓</div>
            <p className="em-success-text">Certificate Sent!</p>
            <p className="em-success-sub">
              Check your inbox at <strong>{email}</strong>.<br />
              You can download the PDF directly from the email.
            </p>
            <button className="em-send-btn" onClick={handleClose} style={{ marginTop: 24 }}>
              Close
            </button>
          </div>

        ) : (
          <>
            {/* ── Header ── */}
            <h2 id="em-modal-title" className="em-title">Send Certificate via Email</h2>
            <p className="em-subtitle">
              Certificate will be sent to your registered email address.
              You can download the PDF from your inbox.
            </p>

            {/* ── Email input ── */}
            <label className="em-label" htmlFor="em-email-input">Email Address</label>
            <div className="em-input-wrap">
              <span className="em-input-icon"><MailIcon /></span>
              <input
                id="em-email-input"
                ref={inputRef}
                className="em-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrMsg('') }}
                placeholder="you@example.com"
                disabled={status === 'loading'}
                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                autoComplete="email"
              />
            </div>

            {/* Error feedback */}
            {errMsg && <p className="em-error" role="alert">{errMsg}</p>}

            {/* ── Send button ── */}
            <button
              className="em-send-btn"
              onClick={handleSend}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? <><span className="em-btn-spinner" /> Sending…</>
                : 'Send'
              }
            </button>

            {/* ── Cancel link ── */}
            <button
              className="em-cancel-btn"
              onClick={handleClose}
              disabled={status === 'loading'}
            >
              Cancel
            </button>
          </>
        )}

      </div>
    </div>
  )
}

// ── Helper: Blob → base64 data URL string ─────────────────────
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader  = new FileReader()
    reader.onload  = () => resolve(reader.result)  // "data:application/pdf;base64,..."
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
