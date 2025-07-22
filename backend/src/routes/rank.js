// backend/src/routes/rank.js
const express = require('express');
const router = express.Router();

const { determineRank } = require('../services/rankService');
const { getTeamVolume } = require('../services/referralService');

/**
 * GET /api/rank/me
 * Returns the current user's total team volume and their rank.
 */
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) compute total self + downline volume
    const volume = await getTeamVolume(userId);

    // 2) determine rank based on that volume
    const rank = await determineRank(userId);

    res.json({ volume, rank });
  } catch (err) {
    console.error('Rank lookup error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
