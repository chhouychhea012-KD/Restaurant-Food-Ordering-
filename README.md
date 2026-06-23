# Flavor Fleet Frontend MVP

A frontend-only MVP for a restaurant and food ordering platform built with Vue 3, Vite, TypeScript, TailwindCSS, Pinia, and Vue Router.

## Included workflows

- Customer browsing, restaurant details, cart, checkout, order tracking, dashboard, profile, addresses, order history, notifications
- Auth with login, register, logout, route guards, session expiry validation, role-aware redirects
- Platform admin overview, restaurants, orders, users/roles, analytics
- Restaurant owner overview, menu management, restaurant-scoped orders
- Kitchen queue for preparation and ready-for-pickup actions
- Rider home, availability toggle, delivery progress actions, profile
- Local JSON seed data persisted to `localStorage` for a frontend-only MVP

## Stack

- Vue 3
- Vite
- TypeScript
- TailwindCSS
- Pinia
- Vue Router
- Axios

## Run locally

```bash
cd food-platform-frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Demo accounts

- Admin: `admin@flavorfleet.app` / `Admin@123`
- Owner: `owner@flavorfleet.app` / `Owner@123`
- Kitchen: `kitchen@flavorfleet.app` / `Kitchen@123`
- Rider: `rider@flavorfleet.app` / `Rider@123`
- Customer: `customer@flavorfleet.app` / `Customer@123`

## Notes

- The project is frontend-only. Backend APIs, database, uploads, and real Socket.IO are represented through typed mock services and seeded JSON.
- Seed data lives under `src/assets/data` and is copied into `localStorage` on first boot so UI actions can persist across refreshes.
- The workspace folder contains `&`, so the package scripts call Vite and Vue TSC through explicit `node` paths for Windows compatibility.
