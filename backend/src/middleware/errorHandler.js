function errorHandler(err, req, res, next) {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : err.statusCode
        ? err.statusCode
        : 500;

  res.status(statusCode).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler };
