# AGENTS.md — Restaurant Food Ordering Platform

## 1. Document Purpose

This file is the primary implementation instruction for an AI coding agent working on the **Restaurant Food Ordering Platform** frontend.

The agent must use this document as the source of truth for:

- project scope
- product standards
- user roles and permissions
- frontend architecture
- route structure
- domain models
- business workflows
- service contracts
- mock API behavior
- realtime simulation
- testing requirements
- milestone delivery
- acceptance criteria

This project is a **frontend-first multi-role platform** for restaurant ordering, kitchen operations, delivery rider flow, and platform administration.

The application must be fully demonstrable without a production backend by using:

- typed service contracts
- realistic mock APIs
- seeded local data
- simulated delays
- simulated failures
- simulated realtime events

The final system must feel like a complete working product rather than a collection of static pages.

---

## 2. Product Mission

Build a production-quality, responsive application that supports these operational experiences:

1. **Customer Application**
   - browse restaurants
   - search food
   - view menus
   - build a cart
   - customize items
   - checkout
   - track orders
   - manage addresses
   - use promotions
   - redeem loyalty points

2. **Restaurant Partner Workspace**
   - manage restaurant profile
   - manage branches
   - manage menus
   - manage availability
   - manage branch pricing
   - view orders
   - review basic analytics

3. **Kitchen Workspace**
   - accept or reject orders
   - estimate preparation time
   - move orders through queue states
   - view item details and customer notes
   - monitor operational SLA

4. **Rider Workspace**
   - manage availability
   - receive delivery offers
   - accept or decline jobs
   - update pickup and delivery states
   - view delivery history
   - review earnings

5. **Admin Dashboard**
   - manage roles and permissions
   - manage users
   - manage restaurants and branches
   - manage riders and customers
   - manage zones and fees
   - manage promotions and loyalty
   - inspect logs
   - inspect analytics and reports

---

## 3. Required Technology Stack

Use the following stack unless the existing project already contains an equivalent approved setup:

- **Vue 3**
- **TypeScript** with strict mode
- **Vite**
- **Tailwind CSS**
- **Vue Router**
- **Pinia**
- **Vitest**
- **Vue Test Utils**
- **Playwright**
- **ESLint**
- **Prettier**

Preferred implementation rules:

- use Composition API
- use `<script setup>`
- use typed service contracts in `src/services`
- keep pages independent from raw mock JSON
- route all business operations through services and stores
- make mock implementations replaceable by real APIs later

---

## 4. Core Product Rules

The following rules are mandatory:

1. A customer cart may contain items from **one restaurant branch only**.
2. Adding an item from another branch must show a confirmation dialog and clear the current cart only after user confirmation.
3. Restaurant menus may contain categories, items, modifier groups, modifier choices, images, dietary tags, and branch-specific availability.
4. Kitchen staff must accept or reject new orders and provide a preparation-time estimate when accepting.
5. Order status changes must follow a single shared state machine.
6. Invalid order transitions must be blocked in both UI and services.
7. Rider assignment must use a mock scoring model based on proximity, status, workload, and recent behavior.
8. Delivery fees must be derived from zone rules, distance tiers, surge rules, and promotional adjustments.
9. Sensitive operational changes must create activity logs.
10. Activity log timestamps must include millisecond precision.
11. Permission checks must use permission keys, not hardcoded role-name checks in components.
12. Admin users must always default to the admin dashboard after login.
13. The UI must support loading, empty, success, error, offline, and permission-denied states.
14. The interface must remain responsive from mobile to desktop.
15. All modules listed in this document are in scope.

---

## 5. Scope

### 5.1 In Scope

- authentication UI
- demo accounts and mock sessions
- role-aware routing
- permission-aware navigation
- time-window access control
- activity logging
- restaurant management
- branch management
- menu management
- customer ordering
- cart and checkout
- kitchen queue
- rider dispatch
- delivery zones
- fee calculation UI
- customer management
- promotions
- loyalty points
- analytics
- reports
- mock API layer
- realtime simulation
- unit tests
- end-to-end tests
- project documentation

### 5.2 Out of Scope

Do not implement real:

- payment gateway processing
- real push, email, or SMS delivery
- physical GPS tracking
- real identity verification
- secure server-issued auth tokens
- permanent database storage
- real settlement and payout logic
- production fraud systems

Instead, implement clean adapters, mock states, and realistic UI flows.

---

## 6. User Roles

### 6.1 Platform Admin

Full platform access across all governance and operational areas.

### 6.2 Operations Manager

Manages dispatch, order exceptions, restaurant state, support actions, and operational reporting.

### 6.3 Restaurant Owner

Manages assigned restaurant organizations and branches.

### 6.4 Branch Manager

Manages branch-level menus, hours, pricing, availability, and orders.

### 6.5 Kitchen Staff

Processes branch kitchen orders and queue transitions.

### 6.6 Delivery Rider

Handles rider availability, offers, active deliveries, and trip progress.

### 6.7 Support Agent

Views customers, orders, dispute context, logs, and approved support actions.

### 6.8 Customer

Browses restaurants, places orders, tracks deliveries, and manages personal account data.

---

## 7. Permission Model

Use explicit permission keys.

Examples:

- `roles.read`
- `roles.create`
- `roles.update`
- `roles.delete`
- `permissions.assign`
- `permissions.revoke`
- `users.read`
- `users.manage`
- `activity_logs.read`
- `activity_logs.export`
- `restaurants.read`
- `restaurants.create`
- `restaurants.update`
- `restaurants.suspend`
- `restaurants.delete`
- `branches.manage`
- `menus.read`
- `menus.manage`
- `menus.availability.update`
- `orders.read`
- `orders.create`
- `orders.accept`
- `orders.reject`
- `orders.status.update`
- `orders.cancel`
- `orders.refund.approve`
- `dispatch.read`
- `dispatch.assign`
- `riders.read`
- `riders.manage`
- `riders.status.update`
- `zones.read`
- `zones.manage`
- `fees.manage`
- `surge.manage`
- `customers.read`
- `customers.manage`
- `customers.blacklist`
- `promotions.read`
- `promotions.manage`
- `loyalty.manage`
- `analytics.read`
- `reports.export`
- `profile.manage`

### 7.1 Time-Sensitive Access

A role assignment may include:

- valid date range
- timezone
- allowed days
- start time
- end time
- temporary expiration
- restaurant scope
- branch scope

The frontend must:

- show active, scheduled, expired, or outside-shift access state
- block protected navigation when access is inactive
- explain why access is blocked
- show the next allowed window if available
- log access-window changes

### 7.2 Route Authorization

Each protected route must declare:

- `requiresAuth`
- `workspace`
- `permissions`

Route guards must validate:

1. authentication
2. account status
3. workspace eligibility
4. active access window where required
5. permission requirements

---

## 8. Route Topology

Use one SPA with these route areas:

- `/` customer storefront
- `/auth/*`
- `/customer/*`
- `/admin/*`
- `/partner/*`
- `/kitchen/*`
- `/rider/*`
- `/forbidden`
- `/not-found`

### 8.1 Layouts

Create:

- `CustomerLayout`
- `CustomerAccountLayout`
- `AdminLayout`
- `PartnerLayout`
- `KitchenLayout`
- `RiderLayout`
- `AuthLayout`
- `BlankLayout`

### 8.2 Layout Standards

Dashboard layouts should support:

- sidebar
- mobile drawer
- top navigation
- breadcrumb
- notification center
- profile menu
- workspace-aware navigation
- branch or restaurant context where relevant

---

## 9. Recommended Project Structure

```text
src/
  app/
  assets/
    icons/
    images/
  components/
    base/
    common/
    customer/
    admin/
    partner/
    kitchen/
    rider/
  composables/
  config/
  constants/
  domain/
  layouts/
  mocks/
    database/
    factories/
    handlers/
    realtime/
    seed/
  pages/
    auth/
    customer/
    admin/
    partner/
    kitchen/
    rider/
    system/
  router/
  services/
    contracts/
    http/
    mock/
    realtime/
  stores/
  styles/
  types/
  utils/
  validators/
  main.ts

tests/
  unit/
  e2e/
  fixtures/
```

---

## 10. UI and UX Standards

### 10.1 Visual Direction

The UI should be:

- modern
- clean
- brandable
- responsive
- operationally clear
- touch friendly where appropriate

Use:

- design tokens
- CSS variables
- consistent spacing
- consistent radius
- accessible contrast

### 10.2 Required States

Every major page should support:

- loading
- empty
- success
- error
- warning
- offline
- permission denied

### 10.3 Reusable Components

Build reusable primitives for:

- buttons
- inputs
- selects
- textareas
- switches
- checkboxes
- radio controls
- badges
- cards
- tables
- modals
- drawers
- dropdowns
- tabs
- breadcrumbs
- pagination
- toasts
- alerts
- skeletons
- empty states
- metric cards
- order timeline

### 10.4 Accessibility

Required:

- semantic HTML
- keyboard-accessible dialogs and menus
- visible focus states
- labels for form controls
- screen-reader-friendly status updates
- reduced-motion support where applicable

---

## 11. Domain Models

Use UUID-like string IDs in mocks.

Store timestamps as ISO 8601 strings.

### 11.1 User

```ts
interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: string
  status: 'active' | 'invited' | 'suspended' | 'disabled'
  roleAssignments: RoleAssignment[]
  createdAt: string
  updatedAt: string
}
```

### 11.2 Role

```ts
interface Role {
  id: string
  name: string
  label: string
  description?: string
  isSystem: boolean
  permissions: string[]
}
```

### 11.3 Restaurant

```ts
interface Restaurant {
  id: string
  name: string
  slug: string
  description: string
  cuisine: string[]
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  partnerStatus: 'pending' | 'verified' | 'rejected' | 'suspended'
  branches: Branch[]
  menuCategories: MenuCategory[]
}
```

### 11.4 Branch

```ts
interface Branch {
  id: string
  restaurantId: string
  name: string
  zone: string
  phone: string
  lat: number
  lng: number
  status: 'open' | 'closed' | 'paused' | 'suspended'
  averagePrepMinutes: number
  minimumOrderAmount: number
  operatingHours: BranchOperatingHour[]
  holidayClosures: HolidayClosure[]
}
```

### 11.5 Menu

```ts
interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
  prepTime: number
  modifiers: string[]
}
```

### 11.6 Cart

```ts
interface CartItem {
  id: string
  menuItemId?: string
  name: string
  quantity: number
  price: number
  modifiers?: string[]
  note?: string
  restaurantId: string
  restaurantName: string
  branchId: string
  branchName: string
  deliveryFee: number
  minimumOrderAmount: number
}
```

### 11.7 Order

```ts
interface Order {
  id: string
  customerId: string
  restaurantId: string
  restaurantName: string
  branchId?: string
  branchName?: string
  status: string
  createdAt: string
  estimatedDeliveryAt: string
  deliveryAddress: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  riderName: string | null
  paymentMethod?: 'cash' | 'card_mock' | 'wallet_mock'
  deliveryInstructions?: string
  voucherCode?: string | null
  loyaltyPointsRedeemed?: number
  timeline: TimelineEntry[]
}
```

### 11.8 Activity Log

```ts
interface ActivityLogEntry {
  id: string
  createdAt: string
  actorUserId: string | null
  actorName: string
  actorRole: string
  restaurantId: string | null
  restaurantName: string | null
  orderId: string | null
  domain: string
  action: string
  title: string
  description: string
  metadata?: Record<string, unknown>
}
```

---

## 12. Customer Experience Requirements

Customer routes should cover:

- home
- restaurant listing
- restaurant detail
- cart
- checkout
- order confirmation or tracking
- profile
- saved addresses
- order history
- loyalty
- promotions
- notifications

### Customer Requirements

- restaurant discovery
- search by item or restaurant
- cuisine filtering
- branch selection
- item customization
- cart persistence
- voucher support
- loyalty redemption
- checkout validation
- order tracking
- reorder support

Checkout must revalidate:

- restaurant status
- branch status
- operating hours
- item availability
- price changes
- modifier validity
- delivery coverage
- minimum order threshold
- voucher eligibility

---

## 13. Admin Dashboard Requirements

Admin routes should include:

- dashboard
- roles
- users
- activity logs
- restaurants
- branches
- orders
- dispatch
- riders
- zones
- customers
- promotions
- loyalty
- analytics
- reports
- settings

Admin experience must support:

- dashboard widgets
- searchable tables
- filters
- row actions
- bulk actions where safe
- detail views
- forms with validation
- auditability

Admin login must always land on `/admin`.

---

## 14. Required Modules

### Module 1 — Role & Permission Management

- role CRUD
- assign permissions
- revoke permissions
- assign roles to users
- configure scope
- configure access windows
- effective permission preview
- audit trail

### Module 2 — Activity Log

- log list
- filter by actor, role, resource, severity, restaurant, order, date
- detail view
- CSV export
- before and after values where relevant

### Module 3 — Restaurant & Branch Management

- restaurant CRUD
- branch CRUD
- verification workflow
- suspension workflow
- operating hours
- holiday closures
- branch state

### Module 4 — Menu & Item Management

- category CRUD
- item CRUD
- modifier groups
- availability toggles
- branch price overrides
- branch availability
- image preview

### Module 5 — Order & Kitchen Management

- order creation
- kitchen queue
- accept/reject
- prep estimate
- order state transitions
- cancellation flow
- refund-related mock state

### Module 6 — Rider & Dispatch Management

- rider profiles
- rider status
- dispatch board
- offer flow
- assignment and reassignment
- rider trip updates
- earnings summary

### Module 7 — Delivery Zones & Fees

- zone CRUD
- distance tiers
- surge rules
- branch coverage
- free-delivery thresholds
- delivery fee preview

### Module 8 — Customer Management

- customer list
- customer detail
- addresses
- blacklist state
- loyalty balance
- order history

### Module 9 — Promotions & Loyalty

- voucher CRUD
- promotion lifecycle
- promotion scope
- first-order rules
- free-delivery promotions
- loyalty earn rules
- loyalty redeem rules
- analytics

### Module 10 — Analytics & Reports

- operational KPIs
- revenue KPIs
- order trends
- rider utilization
- restaurant metrics
- exportable reports

---

## 15. Shared Order State Machine

Use a shared domain utility for status transitions.

Example:

```ts
const allowedTransitions: Record<string, string[]> = {
  pending_payment: ['placed', 'cancelled'],
  placed: ['restaurant_review', 'cancel_requested'],
  restaurant_review: ['accepted', 'rejected', 'cancel_requested'],
  accepted: ['preparing', 'cancel_requested'],
  preparing: ['ready_for_pickup'],
  ready_for_pickup: ['rider_search'],
  rider_search: ['rider_assigned'],
  rider_assigned: ['picked_up'],
  picked_up: ['on_the_way'],
  on_the_way: ['delivered'],
  rejected: ['refund_pending'],
  cancel_requested: ['cancelled'],
  cancelled: ['refund_pending'],
  refund_pending: ['refunded'],
  delivered: [],
  refunded: [],
}
```

Do not duplicate transition logic across pages.

---

## 16. Mock Backend Standards

The mock layer must support:

- seeded local data
- typed service contracts
- resettable app state
- deterministic records for tests
- network latency simulation
- failure simulation
- local persistence where appropriate

Pages must consume services, not raw data files.

---

## 17. Realtime Simulation Standards

Simulate realtime behavior for:

- order creation
- order state updates
- kitchen queue changes
- rider assignment
- rider trip progression
- notifications
- activity log updates
- dashboard refresh hooks where needed

Use a shared event helper or typed realtime service abstraction.

---

## 18. Testing Standards

After each implementation batch, run:

- typecheck
- lint
- unit tests
- end-to-end tests where applicable
- production build

Required behavior coverage should include:

- login redirects
- role-aware workspace routing
- permission guard behavior
- cart one-branch rule
- checkout validation
- order state transitions
- activity log creation
- admin access flow
- partner menu workflow

---

## 19. Milestones

### Milestone 0

- project bootstrap
- route namespaces
- layouts
- stores
- service boundaries
- mock runtime
- lint/test/build setup

### Milestone 1

- auth
- sessions
- route guards
- permissions foundation
- activity log foundation

### Milestone 2

- restaurant management
- branch management
- partner workflows
- menu foundations

### Milestone 3

- storefront
- cart
- checkout
- order tracking

### Milestone 4

- kitchen queue
- order lifecycle expansion

### Milestone 5

- rider workspace
- dispatch board

### Milestone 6

- delivery zones
- fee rules
- surge
- coverage validation

### Milestone 7

- customers
- promotions
- loyalty

### Milestone 8

- analytics
- reports
- QA pass
- polish
- documentation pass

Keep the app runnable after every milestone.

---

## 20. Delivery Standards

The system is only considered complete when:

- all route areas exist
- all required modules exist
- admin, customer, partner, kitchen, and rider flows function
- mock services are typed
- permission routing works
- admin lands in admin
- customer can place and track orders
- kitchen can process orders
- rider can process deliveries
- activity logs are generated for sensitive actions
- tests pass
- build passes
- documentation is honest about any remaining gaps

---

## 21. Agent Implementation Rules

The coding agent must:

- inspect the existing code before changing it
- preserve working flows
- prefer reusable components over duplication
- avoid hardcoded role-name checks in UI components
- keep pages decoupled from raw mock storage
- centralize business rules
- add tests with behavior changes
- keep milestone progress honest
- not claim full completion if required modules remain missing

