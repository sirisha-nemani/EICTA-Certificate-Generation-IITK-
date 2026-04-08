from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Flowable
import os

OUTPUT = r"C:\Users\Sirisha Nemani\OneDrive\Desktop\IFACET_OTP_Flow_Guide.pdf"

# ── Colours ──────────────────────────────────────────────────────────────────
BLUE        = colors.HexColor("#3B5BDB")
LIGHT_BLUE  = colors.HexColor("#EEF2FF")
DARK        = colors.HexColor("#212529")
GREY        = colors.HexColor("#6C757D")
LIGHT_GREY  = colors.HexColor("#F8F9FA")
MID_GREY    = colors.HexColor("#DEE2E6")
GREEN       = colors.HexColor("#2F9E44")
LIGHT_GREEN = colors.HexColor("#EBFBEE")
ORANGE      = colors.HexColor("#E67700")
LIGHT_ORANGE= colors.HexColor("#FFF9DB")
RED         = colors.HexColor("#C92A2A")
LIGHT_RED   = colors.HexColor("#FFF5F5")
PURPLE      = colors.HexColor("#6741D9")
LIGHT_PURPLE= colors.HexColor("#F3F0FF")
WHITE       = colors.white
BLACK       = colors.black

# ── Styles ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

cover_title = S("CoverTitle",
    fontSize=32, fontName="Helvetica-Bold",
    textColor=WHITE, alignment=TA_CENTER, spaceAfter=6)

cover_sub = S("CoverSub",
    fontSize=14, fontName="Helvetica",
    textColor=colors.HexColor("#C5D0FA"), alignment=TA_CENTER, spaceAfter=4)

cover_meta = S("CoverMeta",
    fontSize=11, fontName="Helvetica",
    textColor=colors.HexColor("#A5B4FC"), alignment=TA_CENTER)

h1 = S("H1",
    fontSize=18, fontName="Helvetica-Bold",
    textColor=BLUE, spaceBefore=18, spaceAfter=8,
    borderPad=4)

h2 = S("H2",
    fontSize=14, fontName="Helvetica-Bold",
    textColor=DARK, spaceBefore=14, spaceAfter=6)

h3 = S("H3",
    fontSize=11, fontName="Helvetica-Bold",
    textColor=BLUE, spaceBefore=10, spaceAfter=4)

body = S("Body",
    fontSize=10, fontName="Helvetica",
    textColor=DARK, spaceAfter=5, leading=15,
    alignment=TA_JUSTIFY)

body_left = S("BodyLeft",
    fontSize=10, fontName="Helvetica",
    textColor=DARK, spaceAfter=5, leading=15)

code_style = S("Code",
    fontSize=8.5, fontName="Courier",
    textColor=colors.HexColor("#212529"),
    backColor=colors.HexColor("#F1F3F5"),
    borderPad=6, spaceAfter=6, leading=13,
    leftIndent=10, rightIndent=10)

bullet = S("Bullet",
    fontSize=10, fontName="Helvetica",
    textColor=DARK, spaceAfter=4, leading=14,
    leftIndent=16, bulletIndent=4)

note_style = S("Note",
    fontSize=9.5, fontName="Helvetica-Oblique",
    textColor=GREY, spaceAfter=4, leading=13)

step_num = S("StepNum",
    fontSize=20, fontName="Helvetica-Bold",
    textColor=WHITE, alignment=TA_CENTER)

step_title = S("StepTitle",
    fontSize=11, fontName="Helvetica-Bold",
    textColor=DARK, spaceAfter=2)

step_body = S("StepBody",
    fontSize=9.5, fontName="Helvetica",
    textColor=GREY, leading=13)

label_style = S("Label",
    fontSize=8, fontName="Helvetica-Bold",
    textColor=WHITE, alignment=TA_CENTER)

# ── Helper Flowables ─────────────────────────────────────────────────────────
class ColorRect(Flowable):
    """Colored rectangle as background for cover"""
    def __init__(self, w, h, color):
        super().__init__()
        self.w, self.h, self.color = w, h, color
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 0, self.w, self.h, fill=1, stroke=0)

def hr(color=MID_GREY, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=8, spaceBefore=4)

def sp(h=6):
    return Spacer(1, h)

def section_header(text, color=BLUE):
    """Blue pill-style section header"""
    data = [[Paragraph(text, S("SH", fontSize=13, fontName="Helvetica-Bold",
                               textColor=WHITE, alignment=TA_CENTER))]]
    t = Table(data, colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [color]),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("RIGHTPADDING",  (0,0), (-1,-1), 16),
        ("ROUNDEDCORNERS", [8]),
    ]))
    return t

def info_box(text, bg=LIGHT_BLUE, border=BLUE):
    data = [[Paragraph(text, S("IB", fontSize=9.5, fontName="Helvetica",
                               textColor=DARK, leading=14))]]
    t = Table(data, colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("LINEBEFORETABLE",(0,0),(-1,-1), 0.5, border),
        ("BOX",           (0,0), (-1,-1), 1, border),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
        ("RIGHTPADDING",  (0,0), (-1,-1), 14),
        ("ROUNDEDCORNERS",[6]),
    ]))
    return t

def code_block(text):
    data = [[Paragraph(text.replace("\n","<br/>").replace(" ","&nbsp;"), code_style)]]
    t = Table(data, colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#F1F3F5")),
        ("BOX",           (0,0), (-1,-1), 1, MID_GREY),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("ROUNDEDCORNERS",[4]),
    ]))
    return t

def file_tag(path, role_color=BLUE):
    data = [[Paragraph(path, S("FT", fontSize=8, fontName="Courier",
                               textColor=WHITE))]]
    t = Table(data, colWidths=["100%"])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), role_color),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS",[4]),
    ]))
    return t

def two_col_table(rows, col1_w=200, col2_w=None, header=None, header_color=BLUE):
    page_w = A4[0] - 4*cm
    c2 = col2_w or (page_w - col1_w)
    data = []
    if header:
        data.append([
            Paragraph(header[0], S("TH0", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE)),
            Paragraph(header[1], S("TH1", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE)),
        ])
    for r in rows:
        data.append([
            Paragraph(str(r[0]), S("TC0", fontSize=9, fontName="Courier", textColor=DARK, leading=13)),
            Paragraph(str(r[1]), S("TC1", fontSize=9, fontName="Helvetica", textColor=DARK, leading=13)),
        ])
    t = Table(data, colWidths=[col1_w, c2])
    style = [
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("GRID",          (0,0), (-1,-1), 0.4, MID_GREY),
        ("ROUNDEDCORNERS",[4]),
    ]
    if header:
        style += [
            ("BACKGROUND",    (0,0), (-1,0), header_color),
            ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
            ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ]
    t.setStyle(TableStyle(style))
    return t

# ── Step card ────────────────────────────────────────────────────────────────
def step_card(num, title, desc, file_path=None, color=BLUE):
    num_cell = Table([[Paragraph(str(num), step_num)]], colWidths=[36])
    num_cell.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), color),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("ROUNDEDCORNERS",[8]),
    ]))
    parts = [Paragraph(title, step_title)]
    if file_path:
        parts.append(Paragraph(f'<font name="Courier" size="8" color="#3B5BDB">{file_path}</font>', body_left))
    parts.append(Paragraph(desc, step_body))
    text_cell = Table([[p] for p in parts], colWidths=["100%"])
    text_cell.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
    ]))
    row = Table([[num_cell, text_cell]], colWidths=[48, "100%"])
    row.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("BACKGROUND",    (0,0), (-1,-1), LIGHT_GREY),
        ("BOX",           (0,0), (-1,-1), 0.5, MID_GREY),
        ("ROUNDEDCORNERS",[8]),
    ]))
    return row

# ── Page template ─────────────────────────────────────────────────────────────
def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Header bar
    canvas.setFillColor(BLUE)
    canvas.rect(0, h - 0.7*cm, w, 0.7*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(WHITE)
    canvas.drawString(1.5*cm, h - 0.5*cm, "IFACET — Digital Credentials Portal")
    canvas.drawRightString(w - 1.5*cm, h - 0.5*cm, "OTP Email Flow & Project Guide")
    # Footer
    canvas.setFillColor(LIGHT_GREY)
    canvas.rect(0, 0, w, 0.7*cm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GREY)
    canvas.drawString(1.5*cm, 0.22*cm, "E&ICT Academy — Confidential Project Documentation")
    canvas.drawRightString(w - 1.5*cm, 0.22*cm, f"Page {doc.page}")
    canvas.restoreState()

def cover_template(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Full page gradient-like background
    canvas.setFillColor(BLUE)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    # Decorative circles
    canvas.setFillColor(colors.HexColor("#2F4AC2"))
    canvas.circle(w - 1*cm, h - 1*cm, 5*cm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#2945B8"))
    canvas.circle(1.5*cm, 2*cm, 3*cm, fill=1, stroke=0)
    canvas.restoreState()

# ── Build document ────────────────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.8*cm, bottomMargin=1.8*cm,
    )

    story = []

    # ══════════════════════════════════════════════════════
    # PAGE 1 — COVER
    # ══════════════════════════════════════════════════════
    def cover_page(canvas, doc):
        cover_template(canvas, doc)

    story.append(sp(60))
    story.append(Paragraph("IFACET", S("CL", fontSize=48, fontName="Helvetica-Bold",
                                        textColor=WHITE, alignment=TA_CENTER, spaceAfter=2)))
    story.append(Paragraph("Digital Credentials Portal", S("CL2", fontSize=16, fontName="Helvetica",
                                        textColor=colors.HexColor("#A5B4FC"), alignment=TA_CENTER, spaceAfter=30)))
    story.append(sp(20))

    # White card in middle of cover
    card_data = [[
        Paragraph("OTP Email Flow &amp; Project Guide",
                  S("CT", fontSize=22, fontName="Helvetica-Bold",
                    textColor=BLUE, alignment=TA_CENTER, spaceAfter=8)),
    ],[
        Paragraph("Complete technical documentation covering the full authentication flow,<br/>"
                  "project folder structure, file responsibilities, and database guide.",
                  S("CS", fontSize=10.5, fontName="Helvetica",
                    textColor=GREY, alignment=TA_CENTER, leading=16)),
    ],[
        sp(4)
    ],[
        Paragraph("April 2026  •  E&amp;ICT Academy  •  IITK",
                  S("CM", fontSize=9, fontName="Helvetica",
                    textColor=colors.HexColor("#ADB5BD"), alignment=TA_CENTER))
    ]]
    card = Table(card_data, colWidths=["100%"])
    card.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), WHITE),
        ("TOPPADDING",    (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING",   (0,0), (-1,-1), 30),
        ("RIGHTPADDING",  (0,0), (-1,-1), 30),
        ("ROUNDEDCORNERS",[12]),
    ]))
    story.append(card)
    story.append(sp(30))

    # TOC preview
    toc_items = [
        ("1", "Project Folder Structure", "2"),
        ("2", "What Each File Does", "3"),
        ("3", "Full OTP Email Flow — Step by Step", "4"),
        ("4", "How the Email Actually Lands in the Inbox", "6"),
        ("5", "Gmail App Password Explained", "7"),
        ("6", "Viewing Stored Emails in the Database", "7"),
    ]
    toc_data = [[
        Paragraph("#", S("TH", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER)),
        Paragraph("Section", S("TH", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE)),
        Paragraph("Page", S("TH", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER)),
    ]]
    for num, title, pg in toc_items:
        toc_data.append([
            Paragraph(num, S("TN", fontSize=9, fontName="Helvetica-Bold", textColor=BLUE, alignment=TA_CENTER)),
            Paragraph(title, S("TT", fontSize=9, fontName="Helvetica", textColor=DARK)),
            Paragraph(pg, S("TP", fontSize=9, fontName="Helvetica", textColor=GREY, alignment=TA_CENTER)),
        ])
    toc = Table(toc_data, colWidths=[30, 340, 40])
    toc.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#2F4AC2")),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, colors.HexColor("#EEF2FF")]),
        ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#C5D0FA")),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS",[6]),
    ]))
    story.append(toc)
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 2 — FOLDER STRUCTURE
    # ══════════════════════════════════════════════════════
    story.append(section_header("1  —  Project Folder Structure"))
    story.append(sp(10))

    story.append(Paragraph("Your entire project lives inside:", body))
    story.append(code_block("C:\\Users\\Sirisha Nemani\\OneDrive\\Desktop\\Figma Make code\\"))
    story.append(sp(6))

    # Frontend tree
    story.append(Paragraph("Frontend (React + Vite)", h2))
    fe_tree = [
        ("client/", "Root of the React application"),
        ("client/index.html", "Entry HTML — Vite loads this first"),
        ("client/src/main.jsx", "Mounts React app into #root div"),
        ("client/src/App.jsx", "Route definitions ( / → Home, /login → LoginPage, /dashboard → Dashboard )"),
        ("client/src/pages/Home.jsx", "Homepage — assembles all home components"),
        ("client/src/pages/LoginPage.jsx", "OTP Login — Step 1 (email+CAPTCHA) and Step 2 (OTP boxes)"),
        ("client/src/components/home/Navbar.jsx", "Top navigation bar with EICTA logo"),
        ("client/src/components/home/Hero.jsx", "Hero section with graduation photo"),
        ("client/src/components/home/Features.jsx", "3 feature cards (Security, Downloads, Privacy)"),
        ("client/src/components/home/HowItWorks.jsx", "3-step process section"),
        ("client/src/components/home/FAQ.jsx", "Accordion FAQ section"),
        ("client/src/components/home/CTA.jsx", "Call-to-action banner"),
        ("client/src/components/home/Footer.jsx", "Page footer"),
        ("client/src/components/dashboard/Dashboard.jsx", "Protected dashboard after login"),
        ("client/src/components/common/ProtectedRoute.jsx", "Redirects to /login if no JWT token"),
        ("client/src/services/api.js", "Axios instance — all API calls go through here"),
        ("client/src/styles/globals.css", "Dark theme base styles (original auth pages)"),
        ("client/src/styles/home.css", "Light theme styles for homepage (hp- prefix)"),
        ("client/src/styles/login.css", "Light theme styles for login page (lp- prefix)"),
        ("client/src/assets/eicta-logo.png", "EICTA logo image shown on login page and navbar"),
        ("client/src/assets/graduation.jpg", "Graduation photo shown in hero section"),
        ("client/src/context/AuthContext.jsx", "Global auth state (token, user)"),
    ]
    story.append(two_col_table(fe_tree, col1_w=210,
                               header=("File / Folder", "Purpose"),
                               header_color=BLUE))
    story.append(sp(12))

    # Backend tree
    story.append(Paragraph("Backend (Node.js + Express + MySQL)", h2))
    be_tree = [
        ("server/", "Root of the Express API server"),
        ("server/.env", "Secret config — DB credentials, Gmail, JWT secret"),
        ("server/server.js", "Entry point — starts Express, mounts routes"),
        ("server/routes/authRoutes.js", "Maps URL paths to controller functions"),
        ("server/controllers/authController.js", "Business logic — requestOTP, verifyOTP, login, register"),
        ("server/models/User.js", "All MySQL queries for the users table"),
        ("server/utils/emailService.js", "Nodemailer setup — sends OTP email via Gmail SMTP"),
        ("server/config/db.js", "MySQL connection pool + auto-creates tables on start"),
        ("server/config/schema.sql", "SQL schema — run this manually to create the users table"),
        ("server/middleware/authMiddleware.js", "JWT verification — protects /api/me and dashboard routes"),
    ]
    story.append(two_col_table(be_tree, col1_w=210,
                               header=("File / Folder", "Purpose"),
                               header_color=colors.HexColor("#2F9E44")))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 3 — WHAT EACH FILE DOES
    # ══════════════════════════════════════════════════════
    story.append(section_header("2  —  What Each File Does (Key Files Deep Dive)"))
    story.append(sp(10))

    file_details = [
        (
            "client/src/pages/LoginPage.jsx",
            BLUE,
            "The Login UI — Two-step OTP form",
            [
                "StepEmail component: collects email + visual CAPTCHA, sends POST /api/auth/request-otp",
                "StepOTP component: 6 individual digit boxes, auto-advance, paste support, 60s resend timer",
                "On verify success: saves JWT token to localStorage, navigates to /dashboard",
            ]
        ),
        (
            "server/controllers/authController.js",
            colors.HexColor("#2F9E44"),
            "The Brain — Handles all authentication logic",
            [
                "requestOTP: validates email → calls User.findOrCreate() → generates 6-digit OTP → saves to DB → sends email",
                "verifyOTP: checks OTP against DB (with expiry check) → clears OTP → returns JWT token",
                "Auto-registers any new email — no manual admin setup needed",
            ]
        ),
        (
            "server/models/User.js",
            PURPLE,
            "Database Layer — All MySQL queries",
            [
                "findOrCreate(email): finds existing user OR creates new row automatically",
                "setOTP(userId, code, expiry): saves OTP + expiry to users table",
                "findByEmailAndOTP(email, code): verifies OTP is correct AND not expired",
                "clearOTP(userId): sets otp_code and otp_expiry to NULL after successful login",
            ]
        ),
        (
            "server/utils/emailService.js",
            ORANGE,
            "Email Sender — Nodemailer via Gmail SMTP",
            [
                "Creates a Nodemailer transporter using smtp.gmail.com:587",
                "Uses EMAIL_USER and EMAIL_PASS from .env for authentication",
                "sendOTPEmail(): sends a branded HTML email with the 6-digit OTP in a styled box",
            ]
        ),
        (
            "server/.env",
            RED,
            "Secret Configuration — Never commit this file to Git",
            [
                "DB_HOST, DB_USER, DB_PASSWORD, DB_NAME — MySQL connection",
                "EMAIL_USER=nemanisirisha5122@gmail.com — Your Gmail address",
                "EMAIL_PASS=kpxmongopsxrxotv — 16-character Google App Password",
                "JWT_SECRET — Used to sign and verify login tokens",
            ]
        ),
        (
            "server/config/db.js",
            GREY,
            "Database Connection — MySQL pool",
            [
                "Creates a mysql2 connection pool (reuses connections for performance)",
                "Auto-runs CREATE TABLE IF NOT EXISTS on server startup",
                "Reads all DB config from .env file",
            ]
        ),
    ]

    for fpath, fcolor, ftitle, fpoints in file_details:
        story.append(KeepTogether([
            file_tag(fpath, fcolor),
            Paragraph(ftitle, h3),
            *[Paragraph(f"• {p}", bullet) for p in fpoints],
            sp(8),
        ]))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 4–5 — FULL OTP FLOW
    # ══════════════════════════════════════════════════════
    story.append(section_header("3  —  Full OTP Email Flow — Step by Step"))
    story.append(sp(10))

    story.append(info_box(
        "This section explains every single thing that happens from the moment a user "
        "types their email and clicks <b>Request OTP</b> — all the way to them being "
        "logged into the dashboard.",
        bg=LIGHT_BLUE, border=BLUE
    ))
    story.append(sp(10))

    steps = [
        (1, "User fills in the Login Form", BLUE,
         "client/src/pages/LoginPage.jsx → StepEmail component",
         "User enters their email address and solves the visual CAPTCHA. "
         "The CAPTCHA is generated client-side using random characters. "
         "When they click 'Request OTP', the frontend validates the email format and checks that the CAPTCHA input matches."),

        (2, "Frontend sends API Request", colors.HexColor("#1971C2"),
         "client/src/services/api.js",
         "An Axios HTTP POST request is made to: http://localhost:5000/api/auth/request-otp "
         "with the body: { email: 'user@example.com' }. "
         "The api.js file is configured with the base URL so all calls go to the right server."),

        (3, "Express Router receives the request", colors.HexColor("#2F9E44"),
         "server/routes/authRoutes.js",
         "The route router.post('/request-otp', ctrl.requestOTP) catches the request "
         "and passes it to the requestOTP function in authController.js."),

        (4, "Controller auto-registers or finds the user", colors.HexColor("#6741D9"),
         "server/controllers/authController.js",
         "User.findOrCreate(email) is called. If the email exists in the database it is returned. "
         "If it does NOT exist, a new row is automatically inserted into the users table "
         "with the email, a default name (part before @), and is_verified = 1. "
         "No manual admin setup is required — anyone can log in."),

        (5, "OTP is generated and saved to MySQL", colors.HexColor("#E67700"),
         "server/models/User.js + MySQL (auth_db → users table)",
         "A random 6-digit OTP is generated: Math.floor(100000 + Math.random() * 900000). "
         "The expiry is set to exactly 10 minutes from now. "
         "User.setOTP() runs: UPDATE users SET otp_code=?, otp_expiry=? WHERE id=?"),

        (6, "Email is sent via Gmail SMTP", colors.HexColor("#C92A2A"),
         "server/utils/emailService.js",
         "Nodemailer connects to smtp.gmail.com on port 587 (TLS). "
         "It authenticates with your Gmail address and the 16-character App Password from .env. "
         "A branded HTML email is sent with the OTP displayed in a large styled box."),

        (7, "Email arrives in the user's inbox", colors.HexColor("#1098AD"),
         "User's email provider (Gmail / Outlook / etc.)",
         "Google's SMTP server routes the email to the recipient. "
         "The email shows: Subject 'Your OTP is XXXXXX — IFACET Portal', "
         "Sender 'IFACET – Digital Credentials Portal', and the OTP in a prominent blue box."),

        (8, "User enters OTP on Step 2 screen", BLUE,
         "client/src/pages/LoginPage.jsx → StepOTP component",
         "The user sees 6 individual input boxes. They type or paste the OTP. "
         "Boxes auto-advance as digits are typed. A 60-second resend countdown is shown. "
         "On submit, POST /api/auth/verify-otp is called with { email, otp }."),

        (9, "Server verifies OTP against database", colors.HexColor("#2F9E44"),
         "server/controllers/authController.js + server/models/User.js",
         "User.findByEmailAndOTP() runs: SELECT * FROM users WHERE email=? AND otp_code=? AND otp_expiry > NOW(). "
         "If found: OTP is cleared (set to NULL), a JWT token is generated and returned. "
         "If not found or expired: 400 error 'Invalid or expired OTP'."),

        (10, "JWT token saved — user lands on Dashboard", colors.HexColor("#6741D9"),
         "client/src/pages/LoginPage.jsx + client/src/components/common/ProtectedRoute.jsx",
         "The token is saved: localStorage.setItem('token', res.data.token). "
         "React Router navigates to /dashboard. "
         "ProtectedRoute checks for the token — if present, Dashboard renders. "
         "If the user tries to go to /dashboard without a token, they are redirected to /login."),
    ]

    for num, title, color, fpath, desc in steps:
        story.append(step_card(num, title, desc, fpath, color))
        story.append(sp(6))

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════
    # PAGE 6 — HOW EMAIL LANDS + APP PASSWORD
    # ══════════════════════════════════════════════════════
    story.append(section_header("4  —  How the Email Actually Lands in the Inbox"))
    story.append(sp(10))

    flow_rows = [
        ("Your server (Node.js)", "Runs Nodemailer with your Gmail credentials"),
        ("smtp.gmail.com : 587", "Gmail's outgoing mail server — receives the email"),
        ("TLS Encryption", "Port 587 uses STARTTLS — connection is encrypted"),
        ("Google authenticates", "Checks EMAIL_USER + EMAIL_PASS (App Password)"),
        ("Google routes the email", "Sends it to the recipient's mail provider"),
        ("Recipient inbox", "Email arrives — usually within 2–5 seconds"),
    ]
    story.append(two_col_table(flow_rows, col1_w=180,
                               header=("Stage", "What happens"),
                               header_color=BLUE))
    story.append(sp(12))

    story.append(section_header("5  —  Gmail App Password Explained", color=colors.HexColor("#2F9E44")))
    story.append(sp(10))

    pw_rows = [
        ("Your Google login password", "Used by YOU to sign in to Google.com. Google BLOCKS apps from using this."),
        ("App Password (16 chars)", "A special one-time password Google generates just for this app. Only works for SMTP."),
        ("Where it's stored", "server/.env file → EMAIL_PASS=kpxmongopsxrxotv"),
        ("Can it be revoked?", "Yes — go to myaccount.google.com/apppasswords and delete it anytime."),
        ("Does it expire?", "No — it lasts until you delete it or change your Google password."),
        ("Is it your Gmail password?", "NO. Never use your real Gmail password in .env."),
    ]
    story.append(two_col_table(pw_rows, col1_w=180,
                               header=("Question", "Answer"),
                               header_color=colors.HexColor("#2F9E44")))
    story.append(sp(10))

    story.append(info_box(
        "<b>Security note:</b> The .env file is listed in .gitignore and should NEVER be "
        "committed to GitHub. Your App Password is only visible on your local machine. "
        "If you ever suspect it is leaked, go to myaccount.google.com/apppasswords and delete it immediately.",
        bg=LIGHT_GREEN, border=GREEN
    ))

    story.append(sp(16))

    # ══════════════════════════════════════════════════════
    # SECTION 6 — VIEWING EMAILS IN DATABASE
    # ══════════════════════════════════════════════════════
    story.append(section_header("6  —  Viewing Stored Emails in the Database", color=PURPLE))
    story.append(sp(10))

    story.append(Paragraph("Every email that logs in is automatically saved to your MySQL database. "
                            "Here is exactly how to view them:", body))
    story.append(sp(8))

    db_steps = [
        ("Open phpMyAdmin",
         "Open your browser and go to:  http://localhost/phpmyadmin/\n"
         "(Make sure XAMPP Apache + MySQL are both running in XAMPP Control Panel)"),
        ("Select the database",
         "In the LEFT sidebar, click on  auth_db\n"
         "This is the database that holds all your users."),
        ("Open the users table",
         "Under auth_db in the sidebar, click on  users\n"
         "This is the table where every login email is stored."),
        ("Click the Browse tab",
         "Click the  Browse  tab at the top of the page.\n"
         "You will see all rows — one row per registered email address."),
        ("What each column means",
         "id = auto-incremented unique number\n"
         "name = auto-generated from email (part before @)\n"
         "email = the email address they logged in with\n"
         "is_verified = 1 (always true for OTP users)\n"
         "otp_code = NULL (cleared after login)\n"
         "otp_expiry = NULL (cleared after login)\n"
         "created_at = exact date and time they first logged in"),
        ("Run a SQL query (optional)",
         "Click the  SQL  tab and run:\n"
         "SELECT id, name, email, is_verified, created_at FROM users ORDER BY created_at DESC;\n"
         "This shows all users sorted by most recent login first."),
    ]

    for i, (title, desc) in enumerate(db_steps, 1):
        row_data = [
            [
                Paragraph(str(i), S("DN", fontSize=14, fontName="Helvetica-Bold",
                                    textColor=WHITE, alignment=TA_CENTER)),
                Paragraph(f"<b>{title}</b><br/>"
                          f"<font color='#495057' size='9'>{desc.replace(chr(10), '<br/>')}</font>",
                          S("DB", fontSize=9.5, fontName="Helvetica", textColor=DARK, leading=14))
            ]
        ]
        t = Table(row_data, colWidths=[36, "100%"])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (0,-1), PURPLE),
            ("BACKGROUND",    (1,0), (1,-1), LIGHT_PURPLE),
            ("VALIGN",        (0,0), (-1,-1), "TOP"),
            ("TOPPADDING",    (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
            ("LEFTPADDING",   (0,0), (-1,-1), 10),
            ("RIGHTPADDING",  (0,0), (-1,-1), 10),
            ("BOX",           (0,0), (-1,-1), 0.5, MID_GREY),
            ("ROUNDEDCORNERS",[6]),
        ]))
        story.append(t)
        story.append(sp(5))

    story.append(sp(10))
    story.append(code_block(
        "-- Run this in phpMyAdmin → SQL tab to see all registered users:\n"
        "SELECT id, name, email, is_verified, created_at\n"
        "FROM users\n"
        "ORDER BY created_at DESC;"
    ))

    story.append(sp(10))
    story.append(info_box(
        "<b>Every time someone enters their email and completes OTP login, a new row appears here.</b><br/>"
        "The otp_code and otp_expiry columns are cleared to NULL immediately after successful verification "
        "for security. Only the email, name, and timestamps are kept permanently.",
        bg=LIGHT_PURPLE, border=PURPLE
    ))

    # Build
    def page_template(canvas, doc):
        if doc.page == 1:
            cover_template(canvas, doc)
        else:
            header_footer(canvas, doc)

    doc.build(story, onFirstPage=page_template, onLaterPages=header_footer)
    print(f"PDF created: {OUTPUT}")

build()
