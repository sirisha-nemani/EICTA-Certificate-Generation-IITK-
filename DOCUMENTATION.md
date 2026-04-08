# EICTA – Digital Credentials Portal
## Full Application Documentation

---

## 1. Project Overview

The **EICTA Digital Credentials Portal** is a full-stack web application that allows E&ICT Academy participants to securely log in via OTP and view, preview, download, and email their digital certificates.

| Property | Value |
|----------|-------|
| **Project Type** | Full-Stack Web Application |
| **Frontend** | React 18 + Vite (ES Modules) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL (via `mysql2/promise`) |
| **Auth Strategy** | JWT + OTP-based email authentication |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **PDF Generation** | `@react-pdf/renderer` (browser) + Node CLI |
| **QR Codes** | `qrcode` + `qrcode.react` |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Client)                       │
│   React 18 + Vite + React Router + Axios + react-pdf         │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP/REST (JSON)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Node.js / Express Server                      │
│  Routes → Middleware (JWT) → Controllers → Models             │
│  Utils: EmailService (Nodemailer → Gmail SMTP)                │
└─────────────────────────┬────────────────────────────────────┘
                          │ mysql2/promise (connection pool)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                       MySQL Database                           │
│              Database: auth_db / Table: users                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure

```
Figma Make code/
├── README.md
├── DOCUMENTATION.md
├── generate_pdf.py                  # Python batch PDF generation script
├── db/
│   └── schema.sql                   # Full MySQL schema — import to set up the DB
│
├── client/                          # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example                 # → copy to .env, set VITE_API_URL
│   ├── generateCertificate.mjs      # Node CLI certificate PDF generator
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root component + all route definitions
│       ├── assets/                  # Logo images (emblem, IITK, TAG, EICTA)
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state — OTP flow only
│       ├── services/
│       │   └── api.js               # Axios instance + JWT + 401 interceptors
│       ├── data/
│       │   └── mockCredentials.js   # Demo credential records (replace with DB)
│       ├── styles/                  # Per-page CSS (certificate, dashboard, login…)
│       ├── pages/
│       │   ├── Home.jsx             # Public landing page
│       │   ├── LoginPage.jsx        # OTP login wizard (email + captcha → OTP)
│       │   ├── CertificatePage.jsx  # HTML preview: zoom, fullscreen, email modal
│       │   └── CertificatePdfPage.jsx  # Clean PDF viewer + download
│       └── components/
│           ├── common/
│           │   └── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│           ├── dashboard/
│           │   ├── Dashboard.jsx        # Lists credentials; logout
│           │   └── CredentialCard.jsx   # Single credential card with Preview / PDF buttons
│           ├── certificate/
│           │   ├── CertificateDocument.jsx  # @react-pdf/renderer PDF document
│           │   ├── CertificateView.jsx      # HTML/CSS certificate (zoom preview)
│           │   ├── CertificateViewer.jsx    # Generates PDF blob → <iframe>
│           │   ├── CertificateSidebar.jsx   # Composes sidebar cards
│           │   ├── IssuanceCard.jsx         # Issuing authority + timestamp
│           │   ├── OrgInfoCard.jsx          # E&ICT Academy description
│           │   ├── VerifiedCard.jsx         # "Verified" green badge
│           │   ├── ShareCard.jsx            # LinkedIn / Twitter / Facebook share
│           │   ├── CredentialDetails.jsx    # 4-col credential details grid
│           │   ├── PreviewControls.jsx      # Zoom Out / % / Reset / Zoom In bar
│           │   └── EmailModal.jsx           # Send certificate via email modal
│           └── home/
│               ├── Navbar.jsx
│               ├── Hero.jsx
│               ├── Features.jsx
│               ├── HowItWorks.jsx
│               ├── CTA.jsx
│               ├── FAQ.jsx
│               └── Footer.jsx
│
└── server/                          # Node.js + Express backend
    ├── server.js                    # Express app entry point
    ├── package.json
    ├── .env.example                 # → copy to .env, fill credentials
    ├── config/
    │   ├── db.js                    # MySQL connection pool + initDB()
    │   └── schema.sql               # Raw SQL (also available at db/schema.sql)
    ├── controllers/
    │   ├── authController.js        # OTP request/verify + JWT issuance
    │   └── certificateController.js # Certificate email endpoint
    ├── routes/
    │   ├── authRoutes.js            # /api/auth/*
    │   └── certificateRoutes.js     # /api/certificate/*
    ├── models/
    │   └── User.js                  # All SQL queries for users table
    ├── middleware/
    │   └── authMiddleware.js        # JWT verification middleware
    └── utils/
        └── emailService.js          # Nodemailer: OTP email + certificate email
```

---

## 4. Database Schema

### Database: `auth_db` (MySQL, charset: utf8mb4)

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique user ID |
| `name` | `VARCHAR(100)` | `DEFAULT NULL` | Display name (auto-derived from email on first OTP login) |
| `email` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Email — primary identifier |
| `password` | `VARCHAR(255)` | `DEFAULT NULL` | Always NULL — OTP-only portal, no passwords used |
| `role` | `ENUM('user','admin')` | `DEFAULT 'user'` | User role |
| `is_verified` | `BOOLEAN` | `DEFAULT FALSE` | Set to TRUE on first OTP login |
| `otp_code` | `VARCHAR(6)` | `DEFAULT NULL` | Current 6-digit OTP (cleared after use) |
| `otp_expiry` | `DATETIME` | `DEFAULT NULL` | OTP expiry timestamp (10-min window) |
| `reset_token` | `VARCHAR(255)` | `DEFAULT NULL` | Reserved — not used in current UI |
| `reset_token_exp` | `DATETIME` | `DEFAULT NULL` | Reserved — not used in current UI |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Row creation time |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last modification time |

**Engine:** InnoDB · **Charset:** utf8mb4

#### Setup
```bash
mysql -u root -p < db/schema.sql
```

---

## 5. Backend — Node.js / Express

### 5.1 Entry Point: `server.js`

1. Loads `.env` via `dotenv`
2. Applies `cors` (allows `CLIENT_URL` origin)
3. Applies `express.json({ limit: '10mb' })` — 10 MB needed for base64 PDF payloads
4. Mounts `authRoutes` at `/api/auth`
5. Mounts `certificateRoutes` at `/api/certificate`
6. Provides `GET /api/health` health-check
7. Registers 404 + global error handlers
8. Calls `initDB()` → starts HTTP listener on `PORT`

---

### 5.2 Database Config: `config/db.js`

Creates a **mysql2 connection pool** (max 10 connections) and exports:

| Export | Purpose |
|--------|---------|
| `pool` | Shared pool used by all model queries |
| `initDB()` | Creates `users` table on startup; runs `ALTER TABLE` migration for OTP columns |

---

### 5.3 User Model: `models/User.js`

All queries use **parameterised statements** (`?` placeholders) to prevent SQL injection.

| Method | Description |
|--------|-------------|
| `findByEmail(email)` | Find user by email |
| `findById(id)` | Find user by ID — safe fields only (no password/OTP) |
| `create({ name, email, password })` | Insert new user |
| `setOTP(userId, otpCode, expiry)` | Save OTP + expiry |
| `findByEmailAndOTP(email, otpCode)` | Find user with valid, unexpired OTP |
| `clearOTP(userId)` | Erase OTP fields after successful login |
| `findOrCreate(email)` | Return existing user or auto-register by email |

---

### 5.4 Auth Middleware: `middleware/authMiddleware.js`

`protect` runs before any protected route:
1. Reads `Authorization: Bearer <token>` header → **401** if missing
2. Calls `jwt.verify(token, JWT_SECRET)` → **401** if invalid/expired
3. Fetches user from DB using decoded `id` → **401** if not found
4. Attaches `req.user` for downstream handlers

---

### 5.5 Auth Controller: `controllers/authController.js`

#### `requestOTP` — `POST /api/auth/request-otp`
- Validates email format
- `User.findOrCreate(email)` — auto-registers new users on first login
- Generates 6-digit OTP with 10-minute expiry, saves to DB
- Sends branded OTP email via `sendOTPEmail()`

#### `verifyOTP` — `POST /api/auth/verify-otp`
- Validates email + OTP (6 digits)
- `User.findByEmailAndOTP()` — rejects wrong or expired OTP
- `clearOTP()` — single-use enforcement
- Issues JWT, returns safe user profile

#### `getMe` — `GET /api/auth/me` *(protected)*
- Returns `req.user` (populated by `protect` middleware)

---

### 5.6 Certificate Controller: `controllers/certificateController.js`

#### `sendCertificateByEmail` — `POST /api/certificate/send-email` *(protected)*
- Validates `email` + `pdfBase64` presence and format
- Calls `sendCertificateEmail()` — attaches the PDF and sends branded HTML email
- PDF is generated client-side and sent as a base64 string

---

### 5.7 Routes

#### `routes/authRoutes.js` — mounted at `/api/auth`

| Method | Path | JWT | Controller |
|--------|------|:---:|------------|
| `POST` | `/request-otp` | ❌ | `requestOTP` |
| `POST` | `/verify-otp` | ❌ | `verifyOTP` |
| `GET` | `/me` | ✅ | `getMe` |

#### `routes/certificateRoutes.js` — mounted at `/api/certificate`

| Method | Path | JWT | Controller |
|--------|------|:---:|------------|
| `POST` | `/send-email` | ✅ | `sendCertificateByEmail` |

---

## 6. API Reference

### POST `/api/auth/request-otp`
**Request:**
```json
{ "email": "user@example.com" }
```
**Success (200):**
```json
{ "message": "OTP sent successfully. Please check your inbox." }
```
**Errors:** `400` invalid email · `500` server error

---

### POST `/api/auth/verify-otp`
**Request:**
```json
{ "email": "user@example.com", "otp": "482917" }
```
**Success (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "user", "email": "user@example.com", "role": "user" }
}
```
**Errors:** `400` wrong/expired OTP · `500`

---

### GET `/api/auth/me`
**Headers:** `Authorization: Bearer <token>`

**Success (200):**
```json
{ "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" } }
```
**Errors:** `401` no/invalid/expired token

---

### POST `/api/certificate/send-email`
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "recipient@example.com",
  "pdfBase64": "<base64-encoded PDF>",
  "studentName": "Jane Doe",
  "courseName": "Advanced Embedded Systems Design",
  "certificateId": "EICT/2025/AES/12345"
}
```
**Success (200):**
```json
{ "success": true, "message": "Certificate sent successfully." }
```
**Errors:** `400` missing/invalid fields · `401` not authenticated · `500`

---

### GET `/api/health`
```json
{ "status": "ok", "timestamp": "2026-04-08T00:00:00.000Z" }
```

---

## 7. Frontend — React (Vite)

### 7.1 Routing (`App.jsx`)

| URL Path | Component | Auth Required |
|----------|-----------|:-------------:|
| `/` | `Home` | ❌ |
| `/login` | `LoginPage` | ❌ |
| `/dashboard` | `Dashboard` | ✅ |
| `/certificate/:id` | `CertificatePage` | ✅ |
| `/certificate/pdf/:id` | `CertificatePdfPage` | ✅ |
| `*` (unmatched) | Redirects to `/` | — |

---

### 7.2 Global State (`context/AuthContext.jsx`)

Wraps the entire app. Access anywhere with the `useAuth()` hook.

| Value | Type | Description |
|-------|------|-------------|
| `user` | `object \| null` | Logged-in user profile or `null` |
| `loading` | `boolean` | `true` while checking saved session on mount |
| `loginWithToken(token, user)` | `fn` | Called after OTP verify — saves JWT + sets user |
| `logout()` | `fn` | Removes JWT, clears user state |

**Session Restore:** On page load, `AuthContext` reads the token from `localStorage` and calls `GET /api/auth/me` to silently restore the session.

---

### 7.3 API Client (`services/api.js`)

Pre-configured `axios` instance:
- **Base URL:** `VITE_API_URL` env var, falls back to `/api`
- **Request Interceptor:** Auto-appends `Authorization: Bearer <token>` from `localStorage`
- **Response Interceptor:** On `401` → removes token + redirects to `/login`

---

### 7.4 Pages

| File | Purpose |
|------|---------|
| `Home.jsx` | Public landing page — assembles all home section components |
| `LoginPage.jsx` | OTP login wizard: Step 1 (email + captcha) → Step 2 (6-digit OTP) |
| `CertificatePage.jsx` | HTML certificate preview with zoom controls, fullscreen (F key), and email modal |
| `CertificatePdfPage.jsx` | Clean dark PDF viewer rendered via `@react-pdf/renderer` + download button |

---

### 7.5 Components

#### `components/common/`
| Component | Purpose |
|-----------|---------|
| `ProtectedRoute.jsx` | Redirects unauthenticated users to `/login` |

#### `components/dashboard/`
| Component | Purpose |
|-----------|---------|
| `Dashboard.jsx` | Lists user credentials; logout button |
| `CredentialCard.jsx` | Card with **Preview** (→ PDF viewer) and **PDF** (→ HTML preview) buttons |

#### `components/certificate/`
| Component | Purpose |
|-----------|---------|
| `CertificateDocument.jsx` | `@react-pdf/renderer` landscape A4 certificate — used for PDF generation and email attachment |
| `CertificateView.jsx` | HTML/CSS 1050×743 px certificate — used for zoom preview |
| `CertificateViewer.jsx` | Generates a PDF blob URL → renders in `<iframe>` |
| `CertificateSidebar.jsx` | Composes the four sidebar cards |
| `IssuanceCard.jsx` | Issuing authority + issuance timestamp |
| `OrgInfoCard.jsx` | E&ICT Academy description |
| `VerifiedCard.jsx` | Green "Verified" badge |
| `ShareCard.jsx` | LinkedIn / Twitter / Facebook share buttons |
| `CredentialDetails.jsx` | 4-column (2-column on mobile) credential details grid |
| `PreviewControls.jsx` | Zoom Out / current % / Reset / Zoom In bar |
| `EmailModal.jsx` | Modal to generate PDF on-demand and send via `/api/certificate/send-email` |

#### `components/home/`
| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Top navigation with login link |
| `Hero.jsx` | Hero section with headline and CTA |
| `Features.jsx` | Feature highlights grid |
| `HowItWorks.jsx` | Step-by-step process section |
| `CTA.jsx` | Call-to-action banner |
| `FAQ.jsx` | Accordion FAQ section |
| `Footer.jsx` | Page footer |

---

## 8. Authentication Flow (OTP Only)

```
1. User opens /login
   → Enters registered email + solves captcha
   → POST /api/auth/request-otp
   → Server: findOrCreate(email) — auto-registers on first use
              generate 6-digit OTP, 10-min expiry, save to DB
              send branded OTP email

2. User enters 6-digit OTP from inbox
   → POST /api/auth/verify-otp
   → Server: validate OTP + expiry
              clearOTP() — single-use enforcement
              issue JWT (7-day expiry)
   → Client: loginWithToken(token, user) — saved to localStorage
   → Redirect to /dashboard

3. On any subsequent page load
   → AuthContext reads token from localStorage
   → GET /api/auth/me — silently restores session
   → App renders with user logged in
```

> Users never set a password. Accounts are created automatically on first OTP login using the email address used during course enrollment.

---

## 9. Certificate Feature

### Preview vs PDF

| Action | Route | What renders |
|--------|-------|-------------|
| **Preview** button (dashboard) | `/certificate/pdf/:id` | PDF iframe via `@react-pdf/renderer` |
| **PDF** button (dashboard) | `/certificate/:id` | HTML certificate with zoom / fullscreen / email |

### Fullscreen
Press **F** (or click the Full Screen button) on the HTML preview to enter browser fullscreen. Press **F** or **Esc** to exit.

### Email Certificate
1. Click **Email** in the top bar (or the mobile button)
2. Confirm or change the email address
3. Click **Send** — the PDF is generated in the browser, base64-encoded, and POSTed to `/api/certificate/send-email`
4. The server attaches the PDF to a branded HTML email and sends it via Gmail SMTP

### CLI Generator
```bash
cd client
npm run generate -- --name="Jane Doe" --college="IIT Madras" \
  --course="Advanced Embedded Systems" --output="cert.pdf"
```

---

## 10. Email Service (`utils/emailService.js`)

Uses `nodemailer` with Gmail SMTP (`smtp.gmail.com:587`, STARTTLS).

### `sendOTPEmail(toEmail, otpCode, userName)`
Branded HTML email with OTP displayed large (40px monospace).

### `sendCertificateEmail({ toEmail, pdfBase64, studentName, courseName, certificateId })`
Branded HTML email with the certificate PDF attached. The base64 string is decoded server-side via `Buffer.from(pdfBase64, 'base64')`.

---

## 11. Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | ❌ | `5000` | HTTP port |
| `CLIENT_URL` | ✅ | `http://localhost:3000` | CORS origin |
| `DB_HOST` | ❌ | `localhost` | MySQL host |
| `DB_USER` | ❌ | `root` | MySQL username |
| `DB_PASSWORD` | ❌ | `` | MySQL password |
| `DB_NAME` | ❌ | `auth_db` | MySQL database name |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | ❌ | `7d` | JWT token lifetime |
| `EMAIL_HOST` | ❌ | `smtp.gmail.com` | SMTP host |
| `EMAIL_PORT` | ❌ | `587` | SMTP port |
| `EMAIL_USER` | ✅* | — | Gmail address |
| `EMAIL_PASS` | ✅* | — | Gmail App Password |

> ✅* Required for email delivery.

### Client (`client/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `VITE_API_URL` | ❌ | `/api` | Backend API base URL |

---

## 12. Dependencies

### Server

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.19.2 | HTTP web framework |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.4.5 | Environment variable loader |
| `mysql2` | ^3.10.1 | MySQL driver (Promise API) |
| `bcryptjs` | ^2.4.3 | Password hashing (reserved) |
| `jsonwebtoken` | ^9.0.2 | JWT sign and verify |
| `nodemailer` | ^6.9.14 | Email sender (SMTP) |
| `uuid` | ^10.0.0 | UUID v4 token generation |
| `nodemon` *(dev)* | ^3.1.4 | Auto-restart on file changes |

### Client

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI library |
| `react-dom` | ^18.3.1 | React DOM renderer |
| `react-router-dom` | ^6.23.1 | Client-side routing |
| `axios` | ^1.7.2 | HTTP client |
| `@react-pdf/renderer` | ^4.4.0 | PDF certificate generation |
| `qrcode` | ^1.5.4 | QR code (Node / browser) |
| `qrcode.react` | ^4.2.0 | QR code React component |
| `vite` *(dev)* | ^5.2.13 | Build tool + dev server |
| `@vitejs/plugin-react` *(dev)* | ^4.3.0 | Vite React plugin |

---

## 13. Security Highlights

| Feature | Implementation |
|---------|----------------|
| No passwords stored | All users authenticate via OTP only |
| JWT signing | `HS256` with `JWT_SECRET` from env |
| OTP expiry | 10 minutes — enforced at DB level with `NOW()` |
| OTP single-use | Cleared from DB immediately after successful verify |
| SQL injection | All queries use parameterised statements |
| CORS restriction | Only `CLIENT_URL` origin allowed |
| Safe field exposure | `findById` never returns `password`, `otp_code`, or `otp_expiry` |
| Body size limit | `express.json({ limit: '10mb' })` — handles base64 PDF payloads |

---

*Documentation updated 2026-04-08.*
