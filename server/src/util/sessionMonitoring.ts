import schedule from 'node-schedule';
import { SessionReliabilityTracker, SessionMetrics } from './sessionMetrics';

// Schedule job to mark expired sessions every hour
export const startSessionMonitoring = () => {
  // Mark expired sessions every hour
  schedule.scheduleJob('0 * * * *', async () => {
    try {
      const now = new Date();
      const expiredSessions = await SessionMetrics.find({
        status: 'active',
        tokenExpiration: { $lt: now },
      });

      for (const session of expiredSessions) {
        await SessionReliabilityTracker.endSession(
          session.sessionId,
          'expired'
        );
      }

      console.log(`✅ Marked ${expiredSessions.length} expired sessions`);
    } catch (error) {
      console.error('Error marking expired sessions:', error);
    }
  });

  // Cleanup old session records every day at 2 AM
  schedule.scheduleJob('0 2 * * *', async () => {
    try {
      await SessionReliabilityTracker.cleanupOldSessions();
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  });

  // Log session reliability every day at 9 AM
  schedule.scheduleJob('0 9 * * *', async () => {
    try {
      const reliability = await SessionReliabilityTracker.calculateReliability(7);
      const stats = await SessionReliabilityTracker.getSessionStats(7);
      
      console.log('\n📊 Session Reliability Report (Last 7 days):');
      console.log(`   Reliability: ${reliability}%`);
      console.log(`   Total Sessions: ${stats.totalSessions}`);
      console.log(`   Active: ${stats.activeSessions}`);
      console.log(`   Failed: ${stats.failedSessions}`);
      console.log(`   Target (99.9%): ${reliability >= 99.9 ? '✅ MET' : '❌ NOT MET'}\n`);
    } catch (error) {
      console.error('Error generating reliability report:', error);
    }
  });

  console.log('⏰ Session monitoring scheduled jobs started');
};
