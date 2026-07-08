import cron from 'node-cron';
import pool from '../config/database';
import logger from './logger';

export const initCronJobs = (): void => {
  // Run End-of-Day Sweep at 3:00 AM every day
  cron.schedule('0 3 * * *', async () => {
    logger.info('🧹 [CRON] Starting End-of-Day Sweep...');
    try {
      // 1. Archive Completed/Cancelled Orders older than 24 hours
      const orderResult = await pool.query(`
        UPDATE orders 
        SET is_archived = true 
        WHERE status IN ('completed', 'cancelled') 
        AND updated_at < NOW() - INTERVAL '24 hours'
        AND is_archived = false
      `);
      logger.info(`🧹 [CRON] Swept ${orderResult.rowCount} orders into history.`);

      // 2a. Auto No-Show: Mark any unfulfilled reservations from past dates as 'no-show' and archive them.
      const noShowResult = await pool.query(`
        UPDATE reservations 
        SET status = 'no-show', is_archived = true 
        WHERE status IN ('pending', 'confirmed') 
        AND date < CURRENT_DATE
        AND is_archived = false
      `);
      logger.info(`🧹 [CRON] Auto-marked ${noShowResult.rowCount} unfulfilled past reservations as no-show.`);

      // 2b. Archive Completed/Cancelled Reservations from past dates
      const resResult = await pool.query(`
        UPDATE reservations 
        SET is_archived = true 
        WHERE status IN ('completed', 'cancelled', 'no-show') 
        AND date < CURRENT_DATE
        AND is_archived = false
      `);
      logger.info(`🧹 [CRON] Swept ${resResult.rowCount} completed/cancelled reservations into history.`);
      
    } catch (error) {
      logger.error('❌ [CRON] Error during End-of-Day Sweep:', error);
    }
  });
  
  logger.info('✅ Cron jobs initialized. End-of-Day sweep scheduled for 3:00 AM.');
};
