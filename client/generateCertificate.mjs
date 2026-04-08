// ─────────────────────────────────────────────────────────────────────────────
// generateCertificate.mjs
//
// Terminal CLI script – generates an EICTA certificate PDF from command-line
// arguments and writes it to disk, without needing the browser or Vite dev server.
//
// HOW TO RUN  (from inside the  client/  folder):
// ─────────────────────────────────────────────────────────────────────────────
//   node generateCertificate.mjs \
//     --name="Sirisha Nemani" \
//     --college="IIT Madras" \
//     --course="Advanced Embedded Systems" \
//     --start="01-01-2026" \
//     --end="31-01-2026" \
//     --issue="02-02-2026" \
//     --program="Faculty Development Program" \
//     --output="my_certificate.pdf"
//
// Requires:  Node.js ≥ 18  (uses  util.parseArgs  which landed in Node 18)
// All flags are optional – safe defaults are used for any that are omitted.
// The generated PDF is written to  --output  (default: certificate.pdf)
// in the current working directory.
// ─────────────────────────────────────────────────────────────────────────────

// ── Node built-ins ────────────────────────────────────────────────────────────
import { parseArgs }    from 'util'          // CLI argument parser (Node 18+)
import { writeFileSync } from 'fs'           // Sync file writer
import { fileURLToPath } from 'url'          // Converts import.meta.url → file path
import { dirname, join } from 'path'         // Cross-platform path joining
import { createCanvas }  from 'canvas'       // Only needed if qrcode's canvas backend is missing

// ── React (needed by @react-pdf/renderer – it uses React.createElement internally) ──
import React from 'react'

// ── @react-pdf/renderer Node API ─────────────────────────────────────────────
// `pdf()` returns an object with  .toBuffer()  and  .toBlob()  methods.
// It accepts a React element tree (Document → Page → View / Text / Image).
// StyleSheet compiles style objects the same way it does in the browser.
import {
  Document, Page, View, Text, Image, StyleSheet, pdf,
} from '@react-pdf/renderer'

// ── QR code generator ─────────────────────────────────────────────────────────
// The `qrcode` package works in both Node.js and the browser.
// toDataURL() returns a Promise<string> (base64 PNG) that @react-pdf/renderer
// can embed directly into an <Image> element.
import QRCode from 'qrcode'

// ─────────────────────────────────────────────────────────────────────────────
// Parse CLI arguments using Node 18's built-in  util.parseArgs
// ─────────────────────────────────────────────────────────────────────────────
const { values: args } = parseArgs({
  args: process.argv.slice(2),              // Skip 'node' and the script filename
  options: {
    name:    { type: 'string', default: 'Student Name'                },
    college: { type: 'string', default: 'College Name'               },
    course:  { type: 'string', default: 'Course Name'                },
    start:   { type: 'string', default: '01-01-2026'                 },
    end:     { type: 'string', default: '31-01-2026'                 },
    issue:   { type: 'string', default: '02-02-2026'                 },
    program: { type: 'string', default: 'Faculty Development Program' },
    id:      { type: 'string', default: '001'                        },
    output:  { type: 'string', default: 'certificate.pdf'            },
  },
  strict: false,                            // Ignore unknown flags gracefully
})

// ─────────────────────────────────────────────────────────────────────────────
// Resolve absolute paths to the logo image files.
//
// import.meta.url  →  file:///.../client/generateCertificate.mjs
// fileURLToPath()  →  C:\...\client\generateCertificate.mjs   (or Unix equiv.)
// dirname()        →  C:\...\client\
//
// @react-pdf/renderer Image accepts local file-system paths in Node.js.
// ─────────────────────────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url))
const EMBLEM_SRC = join(__dirname, 'src', 'assets', 'Indian-emblem.png')
const IITK_SRC   = join(__dirname, 'src', 'assets', 'iitk logo.png')
const TAG_SRC    = join(__dirname, 'src', 'assets', 'tag-logo.png')

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens  (kept in sync with CertificateDocument.jsx)
// ─────────────────────────────────────────────────────────────────────────────
const GOLD      = '#C9A646'   // Gold – border + "Certificate" title + consortium heading
const BLACK     = '#1A1A1A'   // Near-black – body text
const GREY      = '#666666'   // Mid-grey – subtitle, footer, sig role
const FOOTER_BG = '#F4F4F4'   // Off-white – footer strip background
const INSET     = 14          // Gold border inset from page edge (pt)

// ─────────────────────────────────────────────────────────────────────────────
// StyleSheet  (mirrors CertificateDocument.jsx exactly)
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: @react-pdf/renderer does NOT support the CSS `gap` property.
// All inter-child spacing uses marginRight / marginBottom on individual children.
const S = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    paddingTop: 20,
    paddingHorizontal: 46,
    paddingBottom: 0,
  },
  border: {
    position: 'absolute',
    top: INSET, left: INSET, right: INSET, bottom: INSET,
    borderWidth: 2, borderColor: GOLD, borderStyle: 'solid',
  },
  // justifyContent:'center' clusters the three logo groups as a compact unit
  logoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', width: '100%', marginBottom: 6,
  },
  // marginRight on group replaces gap between groups
  // marginRight on emblemImg replaces gap between emblem and text
  logoLeft:  { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  emblemImg: { width: 56, height: 56, objectFit: 'contain', marginRight: 8 },
  meityText: {
    fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: BLACK,
    lineHeight: 1.55, textTransform: 'uppercase', maxWidth: 80,
  },
  logoCenter: { alignItems: 'center', marginRight: 20 },
  iitkImg:   { width: 90, height: 56, objectFit: 'contain' },
  logoRight:  { alignItems: 'center' },
  tagImg:    { width: 80, height: 52, objectFit: 'contain' },
  consortiumTitle: {
    fontSize: 18, fontFamily: 'Helvetica-Bold', color: GOLD,
    textAlign: 'center', marginBottom: 2, letterSpacing: 0.5,
  },
  consortiumSub: {
    fontSize: 9.5, fontFamily: 'Times-BoldItalic', color: GREY,
    textAlign: 'center', marginBottom: 6,
  },
  certTitle: {
    fontSize: 52, fontFamily: 'Times-BoldItalic', color: GOLD,
    textAlign: 'center', letterSpacing: 1.5, marginBottom: 10,
  },
  bodyWrap:  { alignItems: 'center', width: '100%' },
  bodyLine:  {
    fontSize: 13, fontFamily: 'Times-Roman', color: BLACK,
    textAlign: 'center', lineHeight: 1.4, marginBottom: 4,
  },
  studentLine: {
    fontSize: 17, fontFamily: 'Times-Bold', color: BLACK,
    textAlign: 'center', marginBottom: 4, marginTop: 1,
  },
  collegeLine: {
    fontSize: 15, fontFamily: 'Times-Bold', color: BLACK,
    textAlign: 'center', marginBottom: 4,
  },
  inlineBold: { fontFamily: 'Times-Bold' },
  courseLine: {
    fontSize: 16, fontFamily: 'Times-Bold', color: BLACK,
    textAlign: 'center', marginTop: 1, marginBottom: 4,
  },
  spacer: { flexGrow: 1, minHeight: 6 },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', width: '100%', marginBottom: 10,
  },
  // marginBottom on qrImg replaces the unsupported gap on parent
  qrBlock:       { alignItems: 'flex-start' },
  qrImg:         { width: 72, height: 72, marginBottom: 5 },
  issueDateText: { fontSize: 9, fontFamily: 'Times-Roman', color: GREY },
  sigBlock:      { alignItems: 'center' },
  sigLine:       { width: 160, height: 1, backgroundColor: '#444444', marginBottom: 5 },
  sigName: {
    fontSize: 12, fontFamily: 'Times-Bold', color: BLACK,
    textAlign: 'center', marginBottom: 2,
  },
  sigRole: {
    fontSize: 9, fontFamily: 'Times-Roman', color: GREY,
    textAlign: 'center', lineHeight: 1.45,
  },
  footer: {
    backgroundColor: FOOTER_BG,
    borderTopWidth: 0.75, borderTopColor: '#DDDDDD', borderTopStyle: 'solid',
    paddingVertical: 6, paddingHorizontal: 46,
    marginHorizontal: -46, marginBottom: -(INSET + 2),
  },
  footerText: {
    fontSize: 8.5, fontFamily: 'Times-Roman', color: GREY,
    textAlign: 'center', lineHeight: 1.5,
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// buildDocument(data)
//
// Builds the @react-pdf/renderer element tree using React.createElement()
// instead of JSX.  No Babel or Vite transpilation is needed — plain Node ESM.
//
// This is the Node.js equivalent of <CertificateDocument {...data} />.
// ─────────────────────────────────────────────────────────────────────────────
function buildDocument({ studentName, collegeName, courseName, startDate, endDate,
                          issueDate, program, qrDataUrl }) {
  // Alias for brevity — R.ce(...) instead of React.createElement(...)
  const ce = React.createElement

  return ce(Document, { title: `EICTA Certificate — ${courseName}` },
    ce(Page, { size: 'A4', orientation: 'landscape', style: S.page },

      // Gold border (absolutely positioned, repeats on every page)
      ce(View, { style: S.border, fixed: true }),

      // ── Logo row: compact centered cluster ────────────────────────────────
      // justifyContent:'center' clusters all three groups in the middle.
      // marginRight on groups/images replaces unsupported gap property.
      ce(View, { style: S.logoRow },
        // LEFT: emblem + MeitY text (marginRight on emblemImg = 8pt gap)
        ce(View, { style: S.logoLeft },
          ce(Image, { src: EMBLEM_SRC, style: S.emblemImg }),
          ce(Text,  { style: S.meityText },
            'Ministry of\nElectronics and\nInformation Technology'),
        ),
        // CENTRE: IITK logo (marginRight on logoCenter = 20pt gap to right group)
        ce(View, { style: S.logoCenter },
          ce(Image, { src: IITK_SRC, style: S.iitkImg }),
        ),
        // RIGHT: TAG / EICTA logo only (no text block beside it)
        ce(View, { style: S.logoRight },
          ce(Image, { src: TAG_SRC, style: S.tagImg }),
        ),
      ),

      // ── Headings ──────────────────────────────────────────────────────────
      ce(Text, { style: S.consortiumTitle }, 'EICTA Consortium'),
      ce(Text, { style: S.consortiumSub  },
        '(A Joint Initiative of MeitY and IITs, NITs and IIITs)'),
      ce(Text, { style: S.certTitle      }, 'Certificate'),

      // ── Body text ─────────────────────────────────────────────────────────
      ce(View, { style: S.bodyWrap },
        ce(Text, { style: S.bodyLine    }, 'This is to certify that'),
        ce(Text, { style: S.studentLine }, `Dr. / Mr. / Ms.  ${studentName}`),
        ce(Text, { style: S.bodyLine    }, 'of'),
        ce(Text, { style: S.collegeLine }, collegeName),
        // Mixed-weight line: regular + bold inline
        ce(Text, { style: S.bodyLine },
          'has completed the ',
          ce(Text, { style: S.inlineBold }, program),
          ' on',
        ),
        ce(Text, { style: S.courseLine }, courseName),
        ce(Text, { style: S.bodyLine   }, `from ${startDate} to ${endDate}`),
      ),

      // ── Flex spacer ────────────────────────────────────────────────────────
      ce(View, { style: S.spacer }),

      // ── Bottom row: QR left, Signature right ──────────────────────────────
      ce(View, { style: S.bottomRow },
        // QR block
        ce(View, { style: S.qrBlock },
          ...(qrDataUrl ? [ce(Image, { src: qrDataUrl, style: S.qrImg })] : []),
          ce(Text, { style: S.issueDateText }, `Date of Issue: ${issueDate}`),
        ),
        // Signature block
        ce(View, { style: S.sigBlock },
          ce(View, { style: S.sigLine }),
          ce(Text, { style: S.sigName }, 'Prof. B. V. Phani'),
          ce(Text, { style: S.sigRole },
            'Chief Investigator, E&ICT Academy,\nIIT Kanpur'),
        ),
      ),

      // ── Footer strip ───────────────────────────────────────────────────────
      ce(View, { style: S.footer },
        ce(Text, { style: S.footerText },
          'EICT Academies:  IIT Kanpur  ·  IIT Guwahati  ·  ' +
          'IIT Roorkee  ·  MNIT Jaipur  ·  ' +
          'IIITDM Jabalpur  ·  NIT Patna  ·  NIT Warangal'),
      ),

    ) // end Page
  ) // end Document
}

// ─────────────────────────────────────────────────────────────────────────────
// main()  –  async entry point
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎓  EICTA Certificate Generator')
  console.log('─'.repeat(42))
  console.log(`  Student : ${args.name}`)
  console.log(`  College : ${args.college}`)
  console.log(`  Course  : ${args.course}`)
  console.log(`  Period  : ${args.start} → ${args.end}`)
  console.log(`  Issued  : ${args.issue}`)
  console.log(`  Output  : ${args.output}`)
  console.log('─'.repeat(42))

  // ── Step 1: generate QR code as base64 PNG ─────────────────────────────
  console.log('\n  Generating QR code…')
  const verifyUrl = `https://portal.eicta.iitk.ac.in/verify/${args.id}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 128, margin: 1 })
    .catch(err => {
      console.warn('  ⚠  QR generation failed (certificate will be generated without it):', err.message)
      return null
    })

  // ── Step 2: build the React element tree ───────────────────────────────
  console.log('  Building PDF document…')
  const docElement = buildDocument({
    studentName : args.name,
    collegeName : args.college,
    courseName  : args.course,
    startDate   : args.start,
    endDate     : args.end,
    issueDate   : args.issue,
    program     : args.program,
    qrDataUrl,
  })

  // ── Step 3: render to buffer and write to disk ─────────────────────────
  // pdf(element) → { toBuffer(), toBlob(), toStream() }
  // toBuffer()   → Promise<Buffer> containing the raw PDF bytes
  console.log('  Rendering to PDF…')
  const buffer = await pdf(docElement).toBuffer()

  // Resolve the output path relative to where the script was called from
  const outputPath = join(process.cwd(), args.output)
  writeFileSync(outputPath, buffer)

  console.log(`\n  ✅  Certificate saved to: ${outputPath}`)
  console.log('─'.repeat(42) + '\n')
}

// Run main() and exit with code 1 on any unhandled error
main().catch(err => {
  console.error('\n  ❌  Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
