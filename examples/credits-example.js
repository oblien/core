/**
 * Example: Using Oblien Credits SDK
 * 
 * This demonstrates how to manage credits, set quotas, track usage,
 * and handle purchases using the oblien/credits module.
 */

import { OblienClient } from 'oblien';
import { OblienCredits } from 'oblien/credits';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
    baseURL: 'https://api.oblien.com',
});

// Initialize credits manager
const credits = new OblienCredits(client);

// =============================================================================
// Example 1: Get Balance
// =============================================================================

async function getBalance() {
    try {
        const balance = await credits.getBalance();
        console.log('Current balance:', balance, 'credits');
    } catch (error) {
        console.error('Error getting balance:', error.message);
    }
}

// =============================================================================
// Example 2: Get Namespace Quotas
// =============================================================================

async function getNamespaceQuotas() {
    try {
        const result = await credits.getNamespaceQuotas({
            limit: 50,
            status: 'active', // active, warning, exceeded
            search: 'production',
        });

        console.log('Namespaces:', result.data);
        console.log('Aggregations:', result.aggregations); // Total stats
        console.log('Pagination:', result.pagination);
    } catch (error) {
        console.error('Error getting quotas:', error.message);
    }
}

// =============================================================================
// Example 3: Get Namespace Details
// =============================================================================

async function getNamespaceDetails() {
    try {
        const details = await credits.getNamespaceDetails('production', {
            days: 30,
        });

        console.log('Namespace details:');
        console.log('- Quotas:', details.quotas);
        console.log('- Usage stats:', details.usage);
        console.log('- Recent transactions:', details.transactions);
    } catch (error) {
        console.error('Error getting namespace details:', error.message);
    }
}

// =============================================================================
// Example 4: Set Namespace Quota
// =============================================================================

async function setQuota() {
    try {
        const quota = await credits.setQuota({
            namespace: 'production',
            service: 'ai',
            quotaLimit: 10000,
            period: 'monthly', // daily, monthly, unlimited
        });

        console.log('Quota set:', quota);
    } catch (error) {
        console.error('Error setting quota:', error.message);
    }
}

// =============================================================================
// Example 5: Reset Quota
// =============================================================================

async function resetQuota() {
    try {
        await credits.resetQuota('production', 'ai');
        console.log('Quota reset successfully');
    } catch (error) {
        console.error('Error resetting quota:', error.message);
    }
}

// =============================================================================
// Example 5a: Set End User Quota (Optional Third Level)
// =============================================================================

async function setEndUserQuota() {
    try {
        const quota = await credits.setEndUserQuota({
            namespace: 'production',
            endUserId: 'user_123',
            service: 'ai_chat',
            quotaLimit: 1000,
            period: 'monthly',
        });

        console.log('End user quota set:', quota);
    } catch (error) {
        console.error('Error setting end user quota:', error.message);
    }
}

// =============================================================================
// Example 5b: Get End User Quota
// =============================================================================

async function getEndUserQuota() {
    try {
        const quota = await credits.getEndUserQuota(
            'production',
            'user_123',
            'ai_chat'
        );

        console.log('End user quota:');
        console.log('- Limit:', quota.quota.limit);
        console.log('- Used:', quota.quota.used);
        console.log('- Remaining:', quota.quota.remaining);
        console.log('- Period:', quota.quota.period);
    } catch (error) {
        console.error('Error getting end user quota:', error.message);
    }
}

// =============================================================================
// Example 5c: Reset End User Quota
// =============================================================================

async function resetEndUserQuota() {
    try {
        await credits.resetEndUserQuota('production', 'user_123', 'ai_chat');
        console.log('End user quota reset successfully');
    } catch (error) {
        console.error('Error resetting end user quota:', error.message);
    }
}

// =============================================================================
// Example 6: Get Usage History
// =============================================================================

async function getHistory() {
    try {
        const history = await credits.getHistory({
            namespace: 'production',
            service: 'ai',
            type: 'deduction', // deduction, addition, refund, adjustment
            limit: 50,
            offset: 0,
            // Or use cursor pagination:
            // after: '2024-01-15T00:00:00Z',
            // afterId: 12345,
        });

        console.log('Transaction history:', history.data);
        console.log('Pagination:', history.pagination);
    } catch (error) {
        console.error('Error getting history:', error.message);
    }
}

// =============================================================================
// Example 7: Get History Filters
// =============================================================================

async function getFilters() {
    try {
        const filters = await credits.getHistoryFilters();
        console.log('Available namespaces:', filters.namespaces);
        console.log('Available services:', filters.services);
    } catch (error) {
        console.error('Error getting filters:', error.message);
    }
}

// =============================================================================
// Example 8: Get Usage Summary
// =============================================================================

async function getSummary() {
    try {
        const summary = await credits.getSummary({
            namespace: 'production',
            days: 30,
            limit: 10,
        });

        console.log('Usage summary:', summary);
        // Shows aggregated usage by namespace/service
    } catch (error) {
        console.error('Error getting summary:', error.message);
    }
}

// =============================================================================
// Example 9: Get Usage Stats (for charts)
// =============================================================================

async function getUsageStats() {
    try {
        const stats = await credits.getUsageStats({ days: 7 });
        console.log('Daily usage statistics:', stats);
        // Perfect for building charts
    } catch (error) {
        console.error('Error getting stats:', error.message);
    }
}

// =============================================================================
// Example 10: Get Credit Packages
// =============================================================================

async function getPackages() {
    try {
        const packages = await credits.getPackages();
        console.log('Available packages:', packages);
        /*
        [
          {
            id: 'starter',
            name: 'Starter',
            credits: 10000,
            price: 10.00,
            currency: 'USD'
          },
          ...
        ]
        */
    } catch (error) {
        console.error('Error getting packages:', error.message);
    }
}

// =============================================================================
// Example 11: Get Pricing Info
// =============================================================================

async function getPricingInfo() {
    try {
        const info = await credits.getPricingInfo();
        console.log('Pricing info:', info);
        // Includes rates, minimums, maximums, etc.
    } catch (error) {
        console.error('Error getting pricing:', error.message);
    }
}

// =============================================================================
// Example 12: Calculate Cost
// =============================================================================

async function calculateCost() {
    try {
        // Calculate by package
        const byPackage = await credits.calculateCost({
            packageId: 'pro',
        });
        console.log('Pro package:', byPackage);

        // Calculate by amount
        const byAmount = await credits.calculateCost({
            amount: 100, // $100
        });
        console.log('$100 gets you:', byAmount.credits, 'credits');

        // Calculate by credits
        const byCredits = await credits.calculateCost({
            credits: 50000,
        });
        console.log('50,000 credits cost:', byCredits.amount);
    } catch (error) {
        console.error('Error calculating:', error.message);
    }
}

// =============================================================================
// Example 13: Calculate Credits Preview
// =============================================================================

async function calculateCredits() {
    try {
        const result = await credits.calculateCredits(50); // $50
        console.log('$50 gets you:', result.credits, 'credits');
    } catch (error) {
        console.error('Error calculating:', error.message);
    }
}

// =============================================================================
// Example 14: Create Checkout (Purchase Credits)
// =============================================================================

async function createCheckout() {
    try {
        // Purchase by package
        const checkout = await credits.createCheckout({
            packageId: 'pro',
        });

        console.log('Checkout URL:', checkout.checkoutUrl);
        console.log('Session ID:', checkout.sessionId);
        
        // Redirect user to checkout.checkoutUrl
    } catch (error) {
        console.error('Error creating checkout:', error.message);
    }
}

// =============================================================================
// Example 15: Purchase with Custom Amount
// =============================================================================

async function purchaseCustomAmount() {
    try {
        const checkout = await credits.createCheckout({
            amount: 75.50, // Custom amount
            metadata: {
                source: 'web-dashboard',
            },
        });

        console.log('Checkout created:', checkout);
    } catch (error) {
        console.error('Error creating checkout:', error.message);
    }
}

// =============================================================================
// Example 16: Get Purchase History
// =============================================================================

async function getPurchaseHistory() {
    try {
        // Get light version (faster)
        const history = await credits.getPurchaseHistory({
            limit: 20,
            offset: 0,
            light: true, // Basic data only
        });

        console.log('Purchases:', history.data);
        console.log('Total:', history.total);
        
        // Get full version with invoice PDFs, receipts, etc
        const fullHistory = await credits.getPurchaseHistory({
            limit: 20,
            light: false,
        });
        console.log('Full purchase data:', fullHistory.data);
    } catch (error) {
        console.error('Error getting history:', error.message);
    }
}

// =============================================================================
// Example 17: Get Purchase Details
// =============================================================================

async function getPurchaseDetails() {
    try {
        const purchase = await credits.getPurchaseDetails('purchase-id');
        console.log('Purchase details:', purchase);
        // Includes invoice PDF, receipt, payment info, etc.
    } catch (error) {
        console.error('Error getting purchase:', error.message);
    }
}

// =============================================================================
// Example 18: Get Purchase Session (for pending purchases)
// =============================================================================

async function getPurchaseSession() {
    try {
        const session = await credits.getPurchaseSession('purchase-id');
        console.log('Checkout URL:', session.checkoutUrl);
        // Can redirect user to complete pending purchase
    } catch (error) {
        console.error('Error getting session:', error.message);
    }
}

// =============================================================================
// Example 19: Cancel Purchase
// =============================================================================

async function cancelPurchase() {
    try {
        await credits.cancelPurchase('purchase-id');
        console.log('Purchase canceled successfully');
    } catch (error) {
        console.error('Error canceling purchase:', error.message);
    }
}

// =============================================================================
// Example 20: Complete Workflow
// =============================================================================

async function completeWorkflow() {
    try {
        // 1. Check current balance
        const balance = await credits.getBalance();
        console.log('Current balance:', balance);

        // 2. Get quotas
        const quotas = await credits.getNamespaceQuotas();
        console.log('Quotas:', quotas.data);

        // 3. Set new quota
        await credits.setQuota({
            namespace: 'production',
            service: 'ai',
            quotaLimit: 20000,
            period: 'monthly',
        });

        // 4. Track usage
        const usage = await credits.getUsageStats({ days: 7 });
        console.log('Usage stats:', usage);

        // 5. If low balance, purchase more
        if (balance < 1000) {
            const checkout = await credits.createCheckout({
                packageId: 'pro',
            });
            console.log('Please complete payment:', checkout.checkoutUrl);
        }
    } catch (error) {
        console.error('Workflow error:', error.message);
    }
}

// =============================================================================
// Example 21: Multi-Level Usage Management (Client > Namespace > End User)
// =============================================================================

async function multiLevelManagement() {
    try {
        console.log('=== Multi-Level Usage Management ===\n');

        // Level 1: Client Balance
        const balance = await credits.getBalance();
        console.log('Level 1 - Client Balance:', balance, 'credits\n');

        // Level 2: Namespace Quotas
        console.log('Level 2 - Setting Namespace Quotas:');
        await credits.setQuota({
            namespace: 'production',
            service: 'ai_chat',
            quotaLimit: 50000,
            period: 'monthly',
        });
        console.log('✓ Production namespace: 50,000 credits/month\n');

        // Level 3: End User Quotas (optional)
        console.log('Level 3 - Setting End User Quotas:');
        
        // Set quota for user_123
        await credits.setEndUserQuota({
            namespace: 'production',
            endUserId: 'user_123',
            service: 'ai_chat',
            quotaLimit: 1000,
            period: 'monthly',
        });
        console.log('✓ User 123: 1,000 credits/month');

        // Set quota for user_456
        await credits.setEndUserQuota({
            namespace: 'production',
            endUserId: 'user_456',
            service: 'ai_chat',
            quotaLimit: 500,
            period: 'monthly',
        });
        console.log('✓ User 456: 500 credits/month\n');

        // Monitor usage per end user
        console.log('Monitoring End User Usage:');
        const users = ['user_123', 'user_456'];
        
        for (const userId of users) {
            const quota = await credits.getEndUserQuota('production', userId, 'ai_chat');
            const used = quota.quota.used;
            const limit = quota.quota.limit;
            const remaining = quota.quota.remaining;
            const percentage = ((used / limit) * 100).toFixed(1);
            
            console.log(`- ${userId}: ${used}/${limit} (${percentage}% used, ${remaining} remaining)`);
            
            // Get user's transaction history
            const history = await credits.getHistory({
                namespace: 'production',
                endUserId: userId,
                service: 'ai_chat',
                limit: 5,
            });
            console.log(`  Recent transactions: ${history.data.length}`);
        }

        console.log('\n✅ Multi-level management complete!');
    } catch (error) {
        console.error('Error in multi-level management:', error.message);
    }
}

// =============================================================================
// Example 22: SaaS Use Case - Manage Customer End Users
// =============================================================================

async function saasUseCase() {
    try {
        console.log('=== SaaS Use Case: Customer End User Management ===\n');

        const CUSTOMER_NAMESPACE = 'customer_acme';
        const SERVICE = 'ai_chat';

        // 1. Set customer-wide quota (namespace level)
        console.log('1. Setting customer-wide quota:');
        await credits.setQuota({
            namespace: CUSTOMER_NAMESPACE,
            service: SERVICE,
            quotaLimit: 100000,
            period: 'monthly',
        });
        console.log('✓ Customer quota: 100,000 credits/month\n');

        // 2. Set individual user limits
        console.log('2. Setting per-user limits:');
        const endUsers = [
            { id: 'employee_john', limit: 5000 },
            { id: 'employee_jane', limit: 3000 },
            { id: 'employee_bob', limit: 2000 },
        ];

        for (const user of endUsers) {
            await credits.setEndUserQuota({
                namespace: CUSTOMER_NAMESPACE,
                endUserId: user.id,
                service: SERVICE,
                quotaLimit: user.limit,
                period: 'monthly',
            });
            console.log(`✓ ${user.id}: ${user.limit} credits/month`);
        }

        // 3. Monitor and report
        console.log('\n3. Usage Report:');
        let totalUsed = 0;
        
        for (const user of endUsers) {
            const quota = await credits.getEndUserQuota(CUSTOMER_NAMESPACE, user.id, SERVICE);
            totalUsed += quota.quota.used;
            
            const percentage = ((quota.quota.used / quota.quota.limit) * 100).toFixed(1);
            console.log(`- ${user.id}: ${quota.quota.used}/${quota.quota.limit} (${percentage}%)`);
        }

        console.log(`\nTotal customer usage: ${totalUsed} credits`);
        console.log('✅ SaaS use case complete!');
    } catch (error) {
        console.error('Error in SaaS use case:', error.message);
    }
}

// =============================================================================
// Run examples
// =============================================================================

async function runExamples() {
    await getBalance();
    await getNamespaceQuotas();
    await getPackages();
    await calculateCost();
    await getUsageStats();
    await getSummary();
    
    // Uncomment to test other examples:
    // await createCheckout();
    // await getPurchaseHistory();
    // await multiLevelManagement();
    // await saasUseCase();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples().catch(console.error);
}

export {
    getBalance,
    getNamespaceQuotas,
    getNamespaceDetails,
    setQuota,
    resetQuota,
    setEndUserQuota,
    getEndUserQuota,
    resetEndUserQuota,
    getHistory,
    getFilters,
    getSummary,
    getUsageStats,
    getPackages,
    getPricingInfo,
    calculateCost,
    calculateCredits,
    createCheckout,
    purchaseCustomAmount,
    getPurchaseHistory,
    getPurchaseDetails,
    getPurchaseSession,
    cancelPurchase,
    completeWorkflow,
    multiLevelManagement,
    saasUseCase,
};

