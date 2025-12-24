# TECH STACK SPECIFICATION (SINGLE CODE EDITOR VERSION)
# Competitor Analysis Dashboard

---

## 1. DESIGN PRINCIPLES

- MVP-first, cepat dibangun
- Semua logic & scoring ada di n8n
- Backend tipis (data access only)
- Frontend fokus visualisasi & insight
- Scalable ke AI & automation

---

## 2. OVERALL ARCHITECTURE

Scraper → n8n (ETL + Scoring) → Database → Backend API → Frontend Dashboard

---

## 3. FRONTEND

### Framework
- Next.js (App Router)

### Styling & UI
- Tailwind CSS
- shadcn/ui (optional, recommended)

### Data Fetching
- Fetch API / Axios
- TanStack Query (React Query)

### Visualization
- Recharts
- Chart.js (optional)

### Frontend Responsibilities
- Render dashboard & charts
- Filtering & comparison UI
- Read-only analytics
- No business logic
- No data transformation

---

## 4. BACKEND

### Pattern
- Thin Backend / Backend for Frontend (BFF)

### Runtime
- Node.js + TypeScript

### Framework
- Next.js API Routes (MVP)
- Express / Fastify (scale later)

### Authentication
- Supabase Auth

### Backend Responsibilities
- Auth & authorization
- Data access & pagination
- Project-based data isolation
- No scoring
- No enrichment

---

## 5. DATABASE

### Database Engine
- PostgreSQL (Supabase)

### Database Responsibilities
- Store final & derived data
- Source of truth
- Enforce Row Level Security
- No raw scraping data

---

## 6. DATABASE SCHEMA (SUMMARY)

### competitors
id (uuid)  
place_id (text)  
name (text)  
main_category (text)  
categories (text[])  
rating (numeric)  
reviews (int)  
website (text)  
address (text)  
is_spending_on_ads (boolean)  
operational_status (text)  
market_query (text)  
last_updated (timestamp)

### competitor_metrics
competitor_id (uuid)  
reputation_score (numeric)  
digital_readiness_score (numeric)  
competition_level (text)  
risk_flag (boolean)

### swot_analysis
competitor_id (uuid)  
strength (text[])  
weakness (text[])  
opportunity (text[])  
threat (text[])

---

## 7. DATA PIPELINE (n8n)

- Webhook / Cron Trigger
- Data cleaning
- Normalization
- Enrichment
- Scoring
- Upsert ke Supabase

n8n adalah satu-satunya tempat business logic & scoring

---

## 8. DEPLOYMENT

Frontend
- Vercel

Backend
- Vercel (API Routes)
- Railway / Fly.io (optional)

Database & Auth
- Supabase

n8n
- Self-hosted (Docker)
- VPS / Railway

---

## 9. SECURITY

- Supabase Row Level Security
- API key n8n → backend
- Read-only dashboard data
- Project-based isolation

---

## 10. FUTURE EXTENSION

Phase 2
- AI summary & auto SWOT
- Change detection
- Geo-based market map

Phase 3
- Team collaboration
- Reporting & export
- Advanced scoring engine

---

## 11. FINAL STACK SUMMARY

Frontend
- Next.js
- Tailwind CSS
- Recharts

Backend
- Node.js (Next API / Express)

Database
- PostgreSQL (Supabase)

Pipeline
- n8n

Auth
- Supabase Auth

Deploy
- Vercel + Supabase + Docker

---

STATUS: STACK FINALIZED  
READY FOR: IMPLEMENTATION
