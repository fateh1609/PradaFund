// backend/src/models/differentialModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Differential', {
    sponsorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'sponsor_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    },
    stakeId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'stake_id'
    },
    amountUsd: {
      type: DataTypes.DECIMAL(24, 6),
      allowNull: false,
      field: 'amount_usd'
    }
  }, {
    tableName:  'differentials',
    timestamps: true,
    underscored: true
  });
