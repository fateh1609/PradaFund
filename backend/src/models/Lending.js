// src/models/Lending.js
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Lending', {
    userId:    { type: DataTypes.BIGINT, allowNull:false, field:'user_id' },
    amountUsd: { type: DataTypes.DECIMAL(24,6), allowNull:false, field:'amount_usd' },
    startedAt: { type: DataTypes.DATE, allowNull:false, field:'started_at' },
    status:    { type: DataTypes.ENUM('active','closed'), defaultValue:'active' }
  },{
    tableName:'lendings', underscored:true, timestamps:true
  });
