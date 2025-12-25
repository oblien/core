/**
 * Oblien Sandboxes Module - Usage Examples
 */

import { OblienClient } from 'oblien';
import { OblienSandboxes } from 'oblien/sandbox';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

// Initialize sandboxes module
const sandboxes = new OblienSandboxes(client);

// ============================================================================
// EXAMPLE 1: Create sandbox with auto-start (default)
// ============================================================================
async function createSandbox() {
    const sandbox = await sandboxes.create({
        name: 'my-dev-sandbox',
        region: 'us-east-1',
        template: 'node-20',
        autoStart: true  // Default: true - starts automatically
    });

    console.log('Sandbox created:', {
        id: sandbox.sandbox.sandbox_id,
        url: sandbox.sandbox.url,
        token: sandbox.sandbox.token,  // 1h JWT token
        status: sandbox.sandbox.status
    });

    return sandbox;
}

// ============================================================================
// EXAMPLE 2: Create sandbox without auto-start
// ============================================================================
async function createSandboxManualStart() {
    // Create without starting
    const sandbox = await sandboxes.create({
        name: 'staging-sandbox',
        region: 'us-east-1',
        template: 'python-3',
        autoStart: false  // Don't start yet
    });

    console.log('Sandbox created (not started):', sandbox.sandbox.sandbox_id);

    // Start it later
    const startResult = await sandboxes.start(sandbox.sandbox.sandbox_id);
    console.log('Sandbox started:', startResult.sandbox.token);

    return sandbox;
}

// ============================================================================
// EXAMPLE 3: List sandboxes with pagination and filtering
// ============================================================================
async function listSandboxes() {
    // List all active sandboxes
    const activeSandboxes = await sandboxes.list({
        page: 1,
        limit: 20,
        status: 'active'
    });

    console.log(`Found ${activeSandboxes.sandboxes.length} active sandboxes`);
    console.log('Pagination:', {
        currentPage: activeSandboxes.pagination.currentPage,
        totalPages: activeSandboxes.pagination.totalPages,
        total: activeSandboxes.pagination.total
    });

    // List stopped sandboxes
    const stoppedSandboxes = await sandboxes.list({
        status: 'stopped'
    });

    console.log(`Found ${stoppedSandboxes.sandboxes.length} stopped sandboxes`);

    return activeSandboxes;
}

// ============================================================================
// EXAMPLE 4: Get sandbox details
// ============================================================================
async function getSandboxDetails(sandboxId) {
    const sandbox = await sandboxes.get(sandboxId);

    console.log('Sandbox details:', {
        id: sandbox.sandbox_id,
        name: sandbox.name,
        url: sandbox.url,
        region: sandbox.region,
        template: sandbox.template,
        status: sandbox.status,
        created: sandbox.created_at
    });

    return sandbox;
}

// ============================================================================
// EXAMPLE 5: Control sandbox lifecycle
// ============================================================================
async function controlSandbox(sandboxId) {
    // Stop sandbox
    console.log('Stopping sandbox...');
    await sandboxes.stop(sandboxId);
    console.log('✓ Sandbox stopped');

    // Start sandbox (returns new token)
    console.log('Starting sandbox...');
    const startResult = await sandboxes.start(sandboxId);
    console.log('✓ Sandbox started with new token:', startResult.sandbox.token);

    // Restart sandbox (stop + start, returns new token)
    console.log('Restarting sandbox...');
    const restartResult = await sandboxes.restart(sandboxId);
    console.log('✓ Sandbox restarted with new token:', restartResult.sandbox.token);

    return restartResult;
}

// ============================================================================
// EXAMPLE 6: Token management
// ============================================================================
async function manageTokens(sandboxId) {
    // Tokens expire after 1 hour
    // Regenerate token when needed
    const tokenResult = await sandboxes.regenerateToken(sandboxId);

    console.log('New token generated:', {
        token: tokenResult.sandbox.token,
        expiresIn: '1 hour'
    });

    // Use the token for sandbox operations
    const sandboxUrl = tokenResult.sandbox.url;
    const token = tokenResult.sandbox.token;

    console.log('Use token for sandbox API calls:');
    console.log(`curl ${sandboxUrl}/files/list \\`);
    console.log(`  -H "Authorization: Bearer ${token}"`);

    return tokenResult;
}

// ============================================================================
// EXAMPLE 7: Update sandbox
// ============================================================================
async function updateSandbox(sandboxId) {
    const result = await sandboxes.update(sandboxId, {
        name: 'Updated Sandbox Name',
        config: {
            memory: '2GB',
            cpu: '2'
        }
    });

    console.log('Sandbox updated:', result);
    return result;
}

// ============================================================================
// EXAMPLE 8: Delete sandbox
// ============================================================================
async function deleteSandbox(sandboxId) {
    const result = await sandboxes.delete(sandboxId);
    console.log('Sandbox deleted:', result);
    return result;
}

// ============================================================================
// EXAMPLE 9: Get sandbox metrics
// ============================================================================
async function getSandboxMetrics(sandboxId) {
    const metrics = await sandboxes.getMetrics(sandboxId);

    console.log('Sandbox metrics:', {
        cpu: metrics.cpu,
        memory: metrics.memory,
        disk: metrics.disk,
        network: metrics.network
    });

    return metrics;
}

// ============================================================================
// EXAMPLE 10: Get platform stats
// ============================================================================
async function getPlatformStats() {
    const stats = await sandboxes.getStats();

    console.log('Platform stats:', {
        totalSandboxes: stats.total,
        activeSandboxes: stats.active,
        stoppedSandboxes: stats.stopped
    });

    return stats;
}

// ============================================================================
// EXAMPLE 11: Get activity logs
// ============================================================================
async function getActivity() {
    const activity = await sandboxes.getActivity();

    console.log('Recent activity:');
    activity.activities.forEach(log => {
        console.log(`- ${log.action} at ${log.timestamp}`);
    });

    return activity;
}

// ============================================================================
// EXAMPLE 12: Using Sandbox instance for chaining
// ============================================================================
async function usingSandboxInstance(sandboxId) {
    // Create sandbox instance
    const sandbox = sandboxes.sandbox(sandboxId);

    // Chain operations
    const details = await sandbox.get();
    console.log('Details:', details);

    const metrics = await sandbox.getMetrics();
    console.log('Metrics:', metrics);

    // Stop and restart
    await sandbox.stop();
    console.log('✓ Stopped');

    const startResult = await sandbox.start();
    console.log('✓ Started with token:', startResult.sandbox.token);

    // Regenerate token
    const tokenResult = await sandbox.regenerateToken();
    console.log('✓ New token:', tokenResult.sandbox.token);
}

// ============================================================================
// EXAMPLE 13: Complete workflow - Create, use, and cleanup
// ============================================================================
async function completeWorkflow() {
    try {
        // 1. Create sandbox
        console.log('Step 1: Creating sandbox...');
        const createResult = await sandboxes.create({
            name: 'workflow-sandbox',
            region: 'us-east-1',
            template: 'node-20',
            autoStart: true
        });

        const sandboxId = createResult.sandbox.sandbox_id;
        const token = createResult.sandbox.token;
        const url = createResult.sandbox.url;

        console.log('✓ Sandbox created:', sandboxId);

        // 2. Use sandbox (example: list files)
        console.log('\nStep 2: Using sandbox...');
        const filesResponse = await fetch(`${url}/files/list`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dirPath: '/opt/app' })
        });

        const files = await filesResponse.json();
        console.log('✓ Files:', files);

        // 3. Get metrics
        console.log('\nStep 3: Checking metrics...');
        const metrics = await sandboxes.getMetrics(sandboxId);
        console.log('✓ Metrics:', metrics);

        // 4. Stop sandbox when done
        console.log('\nStep 4: Stopping sandbox...');
        await sandboxes.stop(sandboxId);
        console.log('✓ Sandbox stopped');

        // 5. Cleanup (optional - delete)
        console.log('\nStep 5: Cleaning up...');
        // await sandboxes.delete(sandboxId);
        // console.log('✓ Sandbox deleted');

        return {
            sandboxId,
            url,
            metrics
        };

    } catch (error) {
        console.error('Error in workflow:', error.message);
        throw error;
    }
}

// ============================================================================
// EXAMPLE 14: Available templates
// ============================================================================
async function templatesGuide() {
    console.log('Available Templates:');
    console.log('- node-20: Node.js 20 environment');
    console.log('- python-3: Python 3 environment');
    console.log('- blank: Minimal environment');
    console.log('- custom: Custom template (contact support)');

    console.log('\nAvailable Regions:');
    console.log('- us-east-1: US East (Virginia)');
    console.log('- us-west-1: US West (California)');
    console.log('- eu-west-1: Europe (Ireland)');
}

// ============================================================================
// Run examples
// ============================================================================
async function main() {
    try {
        // Uncomment the examples you want to run

        // await createSandbox();
        // await createSandboxManualStart();
        // await listSandboxes();
        // await getPlatformStats();
        // await completeWorkflow();
        // templatesGuide();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    createSandbox,
    createSandboxManualStart,
    listSandboxes,
    getSandboxDetails,
    controlSandbox,
    manageTokens,
    updateSandbox,
    deleteSandbox,
    getSandboxMetrics,
    getPlatformStats,
    getActivity,
    usingSandboxInstance,
    completeWorkflow,
    templatesGuide
};

