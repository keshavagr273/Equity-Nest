import { Schema, model } from 'mongoose';

// Session metrics schema to track reliability
const SessionMetricsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'failed', 'logout'],
    default: 'active',
  },
  tokenExpiration: {
    type: Date,
    required: true,
  },
  failureReason: {
    type: String,
  },
  ipAddress: String,
  userAgent: String,
});

export const SessionMetrics = model('SessionMetrics', SessionMetricsSchema);

// Session reliability calculator
export class SessionReliabilityTracker {
  // Calculate session success rate
  static async calculateReliability(days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
    });

    const successfulSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
      status: { $in: ['expired', 'logout'] }, // Normal endings
    });

    const failedSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
      status: 'failed',
    });

    if (totalSessions === 0) return 0;

    const reliability = (successfulSessions / totalSessions) * 100;
    return parseFloat(reliability.toFixed(2));
  }

  // Get detailed session statistics
  static async getSessionStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
    });

    const activeSessions = await SessionMetrics.countDocuments({
      status: 'active',
      tokenExpiration: { $gte: new Date() },
    });

    const expiredSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
      status: 'expired',
    });

    const failedSessions = await SessionMetrics.countDocuments({
      startDate: { $gte: startDate },
      status: 'failed',
    });

    const logoutSessions = await SessionMetrics.countDocuments({
      startTime: { $gte: startDate },
      status: 'logout',
    });

    const reliability = await this.calculateReliability(days);

    return {
      totalSessions,
      activeSessions,
      expiredSessions,
      failedSessions,
      logoutSessions,
      reliability: `${reliability}%`,
      period: `Last ${days} days`,
    };
  }

  // Track average session duration
  static async getAverageSessionDuration(days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await SessionMetrics.find({
      startTime: { $gte: startDate },
      endTime: { $exists: true },
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      const duration =
        session.endTime!.getTime() - session.startTime.getTime();
      return sum + duration;
    }, 0);

    // Return average in minutes
    return Math.round(totalDuration / sessions.length / 1000 / 60);
  }

  // Create new session record
  static async createSession(
    userId: string,
    sessionId: string,
    tokenExpiration: Date,
    ipAddress?: string,
    userAgent?: string
  ) {
    const session = new SessionMetrics({
      userId,
      sessionId,
      tokenExpiration,
      ipAddress,
      userAgent,
      status: 'active',
    });

    await session.save();
    return session;
  }

  // Mark session as ended
  static async endSession(
    sessionId: string,
    status: 'expired' | 'failed' | 'logout',
    failureReason?: string
  ) {
    await SessionMetrics.findOneAndUpdate(
      { sessionId, status: 'active' },
      {
        endTime: new Date(),
        status,
        failureReason,
      }
    );
  }

  // Cleanup old sessions (older than 90 days)
  static async cleanupOldSessions() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const result = await SessionMetrics.deleteMany({
      startTime: { $lt: cutoffDate },
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old session records`);
    return result.deletedCount;
  }
}
