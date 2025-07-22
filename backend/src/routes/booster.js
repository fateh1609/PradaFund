const express = require('express');
const { activateBooster, getActiveBoosterPct } = require('../services/boosterService');
const router = express.Router();

// POST /api/booster/activate  body: { type: '25'|'50'|'100' }
router.post('/activate', async (req, res) => {
  try {
    const booster = await activateBooster(req.user.id, req.body.type);
    res.json(booster);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

// GET /api/booster/me
router.get('/me', async (req, res) => {
  try {
    const pct = await getActiveBoosterPct(req.user.id);
    res.json({ activePct: pct });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
