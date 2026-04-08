// ─────────────────────────────────────────────────────────────────────────────
// PreviewControls.jsx
//
// Reusable zoom-control bar for the HTML certificate preview.
// Renders: [Zoom Out] [75%] [Reset] [Zoom In]
//
// Props:
//   zoom       – current zoom factor, e.g. 0.75  (number)
//   onZoom     – callback(newZoom: number) when user changes zoom
// ─────────────────────────────────────────────────────────────────────────────

// Discrete zoom levels the user can step through
const ZOOM_STEPS   = [0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00]
const DEFAULT_ZOOM = 0.75

// ── Icons ─────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// PreviewControls
// ─────────────────────────────────────────────────────────────
export default function PreviewControls({ zoom, onZoom }) {
  // Find the current zoom's position in the steps array
  const idx = ZOOM_STEPS.findIndex(z => Math.abs(z - zoom) < 0.01)

  const canZoomOut = idx > 0
  const canZoomIn  = idx < ZOOM_STEPS.length - 1

  const doZoomOut = () => canZoomOut && onZoom(ZOOM_STEPS[idx - 1])
  const doZoomIn  = () => canZoomIn  && onZoom(ZOOM_STEPS[idx + 1])
  const doReset   = () => onZoom(DEFAULT_ZOOM)

  return (
    <div className="pc-bar">
      {/* Zoom Out */}
      <button
        className="pc-btn"
        onClick={doZoomOut}
        disabled={!canZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOutIcon />
        <span>Zoom Out</span>
      </button>

      {/* Current zoom level badge */}
      <span className="pc-level" aria-live="polite">
        {Math.round(zoom * 100)}%
      </span>

      {/* Reset to default */}
      <button
        className="pc-btn"
        onClick={doReset}
        title="Reset zoom to 75%"
        aria-label="Reset zoom"
      >
        <ResetIcon />
        <span>Reset</span>
      </button>

      {/* Zoom In */}
      <button
        className="pc-btn"
        onClick={doZoomIn}
        disabled={!canZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomInIcon />
        <span>Zoom In</span>
      </button>
    </div>
  )
}
