function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal server error.' : error.message,
      status,
    },
  });
}

module.exports = {
  errorHandler,
  notFound,
};
