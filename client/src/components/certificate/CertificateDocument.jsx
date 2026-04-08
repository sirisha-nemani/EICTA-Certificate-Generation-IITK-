// ─────────────────────────────────────────────────────────────────────────────
// CertificateDocument.jsx
//
// The ONE authoritative PDF component for the EICTA certificate.
// Used by BOTH:
//   • <PDFViewer>       in CertificatePreview  →  live in-browser preview
//   • <PDFDownloadLink> in CertificatePreview  →  downloaded .pdf file
//
// NEVER duplicate this layout. Always import and reuse this component.
//
// Page: Landscape A4  (842 pt × 595 pt, ISO 216)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'

// All layout primitives from @react-pdf/renderer.
import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer'

// ── Logo imports ──────────────────────────────────────────────────────────────
import indianEmblem from '../../assets/Indian-emblem.png' // Left  – Indian govt. national emblem
import iitkLogo    from '../../assets/iitk logo.png'      // Centre – IIT Kanpur logo
import tagLogo     from '../../assets/tag-logo.png'       // Right  – EICTA / TAG consortium logo

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD      = '#C9A646'   // Primary gold  – border, "Certificate" title, consortium heading
const BLACK     = '#1A1A1A'   // Near-black    – body / name / date text
const GREY      = '#666666'   // Mid grey      – subtitle, footer, sig role, issue date
const FOOTER_BG = '#F4F4F4'   // Off-white     – footer strip background

// Gold border inset from the page edge (pt).  14 pt ≈ 5 mm.
const INSET = 14

// ─── StyleSheet ───────────────────────────────────────────────────────────────
// IMPORTANT: @react-pdf/renderer does NOT support the CSS `gap` property.
// All inter-child spacing uses marginRight / marginBottom on individual children.
const S = StyleSheet.create({

  // ── Page ────────────────────────────────────────────────────────────────────
  // orientation="landscape" on <Page> gives 842 × 595 pt (A4 landscape).
  // paddingBottom: 0 lets the footer strip sit flush against the gold border.
  page: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    paddingTop: 20,
    paddingHorizontal: 46,
    paddingBottom: 0,
  },

  // ── Gold border ─────────────────────────────────────────────────────────────
  // position:'absolute' overlays the border on all page content without
  // consuming space in the flex layout.
  // fixed={true} on the JSX element repeats it on every page.
  border: {
    position: 'absolute',
    top:    INSET,
    left:   INSET,
    right:  INSET,
    bottom: INSET,
    borderWidth: 2,
    borderColor: GOLD,
    borderStyle: 'solid',
  },

  // ── Logo row ─────────────────────────────────────────────────────────────────
  // justifyContent:'center' clusters all three logo groups in the horizontal
  // centre of the page rather than spreading them to the edges.
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 6,
  },

  // LEFT group: emblem + MeitY text side by side.
  // marginRight: 20 creates the gap between this group and the center logo.
  // No gap property — use marginRight on the emblem image instead.
  logoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },

  // Indian national emblem – 56 × 56 pt, aspect-ratio preserved.
  // marginRight: 8 replaces the unsupported `gap` between emblem and text.
  emblemImg: {
    width: 56,
    height: 56,
    objectFit: 'contain',
    marginRight: 8,
  },

  // MeitY label: small, uppercase, bold sans-serif
  meityText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    lineHeight: 1.55,
    textTransform: 'uppercase',
    maxWidth: 80,
  },

  // CENTRE group: IIT Kanpur logo.
  // marginRight: 20 creates the gap between center logo and right logo.
  logoCenter: {
    alignItems: 'center',
    marginRight: 20,
  },

  // IIT Kanpur logo – wider to preserve aspect ratio
  iitkImg: {
    width: 90,
    height: 56,
    objectFit: 'contain',
  },

  // RIGHT group: EICTA / TAG logo only (no text block beside it)
  logoRight: {
    alignItems: 'center',
  },

  // EICTA TAG consortium logo
  tagImg: {
    width: 80,
    height: 52,
    objectFit: 'contain',
  },

  // ── "EICTA Consortium" heading ────────────────────────────────────────────────
  // Gold (#C9A646), bold, centred — directly below the logo row.
  consortiumTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  // Subtitle in parentheses — slightly bolder italic serif
  consortiumSub: {
    fontSize: 9.5,
    fontFamily: 'Times-BoldItalic',
    color: GREY,
    textAlign: 'center',
    marginBottom: 6,
  },

  // ── "Certificate" – the centrepiece title ─────────────────────────────────────
  // 52 pt Times-BoldItalic in gold.  Largest, most prominent element.
  certTitle: {
    fontSize: 52,
    fontFamily: 'Times-BoldItalic',
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  // ── Body text wrapper ─────────────────────────────────────────────────────────
  bodyWrap: {
    alignItems: 'center',
    width: '100%',
  },

  // Standard body line – preamble / linking words / date range
  bodyLine: {
    fontSize: 13,
    fontFamily: 'Times-Roman',
    color: BLACK,
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: 4,
  },

  // "Dr. / Mr. / Ms. [Student Name]" – large bold; the student is the star
  studentLine: {
    fontSize: 17,
    fontFamily: 'Times-Bold',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 1,
  },

  // "[College Name]" – bold, slightly smaller than student name
  collegeLine: {
    fontSize: 15,
    fontFamily: 'Times-Bold',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Inline bold span inside a mixed-weight <Text>
  inlineBold: {
    fontFamily: 'Times-Bold',
  },

  // "[Course Name]" – bold, largest body element; the primary credential fact
  courseLine: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    color: BLACK,
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 4,
  },

  // ── Flex spacer ───────────────────────────────────────────────────────────────
  // Expands to fill remaining vertical space, pushing the bottom row to the foot.
  spacer: {
    flexGrow: 1,
    minHeight: 6,
  },

  // ── Bottom row ────────────────────────────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 10,
  },

  // QR code block: image above the issue-date label.
  // No gap — use marginBottom on the qrImg instead.
  qrBlock: {
    alignItems: 'flex-start',
  },

  // QR code image – marginBottom replaces the unsupported `gap` on parent
  qrImg: {
    width: 72,
    height: 72,
    marginBottom: 5,
  },

  issueDateText: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    color: GREY,
  },

  sigBlock: {
    alignItems: 'center',
  },

  sigLine: {
    width: 160,
    height: 1,
    backgroundColor: '#444444',
    marginBottom: 5,
  },

  sigName: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 2,
  },

  sigRole: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    color: GREY,
    textAlign: 'center',
    lineHeight: 1.45,
  },

  // ── Footer strip ──────────────────────────────────────────────────────────────
  // marginHorizontal: -46 cancels paddingHorizontal so the strip bleeds to edges.
  // marginBottom: -(INSET+2) tucks it flush inside the gold border.
  footer: {
    backgroundColor: FOOTER_BG,
    borderTopWidth: 0.75,
    borderTopColor: '#DDDDDD',
    borderTopStyle: 'solid',
    paddingVertical: 6,
    paddingHorizontal: 46,
    marginHorizontal: -46,
    marginBottom: -(INSET + 2),
  },

  footerText: {
    fontSize: 8.5,
    fontFamily: 'Times-Roman',
    color: GREY,
    textAlign: 'center',
    lineHeight: 1.5,
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// CertificateDocument
//
// Props:
//   studentName  – recipient full name
//   collegeName  – institution name
//   courseName   – certificate course title
//   startDate    – programme start date  (DD-MM-YYYY)
//   endDate      – programme end date    (DD-MM-YYYY)
//   issueDate    – date of issue         (DD-MM-YYYY)
//   program      – programme type label  (e.g. "Faculty Development Program")
//   qrDataUrl    – base64 PNG data URL for the QR code (from qrcode package)
// ─────────────────────────────────────────────────────────────────────────────
export default function CertificateDocument({
  studentName  = 'Student Name',
  collegeName  = 'College Name',
  courseName   = 'Course Name',
  startDate    = '01-01-2026',
  endDate      = '31-01-2026',
  issueDate    = '02-02-2026',
  program      = 'Faculty Development Program',
  qrDataUrl    = null,
}) {
  return (
    <Document title={`EICTA Certificate — ${courseName}`}>

      {/*
        size="A4" orientation="landscape" → 842 × 595 pt (ISO 216 landscape).
        style={S.page} → white background, flex column, content padding.
      */}
      <Page size="A4" orientation="landscape" style={S.page}>

        {/* ── Gold decorative border ─────────────────────────────────────── */}
        <View style={S.border} fixed />

        {/* ══════════════════════════════════════════════════════════════════
            LOGO ROW — compact centered cluster
            Three groups: LEFT (emblem+text) · CENTRE (IITK) · RIGHT (TAG)
            justifyContent:'center' clusters them in the middle of the page.
            Inter-group spacing via marginRight on left and center groups.
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={S.logoRow}>

          {/* LEFT — Indian national emblem + MeitY ministry label */}
          <View style={S.logoLeft}>
            {/*
              marginRight on emblem (8pt) replaces the unsupported gap property.
              @react-pdf/renderer does not support CSS gap on flex containers.
            */}
            <Image src={indianEmblem} style={S.emblemImg} />
            <Text style={S.meityText}>
              Ministry of{'\n'}Electronics and{'\n'}Information Technology
            </Text>
          </View>

          {/* CENTRE — IIT Kanpur logo (marginRight separates from right group) */}
          <View style={S.logoCenter}>
            <Image src={iitkLogo} style={S.iitkImg} />
          </View>

          {/* RIGHT — EICTA / TAG consortium logo only (no text block) */}
          <View style={S.logoRight}>
            <Image src={tagLogo} style={S.tagImg} />
          </View>

        </View>
        {/* ══ END LOGO ROW ══ */}

        {/* ── "EICTA Consortium" heading — gold, bold, immediately below logos ── */}
        <Text style={S.consortiumTitle}>EICTA Consortium</Text>

        {/* ── Joint-initiative subtitle ── */}
        <Text style={S.consortiumSub}>
          (A Joint Initiative of MeitY and IITs, NITs and IIITs)
        </Text>

        {/* ── "Certificate" — the centrepiece title ──────────────────────────
            52 pt Times-BoldItalic in gold (#C9A646).
        ─────────────────────────────────────────────────────────────────── */}
        <Text style={S.certTitle}>Certificate</Text>

        {/* ══════════════════════════════════════════════════════════════════
            BODY TEXT BLOCK — seven centred lines, tight spacing
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={S.bodyWrap}>

          <Text style={S.bodyLine}>This is to certify that</Text>

          <Text style={S.studentLine}>
            Dr. / Mr. / Ms.{'  '}{studentName}
          </Text>

          <Text style={S.bodyLine}>of</Text>

          <Text style={S.collegeLine}>{collegeName}</Text>

          {/* Mixed-weight line: program name is bolded inline */}
          <Text style={S.bodyLine}>
            {'has completed the '}
            <Text style={S.inlineBold}>{program}</Text>
            {' on'}
          </Text>

          <Text style={S.courseLine}>{courseName}</Text>

          <Text style={S.bodyLine}>
            {'from '}
            {startDate}
            {' to '}
            {endDate}
          </Text>

        </View>
        {/* ══ END BODY TEXT ══ */}

        {/* ── Flex spacer — pushes the bottom row to the foot of the page ── */}
        <View style={S.spacer} />

        {/* ══════════════════════════════════════════════════════════════════
            BOTTOM ROW — QR left · Signature right · shared bottom baseline
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={S.bottomRow}>

          {/* QR CODE BLOCK (bottom-left) */}
          <View style={S.qrBlock}>
            {/*
              marginBottom on qrImg (5pt) replaces the unsupported gap on parent.
              Guard with && so null qrDataUrl doesn't crash the renderer.
            */}
            {qrDataUrl && <Image src={qrDataUrl} style={S.qrImg} />}
            <Text style={S.issueDateText}>Date of Issue: {issueDate}</Text>
          </View>

          {/* SIGNATURE BLOCK (bottom-right) */}
          <View style={S.sigBlock}>
            <View style={S.sigLine} />
            <Text style={S.sigName}>Prof. B. V. Phani</Text>
            <Text style={S.sigRole}>
              Chief Investigator, E&ICT Academy,{'\n'}IIT Kanpur
            </Text>
          </View>

        </View>
        {/* ══ END BOTTOM ROW ══ */}

        {/* ── Footer strip ───────────────────────────────────────────────────
            Off-white band listing EICT Academy partner institutions.
        ─────────────────────────────────────────────────────────────────── */}
        <View style={S.footer}>
          <Text style={S.footerText}>
            EICT Academies:{'  '}IIT Kanpur{'  ·  '}IIT Guwahati{'  ·  '}
            IIT Roorkee{'  ·  '}MNIT Jaipur{'  ·  '}
            IIITDM Jabalpur{'  ·  '}NIT Patna{'  ·  '}NIT Warangal
          </Text>
        </View>

      </Page>
    </Document>
  )
}
