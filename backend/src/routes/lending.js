// src/routes/lending.js
const r = require('express').Router();
const c = require('../controllers/lendingController');
const { auth } = require('../middleware/auth');

r.post('/',    auth, c.create);
r.post('/:id/repay', auth, c.close);

module.exports = r;
