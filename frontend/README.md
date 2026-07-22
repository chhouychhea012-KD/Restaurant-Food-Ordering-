# Flavor Fleet Frontend

Flavor Fleet is a frontend-first restaurant and food ordering platform built with Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, and Vue Router. It currently ships a working multi-role demo for customer browsing and ordering, admin operations, restaurant-owner tools, kitchen updates, and rider delivery progress.

The repository is being aligned to the AGENTS milestone plan. Milestones 0 and 1 are implemented and verified, Milestone 2 now has a substantial restaurant, branch, and menu workflow layer, and Milestone 3 has a stronger customer ordering flow with branch-aware carts, checkout revalidation, vouchers, and loyalty redemption.

## Core Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS
- Pinia
- Vue Router
- Axios mock client boundary
- Vitest
- Playwright
- ESLint
- Prettier

## Route Areas

- `/` public storefront
- `/auth/*` authentication
- `/customer/*` customer account workspace
- `/admin/*` admin dashboard
- `/partner/*` restaurant owner workspace
- `/kitchen/*` kitchen workspace
- `/rider/*` rider workspace
- `/forbidden`
- `/not-found`

Legacy aliases such as `/dashboard` and `/restaurant` are still available while the app is migrated to the final route topology.

## Demo Accounts

- Admin: `admin@flavorfleet.app` / `Admin@123`
- Owner: `owner@flavorfleet.app` / `Owner@123`
- Kitchen: `kitchen@flavorfleet.app` / `Kitchen@123`
- Rider: `rider@flavorfleet.app` / `Rider@123`
- Customer: `customer@flavorfleet.app` / `Customer@123`

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run test:e2e
npm run build
npm run preview
```

## Mock Data and Reset

The app seeds data from `src/assets/data` into `localStorage` on first load.

Development reset options:

- Clear site storage in the browser
- Run this in the browser console during development:

```js
await window.__flavorFleet?.resetMockData()
```

## Current Working Experiences

- Customer discovery, restaurant details, cart, checkout, tracking, profile, addresses, order history, and notifications
- Auth with session persistence, role-aware redirects, route guards, permission-aware navigation, and time-window access handling
- Admin overview, users, roles, restaurants, products, categories, orders, notifications, analytics, and activity log
- Restaurant partner overview with richer branch data, partner standing, operating hours summaries, and scoped menu/category/item management
- Kitchen queue with preparation and ready-state transitions
- Rider availability, active deliveries, delivery progress updates, and rider profile
- Activity logging for order, dispatch, refund, role, user, access-window, restaurant, and menu actions

## Milestone Status

- Milestone 0: complete and verified
- Milestone 1: complete and verified
- Milestone 2: partially implemented with working restaurant, branch, verification, suspension, and menu CRUD flows
- Milestones 3-8: still in progress and not yet fully aligned to the AGENTS acceptance checklist

## Architecture Docs

- [`AGENTS.md`](./AGENTS.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`KNOWN_LIMITATIONS.md`](./KNOWN_LIMITATIONS.md)

## Testing Notes

- Unit tests use Vitest with `jsdom`.
- E2E tests use Playwright and currently cover route-shell validation.
- If Playwright browsers are not installed yet, run:

```bash
npx playwright install chromium
```

## Build Notes

- This is still a frontend-only demo. Backend APIs, realtime channels, payments, and delivery telemetry are simulated through typed mock services and seeded data.
- Keep `dist/` out of version control.

