// backend/src/models/index.js
'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// ──────────── Initialize Sequelize ────────────
const sequelize = new Sequelize(
  process.env.DB_NAME,     // e.g. 'pradafund'
  process.env.DB_USER,     // your DB user
  process.env.DB_PASS,     // your DB password
  {
    host:    process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

// ──────────── Import Models ────────────
const User         = require('./userModel')(sequelize, DataTypes);
const Wallet       = require('./walletModel')(sequelize, DataTypes);
const Stake        = require('./stakeModel')(sequelize, DataTypes);
const Booster      = require('./boosterModel')(sequelize, DataTypes);
const Differential = require('./differentialModel')(sequelize, DataTypes);

// ──────────── Define Associations ────────────
// User ←→ Wallet (1:1)
User.hasOne(Wallet,    { foreignKey: 'user_id', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

// User ←→ Stake (1:N)
User.hasMany(Stake,    { foreignKey: 'user_id', onDelete: 'CASCADE' });
Stake.belongsTo(User,  { foreignKey: 'user_id' });

// User ←→ Booster (1:N)
User.hasMany(Booster,  { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booster.belongsTo(User, { foreignKey: 'user_id' });

// Sponsor User ←→ Differential (1:N)
User.hasMany(Differential, {
  foreignKey: 'sponsor_id',
  as:         'differentials',
  onDelete:   'CASCADE'
});
Differential.belongsTo(User, {
  foreignKey: 'sponsor_id',
  as:         'sponsor'
});

// Source User ←→ Differential (1:N)
User.hasMany(Differential, {
  foreignKey: 'user_id',
  as:         'differentialSources'
});
Differential.belongsTo(User, {
  foreignKey: 'user_id',
  as:         'sourceUser'
});

// ──────────── Export ────────────
module.exports = {
  sequelize,
  Sequelize,
  User,
  Wallet,
  Stake,
  Booster,
  Differential
};
