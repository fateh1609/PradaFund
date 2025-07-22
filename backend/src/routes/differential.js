// backend/src/routes/differential.js
const express      = require('express');
const { Differential } = require('../models');
const router       = express.Router();

// GET /api/differential/me
router.get('/me', async (req, res) => {
  try {
    const list = await Differential.findAll({
      where: { sponsorId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(list);
  } catch (err) {
    console.error('Differential list error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
