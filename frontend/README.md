# Credisense Frontend — Explainable AI Lending Assistant

Credisense is an explainable AI lending assistant tailored for Indian borrowers. It provides instant, deterministic multi-lender loan eligibility, plain-language rejection reasons with actionable steps, RBI-mandated Key Fact Statements (KFS), document OCR verification, and an e-sign / auto-debit disbursal pipeline.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom frosted-glass, crimson primary `#C8102E`, soft neutrals)
- **Icons**: Lucide React
- **Animations**: Framer Motion, Canvas Confetti
- **Routing**: React Router v6

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```

---

## Standalone Demo Accounts

The app operates completely standalone with simulated network delays (600–1200ms) and mock sessions stored in `localStorage`. You can log in using any of the pre-configured personas or register a new user:

| Persona | Email | Monthly Income | Scenario |
|---|---|---|---|
| **Aman Sharma** | `aman@example.com` | ₹10,000 | Declined (68% FOIR > 45% ceiling) with explainability & alternatives |
| **Priya Patel** | `priya@example.com` | ₹40,000 | Pre-approved by 2 lenders (Prime Capital, Bharat Credit) |
| **Ravi Verma** | `ravi@example.com` | ₹25,000 | Borderline, approved by Lender B with longer tenure |
| **Demo User** | `demo@credisense.ai` | ₹50,000 | Instant prime offers |

*Default password for all demo accounts*: `password123`

---

## Backend Integration Guide

**All data access and authentication are strictly isolated into exactly two files.** To transition from standalone demo mode to the real backend, replace only these two files:

### 1. `src/lib/auth.ts` -> Supabase Auth
- Replace mock `signUp`, `signIn`, `signOut`, `getCurrentUser`, and `resetPassword` with calls to `@supabase/supabase-js`.
- Each function in `src/lib/auth.ts` has clear comments indicating the exact Supabase method to insert.
- Components communicate purely through the `useAuth()` hook.

### 2. `src/lib/api.ts` -> FastAPI Backend
- Replace mock functions with standard HTTP `fetch` or `axios` calls pointing to your FastAPI endpoints:
  - `POST /api/v1/eligibility/evaluate` -> Multi-lender rules engine
  - `POST /api/v1/applications` -> Create loan application
  - `GET /api/v1/applications/:id` -> Retrieve application & KFS
  - `POST /api/v1/applications/:id/consent` -> Submit digital KFS consent
  - `POST /api/v1/applications/:id/documents/:docId` -> OCR document upload
  - `POST /api/v1/applications/:id/sign-otp` -> Aadhaar OTP e-Sign
  - `POST /api/v1/applications/:id/e-mandate` -> NPCI e-NACH mandate
  - `POST /api/v1/applications/:id/disburse` -> Instant IMPS disbursal
- All calculations (`calculateEmi`, `calculateFoir`, `generateRepaymentSchedule`) are deterministic and auditable.
