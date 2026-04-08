-- Run this script once to set up the database
-- mysql -u root -p < server/config/schema.sql

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE auth_db;

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)         DEFAULT NULL,
  email           VARCHAR(255)         NOT NULL UNIQUE,
  password        VARCHAR(255)         DEFAULT NULL,          -- nullable: OTP-only users don't need a password
  role            ENUM('user','admin') DEFAULT 'user',
  is_verified     BOOLEAN              DEFAULT FALSE,
  otp_code        VARCHAR(6)           DEFAULT NULL,          -- 6-digit OTP
  otp_expiry      DATETIME             DEFAULT NULL,          -- OTP expires in 10 minutes
  reset_token     VARCHAR(255)         DEFAULT NULL,
  reset_token_exp DATETIME             DEFAULT NULL,
  created_at      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If upgrading an existing database, run:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry DATETIME DEFAULT NULL;
