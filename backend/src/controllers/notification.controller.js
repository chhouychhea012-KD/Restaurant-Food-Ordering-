const crypto = require('crypto');
const { Notification, NotificationRead } = require('../models');
const { created, noContent, ok } = require('../utils/http');
const { serializeNotification } = require('../services/serializer.service');

async function list(req, res) {
  const notifications = await Notification.findAll({ include: [{ model: NotificationRead, as: 'reads' }], order: [['createdAt', 'DESC']] });
  const visible = notifications.filter((notification) => {
    if (notification.userId) {
      return notification.userId === req.user.id;
    }
    if (req.user.role === 'customer') {
      return notification.audienceRole === 'customer';
    }
    return notification.audienceRole === 'admin';
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
  });
  return created(res, serializeNotification({ ...notification.get({ plain: true }), reads: [] }));
}

async function markRead(req, res) {
  await NotificationRead.findOrCreate({ where: { notificationId: req.params.id, userId: req.user.id } });
  return ok(res, { read: true });
}

async function markAllRead(req, res) {
  const notifications = await Notification.findAll();
  await NotificationRead.bulkCreate(
    notifications.map((notification) => ({ notificationId: notification.id, userId: req.user.id })),
    { ignoreDuplicates: true },
  );
  return ok(res, { read: true });
}

async function remove(req, res) {
  const notification = await Notification.findByPk(req.params.id);
  if (notification) {
    await notification.destroy();
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
