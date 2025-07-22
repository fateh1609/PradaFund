// backend/src/startup.js
/**
 * ─────────── Routes overview ───────────
 *
 *  AUTH
 *    POST   /api/auth/register
 *    POST   /api/auth/login
 *    POST   /api/auth/verify-pin
 *    POST   /api/auth/wallet-login
 *    GET    /api/auth/me
 *    POST   /api/auth/forgot-password
 *    POST   /api/auth/reset-password
 *    POST   /api/auth/change-password
 *    POST   /api/auth/change-pin
 *    POST   /api/auth/username
 *    POST   /api/auth/email
 *    POST   /api/auth/wallet
 *    GET    /api/auth/sponsor/:code
 *
 *  SALE
 *    GET    /api/sale/…      (token sale info)
 *    POST   /api/sale/…      (purchase)
 *
 *  STAKE
 *    POST   /api/stake       (create new stake/investment)
 *    GET    /api/stake/me    (list your stakes)
 *
 *  REFERRALS
 *    GET    /api/referrals/tree/:username?
 *    GET    /api/referrals/upline/:username?
 *
 *  WALLET
 *    GET    /api/wallet/me   (get balances: ROI, direct, diff, rank)
 *    GET    /api/wallet/info/:username?
 *
 *  ROI
 *    GET    /api/roi/me      (frozen vs available ROI)
 *    GET    /api/roi/history (ROI accrual history)
 *
 *  WITHDRAWALS
 *    POST   /api/withdrawals       (request withdrawal)
 *    GET    /api/withdrawals/me    (list your withdrawals)
 *
 *  LENDING (Try 365)
 *    POST   /api/lend/request      (lend up to 50% of stake)
 *    POST   /api/lend/repay        (return borrowed + interest)
 *    GET    /api/lend/me           (lend status / history)
 *
 *  ADMIN
 *    All routes under /api/admin/* are JWT‑protected:
 *      • /api/admin/users
 *      • /api/admin/withdrawals
 *      • /api/admin/lending
 *      • …etc.
 *
 * ────────────────────────────────────────
 */

require('dotenv').config();
const bcrypt          = require('bcrypt');
const { sequelize, User, Wallet, Stake } = require('./models');
const { ethers }      = require('ethers');
const { createStake } = require('./services/stakingService');

// ──────────── ENV / Sanity ────────────
const {
  INFURA_RPC_URL,
  DEV_WALLET_PRIVATE_KEY: DEV_KEY,
  SALE_WALLET_ADDRESS:    SALE_WALLET,
  PRADA_TOKEN_ADDRESS:    PRADA_TOKEN
} = process.env;

if (!INFURA_RPC_URL || !DEV_KEY || !SALE_WALLET || !PRADA_TOKEN) {
  console.error('❌ Missing one of INFURA_RPC_URL, DEV_WALLET_PRIVATE_KEY, SALE_WALLET_ADDRESS, PRADA_TOKEN_ADDRESS');
  process.exit(1);
}

// ──────────── Helper: sendTx ────────────
async function makeTxHelper(provider, signerAddr) {
  let nonce = await provider.getTransactionCount(signerAddr, 'pending');
  const feeData = await provider.getFeeData();
  const baseGas = feeData.gasPrice || ethers.parseUnits('3', 'gwei');
  const gasPrice = baseGas * 12n / 10n;

  return async (fn, ...args) => {
    const opts = { gasPrice, nonce: nonce++ };
    try {
      const tx = await fn(...args, opts);
      console.log(`→ tx ${tx.hash} | gas ${ethers.formatUnits(gasPrice,'gwei')} gwei | nonce ${opts.nonce}`);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.warn('⚠️  Transaction failed:', err.reason || err.message);
      return null;
    }
  };
}

// ──────────── Seed Users ────────────
async function seedUsers() {
  const [ ah, uh, ph ] = await Promise.all([
    bcrypt.hash('Test@123', 12),
    bcrypt.hash('test@123', 12),
    bcrypt.hash('0000',     12),
  ]);

  const [ admin, aC ] = await User.findOrCreate({
    where: { username: 'backoffice' },
    defaults: {
      firstName: 'Admin',
      lastName:  'User',
      email:     'admin@pradafund.com',
      walletAddress: DEV_KEY,        // Dev key as admin wallet
      sponsorCode:   'backoffice',
      passwordHash:  ah,
      pinHash:       ph
    }
  });

  const [ system, sC ] = await User.findOrCreate({
    where: { username: 'system' },
    defaults: {
      firstName: 'Regular',
      lastName:  'User',
      email:     'system@pradafund.com',
      walletAddress: SALE_WALLET.toLowerCase(),
      sponsorCode:   'backoffice',
      passwordHash:  uh,
      pinHash:       ph
    }
  });

  if (!sC && !system.walletAddress) {
    system.walletAddress = SALE_WALLET.toLowerCase();
    await system.save();
    console.log('✏️  Patched system user walletAddress');
  }

  console.log(`✅ Admin user:  ${aC ? 'created' : 'exists'}`);
  console.log(`✅ System user: ${sC ? 'created' : 'exists'} (wallet: ${system.walletAddress})`);
  return system;
}

// ──────────── Ensure Wallet & Stake ────────────
async function ensureWallet(user) {
  const [ w, created ] = await Wallet.findOrCreate({ where: { userId: user.id } });
  console.log(`💰 Wallet for system user: ${created ? 'created' : 'exists'}`);
  return w;
}

async function ensureStake(user) {
  const existing = await Stake.findOne({ where: { userId: user.id } });
  if (existing) {
    console.log('🧱 Stake already exists for system user');
    return existing;
  }
  if (!user.walletAddress) {
    console.warn('⚠️  System user has no walletAddress—skipping stake creation');
    return null;
  }
  console.log('💸 Creating stake for system user: $1000');
  const { stake, txHash } = await createStake(user, 1000);
  console.log('✅ Stake created, tx:', txHash);
  return stake;
}

// ──────────── Blockchain Init (always runs) ────────────
async function blockchainInit() {
  const provider = new ethers.JsonRpcProvider(INFURA_RPC_URL);
  console.log('🧪 Connecting to RPC:', INFURA_RPC_URL);

  const signer = new ethers.Wallet(DEV_KEY, provider);
  console.log('🔐 Dev wallet:', signer.address);

  // Check BNB balance
  let bnbBal = 0n;
  try {
    bnbBal = await provider.getBalance(signer.address);
    console.log('💸 BNB balance:', ethers.formatEther(bnbBal));
  } catch (e) {
    console.warn('⚠️  Could not fetch BNB balance:', e.message);
  }
  if (bnbBal === 0n) {
    console.error('❌ Dev wallet has zero BNB; aborting on‑chain init');
    return;
  }

  const sendTx = await makeTxHelper(provider, signer.address);

  // Prepare contract
  const abi = [
    { name:'transfer',     type:'function', stateMutability:'nonpayable',
      inputs:[{type:'address'},{type:'uint256'}], outputs:[{type:'bool'}] },
    { name:'lockTokens',   type:'function', stateMutability:'nonpayable',
      inputs:[{type:'address'},{type:'uint128'}] },
    { name:'unlockTokens', type:'function', stateMutability:'nonpayable',
      inputs:[{type:'address'},{type:'uint128'}] },
    { name:'getAccountInfo', type:'function', stateMutability:'view',
      inputs:[{type:'address'}],
      outputs:[{type:'uint256'},{type:'uint128'},{type:'uint256'},{type:'bool'}]
    }
  ];
  const prada = new ethers.Contract(PRADA_TOKEN, abi, signer);
  const AMT   = ethers.parseUnits('1000', 18);

  console.log('--- STEP 1: transfer 1000 PRADA to SALE wallet ---');
  await sendTx(prada.transfer.bind(prada), SALE_WALLET, AMT);

  console.log('--- STEP 2: lock 1000 PRADA for SALE wallet ---');
  await sendTx(prada.lockTokens.bind(prada), SALE_WALLET, AMT);

  console.log('--- STEP 3: fetch locked balance ---');
  let locked = 0n;
  try {
    [, locked] = await prada.getAccountInfo(SALE_WALLET);
    console.log(`→ Locked before unlock: ${ethers.formatUnits(locked,18)} PRADA`);
  } catch (e) {
    console.warn('⚠️  getAccountInfo failed:', e.message);
  }

  console.log('--- STEP 4: unlock locked PRADA ---');
  if (locked > 0n) {
    await sendTx(prada.unlockTokens.bind(prada), SALE_WALLET, locked);
  } else {
    console.log('→ No locked tokens to unlock');
  }

  console.log('--- STEP 5: confirm unlock ---');
  try {
    [, locked] = await prada.getAccountInfo(SALE_WALLET);
    console.log(`→ Locked after unlock: ${ethers.formatUnits(locked,18)} PRADA`);
  } catch (_) {
    console.warn('⚠️  getAccountInfo failed after unlock');
  }

  console.log('✅ Blockchain init complete');
}

// ──────────── Main ────────────
(async () => {
  try {
    console.log('🔌 Connecting to DB...');
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ Database connected and synced');

    const systemUser = await seedUsers();
    await ensureWallet(systemUser);
    await ensureStake(systemUser);

    await blockchainInit();
    console.log('🎉 Startup complete');
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
})();
