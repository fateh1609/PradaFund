// backend/src/services/__tests__/stakingService.test.js
const { createStake, getUserStakes } = require('../stakingService');
const pradaLocker = require('../../utils/pradaLocker');
const { Stake, Wallet } = require('../../models');

// Mock the pradaLocker utility and the Sequelize models
jest.mock('../../utils/pradaLocker');
jest.mock('../../models', () => ({
  Stake: { create: jest.fn(), findAll: jest.fn() },
  Wallet: { findOrCreate: jest.fn() }
}));

describe('stakingService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createStake', () => {
    it('should lock tokens, create a Stake, and ensure Wallet exists', async () => {
      const fakeUser = { id: 1, walletAddress: '0xabc123' };
      const amountUsd = 1000;

      // Arrange: mock on-chain lock and DB calls
      pradaLocker.lockUserTokens.mockResolvedValue('0xtxhash123');
      const mockStake = { id: 42, planCode: 'GO', amountUsd, amountPrada: 10000 };
      Stake.create.mockResolvedValue(mockStake);
      Wallet.findOrCreate.mockResolvedValue();

      // Act
      const result = await createStake(fakeUser, amountUsd);

      // Assert on-chain call
      expect(pradaLocker.lockUserTokens)
        .toHaveBeenCalledWith(fakeUser.walletAddress, 10000);

      // Assert DB record creation
      expect(Stake.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: fakeUser.id,
        planCode: 'GO',
        amountUsd,
        amountPrada: 10000,
        baseMonthlyRoi: 5.5,
        roiCap: amountUsd * 2.5,
        totalCap: amountUsd * 4
      }));

      // Assert wallet row
      expect(Wallet.findOrCreate)
        .toHaveBeenCalledWith({ where: { userId: fakeUser.id } });

      // Assert return value
      expect(result).toEqual({ stake: mockStake, txHash: '0xtxhash123' });
    });

    it('should throw if amountUsd is out of any plan range', async () => {
      const fakeUser = { id: 1, walletAddress: '0xabc123' };
      await expect(createStake(fakeUser, 50))
        .rejects
        .toThrow('Amount does not fit any package');
    });
  });

  describe('getUserStakes', () => {
    it('should retrieve stakes sorted by start_date descending', async () => {
      const fakeUser = { id: 5 };
      const stakesMock = [{ id: 2 }, { id: 1 }];
      Stake.findAll.mockResolvedValue(stakesMock);

      const stakes = await getUserStakes(fakeUser);

      expect(Stake.findAll).toHaveBeenCalledWith({
        where: { userId: fakeUser.id },
        order: [['start_date', 'DESC']]
      });
      expect(stakes).toBe(stakesMock);
    });
  });
});
