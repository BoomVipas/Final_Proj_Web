# MedCare — CLAUDE.md

## Project Overview

MedCare is an automated pill dispensing system for elderly care facilities, specifically Saensuk Healthcare Nonthaburi (54 residents). It replaces the manual weekly medication sorting process with a software-guided, hardware-controlled workflow.

**Three integrated components:**
1. **Dispenser Machine** — Raspberry Pi 4 + Moonraker API + Stepper Motors
2. **Touchscreen UI** — HTML/CSS/JS on 7" display (1024×600 landscape, kiosk mode)
3. **Web Application** — Next.js + Elysia.js + FastAPI + Supabase

---

## Your Role

You are acting as a **Frontend Designer + QA Engineer** for this project. Your responsibilities:
- Design and implement pixel-perfect UI matching the Figma art direction (Pillo-Website)
- Apply the MedCare design system consistently across all components
- Use Puppeteer to take screenshots after every component implementation
- Review screenshots and correct visual/layout/code errors before moving on
- Enforce accessibility, Thai language support, and touch-target minimums

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Touchscreen UI | Vanilla HTML/CSS/JS (no framework) |
| API Gateway | Elysia.js (Bun runtime) |
| ML / Inference | FastAPI (Python) |
| Database | Supabase (PostgreSQL + Realtime) |
| Hardware Control | Raspberry Pi 4 + Moonraker API |
| Notifications | LINE Messaging API |
| Auth | Supabase Auth (JWT, role-based) |
| Screenshot QA | Puppeteer |

---

## Design System

> **Art direction source:** Figma — Pillo-Website (node 2230-2714)
> Theme is **LIGHT** — warm white/cream backgrounds with orange accents.
> Do NOT use dark backgrounds from the old POC prototype.

### Color Palette

```css
/* ── Backgrounds ─────────────────────────────── */
--bg-base:      #FFFBF7;   /* Warm off-white — page background */
--bg-surface:   #FFFFFF;   /* Pure white — cards, panels */
--bg-highlight: #FFF3E8;   /* Light peach — active/selected row */
--bg-muted:     #F5F5F0;   /* Very light gray — secondary surfaces */

/* ── Primary Orange ──────────────────────────── */
--color-primary:       #F97316;   /* Orange-500 — main brand, CTAs */
--color-primary-light: #FB923C;   /* Orange-400 — hover, lighter accents */
--color-primary-dark:  #EA6C0A;   /* Orange-600 — pressed state */
--color-primary-bg:    #FFF3E8;   /* Orange-50  — row highlight, soft bg */

/* ── Meal / Time Colors ───────────────────────── */
--meal-morning:   #F97316;   /* Orange  — Morning Pills   ก่อน/หลังอาหารเช้า */
--meal-afternoon: #3B82F6;   /* Blue    — Afternoon Pills หลังอาหารกลางวัน */
--meal-evening:   #8B5CF6;   /* Violet  — Evening Pills   หลังอาหารเย็น */
--meal-bedtime:   #64748B;   /* Slate   — Bedtime         ก่อนนอน */

/* ── Status ───────────────────────────────────── */
--color-success:  #16A34A;   /* Green-600 — done, confirmed */
--color-warning:  #D97706;   /* Amber-600 — low stock warning */
--color-critical: #DC2626;   /* Red-600   — critical stock */
--color-done:     #D1D5DB;   /* Gray-300  — completed/dimmed */

/* ── Text ────────────────────────────────────── */
--text-primary:   #1C1917;   /* Stone-900 — main body text */
--text-secondary: #78716C;   /* Stone-500 — secondary labels */
--text-muted:     #A8A29E;   /* Stone-400 — placeholders, hints */
--text-orange:    #F97316;   /* Orange    — date headers, emphasis */

/* ── Borders ─────────────────────────────────── */
--border-color:   #E7E5E4;   /* Stone-200 — default borders */
--border-focus:   #F97316;   /* Orange    — focused input ring */
```

### Typography

```css
/* Font stack: Noto Sans Thai (Google Fonts) — supports Thai + Latin */
/* Minimum 16px body — PRD clinical readability requirement */
/* 18px+ preferred on touchscreen */

--font-size-xs:   13px;
--font-size-sm:   16px;   /* absolute minimum */
--font-size-md:   18px;   /* touchscreen default body */
--font-size-lg:   22px;
--font-size-xl:   28px;
--font-size-2xl:  36px;
--font-size-3xl:  48px;

/* Weight scale */
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

### Border Radius

```css
--radius-sm:   6px    /* tags, chips */
--radius-md:   10px   /* inputs, small cards */
--radius-lg:   16px   /* cards, panels */
--radius-xl:   24px   /* modals, large cards */
--radius-full: 9999px /* pills, badges */
```

### Shadows

```css
--shadow-sm:    0 1px 2px rgba(0,0,0,.05);
--shadow-card:  0 2px 8px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05);
--shadow-modal: 0 20px 60px rgba(0,0,0,.12);
--shadow-focus: 0 0 0 3px rgba(249,115,22,.25);  /* orange glow */
```

---

## Touchscreen Navigation Flow (6 Steps)

> Updated from 4-step POC to match Figma workflow.

```
Step 0 — Home
  ├── "Remedy Cabinet"   → web app (manage meds/residents)
  └── "Pill Dispenser"   → enters the dispense workflow ▼

Step 1 — Select Ward
  Grid of ward cards (Ward A, Ward B, etc.)
  Each card: ward name, floor/room range, patient count,
             caregiver name, stock status

Step 2 — Select Patient
  Grid of patient cards within the selected ward
  Each card: avatar, name, room, medication count, status

Step 3 — Load Medications
  List of all medications to load into the machine
  Each row: drug name+dose | meal chips | quantity (×7 / ×14)
  Nurse taps checkmark per row → "Start Dispense" unlocks

Step 4 — Dispense by Day
  Shows the weekly schedule day-by-day
  Current day header in orange (e.g., "Monday, Feb 11, 2026")
  Three time columns: Morning Pills | Afternoon Pills | Evening Pills
  Each column lists medications for that time slot
  Nurse confirms each column → advances to next day

Step 5 — Summary
  "Weekly filled complete!" celebration
  Stats: Meds, Total Tabs, Types of Med
  Buttons: "Back to patients" | "Next patient →"
```

---

## Touchscreen Layout (1024×600)

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Logo left · Step pills (○─○─○─○─○) center · Icons  │
│  h=56, bg=white, bottom border stone-200                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│            MAIN CONTENT AREA (bg=#FFFBF7)                   │
│            padding: 24px, overflow-y: auto                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER: Back button (ghost) + Primary CTA (orange solid)   │
│  h=72, bg=white, top border stone-200                        │
└──────────────────────────────────────────────────────────────┘
```

**Step indicator:** Pill-shaped dots connected by lines. Active = filled orange. Done = filled orange with ✓. Future = stone-200 outline.

---

## Web App Layout

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo · Nav links · Notification bell · User avatar  │
│  h=60, bg=white, shadow-sm                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         MAIN CONTENT (max-w-7xl, mx-auto, px-6, py-8)       │
│         bg=#FFFBF7                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

> No sidebar on web. Uses a **top navigation bar** (horizontal). Matches Figma layout.

---

## Figma Component Patterns

### Ward Card
```
┌───────────────────────────────┐
│  Ward A                       │  ← 18px bold
│  Floor 1 · Room 101–120       │  ← 14px stone-500
│  ─────────────────────────── │
│  👤 4 Patients                │
│  👩‍⚕️ Caregiver: Khun May     │
│  💊 Get Med: ✓ Done           │
│  📦 Stock: ⚠ Low              │
└───────────────────────────────┘
bg: white, border: stone-200, radius: 16px, shadow: card
hover: border-orange-300, shadow elevated
```

### Patient Card (in ward)
```
┌───────────────────────────────┐
│  [Avatar 48×48]  Somchai      │  ← 18px semibold
│  Room A-102 · Ward A          │  ← 14px muted
│  5 medications                │
│  [● Pending] or [✓ Done]      │
└───────────────────────────────┘
```

### Medication Row (Load screen)
```
┌──────────────────────────────────────────────────────┐
│  ○  Risperidone 2mg          [Morning][Bedtime]   ×14 │
│     1 เม็ด · ครึ่งเม็ด                                │
└──────────────────────────────────────────────────────┘
Unchecked: white bg
Checked:   #FFF3E8 bg (light orange) + orange checkmark
```

### Dispense Day Column
```
┌─────────────────────┐
│ ☀️ Morning Pills    │  ← orange icon + label
│ 08:00 AM            │  ← stone-400
│ ─────────────────── │
│ Risperidone 2mg  ✓  │
│ Omeprazole 20mg  ✓  │
│ ─────────────────── │
│ [Start Dispense]    │  ← orange button, full width
└─────────────────────┘
```

---

## User Roles & Access

| Role | Interface | Access |
|------|-----------|--------|
| Head Nurse | Web App + Touchscreen | Full CRUD on residents, meds, schedules |
| Caregiver | Touchscreen only | Run weekly fill workflow |
| Family | Web App (read-only) | View schedule + dispense history |
| Admin | Web App | User management, facility settings |

---

## Accessibility & Localization

- All UI text **must support Thai language** (`lang="th"` on HTML root)
- Font: **Noto Sans Thai** via Google Fonts
- All interactive elements must have visible focus rings (orange glow)
- Color must not be the only differentiator — always pair with icon or label
- Viewport: 1024×600 (touchscreen), 1280+ (web)

---

## Puppeteer QA Workflow

After implementing any component or page:
1. Start local dev server
2. `node scripts/screenshots/capture.js`
3. Review screenshot against QA checklist in `agent.md`
4. Fix errors → re-screenshot → confirm → mark task done

---

## Non-Negotiables

- **Light theme only** — white/warm cream backgrounds. No dark theme.
- No text below 16px
- No touch targets below 48×48px
- Thai language on all user-facing strings
- Orange (#F97316) as primary brand color
- Every dispense event logged to Supabase (immutable)
- Offline-capable touchscreen (cache + sync on reconnect)
- JWT on all API endpoints
