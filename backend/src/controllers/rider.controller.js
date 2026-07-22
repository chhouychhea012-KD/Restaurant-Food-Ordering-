const { User } = require('../models');
const { ApiError, ok } = require('../utils/http');
const { serializeUser } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

async function list(_req, res) {
  const riders = await User.findAll({ where: { role: 'rider' } });
  return ok(res, riders.map(serializeUser));
}

async function toggleAvailability(req, res) {
  const rider = await User.findByPk(req.params.id);
  if (!rider || rider.role !== 'rider') {
    throw new ApiError(404, 'Rider not found.');
  }
  await rider.update({ shiftActive: !rider.shiftActive });
  await workflow.createActivity(req, { domain: 'dispatch', action: 'rider.availability_toggled', title: 'Rider availability updated: ' + rider.name, description: rider.name + ' availability is now ' + (rider.shiftActive ? 'active' : 'inactive') + '.', actorUserId: rider.id, actorName: rider.name, actorRole: rider.role, metadata: { shiftActive: Boolean(rider.shiftActive) } });
  return ok(res, serializeUser(rider));
}

module.exports = {
  list,
  toggleAvailability,
};
