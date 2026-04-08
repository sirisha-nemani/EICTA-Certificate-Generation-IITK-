// Import axios — a popular HTTP client library that makes it easy to send API requests
import axios from 'axios'

// Create a pre-configured axios instance called "api".
// All API calls in the app use this instance so they share the same base settings.
const api = axios.create({
  // baseURL is the root URL prepended to every request path.
  // It first checks the environment variable VITE_API_URL (set in .env files for different environments).
  // If that variable isn't set, it falls back to '/api' — which works when the frontend
  // and backend are served from the same domain (the dev proxy or production server handles it).
  baseURL: import.meta.env.VITE_API_URL || '/api',

  // Set the default Content-Type header on every request to 'application/json'.
  // This tells the server that the request body is JSON-formatted data.
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request — this is a "request interceptor".
// It runs automatically before EVERY request sent through this axios instance.
// Its job is to add the user's authentication token to the request headers.
api.interceptors.request.use((config) => {
  // Read the JWT token saved in localStorage (set when the user logs in)
  const token = localStorage.getItem('token')

  // If a token exists, add it to the Authorization header in "Bearer token" format.
  // The backend reads this header to verify the user's identity.
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Return the modified config so the request continues with the added header
  return config
})

// Handle 401 globally — this is a "response interceptor".
// It runs automatically on EVERY response received through this axios instance.
// Its job is to detect when the server says the user is not authorized (401 Unauthorized)
// and handle that situation in one central place.
api.interceptors.response.use(
  // First function: called when the response is successful (2xx status codes).
  // We don't need to do anything special — just pass the response through unchanged.
  (res) => res,

  // Second function: called when the response has an error status code (4xx, 5xx).
  (err) => {
    // Check if the error was a 401 Unauthorized response.
    // The optional chaining (?.) safely handles cases where err.response is undefined
    // (e.g. if the request failed due to a network error with no HTTP response).
    if (err.response?.status === 401) {
      // The token is invalid or expired — remove it from localStorage to clear the bad session
      localStorage.removeItem('token')

      // Redirect the user to the login page so they can authenticate again.
      // Using window.location.href forces a full page reload, which also resets React state.
      window.location.href = '/login'
    }

    // Re-throw the error as a rejected Promise so individual API callers
    // can still catch and handle other types of errors (e.g. 400, 500)
    return Promise.reject(err)
  }
)

// Export the configured axios instance as the default export.
// Every other file in the app imports this to make API calls.
export default api
