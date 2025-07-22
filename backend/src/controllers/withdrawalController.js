const { Withdrawal, Wallet, User } = require('../models');
const { sendPradaTokens } = require('../utils/pradaTransfer');
const { ethers } = require('ethers');
require('dotenv').config();

// Setup provider and signer again here (for balance checks)
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL);
const devWallet = new ethers.Wallet(process.env.DEV_WALLET_PRIVATE_KEY, provider);

exports.requestWithdrawal = async (req, res) => {
  const userId = req.user.id;
  const { amount, type } = req.body;

  if (!amount || !type) return res.status(400).json({ error: 'Missing fields' });

  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const available =
    type === 'ROI'    ? Number(wallet.availableRoi || 0) :
    type === 'Direct' ? Number(wallet.availableDirect || 0) :
    Number(wallet.availableRoi || 0) + Number(wallet.availableDirect || 0);

  if (amount > available) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const user = await User.findByPk(userId);
  if (!user.walletAddress) {
    return res.status(400).json({ error: 'No wallet address set' });
  }

  // Convert USD to PRADA tokens
  const tokenAmount = (Number(amount) * 10).toString(); // 1 USD = 10 PRADA

  try {
    // Check BNB balance for gas
    const gasBalance = await provider.getBalance(devWallet.address);
    if (Number(ethers.formatEther(gasBalance)) < 0.0003) {
      return res.status(503).json({ error: 'Insufficient BNB for gas, try again later' });
    }

    // Send tokens immediately
    const txHash = await sendPradaTokens(user.walletAddress, tokenAmount);

    // Deduct balance only after success
    if (type === 'ROI') wallet.availableRoi -= amount;
    else if (type === 'Direct') wallet.availableDirect -= amount;
    else {
      let remain = amount;
      const roi = Math.min(wallet.availableRoi, remain);
      wallet.availableRoi -= roi;
      remain -= roi;
      wallet.availableDirect -= remain;
    }

    await wallet.save();

    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      type,
      status: 'Paid',
      txHash,
      notes: 'Auto-approved and executed'
    });

    res.json({ success: true, txHash, withdrawal });
  } catch (err) {
    console.error('❌ Withdrawal failed:', err.message);
    res.status(503).json({ error: 'Unable to process now, try again later' });
  }
};

exports.getMyWithdrawals = async (req, res) => {
  const userId = req.user.id;
  const list = await Withdrawal.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });
  res.json(list);
};
