// middleware/errorHandler.js — catches any error thrown in a route and sends
// back a clean JSON error instead of crashing the server or leaking a stack trace.

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = errorHandler;
