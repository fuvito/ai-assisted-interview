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
