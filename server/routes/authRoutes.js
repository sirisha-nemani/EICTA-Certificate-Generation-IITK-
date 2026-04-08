// Import Express so we can create a modular router for authentication endpoints
const express  = require('express')

// Create a new Router instance — this lets us define routes independently and mount them in server.js
const router   = express.Router()

// Import all the controller functions that contain the actual logic for each auth endpoint
const ctrl     = require('../controllers/authController')

// Import the authentication middleware that protects routes requiring a logged-in user
const protect  = require('../middleware/authMiddleware')

// ── OTP-based auth (new primary flow) ──
// Route: POST /api/auth/request-otp — accepts an email and sends a 6-digit OTP to that address
router.post('/request-otp',     ctrl.requestOTP)

// Route: POST /api/auth/verify-otp — accepts an email + OTP code and returns a JWT if they match
router.post('/verify-otp',      ctrl.verifyOTP)

// ── Legacy password-based auth ──
// Route: POST /api/auth/register — creates a new user account with name, email, and password
router.post('/register',        ctrl.register)

// Route: POST /api/auth/login — checks email/password credentials and returns a JWT on success
router.post('/login',           ctrl.login)

// Route: GET /api/auth/me — returns the currently logged-in user's profile (requires a valid JWT)
// 'protect' middleware runs first and verifies the JWT before the controller is called
router.get('/me',               protect, ctrl.getMe)

// Route: POST /api/auth/forgot-password — sends a password reset link to the provided email
router.post('/forgot-password', ctrl.forgotPassword)

// Route: POST /api/auth/reset-password — accepts a reset token and new password, updates the account
router.post('/reset-password',  ctrl.resetPassword)

// Export the router so it can be mounted in server.js under the /api/auth prefix
module.exports = router
