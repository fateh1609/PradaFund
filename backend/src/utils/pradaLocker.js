// backend/src/utils/pradaLocker.js
const { ethers } = require('ethers');
const pradaAbi   = require('../abi/prada.json');

function rpcUrl() {
  const url =
    process.env.INFURA_RPC_URL ||
    process.env.BSC_RPC_URL ||
    process.env.BSC_RPC ||
    'https://bsc-dataseed.binance.org';
  return url;
}

function getPradaContract() {
  const provider = new ethers.JsonRpcProvider(rpcUrl());
  const signer   = new ethers.Wallet(process.env.DEV_WALLET_PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.PRADA_TOKEN_ADDRESS, pradaAbi, signer);
}

async function lockUserTokens(userAddress, pradaAmount) {
  const prada = getPradaContract();
  const amt   = ethers.parseUnits(pradaAmount.toString(), 18);
  const tx    = await prada.lockTokens(userAddress, amt);
  await tx.wait();
  return tx.hash;
}

async function unlockUserTokens(userAddress, pradaAmount) {
  const prada = getPradaContract();
  const amt   = ethers.parseUnits(pradaAmount.toString(), 18);
  const tx    = await prada.unlockTokens(userAddress, amt);
  await tx.wait();
  return tx.hash;
}

async function getAccountInfo(userAddress) {
  const prada = getPradaContract();
  const [totalBalance, locked, unlocked, isLocked] =
    await prada.getAccountInfo(userAddress);
  return {
    total:    Number(ethers.formatUnits(totalBalance, 18)),
    locked:   Number(ethers.formatUnits(locked,       18)),
    unlocked: Number(ethers.formatUnits(unlocked,     18)),
    isLocked
  };
}

module.exports = { lockUserTokens, unlockUserTokens, getAccountInfo };
