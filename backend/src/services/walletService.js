// backend/src/services/walletService.js
const { Wallet }   = require('../models');
const { getAccount, unlockTokens } = require('../chain/pradaToken');

async function getWalletInfo(user) {
  const [row] = await Wallet.findOrCreate({ where: { user_id: user.id } });
  const walletRow = row.toJSON();
  const onChain = await getAccount(user.walletAddress);

  return {
    chainTotal:    onChain.total,
    chainLocked:   onChain.locked,
    chainUnlocked: onChain.unlocked,

    available: {
      roi:    walletRow.available_roi,
      direct: walletRow.available_direct,
      rank:   walletRow.available_rank
    },
    frozen: {
      roi:    walletRow.frozen_roi,
      direct: walletRow.frozen_direct,
      rank:   walletRow.frozen_rank
    },
    totalEarned:      walletRow.total_earned,
    withdrawalsCount: walletRow.withdrawals_count
  };
}

async function unlockAllTokens(user) {
  const { locked } = await getAccount(user.walletAddress);
  if (locked <= 0) throw new Error('No locked tokens to unlock');
  const txHash = await unlockTokens(user.walletAddress, locked);
  return txHash;
}

module.exports = { getWalletInfo, unlockAllTokens };
