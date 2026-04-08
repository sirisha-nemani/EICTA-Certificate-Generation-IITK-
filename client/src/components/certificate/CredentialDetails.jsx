// CredentialDetails.jsx
// Full-width grid card showing all eight credential fields.
// Desktop: 4-column grid (2 rows).
// Mobile:  2-column grid (4 rows).
//
// Props:
//   credential – the credential object (see MOCK_CREDENTIALS in CertificatePage)

// ─────────────────────────────────────────────────────────────
// Field definitions — label + key mapping to credential object
// ─────────────────────────────────────────────────────────────
const FIELDS = [
  { label: 'Programme',      key: 'program'         },
  { label: 'Full Name',      key: 'studentName'     },
  { label: 'College Name',   key: 'collegeName'     },
  { label: 'Start Date',     key: 'fromDate'        },
  { label: 'Course Name',    key: 'course'          },
  { label: 'Certificate ID', key: 'certificateId'   },
  { label: 'End Date',       key: 'toDate'          },
  { label: 'Issue Date',     key: 'issued'          },
]

// ─────────────────────────────────────────────────────────────
// CredentialDetails
// ─────────────────────────────────────────────────────────────
export default function CredentialDetails({ credential }) {
  return (
    <div className="cdp-details-card">
      <h3 className="cdp-details-title">Credential Details</h3>

      <div className="cdp-details-grid">
        {FIELDS.map(({ label, key }) => (
          <div key={key} className="cdp-details-cell">
            <p className="cdp-details-label">{label}</p>
            <p className="cdp-details-value">{credential[key] || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
