# Postman Environment Variables and API Endpoint Guide

This file is for testing the full Flavor Fleet backend API in Postman.

Backend base URL:

```txt
http://localhost:4000/api/v1
```

## 1. Start Backend

Open PowerShell:

```powershell
cd C:\Users\User\Desktop\Restaurant-Food-Ordering-\backend
npm run db:migrate
npm run db:seed
npm run dev
```

Optional full API workflow test:

```powershell
npm run smoke:api
```

Expected result:

```txt
API smoke test passed: frontend CRUD/workflow API coverage is working against the backend.
```

## 2. Postman Environment Variables

Create a Postman environment named:

```txt
Flavor Fleet Local
```

Add these variables:

```txt
base_url = http://localhost:4000/api/v1
admin_token =
customer_token =
owner_token =
kitchen_token =
rider_token =
restaurant_id =
branch_id =
category_id =
item_id =
order_id =
role_id =
user_id =
customer_id =
address_id =
notification_id =
```

## 3. Seeded Login Accounts

Use these accounts after seeding:

```txt
admin@flavorfleet.app / Admin@123
owner@flavorfleet.app / Owner@123
kitchen@flavorfleet.app / Kitchen@123
rider@flavorfleet.app / Rider@123
customer@flavorfleet.app / Customer@123
```

For protected routes, add this header:

```txt
Authorization: Bearer {{admin_token}}
Content-Type: application/json
Accept: application/json
```

For customer routes, use:

```txt
Authorization: Bearer {{customer_token}}
Content-Type: application/json
Accept: application/json
```

## 4. Login Requests

### Admin Login

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "admin@flavorfleet.app",
  "password": "Admin@123"
}
```

Postman Tests tab:

```js
const json = pm.response.json();
pm.environment.set("admin_token", json.data.session.accessToken);
pm.environment.set("user_id", json.data.user.id);
```

### Customer Login

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "customer@flavorfleet.app",
  "password": "Customer@123"
}
```

Postman Tests tab:

```js
const json = pm.response.json();
pm.environment.set("customer_token", json.data.session.accessToken);
pm.environment.set("customer_id", json.data.user.id);
```

### Owner Login

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "owner@flavorfleet.app",
  "password": "Owner@123"
}
```

Postman Tests tab:

```js
const json = pm.response.json();
pm.environment.set("owner_token", json.data.session.accessToken);
```

### Kitchen Login

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "kitchen@flavorfleet.app",
  "password": "Kitchen@123"
}
```

Postman Tests tab:

```js
const json = pm.response.json();
pm.environment.set("kitchen_token", json.data.session.accessToken);
```

### Rider Login

```http
POST {{base_url}}/auth/login
```

Body:

```json
{
  "email": "rider@flavorfleet.app",
  "password": "Rider@123"
}
```

Postman Tests tab:

```js
const json = pm.response.json();
pm.environment.set("rider_token", json.data.session.accessToken);
```

## 5. Core API Endpoints

### Health

```http
GET {{base_url}}/health
```

### Auth

```http
POST {{base_url}}/auth/login
POST {{base_url}}/auth/register
GET  {{base_url}}/auth/me
```

### Restaurants

```http
GET    {{base_url}}/restaurants
GET    {{base_url}}/restaurants/:idOrSlug
POST   {{base_url}}/restaurants
PUT    {{base_url}}/restaurants/:id
PATCH  {{base_url}}/restaurants/:id/verification
PATCH  {{base_url}}/restaurants/:id/partner-status
DELETE {{base_url}}/restaurants/:id
```

### Menus

```http
GET    {{base_url}}/menus/products
GET    {{base_url}}/menus/categories
POST   {{base_url}}/menus/categories
PUT    {{base_url}}/menus/categories/:id
DELETE {{base_url}}/menus/categories/:id

POST   {{base_url}}/menus/items
PUT    {{base_url}}/menus/items/:id
PATCH  {{base_url}}/menus/items/:id/availability
DELETE {{base_url}}/menus/items/:id
```

### Orders

```http
GET    {{base_url}}/orders
GET    {{base_url}}/orders/:id
POST   {{base_url}}/orders
PUT    {{base_url}}/orders/:id
PATCH  {{base_url}}/orders/:id/status
PATCH  {{base_url}}/orders/:id/refund
DELETE {{base_url}}/orders/:id
```

### Users

```http
GET    {{base_url}}/users
GET    {{base_url}}/users/:id
POST   {{base_url}}/users
PUT    {{base_url}}/users/:id
DELETE {{base_url}}/users/:id
```

### Roles and Permissions

```http
GET    {{base_url}}/roles
GET    {{base_url}}/roles/permissions
POST   {{base_url}}/roles
PUT    {{base_url}}/roles/:id
DELETE {{base_url}}/roles/:id
```

### Customers

```http
PUT    {{base_url}}/customers/:userId/profile
PATCH  {{base_url}}/customers/:userId/loyalty
DELETE {{base_url}}/customers/:userId

GET    {{base_url}}/customers/:userId/addresses
POST   {{base_url}}/customers/:userId/addresses
PUT    {{base_url}}/customers/:userId/addresses/:addressId
DELETE {{base_url}}/customers/:userId/addresses/:addressId
```

### Notifications

```http
GET    {{base_url}}/notifications
POST   {{base_url}}/notifications
PATCH  {{base_url}}/notifications/:id/read
PATCH  {{base_url}}/notifications/read-all
DELETE {{base_url}}/notifications/:id
```

### Analytics

```http
GET {{base_url}}/analytics/snapshot
```

### Activity Logs

```http
GET  {{base_url}}/activity-logs
POST {{base_url}}/activity-logs
```

### Riders

```http
GET   {{base_url}}/riders
PATCH {{base_url}}/riders/:id/availability
```

## 6. Recommended Postman Test Order

Use this order so IDs are available naturally:

```txt
1. GET /health
2. POST /auth/login as admin
3. POST /auth/login as customer
4. GET /restaurants
5. Save one restaurant id and branch id.
6. GET /menus/categories
7. GET /menus/products
8. POST /orders using customer token.
9. PATCH /orders/:id/status using admin token.
10. PATCH /orders/:id/refund using admin token.
11. GET /notifications using customer token.
12. GET /analytics/snapshot using admin token.
13. GET /activity-logs using admin token.
```

## 7. Useful Postman Test Scripts for Saving IDs

Save first restaurant and branch from `GET {{base_url}}/restaurants`:

```js
const json = pm.response.json();
const restaurant = json.data[0];
pm.environment.set("restaurant_id", restaurant.id);
pm.environment.set("branch_id", restaurant.branches?.[0]?.id);
```

Save first category from `GET {{base_url}}/menus/categories`:

```js
const json = pm.response.json();
pm.environment.set("category_id", json.data[0].category.id);
```

Save first menu item from `GET {{base_url}}/menus/products`:

```js
const json = pm.response.json();
pm.environment.set("item_id", json.data[0].item.id);
```

Save order id from `POST {{base_url}}/orders`:

```js
const json = pm.response.json();
pm.environment.set("order_id", json.data.id);
```

Save role id from `POST {{base_url}}/roles`:

```js
const json = pm.response.json();
pm.environment.set("role_id", json.data.id);
```

Save user id from `POST {{base_url}}/users`:

```js
const json = pm.response.json();
pm.environment.set("user_id", json.data.id);
```

Save address id from `POST {{base_url}}/customers/{{customer_id}}/addresses`:

```js
const json = pm.response.json();
pm.environment.set("address_id", json.data.id);
```

Save notification id from `GET {{base_url}}/notifications`:

```js
const json = pm.response.json();
if (json.data.length) {
  pm.environment.set("notification_id", json.data[0].id);
}
```