const crypto = require('crypto');
const { Op } = require('sequelize');
const { Notification, NotificationRead } = require('../models');
const { created, noContent, ok } = require('../utils/http');
const { serializeNotification } = require('../services/serializer.service');
const realtime = require('../services/realtime.service');

async function list(req, res) {
  const now = new Date();
  const notifications = await Notification.findAll({
    where: { [Op.or]: [{ scheduledAt: null }, { scheduledAt: { [Op.lte]: now } }] },
    include: [{ model: NotificationRead, as: 'reads' }],
    order: [['createdAt', 'DESC']],
  });
  const visible = notifications.filter((notification) => {
    if (notification.userId) {
      return notification.userId === req.user.id;
    }
    if (req.user.role === 'customer') {
      return notification.audienceRole === 'customer';
    }
    if (['admin', 'operations_manager', 'support_agent'].includes(req.user.role)) {
      return notification.audienceRole === 'admin';
    }
    return false;
  });
  return ok(res, visible.map(serializeNotification));
}

async function create(req, res) {
  const notification = await Notification.create({
    id: `notif-${crypto.randomUUID()}`,
    title: req.body.title,
    message: req.body.message,
    kind: req.body.kind,
    audienceRole: req.body.audienceRole,
    userId: req.body.userId || null,
    ctaLabel: req.body.ctaLabel || null,
    ctaTo: req.body.ctaTo || null,
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
  });
  realtime.broadcastNotificationChanged(notification, 'created');
  return created(res, serializeNotification({ ...notification.get({ plain: true }), reads: [] }));
}

async function markRead(req, res) {
  await NotificationRead.findOrCreate({ where: { notificationId: req.params.id, userId: req.user.id } });
  realtime.broadcast('notification.changed', { action: 'read', notificationId: req.params.id, userId: req.user.id }, (client) => client.userId === req.user.id);
  return ok(res, { read: true });
}

async function markAllRead(req, res) {
  const now = new Date();
  const notifications = await Notification.findAll({ where: { [Op.or]: [{ scheduledAt: null }, { scheduledAt: { [Op.lte]: now } }] } });
  await NotificationRead.bulkCreate(
    notifications.map((notification) => ({ notificationId: notification.id, userId: req.user.id })),
    { ignoreDuplicates: true },
  );
  realtime.broadcast('notification.changed', { action: 'read-all', userId: req.user.id }, (client) => client.userId === req.user.id);
  return ok(res, { read: true });
}

async function remove(req, res) {
  const notification = await Notification.findByPk(req.params.id);
  if (notification) {
    await notification.destroy();
    realtime.broadcastNotificationChanged(notification, 'deleted');
  }
  return noContent(res);
}

module.exports = {
  create,
  list,
  markAllRead,
  markRead,
  remove,
};
