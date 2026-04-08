// CertificateViewer.jsx
//
// Renders the certificate PDF inside an <iframe> using a Blob URL.
// Uses pdf().toBlob() from @react-pdf/renderer — the SAME CertificateDocument
// component is used for both the preview iframe and the download file.
//
// Props:
//   docProps      – all props forwarded to <CertificateDocument>
//   onBlobReady   – callback(url: string) fired once the blob URL is ready
//                   (used by the parent to enable the Download button)
//   viewerWrapRef – ref forwarded to the outer div (for Fullscreen API)

import { useEffect, useRef, useState, useMemo } from 'react'
import { pdf } from '@react-pdf/renderer'
import CertificateDocument from './CertificateDocument'

// ─────────────────────────────────────────────────────────────
// CertificateViewer
// ─────────────────────────────────────────────────────────────
export default function CertificateViewer({ docProps, onBlobReady, viewerWrapRef }) {
  const [blobUrl, setBlobUrl]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const activeUrlRef            = useRef(null)  // tracks the current blob URL for cleanup

  // Memoize docProps so the effect only re-runs when content actually changes,
  // not on every parent render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableProps = useMemo(() => docProps, Object.values(docProps))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function generatePdf() {
      try {
        // Build a React element tree from CertificateDocument using the provided props.
        // pdf() accepts a React element (JSX) and produces a PDF instance.
        const docElement = <CertificateDocument {...stableProps} />
        const blob       = await pdf(docElement).toBlob()

        if (cancelled) return

        // Revoke the previous blob URL to prevent memory leaks
        if (activeUrlRef.current) {
          URL.revokeObjectURL(activeUrlRef.current)
        }

        const url = URL.createObjectURL(blob)
        activeUrlRef.current = url
        setBlobUrl(url)
        setLoading(false)

        // Notify parent so Download button can be enabled
        onBlobReady?.(url)
      } catch (err) {
        if (!cancelled) {
          console.error('[CertificateViewer] PDF generation failed:', err)
          setError('Could not generate certificate. Please refresh and try again.')
          setLoading(false)
        }
      }
    }

    generatePdf()

    // Cleanup: mark as cancelled and revoke blob URL on unmount or prop change
    return () => {
      cancelled = true
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current)
        activeUrlRef.current = null
      }
    }
  }, [stableProps])  // only re-runs when stableProps reference changes

  return (
    /* viewerWrapRef is passed from CertificatePage for Fullscreen API access */
    <div className="cdp-viewer-wrap" ref={viewerWrapRef}>

      {/* Loading state */}
      {loading && (
        <div className="cdp-viewer-loading">
          <div className="cdp-spinner" />
          <span>Generating certificate…</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="cdp-viewer-loading">
          <span style={{ color: '#FA5252' }}>{error}</span>
        </div>
      )}

      {/* PDF iframe — shown once the blob URL is ready */}
      {!loading && !error && blobUrl && (
        <iframe
          src={blobUrl}
          className="cdp-viewer-frame"
          title="Certificate Preview"
        />
      )}

    </div>
  )
}
