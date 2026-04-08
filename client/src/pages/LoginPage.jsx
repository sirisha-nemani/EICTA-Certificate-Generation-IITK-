// Import React and the specific hooks we need from the React library.
// useState  — lets us store and update values inside a component (like form fields, loading flags).
// useEffect — runs side-effect code (like timers) after the component renders.
// useRef    — gives us a persistent reference to a DOM element or value without causing a re-render.
// useCallback — memoises a function so it is not recreated on every render (used for performance).
import React, { useState, useEffect, useRef, useCallback } from 'react'

// useNavigate is a React Router hook that lets us programmatically change the URL / navigate pages.
import { useNavigate } from 'react-router-dom'

// Our custom Axios instance (pre-configured with the base API URL and auth headers).
import api from '../services/api'

// useAuth gives us access to the global authentication context (login state, loginWithToken function).
import { useAuth } from '../context/AuthContext'

// Import the CSS file that styles this login page (all class names starting with "lp-").
import '../styles/login.css'

// Import the EICTA logo image so we can display it in the card header.
import eiectaLogo from '../assets/eicta-logo.png'

/* ── helpers ── */

// A string of characters that are visually unambiguous (no 0/O, 1/l/I confusion).
// These are the only characters that will appear in the generated captcha string.
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

// Helper function that builds a random captcha string of a given length (defaults to 6 characters).
// It loops `len` times and each iteration picks a random character from CAPTCHA_CHARS.
function makeCaptcha(len = 6) {
  let s = '' // Start with an empty string.
  for (let i = 0; i < len; i++) s += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  // Math.random() gives a float 0–1; multiply by the array length and floor it to get a valid index.
  return s // Return the completed random captcha string.
}

/* ── icons ── */

// A small inline SVG icon that looks like an envelope, used inside the email input field.
const EmailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Outer rectangle of the envelope */}
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    {/* The "V" fold line across the top of the envelope */}
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

// A circular arrow icon used on the "refresh captcha" button.
const RefreshIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    {/* The top corner arrow of the refresh symbol */}
    <polyline points="23 4 23 10 17 10"/>
    {/* The arc of the refresh circle */}
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
)

// A left-pointing arrow icon used on "Back" buttons throughout the page.
const ArrowLeftIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Horizontal line pointing left */}
    <line x1="19" y1="12" x2="5" y2="12"/>
    {/* The arrowhead chevron */}
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

// A circular "i" icon used to visually mark error messages.
const ErrorIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
    {/* Filled circle with an exclamation mark shape */}
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
  </svg>
)

/* ================================================================
   STEP 1 — Email + Captcha
   ================================================================ */

// StepEmail is the first screen of the login flow.
// The user enters their email address, solves a simple text captcha, then requests an OTP.
// `onSuccess` is a callback function passed in by LoginPage; we call it with the email once the API succeeds.
function StepEmail({ onSuccess }) {
  // `email` stores whatever the user types into the email input field.
  const [email,        setEmail]        = useState('')

  // `captchaText` is the random string we generate and display for the user to retype.
  // The initialiser function `() => makeCaptcha()` runs once on mount to produce the first captcha.
  const [captchaText,  setCaptchaText]  = useState(() => makeCaptcha())

  // `captchaInput` tracks what the user types into the captcha answer field.
  const [captchaInput, setCaptchaInput] = useState('')

  // `spinning` is true for 500 ms after the user clicks Refresh so we can play a CSS spin animation.
  const [spinning,     setSpinning]     = useState(false)

  // `loading` is true while we are waiting for the /auth/request-otp API call to complete.
  const [loading,      setLoading]      = useState(false)

  // `errors` is an object that holds per-field validation error messages, e.g. { email: 'Required', captcha: '...' }.
  const [errors,       setErrors]       = useState({})

  // `apiError` holds any error message returned from the server (e.g. "Email not found").
  const [apiError,     setApiError]     = useState('')

  // refreshCaptcha generates a brand-new captcha string, clears the user's captcha input,
  // clears any existing captcha error, and triggers the spin animation for 500 ms.
  const refreshCaptcha = () => {
    setSpinning(true) // Start the spin CSS animation on the refresh button.
    setCaptchaText(makeCaptcha()) // Replace the displayed captcha with a fresh random string.
    setCaptchaInput('') // Empty the user's answer field so they type fresh.
    setErrors(p => ({ ...p, captcha: '' })) // Clear only the captcha error (keep other errors intact).
    setTimeout(() => setSpinning(false), 500) // Stop the spin animation after 500 ms.
  }

  // validate checks both fields and returns an errors object.
  // If the object is empty, validation passed; if it has keys, something is wrong.
  const validate = () => {
    const e = {} // Start with no errors.
    if (!email)                              e.email   = 'Email address is required'
    // If email is non-empty but doesn't match the basic email pattern, flag it.
    else if (!/\S+@\S+\.\S+/.test(email))   e.email   = 'Please enter a valid email address'
    if (!captchaInput)                       e.captcha = 'Please enter the captcha characters'
    // If the user typed something but it doesn't match the displayed captcha exactly, flag it.
    else if (captchaInput !== captchaText)   e.captcha = 'Captcha does not match. Please try again.'
    return e // Return the (possibly empty) errors object.
  }

  // handleSubmit is called when the user submits the email+captcha form.
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent the browser from doing a full page reload on form submit.
    setApiError('') // Clear any previous server error before the new attempt.
    const errs = validate() // Run client-side validation.
    // If the captcha is wrong, refresh it first so the user gets a new one, then show the error.
    if (errs.captcha) { refreshCaptcha(); setErrors(errs); return }
    // If there are any other errors (e.g. bad email), show them and stop.
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true) // Show the spinner on the submit button.
    try {
      // POST to the backend to send a one-time password to the given email address.
      await api.post('/auth/request-otp', { email })
      // If successful, call the parent callback with the email so the page advances to Step 2.
      onSuccess(email)
    } catch (err) {
      // If the server returned an error message, show it; otherwise show a generic fallback.
      setApiError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false) // Always hide the spinner when the request finishes (success or failure).
    }
  }

  // The JSX that this component renders — the email + captcha form.
  return (
    // `lp-form` is the styled form container. `noValidate` disables browser-native validation
    // so our custom error messages are shown instead.
    <form className="lp-form" onSubmit={handleSubmit} noValidate>

      {/* Show the server-level error banner only when `apiError` is a non-empty string. */}
      {apiError && (
        <div className="lp-error-alert">
          <ErrorIcon /> {apiError}
        </div>
      )}

      {/* Email field group */}
      <div className="lp-field">
        {/* Visible label above the input */}
        <label className="lp-label">Enter your email</label>
        {/* Wrapper div so we can absolutely-position the icon inside the input */}
        <div className="lp-input-wrap">
          {/* Decorative email icon on the left side of the input */}
          <span className="lp-input-icon"><EmailIcon /></span>
          <input
            // Add the `lp-error` class to turn the border red when there is an email error.
            className={`lp-input${errors.email ? ' lp-error' : ''}`}
            type="email" // Triggers the email keyboard on mobile and basic browser validation hint.
            placeholder="example@domain.com"
            value={email} // Controlled input — value always mirrors the `email` state.
            // On every keystroke, update `email` state and clear the email error.
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
            autoComplete="email" // Let the browser suggest saved email addresses.
            autoFocus // Move keyboard focus here automatically when the form appears.
          />
        </div>
        {/* Show the email validation error below the field, only when it exists. */}
        {errors.email && <span className="lp-field-error"><ErrorIcon /> {errors.email}</span>}
      </div>

      {/* Captcha display field — shows the random string the user must retype. */}
      <div className="lp-field">
        <label className="lp-label">Verify captcha</label>
        <div className="lp-captcha-row">
          {/* The box that renders the captcha characters for the user to read. */}
          {/* aria-label makes it accessible to screen readers. */}
          <div className="lp-captcha-display" aria-label={`Captcha: ${captchaText}`}>
            {captchaText}
          </div>
          {/* Button to generate a new captcha — useful if the current one is hard to read. */}
          {/* The `spinning` class triggers a CSS rotation animation for 500 ms. */}
          <button
            type="button" // Prevent this button from submitting the form.
            className={`lp-captcha-refresh${spinning ? ' spinning' : ''}`}
            onClick={refreshCaptcha}
            aria-label="Refresh captcha"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* Captcha answer input — the user types what they see above. */}
      <div className="lp-field">
        <label className="lp-label">Enter captcha</label>
        <input
          // Add `lp-error` class to turn border red if the answer was wrong.
          className={`lp-input-plain${errors.captcha ? ' lp-error' : ''}`}
          type="text"
          placeholder="Enter the characters above"
          value={captchaInput} // Controlled input mirroring `captchaInput` state.
          // On every keystroke update `captchaInput` and clear the captcha error.
          onChange={e => { setCaptchaInput(e.target.value); setErrors(p => ({ ...p, captcha: '' })) }}
          autoComplete="off" // Do not suggest saved values — captcha must be typed fresh each time.
          spellCheck={false} // Disable red squiggle underlines on captcha text.
        />
        {/* Show the captcha validation error below the field, only when it exists. */}
        {errors.captcha && <span className="lp-field-error"><ErrorIcon /> {errors.captcha}</span>}
      </div>

      {/* Submit button — disabled while the API call is in-flight to prevent double submission. */}
      <button className="lp-submit-btn" type="submit" disabled={loading}>
        {/* While loading, show a spinner + "Sending OTP…" text; otherwise show "Request OTP". */}
        {loading ? <><span className="lp-btn-spinner" /> Sending OTP…</> : 'Request OTP'}
      </button>

      {/* Small hint text explaining where the OTP will be delivered. */}
      <p className="lp-otp-hint">
        OTP will be sent to your registered email after captcha verification.
      </p>
    </form>
  )
}

/* ================================================================
   STEP 2 — OTP Verification
   ================================================================ */

// StepOTP is the second screen of the login flow.
// It displays 6 individual digit boxes and verifies the OTP against the server.
// `email`  — the address that the OTP was sent to (passed from the parent).
// `onBack` — callback to go back to Step 1 (the email/captcha screen).
function StepOTP({ email, onBack }) {
  // useNavigate lets us redirect to /dashboard after a successful login.
  const navigate             = useNavigate()

  // loginWithToken comes from our auth context — it saves the JWT token and updates login state.
  const { loginWithToken }   = useAuth()

  // `otp` is an array of 6 strings, one per digit box.  Initialised to 6 empty strings.
  const [otp,     setOtp]    = useState(Array(6).fill(''))

  // `loading` is true while the /auth/verify-otp API request is in-flight.
  const [loading, setLoading] = useState(false)

  // `errors` holds field-level error messages, e.g. { otp: 'Please enter all 6 digits' }.
  const [errors,  setErrors]  = useState({})

  // `apiError` holds any server-returned error message (e.g. "OTP expired").
  const [apiError,setApiError]= useState('')

  // `timer` counts down from 60 to 0 to show how long until the user can resend the OTP.
  const [timer,   setTimer]   = useState(60)

  // `canResend` becomes true when the timer reaches 0, enabling the Resend button.
  const [canResend, setCanResend] = useState(false)

  // `resending` is true while the resend API call is in-flight.
  const [resending, setResending] = useState(false)

  // `refs` is an array of references to the 6 OTP <input> DOM elements.
  // We use it to programmatically focus the next/previous box.
  const refs = useRef([])

  /* countdown timer */
  // This effect decrements `timer` by 1 every second until it reaches 0.
  // When timer hits 0 we enable the Resend button instead of scheduling another tick.
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return } // Timer done — enable resend and stop.
    // Schedule a 1-second timeout to decrement the timer by 1.
    const id = setTimeout(() => setTimer(t => t - 1), 1000)
    // Clean up the timeout if the component unmounts or `timer` changes before it fires.
    return () => clearTimeout(id)
  }, [timer]) // Re-run this effect every time `timer` changes.

  // focusNext moves keyboard focus to the next OTP input box (index + 1), if it exists.
  // Wrapped in useCallback so it is not recreated on every render (tiny performance win).
  const focusNext = useCallback((idx) => {
    if (idx < 5) refs.current[idx + 1]?.focus() // Optional chaining prevents errors if ref is null.
  }, [])

  // handleOtpChange is called whenever the user types into one of the 6 digit boxes.
  // `idx`  — which box (0–5).
  // `val`  — the new value the user typed.
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return // Reject non-digit characters immediately.
    const next = [...otp] // Copy the current OTP array to avoid mutating state directly.
    next[idx] = val.slice(-1) // Keep only the last character typed (so the box holds exactly 1 digit).
    setOtp(next) // Save the updated array back to state.
    setErrors({}) // Clear any OTP error whenever the user is actively typing.
    setApiError('') // Also clear the server error so the user isn't confused.
    if (val) focusNext(idx) // Auto-advance to the next box after typing a digit.
  }

  // handleKeyDown handles special keys in the OTP boxes for better keyboard navigation.
  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      // If the current box is already empty and there is a previous box, clear that box and move back.
      if (!otp[idx] && idx > 0) {
        const next = [...otp]; next[idx - 1] = ''
        setOtp(next)
        refs.current[idx - 1]?.focus() // Move focus to the previous box.
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      // Left arrow — move focus one box to the left.
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 5) {
      // Right arrow — move focus one box to the right.
      refs.current[idx + 1]?.focus()
    }
  }

  // handlePaste handles pasting a 6-digit OTP copied from an SMS or email.
  const handlePaste = (e) => {
    e.preventDefault() // Prevent the default paste behaviour so we control placement ourselves.
    // Extract only the digit characters from whatever was pasted, limit to 6.
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return // If no digits were found, do nothing.
    const next = Array(6).fill('') // Start with a fresh 6-empty-slot array.
    pasted.split('').forEach((ch, i) => { next[i] = ch }) // Fill each slot with the pasted digits.
    setOtp(next) // Save the filled array to state.
    // Move focus to the box right after the last pasted digit (or to box 5 if all 6 were pasted).
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // handleVerify is called when the user clicks "Verify OTP" or presses Enter.
  const handleVerify = async (e) => {
    e.preventDefault() // Stop the browser from reloading the page on form submit.
    const code = otp.join('') // Combine the 6 individual digit strings into one string like "483921".
    // Simple length check — if the user hasn't filled all 6 boxes, show an inline error.
    if (code.length < 6) { setErrors({ otp: 'Please enter all 6 digits' }); return }

    setLoading(true) // Show the loading spinner on the Verify button.
    setApiError('') // Clear any previous server error.
    try {
      // Send the email + OTP code to the server for verification.
      const res = await api.post('/auth/verify-otp', { email, otp: code })
      // Update both localStorage AND React auth state before navigating
      // loginWithToken saves the JWT to localStorage and updates the auth context so the app knows the user is logged in.
      loginWithToken(res.data.token, res.data.user)
      navigate('/dashboard') // Redirect to the main dashboard page after successful login.
    } catch (err) {
      // Show the server's error message (or a generic fallback) if verification failed.
      setApiError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
      setOtp(Array(6).fill('')) // Clear all OTP boxes so the user can type fresh.
      refs.current[0]?.focus() // Return focus to the first box.
    } finally {
      setLoading(false) // Always hide the spinner when the request finishes.
    }
  }

  // handleResend sends a new OTP to the same email address and resets the countdown timer.
  const handleResend = async () => {
    setResending(true) // Show "Resending…" text on the button.
    setApiError('') // Clear any previous error.
    try {
      // Call the same endpoint as Step 1 to send a fresh OTP.
      await api.post('/auth/request-otp', { email })
      setOtp(Array(6).fill('')) // Clear the OTP boxes so the user types the new code.
      setTimer(60) // Restart the 60-second countdown.
      setCanResend(false) // Disable the Resend button again until the timer expires.
      refs.current[0]?.focus() // Move focus back to the first OTP box.
    } catch (err) {
      // Show the server error or a generic fallback.
      setApiError(err.response?.data?.message || 'Could not resend OTP. Try again.')
    } finally {
      setResending(false) // Hide the "Resending…" state once the request is done.
    }
  }

  // The JSX rendered by StepOTP — the 6-box OTP entry form.
  return (
    // `noValidate` disables native browser validation so our custom messages are used.
    <form className="lp-form" onSubmit={handleVerify} noValidate>

      {/* Email badge — reminds the user which address the OTP was sent to. */}
      <div className="lp-otp-email-badge">
        OTP sent to <strong>{email}</strong>
      </div>

      {/* Server error banner — shown only when `apiError` contains a message. */}
      {apiError && (
        <div className="lp-error-alert">
          <ErrorIcon /> {apiError}
        </div>
      )}

      {/* 6-box OTP input group */}
      <div className="lp-field">
        {/* Centred label above the boxes */}
        <label className="lp-label" style={{ textAlign: 'center' }}>
          Enter 6-digit OTP
        </label>
        {/* Container for the 6 boxes; also handles paste events for the whole row. */}
        <div className="lp-otp-row" onPaste={handlePaste}>
          {/* Map over the 6-element `otp` array to render one input box per digit. */}
          {otp.map((digit, idx) => (
            <input
              key={idx} // React needs a stable key for each list item.
              // Store a reference to this DOM element so we can focus it programmatically.
              ref={el => refs.current[idx] = el}
              // Add `lp-filled` when there is a digit (visually distinguishes typed boxes).
              // Add `lp-error` to all boxes when there is an OTP error (red border on all).
              className={`lp-otp-box${digit ? ' lp-filled' : ''}${errors.otp ? ' lp-error' : ''}`}
              type="text"
              inputMode="numeric" // Show the numeric keyboard on mobile devices.
              maxLength={1} // Each box holds exactly one character.
              value={digit} // Controlled input — value mirrors the digit at this index.
              onChange={e => handleOtpChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              autoFocus={idx === 0} // Automatically focus the first box when the form appears.
            />
          ))}
        </div>
        {/* Show the OTP validation error centred below the boxes, only when it exists. */}
        {errors.otp && (
          <span className="lp-field-error" style={{ justifyContent: 'center' }}>
            <ErrorIcon /> {errors.otp}
          </span>
        )}
      </div>

      {/* Verify button — disabled while the API call is in-flight. */}
      <button className="lp-submit-btn" type="submit" disabled={loading}>
        {/* Show spinner + "Verifying…" while loading, otherwise "Verify OTP". */}
        {loading ? <><span className="lp-btn-spinner" /> Verifying…</> : 'Verify OTP'}
      </button>

      {/* Resend OTP row */}
      <div className="lp-resend-row">
        <span>Didn't receive it?</span>
        {/* The resend button is disabled while either the timer is still counting down or a resend is in-flight. */}
        <button
          type="button" // Not a submit button — just triggers handleResend.
          className="lp-resend-btn"
          onClick={handleResend}
          disabled={!canResend || resending}
        >
          {/* Show different button text depending on the current state:
              - "Resending…" while the API call is running,
              - "Resend OTP" when the timer has expired,
              - "Resend in Xs" while the timer is still counting down. */}
          {resending ? 'Resending…' : canResend ? 'Resend OTP' : `Resend in ${timer}s`}
        </button>
      </div>

      {/* Back button — calls onBack to return to the email/captcha Step 1 screen. */}
      <button
        type="button" // Not a submit button.
        className="lp-back"
        style={{ justifyContent: 'center', marginBottom: 0, maxWidth: '100%' }}
        onClick={onBack}
      >
        <ArrowLeftIcon /> Use a different email
      </button>
    </form>
  )
}

/* ================================================================
   MAIN — LoginPage
   ================================================================ */

// LoginPage is the top-level component exported from this file.
// It manages which "step" of the login flow is currently visible (1 = email/captcha, 2 = OTP).
export default function LoginPage() {
  // useNavigate is used to send the user to the home page when they click "Back to home".
  const navigate   = useNavigate()

  // `step` tracks which screen is showing: 1 = StepEmail, 2 = StepOTP.
  const [step,     setStep]     = useState(1)     // 1 | 2

  // `userEmail` stores the email address the user entered in Step 1 so we can pass it to Step 2.
  const [userEmail, setUserEmail] = useState('')

  // handleOTPRequested is called by StepEmail once the server confirms the OTP was sent.
  // It saves the email and advances the wizard to Step 2.
  const handleOTPRequested = (email) => {
    setUserEmail(email) // Remember the email so StepOTP can display it and pass it back to the API.
    setStep(2) // Show the OTP screen.
  }

  // The page layout: a full-screen container with a centred login card.
  return (
    // `lp-page` — the full-viewport wrapper (usually a flex container centring everything).
    <div className="lp-page">

      {/* Centered column: back button + card */}
      <div className="lp-card-col">

        {/* Back to home — sits right above the card */}
        {/* Clicking this navigates back to the "/" root route (the home/landing page). */}
        <button className="lp-back" onClick={() => navigate('/')}>
          <ArrowLeftIcon /> Back to home
        </button>

        {/* The white card that contains the logo, headings, and the active step form. */}
        <div className="lp-card">

          {/* EICTA Logo — displayed at the top of the card. */}
          <div className="lp-brand">
            <img
              src={eiectaLogo}
              alt="EICTA Logo"
              className="lp-brand-logo"
              // If the image fails to load (e.g. missing asset), hide the <img> and show
              // the sibling <span> fallback text "IFACET" instead.
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
            />
            {/* Fallback text shown only when the logo image fails to load. Hidden by default. */}
            <span className="lp-brand-fallback">IFACET</span>
          </div>

          {/* Main heading — changes text depending on which step is active. */}
          <h1 className="lp-heading">
            {step === 1 ? 'Sign in to your account' : 'Verify your identity'}
          </h1>

          {/* Subtitle — also changes depending on the active step. */}
          <p className="lp-subtitle">
            {step === 1
              ? 'Secure authentication for credential access'
              : 'Enter the OTP sent to your email below'}
          </p>

          {/* Conditional rendering: show StepEmail on step 1, StepOTP on step 2. */}
          {step === 1
            // Pass handleOTPRequested so StepEmail can advance the wizard when the API succeeds.
            ? <StepEmail onSuccess={handleOTPRequested} />
            // Pass the email and a callback to return to step 1.
            : <StepOTP   email={userEmail} onBack={() => setStep(1)} />
          }

        </div>

        {/* Footer note with a support mailto link. */}
        <p className="lp-footer">
          Need help?{' '}
          <a href="mailto:support@eict.academy">Contact support</a>
        </p>

      </div>

    </div>
  )
}
