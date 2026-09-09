# 🌾 Kisan Setu — Complete Tech Stack Document

> **Kisan Setu** is a full-stack, government-grade APMC digital procurement platform built for Smart India Hackathon (SIH). It enables farmers to book MSP slots, track payments, and interact with mandi staff — while providing a complete operational portal for Gate Staff, Centre Admins, and State-level Administrators.

---

## 1. Frontend Framework & Runtime

| Technology | Version | Role |
|---|---|---|
| **React** | `^19.2.8` | UI component library (latest stable) |
| **TypeScript** | `~6.0.2` | Type safety across all components and services |
| **Vite** | `^8.2.2` | Build tool, dev server, HMR, and production bundler |
| `@vitejs/plugin-react` | `^6.1.0` | Babel-powered React Fast Refresh plugin for Vite |

### Key Patterns
- All UI state managed with **React Hooks** (`useState`, `useEffect`, `useRef`, `useCallback`)
- **No Redux / Zustand** — each page is self-contained with local state + service calls
- **Inline styles** exclusively (no Tailwind/CSS framework) — allows granular per-component control
- Custom CSS files only for shared layout primitives (sidebar, header, dashboard grid)

---

## 2. Routing

| Technology | Role |
|---|---|
| **Custom SPA Router** (`src/router.ts`) | Hand-rolled `useRouter` hook + `navigate()` function using the HTML5 History API (`pushState` / `popstate`). No `react-router-dom` dependency. |

### Features
- Handles **GitHub Pages** base-path stripping (`/Kisan-Setu` prefix)
- Handles **hash-based routing** (`#/path`) for static host fallback
- Handles **query-string redirects** (`?/staff/dashboard`) for 404-redirect SPA trick on GitHub Pages

---

## 3. Backend — Database & Auth

| Technology | Version | Role |
|---|---|---|
| **Supabase** | `^2.112.4` | PostgreSQL database + Auth + Row-Level Security |
| `@supabase/supabase-js` | `^2.112.4` | Official Supabase JS client SDK |

### Architecture
- **Primary mode:** Live Supabase PostgreSQL with full CRUD operations
- **Fallback mode:** `localStorage` cache — all data services degrade gracefully if Supabase is offline or unconfigured
- Supabase URL and anon key can be configured at runtime via `localStorage` (no redeploy needed)
- Health check endpoint: `GET /health` on the Supabase project, queried via `checkBackendHealth()`

### Key Tables (from service layer)
| Table | Purpose |
|---|---|
| `bookings` | Farmer slot bookings with QR hash, status, timestamps |
| `centres` | APMC mandi centre registry |
| `staff` | Staff profiles, roles, designation, centre mapping |
| `staff_notifications` | Per-staff alert feed |
| `verification_audit_logs` | Cryptographic QR scan audit trail |
| `queue_entries` | Live weighbridge/token queue |
| `payments` | DBT payment records with PFMS UTR references |

---

## 4. QR Code System

| Technology | Version | Role |
|---|---|---|
| **qrcode** | `^1.5.4` | Server-side QR code image generation (PNG/DataURL) |
| **html5-qrcode** | `^2.3.8` | Live camera QR scanner for gate staff (`html5QrcodeScanner`) |
| `@types/qrcode` | `^1.5.6` | TypeScript type definitions for qrcode |
| **Web Crypto API** | Browser native | `window.crypto.getRandomValues()` + `SubtleCrypto.digest('SHA-256')` |

### Security Model (`qrBookingService.ts`)
- Each booking generates a **cryptographically random 32-hex-char token** (`generateSecureQRToken`)
- Token is hashed with **SHA-256** (`hashTokenSHA256`) and stored in `bookings.qr_token_hash`
- The raw token is embedded in the QR code payload; never stored plaintext in the DB
- Gate staff scan → raw token hashed client-side → compared against stored hash → one-time verification

---

## 5. AI / ML Integration

| Technology | Role |
|---|---|
| **FastAPI** (Python, external microservice) | ML inference server running `waiting_time_model.pkl` + `queue_forecast_model.pkl` |
| **Scikit-learn** (Python, external) | Random Forest Regression models trained on 58 UP procurement centres |
| `mlService.ts` (TypeScript client) | REST client for `/ai/analyze` endpoint; multi-horizon queue forecast (15m / 30m / 45m / 60m) |

### Fallback ML
If the FastAPI server is offline, `mlService.ts` performs **high-fidelity local inference** using:
- Queue length ÷ active counters × service time (weighted by agency capacity multiplier)
- Peak-hour multipliers (1.22× for 09:00–14:00)
- Net arrival vs. service-rate projections for each forecast horizon

> The ML endpoint URL can be set at runtime via `localStorage` key `kisan_setu_ml_api_url`.

---

## 6. Weather Integration

| Technology | Role |
|---|---|
| **Open-Meteo API** | Free, open-source meteorological REST API (`api.open-meteo.com`) — WMO weather code based |
| **BigDataCloud Reverse Geocoder** | Free API to convert GPS coordinates → human-readable city/district name |
| **Browser Geolocation API** | `navigator.geolocation.getCurrentPosition()` for live GPS-based weather |

### Flow
1. Check cached GPS coordinates in `localStorage`
2. Request fresh GPS from browser
3. Call Open-Meteo `/v1/forecast` with `current=temperature_2m,humidity,weather_code,wind_speed_10m`
4. WMO code → farm-specific advisory (e.g. "Cover grain bags with plastic sheets")
5. Fallback: district-level coordinates for Varanasi, Chandauli, Ghazipur, Jaunpur, Jaipur, Alwar

---

## 7. Icon Library

| Technology | Version | Role |
|---|---|---|
| **Lucide React** | `^1.35.0` | SVG icon set — used throughout all portals (Bell, QrCode, AlertTriangle, CheckCircle2, MapPin, etc.) |

---

## 8. Internationalisation (i18n)

| Technology | Role |
|---|---|
| **Custom `translations.ts`** (110KB) | Hand-written English ↔ Hindi translation map covering all UI strings |
| **`LanguageContext.tsx`** | React context providing `lang` toggle (`en` / `hi`) |
| **`useLanguage.ts`** hook | `const { t, lang, setLang } = useLanguage()` — consumed by all public-facing pages |

Supported languages: **English** and **हिन्दी (Hindi)**

---

## 9. Progressive Web App (PWA)

| Technology | Role |
|---|---|
| **Service Worker** (`/sw.js`) | Offline caching, background sync capability |
| **Web App Manifest** (`/manifest.json`) | Installable PWA with `standalone` display mode, theme `#0d631b`, 192px + 512px maskable icons |
| `registerServiceWorker.ts` | Registration + auto-update logic with `controllerchange` reload |

### PWA App Shortcuts
- Farmer Dashboard
- Book Procurement Slot
- Live Mandi Queue
- DBT Payment Status

---

## 10. Access Control & Security

| Technology | Role |
|---|---|
| **`rbacService.ts`** | Centralized Role-Based Access Control — 4 roles × 30+ granular permissions |
| **`farmerAuthService.ts`** | Farmer auth via Supabase Auth + `sessionStorage` session |
| **`staffDataService.ts`** (auth section) | Staff auth via hashed password vault in `localStorage` + `sessionStorage` session |

### User Roles
| Role | Portal | Permissions |
|---|---|---|
| `FARMER` | `/farmer-dashboard/*` | Own bookings, slots, queue, DBT payments, profile |
| `STAFF` | `/staff/*` | QR gate scan, queue management, weighment, quality check |
| `CENTRE_ADMIN` | `/centre-admin/*` | Token management, staff roster, DBT approval, price management, reports |
| `ADMIN` | `/admin/*` | All centres, global users, departments, system settings, analytics |

---

## 11. Tooling & Code Quality

| Technology | Version | Role |
|---|---|---|
| **oxlint** | `^1.79.0` | Fast Rust-based JavaScript/TypeScript linter (replaces ESLint) |
| **TypeScript strict mode** | `~6.0.2` | Full type checking across 100+ source files |
| `tsconfig.app.json` | — | App-level TS config with strict settings |
| `tsconfig.node.json` | — | Node/Vite tooling TS config |

---

## 12. Deployment

| Platform | Role |
|---|---|
| **GitHub Pages** | Primary static hosting (`https://yadav-anupam.github.io/Kisan-Setu/`) |
| **Vercel** (configured) | Alternative deployment with SPA rewrite rule (`vercel.json`) |
| **Vite `base: './'`** | Relative asset paths for GitHub Pages compatibility |

### Build Output
```
dist/
  index.html          ~1.5 kB
  assets/index.css   ~133 kB (gzip: 20 kB)
  assets/index.js   ~1,686 kB (gzip: 406 kB)
  manifest.json
  sw.js
```

---

## 13. Portal Architecture

```
src/
├── components/
│   ├── farmer/          # 19 files — Farmer PWA portal
│   │   ├── FarmerDashboard.tsx         # Main dashboard with weather, queue, MSP
│   │   ├── MyAppointmentsPage.tsx      # Slot booking + QR generation
│   │   ├── LiveQueuePage.tsx           # Live token queue viewer
│   │   ├── DbtPaymentsPage.tsx         # PFMS DBT payment ledger
│   │   ├── FarmerProfilePage.tsx       # KYC profile management
│   │   ├── FarmerHistoryPage.tsx       # Procurement history
│   │   └── MyProcurementPage.tsx       # Active procurement records
│   │
│   ├── staff/           # 36 files — Operations Staff portal
│   │   ├── StaffDashboardPage.tsx      # KPI overview + AI advisory
│   │   ├── StaffQRScannerPage.tsx      # Live camera QR gate scanner
│   │   ├── StaffQueuePage.tsx          # Token queue management
│   │   ├── StaffBookingsPage.tsx       # All bookings table
│   │   ├── StaffWeighmentPage.tsx      # Weighbridge entry
│   │   ├── StaffQualityCheckPage.tsx   # Moisture/FAQ quality grading
│   │   ├── StaffPaymentsPage.tsx       # Payment disbursement
│   │   ├── StaffManagementPage.tsx     # Staff roster by section
│   │   ├── StaffFarmersPage.tsx        # Farmer directory
│   │   ├── StaffReportsPage.tsx        # Analytics & AI reports
│   │   ├── StaffAnnouncementsPage.tsx  # Broadcast notices
│   │   ├── StaffGrievancePage.tsx      # Farmer grievance handling
│   │   ├── CentreAdminDashboardPage.tsx# Centre admin overview
│   │   ├── CentreAdminTokensPage.tsx   # Token management
│   │   ├── AdminDashboardPage.tsx      # State-level command dashboard
│   │   ├── AdminCentresPage.tsx        # All APMC centres registry
│   │   ├── AdminPriceManagementPage.tsx# MSP commodity price master
│   │   ├── AdminUserRolesPage.tsx      # User + role management
│   │   └── AdminSystemSettingsPage.tsx # Global system configuration
│   │
│   ├── auth/            # Login / session management pages
│   ├── common/          # Shared UI components
│   └── public/          # Public-facing pages (home, about, etc.)
│
├── services/
│   ├── supabaseClient.ts      # Supabase connection + health check
│   ├── supabaseDataService.ts # Generic DB CRUD helpers
│   ├── staffDataService.ts    # All staff/admin data operations (2062 lines)
│   ├── qrBookingService.ts    # QR generation, hashing, verification
│   ├── farmerAuthService.ts   # Farmer auth & profile
│   ├── mlService.ts           # FastAPI ML client + local inference fallback
│   ├── weatherService.ts      # Open-Meteo weather + GPS
│   └── rbacService.ts         # Role-Based Access Control engine
│
├── translations.ts    # 110KB English/Hindi i18n dictionary
├── router.ts          # Custom SPA router (History API)
├── App.tsx            # Root route resolver
└── main.tsx           # React DOM entry point
```

---

## 14. External APIs Summary

| API | Provider | Cost | Purpose |
|---|---|---|---|
| **Supabase** | Supabase Inc. | Free tier | PostgreSQL DB + Auth + Realtime |
| **Open-Meteo** | Open-Meteo | Free (open-source) | Live weather by GPS coordinates |
| **BigDataCloud Geocoder** | BigDataCloud | Free tier | Reverse geocode GPS → city name |
| **FastAPI ML Server** | Self-hosted (Python) | Local / cloud | AI queue prediction models |

---

## 15. Summary Card

```
Language:       TypeScript (strict)
UI Library:     React 19
Build Tool:     Vite 8
Styling:        Inline React styles + minimal CSS files
Backend:        Supabase (PostgreSQL + Auth)
Offline Mode:   localStorage fallback + Service Worker
QR System:      qrcode + html5-qrcode + SHA-256 (Web Crypto)
AI/ML:          FastAPI (Python) + Scikit-learn Random Forest
Weather:        Open-Meteo REST API + Browser Geolocation
Icons:          Lucide React
i18n:           English + Hindi (custom translation layer)
PWA:            Service Worker + Web App Manifest
Routing:        Custom History API router (no react-router)
RBAC:           4 roles, 30+ permissions, route-level guards
Linting:        oxlint (Rust-based)
Deployment:     GitHub Pages + Vercel
Source Control: Git → github.com/yadav-anupam/Kisan-Setu
```
