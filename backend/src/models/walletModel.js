// backend/src/models/walletModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define(
    'Wallet',
    {
      // Use userId as the primary key (no separate `id` column)
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        field: 'user_id'
      },

      // ROI fields
      availableRoi:    { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'available_roi' },
      frozenRoi:       { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'frozen_roi' },
      totalEarned:     { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'total_earned' },

      // Direct referral
      availableDirect: { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'available_direct' },
      frozenDirect:    { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'frozen_direct' },

      // Differential income
      availableDiff:   { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'available_diff' },
      frozenDiff:      { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'frozen_diff' },

      // Rank income
      availableRank:   { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'available_rank' },
      frozenRank:      { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'frozen_rank' }
    },
    {
      tableName: 'wallets',
      timestamps: true,
      underscored: true
    }
  );

  // ——————————————————————————————————————
  // Instance methods (credit/release)
  // ——————————————————————————————————————

  // Credit ROI into frozenRoi
  Wallet.prototype.creditRoi = async function (stake, usdAmount) {
    // ... your existing implementation unchanged ...
  };

  // Credit 7.5% direct-referral into frozenDirect
  Wallet.prototype.creditDirect = async function (usdAmount) {
    // ... your existing implementation unchanged ...
  };

  // Credit differential income into frozenDiff
  Wallet.prototype.creditDifferential = async function (usdAmount) {
    const credit = Number(usdAmount);
    this.frozenDiff = Number(this.frozenDiff) + credit;
    await this.save();
    return credit;
  };

  // Move frozenDiff → availableDiff
  Wallet.prototype.releaseDifferential = async function () {
    this.availableDiff = Number(this.availableDiff) + Number(this.frozenDiff);
    this.frozenDiff    = 0;
    await this.save();
  };

  // Credit rank income into frozenRank
  Wallet.prototype.creditRank = async function (usdAmount) {
    const credit = Number(usdAmount);
    this.frozenRank = Number(this.frozenRank) + credit;
    await this.save();
    return credit;
  };

  // Move frozenRank → availableRank
  Wallet.prototype.releaseRank = async function () {
    this.availableRank = Number(this.availableRank) + Number(this.frozenRank);
    this.frozenRank    = 0;
    await this.save();
  };

  return Wallet;
};
