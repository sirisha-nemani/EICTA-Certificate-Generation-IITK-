// ─────────────────────────────────────────────────────────────────────────────
// certificateController.js
//
// Handles certificate-related API actions:
//   POST /api/certificate/send-email  — sends the certificate PDF via email
//
// The PDF is generated client-side (using @react-pdf/renderer) and sent here
// as a base64 string.  The server converts it back to bytes and attaches it
// to the outgoing email via nodemailer.
// ─────────────────────────────────────────────────────────────────────────────

const { sendCertificateEmail } = require('../utils/emailService')

// ─────────────────────────────────────────────────────────────────────────────
// sendCertificateByEmail
//
// POST /api/certificate/send-email
// Protected — requires a valid JWT (enforced by the protect middleware in routes).
//
// Expected request body:
//   email         {string}  — recipient email address
//   pdfBase64     {string}  — base64-encoded certificate PDF
//   studentName   {string}  — used in the email greeting
//   courseName    {string}  — used in the email subject and body
//   certificateId {string}  — used as the attachment filename
// ─────────────────────────────────────────────────────────────────────────────
exports.sendCertificateByEmail = async (req, res) => {
  try {
    const { email, pdfBase64, studentName, courseName, certificateId } = req.body

    // Validate required fields
    if (!email || !pdfBase64) {
      return res.status(400).json({
        success: false,
        message: 'Email address and certificate PDF are required.',
      })
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    // Sanity-check the PDF payload (base64 strings are always longer than ~100 chars)
    if (pdfBase64.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Certificate PDF data appears to be invalid.',
      })
    }

    await sendCertificateEmail({
      toEmail:       email,
      pdfBase64,
      studentName:   studentName   || 'Student',
      courseName:    courseName    || 'Certificate Course',
      certificateId: certificateId || 'N/A',
    })

    res.json({ success: true, message: 'Certificate sent successfully.' })

  } catch (err) {
    console.error('[sendCertificateByEmail]', err.message)
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please check your connection and try again.',
    })
  }
}
