// src/controllers/adminController.js
const { User, Stake, Withdrawal, Lending } = require('../models');

async function listUsers(req,res){
  const u = await User.findAll({attributes:['id','username','email','walletAddress']});
  res.json(u);
}
async function listStakes(req,res){
  res.json(await Stake.findAll());
}
async function listWithdrawals(req,res){
  res.json(await Withdrawal.findAll());
}
async function listLendings(req,res){
  res.json(await Lending.findAll());
}

module.exports = { listUsers, listStakes, listWithdrawals, listLendings };
