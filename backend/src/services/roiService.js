// backend/src/services/roiService.js

const { Stake, Wallet, User } = require('../models');
const { Op }                  = require('sequelize');
const { distributeDifferential } = require('./differentialService');
const { getActiveBoosterPct }    = require('./boosterService');

/**
 * Returns the number of days in the month of the given date.
 */
function getDaysInMonth(date = new Date()) {
  const year  = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return new Date(year, month, 0).getUTCDate();
}

/**
 * Daily cron:
 *  • calculate base daily ROI per stake
 *  • apply any active booster %
 *  • credit frozen ROI to user’s wallet
 *  • distribute differential income up‐line
 */
async function accrueDailyRoi() {
  const now         = new Date();
  const daysInMonth = getDaysInMonth(now);

  // fetch all active stakes, join to User for username
  const activeStakes = await Stake.findAll({
    where: { active: true },
    include: [{ model: User, attributes: ['id', 'username'] }]
  });

  console.log(`🔄 Distributing ROI for ${activeStakes.length} stake(s)...`);

  let totalCredited = 0;

  for (const stake of activeStakes) {
    const { userId, baseMonthlyRoi, amountUsd, User: user } = stake;
    const principal   = Number(amountUsd);
    const monthlyPct  = Number(baseMonthlyRoi) / 100;

    // 1) base daily ROI in USD
    const baseDaily = (principal * monthlyPct) / daysInMonth;

    // 2) booster %
    const boostPct      = await getActiveBoosterPct(userId);
    const boostedDaily  = baseDaily * (1 + boostPct / 100);

    // 3) credit to wallet.frozenRoi
    const [wallet] = await Wallet.findOrCreate({ where: { userId } });
    const credited  = await wallet.creditRoi(stake, boostedDaily);
    totalCredited += credited;

    console.log(
      `→ [${stake.planCode}] ${user.username} | ` +
      `base=${baseDaily.toFixed(4)} USD | booster=${boostPct}% → ` +
      `applied=${boostedDaily.toFixed(4)} USD | credited=${credited.toFixed(4)} USD`
    );

    // 4) distribute differential on the actual credited USD
    await distributeDifferential(user.username, credited);
  }

  console.log(`✅ ROI accrual complete. Total credited: $${totalCredited.toFixed(2)} USD`);
}

/**
 * Weekly cron:
 *   Move any frozen ROI to available ROI for stakes whose lockEnds ≤ now.
 */
async function releaseWeeklyRoi() {
  const now = new Date();

  // all stakes where lockEnds has passed
  const unlockedStakes = await Stake.findAll({
    where: {
      lockEnds: { [Op.lte]: now },
      active:   true
    }
  });

  let count = 0;

  for (const stake of unlockedStakes) {
    const { userId } = stake;
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || Number(wallet.frozenRoi) === 0) continue;

    wallet.availableRoi = Number(wallet.availableRoi) + Number(wallet.frozenRoi);
    wallet.frozenRoi    = 0;
    await wallet.save();

    count++;
    console.log(`→ ROI unlocked for userId=${userId}`);
  }

  console.log(`✅ ROI release complete. Unlocked ROI for ${count} user(s)`);
}

module.exports = {
  accrueDailyRoi,
  releaseWeeklyRoi
};
