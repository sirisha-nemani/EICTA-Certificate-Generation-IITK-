# EICTA Digital Credentials Portal

A full-stack web application that lets E&ICT Academy participants securely access, preview, download, and share their course-completion certificates.

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, @react-pdf/renderer |
| Backend    | Node.js, Express 4                                   |
| Database   | MySQL 8 (mysql2 driver)                              |
| Auth       | JWT + OTP via Nodemailer (Gmail SMTP)                |
| PDF        | @react-pdf/renderer (browser) + Node CLI script      |

---

## Project Structure

```
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── assets/                # Logo images used in certificate
│   │   ├── components/
│   │   │   ├── certificate/       # CertificateDocument, CertificateView,
│   │   │   │                      # CertificateViewer, EmailModal,
│   │   │   │                      # PreviewControls, sidebar cards
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoute.jsx   # Auth guard wrapper
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx        # Credential listing + logout
│   │   │   │   └── CredentialCard.jsx   # Single credential card
│   │   │   └── home/              # Navbar, Hero, Features, FAQ, Footer
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state (OTP flow only)
│   │   ├── data/
│   │   │   └── mockCredentials.js # Demo credential records
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Public landing page
│   │   │   ├── LoginPage.jsx      # OTP login (email → captcha → OTP)
│   │   │   ├── CertificatePage.jsx     # HTML preview + zoom + email + fullscreen
│   │   │   └── CertificatePdfPage.jsx  # Clean PDF viewer + download
│   │   ├── services/
│   │   │   └── api.js             # Axios instance (auto-attaches JWT)
│   │   └── styles/                # Per-page CSS files
│   ├── generateCertificate.mjs    # CLI script for server-side PDF generation
│   └── .env.example               # Frontend environment variable template
│
├── server/                        # Express backend
│   ├── config/
│   │   └── db.js                  # MySQL pool + initDB() (auto-creates tables)
│   ├── controllers/
│   │   ├── authController.js      # OTP logic + JWT issuance
│   │   └── certificateController.js  # Certificate email endpoint
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect middleware
│   ├── models/
│   │   └── User.js                # SQL-based User model
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── certificateRoutes.js   # /api/certificate/*
│   ├── utils/
│   │   └── emailService.js        # Nodemailer — OTP + certificate emails
│   ├── server.js
│   └── .env.example               # Backend environment variable template
│
└── db/
    └── schema.sql                 # Full MySQL schema — import to set up the DB
```

---

## Prerequisites

- **Node.js** v18 or later (`node --version`)
- **MySQL** 8.0 or later, running locally (`mysql --version`)
- A **Gmail account** with a 16-character App Password for sending emails

---

## 1 — Database Setup

```bash
mysql -u root -p < db/schema.sql
```

This creates the `auth_db` database and the `users` table. You will be prompted for your MySQL root password.

> **Alternative:** Open `db/schema.sql` in MySQL Workbench or phpMyAdmin and run it there.

---

## 2 — Environment Variables

### Backend (`server/.env`)

```bash
cp server/.env.example server/.env
```

| Variable         | Description                                                  |
|------------------|--------------------------------------------------------------|
| `PORT`           | Express server port (default `5000`)                         |
| `DB_HOST`        | MySQL host (usually `localhost`)                             |
| `DB_USER`        | MySQL username (usually `root`)                              |
| `DB_PASSWORD`    | MySQL password                                               |
| `DB_NAME`        | Database name (default `auth_db`)                            |
| `JWT_SECRET`     | Long random string — signs/verifies JWTs                     |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`)                                |
| `EMAIL_HOST`     | SMTP host (default `smtp.gmail.com`)                         |
| `EMAIL_PORT`     | SMTP port (default `587`)                                    |
| `EMAIL_USER`     | Your Gmail address                                           |
| `EMAIL_PASS`     | Gmail **App Password** (not your login password)             |
| `CLIENT_URL`     | React dev server URL for CORS (default `http://localhost:3000`) |

**Getting a Gmail App Password:**  
myaccount.google.com → Security → 2-Step Verification → App passwords

**Generating a strong `JWT_SECRET`:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`client/.env`)

```bash
cp client/.env.example client/.env
```

The default `VITE_API_URL=http://localhost:5000/api` works with no changes.

---

## 3 — Install Dependencies

```bash
# Terminal 1 — backend
cd server && npm install

# Terminal 2 — frontend
cd client && npm install
```

---

## 4 — Run the Project

```bash
# Terminal 1
cd server && npm run dev      # nodemon, auto-restarts on changes

# Terminal 2
cd client && npm run dev      # Vite HMR dev server
```

Open **http://localhost:3000**

---

## 5 — Login Flow (OTP)

Users do **not** register manually. Accounts are auto-created on first login:

1. Enter your registered email address + solve captcha → click **Request OTP**
2. Enter the 6-digit code sent to your inbox → click **Verify OTP**
3. Redirected to the dashboard — session persists via JWT in `localStorage`

---

## 6 — API Endpoints

### Auth (`/api/auth`)

| Method | Route           | Auth | Description                    |
|--------|-----------------|------|--------------------------------|
| POST   | `/request-otp`  | No   | Send a 6-digit OTP to an email |
| POST   | `/verify-otp`   | No   | Verify OTP, receive JWT        |
| GET    | `/me`           | Yes  | Get current user profile       |

### Certificate (`/api/certificate`)

| Method | Route          | Auth | Description                              |
|--------|----------------|------|------------------------------------------|
| POST   | `/send-email`  | Yes  | Email the certificate PDF to an address  |

### Health

| Method | Route          | Auth | Description     |
|--------|----------------|------|-----------------|
| GET    | `/api/health`  | No   | Server liveness |

---

## 7 — CLI Certificate Generator (optional)

```bash
cd client
npm run generate -- \
  --name="Sirisha Nemani" \
  --college="IIT Madras" \
  --course="Advanced Embedded Systems Design" \
  --start="01-01-2026" \
  --end="31-01-2026" \
  --issue="02-02-2026" \
  --program="Faculty Development Program" \
  --output="my_certificate.pdf"
```

All flags are optional. Requires Node.js ≥ 18.

---

## Security Notes

- `.env` files are in `.gitignore` — never committed
- Passwords are hashed with `bcryptjs` before storage
- JWT tokens expire after 7 days
- OTP codes expire after 10 minutes and are single-use
- All SQL queries use parameterised statements — no SQL injection possible
- JSON body parser limited to 10 MB (required for base64 PDF payloads)
