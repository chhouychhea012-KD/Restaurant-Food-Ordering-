const { AnalyticsSnapshot } = require('../models');
const { ok } = require('../utils/http');

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
  return payload;
}

async function snapshot(_req, res) {
  const snapshotRow = await AnalyticsSnapshot.findByPk('current');
  return ok(res, parsePayload(snapshotRow?.payload));
}

module.exports = {
  snapshot,
};