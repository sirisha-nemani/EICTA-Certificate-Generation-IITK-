-- ================================================================
--  EICTA Digital Credentials Portal — Database Schema
--  Generated from: server/config/db.js  +  server/models/User.js
-- ================================================================
--
--  HOW TO IMPORT
--  ─────────────
--  Option A — MySQL CLI:
--    mysql -u root -p < db/schema.sql
--
--  Option B — MySQL Workbench:
--    File → Open SQL Script → select this file → ▶ Execute All
--
--  Option C — phpMyAdmin:
--    Select your server → Import tab → choose this file → Go
-- ================================================================

-- Create the database if it does not already exist
CREATE DATABASE IF NOT EXISTS auth_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Switch to the auth_db database
USE auth_db;

-- ----------------------------------------------------------------
--  TABLE: users
--
--  Central table for all portal accounts.
--  Supports both OTP-only login (no password) and traditional
--  password-based login.  Password reset and email verification
--  flows are handled via the reset_token and otp_code columns.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (

  -- Primary key — auto-incremented integer ID
  id              INT           AUTO_INCREMENT PRIMARY KEY,

  -- User's display name (optional; auto-derived from email on OTP sign-up)
  name            VARCHAR(100)  DEFAULT NULL,

  -- Email address — required, must be unique across all accounts
  email           VARCHAR(255)  NOT NULL UNIQUE,

  -- bcrypt-hashed password (NULL for OTP-only accounts)
  password        VARCHAR(255)  DEFAULT NULL,

  -- Role — controls access level; defaults to 'user'
  role            ENUM('user','admin') DEFAULT 'user',

  -- Whether the user has verified their email address
  is_verified     BOOLEAN       DEFAULT FALSE,

  -- 6-digit one-time password sent during OTP login flow
  otp_code        VARCHAR(6)    DEFAULT NULL,

  -- Expiry timestamp for the OTP (checked server-side; expired OTPs are rejected)
  otp_expiry      DATETIME      DEFAULT NULL,

  -- UUID token sent in password-reset emails
  reset_token     VARCHAR(255)  DEFAULT NULL,

  -- Expiry timestamp for the reset token (1-hour window enforced by the server)
  reset_token_exp DATETIME      DEFAULT NULL,

  -- Audit timestamps — managed automatically by MySQL
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
--  END OF SCHEMA
--  The server's initDB() function in server/config/db.js will
--  also run CREATE TABLE IF NOT EXISTS on startup, so the table
--  will never be accidentally duplicated.
-- ================================================================
