// backend/src/services/__tests__/referralService.test.js
const { getReferralTreeByUsername, getUplineByUsername } =
  require('../referralService');
const { User } = require('../../models');

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn()
  }
}));

describe('referralService', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('getReferralTreeByUsername', () => {
    it('should build a two‑level tree', async () => {
      // root user
      const root = { id: 1, username: 'alice' };
      User.findOne.mockResolvedValueOnce(root);

      // children of root
      const bob = { id: 2, username: 'bob' };
      const carol = { id: 3, username: 'carol' };
      User.findAll = jest.fn()
        .mockResolvedValueOnce([bob, carol])    // first build(root)
        .mockResolvedValueOnce([])    // build(bob)
        .mockResolvedValueOnce([]);   // build(carol)

      const tree = await getReferralTreeByUsername('alice');
      expect(tree).toEqual({
        id: 1,
        username: 'alice',
        referrals: [
          { id: 2, username:'bob',   referrals: [] },
          { id: 3, username:'carol', referrals: [] }
        ]
      });
    });
  });

  describe('getUplineByUsername', () => {
    it('should walk up until no sponsorCode', async () => {
      // alice → bob → root
      const alice = { id: 1, username:'alice', sponsorCode:'bob' };
      const bob   = { id: 2, username:'bob',   sponsorCode:'root' };
      const root  = { id: 3, username:'root',  sponsorCode:null };

      User.findOne
        .mockResolvedValueOnce(alice)
        .mockResolvedValueOnce(bob)
        .mockResolvedValueOnce(root);

      const chain = await getUplineByUsername('alice');
      expect(chain).toEqual([
        { id:2, username:'bob' },
        { id:3, username:'root' }
      ]);
    });
  });
});
