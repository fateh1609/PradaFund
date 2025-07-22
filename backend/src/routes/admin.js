// src/routes/admin.js
const r = require('express').Router();
const { auth, admin } = require('../middleware/auth');
const c = require('../controllers/adminController');

r.get('/users',       auth, admin, c.listUsers);
r.get('/stakes',      auth, admin, c.listStakes);
r.get('/withdrawals', auth, admin, c.listWithdrawals);
r.get('/lendings',    auth, admin, c.listLendings);

module.exports = r;
