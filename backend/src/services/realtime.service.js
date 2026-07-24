const clients = new Map();
let nextClientId = 1;

function writeEvent(client, event, payload) {
  client.res.write('event: ' + event + '\n');
  client.res.write('data: ' + JSON.stringify(payload || {}) + '\n\n');
}

function addClient(req, res) {
  const id = nextClientId++;
  const client = {
    id,
    userId: req.user.id,
    name: req.user.name,
    role: req.user.role,
    restaurantId: req.user.restaurantId || null,
    res,
  };

  clients.set(id, client);
  writeEvent(client, 'connected', { connected: true, userId: client.userId, role: client.role });

  req.on('close', () => {
    clients.delete(id);
  });

  return client;
}

function broadcast(event, payload = {}, predicate = () => true) {
  for (const client of clients.values()) {
    if (!predicate(client)) continue;
    writeEvent(client, event, payload);
  }
}

function broadcastOrderChanged(order, action = 'updated') {
  const payload = {
    action,
    orderId: order.id,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
    riderName: order.riderName || null,
    status: order.status,
  };

  broadcast('order.changed', payload, (client) => {
    if (['admin', 'operations_manager', 'support_agent'].includes(client.role)) return true;
    if (client.role === 'customer') return client.userId === order.customerId;
    if (['owner', 'branch_manager', 'kitchen'].includes(client.role)) return client.restaurantId === order.restaurantId;
    if (client.role === 'rider') return !order.riderName || order.riderName === client.name;
    return false;
  });
}

function broadcastNotificationChanged(notification, action = 'changed') {
  const payload = {
    action,
    notificationId: notification.id,
    userId: notification.userId || null,
    audienceRole: notification.audienceRole || null,
    kind: notification.kind || null,
  };

  broadcast('notification.changed', payload, (client) => {
    if (notification.userId) return notification.userId === client.userId;
    if (notification.audienceRole === 'customer') return client.role === 'customer';
    if (notification.audienceRole === 'admin') return ['admin', 'operations_manager', 'support_agent'].includes(client.role);
    return false;
  });
}

module.exports = {
  addClient,
  broadcast,
  broadcastNotificationChanged,
  broadcastOrderChanged,
};
