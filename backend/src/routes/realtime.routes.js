const router = require('express').Router();
const { User } = require('../models');
const realtime = require('../services/realtime.service');
const { verifyAccessToken } = require('../utils/token');
const { ApiError, asyncHandler } = require('../utils/http');

async function authenticateEventStream(req, _res, next) {
  try {
    const token = req.query.token;
    if (!token || typeof token !== 'string') {
      throw new ApiError(401, 'Realtime authentication token is required.');
    }
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'Realtime user session is no longer valid.');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : new ApiError(401, 'Invalid or expired realtime token.'));
  }
}

router.get('/events', authenticateEventStream, asyncHandler(async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  realtime.addClient(req, res);
  req.on('close', () => clearInterval(heartbeat));
}));

module.exports = router;
