// src/services/lendingService.js
const { Lending, Stake, Wallet } = require('../models');

async function requestLending(userId, usdAmount) {
  // require zero withdrawals history
  const hasWithd = await Wallet.findOne({ where:{ userId, availableDirect:{[Op.gt]:0} }});
  if (hasWithd) throw new Error('Cannot lend after withdrawals');

  // check staked USD available
  const stake = await Stake.findOne({where:{ userId }});
  if (!stake) throw new Error('No stake');
  const stakedUsd = Number(stake.amountUsd);
  if (usdAmount > stakedUsd * 0.5) throw new Error('Over 50% of stake');

  // create lending
  const lend = await Lending.create({
    userId,
    amountUsd: usdAmount,
    startedAt: new Date()
  });
  // unlock tokens by decrementing stake.amountUsd
  stake.amountUsd = stakedUsd - usdAmount;
  await stake.save();
  return lend;
}

async function repayLending(id) {
  const lend = await Lending.findByPk(id);
  if (!lend || lend.status!=='active') throw new Error('Invalid lending');
  // calculate interest: 8% per day, days held
  const days = Math.floor((Date.now()-new Date(lend.startedAt))/86400e3);
  const interest = Number(lend.amountUsd) * 0.08 * days;
  // re-lock stake
  const stake = await Stake.findOne({where:{ userId:lend.userId }});
  stake.amountUsd = Number(stake.amountUsd) + Number(lend.amountUsd) + interest;
  await stake.save();
  lend.status = 'closed';
  await lend.save();
  return { principal:lend.amountUsd, interest };
}

module.exports = { requestLending, repayLending };
