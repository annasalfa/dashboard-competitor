# Competitor Analysis Dashboard

A read-only analytics dashboard for competitor research in the plastic injection/moulding market.

This project transforms scraped competitor data into actionable insights using this pipeline:

**Scraper → n8n (cleaning/scoring) → Supabase (PostgreSQL) → Next.js Dashboard**

---

## Demo

- https://dashboard-competitor.vercel.app/dashboard

---

## What this project does

- Displays market snapshot metrics (total competitors, average rating, risk indicators)
- Lists competitors with search, filter, and pagination
- Shows competitor detail pages with derived SWOT + metrics
- Supports side-by-side competitor comparison
- Provides a secure ingestion endpoint for n8n (`POST /api/v1/ingest`)
- Enforces project-level data isolation with Supabase Row Level Security (RLS)

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui, Radix UI
- **Data Fetching:** TanStack Query
- **Charts:** Recharts
- **State:** Zustand (UI state)
- **Backend:** Next.js Route Handlers (`/api/v1/*`)
- **Database/Auth:** Supabase (PostgreSQL + RLS + Auth)

---

## Features

### Dashboard
- KPI cards
- Rating distribution chart
- Competition level chart
- Top categories chart

### Competitors
- Searchable list
- Category filtering
- Pagination
- Detail page per competitor

### Analysis
- SWOT analysis view
- Comparison view (up to 4 competitors)
- Insight/notes page

### Data Ingestion
- Webhook endpoint for n8n
- Upsert competitors, derived metrics, and SWOT records

---

## API Endpoints

- `GET /api/v1/dashboard`  
  Returns aggregated market stats for charts and KPI cards.

- `GET /api/v1/competitors?page=1&limit=20&search=&category=`  
  Returns paginated competitors with optional search/category filters.

- `GET /api/v1/competitors/[id]`  
  Returns a single competitor with related metrics and SWOT.

- `POST /api/v1/ingest`  
  Secure endpoint used by n8n to ingest processed data.

### Ingest security

`POST /api/v1/ingest` requires header:

- `x-webhook-secret: <N8N_WEBHOOK_SECRET>`

---

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
N8N_WEBHOOK_SECRET=your_strong_webhook_secret
```

### 3) Setup database schema

Run SQL migration from:

- `supabase/migrations/001_initial_schema.sql`

It creates:

- `projects`
- `competitors`
- `competitor_metrics`
- `swot_analysis`
- `insights`

and enables RLS policies.

### 4) Start development server

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Ingest Payload Example

```json
{
  "project_id": "uuid",
  "competitors": [
    {
      "place_id": "string",
      "name": "string",
      "main_category": "string",
      "categories": ["string"],
      "rating": 4.6,
      "reviews": 128,
      "website": "https://example.com",
      "address": "string",
      "is_spending_on_ads": false,
      "operational_status": "open",
      "market_query": "plastic injection molding jakarta",

      "reputation_score": 0.82,
      "digital_readiness_score": 0.75,
      "competition_level": "Low",
      "risk_flag": false,

      "swot": {
        "strength": ["High rating"],
        "weakness": ["No website"],
        "opportunity": ["Low competitor density"],
        "threat": ["Strong nearby competitor"]
      }
    }
  ]
}
```

---

## Scripts

```bash
npm run dev     # start local development
npm run build   # production build
npm run start   # run production server
npm run lint    # run ESLint
```

---

## Project Structure

```text
src/
  app/
    (dashboard)/
      dashboard/page.tsx
      competitors/page.tsx
      competitors/[id]/page.tsx
      compare/page.tsx
      swot/page.tsx
      insights/page.tsx
    api/v1/
      dashboard/route.ts
      competitors/route.ts
      competitors/[id]/route.ts
      ingest/route.ts
  components/
    layout/
    ui/
    providers/
  lib/
    supabase/
    utils.ts
supabase/
  migrations/
docs/
  PRD.md
  AGENT.md
  DEPLOYMENT.md
  SESSION_PROGRESS.md
```

---

## Deployment

See deployment details in:

- `docs/DEPLOYMENT.md`

Typical deployment setup:

- **Vercel** for Next.js app
- **Supabase** for DB/Auth
- **Self-hosted n8n** for ETL and scoring

---

## Notes

- The dashboard is designed as a **read-only** analysis surface.
- Business logic/scoring should be centralized in **n8n**.
- Some API routes include normalization safeguards for inconsistent source values (e.g., rating format).