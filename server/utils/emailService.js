// Import the nodemailer library, which handles connecting to an SMTP server and sending emails
const nodemailer = require('nodemailer')

// Create a reusable "transporter" object that holds the SMTP connection settings
// All emails sent by this application will go through this transporter
const transporter = nodemailer.createTransport({
  // The hostname of the SMTP server to connect to — defaults to Gmail's SMTP server
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',

  // The port number to use when connecting to the SMTP server — 587 is the standard for STARTTLS
  port:   parseInt(process.env.EMAIL_PORT) || 587,

  // Use 'false' here because port 587 uses STARTTLS (upgrades to encrypted after connecting),
  // not SSL from the start (which would require 'true' and port 465)
  secure: false,

  // Authentication credentials for the email account that will send the messages
  auth: {
    // The email address / username used to log in to the SMTP server
    user: process.env.EMAIL_USER,
    // The password (or app-specific password for Gmail) used to authenticate
    pass: process.env.EMAIL_PASS,
  },
})

// sendPasswordResetEmail: sends a branded HTML email containing a password reset button
// Parameters:
//   toEmail  — the recipient's email address
//   resetUrl — the full URL the user clicks to reset their password
//   userName — the user's display name, used to personalise the greeting
async function sendPasswordResetEmail(toEmail, resetUrl, userName) {
  // Use the transporter to send the email — await ensures we wait for it to complete
  await transporter.sendMail({
    // The "From" address shown in the recipient's email client
    from:    `"AuthApp" <${process.env.EMAIL_USER}>`,

    // The recipient's email address
    to:      toEmail,

    // The subject line of the email
    subject: 'Reset your password',

    // The HTML body of the email — uses inline styles for maximum email client compatibility
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#1d1d1d;color:#fff;border-radius:12px;overflow:hidden;">
        <!-- Header section with a purple gradient background and the email title -->
        <div style="background:linear-gradient(135deg,#6c63ff,#5a52e0);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">Reset Your Password</h1>
        </div>
        <!-- Body section with the personalised message and reset button -->
        <div style="padding:32px;">
          <!-- Greeting using the user's name -->
          <p>Hi ${userName},</p>
          <!-- Explanation of why the email was sent -->
          <p style="color:#a0a0a0;">We received a request to reset your password. Click the button below to choose a new one.</p>
          <!-- Centred call-to-action button that links to the reset URL -->
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#6c63ff,#5a52e0);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Reset Password
            </a>
          </div>
          <!-- Small-print note about the link expiry and what to do if this was unexpected -->
          <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  })
}

// ── OTP Email ────────────────────────────────────────────────
// sendOTPEmail: sends a branded HTML email displaying a 6-digit one-time password
// Parameters:
//   toEmail  — the recipient's email address
//   otpCode  — the 6-digit OTP code to display in the email
//   userName — the user's display name, used to personalise the greeting
async function sendOTPEmail(toEmail, otpCode, userName) {
  // Use the transporter to send the email — await ensures we wait for it to complete
  await transporter.sendMail({
    // The "From" address shown in the recipient's email client — branded as the IFACET portal
    from:    `"IFACET – Digital Credentials Portal" <${process.env.EMAIL_USER}>`,

    // The recipient's email address
    to:      toEmail,

    // The subject line includes the OTP code so the user can see it without opening the email
    subject: `Your OTP is ${otpCode} – IFACET Portal`,

    // The HTML body of the email — a clean, professional design with the OTP prominently displayed
    html: `
      <div style="font-family:Inter,-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e9ecef;border-radius:16px;overflow:hidden;">

        <!-- Header: blue gradient background with the IFACET branding and email title -->
        <div style="background:linear-gradient(135deg,#3B5BDB,#5C7CFA);padding:32px 40px;text-align:center;">
          <!-- Small uppercase brand name label -->
          <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:2px;font-weight:600;">IFACET</p>
          <!-- Main heading of the email -->
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff;">Your One-Time Password</h1>
        </div>

        <!-- Body: personalised greeting and instructions for the user -->
        <div style="padding:36px 40px;">
          <!-- Personalised greeting using the user's name -->
          <p style="color:#495057;margin:0 0 20px;">Hi <strong>${userName}</strong>,</p>

          <!-- Explanation message telling the user what the OTP is for and how long it lasts -->
          <p style="color:#6c757d;margin:0 0 28px;line-height:1.6;">
            Use the OTP below to sign in to your <strong>E&ICT Academy Digital Credentials Portal</strong>.
            This code is valid for <strong>10 minutes</strong>.
          </p>

          <!-- OTP Box: a highlighted box displaying the actual 6-digit code in large, monospace font -->
          <div style="background:#eef2ff;border:2px dashed #c5d0fa;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <!-- Label above the code -->
            <p style="margin:0 0 6px;font-size:12px;color:#6c757d;letter-spacing:1px;text-transform:uppercase;">Your OTP</p>
            <!-- The OTP code itself — large font, wide letter-spacing, monospace for clarity -->
            <p style="margin:0;font-size:40px;font-weight:800;color:#3B5BDB;letter-spacing:12px;font-family:'Courier New',monospace;">
              ${otpCode}
            </p>
          </div>

          <!-- Security notice reminding the user not to share their OTP -->
          <p style="color:#adb5bd;font-size:13px;margin:0;line-height:1.6;">
            If you did not request this OTP, please ignore this email.
            Never share your OTP with anyone.
          </p>
        </div>

        <!-- Footer: light grey bar with a copyright notice -->
        <div style="background:#f8f9fa;border-top:1px solid #e9ecef;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#adb5bd;">© 2026 E&ICT Academy. All rights reserved.</p>
        </div>
      </div>
    `,
  })
}

// ── Certificate Email ─────────────────────────────────────────
// sendCertificateEmail: sends the certificate PDF as an email attachment.
// Parameters:
//   toEmail       — recipient's email address
//   pdfBase64     — base64-encoded PDF file (generated client-side)
//   studentName   — shown in the greeting
//   courseName    — shown in subject line and body
//   certificateId — used as the attachment filename
async function sendCertificateEmail({ toEmail, pdfBase64, studentName, courseName, certificateId }) {
  await transporter.sendMail({
    from:    `"E&ICT Academy – Digital Credentials" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `Your EICTA Certificate — ${courseName}`,
    html: `
      <div style="font-family:Inter,-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e9ecef;border-radius:16px;overflow:hidden;">

        <div style="background:linear-gradient(135deg,#3B5BDB,#5C7CFA);padding:32px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:2px;font-weight:600;text-transform:uppercase;">E&amp;ICT Academy · IIT Kanpur</p>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">Your Certificate is Ready</h1>
        </div>

        <div style="padding:36px 40px;">
          <p style="color:#495057;margin:0 0 16px;">Dear <strong>${studentName}</strong>,</p>
          <p style="color:#6c757d;margin:0 0 24px;line-height:1.65;">
            Congratulations! Your certificate for <strong>${courseName}</strong> has been issued by
            the <strong>E&amp;ICT Academy, IIT Kanpur</strong>. Please find the certificate attached
            to this email as a PDF. You can download and save it for your records.
          </p>
          <p style="color:#adb5bd;font-size:13px;margin:0;line-height:1.6;">
            Certificate ID: <strong>${certificateId}</strong>
          </p>
        </div>

        <div style="background:#f8f9fa;border-top:1px solid #e9ecef;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#adb5bd;">© 2026 E&amp;ICT Academy. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        // The PDF filename shown in the email client
        filename:    `EICTA-Certificate-${certificateId}.pdf`,
        // Decode the base64 string back into raw bytes for the attachment
        content:     Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      },
    ],
  })
}

// Export all email functions so they can be imported where needed
module.exports = { sendPasswordResetEmail, sendOTPEmail, sendCertificateEmail }
