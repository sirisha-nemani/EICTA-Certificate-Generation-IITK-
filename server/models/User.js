// Import the connection pool from the database config so we can run SQL queries
const { pool } = require('../config/db')

// Define the User model as a plain object containing all database methods for the users table
const User = {

  // findByEmail: looks up a single user by their email address
  // Returns the full user row (including password hash) or null if not found
  async findByEmail(email) {
    // Run a parameterised SELECT query — the '?' placeholder prevents SQL injection
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    // Return the first matching row, or null if the email doesn't exist in the database
    return rows[0] || null
  },

  // findById: looks up a user by their numeric primary key ID
  // Only returns safe public fields — password and OTP fields are deliberately excluded
  async findById(id) {
    const [rows] = await pool.query(
      // Select only the columns safe to expose to the client (no password, no OTP details)
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?',
      [id] // Pass the id as a parameter to prevent SQL injection
    )
    // Return the first (and only) matching row, or null if no user has that ID
    return rows[0] || null
  },

  // create: inserts a new user row into the database with name, email, and hashed password
  // Returns the auto-generated numeric ID of the newly created user
  async create({ name, email, password }) {
    const [result] = await pool.query(
      // Insert the three required fields; other columns use their DEFAULT values
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password] // Values are parameterised to prevent SQL injection
    )
    // result.insertId is the auto-incremented ID assigned to the new row
    return result.insertId
  },

  // findByResetToken: looks up a user whose reset_token matches AND has not yet expired
  // Returns the full user row or null if the token is invalid or has passed its expiry time
  async findByResetToken(token) {
    const [rows] = await pool.query(
      // NOW() returns the current database time — only returns rows where the expiry is in the future
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_exp > NOW()',
      [token] // Pass the token as a parameter to prevent SQL injection
    )
    // Return the first matching row, or null if no valid token was found
    return rows[0] || null
  },

  // setResetToken: saves a password reset token and its expiry date on the user's row
  async setResetToken(userId, token, expiry) {
    await pool.query(
      // Update only the reset_token and reset_token_exp columns for this specific user
      'UPDATE users SET reset_token = ?, reset_token_exp = ? WHERE id = ?',
      [token, expiry, userId] // Parameterised values prevent SQL injection
    )
  },

  // updatePassword: saves a new hashed password and clears the reset token so it can't be reused
  async updatePassword(userId, hashedPassword) {
    await pool.query(
      // Update the password column and set both reset token columns to NULL to invalidate the link
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_exp = NULL WHERE id = ?',
      [hashedPassword, userId] // Parameterised values prevent SQL injection
    )
  },

  // verifyEmail: marks the user's account as email-verified by setting is_verified to TRUE
  async verifyEmail(userId) {
    // Update the is_verified flag to TRUE for the given user ID
    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId])
  },

  // ── OTP methods ──────────────────────────────────────────────

  // setOTP: saves a one-time password code and its expiry date onto the user's database row
  async setOTP(userId, otpCode, expiry) {
    await pool.query(
      // Update otp_code and otp_expiry columns for this user
      'UPDATE users SET otp_code = ?, otp_expiry = ? WHERE id = ?',
      [otpCode, expiry, userId] // Parameterised values prevent SQL injection
    )
  },

  // findByEmailAndOTP: looks up a user whose email and OTP both match AND the OTP hasn't expired
  // Returns the full user row or null if no valid match is found
  async findByEmailAndOTP(email, otpCode) {
    const [rows] = await pool.query(
      // All three conditions must be true: correct email, correct OTP code, and not yet expired
      `SELECT * FROM users
       WHERE email = ?
         AND otp_code = ?
         AND otp_expiry > NOW()`,  // NOW() ensures expired OTPs are rejected automatically
      [email, otpCode] // Parameterised values prevent SQL injection
    )
    // Return the first matching row, or null if the OTP is wrong or expired
    return rows[0] || null
  },

  // clearOTP: removes the OTP code and expiry from the user's row after a successful login
  // This prevents the same OTP from being used a second time
  async clearOTP(userId) {
    await pool.query(
      // Set both OTP columns back to NULL so the code is no longer valid
      'UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?',
      [userId] // Parameterised to prevent SQL injection
    )
  },

  // ── Find existing user OR auto-register a new one by email ──
  // findOrCreate: returns the user if they already exist, otherwise creates a new account automatically
  async findOrCreate(email) {
    // Try to find first — check the database for a user with this email
    const existing = await User.findByEmail(email)

    // If the user already exists, return them immediately without creating a duplicate
    if (existing) return existing

    // Auto-register: use the part before @ as a default name
    // e.g. "john.doe@example.com" → "john doe" (dots, underscores, and hyphens become spaces)
    const defaultName = email.split('@')[0].replace(/[._-]/g, ' ')

    // Insert a new user row with the derived name, email, and is_verified set to 1 (true)
    // No password is set because OTP users don't need one
    const [result] = await pool.query(
      'INSERT INTO users (name, email, is_verified) VALUES (?, ?, 1)',
      [defaultName, email] // Parameterised values prevent SQL injection
    )

    // Fetch and return the newly created user's profile using the auto-incremented insert ID
    const newUser = await User.findById(result.insertId)
    return newUser
  },
}

// Export the User model so it can be imported and used in controllers and other modules
module.exports = User
