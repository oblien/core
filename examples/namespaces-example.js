/**
 * Example: Using Oblien Namespaces SDK
 * 
 * This demonstrates how to manage namespaces, configure services,
 * and track usage using the oblien/namespaces module.
 */

import { OblienClient } from 'oblien';
import { OblienNamespaces } from 'oblien/namespaces';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
    baseURL: 'https://api.oblien.com',
});

// Initialize namespaces manager
const namespaces = new OblienNamespaces(client);

// =============================================================================
// Example 1: Create a new namespace
// =============================================================================

async function createNamespace() {
    try {
        const namespace = await namespaces.create({
            name: 'Production Environment',
            slug: 'production',
            description: 'Main production workspace',
            type: 'production',
            metadata: {
                region: 'us-east-1',
                tier: 'premium',
            },
            tags: ['production', 'critical'],
        });

        console.log('Created namespace:', namespace);
        return namespace;
    } catch (error) {
        console.error('Error creating namespace:', error.message);
    }
}

// =============================================================================
// Example 2: List namespaces with filtering
// =============================================================================

async function listNamespaces() {
    try {
        const result = await namespaces.list({
            limit: 10,
            status: 'active',
            type: 'production',
            search: 'prod',
            sortBy: 'created_at',
            sortOrder: 'DESC',
        });

        console.log('Namespaces:', result.data);
        console.log('Pagination:', result.pagination);
    } catch (error) {
        console.error('Error listing namespaces:', error.message);
    }
}

// =============================================================================
// Example 3: Get namespace details
// =============================================================================

async function getNamespace(namespaceId) {
    try {
        // Can use ID or slug
        const namespace = await namespaces.get(namespaceId);
        console.log('Namespace details:', namespace);
        return namespace;
    } catch (error) {
        console.error('Error getting namespace:', error.message);
    }
}

// =============================================================================
// Example 4: Update namespace
// =============================================================================

async function updateNamespace(namespaceId) {
    try {
        const updated = await namespaces.update(namespaceId, {
            description: 'Updated description',
            metadata: {
                tier: 'enterprise',
                updated: true,
            },
            tags: ['production', 'critical', 'enterprise'],
        });

        console.log('Updated namespace:', updated);
    } catch (error) {
        console.error('Error updating namespace:', error.message);
    }
}

// =============================================================================
// Example 5: Configure services for namespace
// =============================================================================

async function configureServices(namespaceId) {
    try {
        // Configure AI service
        await namespaces.configureService(namespaceId, {
            service: 'ai',
            enabled: true,
            config: {
                model: 'gpt-4',
                maxTokens: 4000,
            },
            rateLimitRequests: 1000,
            rateLimitPeriod: 'hour',
            features: ['streaming', 'tools', 'vision'],
        });

        // Configure deployment service
        await namespaces.configureService(namespaceId, {
            service: 'deployment',
            enabled: true,
            config: {
                maxDeployments: 10,
            },
        });

        console.log('Services configured successfully');
    } catch (error) {
        console.error('Error configuring services:', error.message);
    }
}

// =============================================================================
// Example 6: Bulk configure services
// =============================================================================

async function bulkConfigureServices(namespaceId) {
    try {
        const services = [
            {
                service: 'ai',
                enabled: true,
                config: { model: 'gpt-4' },
            },
            {
                service: 'deployment',
                enabled: true,
                config: { maxDeployments: 10 },
            },
            {
                service: 'sandbox',
                enabled: false,
            },
        ];

        const result = await namespaces.bulkConfigureServices(namespaceId, services);
        console.log('Bulk configured:', result);
    } catch (error) {
        console.error('Error bulk configuring:', error.message);
    }
}

// =============================================================================
// Example 7: Get namespace usage statistics
// =============================================================================

async function getUsageStats(namespaceId) {
    try {
        const usage = await namespaces.getUsage(namespaceId, {
            service: 'ai', // Optional: filter by service
            days: 30,
        });

        console.log('Usage statistics:');
        console.log('- Daily usage:', usage.usage);
        console.log('- Summary:', usage.summary);
        console.log('- Quotas:', usage.quotas);
        console.log('- Active sessions:', usage.active_sessions);
    } catch (error) {
        console.error('Error getting usage:', error.message);
    }
}

// =============================================================================
// Example 8: Get activity log
// =============================================================================

async function getActivity(namespaceId) {
    try {
        const activity = await namespaces.getActivity(namespaceId, {
            limit: 50,
            offset: 0,
        });

        console.log('Activity log:', activity);
    } catch (error) {
        console.error('Error getting activity:', error.message);
    }
}

// =============================================================================
// Example 9: Toggle service enabled/disabled
// =============================================================================

async function toggleService(namespaceId) {
    try {
        // Disable AI service
        await namespaces.disableService(namespaceId, 'ai');
        console.log('AI service disabled');

        // Enable it again
        await namespaces.enableService(namespaceId, 'ai');
        console.log('AI service enabled');
    } catch (error) {
        console.error('Error toggling service:', error.message);
    }
}

// =============================================================================
// Example 10: List services
// =============================================================================

async function listServices(namespaceId) {
    try {
        const services = await namespaces.listServices(namespaceId);
        console.log('Configured services:', services);
    } catch (error) {
        console.error('Error listing services:', error.message);
    }
}

// =============================================================================
// Example 11: Using Namespace instance for chaining
// =============================================================================

async function useNamespaceInstance() {
    try {
        // Create a namespace instance
        const namespace = namespaces.namespace('namespace-id-here');

        // Chain operations
        await namespace.get();
        await namespace.configureService({
            service: 'ai',
            enabled: true,
        });
        
        const services = await namespace.listServices();
        const usage = await namespace.getUsage({ days: 7 });

        console.log('Services:', services);
        console.log('Usage:', usage);
    } catch (error) {
        console.error('Error with namespace instance:', error.message);
    }
}

// =============================================================================
// Example 12: Get available services
// =============================================================================

async function getAvailableServices() {
    try {
        const services = await namespaces.getAvailableServices();
        console.log('Available services:', services);
    } catch (error) {
        console.error('Error getting services:', error.message);
    }
}

// =============================================================================
// Example 13: Delete namespace (archive)
// =============================================================================

async function deleteNamespace(namespaceId) {
    try {
        const result = await namespaces.delete(namespaceId);
        console.log('Namespace archived:', result);
    } catch (error) {
        console.error('Error deleting namespace:', error.message);
    }
}

// =============================================================================
// Run examples
// =============================================================================

async function runExamples() {
    // Create namespace
    const namespace = await createNamespace();
    const namespaceId = namespace?.id;

    if (namespaceId) {
        // Run other examples
        await listNamespaces();
        await getNamespace(namespaceId);
        await updateNamespace(namespaceId);
        await configureServices(namespaceId);
        await getUsageStats(namespaceId);
        await getActivity(namespaceId);
        await toggleService(namespaceId);
        await listServices(namespaceId);
        await getAvailableServices();
        
        // Uncomment to delete
        // await deleteNamespace(namespaceId);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples().catch(console.error);
}

export {
    createNamespace,
    listNamespaces,
    getNamespace,
    updateNamespace,
    configureServices,
    bulkConfigureServices,
    getUsageStats,
    getActivity,
    toggleService,
    listServices,
    useNamespaceInstance,
    getAvailableServices,
    deleteNamespace,
};

