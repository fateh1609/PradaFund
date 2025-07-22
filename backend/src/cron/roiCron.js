// backend/src/cron/roiCron.js
const cron = require('node-cron');
const { accrueDailyRoi, releaseWeeklyRoi } = require('../services/roiService');

// Schedule daily at 23:59 UTC
cron.schedule(
  '59 23 * * *',
  async () => {
    try {
      await accrueDailyRoi();
    } catch (err) {
      console.error('🚨 accrueDailyRoi error:', err);
    }
  },
  { timezone: 'UTC' }
);

// Schedule weekly on Monday at 00:00 UTC
cron.schedule(
  '0 0 * * 1',
  async () => {
    try {
      await releaseWeeklyRoi();
    } catch (err) {
      console.error('🚨 releaseWeeklyRoi error:', err);
    }
  },
  { timezone: 'UTC' }
);

console.log('🕒 ROI cron jobs scheduled (daily @23:59, weekly Mon@00:00 UTC)');
