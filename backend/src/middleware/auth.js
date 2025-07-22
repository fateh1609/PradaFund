// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization?.split(' ');
    if (header?.[0] !== 'Bearer' || !header[1]) return res.sendStatus(401);
    const payload = jwt.verify(header[1], process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(401);
  }
};

const admin = (req, res, next) => {
  if (req.user.username !== 'backoffice') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

module.exports = { auth, admin };
