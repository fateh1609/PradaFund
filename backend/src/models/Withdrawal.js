// src/models/Withdrawal.js
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Withdrawal', {
    userId:    { type: DataTypes.BIGINT, allowNull: false, field:'user_id' },
    amountUsd: { type: DataTypes.DECIMAL(24,6), allowNull: false, field:'amount_usd' },
    status:    { type: DataTypes.ENUM('pending','processing','completed','failed'),
                 allowNull: false,
                 defaultValue: 'pending'
               }
  },{
    tableName:'withdrawals',
    underscored:true,
    timestamps:true
  });
