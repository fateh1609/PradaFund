const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { User } = require('../models');
const ctrl   = require('../controllers/roiController');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, username: user.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

router.get('/summary', authenticate, ctrl.summary);

module.exports = router;
