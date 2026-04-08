// ─────────────────────────────────────────────────────────────────────────────
// certificateRoutes.js
//
// All routes are mounted under /api/certificate in server.js.
// Every route here requires a valid JWT (enforced by the `protect` middleware).
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express')
const router   = express.Router()
const protect  = require('../middleware/authMiddleware')

const { sendCertificateByEmail } = require('../controllers/certificateController')

// POST /api/certificate/send-email
// Body: { email, pdfBase64, studentName, courseName, certificateId }
// Generates and sends an email with the certificate PDF attached.
router.post('/send-email', protect, sendCertificateByEmail)

module.exports = router
