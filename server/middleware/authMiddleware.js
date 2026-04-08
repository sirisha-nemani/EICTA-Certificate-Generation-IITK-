// Import jsonwebtoken to verify the JWT token sent by the client
const jwt  = require('jsonwebtoken')

// Import the User model so we can look up the user from the database after decoding the token
const User = require('../models/User')

// Export a middleware function called 'protect' that guards routes requiring authentication
// In Express, middleware receives req (request), res (response), and next (a function to proceed to the next step)
module.exports = async function protect(req, res, next) {

  // Read the Authorization header from the incoming HTTP request
  // A valid header looks like: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const header = req.headers.authorization

  // Check that the Authorization header exists and starts with the word "Bearer "
  // If it's missing or in the wrong format, reject the request immediately
  if (!header || !header.startsWith('Bearer ')) {
    // Return a 401 Unauthorized response — the client must provide a valid token to access this route
    return res.status(401).json({ message: 'Not authorised — no token' })
  }

  // Extract just the token string by splitting on the space and taking the second part
  // e.g. "Bearer abc123" → "abc123"
  const token = header.split(' ')[1]

  try {
    // Verify the token's signature and decode its payload using the server's secret key
    // If the token has been tampered with or has expired, jwt.verify throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Use the user ID stored inside the token payload to fetch the user's current profile from the database
    // This ensures the user still exists and we have their latest data (role, name, etc.)
    const user    = await User.findById(decoded.id)

    // If no user was found with that ID (e.g. the account was deleted), reject the request
    if (!user) return res.status(401).json({ message: 'User not found' })

    // Attach the user's profile to the request object so downstream route handlers can access it via req.user
    req.user = user

    // Call next() to pass control to the next middleware or route handler in the chain
    next()

  } catch (err) {
    // If jwt.verify threw an error (invalid signature, expired token, malformed token, etc.),
    // return a 401 Unauthorized response
    return res.status(401).json({ message: 'Token is invalid or expired' })
  }
}
