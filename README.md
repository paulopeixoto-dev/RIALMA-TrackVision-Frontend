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

### Relatorios de Viagens e Linha do Tempo de Auditoria

A tela `/trips` mostra botoes de exportacao CSV/PDF quando o usuario possui `reports.view`.

Os downloads de relatorio usam os filtros atuais e enviam o token Bearer pelo cabecalho Authorization. Tokens nunca sao adicionados a URLs de relatorio.

Os detalhes do evento de viagem mostram a linha do tempo de auditoria do status de carga retornada pelo backend.
