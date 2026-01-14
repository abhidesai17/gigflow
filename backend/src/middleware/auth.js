const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'token';
  const token = req.cookies?.[cookieName];

  if (!token) {
    res.status(401);
    return next(new Error('Not authenticated'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (e) {
    res.status(401);
    return next(new Error('Invalid token'));
  }
}

module.exports = { requireAuth };
