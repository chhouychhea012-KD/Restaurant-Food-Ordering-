const crypto = require('crypto');
const { ActivityLog, Notification, User } = require('../models');
const realtime = require('./realtime.service');
const { sendNotificationEmail, sendOrderEmail } = require('./email.service');

const publicSiteUrl = (process.env.PUBLIC_SITE_URL || process.env.FRONTEND_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
const scheduledEmailTimers = new Map();

function absoluteUrl(path) {
  if (!path) return publicSiteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return publicSiteUrl + (path.startsWith('/') ? path : '/' + path);
}

function notificationIsDue(notification) {
  return !notification.scheduledAt || new Date(notification.scheduledAt).getTime() <= Date.now();
}

async function usersForNotification(notification) {
  if (notification.userId) {
    return User.findAll({ where: { id: notification.userId, status: 'active' } });
  }
  if (notification.audienceRole === 'customer') {
    return User.findAll({ where: { role: 'customer', status: 'active' } });
  }
  if (notification.audienceRole === 'admin') {
    return User.findAll({ where: { role: ['admin', 'operations_manager', 'support_agent'], status: 'active' } });
  }
  return [];
}

async function sendNotificationEmailFor(notification) {
  const fresh = await Notification.findByPk(notification.id);
  if (!fresh || fresh.emailSentAt || fresh.kind === 'order' || !notificationIsDue(fresh)) return;
  const users = await usersForNotification(fresh);
  const recipients = users.map((user) => user.email).filter(Boolean);
  if (!recipients.length) return;
  try {
    const result = await sendNotificationEmail({
      to: recipients,
      title: fresh.title,
      message: fresh.message,
      kind: fresh.kind,
      ctaLabel: fresh.ctaLabel,
      ctaUrl: fresh.ctaTo ? absoluteUrl(fresh.ctaTo) : null,
    });
    if (result.delivered && result.provider === 'smtp') {
      await fresh.update({ emailSentAt: new Date() });
    }
  } catch (error) {
    console.error('Notification email failed:', error.message);
  }
}

function scheduleNotificationEmail(notification) {
  if (!notification || notification.emailSentAt || notification.kind === 'order') return;
  const dueAt = notification.scheduledAt ? new Date(notification.scheduledAt).getTime() : Date.now();
  const delay = Math.max(0, dueAt - Date.now());
  if (scheduledEmailTimers.has(notification.id)) clearTimeout(scheduledEmailTimers.get(notification.id));
  const timer = setTimeout(() => {
    scheduledEmailTimers.delete(notification.id);
    sendNotificationEmailFor(notification).catch((error) => console.error('Notification email failed:', error.message));
  }, Math.min(delay, 2147483647));
  scheduledEmailTimers.set(notification.id, timer);
}

async function schedulePendingNotificationEmails() {
  const notifications = await Notification.findAll({ where: { emailSentAt: null } });
  notifications.forEach(scheduleNotificationEmail);
}

function actorFromRequest(req) {
  return {
    actorUserId: req.user?.id || null,
    actorName: req.user?.name || 'System',
    actorRole: req.user?.role || 'system',
  };
}

async function createActivity(req, input) {
  const actor = actorFromRequest(req || {});
  return ActivityLog.create({
    id: input.id || `log-${crypto.randomUUID()}`,
    actorUserId: input.actorUserId === undefined ? actor.actorUserId : input.actorUserId,
    actorName: input.actorName || actor.actorName,
    actorRole: input.actorRole || actor.actorRole,
    restaurantId: input.restaurantId || null,
    restaurantName: input.restaurantName || null,
    orderId: input.orderId || null,
    domain: input.domain,
    action: input.action,
    title: input.title,
    description: input.description,
    metadata: input.metadata || null,
  });
}

async function createNotification(input) {
  const notification = await Notification.create({
    id: input.id || `notif-${crypto.randomUUID()}`,
    title: input.title,
    message: input.message,
    kind: input.kind,
    audienceRole: input.audienceRole,
    userId: input.userId || null,
    ctaLabel: input.ctaLabel || null,
    ctaTo: input.ctaTo || null,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
  });
  realtime.broadcastNotificationChanged(notification, 'created');
  scheduleNotificationEmail(notification);
  return notification;
}

async function notifyCustomer(order, title, message, ctaTo = '/track-order') {
  const separator = ctaTo.includes('?') ? '' : `?orderId=${order.id}`;
  return createNotification({
    title,
    message,
    kind: 'order',
    audienceRole: 'customer',
    userId: order.customerId,
    ctaLabel: 'Track order',
    ctaTo: `${ctaTo}${separator}`,
  });
}


async function notifyAdmin(title, message, ctaTo = '/admin/orders') {
  return createNotification({
    title,
    message,
    kind: 'order',
    audienceRole: 'admin',
    ctaLabel: 'Open',
    ctaTo,
  });
}

async function notifyRestaurantTeam(order, title, message, ctaTo = '/partner/orders') {
  const users = await User.findAll({ where: { restaurantId: order.restaurantId } });
  await Promise.all(
    users
      .filter((user) => ['owner', 'kitchen', 'branch_manager'].includes(user.role))
      .map((user) => {
        const isKitchen = user.role === 'kitchen';
        return createNotification({
          title,
          message,
          kind: 'order',
          audienceRole: 'admin',
          userId: user.id,
          ctaLabel: isKitchen ? 'Open kitchen queue' : 'Open orders',
          ctaTo: isKitchen ? '/kitchen' : ctaTo,
        });
      }),
  );
}

async function sendOrderEmailToUsers(users, title, message, order, ctaTo, ctaLabel) {
  const recipients = users.map((user) => user.email).filter(Boolean);
  if (!recipients.length) return;
  try {
    await sendOrderEmail({ to: recipients, title, message, order, ctaUrl: ctaTo ? absoluteUrl(ctaTo) : null, ctaLabel });
  } catch (error) {
    console.error('Order email failed:', error.message);
  }
}

async function emailCustomer(order, title, message, ctaTo = '/track-order') {
  const user = await User.findByPk(order.customerId);
  if (!user || user.status !== 'active') return;
  const separator = ctaTo.includes('?') ? '' : '?orderId=' + order.id;
  await sendOrderEmailToUsers([user], title, message, order, ctaTo + separator, 'Track order');
}

async function emailAdmin(title, message, order, ctaTo = '/admin/orders') {
  const users = await User.findAll({ where: { role: ['admin', 'operations_manager', 'support_agent'], status: 'active' } });
  await sendOrderEmailToUsers(users, title, message, order, ctaTo, 'Open orders');
}

async function emailRestaurantTeam(order, title, message, ctaTo = '/partner/orders') {
  const users = await User.findAll({ where: { restaurantId: order.restaurantId, status: 'active' } });
  const team = users.filter((user) => ['owner', 'kitchen', 'branch_manager'].includes(user.role));
  await sendOrderEmailToUsers(team, title, message, order, ctaTo, 'Open orders');
}

async function emailRider(rider, order, title, message, ctaTo = '/rider/deliveries') {
  await sendOrderEmailToUsers([rider], title, message, order, ctaTo, 'Open deliveries');
}

function statusLabel(status) {
  return String(status || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function orderCreated(req, order, itemCount) {
  await Promise.all([
    notifyCustomer(order, 'Order placed successfully', `${order.restaurantName} received ${order.id}. You can now follow status updates from preparation to delivery.`),
    notifyAdmin('New customer order received', `${order.restaurantName} received ${order.id} for ${order.branchName || 'selected branch'} with ${itemCount} items and a total of ${Number(order.total || 0).toFixed(2)}.`),
    notifyRestaurantTeam(order, 'New order for your restaurant', `${order.id} was placed for ${order.branchName || 'selected branch'} with ${itemCount} items.`),
    emailCustomer(order, 'Order placed successfully', `${order.restaurantName} received ${order.id}. You can now follow status updates from preparation to delivery.`),
    emailAdmin('New customer order received', `${order.restaurantName} received ${order.id} for ${order.branchName || 'selected branch'} with ${itemCount} items and a total of ${Number(order.total || 0).toFixed(2)}.`, order),
    emailRestaurantTeam(order, 'New order for your restaurant', `${order.id} was placed for ${order.branchName || 'selected branch'} with ${itemCount} items.`),
    createActivity(req, {
      domain: 'order',
      action: 'order.created',
      title: `${order.id} placed`,
      description: `${order.restaurantName} received ${order.id} with ${itemCount} items for a total of ${order.total}.`,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      orderId: order.id,
      metadata: { total: Number(order.total), itemCount, status: order.status, paymentMethod: order.paymentMethod || null },
    }),
  ]);
  realtime.broadcastOrderChanged(order, 'created');
}

async function orderUpdated(req, previousOrder, order) {
  const nextLabel = statusLabel(order.status);
  const tasks = [
    notifyCustomer(order, `Order update: ${nextLabel}`, `${order.restaurantName} moved ${order.id} to ${nextLabel}.`),
    notifyAdmin('Order status changed', `${order.id} is now ${nextLabel} for ${order.restaurantName}.`),
    notifyRestaurantTeam(order, 'Restaurant order status changed', `${order.id} moved to ${nextLabel}.`),
    emailCustomer(order, `Order update: ${nextLabel}`, `${order.restaurantName} moved ${order.id} to ${nextLabel}.`),
    emailAdmin('Order status changed', `${order.id} is now ${nextLabel} for ${order.restaurantName}.`, order),
    emailRestaurantTeam(order, 'Restaurant order status changed', `${order.id} moved to ${nextLabel}.`),
  ];

  if (previousOrder.status !== order.status) {
    tasks.push(
      createActivity(req, {
        domain: 'order',
        action: 'order.status_changed',
        title: `${order.id} moved to ${nextLabel}`,
        description: `${order.restaurantName} changed ${order.id} from ${statusLabel(previousOrder.status)} to ${nextLabel}.`,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        orderId: order.id,
        metadata: { previousStatus: previousOrder.status, nextStatus: order.status, riderName: order.riderName || null },
      }),
    );
  }

  if (previousOrder.riderName !== order.riderName) {
    if (order.riderName) {
      tasks.push((async () => {
        const rider = await User.findOne({ where: { name: order.riderName, role: 'rider' } });
        if (rider) {
          await createNotification({
            title: `Delivery assigned: ${order.id}`,
            message: `${order.restaurantName} assigned ${order.id} for pickup at ${order.branchName || 'the branch'}.`,
            kind: 'order',
            audienceRole: 'admin',
            userId: rider.id,
            ctaLabel: 'Open deliveries',
            ctaTo: '/rider/deliveries',
          });
          await emailRider(rider, order, `Delivery assigned: ${order.id}`, `${order.restaurantName} assigned ${order.id} for pickup at ${order.branchName || 'the branch'}.`);
        }
      })());
    }
    tasks.push(
      createActivity(req, {
        domain: 'dispatch',
        action: order.riderName ? 'dispatch.rider_assigned' : 'dispatch.rider_unassigned',
        title: order.riderName ? `Assigned ${order.riderName} to ${order.id}` : `Removed rider from ${order.id}`,
        description: order.riderName ? `${order.riderName} was assigned to ${order.id}.` : `The rider assignment for ${order.id} was cleared.`,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        orderId: order.id,
        metadata: { previousRiderName: previousOrder.riderName || null, nextRiderName: order.riderName || null },
      }),
    );
  }

  await Promise.all(tasks);
  realtime.broadcastOrderChanged(order, 'updated');
}

async function refundApproved(req, order, reason) {
  await Promise.all([
    notifyCustomer(order, 'Refund approved', `${order.restaurantName} approved a refund review for ${order.id}.`, '/orders'),
    notifyAdmin('Refund approved', `${order.id} was approved for refund review.`, '/admin/activity-log'),
    notifyRestaurantTeam(order, 'Refund review approved', `${order.id} was approved for refund review.`, '/partner/orders'),
    emailCustomer(order, 'Refund approved', `${order.restaurantName} approved a refund review for ${order.id}.`, '/orders'),
    emailAdmin('Refund approved', `${order.id} was approved for refund review.`, order, '/admin/activity-log'),
    emailRestaurantTeam(order, 'Refund review approved', `${order.id} was approved for refund review.`, '/partner/orders'),
    createActivity(req, {
      domain: 'refund',
      action: 'refund.approved',
      title: `Refund approved for ${order.id}`,
      description: `${order.restaurantName} approved a refund for ${order.id}.`,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      orderId: order.id,
      metadata: { reason: reason || null, total: Number(order.total) },
    }),
  ]);
  realtime.broadcastOrderChanged(order, 'refunded');
}

module.exports = {
  createActivity,
  createNotification,
  notifyAdmin,
  notifyCustomer,
  notifyRestaurantTeam,
  orderCreated,
  orderUpdated,
  refundApproved,
  schedulePendingNotificationEmails,
  sendNotificationEmailFor,
  statusLabel,
};