// backend/src/services/rankService.js
const { User } = require('../models');

// Rank definitions:
const RANKS = [
  { name:'Initiate',    volume:    0, diffPct:  6, bonus: 0, levels:  1 },
  { name:'Builder',     volume: 3000, diffPct:  9, bonus: 3, levels:  5 },
  { name:'Connector',   volume: 7500, diffPct: 12, bonus: 3, levels:  9 },
  { name:'Influencer',  volume:15000, diffPct: 15, bonus: 3, levels: 11 },
  { name:'Networker',   volume:25000, diffPct: 17, bonus: 2, levels: 13 },
  { name:'Rainmaker',   volume:50000, diffPct: 19, bonus: 2, levels: 18 },
  { name:'Trailblazer', volume:100000,diffPct: 19, bonus: 0, levels: 24 },
  { name:'Vanguard',    volume:500000,diffPct: 21, bonus: 2, levels: 26 },
  { name:'Mogul',       volume:1000000,diffPct:22, bonus: 1, levels: 30 },
  { name:'Tycoon',      volume:5000000,diffPct:23, bonus: 1, levels: 34 },
  { name:'Legacy Maker',volume:10000000,diffPct:23,bonus:0, levels:Infinity }
];

/**
 * Determine a user's current rank by total team volume (self + downline).
 * You’ll need to implement getTeamVolume(userId) yourself—sum all investments under this tree.
 */
async function determineRank(userId) {
  const volume = await getTeamVolume(userId); // implement via referralService + stakes
  // find highest rank whose requirement <= volume
  return [...RANKS].reverse().find(r => volume >= r.volume) || RANKS[0];
}

module.exports = { determineRank };
