// backend/src/routes/wallet.js
const express = require('express');
const router  = express.Router();
const { verifyToken }       = require('../controllers/authController');
const { getWallet, unlockAll } = require('../controllers/walletController');

/**
 * GET  /api/wallet
 * Fetch combined on‑chain + off‑chain balances
 */
router.get('/', verifyToken, getWallet);

/**
 * POST /api/wallet/unlock
 * Unlock all locked PRADA tokens on‑chain
 */
router.post('/unlock', verifyToken, unlockAll);

module.exports = router;
