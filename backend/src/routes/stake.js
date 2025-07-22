// backend/src/routes/stake.js
const express = require('express');
const router  = express.Router();

const { verifyToken }      = require('../controllers/authController');
const { invest, getInvestments } = require('../controllers/stakeController');

/**
 * Create a new stake/investment
 */
router.post('/', verifyToken, invest);

/**
 * List all stakes for the logged‑in user
 */
router.get('/', verifyToken, getInvestments);

module.exports = router;
