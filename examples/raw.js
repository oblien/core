// Test example for creating sessions with Oblien SDK
import { OblienClient, OblienChat } from '../index.js';

// Initialize client with your credentials
// Set these in your environment or replace with actual values
const client = new OblienClient({
    apiKey: process.env.OBLIEN_API_KEY || 'oblien_2198d4ba63814e81532c58c72c3068341ed64ffd18469a18d5b5eabffdc860a7',
    apiSecret: process.env.OBLIEN_API_SECRET || 'sk_89fecd56265b5498527c557a7a0fcaf9c9e44fe6078044a11eac1d179ba78c7a05ad78d5327769a5f37f4b0d9a55b90e',
});

// Initialize chat manager
const chat = new OblienChat(client);

const AGENT_ID = process.env.OBLIEN_AGENT_ID || 'ed22e6a0-e6a1-496b-85c5-be0ec8605a4e';

// Test 1: Create a regular session (authenticated user)
async function testCreateSession() {
    try {
        console.log('\n📝 Test 1: Creating regular session (authenticated user)...');
        
        const sessionData = await chat.createSession({
            agentId: AGENT_ID,
            namespace: 'user_123', // For authenticated users, pass user_id as namespace
            // workflowId: 'your-workflow-id', // Optional
            // workspace: { /* your workspace config */ }, // Optional
        });

        console.log('✅ Session created successfully:', {
            sessionId: sessionData.sessionId,
            token: sessionData.token?.substring(0, 50) + '...',
            agentId: sessionData.agentId,
            namespace: sessionData.namespace,
        });

        return sessionData;
    } catch (error) {
        console.error('❌ Error creating session:', error.message);
        throw error;
    }
}

// Test 2: Create a guest session with fingerprint (dual-layer identification)
async function testCreateGuestSession() {
    try {
        console.log('\n👤 Test 2: Creating guest session with fingerprint...');
        
        const ip = '127.0.0.1';
        const fingerprint = 'fp_' + Math.random().toString(36).substring(7);
        
        const sessionData = await chat.createGuestSession({
            ip,
            fingerprint, // NEW: Pass fingerprint for dual-layer identification
            agentId: AGENT_ID,
            metadata: {
                userAgent: 'test-agent',
                referer: 'test',
            },
        });

        console.log('✅ Guest session created successfully:', {
            sessionId: sessionData.sessionId,
            token: sessionData.token?.substring(0, 50) + '...',
            guestId: sessionData.guest.id,
            namespace: sessionData.guest.namespace,
        });

        return { sessionData, ip, fingerprint };
    } catch (error) {
        console.error('❌ Error creating guest session:', error.message);
        throw error;
    }
}

// Test 3: Test dual-layer identification - same fingerprint, different IP
async function testDualLayerIdentification(fingerprint, originalIp) {
    try {
        console.log('\n🔄 Test 3: Testing dual-layer identification...');
        console.log('   Scenario: Same fingerprint, different IP (should find same guest)');
        
        const newIp = '192.168.1.100'; // Different IP
        
        // Use the new consolidated getGuest function
        const existingGuest = await chat.getGuest(newIp, fingerprint);
        
        if (existingGuest) {
            console.log('✅ Found existing guest by fingerprint (IP changed):', {
                guestId: existingGuest.id,
                originalIp,
                newIp,
                sessions: existingGuest.sessions?.length || 0,
            });
        } else {
            console.log('ℹ️  No existing guest found (this is expected for first test run)');
        }
        
        // Create new session with same fingerprint but different IP
        const sessionData = await chat.createGuestSession({
            ip: newIp,
            fingerprint, // Same fingerprint
            agentId: AGENT_ID,
        });
        
        console.log('✅ Created session with same fingerprint, different IP:', {
            guestId: sessionData.guest.id,
            isSameGuest: existingGuest?.id === sessionData.guest.id,
        });
        
        return sessionData;
    } catch (error) {
        console.error('❌ Error in dual-layer identification test:', error.message);
        throw error;
    }
}

// Test 4: Test dual-layer identification - same IP, different fingerprint
async function testDualLayerIdentification2(originalIp) {
    try {
        console.log('\n🔄 Test 4: Testing dual-layer identification (reverse)...');
        console.log('   Scenario: Same IP, different fingerprint (should find same guest)');
        
        const newFingerprint = 'fp_' + Math.random().toString(36).substring(7);
        
        // Use the new consolidated getGuest function
        const existingGuest = await chat.getGuest(originalIp, newFingerprint);
        
        if (existingGuest) {
            console.log('✅ Found existing guest by IP (fingerprint changed):', {
                guestId: existingGuest.id,
                originalIp,
                newFingerprint,
                sessions: existingGuest.sessions?.length || 0,
            });
        } else {
            console.log('ℹ️  No existing guest found');
        }
        
        // Create new session with same IP but different fingerprint
        const sessionData = await chat.createGuestSession({
            ip: originalIp,
            fingerprint: newFingerprint, // Different fingerprint
            agentId: AGENT_ID,
        });
        
        console.log('✅ Created session with same IP, different fingerprint:', {
            guestId: sessionData.guest.id,
            isSameGuest: existingGuest?.id === sessionData.guest.id,
        });
        
        return sessionData;
    } catch (error) {
        console.error('❌ Error in dual-layer identification test:', error.message);
        throw error;
    }
}

// Test 5: Get session info
async function testGetSession(sessionId) {
    try {
        console.log(`\n📖 Test 5: Getting session info for: ${sessionId}`);
        
        const sessionInfo = await chat.getSession(sessionId);
        
        console.log('✅ Session info:', sessionInfo);
        
        return sessionInfo;
    } catch (error) {
        console.error('❌ Error getting session:', error.message);
        throw error;
    }
}

// Test 6: Get guest by IP and fingerprint (new consolidated function)
async function testGetGuest(ip, fingerprint) {
    try {
        console.log(`\n🔍 Test 6: Getting guest by IP and fingerprint...`);
        console.log(`   IP: ${ip}, Fingerprint: ${fingerprint}`);
        
        // NEW: Single function that handles both IP and fingerprint
        const guest = await chat.getGuest(ip, fingerprint);
        
        if (guest) {
            console.log('✅ Guest found:', {
                guestId: guest.id,
                namespace: guest.namespace,
                sessions: guest.sessions?.length || 0,
                createdAt: guest.createdAt,
            });
        } else {
            console.log('ℹ️  No guest found');
        }
        
        return guest;
    } catch (error) {
        console.error('❌ Error getting guest:', error.message);
        throw error;
    }
}

// Run all tests
async function runTests() {
    try {
        console.log('🚀 Starting Oblien SDK Tests\n');
        console.log('='.repeat(60));
        
        // Test 1: Regular session (authenticated user)
        const regularSession = await testCreateSession();
        
        // Test 2: Guest session with fingerprint
        const { sessionData: guestSession, ip, fingerprint } = await testCreateGuestSession();
        
        // Test 3: Dual-layer identification (same fingerprint, different IP)
        await testDualLayerIdentification(fingerprint, ip);
        
        // Test 4: Dual-layer identification (same IP, different fingerprint)
        await testDualLayerIdentification2(ip);
        
        // Test 5: Get session info
        if (regularSession.sessionId) {
            await testGetSession(regularSession.sessionId);
        }
        
        // Test 6: Get guest (new consolidated function)
        await testGetGuest(ip, fingerprint);
        
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ All tests completed successfully!');
        console.log('\n📚 Key Features Demonstrated:');
        console.log('   • Regular session creation with namespace (authenticated users)');
        console.log('   • Guest session creation with fingerprint (dual-layer identification)');
        console.log('   • Guest lookup by IP and/or fingerprint (consolidated function)');
        console.log('   • Automatic guest matching when IP or fingerprint changes');
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runTests();

