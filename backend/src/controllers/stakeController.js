// backend/src/controllers/stakeController.js
const { createStake, getUserStakes } = require('../services/stakingService');
const { User } = require('../models');

/**
 * POST /api/stake
 */
async function invest(req, res) {
  const amountUsd = Number(req.body.amountUsd);
  if (!amountUsd || amountUsd < 100) {
    return res.status(400).json({ error: 'amountUsd must be ≥ 100' });
  }

  const user = await User.findByPk(req.user.id);
  if (!user?.walletAddress) {
    return res.status(400).json({ error: 'User walletAddress not set' });
  }

  try {
    const { stake, txHash } = await createStake(user, amountUsd);
    res.json({ stake, txHash });
  } catch (err) {
    console.error('Invest error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/stake
 */
async function getInvestments(req, res) {
  try {
    const stakes = await getUserStakes(req.user);
    res.json({ stakes });
  } catch (err) {
    console.error('Get investments error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { invest, getInvestments };
