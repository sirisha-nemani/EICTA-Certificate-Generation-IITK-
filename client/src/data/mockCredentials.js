// ─────────────────────────────────────────────────────────────────────────────
// mockCredentials.js
//
// Single source of truth for credential mock data.
// Imported by CertificatePage, CertificatePdfPage, and any other page that
// needs to look up a credential by URL index.
//
// TODO: Replace with a real API call once the backend credentials endpoint exists.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CREDENTIALS = [
  {
    id:                1,
    studentName:       'Student Name',
    collegeName:       'College of Engineering',
    program:           'Faculty Development Program',
    specialization:    'Electronics',
    course:            'Advanced Embedded Systems Design',
    certificateId:     'EICT/2025/AES/12345',
    fromDate:          '2025-01-01',
    toDate:            '2025-01-31',
    issued:            '2025-02-02',
    issuingAuthority:  'E&ICT Academy, IIT Kanpur',
    issuanceTimestamp: 'Sunday, February 2, 2025 at 05:30:00 AM',
  },
  {
    id:                2,
    studentName:       'Student Name',
    collegeName:       'College of Engineering',
    program:           'Faculty Development Program',
    specialization:    'Communication Technology',
    course:            'IoT and Wireless Communication',
    certificateId:     'EICT/2026/IOT/67890',
    fromDate:          '2026-01-01',
    toDate:            '2026-01-31',
    issued:            '2026-02-17',
    issuingAuthority:  'E&ICT Academy, IIT Kanpur',
    issuanceTimestamp: 'Tuesday, February 17, 2026 at 05:30:00 AM',
  },
]

/** Returns the credential at the given 0-based URL index, with safe fallback. */
export function getCredentialByIndex(index) {
  const idx = parseInt(index ?? '0', 10)
  return MOCK_CREDENTIALS[idx] ?? MOCK_CREDENTIALS[0]
}
