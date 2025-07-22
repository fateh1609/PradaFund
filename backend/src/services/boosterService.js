// backend/src/services/boosterService.js
const { Booster } = require('../models');
const { Op } = require('sequelize');

/**
 * Activate a booster for U:
 *   type = '25'|'50'|'100', with corresponding days and percent.
 */
async function activateBooster(userId, type) {
  const mapping = {
    '25': { days:7,   pct:25.0 },
    '50': { days:15,  pct:50.0 },
    '100':{ days:30,  pct:100.0 }
  };
  const { days, pct } = mapping[type];
  const now = new Date(), end = new Date(Date.now()+days*86400e3);
  return await Booster.create({ userId, percent:pct, startDate:now, endDate:end });
}

/**
 * Returns total booster % for U on given date:
 */
async function getActiveBoosterPct(userId) {
  const now = new Date();
  const row = await Booster.findOne({
    where: {
      userId,
      active: true,
      startDate: { [Op.lte]: now },
      endDate:   { [Op.gte]: now }
    },
    order: [['percent','DESC']]
  });
  return row ? Number(row.percent) : 0;
}

module.exports = { activateBooster, getActiveBoosterPct };
