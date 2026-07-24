# Golden Land Restaurant Frontend

Golden Land Restaurant is a full-stack-ready restaurant and food ordering frontend built with Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, and Vue Router. It supports both mock/local data mode and real backend API mode for customer browsing and ordering, admin operations, restaurant-owner tools, kitchen updates, rider delivery progress, vouchers, notifications, and live workflow refreshes.

The repository is being aligned to the AGENTS milestone plan. Milestones 0 and 1 are implemented and verified, Milestone 2 now has a substantial restaurant, branch, and menu workflow layer, and Milestone 3 has a stronger customer ordering flow with branch-aware carts, checkout revalidation, vouchers, and loyalty redemption.

## Core Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS
- Pinia
- Vue Router
- Axios API client boundary with mock and server modes
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
- Server-Sent Events realtime bridge for order and notification refreshes in backend API mode

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

- Use mock mode for fast local UI testing, or `VITE_API_MODE=server` to connect to the Node/Express backend.
- Backend API mode includes JWT auth, MySQL-backed data, voucher CRUD, order workflows, notifications, and realtime order/notification refreshes through SSE.
- Keep `dist/` out of version control.

