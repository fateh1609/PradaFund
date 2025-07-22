const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ctrl = require('../controllers/withdrawalController');

async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', auth, ctrl.getMyWithdrawals);
router.post('/new', auth, ctrl.requestWithdrawal);

module.exports = router;
