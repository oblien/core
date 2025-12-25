/**
 * Production Example with Redis
 * For distributed systems and high-traffic applications
 */

import express from 'express';
import { createClient } from 'redis';
import { OblienClient } from 'oblien';
import { OblienChat, RedisStorage } from 'oblien/chat';

const app = express();
app.use(express.json());

// Initialize Redis client
const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis reconnection failed');
                return new Error('Too many retries');
            }
            return retries * 100; // Exponential backoff
        },
    },
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('✓ Redis connected'));
redis.on('reconnecting', () => console.log('↻ Redis reconnecting'));

await redis.connect();

// Initialize Oblien with Redis storage
const client = new OblienClient({
    apiKey: process.env.OBLIEN_API_KEY,
    apiSecret: process.env.OBLIEN_API_SECRET,
});

const chat = new OblienChat(client, {
    guestStorage: new RedisStorage(redis),
    guestTTL: 86400, // 24 hours
    onGuestCreated: (guest) => {
        console.log('New guest created:', guest.id);
        // Optional: Send to analytics, logging, etc.
    },
});

/**
 * Create guest session
 * Stores guest info in Redis for shared access across servers
 */
app.post('/api/guest-session', async (req, res) => {
    try {
        const { agentId } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const session = await chat.createGuestSession({
            ip,
            agentId,
            metadata: {
                userAgent: req.headers['user-agent'],
                referrer: req.headers['referer'],
                timestamp: new Date().toISOString(),
            },
        });

        // Cache session in Redis for quick lookup
        await redis.setEx(
            `session:${session.sessionId}`,
            3600, // 1 hour
            JSON.stringify(session)
        );

        res.json({ success: true, session });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get guest stats (from Redis)
 */
app.get('/api/guest-stats', async (req, res) => {
    try {
        const guests = await chat.getAllGuests();
        
        const stats = {
            total: guests.length,
            active: guests.filter(g => {
                const lastSeen = new Date(g.lastSeen);
                const hourAgo = Date.now() - (60 * 60 * 1000);
                return lastSeen.getTime() > hourAgo;
            }).length,
            withSessions: guests.filter(g => g.sessions.length > 0).length,
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Scheduled cleanup job
 * Run this periodically (e.g., via cron or setInterval)
 */
async function cleanupJob() {
    try {
        console.log('Running cleanup job...');
        const cleaned = await chat.cleanupGuests();
        console.log(`✓ Cleaned up ${cleaned} expired guests`);
    } catch (error) {
        console.error('Cleanup job error:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupJob, 60 * 60 * 1000);

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await redis.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await redis.quit();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Redis storage enabled`);
    console.log(`✓ Guest sessions will persist across restarts`);
});
