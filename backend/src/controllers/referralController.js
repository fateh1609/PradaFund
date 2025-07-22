// backend/src/controllers/referralController.js
const {
  getReferralTreeByUsername,
  getUplineByUsername
} = require('../services/referralService');
const { User, Wallet } = require('../models');

/**
 * GET /api/referrals/tree/:username?
 */
async function tree(req, res) {
  try {
    let username = req.params.username;
    if (!username) {
      const me = await User.findByPk(req.user.id, { attributes: ['username'] });
      if (!me) return res.status(404).json({ error: 'User not found' });
      username = me.username;
    }
    const data = await getReferralTreeByUsername(username);
    res.json(data);
  } catch (err) {
    console.error('Referral tree error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/referrals/upline/:username?
 */
async function upline(req, res) {
  try {
    let username = req.params.username;
    if (!username) {
      const me = await User.findByPk(req.user.id, { attributes: ['username'] });
      if (!me) return res.status(404).json({ error: 'User not found' });
      username = me.username;
    }
    const chain = await getUplineByUsername(username);
    res.json({ upline: chain });
  } catch (err) {
    console.error('Referral upline error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/referral/income
 * Returns direct‐referral balances from Wallet.availableDirect / frozenDirect
 */
async function income(req, res) {
  try {
    const userId = req.user.id;
    const [wallet] = await Wallet.findOrCreate({
      where: { userId }
    });
    res.json({
      available: Number(wallet.availableDirect || 0),
      frozen:    Number(wallet.frozenDirect    || 0)
    });
  } catch (err) {
    console.error('Referral income error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { tree, upline, income };
