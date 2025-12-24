# Deployment Guide - Competitor Analysis Dashboard

## Quick Overview

| Component | Platform | Status |
|-----------|----------|--------|
| Dashboard | Vercel | 🔄 To deploy |
| Database | Supabase | 🔄 Schema pending |
| n8n | Self-hosted | ✅ Instance ready |

---

## Step 1: Supabase Database Setup

### 1.1 Create Tables
1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy and run the schema from `supabase/migrations/001_initial_schema.sql`

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/001_initial_schema.sql
```

### 1.2 Verify Tables Created
After running, check **Table Editor** for these tables:
- `projects`
- `competitors`
- `competitor_metrics`
- `swot_analysis`
- `insights`

### 1.3 Get Service Role Key
1. Go to **Settings** → **API**
2. Copy **service_role** key (for n8n webhook)
3. Keep **anon** key for frontend

---

## Step 2: Deploy to Vercel

### 2.1 Push to GitHub
```bash
cd /home/backbuntu/Documents/G-MOULDTECH/dashboard-competitor
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2.2 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)

### 2.3 Set Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://otttcmuulnjfqzcgjrzw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `N8N_WEBHOOK_SECRET` | Generate a strong secret |

### 2.4 Deploy
Click **Deploy** - Vercel will build and deploy automatically.

---

## Step 3: n8n Workflow Setup

### 3.1 Create Webhook Trigger
1. In n8n, create new workflow
2. Add **Webhook** node:
   - Method: `POST`
   - Path: `/competitor-ingest`
   - Response: `Respond immediately`

### 3.2 Process Scraped Data
Add **Code** node to transform data:
```javascript
// Transform scraped data to API format
const items = $input.all();
const competitors = items.map(item => ({
  place_id: item.json.place_id,
  name: item.json.name,
  rating: parseFloat(item.json.rating) || 0,
  reviews: parseInt(item.json.reviews) || 0,
  main_category: item.json.main_category,
  website: item.json.website || null,
  address: item.json.address,
  // Add calculated metrics
  reputation_score: (item.json.rating / 5 * 0.6) + (Math.min(item.json.reviews / 100, 1) * 0.4),
  digital_readiness_score: item.json.website ? 0.6 : 0,
  competition_level: item.json.reviews >= 50 ? 'High' : item.json.reviews >= 10 ? 'Medium' : 'Low',
  risk_flag: item.json.rating < 3 || item.json.reviews === 0
}));

return [{ json: { project_id: 'YOUR_PROJECT_UUID', competitors } }];
```

### 3.3 Send to Dashboard API
Add **HTTP Request** node:
- Method: `POST`
- URL: `https://YOUR_VERCEL_URL.vercel.app/api/v1/ingest`
- Headers:
  - `Content-Type`: `application/json`
  - `x-webhook-secret`: `YOUR_N8N_WEBHOOK_SECRET`

---

## Step 4: Import Existing Data to Supabase

### Option A: Via n8n
Create a one-time workflow to read `scraped_data.json` and POST to `/api/v1/ingest`

### Option B: Direct SQL Insert
```sql
-- In Supabase SQL Editor
INSERT INTO projects (id, name, user_id) VALUES
  ('PROJECT_UUID', 'Injection Moulding Market', 'YOUR_USER_ID');

-- Then use bulk insert for competitors
```

---

## Step 5: Verify Deployment

### Checklist
- [ ] Dashboard loads at Vercel URL
- [ ] API returns data at `/api/v1/dashboard`
- [ ] n8n webhook responds
- [ ] New data appears in dashboard after n8n trigger

---

## Environment Variables Summary

```env
# .env.local (local) or Vercel Dashboard (production)
NEXT_PUBLIC_SUPABASE_URL=https://otttcmuulnjfqzcgjrzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_SECRET=your_strong_secret_here
```

---

## Current Status

The dashboard currently loads data from `docs/scraped_data.json` for demo. After Supabase setup, switch API routes to use Supabase queries.

**Files to update for Supabase:**
- `src/app/api/v1/dashboard/route.ts`
- `src/app/api/v1/competitors/route.ts`
- `src/app/api/v1/competitors/[id]/route.ts`
