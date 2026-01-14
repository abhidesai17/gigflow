const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { getCookieOptions } = require('../utils/cookies');

function signToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email, password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('Email already in use');
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

  const token = signToken(user);
  const cookieName = process.env.COOKIE_NAME || 'token';
  res.cookie(cookieName, token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken(user);
  const cookieName = process.env.COOKIE_NAME || 'token';
  res.cookie(cookieName, token, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'token';

  // Clear cookie by setting an empty value and expiring it in the past.
  // Options must match the auth cookie options used during login/register.
  res.cookie(cookieName, '', {
    ...getCookieOptions(),
    expires: new Date(0),
  });

  res.json({ ok: true });
});

module.exports = { register, login, logout };
