// backend/src/services/differentialService.js
const { Wallet, User, Differential, Stake } = require('../models');
const { getUplineByUsername } = require('./referralService');
const { determineRank }       = require('./rankService');

async function distributeDifferential(username, roiUsd) {
  const chain = await getUplineByUsername(username);
  for (const { username: sponsorUsername, level } of chain) {
    const sponsor = await User.findOne({ where: { username: sponsorUsername } });
    const wallet  = await Wallet.findOne({ where: { userId: sponsor.id } });
    const rank    = await determineRank(sponsor.id);
    if (level > rank.levels) break;

    const diffIncome = (roiUsd * rank.diffPct) / 100;
    if (diffIncome <= 0) continue;

    // Credit to wallet
    await wallet.creditDirect(diffIncome);

    // Log it
    await Differential.create({
      sponsorId: sponsor.id,
      userId:    (await User.findOne({ where:{ username } })).id,
      stakeId:   (await Stake.findOne({ where:{ userId: (await User.findOne({ where:{ username } })).id, active:true } })).id,
      amountUsd: diffIncome.toFixed(6)
    });

    console.log(
      `→ Paid $${diffIncome.toFixed(2)} diff to ${sponsorUsername} ` +
      `(rank ${rank.diffPct}% lvl${level})`
    );
  }
}

module.exports = { distributeDifferential };
