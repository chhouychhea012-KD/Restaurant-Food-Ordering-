const app = require('../src/app');
const { sequelize, Role, RoleAssignment, RolePermission, User, Restaurant, Order, MenuCategory, MenuItem } = require('../src/models');
const { Op } = require('sequelize');
const env = require('../src/config/env');

const port = Number(process.env.SMOKE_PORT || 4099);
const baseUrl = `http://127.0.0.1:${port}/api/v1`;

const accounts = {
  admin: ['admin@flavorfleet.app', 'Admin@123'],
  owner: ['owner@flavorfleet.app', 'Owner@123'],
  kitchen: ['kitchen@flavorfleet.app', 'Kitchen@123'],
  rider: ['rider@flavorfleet.app', 'Rider@123'],
  customer: ['customer@flavorfleet.app', 'Customer@123'],
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, token, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload.data;
}

async function login(role) {
  const [email, password] = accounts[role];
  const data = await request('POST', '/auth/login', null, { email, password });
  assert(data.session?.accessToken, `${role} login did not return an access token`);
  assert(data.user?.role === role, `${role} login returned wrong user role`);
  return data;
}

async function cleanupSmokeData() {
  await Order.destroy({ where: { deliveryInstructions: 'Smoke test order' } });
  await MenuItem.destroy({ where: { name: { [Op.like]: 'Smoke Item%' } } });
  await MenuCategory.destroy({ where: { name: { [Op.like]: 'Smoke Category%' } } });
  await Restaurant.destroy({ where: { name: { [Op.like]: 'Smoke Restaurant%' } } });
  await User.destroy({ where: { email: { [Op.like]: 'smoke-user-%@flavorfleet.test' } } });
  const smokeRoles = await Role.findAll({ where: { name: 'smoke_auditor' }, attributes: ['id'], raw: true });
  const smokeRoleIds = smokeRoles.map((role) => role.id);
  if (smokeRoleIds.length) {
    await RoleAssignment.destroy({ where: { roleId: smokeRoleIds } });
    await RolePermission.destroy({ where: { roleId: smokeRoleIds } });
    await Role.destroy({ where: { id: smokeRoleIds } });
  }
}
async function run() {
  await sequelize.authenticate();
  const server = app.listen(port);

  try {
    await cleanupSmokeData();
    const adminLogin = await login('admin');
    const ownerLogin = await login('owner');
    const kitchenLogin = await login('kitchen');
    const riderLogin = await login('rider');
    const customerLogin = await login('customer');
    const admin = adminLogin.session.accessToken;
    const customer = customerLogin.session.accessToken;

    const health = await request('GET', '/health');
    assert(health.status === 'ok', 'Health check failed');

    const me = await request('GET', '/auth/me', admin);
    assert(me.email === accounts.admin[0], 'Auth me failed');

    const restaurants = await request('GET', '/restaurants');
    assert(Array.isArray(restaurants) && restaurants.length > 0, 'Public restaurant list is empty');
    const seededRestaurant = restaurants[0];
    assert(seededRestaurant.menuCategories?.length, 'Seeded restaurant has no menu categories');
    const seededBranch = seededRestaurant.branches[0];
    const seededItem = seededRestaurant.menuCategories.flatMap((category) => category.items)[0];
    assert(seededBranch && seededItem, 'Seeded branch or menu item missing');

    const roles = await request('GET', '/roles', admin);
    assert(roles.some((role) => role.name === 'admin'), 'Role list missing admin role');
    const permissions = await request('GET', '/roles/permissions', admin);
    assert(permissions.includes('orders.create'), 'Permission catalog missing orders.create');

    const smokeRole = await request('POST', '/roles', admin, {
      name: 'Smoke Auditor',
      label: 'Smoke Auditor',
      description: 'Temporary smoke test role',
      permissions: ['analytics.read', 'profile.manage'],
    });
    assert(smokeRole.name === 'smoke_auditor', 'Role create failed');
    const updatedRole = await request('PUT', `/roles/${smokeRole.id}`, admin, {
      name: 'Smoke Auditor',
      label: 'Smoke Auditor Updated',
      description: 'Temporary smoke test role updated',
      permissions: ['analytics.read', 'profile.manage', 'reports.export'],
    });
    assert(updatedRole.permissions.includes('reports.export'), 'Role update failed');

    const smokeUser = await request('POST', '/users', admin, {
      name: 'Smoke User',
      email: `smoke-user-${Date.now()}@flavorfleet.test`,
      phone: '+66 800 999 999',
      role: 'support_agent',
      status: 'active',
      shiftActive: true,
      restaurantId: null,
    });
    assert(smokeUser.id, 'User create failed');
    const updatedUser = await request('PUT', `/users/${smokeUser.id}`, admin, {
      name: 'Smoke User Updated',
      email: smokeUser.email,
      phone: '+66 800 999 998',
      role: 'support_agent',
      status: 'active',
      shiftActive: false,
      restaurantId: null,
    });
    assert(updatedUser.shiftActive === false, 'User update failed');

    const smokeRestaurant = await request('POST', '/restaurants', admin, {
      name: `Smoke Restaurant ${Date.now()}`,
      cuisine: ['Smoke', 'Test'],
      description: 'Temporary smoke test restaurant',
      deliveryTime: '20-30 min',
      deliveryFee: 25,
      coverImage: 'https://example.com/smoke.jpg',
      status: 'open',
      verified: false,
      partnerStatus: 'pending',
      commissionRate: 0.18,
      reviewCount: 0,
      heroColor: 'from-orange-500 to-amber-400',
      branches: [
        {
          name: 'Smoke Branch',
          zone: 'Smoke Zone',
          lat: 13.7563,
          lng: 100.5018,
          phone: '+66 800 123 456',
          status: 'open',
          averagePrepMinutes: 18,
          minimumOrderAmount: 100,
          operatingHours: [
            { day: 0, label: 'Sun', open: '10:00', close: '21:00', closed: false },
            { day: 1, label: 'Mon', open: '10:00', close: '21:00', closed: false },
            { day: 2, label: 'Tue', open: '10:00', close: '21:00', closed: false },
            { day: 3, label: 'Wed', open: '10:00', close: '21:00', closed: false },
            { day: 4, label: 'Thu', open: '10:00', close: '21:00', closed: false },
            { day: 5, label: 'Fri', open: '10:00', close: '22:00', closed: false },
            { day: 6, label: 'Sat', open: '10:00', close: '22:00', closed: false },
          ],
          holidayClosures: [],
        },
      ],
    });
    assert(smokeRestaurant.branches.length === 1, 'Restaurant create failed');
    await request('PATCH', `/restaurants/${smokeRestaurant.id}/verification`, admin, { verified: true });
    await request('PATCH', `/restaurants/${smokeRestaurant.id}/partner-status`, admin, { partnerStatus: 'pending' });

    const smokeCategory = await request('POST', '/menus/categories', admin, {
      restaurantId: smokeRestaurant.id,
      name: 'Smoke Category',
    });
    assert(smokeCategory.id, 'Category create failed');
    const updatedCategory = await request('PUT', `/menus/categories/${smokeCategory.id}`, admin, {
      restaurantId: smokeRestaurant.id,
      name: 'Smoke Category Updated',
    });
    assert(updatedCategory.name === 'Smoke Category Updated', 'Category update failed');

    const smokeItem = await request('POST', '/menus/items', admin, {
      restaurantId: smokeRestaurant.id,
      categoryId: smokeCategory.id,
      categoryName: updatedCategory.name,
      name: 'Smoke Item',
      description: 'Temporary smoke menu item',
      price: 12,
      image: 'https://example.com/item.jpg',
      available: true,
      prepTime: 10,
      modifiers: ['Extra sauce'],
    });
    assert(smokeItem.id, 'Item create failed');
    await request('PUT', `/menus/items/${smokeItem.id}`, admin, {
      restaurantId: smokeRestaurant.id,
      categoryId: smokeCategory.id,
      categoryName: updatedCategory.name,
      name: 'Smoke Item Updated',
      description: 'Temporary smoke menu item updated',
      price: 13,
      image: 'https://example.com/item.jpg',
      available: true,
      prepTime: 11,
      modifiers: ['Extra sauce'],
    });
    const toggledItem = await request('PATCH', `/menus/items/${smokeItem.id}/availability`, admin);
    assert(toggledItem.available === false, 'Item availability toggle failed');

    const order = await request('POST', '/orders', customer, {
      customerId: customerLogin.user.id,
      restaurantId: seededRestaurant.id,
      restaurantName: seededRestaurant.name,
      branchId: seededBranch.id,
      branchName: seededBranch.name,
      deliveryAddress: '88 Smoke Test Road, Bangkok',
      items: [
        {
          id: `smoke-cart-${Date.now()}`,
          menuItemId: seededItem.id,
          name: seededItem.name,
          quantity: 1,
          price: Number(seededItem.price),
          modifiers: [],
          note: 'Smoke test',
          restaurantId: seededRestaurant.id,
          restaurantName: seededRestaurant.name,
          branchId: seededBranch.id,
          branchName: seededBranch.name,
          deliveryFee: Number(seededRestaurant.deliveryFee),
          minimumOrderAmount: Number(seededBranch.minimumOrderAmount || 0),
        },
      ],
      subtotal: Number(seededItem.price),
      deliveryFee: Number(seededRestaurant.deliveryFee),
      discount: 0,
      paymentMethod: 'cash',
      paymentDetails: { provider: 'cash', label: 'Cash on delivery' },
      deliveryInstructions: 'Smoke test order',
      voucherCode: null,
      loyaltyPointsRedeemed: 0,
    });
    assert(order.status === 'PLACED', 'Order create failed');
    const updatedOrder = await request('PATCH', `/orders/${order.id}/status`, admin, { status: 'PREPARING', label: 'Smoke status update' });
    assert(updatedOrder.status === 'PREPARING', 'Order status update failed');
    const readyOrder = await request('PATCH', `/orders/${order.id}/status`, admin, { status: 'READY_FOR_PICKUP', label: 'Smoke ready for pickup' });
    assert(readyOrder.status === 'READY_FOR_PICKUP', 'Order ready status update failed');
    const assignedOrder = await request('PUT', `/orders/${order.id}`, admin, { status: 'RIDER_ASSIGNED', riderName: 'Rico Rider', estimatedDeliveryAt: readyOrder.estimatedDeliveryAt });
    assert(assignedOrder.riderName === 'Rico Rider', 'Order rider assignment failed');
    const refundedOrder = await request('PATCH', `/orders/${order.id}/refund`, admin, { reason: 'Smoke refund test' });
    assert(refundedOrder.refundStatus === 'APPROVED', 'Refund approval failed');

    const customerOrders = await request('GET', `/orders?customerId=${customerLogin.user.id}`, customer);
    assert(customerOrders.some((entry) => entry.id === order.id), 'Customer order list failed');

    const notifications = await request('GET', '/notifications', customer);
    assert(Array.isArray(notifications), 'Notification list failed');
    if (notifications[0]) {
      await request('PATCH', `/notifications/${notifications[0].id}/read`, customer);
    }
    await request('PATCH', '/notifications/read-all', customer);

    const analytics = await request('GET', '/analytics/snapshot', admin);
    assert(typeof analytics.totalOrdersToday === 'number', 'Analytics snapshot failed');

    const logs = await request('GET', '/activity-logs', admin);
    assert(Array.isArray(logs) && logs.length > 0, 'Activity log list failed');

    const riders = await request('GET', '/riders', admin);
    assert(riders.some((entry) => entry.role === 'rider'), 'Rider list failed');
    const rider = riders.find((entry) => entry.email === accounts.rider[0]) || riders[0];
    await request('PATCH', `/riders/${rider.id}/availability`, admin);

    await request('PATCH', `/customers/${customerLogin.user.id}/loyalty`, customer, { earnedPoints: 1, redeemedPoints: 0 });
    const address = await request('POST', `/customers/${customerLogin.user.id}/addresses`, customer, {
      label: 'Smoke Address',
      line1: '1 Smoke Lane',
      district: 'Smoke District',
      city: 'Bangkok',
      isDefault: false,
      lat: 13.7563,
      lng: 100.5018,
    });
    assert(address.id, 'Address create failed');
    await request('PUT', `/customers/${customerLogin.user.id}/addresses/${address.id}`, customer, { ...address, label: 'Smoke Address Updated' });
    await request('DELETE', `/customers/${customerLogin.user.id}/addresses/${address.id}`, customer);

    await request('DELETE', `/orders/${order.id}`, admin);
    await request('DELETE', `/menus/items/${smokeItem.id}`, admin);
    await request('DELETE', `/menus/categories/${smokeCategory.id}`, admin);
    await request('DELETE', `/restaurants/${smokeRestaurant.id}`, admin);
    await request('DELETE', `/users/${smokeUser.id}`, admin);
    await request('DELETE', `/roles/${smokeRole.id}`, admin);

    console.log('API smoke test passed: frontend CRUD/workflow API coverage is working against the backend.');
  } finally {
    await cleanupSmokeData().catch(() => undefined);
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});