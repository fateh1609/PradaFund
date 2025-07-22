// backend/src/services/__tests__/walletService.test.js
const { getWalletInfo, unlockAllTokens } = require('../walletService');
const pradaToken = require('../../chain/pradaToken');
const { Wallet } = require('../../models');

jest.mock('../../chain/pradaToken', () => ({
  getAccount: jest.fn(),
  unlockTokens: jest.fn()
}));
jest.mock('../../models', () => ({
  Wallet: { findOrCreate: jest.fn() }
}));

describe('walletService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getWalletInfo', () => {
    it('should combine on-chain and off-chain balances', async () => {
      const fakeUser = { id: 9, walletAddress: '0xabc' };
      const fakeRow = { toJSON: () => ({
        available_roi:     1,
        available_direct:  2,
        available_rank:    3,
        frozen_roi:        4,
        frozen_direct:     5,
        frozen_rank:       6,
        total_earned:      7,
        withdrawals_count: 0
      })};
      Wallet.findOrCreate.mockResolvedValue([fakeRow]);
      pradaToken.getAccount.mockResolvedValue({
        total: 100,
        locked: 20,
        unlocked: 80
      });

      const info = await getWalletInfo(fakeUser);

      expect(Wallet.findOrCreate)
        .toHaveBeenCalledWith({ where: { user_id: fakeUser.id } });
      expect(pradaToken.getAccount)
        .toHaveBeenCalledWith('0xabc');
      expect(info).toEqual({
        chainTotal:    100,
        chainLocked:   20,
        chainUnlocked: 80,
        available: {
          roi:    1,
          direct: 2,
          rank:   3
        },
        frozen: {
          roi:    4,
          direct: 5,
          rank:   6
        },
        totalEarned:      7,
        withdrawalsCount: 0
      });
    });
  });

  describe('unlockAllTokens', () => {
    it('should call unlockTokens when locked > 0', async () => {
      const fakeUser = { walletAddress: '0xdef' };
      pradaToken.getAccount.mockResolvedValue({ locked: 50 });
      pradaToken.unlockTokens.mockResolvedValue('0xtxHASH');

      const txHash = await unlockAllTokens(fakeUser);
      expect(pradaToken.unlockTokens)
        .toHaveBeenCalledWith('0xdef', 50);
      expect(txHash).toBe('0xtxHASH');
    });

    it('should throw if nothing to unlock', async () => {
      const fakeUser = { walletAddress: '0xdef' };
      pradaToken.getAccount.mockResolvedValue({ locked: 0 });
      await expect(unlockAllTokens(fakeUser))
        .rejects
        .toThrow('No locked tokens to unlock');
    });
  });
});
