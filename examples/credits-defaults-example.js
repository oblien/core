/**
 * Example: Dynamic Default Quota Configuration
 * 
 * This demonstrates how to set up default quotas that automatically apply
 * to new namespaces and end users. All configuration is stored per-client
 * in the database and fully customizable via SDK.
 */

import { OblienClient, OblienCredits } from 'oblien';

// Initialize
const client = new OblienClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
});

const credits = new OblienCredits(client);

// =============================================================================
// Example 1: Set Default Namespace Quotas
// =============================================================================

async function setDefaultNamespaceQuotas() {
    console.log('=== Setting Default Namespace Quotas ===\n');

    // Set default for AI chat service
    await credits.setDefaultQuota({
        level: 'namespace',
        service: 'ai_chat',
        quotaLimit: 50000,      // 50,000 credits per namespace
        period: 'monthly',       // Reset monthly
        autoApply: true,         // Auto-apply to new namespaces
    });
    console.log('✓ Default namespace quota for ai_chat: 50,000/month');

    // Set default for deployments (unlimited)
    await credits.setDefaultQuota({
        level: 'namespace',
        service: 'deployment',
        quotaLimit: null,        // Unlimited
        period: 'unlimited',
        autoApply: true,
    });
    console.log('✓ Default namespace quota for deployment: unlimited');

    // Set default for sandbox
    await credits.setDefaultQuota({
        level: 'namespace',
        service: 'sandbox',
        quotaLimit: 10000,
        period: 'monthly',
        autoApply: true,
    });
    console.log('✓ Default namespace quota for sandbox: 10,000/month\n');
}

// =============================================================================
// Example 2: Set Default End-User Quotas
// =============================================================================

async function setDefaultEndUserQuotas() {
    console.log('=== Setting Default End-User Quotas ===\n');

    // Set default for AI chat per user
    await credits.setDefaultQuota({
        level: 'end_user',
        service: 'ai_chat',
        quotaLimit: 1000,        // 1,000 credits per user
        period: 'monthly',
        autoApply: true,
    });
    console.log('✓ Default end-user quota for ai_chat: 1,000/month');

    // Set default for AI images per user
    await credits.setDefaultQuota({
        level: 'end_user',
        service: 'ai_image',
        quotaLimit: 500,
        period: 'monthly',
        autoApply: true,
    });
    console.log('✓ Default end-user quota for ai_image: 500/month');

    // Set default for sandbox per user
    await credits.setDefaultQuota({
        level: 'end_user',
        service: 'sandbox',
        quotaLimit: 100,
        period: 'daily',         // Daily limit
        autoApply: true,
    });
    console.log('✓ Default end-user quota for sandbox: 100/day\n');
}

// =============================================================================
// Example 3: Get All Default Quotas
// =============================================================================

async function getAllDefaults() {
    console.log('=== All Default Configurations ===\n');

    // Get all defaults
    const allConfigs = await credits.getAllDefaultQuotas();
    console.log('All configurations:', allConfigs.configs.length);

    // Get namespace-level defaults only
    const namespaceDefaults = await credits.getAllDefaultQuotas('namespace');
    console.log('\nNamespace Defaults:');
    namespaceDefaults.configs.forEach(config => {
        const limit = config.quotaLimit ? `${config.quotaLimit}/${config.period}` : 'unlimited';
        console.log(`  - ${config.service}: ${limit} (auto-apply: ${config.autoApply})`);
    });

    // Get end-user defaults only
    const endUserDefaults = await credits.getAllDefaultQuotas('end_user');
    console.log('\nEnd-User Defaults:');
    endUserDefaults.configs.forEach(config => {
        const limit = config.quotaLimit ? `${config.quotaLimit}/${config.period}` : 'unlimited';
        console.log(`  - ${config.service}: ${limit} (auto-apply: ${config.autoApply})`);
    });
}

// =============================================================================
// Example 4: Get Specific Default Configuration
// =============================================================================

async function getSpecificDefault() {
    console.log('\n=== Get Specific Default ===\n');

    const config = await credits.getDefaultQuota('end_user', 'ai_chat');

    if (config.config) {
        console.log('End-user default for ai_chat:');
        console.log(`  Limit: ${config.config.quotaLimit || 'unlimited'}`);
        console.log(`  Period: ${config.config.period}`);
        console.log(`  Auto-apply: ${config.config.autoApply}`);
    } else {
        console.log('No default configuration found for ai_chat end users');
    }
}

// =============================================================================
// Example 5: Toggle Auto-Apply
// =============================================================================

async function toggleAutoApply() {
    console.log('\n=== Toggle Auto-Apply ===\n');

    // Disable auto-apply for a specific default
    await credits.toggleDefaultQuotaAutoApply('end_user', 'ai_chat', false);
    console.log('✓ Auto-apply disabled for end-user ai_chat');

    // Re-enable it
    await credits.toggleDefaultQuotaAutoApply('end_user', 'ai_chat', true);
    console.log('✓ Auto-apply re-enabled for end-user ai_chat');
}

// =============================================================================
// Example 6: Update Default Quota
// =============================================================================

async function updateDefault() {
    console.log('\n=== Update Default Quota ===\n');

    // Updating is the same as setting (upsert)
    await credits.setDefaultQuota({
        level: 'end_user',
        service: 'ai_chat',
        quotaLimit: 2000,        // Increased from 1000 to 2000
        period: 'monthly',
        autoApply: true,
    });
    console.log('✓ Updated end-user ai_chat default to 2,000/month');
}

// =============================================================================
// Example 7: Delete Default Configuration
// =============================================================================

async function deleteDefault() {
    console.log('\n=== Delete Default Configuration ===\n');

    await credits.deleteDefaultQuota('end_user', 'sandbox');
    console.log('✓ Deleted default configuration for end-user sandbox');
}

// =============================================================================
// Example 8: SaaS Setup - Complete Configuration
// =============================================================================

async function completeSaaSSetup() {
    console.log('\n=== Complete SaaS Setup ===\n');

    console.log('Step 1: Configure namespace-level defaults');
    await credits.setDefaultQuota({
        level: 'namespace',
        service: 'ai_chat',
        quotaLimit: 100000,      // 100k per customer workspace
        period: 'monthly',
        autoApply: true,
    });

    console.log('Step 2: Configure end-user-level defaults');
    await credits.setDefaultQuota({
        level: 'end_user',
        service: 'ai_chat',
        quotaLimit: 5000,        // 5k per individual user
        period: 'monthly',
        autoApply: true,
    });

    console.log('Step 3: Verify configuration');
    const allDefaults = await credits.getAllDefaultQuotas();
    console.log(`\n✅ Setup complete! ${allDefaults.configs.length} default quotas configured`);
    
    console.log('\nNow, whenever a new namespace is created or an end user is');
    console.log('first tracked, these default quotas will automatically apply!\n');
}

// =============================================================================
// Example 9: Disable Auto-Apply for Manual Control
// =============================================================================

async function manualControlSetup() {
    console.log('\n=== Manual Control Setup ===\n');

    // Set default but disable auto-apply
    await credits.setDefaultQuota({
        level: 'namespace',
        service: 'ai_chat',
        quotaLimit: 50000,
        period: 'monthly',
        autoApply: false,        // Don't auto-apply
    });

    console.log('✓ Default configured but NOT auto-applying');
    console.log('  You can manually apply this default when needed');
}

// =============================================================================
// Example 10: Multi-Service Configuration
// =============================================================================

async function configureAllServices() {
    console.log('\n=== Configure All Services ===\n');

    const services = [
        { name: 'ai_chat', namespace: 100000, endUser: 5000 },
        { name: 'ai_image', namespace: 50000, endUser: 2000 },
        { name: 'deployment', namespace: null, endUser: null },  // Unlimited
        { name: 'sandbox', namespace: 20000, endUser: 1000 },
    ];

    for (const service of services) {
        // Namespace level
        await credits.setDefaultQuota({
            level: 'namespace',
            service: service.name,
            quotaLimit: service.namespace,
            period: 'monthly',
            autoApply: true,
        });

        // End-user level
        await credits.setDefaultQuota({
            level: 'end_user',
            service: service.name,
            quotaLimit: service.endUser,
            period: 'monthly',
            autoApply: true,
        });

        const nsLimit = service.namespace ? `${service.namespace}/month` : 'unlimited';
        const euLimit = service.endUser ? `${service.endUser}/month` : 'unlimited';
        console.log(`✓ ${service.name}: namespace=${nsLimit}, end-user=${euLimit}`);
    }

    console.log('\n✅ All services configured with defaults!');
}

// =============================================================================
// Run examples
// =============================================================================

async function runExamples() {
    try {
        await setDefaultNamespaceQuotas();
        await setDefaultEndUserQuotas();
        await getAllDefaults();
        await getSpecificDefault();
        await toggleAutoApply();
        await updateDefault();
        // await deleteDefault();  // Commented to preserve config
        await completeSaaSSetup();
        await manualControlSetup();
        await configureAllServices();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples().catch(console.error);
}

export {
    setDefaultNamespaceQuotas,
    setDefaultEndUserQuotas,
    getAllDefaults,
    getSpecificDefault,
    toggleAutoApply,
    updateDefault,
    deleteDefault,
    completeSaaSSetup,
    manualControlSetup,
    configureAllServices,
};

