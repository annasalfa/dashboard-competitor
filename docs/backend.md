# Backend Development Plan

This document outlines the detailed plan for the backend API of the Competitor Analysis Dashboard, built with Next.js and Supabase.

## 1. Architectural Philosophy

*   **Pattern:** **Thin Backend / Backend-for-Frontend (BFF)**
*   **Core Principle:** The backend's sole responsibility is to provide secure data access for the frontend and a simple ingestion point for the n8n pipeline. As per the PRD, **all business logic, scoring, and data enrichment resides exclusively within n8n**.

## 2. Core Technologies

*   **Runtime:** **Node.js**
*   **Framework:** **Next.js API Routes** - The backend will be co-located with the frontend as a set of serverless functions, simplifying development and deployment.
*   **Language:** **TypeScript** - To ensure type safety for API request/response payloads and database interactions.
*   **Authentication:** **Supabase Auth** - Leverages the managed Supabase service for user sign-up, login, and session management. JWTs provided by Supabase will be used to authenticate API requests.

## 3. Architecture & Project Structure

The backend will live within the Next.js project structure, primarily in the `app/api/` directory.

```
app/
|-- api/
|   |-- v1/
|   |   |-- ingest/          # POST endpoint for the n8n webhook
|   |   |-- dashboard/       # GET endpoint for dashboard data
|   |   `-- competitors/
|   |       `-- [id]/        # GET endpoint for specific competitor data
|   `-- auth/
|       `-- [...nextauth]/   # Handlers for Supabase Auth integration (if using NextAuth.js)
lib/
|-- supabase/
|   |-- client.ts            # Supabase client instances (client-side, server-side)
|   `-- queries.ts           # Server-side functions for database queries
...
```

## 4. Key Features & Responsibilities

*   **Data Access & Isolation:**
    *   **Responsibility:** Expose read-only endpoints for the frontend to fetch data.
    *   **Security:** All database queries will be executed in a secure, server-side context, leveraging Supabase's Row Level Security (RLS) to enforce data isolation per user/project. The user's JWT will provide the necessary identity for RLS policies.

*   **Authentication:**
    *   **Responsibility:** Secure API routes and provide user session management.
    *   **Mechanism:** Middleware in Next.js will verify the JWT from Supabase Auth on protected routes. The frontend will interact directly with Supabase Auth for login/logout actions.

*   **Ingestion Webhook (`POST /api/v1/ingest`)**
    *   **Purpose:** A simple, secure endpoint for n8n to send processed data.
    *   **Security:** The endpoint will be secured with a secret API key.
    *   **Processing:** The route handler will do nothing more than receive the data and `UPSERT` it into the appropriate Supabase tables. No validation or transformation logic will exist here.

## 5. Dependency Management

*   **Tool:** **NPM** or **Yarn** or **PNPM**. Project dependencies will be managed via `package.json`.

## 6. Testing Strategy

*   **Framework:** **Jest** or **Vitest** for unit testing API route handlers.
*   **Mocking:** The Supabase client and other external services will be mocked to test the API logic in isolation.
*   **Integration Tests:** End-to-end tests using Playwright (as defined in the frontend plan) will cover the integration between the frontend, the API routes, and the Supabase backend.
