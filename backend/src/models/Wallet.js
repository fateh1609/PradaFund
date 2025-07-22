const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('Wallet', {
    userId:       { type: DataTypes.BIGINT, allowNull:false, field:'user_id' },
    availableRoi: { type: DataTypes.DECIMAL(24,6), defaultValue:0, field:'avail_roi' },
    frozenRoi:    { type: DataTypes.DECIMAL(24,6), defaultValue:0, field:'frozen_roi' },
    totalEarned:  { type: DataTypes.DECIMAL(24,6), defaultValue:0, field:'total_earned' }
  }, { tableName:'wallets', timestamps:true, underscored:true });

  /**
   * Credit daily ROI respecting 2.5× stake cap and 4× overall cap.
   * @param {Stake} stake  – Sequelize stake instance
   * @param {number} usd   – USD amount to credit
   * @returns {number}     – actual credited amount
   */
  Wallet.prototype.creditRoi = async function (stake, usd) {
    // cap per‑stake
    const remainingStakeCap = Number(stake.roiCap) - Number(stake.paidOutRoi);
    // cap across ALL incomes
    const remainingTotalCap = Number(stake.totalCap) - Number(stake.paidOutTotal);

    const room = Math.max(0, Math.min(remainingStakeCap, remainingTotalCap));
    if (room === 0) {
      stake.active = false;
      await stake.save();
      return 0;
    }

    const credit = Math.min(room, usd);

    // move to frozen side first (released weekly)
    this.frozenRoi    = Number(this.frozenRoi) + credit;
    this.totalEarned  = Number(this.totalEarned) + credit;
    await this.save();

    // update stake ledger
    stake.paidOutRoi   = Number(stake.paidOutRoi)   + credit;
    stake.paidOutTotal = Number(stake.paidOutTotal) + credit;
    if (stake.paidOutRoi >= Number(stake.roiCap)) stake.active = false;
    await stake.save();

    return credit;
  };

  return Wallet;
};
