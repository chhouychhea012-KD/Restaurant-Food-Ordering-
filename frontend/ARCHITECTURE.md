# Architecture

## Topology

This repository is a frontend-first Vue 3 SPA for a multi-role restaurant and food ordering platform. It is currently organized around these route areas:

- `/` public customer storefront
- `/auth/*` authentication
- `/customer/*` protected customer account namespace
- `/admin/*` platform administration
- `/partner/*` restaurant owner workspace
- `/kitchen/*` kitchen operations
- `/rider/*` rider operations
- `/forbidden` permission denied
- `/not-found` missing route

Legacy aliases such as `/dashboard` and `/restaurant` remain in place so the current app keeps working while the route model is aligned to the AGENTS specification.

## Application Layers

The app is intentionally split into a few layers so the mock backend can later be replaced with real APIs without rewriting pages.

- `src/pages` contains route-level screens.
- `src/layouts` contains role-aware shells.
- `src/components` contains reusable UI pieces and feature components.
- `src/stores` orchestrates page state with Pinia.
- `src/services` contains contracts, mock adapters, realtime helpers, and the HTTP client boundary.
- `src/mocks` contains database bootstrap and reset behavior.
- `src/utils` contains storage, formatting, and small cross-cutting helpers.

## State and Service Boundaries

Pages should not talk directly to local JSON files. They should flow through:

1. page
2. store or composable
3. service contract or mock service
4. mock database helpers

This keeps the UI layer stable even when the data source changes.

## Authorization Approach

The current implementation uses:

- session persistence in local storage
- role-aware route guards
- permission metadata on routes

Milestone 1 will deepen this into explicit permission-key evaluation plus time-window access control. The route structure and guard hook added in Milestone 0 are prepared for that expansion.

## Mock Backend Design

The mock runtime is seeded from local JSON and persisted into `localStorage`. Bootstrapping and reset helpers live behind a mock runtime module so we can:

- seed data on first load
- clear and reseed demo state
- expose deterministic test setup
- centralize latency and mock-mode helpers later

## Realtime Design

Realtime behavior is simulated with an in-memory event bus. Features such as activity logs and order updates can subscribe and unsubscribe through a typed helper instead of wiring browser events directly in every component.

## Future Backend Notes

The project is still a frontend-first demo. The cleanest backend migration path is:

1. keep existing store and page APIs stable
2. replace implementations in `src/services/mock`
3. swap the HTTP client or realtime transport under `src/services/http` and `src/services/realtime`
4. keep domain types and route permissions unchanged where possible
