// Import the mysql2 library with Promise support so we can use async/await instead of callbacks
const mysql = require('mysql2/promise')

// Load environment variables from the .env file (DB_HOST, DB_USER, etc.) into process.env
require('dotenv').config()

// Create a connection pool — a pool keeps several database connections open and reuses them,
// which is much more efficient than opening a new connection for every query
const pool = mysql.createPool({
  // The hostname or IP address of the MySQL server — defaults to 'localhost' for local development
  host:            process.env.DB_HOST     || 'localhost',

  // The MySQL username to connect with — defaults to 'root' for local development
  user:            process.env.DB_USER     || 'root',

  // The MySQL password for the above user — defaults to an empty string if not set
  password:        process.env.DB_PASSWORD || '',

  // The name of the database to connect to — defaults to 'auth_db'
  database:        process.env.DB_NAME     || 'auth_db',

  // When all connections are busy, new requests will wait in a queue instead of failing immediately
  waitForConnections: true,

  // Maximum number of simultaneous database connections allowed in the pool
  connectionLimit:    10,

  // Maximum number of requests allowed to wait in the queue — 0 means unlimited
  queueLimit:         0,
})

// Define an async function that creates the required database tables when the server starts
async function initDB() {
  // Borrow one connection from the pool to run the setup queries
  const conn = await pool.getConnection()

  try {
    // Run a SQL query to create the 'users' table only if it does not already exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              INT AUTO_INCREMENT PRIMARY KEY,  -- Unique numeric ID for each user, auto-incremented
        name            VARCHAR(100)         DEFAULT NULL,  -- The user's display name (optional)
        email           VARCHAR(255)         NOT NULL UNIQUE,  -- The user's email address — required and must be unique
        password        VARCHAR(255)         DEFAULT NULL,  -- Bcrypt-hashed password (NULL for OTP-only users)
        role            ENUM('user','admin') DEFAULT 'user',  -- User role: either 'user' or 'admin', defaults to 'user'
        is_verified     BOOLEAN              DEFAULT FALSE,  -- Whether the user has verified their email address
        otp_code        VARCHAR(6)           DEFAULT NULL,  -- The 6-digit one-time password sent to the user
        otp_expiry      DATETIME             DEFAULT NULL,  -- The date/time when the OTP expires
        reset_token     VARCHAR(255)         DEFAULT NULL,  -- A UUID token used for password reset links
        reset_token_exp DATETIME             DEFAULT NULL,  -- The date/time when the reset token expires
        created_at      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,  -- Automatically records when the row was created
        updated_at      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Automatically updates whenever the row changes
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  -- Use InnoDB (supports transactions) with full Unicode support
    `)

    // Add otp columns to existing tables that were created before this migration
    // This handles the case where the table already exists but was created without the OTP columns
    await conn.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS otp_code   VARCHAR(6) DEFAULT NULL,  -- Add otp_code column if it doesn't exist yet
        ADD COLUMN IF NOT EXISTS otp_expiry DATETIME   DEFAULT NULL;  -- Add otp_expiry column if it doesn't exist yet
    `).catch(() => {})   // Silently skip if columns already exist (older MySQL versions)

    // Log a success message to the console so we know the database is ready
    console.log('✅ Database initialised — users table ready (OTP columns included)')
  } finally {
    // Always release the connection back to the pool, even if an error occurred above
    conn.release()
  }
}

// Export both the connection pool (for use in queries) and the initDB function (called on startup)
module.exports = { pool, initDB }
