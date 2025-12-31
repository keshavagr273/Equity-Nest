# Session Reliability Tracking

This system tracks and calculates session reliability metrics for authentication sessions.

## Features

- **Automatic Session Tracking**: Every login (email/password or Google OAuth) creates a session record
- **Session Status Monitoring**: Tracks active, expired, failed, and logout sessions
- **Reliability Calculation**: Calculates percentage of successful sessions
- **Automated Cleanup**: Removes session records older than 90 days
- **Scheduled Reports**: Daily reliability reports in console logs

## API Endpoints

### Get Session Statistics
```bash
GET http://localhost:5000/api/metrics/session-stats?days=30
```

**Response:**
```json
{
  "totalSessions": 1250,
  "activeSessions": 45,
  "expiredSessions": 1150,
  "failedSessions": 5,
  "logoutSessions": 50,
  "reliability": "99.6%",
  "period": "Last 30 days",
  "averageSessionDuration": "180 minutes"
}
```

### Get Reliability Percentage
```bash
GET http://localhost:5000/api/metrics/reliability?days=30
```

**Response:**
```json
{
  "reliability": "99.9%",
  "period": "Last 30 days",
  "meetsTarget": "Yes ✅"
}
```

### Cleanup Old Sessions (Admin)
```bash
POST http://localhost:5000/api/metrics/cleanup
```

## How It Works

### 1. Session Creation
When a user logs in (signin, signup, or OAuth), the system:
- Generates a unique `sessionId`
- Includes it in the JWT token
- Creates a `SessionMetrics` record with:
  - User ID
  - Session ID
  - Token expiration time
  - IP address
  - User agent
  - Status: `active`

### 2. Session Tracking
Sessions can end with different statuses:
- **`expired`**: Token expired naturally (12 hours)
- **`logout`**: User manually logged out
- **`failed`**: Token validation failed (invalid/tampered)

### 3. Reliability Calculation
```
Reliability = (Successful Sessions / Total Sessions) × 100
```
Where **Successful Sessions** = `expired` + `logout` statuses

### 4. Automated Monitoring
Scheduled jobs run automatically:
- **Every hour**: Mark expired sessions
- **Daily at 2 AM**: Cleanup old records (90+ days)
- **Daily at 9 AM**: Log reliability report

## Database Schema

```typescript
SessionMetrics {
  userId: ObjectId,
  sessionId: String (unique),
  startTime: Date,
  endTime: Date,
  status: 'active' | 'expired' | 'failed' | 'logout',
  tokenExpiration: Date,
  failureReason: String,
  ipAddress: String,
  userAgent: String
}
```

## Monitoring in Production

### Check Current Reliability
```bash
curl http://localhost:5000/api/metrics/reliability?days=7
```

### View Daily Console Reports
Every day at 9 AM, check server logs for:
```
📊 Session Reliability Report (Last 7 days):
   Reliability: 99.9%
   Total Sessions: 850
   Active: 12
   Failed: 1
   Target (99.9%): ✅ MET
```

## Achieving 99.9% Reliability

To maintain 99.9% reliability:
1. **Minimize token failures**: Ensure `PRIVATE_KEY` is stable
2. **Handle expired sessions**: They count as successful
3. **Monitor failed sessions**: Investigate causes if > 0.1%
4. **Server uptime**: Use proper hosting with high availability

## Testing

After implementing this system, you need actual users to generate meaningful metrics:
- **100 users with 10 sessions each** = 1,000 sessions minimum
- With < 1 failure per 1,000 sessions = 99.9% reliability


