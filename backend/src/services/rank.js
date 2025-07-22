const express = require('express');
const { determineRank } = require('../services/rankService');
const { getTeamVolume } = require('../services/referralService');
const { User } = require('../models');
const router = express.Router();

// GET /api/rank/me
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const volume = await getTeamVolume(userId);
    const rank   = await determineRank(userId);
    res.json({ rank, volume });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
