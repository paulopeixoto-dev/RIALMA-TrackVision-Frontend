# RIALMA TrackVision Frontend

Vue 3 administrative frontend for TrackVision.

## Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Vitest
- Playwright

## Environment

Copy `.env.example` to `.env.local` and point the frontend to the Laravel API:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Do not put secrets in frontend environment variables.

## Local Commands

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

## Current Scope

This phase includes login, authenticated admin layout, permission-aware navigation,
read-only users/roles/permissions, and CRUD screens for vehicles, locations, edge
nodes, cameras, and camera pairs.

Users, roles, and permissions are read-only because the backend currently exposes
only list endpoints for these resources.

### Pagina de Viagens

A rota `/trips` e a tela operacional de revisao de carga. Ela exige `captures.view` para abrir e exibe as acoes `loaded`, `empty` e `needs_review` apenas quando as permissoes efetivas incluem `trips.manage`.

Midias privadas sao buscadas pela API com o token Bearer e renderizadas como `Object URL` temporaria. Tokens nunca sao adicionados a URLs de midia.

### Trip Reports And Audit Timeline

The `/trips` screen shows CSV/PDF export buttons when the user has `reports.view`.

Report downloads use the current filters and send the Bearer token through the Authorization header. Tokens are never appended to report URLs.

Trip event details show the load-status audit timeline returned by the backend.
