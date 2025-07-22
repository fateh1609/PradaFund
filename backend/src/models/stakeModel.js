// backend/src/models/stakeModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Stake',
    {
      userId:        { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
      planCode:      { type: DataTypes.STRING(4), allowNull: false, field: 'plan_code' },
      amountUsd:     { type: DataTypes.DECIMAL(24, 6), allowNull: false, field: 'amount_usd' },
      amountPrada:   { type: DataTypes.DECIMAL(24, 6), allowNull: false, field: 'amount_prada' },
      baseMonthlyRoi:{ type: DataTypes.DECIMAL(5,  2), allowNull: false, field: 'base_monthly_roi' },
      startDate:     { type: DataTypes.DATE,        allowNull: false, field: 'start_date' },
      lockEnds:      { type: DataTypes.DATE,        allowNull: false, field: 'lock_ends' },
      roiCap:        { type: DataTypes.DECIMAL(24, 6), allowNull: false, field: 'roi_cap' },
      totalCap:      { type: DataTypes.DECIMAL(24, 6), allowNull: false, field: 'total_cap' },
      paidOutRoi:    { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'paid_out_roi' },
      paidOutTotal:  { type: DataTypes.DECIMAL(24, 6), defaultValue: 0, field: 'paid_out_total' },
      active:        { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    { tableName: 'stakes', timestamps: true, underscored: true }
  );
