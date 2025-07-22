// backend/src/index.js
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');

const { sequelize } = require('./models');

// 1) Connect & sync DB (with alter to pick up any new columns)
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Database connected and synced (with alter)');

    // 2) Run your startup tasks (seeding users, blockchain init, etc)
    require('./startup');

    // 3) Schedule ROI cron jobs
    require('./cron/roiCron');
    console.log('🕒 ROI cron jobs scheduled (daily @23:59, weekly Mon@00:00 UTC)');

    // 4) Launch Express
    const app = express();
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    app.use(bodyParser.json());
    app.use('/api/sale',        require('./routes/sale'));
    // 5) Mount your routers
    app.use('/api/auth',        require('./routes/auth'));

    app.use('/api/stake',       require('./routes/stake'));
    app.use('/api/referrals',   require('./routes/referral'));
    app.use('/api/wallet',      require('./routes/wallet'));
    app.use('/api/roi',         require('./routes/roi'));
    app.use('/api/withdrawals', require('./routes/withdrawal'));
    app.use('/api/lend',        require('./routes/lending'));
    app.use('/api/admin',       require('./routes/admin'));

    // Health check
    app.get('/', (req, res) => res.send('PradaFund Backend is running'));

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start application:', err);
    process.exit(1);
  }
})();
