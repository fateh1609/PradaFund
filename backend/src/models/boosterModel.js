// backend/src/models/boosterModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Booster', {
    userId:     { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
    percent:    { type: DataTypes.DECIMAL(5,2), allowNull: false }, // 25.00, 50.00, 100.00
    startDate:  { type: DataTypes.DATE, allowNull: false, field: 'start_date' },
    endDate:    { type: DataTypes.DATE, allowNull: false, field: 'end_date' },
    active:     { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'boosters',
    timestamps: true,
    underscored: true
  });
