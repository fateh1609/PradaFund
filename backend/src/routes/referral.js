// backend/src/routes/referral.js
const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { User } = require('../models');
const {
  tree,
  upline,
  income
} = require('../controllers/referralController');

// Inline JWT auth (re‐uses your existing JWT_SECRET)
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Malformed Authorization header' });
  }
  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: user.id, username: user.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// referral tree & upline under /api/referrals
router.get('/tree/:username?', authenticate, tree);
router.get('/upline/:username?', authenticate, upline);

// direct‐referral income under /api/referral
router.get('/income', authenticate, income);

module.exports = router;
