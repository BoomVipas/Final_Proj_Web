# codex_ToDo.md — MedCare Complete Implementation Plan

> **For:** Codex + Claude (Frontend Designer + QA)
> **Phase:** 1 MVP  |  **Target:** Q2 2026
> **QA Method:** Puppeteer screenshots after every task group. Do NOT proceed past a group until screenshots pass.

---

## Design Direction

> ⚠️ **DESIGN PIVOT** — Art direction updated to match Figma (Pillo-Website, node 2230-2714).
> The old dark POC is **superseded**. Use the new light/orange system below.

### Old POC vs New Figma Direction

| Property | Old POC (dark) | ✅ New Figma (use this) |
|----------|---------------|------------------------|
| Theme | Dark `#111827` | **Light** `#FFFBF7` warm cream |
| Primary color | Teal/green `#10B981` | **Orange** `#F97316` |
| Cards | Dark `#1F2937` | **White** `#FFFFFF`, stone border |
| Active row | Green highlight | **Peach** `#FFF3E8` |
| Navigation | Left sidebar | **Top horizontal nav** |
| Workflow | 4-step (no ward) | **6-step with ward selection** |
| Dispense view | Meal-at-a-time sidebar | **Day columns (Mon/Tue/…) × time slots** |
| Step indicator | Top-right, 4 nodes | **Top-center, 5 pill dots** |

### Design System (Light + Orange)

```css
/* Backgrounds */
--bg-base:      #FFFBF7;   /* Warm off-white — page bg */
--bg-surface:   #FFFFFF;   /* White — cards */
--bg-highlight: #FFF3E8;   /* Peach — selected/active rows */
--bg-muted:     #F5F5F0;   /* Secondary surfaces */

/* Primary Orange */
--color-primary:      #F97316;  /* Orange-500 — CTAs, date headers */
--color-primary-dark: #EA6C0A;  /* Orange-600 — pressed */
--color-primary-bg:   #FFF3E8;  /* Orange-50  — row highlight */

/* Time-slot Colors */
--time-morning:   #F97316;  /* Orange  — ยาเช้า */
--time-afternoon: #3B82F6;  /* Blue    — ยากลางวัน */
--time-evening:   #8B5CF6;  /* Violet  — ยาเย็น */
--time-bedtime:   #64748B;  /* Slate   — ก่อนนอน */

/* Status */
--color-success:  #16A34A;  /* Green-600 */
--color-warning:  #D97706;  /* Amber-600 */
--color-critical: #DC2626;  /* Red-600 */

/* Text */
--text-primary:   #1C1917;  /* Stone-900 */
--text-secondary: #78716C;  /* Stone-500 */
--text-muted:     #A8A29E;  /* Stone-400 */

/* Borders */
--border-color:  #E7E5E4;   /* Stone-200 */
--border-active: #F97316;   /* Orange — selected card */
```

---

## Project Structure

```
medcare/
├── touchscreen/              # Vanilla HTML/CSS/JS for Raspberry Pi kiosk
│   ├── index.html            # Step 0: Home (Remedy Cabinet / Pill Dispenser)
│   ├── wards.html            # Step 1: Select Ward
│   ├── patients.html         # Step 2: Select Patient within Ward
│   ├── loading.html          # Step 3: Medication Loading List
│   ├── dispense.html         # Step 4: Dispense by Day (columns)
│   ├── summary.html          # Step 5: Completion Summary
│   ├── styles/
│   │   ├── base.css          # Reset, variables, fonts
│   │   ├── components.css    # Shared components
│   │   └── touch.css         # Touchscreen-specific overrides
│   └── scripts/
│       ├── api.js            # Fetch wrapper for backend
│       ├── state.js          # Local state management
│       ├── dispense.js       # Dispense workflow logic
│       └── offline.js        # Cache/sync logic
│
├── web/                      # Next.js 14 + TypeScript + Tailwind
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Redirect to /dashboard
│   │   ├── dashboard/
│   │   ├── residents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── medications/page.tsx
│   │   ├── stock/
│   │   ├── dispense/history/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/               # Base design system components
│   │   ├── residents/
│   │   ├── medications/
│   │   └── stock/
│   └── lib/
│       ├── supabase.ts
│       ├── api.ts
│       └── types.ts
│
├── api/                      # Elysia.js (Bun)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── residents.ts
│   │   │   ├── medications.ts
│   │   │   ├── dispense.ts
│   │   │   ├── stock.ts
│   │   │   └── notify.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── db/
│   │       └── supabase.ts
│   └── package.json
│
└── scripts/
    └── screenshots/
        ├── capture.js         # Full screenshot suite
        └── quick.js           # Single-page quick check
```

---

## Task Tracker

Legend: `○` Not Started · `→` In Progress · `✓` Done · `✗` Blocked

---

## SPRINT 1 — Foundation & Setup (Week 1–2)

### S1-INFRA: Project Scaffolding

| ID | Task | Status |
|----|------|--------|
| S1-01 | Init `touchscreen/` folder with `base.css` (CSS vars **light/orange** theme) | ✓ |
| S1-02 | Init Next.js 14 project in `web/` with TypeScript + Tailwind | ✓ |
| S1-03 | Configure Tailwind **light orange theme** to match Figma design system vars | ✓ |
| S1-04 | Install Noto Sans Thai from Google Fonts in both apps | ✓ |
| S1-05 | Init Elysia.js project in `api/` with Bun | ✓ |
| S1-06 | Set up Supabase project (dev), get connection strings | ✗ |
| S1-07 | Create `.env.local` template files for all three apps | ✓ |
| S1-08 | Install Puppeteer in root: `npm install puppeteer --save-dev` | ✓ |
| S1-09 | Create `scripts/screenshots/capture.js` (full screenshot suite) | ✓ |
| S1-10 | Create `scripts/screenshots/quick.js` (single page quick check) | ✓ |

**Puppeteer QA:** Run `node scripts/screenshots/capture.js` — verify blank shells load correctly at correct viewport sizes.
> Note: S1-06 is blocked pending Supabase project creation and credentials.

---

### S1-DB: Supabase Schema

| ID | Task | Status |
|----|------|--------|
| DB-01 | Create `residents` table | ○ |
| DB-02 | Create `medications` table | ○ |
| DB-03 | Create `resident_medications` table | ○ |
| DB-04 | Create `dispense_events` table (immutable, no DELETE) | ○ |
| DB-05 | Create `stock` table | ○ |
| DB-06 | Create `users` table with role enum | ○ |
| DB-07 | Enable RLS on all tables | ○ |
| DB-08 | Enable Realtime on `resident_medications` and `stock` | ○ |
| DB-09 | Seed: 5 residents with full medication schedules (Thai names) | ○ |

**Schema detail:**
```sql
-- residents
id uuid PK, name text, name_en text, room text, ward text,
photo_url text, allergies text[], chronic_conditions text[],
flags jsonb,  -- { crush: bool, liquid: bool, needs_assistance: bool }
doctor_contact text, line_user_id text, created_at timestamptz

-- medications
id uuid PK, name text, name_en text, form text,
dosage_unit text, notes text, is_active bool

-- resident_medications
id uuid PK, resident_id uuid FK, medication_id uuid FK,
dose_amount numeric, dose_unit text,
schedule text[],  -- ['before_breakfast','after_breakfast']
special_instructions text, is_active bool,
updated_at timestamptz

-- dispense_events (IMMUTABLE)
id uuid PK, resident_id uuid FK, meal text,
medications_json jsonb, staff_id uuid FK,
dispensed_at timestamptz, outcome text

-- stock
id uuid PK, medication_id uuid FK, quantity numeric,
threshold_warn int DEFAULT 14, threshold_critical int DEFAULT 7,
estimated_runout_date date, updated_at timestamptz

-- users
id uuid PK, email text, role text CHECK(role IN ('admin','nurse','caregiver','family')),
display_name text, resident_id uuid (for family role)
```

---

## SPRINT 2 — API Core + Touchscreen Shell (Week 3–4)

### S2-API: Elysia.js Core Endpoints

| ID | Task | Status |
|----|------|--------|
| API-01 | `GET /residents` — list all, include status + stock alerts | ○ |
| API-02 | `GET /residents/:id` — full profile + med schedule | ○ |
| API-03 | `POST /residents` — create | ○ |
| API-04 | `PATCH /residents/:id` — update profile or status | ○ |
| API-05 | `GET /residents/:id/medications` — active med list for touchscreen | ○ |
| API-06 | `GET /residents/:id/weekly-summary` — grouped by meal for Step 2 | ○ |
| API-07 | JWT auth middleware (Supabase JWT verify) on all routes | ○ |
| API-08 | Error handler middleware (consistent JSON error shape) | ○ |

**Test each endpoint with curl before marking done.**

---

### S2-TOUCH-SHELL: Touchscreen App Shell

| ID | Task | Status |
|----|------|--------|
| T-00 | `base.css`: CSS custom properties (dark vars), Noto Sans Thai | ○ |
| T-01 | `components.css`: button variants, badges, cards | ○ |
| T-02 | Shared header component: "MEDCARE DISPENSER" logo + step indicator | ○ |
| T-03 | Step indicator: 4 nodes (○/active/✓), connected line, labels in Thai | ○ |
| T-04 | Shared footer: back button + primary CTA button slot | ○ |
| T-05 | `state.js`: in-memory state (currentResident, currentStep, mealIndex) | ○ |
| T-06 | `api.js`: fetch wrapper with offline fallback to localStorage cache | ○ |

**Puppeteer QA (1024×600):** Screenshot all 4 HTML pages. Verify:
- [ ] Dark background `#0F172A` visible
- [ ] Header height ~56px
- [ ] Footer height ~80px
- [ ] Step indicator visible top-right
- [ ] Noto Sans Thai loaded (check Thai text renders)

---

## SPRINT 3 — Touchscreen UI All 6 Steps (Week 5–6)

> ✅ Design follows Figma Pillo-Website art direction: **light theme, orange primary, top nav, ward-first flow.**

### S3-T0: Step 0 — Home Screen (`index.html`)

| ID | Task | Status |
|----|------|--------|
| T0-01 | Page bg: `#FFFBF7`, centered layout | ○ |
| T0-02 | Top header: Logo left, user/notification/settings icons right | ○ |
| T0-03 | Two large cards side-by-side (gap 32px, centered vertically) | ○ |
| T0-04 | Card 1: orange cabinet SVG icon + "Remedy Cabinet" + "Manage Medicine Cabinet" | ○ |
| T0-05 | Card 2: orange dispenser SVG icon + "Pill Dispenser" + "Get Scheduled Medication" | ○ |
| T0-06 | Cards: white bg, stone-200 border, radius-xl, shadow-card, min 220×180px | ○ |
| T0-07 | Card hover: orange border + elevated shadow | ○ |
| T0-08 | "Pill Dispenser" click → navigates to wards.html | ○ |
| T0-09 | "Remedy Cabinet" click → opens web app URL (configurable) | ○ |

**Puppeteer QA (1024×600):**
- [ ] Background is warm cream `#FFFBF7` — NOT dark
- [ ] Both cards visible, equal size, horizontally centered
- [ ] Orange icons visible
- [ ] Card text readable (≥16px)

---

### S3-T1: Step 1 — Select Ward (`wards.html`)

| ID | Task | Status |
|----|------|--------|
| T1-01 | Header: back arrow + "วอร์ด" title + step indicator (step 1 active) | ○ |
| T1-02 | Ward card grid: 3 columns, gap-16px | ○ |
| T1-03 | Ward card fields: ward name (bold 18px), floor+room range (13px muted) | ○ |
| T1-04 | Ward card fields: patient count icon, caregiver name, med status badge, stock status badge | ○ |
| T1-05 | Med status badge: "รับยาแล้ว" (green) / "รอรับยา" (orange) | ○ |
| T1-06 | Stock badge: "ปกติ" (green) / "เตือน" (amber) / "วิกฤต" (red) | ○ |
| T1-07 | Selected card: orange border 2px, shadow elevated | ○ |
| T1-08 | Footer: "ถัดไป →" orange button, disabled until ward selected | ○ |

**Puppeteer QA (1024×600):**
- [ ] White card bg (not dark)
- [ ] Ward name bold, floor/room muted smaller
- [ ] Status badges color-coded correctly
- [ ] Orange CTA visible in footer

---

### S3-T2: Step 2 — Select Patient (`patients.html`)

| ID | Task | Status |
|----|------|--------|
| T2-01 | Breadcrumb: "วอร์ด > Ward A" top-left | ○ |
| T2-02 | Patient count subtitle: "48 คน" | ○ |
| T2-03 | Search input: right-aligned, filter by name | ○ |
| T2-04 | Patient card grid: 4 columns | ○ |
| T2-05 | Patient card: avatar circle (initial + unique hue), name (16px semibold), room (13px muted) | ○ |
| T2-06 | Patient card: med count + status badge (รอจ่าย / เสร็จแล้ว) | ○ |
| T2-07 | Done patients: opacity-50, pointer-events-none, "✓ เสร็จแล้ว" overlay | ○ |
| T2-08 | Selected patient: orange border 2px | ○ |
| T2-09 | Footer: "ถัดไป →" disabled until patient selected | ○ |

**Puppeteer QA (1024×600):**
- [ ] Warm cream bg
- [ ] 4-column grid fills width without overflow
- [ ] Done cards clearly dimmed (50% opacity)
- [ ] Orange border visible on selection

---

### S3-T3: Step 3 — Load Medications (`loading.html`)

> Reference: Figma "Load medications into machine" screen

| ID | Task | Status |
|----|------|--------|
| T3-01 | Header: "นำยาใส่เข้าเครื่อง — [Patient Name]" | ○ |
| T3-02 | Subtext: "โหลดยาที่ต้องการแล้ว tick ✓ เพื่อยืนยัน" (stone-500) | ○ |
| T3-03 | Medication row: white bg, stone-200 border, 16px padding | ○ |
| T3-04 | Row left: circle checkbox (hollow = unchecked, orange fill = checked) | ○ |
| T3-05 | Row center: drug name (16px bold) + dose note (13px muted) | ○ |
| T3-06 | Row center: meal chips (color-coded, small rounded) | ○ |
| T3-07 | Row right: `×14` quantity in orange (18px bold) | ○ |
| T3-08 | Checked row: bg changes to `#FFF3E8` (peach), green ✓ icon replaces hollow circle | ○ |
| T3-09 | Special flags: 💊 ต้องบด, 💧 ยาน้ำ as inline text tags | ○ |
| T3-10 | Low-stock row: amber left-border + "⚠ สต๊อกต่ำ" inline text | ○ |
| T3-11 | Progress footer: "ยืนยันแล้ว X/Y รายการ" left + "เริ่ม Dispense" right | ○ |
| T3-12 | "เริ่ม Dispense": gray/disabled until all rows checked, then orange | ○ |

**Puppeteer QA (1024×600):**
- [ ] White card rows visible (not dark)
- [ ] Peach highlight on checked rows (`#FFF3E8`)
- [ ] Orange quantity numbers right-aligned
- [ ] CTA button visibly disabled (not orange) initially
- [ ] Meal chips render with correct colors

---

### S3-T4: Step 4 — Dispense by Day (`dispense.html`)

> Reference: Figma "Monday, Feb 11, 2026" screen — day columns layout

| ID | Task | Status |
|----|------|--------|
| T4-01 | Patient name top-left: large bold (22px) | ○ |
| T4-02 | Day navigation bar: ← [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun] → | ○ |
| T4-03 | Current day header: orange bold "Monday, Feb 11, 2026" (24px) | ○ |
| T4-04 | Three time-slot columns in a row: Morning / Afternoon / Evening | ○ |
| T4-05 | Column header: icon (☀️/🌤/🌙) + Thai label + time (08:00 น.) | ○ |
| T4-06 | Medication rows per column: name, dose, checkmark | ○ |
| T4-07 | "Start Dispense" orange button: at bottom of each active column | ○ |
| T4-08 | "Coming Soon" state: grayed column, no button, muted label | ○ |
| T4-09 | After confirming Morning column → move to next day or next column | ○ |
| T4-10 | Day nav: completed days show orange dot/underline indicator | ○ |
| T4-11 | After all 7 days confirmed → redirect to summary.html | ○ |
| T4-12 | Log each column confirmation to backend via `POST /dispense` | ○ |

**Puppeteer QA (1024×600):**
- [ ] Orange date header visible and bold
- [ ] Three columns laid out equally
- [ ] Orange "Start Dispense" button in active column
- [ ] "Coming Soon" columns visibly grayed
- [ ] Day navigation bar shows all 7 days

---

### S3-T5: Step 5 — Completion Summary (`summary.html`)

> Reference: Figma "Weekly filled complete!" screen

| ID | Task | Status |
|----|------|--------|
| T5-01 | Center layout: orange party/celebration icon (SVG, 64px) | ○ |
| T5-02 | Title: "สำเร็จแล้ว!" or "Weekly filled complete!" (24px bold) | ○ |
| T5-03 | Subtitle: "[Name] เสร็จสิ้นแล้ว 7 วัน" (16px stone-500) | ○ |
| T5-04 | Room + ward info line (muted) | ○ |
| T5-05 | Stats row: 3 boxes — Meds count / Total Tabs / Types of Med | ○ |
| T5-06 | Stats box: number (28px bold orange) + label (13px muted) below | ○ |
| T5-07 | "← กลับหน้าผู้ป่วย" ghost button (left) | ○ |
| T5-08 | "ผู้ป่วยคนต่อไป →" orange solid button (right) | ○ |

**Puppeteer QA (1024×600):**
- [ ] Warm cream bg
- [ ] Orange celebration icon centered
- [ ] Stats numbers orange and large
- [ ] Both action buttons visible

---

### S3-TOUCH-OFFLINE: Offline Capability

| ID | Task | Status |
|----|------|--------|
| T-OFF-01 | `offline.js`: cache resident + medication data in localStorage on load | ○ |
| T-OFF-02 | Detect network loss: show offline indicator in header | ○ |
| T-OFF-03 | Queue dispense events when offline, sync when reconnected | ○ |
| T-OFF-04 | Service Worker: cache HTML/CSS/JS assets for full offline load | ○ |

---

## SPRINT 4 — Web App (Week 7–8)

### S4-WEB-SHELL: Next.js App Shell

| ID | Task | Status |
|----|------|--------|
| WA-01 | Tailwind config: extend with MedCare dark theme tokens | ○ |
| WA-02 | `globals.css`: CSS vars, Noto Sans Thai, base dark styles | ○ |
| WA-03 | Root `layout.tsx`: dark body bg, font, metadata | ○ |
| WA-04 | Sidebar component: navigation links with icons + active state | ○ |
| WA-05 | Topbar: breadcrumb, notification bell, user avatar + logout | ○ |
| WA-06 | `DashboardLayout`: sidebar + topbar wrapper | ○ |
| WA-07 | Auth guard: redirect to `/login` if no valid session | ○ |
| WA-08 | Login page: email/password form, Supabase Auth | ○ |

**Sidebar nav items:**
- 🏠 แดชบอร์ด `/dashboard`
- 👥 ผู้ป่วย `/residents`
- 💊 สต๊อกยา `/stock`
- 📋 ประวัติการจ่ายยา `/dispense/history`
- ⚙️ ตั้งค่า `/settings`

**Puppeteer QA (1280×900):**
- [ ] Sidebar renders at 240px width
- [ ] Active nav item highlighted
- [ ] Topbar at correct height (64px)
- [ ] Body background correct dark color
- [ ] Thai text in nav readable

---

### S4-DASHBOARD: Dashboard Page

| ID | Task | Status |
|----|------|--------|
| WA-D01 | KPI cards row: residents done today, pending, stock alerts, total residents | ○ |
| WA-D02 | Recent activity feed: last 10 dispense events with timestamp + staff | ○ |
| WA-D03 | Stock alert panel: medications below threshold (warning + critical) | ○ |
| WA-D04 | Today's progress bar: X of 54 residents filled | ○ |
| WA-D05 | Quick links: "Mulai Sesi" → goes to touchscreen kiosk | ○ |

**Puppeteer QA (1280×900):**
- [ ] All 4 KPI cards visible in one row
- [ ] Recent activity list renders with mock data
- [ ] Stock alert panel visible if alerts exist
- [ ] No layout overflow

---

### S4-RESIDENTS: Resident Management

| ID | Task | Status |
|----|------|--------|
| WA-R01 | Resident list page: table with photo, name, room, ward, med count, status | ○ |
| WA-R02 | Search bar: filter by name or room | ○ |
| WA-R03 | Ward filter: dropdown | ○ |
| WA-R04 | "เพิ่มผู้ป่วย" button → opens create form modal | ○ |
| WA-R05 | Create/Edit form: name, name_en, room, ward, allergies, chronic conditions | ○ |
| WA-R06 | Special flags toggles: ต้องบด / ยาน้ำ / ต้องช่วยเหลือ | ○ |
| WA-R07 | Photo upload: drag-and-drop to Supabase Storage | ○ |
| WA-R08 | Resident detail page: 4 tabs layout (ยา / ประวัติ / สุขภาพ / ประวัติจ่ายยา) | ○ |
| WA-R09 | Delete resident: requires confirmation dialog + `ADMIN` role only | ○ |

**Puppeteer QA (1280×900):**
- [ ] Resident table renders with all columns
- [ ] Search filters correctly
- [ ] Modal opens on create button click
- [ ] Form fields labeled in Thai

---

### S4-MEDSHEET: Digital Med Sheet

| ID | Task | Status |
|----|------|--------|
| WA-M01 | Med sheet table: columns = drug name / dose / frequency / meals / notes | ○ |
| WA-M02 | Meal columns: colored chips for each meal slot | ○ |
| WA-M03 | "เพิ่มยา" button: add medication row | ○ |
| WA-M04 | Edit medication inline or via modal | ○ |
| WA-M05 | Remove medication with confirmation | ○ |
| WA-M06 | Change highlighting: medications modified in last 48h show amber border + "แก้ไขล่าสุด" badge | ○ |
| WA-M07 | Realtime sync: subscribe to Supabase Realtime on `resident_medications` | ○ |
| WA-M08 | Special flags inline: 💊 ต้องบด, 💧 ยาน้ำ (shown as inline badge) | ○ |

**Puppeteer QA (1280×900):**
- [ ] Med sheet table visible with mock medications
- [ ] Meal chips render correct colors
- [ ] Change highlight visible on recently modified row
- [ ] Add button works (modal opens)

---

## SPRINT 5 — Stock, Notifications, History (Week 9–10)

### S5-STOCK: Stock Management

| ID | Task | Status |
|----|------|--------|
| WA-S01 | Stock page: table of all meds, current qty, estimated run-out date | ○ |
| WA-S02 | Status badge per row: ปกติ (green) / เตือน (amber) / วิกฤต (red) | ○ |
| WA-S03 | Inline quantity editor: click quantity to edit + save | ○ |
| WA-S04 | Estimated run-out: auto-calculate from qty ÷ daily_dose | ○ |
| WA-S05 | Stock request log: family notified / acknowledged / received columns | ○ |
| WA-S06 | Filter by status (show only warnings/critical) | ○ |
| WA-S07 | API: `GET /stock`, `PATCH /stock/:id` | ○ |

**Puppeteer QA (1280×900):**
- [ ] Status badges color-correct
- [ ] Critical rows visually distinct (red bg tint or border)
- [ ] Run-out date calculated and visible

---

### S5-NOTIFY: LINE Notifications

| ID | Task | Status |
|----|------|--------|
| NT-01 | Register LINE Messaging API channel | ○ |
| NT-02 | `POST /notify/line`: send LINE message to family | ○ |
| NT-03 | Trigger on stock reaching critical threshold (≤ 7 days) | ○ |
| NT-04 | Trigger on stock reaching warning threshold (≤ 14 days) | ○ |
| NT-05 | Weekly summary message to head nurse (every Sunday) | ○ |
| NT-06 | Store `line_user_id` per resident family in `residents` table | ○ |

---

### S5-HISTORY: Dispense History & Reports

| ID | Task | Status |
|----|------|--------|
| WA-H01 | History page: table with date, resident, meals, staff, outcome | ○ |
| WA-H02 | Filter by date range | ○ |
| WA-H03 | Filter by resident | ○ |
| WA-H04 | Filter by staff | ○ |
| WA-H05 | Event detail modal: full medications list + quantities | ○ |
| WA-H06 | Export to PDF: `@react-pdf/renderer` or server-side PDF gen | ○ |
| WA-H07 | API: `GET /dispense/history?date=&resident_id=&staff_id=` | ○ |

**Puppeteer QA (1280×900):**
- [ ] Table renders with seed dispense events
- [ ] Filters functional
- [ ] Export button visible

---

## SPRINT 6 — QA, Pilot, Deploy (Week 11–12)

### S6-QA: Testing

| ID | Task | Status |
|----|------|--------|
| QA-01 | Unit tests: all Elysia.js routes (happy path + 400/401/404) | ○ |
| QA-02 | Integration test: full dispense workflow API → mock Moonraker | ○ |
| QA-03 | **Puppeteer full suite**: run `capture.js` on all 10 screens | ○ |
| QA-04 | QA checklist review for every screenshot (see agent.md) | ○ |
| QA-05 | Offline mode test: disconnect network mid-dispense, verify cache | ○ |
| QA-06 | Stock alert end-to-end: reduce qty → verify LINE fires | ○ |
| QA-07 | Auth test: each role sees correct pages only | ○ |
| QA-08 | Thai language audit: scan all strings, no English user-facing text | ○ |
| QA-09 | Touch target audit: measure all buttons ≥ 48×48px | ○ |
| QA-10 | Font size audit: no text < 16px | ○ |

---

### S6-DEPLOY: Production Deployment

| ID | Task | Status |
|----|------|--------|
| DEP-01 | Create production Supabase project | ○ |
| DEP-02 | Run migrations in production | ○ |
| DEP-03 | Deploy Next.js to Vercel, set env vars | ○ |
| DEP-04 | Deploy Elysia.js API to production server | ○ |
| DEP-05 | Flash Raspberry Pi SD card with kiosk setup | ○ |
| DEP-06 | Configure Raspberry Pi kiosk: auto-open Chromium in fullscreen | ○ |
| DEP-07 | End-to-end smoke test in production with seed data | ○ |
| DEP-08 | Staff training: Khun Bus (web app), 2 caregivers (touchscreen) | ○ |

---

## Puppeteer QA — Full Screenshot Suite

Run after completing each sprint. All screenshots saved to `screenshots/` folder.

```
scripts/screenshots/capture.js runs:

Touchscreen (1024×600):
  touch-01-select-resident.png      ← Step 1, populated with seed residents
  touch-02-loading-list.png         ← Step 2, resident selected, meds listed
  touch-03-dispense-active.png      ← Step 3, meal 1 active, pills in tray
  touch-04-summary.png              ← Step 4, completion screen

Web App (1280×900):
  web-login.png                     ← Login page
  web-dashboard.png                 ← Dashboard with stats
  web-residents.png                 ← Resident list
  web-resident-detail.png           ← Single resident, medications tab
  web-med-sheet.png                 ← Med sheet with change highlight
  web-stock.png                     ← Stock page with warning rows
  web-history.png                   ← Dispense history table
```

### QA Pass Criteria (each screenshot must pass ALL):

**Layout**
- [ ] No horizontal scroll / overflow
- [ ] Viewport fills correctly (no white strips)
- [ ] Sidebar + topbar positioned correctly (web)
- [ ] Step indicator visible (touchscreen)

**Dark Theme**
- [ ] Background is dark (`#0F172A` or equivalent) — not white
- [ ] Text is light (`#F1F5F9`)
- [ ] Cards use `#1E293B`

**Typography**
- [ ] No text below 16px
- [ ] Thai characters render (Noto Sans Thai)
- [ ] Headings clearly larger than body text

**Design System Compliance**
- [ ] Primary buttons teal/green `#10B981`
- [ ] Meal chips color-coded correctly
- [ ] Status badges correct colors
- [ ] No off-brand colors

**Functional States**
- [ ] Loading states present
- [ ] Empty states present
- [ ] Disabled button states visible

---

## Design Implementation Notes (from Figma analysis)

> These are specific observations from the Figma screenshots that must be matched exactly.

| ID | Observation | Screen | Implementation |
|----|-------------|--------|----------------|
| FIG-01 | Background is warm off-white, not pure white and not dark | All | Use `#FFFBF7` for page bg, `#FFFFFF` for cards |
| FIG-02 | Date header on dispense screen is **orange bold**, not black | Step 4 | `color: #F97316; font-weight: 700; font-size: 24px` |
| FIG-03 | Checked medication rows have **peach bg**, not just a checkmark | Step 3 | `background: #FFF3E8` on checked row |
| FIG-04 | "Coming Soon" day columns are grayed — no button, muted text | Step 4 | `opacity: 0.45; pointer-events: none` on future columns |
| FIG-05 | Stats numbers in summary are large orange, labels are small muted below | Step 5 | Number: 28px bold orange. Label: 13px stone-400 |
| FIG-06 | Ward cards show 4 data fields (patients, caregiver, med status, stock) | Step 1 | All 4 fields required, with icons |
| FIG-07 | Top nav is **horizontal**, no sidebar — logo left, icons right | Web + Touch | No left sidebar. Use topbar with h=56–60px |
| FIG-08 | Step indicator is **centered at top**, pill-dot style | All touchscreen | Center pill dots, not top-right circles |
| FIG-09 | Medication quantity is right-aligned, **orange color** `×14` format | Step 3 | `color: #F97316; font-weight: 700` right side of row |
| FIG-10 | Meal chips are small rounded pills with light bg | Steps 3–4 | `border-radius: 9999px; padding: 2px 8px; font-size: 12px` |

---

## Thai String Reference

```javascript
// Navigation
'แดชบอร์ด'           // Dashboard
'ผู้ป่วย'             // Residents/Patients
'สต๊อกยา'            // Stock/Inventory
'ประวัติการจ่ายยา'    // Dispense History
'ตั้งค่า'             // Settings

// Touchscreen Steps
'เลือกผู้ป่วย'        // Select Resident
'ตรวจสอบยา'          // Check Medications
'จ่ายยา'             // Dispense
'สรุปผล'             // Summary

// Meals
'ก่อนอาหารเช้า'       // Before Breakfast
'หลังอาหารเช้า'       // After Breakfast
'หลังอาหารเย็น'       // After Dinner
'ก่อนนอน'            // Bedtime

// Status
'รอดำเนินการ'         // Pending
'เสร็จแล้ว'           // Done / Completed
'กำลังจ่าย'          // Dispensing
'คงเหลือปกติ'         // Normal stock
'เตือน'              // Warning
'วิกฤต'              // Critical

// Actions
'เริ่ม Dispense'      // Start Dispense (keep "Dispense" as technical term)
'ใส่กล่องแล้ว'        // Placed in box / Done
'ถัดไป'              // Next
'กลับ'               // Back
'ยืนยัน'             // Confirm
'ยกเลิก'             // Cancel
'บันทึก'             // Save
'แก้ไข'              // Edit
'ลบ'                 // Delete
'เพิ่ม'              // Add

// Messages
'จัดยาครบสัปดาห์!'   // Weekly fill complete!
'ยาครบทุกช่องแล้ว'   // All slots filled
'ยืนยันก่อน Dispense' // Confirm before dispensing
'มียาบางรายการหมด'    // Some medications running low
```

---

## Progress Summary

```
Sprint 1 (Foundation)     ███████░░░░░░░░  9/19
Sprint 2 (API + Shell)    ░░░░░░░░░░░░░░░  0/14
Sprint 3 (Touchscreen)    ░░░░░░░░░░░░░░░  0/40
Sprint 4 (Web App)        ░░░░░░░░░░░░░░░  0/31
Sprint 5 (Stock/Notify)   ░░░░░░░░░░░░░░░  0/20
Sprint 6 (QA + Deploy)    ░░░░░░░░░░░░░░░  0/18

TOTAL                     █░░░░░░░░░░░░░░  9/142
```

---

## Notes for Codex

1. **Read CLAUDE.md first** — contains updated design system (light/orange — Figma Pillo direction)
2. **Read agent.md** — contains Puppeteer scripts, QA checklist, and all Figma screen specs
3. **Light theme (Figma direction)** — Background `#FFFBF7`, cards white, primary orange `#F97316`. The old dark POC is superseded.
4. **Thai strings** — use the reference table above for all user-facing text
5. **Screenshot before marking done** — every task group requires screenshot QA pass
6. **No text < 16px, no buttons < 48×48px** — hard requirements from PRD
7. **POC fixes** — address FIX-01 through FIX-08 when implementing the respective screens
8. **Dispense events are immutable** — no DELETE or UPDATE on `dispense_events`
