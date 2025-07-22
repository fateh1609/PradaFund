// backend/src/services/creditService.js
const { Wallet, User, Stake } = require('../models');
const { getUplineByUsername } = require('./referralService');

// Rank definitions from your plan
const RANKS = [
  { name: 'Initiate',    volume:    0, diffPct:  6, bonusPct:  0, levels:   1 },
  { name: 'Builder',     volume: 3000, diffPct:  9, bonusPct:  3, levels:   5 },
  { name: 'Connector',   volume: 7500, diffPct: 12, bonusPct:  3, levels:   9 },
  { name: 'Influencer',  volume:15000, diffPct: 15, bonusPct:  3, levels:  11 },
  { name: 'Networker',   volume:25000, diffPct: 17, bonusPct:  2, levels:  13 },
  { name: 'Rainmaker',   volume:50000, diffPct: 19, bonusPct:  2, levels:  18 },
  { name: 'Trailblazer', volume:100000,diffPct: 19, bonusPct:  0, levels:  24 },
  { name: 'Vanguard',    volume:500000,diffPct: 21, bonusPct:  2, levels:  26 },
  { name: 'Mogul',       volume:1000000,diffPct:22, bonusPct:  1, levels:  30 },
  { name: 'Tycoon',      volume:5000000,diffPct:23, bonusPct:  1, levels:  34 },
  { name: 'Legacy Maker',volume:10000000,diffPct:23,bonusPct:  0, levels: Infinity }
];

// find highest rank a user qualifies for based on total self+team volume
function findUserRank(totalVolume) {
  // RANKS sorted by ascending volume
  return [...RANKS].reverse().find(r => totalVolume >= r.volume) || RANKS[0];
}

/**
 * Credit differential income for a stake ROI event.
 *  - For each upline within their max levels, credit roiUsd * (their diffPct/100)
 */
async function creditDifferential(stake, roiUsd) {
  // 1) get downline's sponsor chain [ { username, level }, … ]
  const uplineList = await getUplineByUsername(stake.user.username);
  let totalCredited = 0;

  for (const { username, level } of uplineList) {
    const u = await User.findOne({ where: { username }, attributes:['id'] });
    if (!u) continue;

    // fetch this upline's total team volume (self + downline)
    // simple version: sum all stakes where SponsorCode=username
    const teamVolume = await Stake.sum('amountUsd', {
      where: { userId: u.id }
    }) || 0;

    // determine their rank & diffPct
    const { diffPct, levels: maxLvl } = findUserRank(teamVolume);
    if (level > maxLvl) continue;        // beyond their paid levels

    // credit differential: roiUsd * diffPct / 100
    const diffAmount = (roiUsd * diffPct) / 100;
    const wallet = await Wallet.findOrCreate({ where: { userId: u.id } })
                              .then(([w]) => w);
    await wallet.creditDifferential(diffAmount);
    totalCredited += diffAmount;
    console.log(`→ Differential: ${username} lvl${level} +$${diffAmount.toFixed(2)} (${diffPct}%)`);
  }

  console.log(`✅ Differential income total: $${totalCredited.toFixed(2)}`);
  return totalCredited;
}

/**
 * (Optional) Implement rank bonus payouts here, based on your bonusAdd‑on %.
 * You can schedule this to run monthly, for example.
 */
async function creditRankBonuses() {
  // … your rank‐bonus logic …
}

module.exports = {
  creditDifferential,
  creditRankBonuses
};
