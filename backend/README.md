# Flavor Fleet Backend API

Node.js + Express + Sequelize + MySQL backend for the Flavor Fleet Vue frontend.

## Stack

- Node.js
- Express MVC structure
- MySQL
- Sequelize ORM and Sequelize CLI migrations/seeders
- JWT authentication
- bcrypt password hashing
- Helmet, CORS, and API rate limiting

## Structure

```text
backend/
  config/                 Sequelize database config
  migrations/             MySQL schema migrations
  seeders/                Seeds copied from frontend JSON data
  src/
    config/               Runtime and permission config
    controllers/          MVC controllers
    middleware/           Auth, authorization, errors
    models/               Sequelize models and associations
    routes/               /api/v1 route modules
    services/             Serialization helpers
    utils/                HTTP, JWT, password, slug helpers
    app.js                Express app
    server.js             API entrypoint
```


## Migration And Seeder Standard

The backend uses one file per database table. Migration filenames are ordered so parent tables are created before child tables with foreign keys:

1. roles and permissions
2. restaurants
3. users and access assignments
4. branches, operating hours, and closures
5. menu categories and items
6. orders, order items, and timelines
7. notifications and notification reads
8. activity logs and analytics snapshots

Seeders follow the same order and read from `frontend/src/assets/data`. This keeps the backend database aligned with the current working frontend demo data while still giving every table its own rollback boundary.
## Setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` with your MySQL credentials.

```bash
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs at:

```text
http://localhost:4000/api/v1
```

Health check:

```text
GET /api/v1/health
```

## Demo Login Accounts

The seeder imports the existing frontend demo users and resets their backend bcrypt passwords to:

- `admin@flavorfleet.app` / `Admin@123`
- `owner@flavorfleet.app` / `Owner@123`
- `kitchen@flavorfleet.app` / `Kitchen@123`
- `rider@flavorfleet.app` / `Rider@123`
- `customer@flavorfleet.app` / `Customer@123`

## Main API Modules

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`
- `GET|POST|PUT|DELETE /api/v1/users`
- `GET|POST|PUT|DELETE /api/v1/roles`
- `GET /api/v1/roles/permissions`
- `GET|POST|PUT|DELETE /api/v1/restaurants`
- `PATCH /api/v1/restaurants/:id/verification`
- `PATCH /api/v1/restaurants/:id/partner-status`
- `GET /api/v1/menus/products`
- `GET /api/v1/menus/categories`
- `POST|PUT|DELETE /api/v1/menus/categories`
- `POST|PUT|DELETE /api/v1/menus/items`
- `PATCH /api/v1/menus/items/:id/availability`
- `GET|POST|PUT|DELETE /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`
- `PATCH /api/v1/orders/:id/refund`
- `GET|POST|PUT|DELETE /api/v1/customers/:userId/addresses`
- `PUT /api/v1/customers/:userId/profile`
- `GET|POST|PATCH|DELETE /api/v1/notifications`
- `GET|POST /api/v1/activity-logs`
- `GET /api/v1/analytics/snapshot`
- `GET /api/v1/riders`
- `PATCH /api/v1/riders/:id/availability`

## Frontend Server Mode

In `frontend/.env`:

```text
VITE_API_MODE=server
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Then run:

```bash
cd frontend
npm run dev
```

Leave `VITE_API_MODE` unset or set it to `mock` to keep using the original local JSON/localStorage demo mode.
## Full API Smoke Test

After MySQL is migrated and seeded, run:

```bash
npm run smoke:api
```

This starts the Express app on a temporary port, logs in with the seeded demo accounts, and verifies the current frontend-facing CRUD/workflows: auth, roles, users, restaurants, menu categories/items, orders, refunds, notifications, analytics, activity logs, riders, customer addresses, and loyalty.