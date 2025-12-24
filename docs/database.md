# Database Plan

This document describes the database architecture, data models, and management strategy for the Competitor Analysis Dashboard, hosted on Supabase.

## 1. Core Technologies

*   **Database Platform:** **Supabase**
    *   **Engine:** **PostgreSQL (v15+)**.
    *   **Reasoning:** Chosen as a Backend-as-a-Service (BaaS) platform to accelerate development. It provides a managed PostgreSQL database, authentication, and auto-generated APIs, which aligns with our goal of a thin backend.

*   **Schema Migrations:** **Supabase Migrations**
    *   **Role:** Schema changes will be managed using Supabase's built-in migration tools. This can be done via the Supabase CLI or directly in the Supabase Studio dashboard.
    *   **Workflow:**
        1.  Make schema changes locally using the CLI or in the dashboard for prototyping.
        2.  Run `supabase db diff` to create a new migration script.
        3.  Apply migrations to the linked Supabase project.

## 2. Data Modeling

The database schema is designed to be the single source of truth, storing the final, normalized data processed by n8n. It is composed of three primary tables as defined in the PRD.

### `competitors` Table
Stores the core information about each competitor.
```sql
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    place_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    main_category TEXT,
    categories TEXT[],
    rating NUMERIC(2, 1),
    reviews INT,
    website TEXT,
    address TEXT,
    is_spending_on_ads BOOLEAN DEFAULT FALSE,
    operational_status TEXT,
    market_query TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);
```

### `competitor_metrics` Table
Stores derived scores calculated by the n8n pipeline. Linked one-to-one with the `competitors` table.
```sql
CREATE TABLE competitor_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID UNIQUE REFERENCES competitors(id) ON DELETE CASCADE,
    reputation_score NUMERIC,
    digital_readiness_score NUMERIC,
    competition_level TEXT,
    risk_flag BOOLEAN
);
```

### `swot_analysis` Table
Stores the derived SWOT analysis points from n8n. Linked one-to-one with the `competitors` table.
```sql
CREATE TABLE swot_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID UNIQUE REFERENCES competitors(id) ON DELETE CASCADE,
    strength TEXT[],
    weakness TEXT[],
    opportunity TEXT[],
    threat TEXT[]
);
```
*Note: A `projects` table is included to facilitate multi-tenancy and data isolation.*

## 3. Security & Data Isolation

*   **Mechanism:** **Supabase Row Level Security (RLS)**
    *   **Strategy:** RLS policies will be enforced on all tables to ensure that users can only access data belonging to their own project (`project_id`).
    *   **Benefit:** This moves security enforcement directly into the database layer, preventing data leaks even if the API layer has a bug. It is a robust solution for the "Data isolation per user / project" requirement from the PRD.

## 4. Database Access

*   **Primary Access:** The **Next.js backend** will use the `@supabase/supabase-js` client library to interact with the database for authorized data retrieval.
*   **Ingestion:** The **n8n pipeline** will use the same client library or a direct database connection with a secure role to `UPSERT` data into the tables.
