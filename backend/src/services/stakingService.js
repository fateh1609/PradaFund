// backend/src/services/stakingService.js
const { Stake, Wallet } = require('../models');
const { lockUserTokens } = require('../utils/pradaLocker');
const dayjs = require('dayjs');

const PLANS = {
  BR: { min: 100,    max: 499,   mroi: 3.5, lock: 60 },
  SI: { min: 500,    max: 999,   mroi: 4.5, lock: 55 },
  GO: { min: 1000,   max: 2499,  mroi: 5.5, lock: 50 },
  PL: { min: 2500,   max: 4999,  mroi: 6.5, lock: 45 },
  DI: { min: 5000,   max: 9999,  mroi: 7.5, lock: 45 },
  IN: { min: 10000,  max: 1e18,  mroi: 8.5, lock: 35 }
};

function pickPlan(amountUsd) {
  return Object.entries(PLANS).find(([, p]) => amountUsd >= p.min && amountUsd <= p.max);
}

async function createStake(user, amountUsd) {
  const match = pickPlan(amountUsd);
  if (!match) throw new Error('Amount does not fit any package');
  const [planCode, plan] = match;

  // 1. Calculate PRADA tokens
  const pradaTokens = +(amountUsd / 0.10).toFixed(6);

  // 2. Lock on‑chain
  const txHash = await lockUserTokens(user.walletAddress, pradaTokens);

  // 3. Persist in DB
  const stake = await Stake.create({
    userId:          user.id,
    planCode,
    amountUsd,
    amountPrada:     pradaTokens,
    baseMonthlyRoi:  plan.mroi,
    startDate:       new Date(),
    lockEnds:        dayjs().add(plan.lock, 'day').toDate(),
    roiCap:          amountUsd * 2.5,
    totalCap:        amountUsd * 4
  });

  // 4. Ensure wallet row exists
  await Wallet.findOrCreate({ where: { userId: user.id } });

  return { stake, txHash };
}

async function getUserStakes(user) {
  const stakes = await Stake.findAll({
    where: { userId: user.id },
    order: [['start_date', 'DESC']]
  });
  return stakes;
}

module.exports = { createStake, getUserStakes };
