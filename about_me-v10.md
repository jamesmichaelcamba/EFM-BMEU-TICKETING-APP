# Master AI Profile & Context Guide

**Owner:** James Michael M. Camba
**Role:** Biomedical Engineer / Medical Equipment Technician II (ZCMC BMEU)
**Location:** Sta. Maria, Zamboanga City, Philippines
**Contact:** jamesmichaelcamba@gmail.com | (+63) 917-781-9357
**Current Version:** v10
**Last Updated:** July 21, 2026

---

## 🛡️ PART 1: SAFETY & OPERATIONAL BOUNDARIES (STRICT "SAY-SO")

### 1. Mandatory Pre-Authorization
*   **The "Say-So" Rule:** You (the AI) are strictly prohibited from modifying, deleting, refactoring, or restructuring any existing codebases, schemas, local files, or directories built directly by me or other developers without my explicit, manual approval in chat first.
*   **Propose-First Mandate:** For any request involving high-impact modifications, you must first explain *exactly* what files you plan to edit, why, and present a concise execution plan. You must wait for my explicit confirmation (e.g., "go ahead", "approved") before proceeding.
*   **Read-Only Default:** Treat my working directories and codebase files as **Read-Only** until authorization is explicitly granted.

### 2. High-Risk Operational Restrictions
*   **Destructive Actions:** Under no circumstances should you execute destructive terminal commands (such as `rm -rf` on working folders).
*   **Config & Secret Protection:** Never read, output, commit, or print the contents of local environment variables, `.env`, or `.env.local` files containing private API keys or credentials.
*   **Draft-Only Communications:** You may draft communications (emails, calendar invites, slack messages) but are strictly prohibited from sending them or booking events live. Save them as drafts/pending entries first.

---

## 🏥 PART 2: PROFESSIONAL BACKGROUND & CREDENTIALS (ZCMC BMEU)

### 1. Professional Profile
*   **Current Position:** Medical Equipment Technician II (COS) at Zamboanga City Medical Center (ZCMC) BMEU, Engineering Facilities Management (EFM) department.
*   **Educational Background:** Bachelor of Science in Biomedical Engineering from Ateneo de Zamboanga University (2019–2023).
    *   *Thesis:* Portable Heart Attack Alert System (PHAAS): An Objective-Based Approach in Detecting ST-Elevated Myocardial Infarction (STEMI) for Patients with Ischemic Heart Disease.
*   **Certifications:**
    *   TESDA Biomedical Equipment Servicing NC II (Issued: May 2023 | Valid until: May 2028).
    *   Philippines Civil Service Professional Eligibility (Issued: November 2023).

### 2. Clinical Engineering & Technical Scale
*   **Asset Management:** Accountable for approximately **1,479 active medical devices** under BMEU management.
*   **Preventive Maintenance (PM):** Over **1,320 PM services** completed across monthly, quarterly, and semi-annual maintenance cycles.
*   **Corrective Maintenance (CM):** Resolved **257 documented CM and repair cases** covering fault assessment, board-level/component repair, and patient safety verification.
*   **Calibration & Verification:** Completed testing on **92+ medical devices** (including Patient Monitors, BP Apparatus, Pulse Oximeters, Defibrillators, Gas Flow Analyzers, Suction Machines, Medical Freezers, and Centrifuges).
*   **Calibration Toolkit:** Experienced with professional-grade test systems: Fluke ProSim 8, Rigel Uni-Sim, Fluke DPM4 Parameter Tester, Citrex H5, Fluke VT305, Particle Counter, and Temp/Humidity Data Loggers.
*   **Internship Supervision:** Supervised and evaluated **48 Biomedical Engineering Interns** across 4 distinct training batches, checking performance against department competency standards.

---

## 💻 PART 3: SOFTWARE & HARDWARE DEVELOPMENT PROJECTS

### 1. Active Project Directories (D: Drive)
*   **`D:\JMC Dev\A - Basic ECG Machine`**
    *   *System:* Arduino-based ECG using AD8232 sensor and Arduino Uno R3.
    *   *PC Visualizer:* Samples ECG signal at **250 Hz** (every 4000 µs) using precise timer-based `micros()`, bypassing `delay()`. Outputs dual-channel real-time CSV streams over serial at **115200 baud** (compatible with Arduino Serial Plotter).
    *   *Standalone Monitor:* Displays real-time calculated BPM on a **16x2 I2C LCD (0x27)**, updating every 500 ms to eliminate flicker.
    *   *3D Enclosure:* Houses all standalone parts in a compact print file (`Basic Heart Rate Monitor.3mf`) sliced with Bambu Studio, PrusaSlicer, or Cura.
*   **`D:\JMC Dev\A - BMEU - JMC - Ticketing App`**
    *   *System:* Dedicated React/TypeScript portal for logging and triaging BMEU repair requests.
*   **`D:\JMC Dev\A - EFM BMEU PM Scheduler App`**
    *   *System:* React 19 / TypeScript / Vite 6 drag-and-drop PM calendar with interactive spatial mapping of hospital zones (Tower 1, Tower 2, ICU, Surgical Complex, ER & Critical Care, Cancer Center, etc.).
    *   *Backend:* Real-time bi-directional sync via Google Sheets API v4 and Google Apps Script Web App.
*   **`D:\JMC Dev\A - ZCMC-EFM Digital Information System`**
    *   *System:* Centralized Computerized Maintenance Management System (CMMS) designed to transition ZCMC-EFM from physical paperwork to a unified, role-based platform.
    *   *Architecture:* React 19, TypeScript 5.8, Vite 6, Tailwind CSS, Supabase (PostgreSQL), Recharts.
    *   *Active Roadmap:* Authentication (Supabase Auth), PDF generators for government-standard RRF (Repair Request Form) and JRF (Job Report Form) files, and barcode/QR code asset scanning.

### 2. Development Preferences & Tools
*   **AI Development Workspace:** I use **Google's Antigravity** to build, maintain, and structure my software applications and hardware projects (both completed and ongoing).
*   **Design & Styling Standards:** Because development is driven with Google's Antigravity assistance, I do not maintain rigid custom coding styles, component hierarchies, or database refactoring rules of my own. Simply work cleanly within our existing folders and follow the boundaries of the framework in use.

---

## 🧠 PART 4: NOTION SECOND BRAIN SYSTEM ARCHITECTURE

All organizational tasks must map directly to this architectural structure without cross-contaminating domains.

### 1. Protected Backbone Databases (Core - DND)
*   **Database Hub:** Master entry point for all databases.
*   **Areas / Goals / Tasks / Notes / Dashboards / Trackers / Resources / Quick Capture / Archive**
*   **Protocols Database:** Personal standard operating procedures.
*   **Database Templates:** Master checklist layouts.

### 2. Standardized Naming & Key Conventions
*   **Work Activity Tracker:** Daily logs formatted as **`WAT_YYYYMMDD`**.
*   **Life Activity Daily Entries:** Root day logs formatted as **`LAT_YYYYMMDD`**.
*   **Life Activity Daily Sub-Entries:** Granular activity blocks formatted as **`LAT_YYYYMMDDDA`**.
*   **Finance Transactions:** Logged as **`[Description]_[YYYYMMDD]_[HHMMSS]`**.

### 3. Habits & Routines Trackers
*   **Daily Habits Checklist:** Water, Toothbrush 3x, 7-9 Hrs Sleep, Doom Scrolling (20m limit), No Coke, No Corn, No Swore, No Beat, Daily Devotional.
*   **Morning Routine Sequence:** Morning Prayer, Wake Up, Prep/Eat Breakfast, Tooth Brush, Take a Bath (Everyday) | Leave House, Prep Lunch, Warm-up Car (Work Days).
*   **Afternoon & Evening Routines:** Logged separately under standard daily sets.

### 4. Side Business: JMC Prints
*   **Active Printers:** Bambu Lab A1, Creality K1C, Creality Ender v3.
*   **Active Databases:** 3D Printers Registry, 3D Printer Parts Inventory, 3D Printing Tools, Print Job Tracker, Print Commissions.

---

## 💰 PART 5: COMPLETE PERSONAL FINANCE ACCOUNTS REGISTRY

This registry maps the 47 financial accounts currently used or archived in my Second Brain. Always follow these exact statuses.

### 1. Active Accounts (Current Day-to-Day)
*   **Cash:** On-Hand
*   **Traditional Bank Savings:** DBP, BPI Savings, BPI STL
*   **e-Wallets:** GCash, Maya Wallet, Lazada Wallet, ShopeePay
*   **Digital Bank Savings:** Maya Savings, MariBank Savings
*   **Credit Cards / Lines:** BPI Credit (Blue), Maya Credit, Maya Black, MariBank Credit, Atome
*   **Repayable Short-Term Loans:** Maya Personal Loan (5398), MariBank Loan (2), GCash GLoan (2), Home Credit Cash Loan (1), Atome Cash (3), Shopee Loan (7), Shopee Loan (8), Shopee Loan (9), Lazada Loan (5)
*   **Government Contributions:** SSS, Pag-Ibig, PhilHealth

### 2. Inactive / Settled Accounts (Read-Only / Historic Archive)
*   **Inactive Savings:** Maya Personal Goals (4226)
*   **Inactive e-Wallets:** PayPal
*   **Settled / Closed Loans:**
    *   Atome Cash (1), Atome Cash (2)
    *   MariBank Credit (1)
    *   GLoan (1), GGives (1)
    *   Home Credit (Xiaomi Redmi Note 14 5G)
    *   Billease (1), Billease (2)
    *   Lazada Loan (1), Lazada Loan (2), Lazada Loan (3), Lazada Loan (4)
    *   Shopee Loan (1), Shopee Loan (2), Shopee Loan (3), Shopee Loan (4), Shopee Loan (5), Shopee Loan (6)
