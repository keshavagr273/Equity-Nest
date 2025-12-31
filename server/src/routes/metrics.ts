import { Router, Request, Response } from 'express';
import { SessionReliabilityTracker } from '../util/sessionMetrics';
import isAuthenticate from '../middlewares/isAuth';

const router = Router();

// Get session reliability metrics
router.get('/session-stats', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await SessionReliabilityTracker.getSessionStats(days);
    const avgDuration = await SessionReliabilityTracker.getAverageSessionDuration(days);

    return res.status(200).json({
      ...stats,
      averageSessionDuration: `${avgDuration} minutes`,
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    return res.status(500).json({ error: 'Failed to get session statistics' });
  }
});

// Get session reliability percentage
router.get('/reliability', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const reliability = await SessionReliabilityTracker.calculateReliability(days);

    return res.status(200).json({
      reliability: `${reliability}%`,
      period: `Last ${days} days`,
      meetsTarget: reliability >= 99.9 ? 'Yes ✅' : 'No ❌',
    });
  } catch (error) {
    console.error('Error calculating reliability:', error);
    return res.status(500).json({ error: 'Failed to calculate reliability' });
  }
});

// Cleanup old session records (admin only)
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const deletedCount = await SessionReliabilityTracker.cleanupOldSessions();
    return res.status(200).json({
      message: 'Cleanup completed',
      deletedSessions: deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return res.status(500).json({ error: 'Failed to cleanup sessions' });
  }
});

export default router;
