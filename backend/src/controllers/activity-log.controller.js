const crypto = require('crypto');
const { Op } = require('sequelize');
const { ActivityLog } = require('../models');
const { created, ok } = require('../utils/http');
const { serializeActivityLog } = require('../services/serializer.service');

async function list(req, res) {
  const where = {};
  if (req.query.domain && req.query.domain !== 'all') {
    where.domain = req.query.domain;
  }
  if (req.query.restaurantId && req.query.restaurantId !== 'all') {
    where.restaurantId = req.query.restaurantId;
  }
  if (req.query.role && req.query.role !== 'all') {
    where.actorRole = req.query.role;
  }
  if (req.query.query) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.query}%` } },
      { description: { [Op.like]: `%${req.query.query}%` } },
      { actorName: { [Op.like]: `%${req.query.query}%` } },
      { orderId: { [Op.like]: `%${req.query.query}%` } },
    ];
  }
  const logs = await ActivityLog.findAll({ where, order: [['createdAt', 'DESC']] });
  return ok(res, logs.map(serializeActivityLog));
}

async function create(req, res) {
  const log = await ActivityLog.create({
    id: `log-${crypto.randomUUID()}`,
    actorUserId: req.user?.id || req.body.actorUserId || null,
    actorName: req.user?.name || req.body.actorName || 'System',
    actorRole: req.user?.role || req.body.actorRole || 'system',
    restaurantId: req.body.restaurantId || null,
    restaurantName: req.body.restaurantName || null,
    orderId: req.body.orderId || null,
    domain: req.body.domain,
    action: req.body.action,
    title: req.body.title,
    description: req.body.description,
    metadata: req.body.metadata || null,
  });
  return created(res, serializeActivityLog(log));
}

module.exports = {
  create,
  list,
};
