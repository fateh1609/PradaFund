// backend/src/services/referralService.js
const { User, Wallet } = require('../models');

/**
 * Build the down-line tree for a given username.
 * (Your existing implementation goes here.)
 */
async function getReferralTreeByUsername(username) {
  // Example placeholder logic:
  // const root = await User.findOne({ where:{ username } });
  // ... traverse children via sponsorCode ...
  // return { username: root.username, referrals: [...] };
  throw new Error('getReferralTreeByUsername not implemented');
}

/**
 * Build the upline chain for a given username.
 * (Your existing implementation goes here.)
 */
async function getUplineByUsername(username) {
  // Example placeholder logic:
  // let chain = [];
  // let current = await User.findOne({ where:{ username } });
  // while (current.sponsorCode) {
  //   const sp = await User.findOne({ where:{ username: current.sponsorCode }});
  //   chain.push(sp.username);
  //   current = sp;
  // }
  // return chain;
  throw new Error('getUplineByUsername not implemented');
}

/**
 * On a new user stake, credit 7.5% of that USD amount
 * to the sponsor’s wallet.frozenDirect balance.
 * Returns { sponsorId, credit }.
 */
async function creditOnStake(newUserId, stakeUsd) {
  // 1) find the new user
  const newUser = await User.findByPk(newUserId);
  if (!newUser || !newUser.sponsorCode) {
    return { sponsorId: null, credit: 0 };
  }

  // 2) find their sponsor by username
  const sponsor = await User.findOne({
    where: { username: newUser.sponsorCode }
  });
  if (!sponsor) {
    return { sponsorId: null, credit: 0 };
  }

  // 3) get or create sponsor's wallet
  const [wallet] = await Wallet.findOrCreate({
    where: { userId: sponsor.id }
  });

  // 4) credit direct referral commission
  const credit = await wallet.creditDirect(stakeUsd);

  return { sponsorId: sponsor.id, credit };
}

module.exports = {
  getReferralTreeByUsername,
  getUplineByUsername,
  creditOnStake
};
