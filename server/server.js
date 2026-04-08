// Load environment variables from the .env file into process.env before anything else runs
require('dotenv').config()

// Import the Express framework, which lets us create an HTTP web server and define routes
const express    = require('express')

// Import the CORS middleware, which allows the frontend (running on a different port/domain) to talk to this server
const cors       = require('cors')

// Import the initDB function from our database config file — this creates the tables on startup
const { initDB } = require('./config/db')

// Import the authentication routes (login, register, OTP, etc.) defined in the routes folder
const authRoutes         = require('./routes/authRoutes')

// Import certificate routes (email sending, etc.)
const certificateRoutes  = require('./routes/certificateRoutes')

// Create an Express application instance — this is the core of our web server
const app  = express()

// Set the port the server will listen on — use the value from .env, or fall back to 5000
const PORT = process.env.PORT || 5000

// Middleware
// Enable CORS so the frontend can make requests to this API from a different origin (e.g. localhost:3000)
app.use(cors({
  // Allow requests only from the frontend URL defined in .env, defaulting to localhost:3000
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  // Allow cookies and authorization headers to be sent with cross-origin requests
  credentials: true,
}))

// Parse incoming request bodies that are JSON.
// limit: '10mb' is required because certificate PDFs sent as base64 can be ~1–5 MB.
// The default 100 KB limit causes a 413 that the global error handler turns into a 500.
app.use(express.json({ limit: '10mb' }))

// Parse incoming URL-encoded form data — same limit for consistency.
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
// Mount all authentication-related routes under the /api/auth URL prefix
app.use('/api/auth',        authRoutes)

// Mount certificate routes under /api/certificate
// (e.g. POST /api/certificate/send-email)
app.use('/api/certificate', certificateRoutes)

// Health check
// Simple GET endpoint that returns "ok" so external tools can verify the server is alive
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// 404 handler
// Catch-all route that runs when no other route matched — sends a 404 "not found" response
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// Global error handler
// Express calls this 4-argument middleware whenever next(err) is called or an error is thrown
app.use((err, _req, res, _next) => {
  // Print the full error stack trace to the server console so developers can debug it
  console.error(err.stack)
  // Send a generic 500 error response to the client — we don't expose internal details
  res.status(500).json({ message: 'Internal server error' })
})

// Start
// Define an async function to initialise the database and then start the HTTP server
async function start() {
  try {
    // Run the database initialisation — creates the users table if it doesn't already exist
    await initDB()

    // Start listening for incoming HTTP requests on the configured port
    app.listen(PORT, () => {
      // Log a success message so we know the server started correctly
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    // If anything goes wrong (e.g. can't connect to the database), log the error
    console.error('Failed to start server:', err)
    // Exit the Node.js process with a failure code (1) so the OS knows something went wrong
    process.exit(1)
  }
}

// Call the start function to actually boot the server when this file is run
start()
