/**
 * Chat Module Example
 * 
 * Demonstrates:
 * - Creating sessions
 * - Sending messages with streaming
 * - Uploading files
 * - Guest sessions
 * - Guest monitoring
 * - Hybrid mode usage
 */

import { OblienClient } from '../src/client.js';
import { OblienChat } from '../src/chat/index.js';

// Initialize client
const client = new OblienClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});

const chat = new OblienChat(client);

// ============================================
// Example 1: Basic Session & Messaging
// ============================================

async function basicExample() {
    console.log('\n=== Basic Session & Messaging ===\n');

    // Create session
    const session = await chat.createSession({
        agentId: 'agent-123',
        namespace: 'production',
        endUserId: 'user-456'
    });

    console.log('Session created:', {
        sessionId: session.sessionId,
        token: session.token.substring(0, 20) + '...'
    });

    // Send regular message
    const response = await chat.send({
        token: session.token,
        message: 'What is machine learning?'
    });

    console.log('Response:', response.message?.substring(0, 100) + '...');
}

// ============================================
// Example 2: Streaming Messages
// ============================================

async function streamingExample() {
    console.log('\n=== Streaming Messages ===\n');

    const session = await chat.createSession({
        agentId: 'agent-123'
    });

    let fullResponse = '';

    await chat.send({
        token: session.token,
        message: 'Tell me a short story about AI',
        stream: true,
        onChunk: (data) => {
            if (data.content) {
                process.stdout.write(data.content);
                fullResponse += data.content;
            }
        },
        onComplete: () => {
            console.log('\n\nStreaming complete!');
            console.log('Total length:', fullResponse.length);
        },
        onError: (error) => {
            console.error('Stream error:', error);
        }
    });
}

// ============================================
// Example 3: File Upload
// ============================================

async function fileUploadExample() {
    console.log('\n=== File Upload ===\n');

    const session = await chat.createSession({
        agentId: 'agent-123'
    });

    // Simulate file upload (in browser, you'd get these from input[type="file"])
    const files = [
        {
            buffer: Buffer.from('Sample document content'),
            originalname: 'document.txt',
            path: './document.txt'
        }
    ];

    // Upload files
    const uploadResult = await chat.upload({
        token: session.token,
        files: files,
        metadata: {
            category: 'documents',
            purpose: 'analysis'
        }
    });

    console.log('Upload result:', uploadResult);

    // Send message with uploaded files
    const response = await chat.send({
        token: session.token,
        message: 'Please analyze these documents',
        uploadId: uploadResult.uploadId
    });

    console.log('Analysis response:', response.message?.substring(0, 100) + '...');
}

// ============================================
// Example 4: Guest Sessions
// ============================================

async function guestSessionExample() {
    console.log('\n=== Guest Session ===\n');

    // Create guest session (simulate from Express.js)
    const guestSession = await chat.createGuestSession({
        ip: '192.168.1.100',
        fingerprint: 'browser-fingerprint-abc123',
        agentId: 'agent-123',
        metadata: {
            userAgent: 'Mozilla/5.0...',
            referrer: 'https://example.com'
        }
    });

    console.log('Guest session created:', {
        sessionId: guestSession.sessionId,
        guestId: guestSession.guest.id,
        namespace: guestSession.guest.namespace
    });

    // Send message as guest
    await chat.send({
        token: guestSession.token,
        message: 'Hello, I am a guest user!'
    });

    // Check guest usage
    const usage = await chat.getGuestUsage(guestSession.token);
    console.log('Guest usage:', {
        requestCount: usage.requestCount,
        limit: usage.limit,
        remaining: usage.remaining
    });

    // Get guest info
    const guest = await chat.getGuest('192.168.1.100', 'browser-fingerprint-abc123');
    console.log('Guest info:', {
        id: guest.id,
        sessions: guest.sessions.length,
        createdAt: guest.createdAt
    });
}

// ============================================
// Example 5: Hybrid Mode (Server-Side)
// ============================================

async function hybridModeExample() {
    console.log('\n=== Hybrid Mode (Server-Side) ===\n');

    // Server-side: No token needed, uses client credentials
    const response = await chat.send({
        message: 'This is a server-side message',
        metadata: {
            source: 'api',
            userId: 'admin-123'
        }
    });

    console.log('Server response:', response);

    // Server-side upload
    const uploadResult = await chat.upload({
        files: [{
            buffer: Buffer.from('Server-side file'),
            originalname: 'server-file.txt'
        }]
    });

    console.log('Server upload:', uploadResult);
}

// ============================================
// Example 6: Guest Monitoring (Admin)
// ============================================

async function guestMonitoringExample() {
    console.log('\n=== Guest Monitoring ===\n');

    // Get all active guests
    const guests = await chat.getAllGuests();
    console.log(`Total active guests: ${guests.length}`);
    
    guests.slice(0, 3).forEach(guest => {
        console.log(`- Guest ${guest.id}: ${guest.sessions.length} sessions`);
    });

    // Get cache statistics
    const stats = await chat.getCacheStatistics();
    console.log('\nCache Statistics:', {
        keys: stats.cache.keys,
        hitRate: (stats.cache.hitRate * 100).toFixed(2) + '%',
        hits: stats.cache.hits,
        misses: stats.cache.misses
    });

    // Cleanup expired guests
    const cleanedCount = await chat.cleanupGuests();
    console.log(`\nCleaned up ${cleanedCount} expired guests`);
}

// ============================================
// Example 7: Complete Chat Flow
// ============================================

async function completeChatFlow() {
    console.log('\n=== Complete Chat Flow ===\n');

    // 1. Create guest session
    const session = await chat.createGuestSession({
        ip: '192.168.1.200',
        fingerprint: 'user-fingerprint-xyz',
        agentId: 'agent-123'
    });

    console.log('✓ Session created');

    // 2. Check usage before sending
    const usageBefore = await chat.getGuestUsage(session.token);
    console.log(`✓ Usage check: ${usageBefore.remaining} requests remaining`);

    if (usageBefore.remaining <= 0) {
        console.log('✗ Rate limit exceeded!');
        return;
    }

    // 3. Upload file
    const uploadResult = await chat.upload({
        token: session.token,
        files: [{
            buffer: Buffer.from('User document'),
            originalname: 'data.txt'
        }]
    });

    console.log('✓ File uploaded');

    // 4. Send message with file
    await chat.send({
        token: session.token,
        message: 'Please process this file',
        uploadId: uploadResult.uploadId,
        stream: true,
        onChunk: (data) => {
            if (data.content) {
                process.stdout.write('.');
            }
        },
        onComplete: () => {
            console.log('\n✓ Message processed');
        }
    });

    // 5. Check usage after
    const usageAfter = await chat.getGuestUsage(session.token);
    console.log(`✓ Usage updated: ${usageAfter.remaining} requests remaining`);

    // 6. Clean up
    await chat.deleteSession(session.sessionId);
    console.log('✓ Session cleaned up');
}

// ============================================
// Example 8: Rate Limit Handling
// ============================================

async function rateLimitExample() {
    console.log('\n=== Rate Limit Handling ===\n');

    const session = await chat.createGuestSession({
        ip: '192.168.1.250',
        fingerprint: 'test-user',
        agentId: 'agent-123'
    });

    async function sendMessageWithCheck(message) {
        try {
            // Check usage first
            const usage = await chat.getGuestUsage(session.token);
            
            if (usage.remaining <= 0) {
                const resetTime = new Date(usage.resetAt);
                throw new Error(`Rate limit exceeded. Resets at ${resetTime.toLocaleString()}`);
            }

            // Show warning if close to limit
            if (usage.remaining < 10) {
                console.warn(`⚠️  Only ${usage.remaining} requests remaining!`);
            }

            // Send message
            await chat.send({
                token: session.token,
                message: message
            });

            console.log(`✓ Message sent. ${usage.remaining - 1} remaining.`);
        } catch (error) {
            console.error('✗', error.message);
        }
    }

    // Send multiple messages with checking
    for (let i = 0; i < 3; i++) {
        await sendMessageWithCheck(`Test message ${i + 1}`);
    }
}

// ============================================
// Run Examples
// ============================================

async function main() {
    try {
        // Uncomment the examples you want to run:
        
        await basicExample();
        // await streamingExample();
        // await fileUploadExample();
        // await guestSessionExample();
        // await hybridModeExample();
        // await guestMonitoringExample();
        // await completeChatFlow();
        // await rateLimitExample();

        console.log('\n✨ Examples completed!\n');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    basicExample,
    streamingExample,
    fileUploadExample,
    guestSessionExample,
    hybridModeExample,
    guestMonitoringExample,
    completeChatFlow,
    rateLimitExample
};

