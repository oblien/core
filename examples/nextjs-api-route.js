/**
 * Next.js API Route Example
 * pages/api/session.js or app/api/session/route.js
 */

import { OblienClient, OblienChat } from 'oblien';

// Initialize once (singleton pattern)
let chatInstance = null;

function getChat() {
    if (!chatInstance) {
        const client = new OblienClient({
            apiKey: process.env.OBLIEN_API_KEY,
            apiSecret: process.env.OBLIEN_API_SECRET,
        });
        chatInstance = new OblienChat(client);
    }
    return chatInstance;
}

// ============ App Router (Next.js 13+) ============

export async function POST(request) {
    try {
        const body = await request.json();
        const { agentId, workflowId, guest } = body;

        const chat = getChat();

        // Check if guest session
        if (guest) {
            const ip = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

            const session = await chat.createGuestSession({
                ip,
                agentId,
                workflowId,
                metadata: {
                    userAgent: request.headers.get('user-agent'),
                },
            });

            return Response.json({ success: true, session });
        }

        // Regular authenticated session
        const session = await chat.createSession({
            agentId,
            workflowId,
        });

        return Response.json({ success: true, session });
    } catch (error) {
        console.error('Session creation error:', error);
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        const chat = getChat();

        if (sessionId) {
            const session = await chat.getSession(sessionId);
            return Response.json({ success: true, session });
        }

        const sessions = await chat.listSessions();
        return Response.json({ success: true, sessions });
    } catch (error) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return Response.json(
                { success: false, error: 'Session ID required' },
                { status: 400 }
            );
        }

        const chat = getChat();
        await chat.deleteSession(sessionId);

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// ============ Pages Router (Next.js 12 and below) ============

export default async function handler(req, res) {
    const chat = getChat();

    try {
        // POST - Create session
        if (req.method === 'POST') {
            const { agentId, workflowId, guest } = req.body;

            if (guest) {
                const ip = req.headers['x-forwarded-for'] || 
                          req.headers['x-real-ip'] || 
                          req.socket.remoteAddress;

                const session = await chat.createGuestSession({
                    ip,
                    agentId,
                    workflowId,
                    metadata: {
                        userAgent: req.headers['user-agent'],
                    },
                });

                return res.json({ success: true, session });
            }

            const session = await chat.createSession({
                agentId,
                workflowId,
            });

            return res.json({ success: true, session });
        }

        // GET - Get session or list sessions
        if (req.method === 'GET') {
            const { sessionId } = req.query;

            if (sessionId) {
                const session = await chat.getSession(sessionId);
                return res.json({ success: true, session });
            }

            const sessions = await chat.listSessions();
            return res.json({ success: true, sessions });
        }

        // DELETE - Delete session
        if (req.method === 'DELETE') {
            const { sessionId } = req.query;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID required',
                });
            }

            await chat.deleteSession(sessionId);
            return res.json({ success: true });
        }

        // Method not allowed
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed`,
        });
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
