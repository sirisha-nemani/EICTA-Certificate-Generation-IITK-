// Import bcryptjs for hashing passwords and comparing a plain-text password against a stored hash
const bcrypt   = require('bcryptjs')

// Import jsonwebtoken for creating and verifying JWT tokens used to authenticate users
const jwt      = require('jsonwebtoken')

// Import the v4 variant of the uuid library to generate random unique tokens (used for password reset links)
const { v4: uuidv4 } = require('uuid')

// Import the User model which provides all the database query functions for the users table
const User     = require('../models/User')

// Import the email-sending utility functions for OTP emails and password reset emails
const { sendPasswordResetEmail, sendOTPEmail } = require('../utils/emailService')

// Helper function: creates a signed JWT containing the user's database ID
// This token is sent to the client and must be included in future requests to prove identity
function signToken(userId) {
  return jwt.sign(
    { id: userId },                           // The payload stored inside the token — just the user's ID
    process.env.JWT_SECRET,                    // The secret key used to sign the token — must be kept private
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Token expires in 7 days by default, or as set in .env
    }
  )
}

// Helper function: generates a random 6-digit number as a string, e.g. "482917"
// Used as the one-time password (OTP) sent to the user's email
function generateOTP() {
  // Math.random() gives 0–0.999..., multiplying by 900000 and adding 100000 guarantees a 6-digit result
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ─────────────────────────────────────────────
// POST /api/auth/request-otp
// ─────────────────────────────────────────────
// Controller: handles a request to send an OTP to the given email address
exports.requestOTP = async (req, res) => {
  try {
    // Destructure the email field from the incoming request body
    const { email } = req.body

    // Validate that an email was provided and that it matches a basic email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      // Return a 400 Bad Request response if the email is missing or invalid
      return res.status(400).json({ message: 'A valid email address is required' })
    }

    // Auto-register the email if it doesn't exist yet — everyone can log in
    // This creates a new user row automatically if the email has never been seen before
    const user = await User.findOrCreate(email)

    // Generate a fresh 6-digit OTP code for this login attempt
    const otp    = generateOTP()

    // Calculate the expiry time: current time + 10 minutes (in milliseconds)
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save the OTP code and its expiry timestamp to the user's row in the database
    await User.setOTP(user.id, otp, expiry)

    // ── Send real email if configured, otherwise print to console ──
    // Check whether email credentials are properly configured in .env
    const emailConfigured =
      process.env.EMAIL_USER &&                                    // EMAIL_USER must be set
      process.env.EMAIL_PASS &&                                    // EMAIL_PASS must be set
      !process.env.EMAIL_USER.includes('your_gmail')               // Must not be the placeholder value

    if (emailConfigured) {
      // Email credentials are set — send the OTP to the user's inbox via the email service
      await sendOTPEmail(user.email, otp, user.name || user.email)
      // Log a success message so the developer knows the email was dispatched
      console.log(`✅  OTP emailed to ${user.email}`)
    } else {
      // DEV FALLBACK — print to terminal until email credentials are set
      // This makes it easy to test the flow locally without a real email account
      console.log(`\n${'─'.repeat(40)}`)
      console.log(`📧  OTP for ${user.email}`)
      console.log(`🔑  Code : ${otp}`)                            // Print the actual OTP to the terminal
      console.log(`⏰  Valid for 10 minutes`)
      console.log(`⚠️  Set EMAIL_USER & EMAIL_PASS in .env to send real emails`)
      console.log(`${'─'.repeat(40)}\n`)
    }

    // Respond to the client with a success message — don't include the OTP in the response for security
    res.json({ message: 'OTP sent successfully. Please check your inbox.' })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Request OTP error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error while sending OTP' })
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────
// Controller: verifies the OTP entered by the user and issues a JWT if it is correct
exports.verifyOTP = async (req, res) => {
  try {
    // Destructure both the email and the OTP code from the request body
    const { email, otp } = req.body

    // Check that both fields were provided — both are required to verify
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    // Validate that the OTP is exactly 6 digits and contains only numbers
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be a 6-digit number' })
    }

    // Look up a user in the database whose email AND otp_code match, and whose otp_expiry hasn't passed
    const user = await User.findByEmailAndOTP(email, otp)

    // If no matching user was found, the OTP is wrong or has expired
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' })
    }

    // Clear OTP after successful use — prevents the same OTP from being used again
    await User.clearOTP(user.id)

    // Generate a signed JWT for the verified user so they can access protected routes
    const token    = signToken(user.id)

    // Fetch the user's profile data (without sensitive fields like the raw OTP) to return to the client
    const safeUser = await User.findById(user.id)

    // Return a success response with the JWT and the user's profile data
    res.json({ message: 'Login successful', token, user: safeUser })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Verify OTP error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error while verifying OTP' })
  }
}

// POST /api/auth/register
// Controller: creates a new user account with a name, email, and password
exports.register = async (req, res) => {
  try {
    // Destructure the name, email, and password fields from the request body
    const { name, email, password } = req.body

    // Validate that all three required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    // Enforce a minimum password length of 8 characters for basic security
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Check if an account with this email address already exists in the database
    const existing = await User.findByEmail(email)

    // If a user with that email was found, reject the registration with a 409 Conflict error
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    // Hash the plain-text password using bcrypt with a salt round of 12 (higher = more secure but slower)
    const hashed = await bcrypt.hash(password, 12)

    // Insert the new user into the database and get back the newly created user's ID
    const userId = await User.create({ name, email, password: hashed })

    // Fetch the newly created user's full profile to include in the response
    const user   = await User.findById(userId)

    // Generate a JWT for the new user so they are immediately logged in after registering
    const token  = signToken(userId)

    // Return a 201 Created response with the JWT and the new user's profile
    res.status(201).json({ message: 'Account created successfully', token, user })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Register error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// POST /api/auth/login
// Controller: verifies email/password credentials and returns a JWT on success
exports.login = async (req, res) => {
  try {
    // Destructure the email and password from the request body
    const { email, password } = req.body

    // Validate that both email and password were provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Look up the user by their email address — this query returns the hashed password too
    const user = await User.findByEmail(email)

    // If no user exists with that email, return a 401 Unauthorized — use a generic message to
    // avoid telling attackers which emails are registered (security best practice)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare the submitted plain-text password against the bcrypt hash stored in the database
    const match = await bcrypt.compare(password, user.password)

    // If the password does not match, return a 401 Unauthorized with the same generic message
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Password matched — generate a JWT for this user
    const token  = signToken(user.id)

    // Fetch the user's safe profile (no password, no OTP fields) to return to the client
    const safeUser = await User.findById(user.id)

    // Return the JWT and user profile in a success response
    res.json({ message: 'Login successful', token, user: safeUser })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Login error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error during login' })
  }
}

// GET /api/auth/me
// Controller: returns the currently authenticated user's profile
// The 'protect' middleware has already verified the JWT and attached req.user before this runs
exports.getMe = async (req, res) => {
  // Simply return the user object that was attached to the request by the auth middleware
  res.json({ user: req.user })
}

// POST /api/auth/forgot-password
// Controller: generates a password reset token and emails a reset link to the user
exports.forgotPassword = async (req, res) => {
  try {
    // Destructure the email field from the request body
    const { email } = req.body

    // Validate that an email address was provided
    if (!email) return res.status(400).json({ message: 'Email is required' })

    // Look up whether a user with this email address exists in the database
    const user = await User.findByEmail(email)

    // Always respond OK to prevent email enumeration
    // Telling the client "email not found" would let attackers discover which emails are registered
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Generate a random UUID token that will be included in the reset link URL
    const token  = uuidv4()

    // Set the token expiry to 1 hour from now (current time in ms + 3600000 ms)
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save the reset token and its expiry timestamp to the user's row in the database
    await User.setResetToken(user.id, token, expiry)

    // Build the full URL that the user will click in their email to reset their password
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`

    // Send the password reset email containing the link to the user's email address
    await sendPasswordResetEmail(user.email, resetUrl, user.name)

    // Return the same generic success message regardless of whether the user exists
    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Forgot password error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/auth/reset-password
// Controller: validates the reset token and updates the user's password
exports.resetPassword = async (req, res) => {
  try {
    // Destructure the reset token and the new password from the request body
    const { token, password } = req.body

    // Validate that both the token and the new password were provided
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }

    // Enforce a minimum password length of 8 characters
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Look up a user whose reset_token matches and whose reset_token_exp hasn't passed yet
    const user = await User.findByResetToken(token)

    // If no valid token was found (wrong token or expired), reject the request
    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    // Hash the new plain-text password with bcrypt before storing it (salt rounds = 12)
    const hashed = await bcrypt.hash(password, 12)

    // Update the user's password in the database and also clear the reset token so it can't be reused
    await User.updatePassword(user.id, hashed)

    // Return a success message — the user can now log in with their new password
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    // Log the full error to the server console for debugging
    console.error('Reset password error:', err)
    // Return a 500 Internal Server Error response to the client
    res.status(500).json({ message: 'Server error' })
  }
}
