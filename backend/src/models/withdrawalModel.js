// backend/src/models/withdrawalModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Withdrawal',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'user_id'
      },
      amountPrada: {
        type: DataTypes.DECIMAL(24, 6),
        allowNull: false,
        field: 'amount_prada'
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      txHash: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'tx_hash'
      }
    },
    {
      tableName: 'withdrawals',
      timestamps: true,
      underscored: true
    }
  );
};
