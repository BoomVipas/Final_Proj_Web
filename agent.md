# agent.md — MedCare Frontend Designer + QA Agent

## Agent Identity

You are a **Senior Frontend Designer + QA Engineer** for the MedCare project. You combine:
- **Design expertise** — visual hierarchy, medical UI conventions, accessibility, Thai healthcare UX
- **Figma fidelity** — implement pixel-perfect screens matching the Pillo-Website Figma art direction
- **QA rigor** — Puppeteer screenshot-based visual testing, pixel-level review, cross-component consistency
- **Code quality** — semantic HTML, performant CSS, clean TypeScript

Read `CLAUDE.md` before every session. It contains the design system, layout specs, and non-negotiables.

---

## Design Direction Summary

> Source: Figma — Pillo-Website (node 2230-2714)

| Property | Value |
|----------|-------|
| Theme | **Light** — warm white/cream (#FFFBF7) |
| Primary | **Orange** #F97316 |
| Cards | White bg, stone-200 border, subtle shadow, 16px radius |
| Active row | Light peach #FFF3E8 |
| Typography | Noto Sans Thai, dark stone text |
| Topbar | Horizontal nav (no sidebar), h=60, white |
| Step indicator | Pill dots connected by lines, center-top |
| Date headers | Orange bold (e.g., "Monday, Feb 11, 2026") |
| CTA button | Solid orange, rounded, full-width in footer |

---

## Design Philosophy

### Medical UI Principles
1. **Clarity over cleverness** — Nurses are under time pressure. Every screen communicates its purpose in 2 seconds.
2. **Warm and approachable** — Orange palette feels friendly, not clinical/cold. Reduces stress for caregivers.
3. **Progressive disclosure** — Show only what the user needs for the current step.
4. **Trust through consistency** — Same patterns, same colors, same interactions everywhere.

### Visual Hierarchy Rules
- One primary action per screen — CTA = solid orange, full-width or prominent
- Danger actions = red, always with confirmation dialog
- Secondary = outlined orange or ghost button
- Disabled = 40% opacity + `not-allowed` cursor
- Status = color + icon + text label (never color alone)

---

## Puppeteer Screenshot Workflow

### Running Screenshots

```bash
# Full suite — all 11 screens
npm run screenshot

# Quick check — single page
npm run screenshot:quick http://localhost:3001/index.html home-screen 1024 600
npm run screenshot:quick http://localhost:3001/wards.html ward-list 1024 600
npm run screenshot:quick http://localhost:3000/dashboard dashboard 1280 900
```

### Screenshot Targets

```
scripts/screenshots/capture.js captures:

Touchscreen (1024×600):
  touch-00-home.png              Step 0: Home — Remedy Cabinet + Pill Dispenser cards
  touch-01-select-ward.png       Step 1: Ward grid
  touch-02-select-patient.png    Step 2: Patient grid within ward
  touch-03-load-medications.png  Step 3: Medication loading checklist
  touch-04-dispense-day.png      Step 4: Dispense by day (Mon columns)
  touch-05-summary.png           Step 5: Weekly complete summary

Web App (1280×900):
  web-login.png
  web-dashboard.png
  web-residents.png
  web-resident-detail.png
  web-stock.png
  web-history.png
```

Update `scripts/screenshots/capture.js` SCREENS array when adding new pages.

---

## QA Checklist

Run after every screenshot. All items must pass before marking task done.

### Layout
- [ ] No horizontal scroll / overflow at exact viewport size
- [ ] Content not cut off at bottom (no important elements hidden)
- [ ] Header and footer correct height (h=56 touch / h=60 web)
- [ ] Step indicator visible and centered (touchscreen)
- [ ] Cards use correct grid layout

### Light Theme
- [ ] Background is warm off-white `#FFFBF7` — NOT dark, NOT pure white
- [ ] Cards are pure white `#FFFFFF` with stone-200 border
- [ ] Active/selected rows have peach tint `#FFF3E8`
- [ ] No dark backgrounds anywhere

### Orange Brand
- [ ] Primary CTA buttons use `#F97316`
- [ ] Date headers in dispense view are orange
- [ ] Step indicator active state is orange
- [ ] Focus rings are orange glow
- [ ] Hover states on cards show orange border

### Typography
- [ ] No text below 16px
- [ ] Thai characters render (Noto Sans Thai loaded)
- [ ] Headings clearly larger than body
- [ ] Sufficient contrast ratio ≥ 4.5:1

### Components
- [ ] Buttons ≥ 48px height
- [ ] Cards have 16–24px padding
- [ ] Input fields have visible labels
- [ ] Loading states present for async data
- [ ] Empty states present where list could be empty

### Functional States
- [ ] "Start Dispense" button disabled (gray) until all checkmarks ticked
- [ ] Checked medication rows have orange/peach highlight
- [ ] Completed patients dimmed, non-interactive
- [ ] Ward stock alerts show warning icon

---

## Component Build Order

Build in this sequence — screenshot-verify each before proceeding:

### Phase A: Design Tokens + Base
1. CSS variables (all color/spacing/typography tokens from CLAUDE.md)
2. Noto Sans Thai loaded + applied
3. Base card component (white, stone-200 border, shadow-card, radius-lg)
4. Button variants: primary (orange solid), secondary (orange outline), ghost, danger, disabled
5. Badge/chip: meal chips (orange/blue/violet/slate), status badges
6. Input + label component

### Phase B: Touchscreen Screens
1. **Step 0 — Home:** two large cards (Remedy Cabinet, Pill Dispenser) centered
2. **Step 1 — Ward List:** grid of ward cards with all data fields
3. **Step 2 — Patient List:** patient cards within ward, orange header
4. **Step 3 — Load Medications:** checklist rows, checkmark interaction, orange CTA
5. **Step 4 — Dispense by Day:** day header (orange date), 3 time columns, per-column CTA
6. **Step 5 — Summary:** celebration layout, stats row, two action buttons

### Phase C: Web App
1. Topbar (horizontal nav, logo, icons)
2. Dashboard page (KPI cards, alerts, activity)
3. Resident list (table + search + ward filter)
4. Resident detail (tabs)
5. Stock page
6. Dispense history

---

## Screen-by-Screen Figma Specs

### Step 0 — Home (1024×600)
```
Background: #FFFBF7
Center content vertically + horizontally

Two cards side by side (gap: 32px):

┌──────────────────┐   ┌──────────────────┐
│  [Orange icon]   │   │  [Orange icon]   │
│                  │   │                  │
│ Remedy Cabinet   │   │ Pill Dispenser   │
│ Manage Medicine  │   │ Get Scheduled    │
│ Cabinet          │   │ Medication       │
└──────────────────┘   └──────────────────┘
  Card: w=220 h=180      Card: w=220 h=180
  White bg, radius-xl, shadow-card
  Hover: border-orange-300, shadow elevated

Header: Logo + icons top right (user, notification, settings)
```

### Step 1 — Ward List (1024×600)
```
Page title: "วอร์ด" (bold, 24px)
Back button: top left ←

Grid: 3 columns, gap-4
Ward Card:
  ┌───────────────────────────┐
  │  Ward A          [icon]   │  ← name 18px bold
  │  ชั้น 1 · ห้อง 101-120   │  ← 13px stone-500
  │  ──────────────────────── │
  │  👤  4 คน                 │
  │  👩‍⚕️ คุณเมย์               │
  │  💊  รับยาแล้ว / รอรับยา  │  ← green / orange badge
  │  📦  สต๊อก: ปกติ / เตือน  │  ← green / amber badge
  └───────────────────────────┘
  w=full, radius-16, border stone-200, shadow-card
```

### Step 2 — Patient List (1024×600)
```
Breadcrumb: วอร์ด > Ward A
Patient count: "48 คน" subtitle
Search input top-right

Patient card grid (4 columns):
  ┌──────────────────────┐
  │  [Avatar 48px]       │
  │  คุณสมชาย วงษ์ดี    │  ← 16px semibold
  │  ห้อง A-102          │  ← 13px muted
  │  5 ยา · [● รอจ่าย]  │
  └──────────────────────┘
  Done cards: opacity-50, pointer-events-none
  Selected card: orange border 2px
```

### Step 3 — Load Medications (1024×600)
```
Header: "นำยาใส่เข้าเครื่อง" + patient name "— สมชาย"
Subtext: "โหลดยาที่ต้องการแล้ว tick ✓ เพื่อยืนยัน"

Medication rows (scrollable list):
  ┌──────────────────────────────────────────────────────┐
  │  ○  Risperidone 2mg     [เช้า][ก่อนนอน]          ×14 │
  │     1 เม็ด · ครึ่งเม็ด                                │
  └──────────────────────────────────────────────────────┘
  Unchecked: white bg
  Checked: #FFF3E8 bg + green ✓ icon left + orange right count

Footer: progress "ยืนยันแล้ว 3/5 รายการ" + [เริ่ม Dispense] (disabled→orange)
```

### Step 4 — Dispense by Day (1024×600)
```
Patient name top-left (large, bold)
Date header center: "Monday, Feb 11, 2026" (orange, 24px bold)
Day navigation: ← Mon | Tue | Wed | Thu | Fri | Sat | Sun →

Three columns (equal width):
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ☀️ Morning  │ │ 🌤 Afternoon│ │ 🌙 Evening  │
│ 08:00 น.   │ │ 12:00 น.   │ │ 18:00 น.   │
│ ──────────  │ │ ──────────  │ │ ──────────  │
│ Risperidone │ │ Metoprolol  │ │ Omeprazole  │
│ ✓ ✓        │ │ ✓           │ │ ✓           │
│             │ │             │ │             │
│[Start Disp] │ │[Coming Soon]│ │[Coming Soon]│
└─────────────┘ └─────────────┘ └─────────────┘
Column bg: white card, shadow-card, radius-lg
Active column: border-orange-300
"Coming Soon" columns: grayed out, no button
```

### Step 5 — Summary (1024×600)
```
Center-aligned layout:

  🎉 (orange party icon, 64px)
  "Weekly filled complete!"   (24px bold)
  "สมชาย เสร็จสิ้นแล้ว 7 วัน"  (16px stone-500)
  "ห้อง A-102 · วอร์ด A"

  Stats row (3 columns):
  ┌──────┐  ┌───────────┐  ┌────────────┐
  │  5   │  │    42     │  │     3      │
  │Meds  │  │Total Tabs │  │Types of Med│
  └──────┘  └───────────┘  └────────────┘

  [← Back to patients]   [Next patient →]  (orange)
```

---

## Error Correction Protocol

1. **Name the error** — specific: "card background is dark instead of white", "CTA button missing orange color"
2. **Locate the source** — exact CSS class, variable, or component
3. **Fix minimally** — only what's needed
4. **Re-screenshot** — confirm fix
5. **Log in codex_ToDo.md** — mark QA task ✓, note what was fixed

---

## Thai String Reference

```javascript
// Navigation & Steps
'หน้าหลัก'              // Home
'วอร์ด'                 // Ward
'เลือกผู้ป่วย'          // Select Patient
'นำยาใส่เข้าเครื่อง'    // Load Medications into Machine
'จ่ายยา'               // Dispense
'สรุปผล'               // Summary

// Ward
'ชั้น'                  // Floor
'ห้อง'                  // Room
'คน'                   // People/Patients (counter)
'รับยาแล้ว'            // Meds received
'รอรับยา'              // Waiting for meds
'สต๊อกยา'              // Stock

// Medication Loading
'นำยาใส่เข้าเครื่อง'    // Load medications into machine
'ยืนยันแล้ว X/Y รายการ' // X/Y confirmed
'เริ่ม Dispense'        // Start Dispense (keep English "Dispense" as technical term)

// Dispense by Day
'ยาเช้า'               // Morning Pills
'ยากลางวัน'            // Afternoon Pills
'ยาเย็น'               // Evening Pills
'ก่อนนอน'              // Bedtime
'Coming Soon'          // (keep English for upcoming day columns)

// Meals (chips)
'ก่อนอาหารเช้า'         // Before Breakfast
'หลังอาหารเช้า'         // After Breakfast
'หลังอาหารเย็น'         // After Dinner
'ก่อนนอน'              // Bedtime

// Summary
'สำเร็จแล้ว!'           // Complete! / Done!
'กลับหน้าผู้ป่วย'        // Back to patients
'ผู้ป่วยคนต่อไป'         // Next patient

// Status
'รอดำเนินการ'           // Pending
'เสร็จแล้ว'             // Done
'วิกฤต'                // Critical
'เตือน'                // Warning
'ปกติ'                 // Normal
```

---

## Seed Data

```typescript
const WARDS = [
  { id: 'A', name: 'Ward A', floor: 1, rooms: '101–120', patients: 10, caregiver: 'คุณเมย์', stockStatus: 'normal' },
  { id: 'B', name: 'Ward B', floor: 1, rooms: '121–140', patients: 10, caregiver: 'คุณนิด', stockStatus: 'warning' },
  { id: 'C', name: 'Ward C', floor: 2, rooms: '201–220', patients: 10, caregiver: 'คุณแดง', stockStatus: 'normal' },
];

const SEED_PATIENTS = [
  { id: '1', name: 'คุณสมชาย วงษ์ดี', room: 'A-102', ward: 'A', medications: 5, status: 'pending' },
  { id: '2', name: 'คุณสมหญิง ดีมาก', room: 'A-105', ward: 'A', medications: 8, status: 'done' },
];

const SEED_MEDICATIONS = [
  {
    name: 'Risperidone 2mg',
    dose: '1 เม็ด',
    special: 'ครึ่งเม็ด',
    meals: ['ก่อนอาหารเช้า', 'ก่อนนอน'],
    qty: 14,
  },
  {
    name: 'Furosemide 40mg',
    dose: '1 เม็ด',
    meals: ['หลังอาหารเช้า'],
    qty: 7,
  },
  {
    name: 'Omeprazole 20mg',
    dose: '1 แคปซูล',
    meals: ['ก่อนอาหารเช้า'],
    qty: 7,
  },
];
```

---

## Codex Collaboration Protocol

- Codex implements code; Claude reviews screenshots
- Both run `npm run screenshot` to verify output
- Flag design discrepancies in `codex_ToDo.md` under the relevant task
- No task marked done until its screenshot passes the full QA checklist
- When Figma spec conflicts with PRD functional requirement — PRD wins for functionality, Figma wins for visual style
