// backend/src/controllers/roiController.js
const { Stake, Wallet } = require('../models');

exports.summary = async (req, res) => {
  const userId = req.user.id;
  const stakes = await Stake.findAll({ where:{ userId } });
  const wallet = await Wallet.findOne({ where:{ userId } });

  res.json({
    stakes: stakes.map(s => ({
      id:            s.id,
      amountUsd:     Number(s.amountUsd),
      paidOutRoi:    Number(s.paidOutRoi),
      paidOutTotal:  Number(s.paidOutTotal),
      roiCap:        Number(s.roiCap),
      totalCap:      Number(s.totalCap),
      active:        s.active
    })),
    wallet: {
      availableRoi: Number(wallet?.availableRoi || 0),
      frozenRoi:    Number(wallet?.frozenRoi    || 0),
      totalEarned:  Number(wallet?.totalEarned  || 0)
    }
  });
};
