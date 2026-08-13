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

### Trips Page

The `/trips` route is the operational load-review screen. It requires `captures.view` to open and shows the `loaded`, `empty`, and `needs_review` actions only when the effective permissions include `trips.manage`.

Private media is fetched through the API with the Bearer token and rendered as temporary Object URLs. Tokens are never appended to media URLs.
