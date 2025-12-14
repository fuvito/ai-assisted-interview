# AI Assisted Interview (Monorepo)

This repository is a plain **npm workspaces** monorepo (no Nx).

## Projects

- `shared/`
  - Shared TypeScript models used by all apps.
- `server/`
  - Node.js + Express + TypeScript API.
- `client-ui/`
  - Vite + React + TypeScript (end-user UI).
- `admin-ui/`
  - Vite + React + TypeScript (admin UI).

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+ (recommended: 10+)

> Run commands from **Command Prompt (cmd.exe)**.

## Install

From the repo root:

```bat
npm install
```

## Configure environment variables

This repo expects a hosted Supabase project (or local Supabase) and environment variables for each workspace.

### 1) Supabase database setup

Run these SQL scripts in the Supabase SQL editor (in this order):

- `documents/supabase_schema.sql`
- `documents/supabase_security.sql`
- `documents/supabase_seed.sql`

### 2) `server/.env`

Create `server/.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Optional: enable AI grading via Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash-lite

# Optional
PORT=3001
```

Notes:

- The server should use `SUPABASE_SERVICE_ROLE_KEY` so it can access tables protected by RLS.
- Do **not** put the service role key in the UIs.

### 3) `client-ui/.env`

Create `client-ui/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# API base for local dev
VITE_API_BASE_URL=http://localhost:3001
```

### 4) `admin-ui/.env`

Create `admin-ui/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# API base for local dev
VITE_API_BASE_URL=http://localhost:3001
```

### 5) Create an admin user

1. Create a user in Supabase Auth (Dashboard -> Authentication -> Users).
2. Add the user to the admin allowlist:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

Then you can log into the admin UI with that email/password.

## Run (development)

This opens 4 Command Prompt windows (shared/server/client/admin):

```bat
npm run dev
```

Or run individually:

```bat
npm run dev:shared
npm run dev:server
npm run dev:client
npm run dev:admin
```

Defaults:

- Server: `http://localhost:3001`
- Client UI: `http://localhost:5173` (Vite default)
- Admin UI: Vite will pick the next available port (commonly `5174`)

## Build

Build all workspaces:

```bat
npm run build
```

## Quick checks

Server endpoints (default port `3001`):

```bat
curl http://localhost:3001/health
curl http://localhost:3001/example
```

Verify workspace linking:

```bat
npm ls -w server @app/shared
npm ls -w client-ui @app/shared
npm ls -w admin-ui @app/shared
```
