// src/controllers/lendingController.js
const { requestLending, repayLending } = require('../services/lendingService');

async function create(req,res){
  try{
    const lend = await requestLending(req.user.id, req.body.amountUsd);
    res.status(201).json(lend);
  }catch(e){res.status(400).json({error:e.message});}
}

async function close(req,res){
  try{
    const out = await repayLending(req.params.id);
    res.json(out);
  }catch(e){res.status(400).json({error:e.message});}
}

module.exports = { create, close };
