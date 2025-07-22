// src/services/withdrawalService.js
const { Withdrawal, Wallet } = require('../models');
const { sendPradaTokens }   = require('../utils/pradaTransfer');
const { ethers }            = require('ethers');

async function processWithdrawal(withdrawal) {
  // load user wallet and balances
  const wallet = await Wallet.findOne({ where:{ userId: withdrawal.userId }});
  if (!wallet) throw new Error('No wallet');
  const usd = Number(withdrawal.amountUsd);
  if (usd > Number(wallet.availableRoi + wallet.availableDirect + wallet.availableDiff + wallet.availableRank)) {
    throw new Error('Insufficient USD balance');
  }

  // simulate on‑chain BNB check
  const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL);
  const bnbBalance = await provider.getBalance(process.env.DEV_WALLET_ADDRESS);
  if (bnbBalance < ethers.parseEther('0.001')) {
    throw new Error('Insufficient BNB for gas');
  }

  // debit from wallets: prioritize ROI → direct → diff → rank
  let remaining = usd;
  for (let field of ['availableRoi','availableDirect','availableDiff','availableRank']) {
    const have = Number(wallet[field]);
    const take = Math.min(have, remaining);
    wallet[field] = have - take;
    remaining -= take;
    if (remaining <= 1e-8) break;
  }
  await wallet.save();

  // on‑chain transfer
  const tx = await sendPradaTokens(withdrawal.user.walletAddress, withdrawal.amountUsd);
  withdrawal.status = 'completed';
  withdrawal.txHash = tx;
  await withdrawal.save();
  return tx;
}

async function requestWithdrawal(userId, usdAmount) {
  const w = await Withdrawal.create({ userId, amountUsd:usdAmount });
  // fire‑and‑forget process
  try {
    await processWithdrawal(w);
  } catch(err){
    w.status = 'failed';
    w.error  = err.message;
    await w.save();
    throw err;
  }
  return w;
}

module.exports = { requestWithdrawal };
