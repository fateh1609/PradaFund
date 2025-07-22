// backend/src/controllers/walletController.js
const { getWalletInfo, unlockAllTokens } = require('../services/walletService');

async function getWallet(req, res) {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User walletAddress not set' });
    }
    const info = await getWalletInfo(req.user);
    res.json(info);
  } catch (err) {
    console.error('getWallet error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function unlockAll(req, res) {
  try {
    if (!req.user.walletAddress) {
      return res.status(400).json({ error: 'User walletAddress not set' });
    }
    const txHash = await unlockAllTokens(req.user);
    res.json({ txHash });
  } catch (err) {
    console.error('unlockAll error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getWallet, unlockAll };
