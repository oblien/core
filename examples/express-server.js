/**
 * Express Server Example
 * Complete example of using oblien-core for session management
 */

import express from 'express';
import { OblienClient, OblienChat } from 'oblien-core';

const app = express();
app.use(express.json());

// Initialize Oblien client
const client = new OblienClient({
    apiKey: process.env.OBLIEN_API_KEY,
    apiSecret: process.env.OBLIEN_API_SECRET,
});

// Initialize chat manager
const chat = new OblienChat(client);

/**
 * Create authenticated user session
 * POST /api/session
 * Body: { agentId: string, workflowId?: string }
 */
app.post('/api/session', async (req, res) => {
    try {
        const { agentId, workflowId } = req.body;

        const session = await chat.createSession({
            agentId,
            workflowId,
        });

        res.json({
            success: true,
            session,
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Create guest session based on IP
 * POST /api/guest-session
 * Body: { agentId: string, workflowId?: string }
 */
app.post('/api/guest-session', async (req, res) => {
    try {
        const { agentId, workflowId } = req.body;
        
        // Get client IP
        const ip = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.socket.remoteAddress;

        const session = await chat.createGuestSession({
            ip,
            agentId,
            workflowId,
            metadata: {
                userAgent: req.headers['user-agent'],
                referrer: req.headers['referer'],
            },
        });

        res.json({
            success: true,
            session,
        });
    } catch (error) {
        console.error('Guest session creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Get session info
 * GET /api/session/:sessionId
 */
app.get('/api/session/:sessionId', async (req, res) => {
    try {
        const session = await chat.getSession(req.params.sessionId);
        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * List all sessions
 * GET /api/sessions
 */
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await chat.listSessions({
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        });
        
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Delete session
 * DELETE /api/session/:sessionId
 */
app.delete('/api/session/:sessionId', async (req, res) => {
    try {
        await chat.deleteSession(req.params.sessionId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Get guest info by IP
 * GET /api/guest-info
 */
app.get('/api/guest-info', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.socket.remoteAddress;

        const guest = await chat.getGuestByIP(ip);
        
        if (!guest) {
            return res.json({ success: true, guest: null });
        }

        res.json({ success: true, guest });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Admin: Get all guests
 * GET /api/admin/guests
 */
app.get('/api/admin/guests', async (req, res) => {
    try {
        // Add your admin authentication here
        const guests = await chat.getAllGuests();
        res.json({ success: true, guests });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Admin: Cleanup expired guests
 * POST /api/admin/cleanup-guests
 */
app.post('/api/admin/cleanup-guests', async (req, res) => {
    try {
        // Add your admin authentication here
        const cleaned = await chat.cleanupGuests();
        res.json({ 
            success: true, 
            message: `Cleaned up ${cleaned} expired guests`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Key: ${client.apiKey ? '✓' : '✗'}`);
});
