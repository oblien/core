import { Oblien } from '../index.js';

// Initialize
const client = new Oblien({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
});

async function guestLimitsExamples() {
    const agentId = 'your-agent-id';
    
    console.log('🔧 Agent Guest Limits Examples\n');
    console.log('='.repeat(60));
    
    // ========================================
    // 1. Simple: Enable/Disable Guest Limits
    // ========================================
    console.log('\n📝 Example 1: Enable/Disable Guest Limits');
    console.log('-'.repeat(60));
    
    // Disable guest limits (no restrictions)
    await client.agents.settings(agentId).setGuestLimits(false);
    console.log('✓ Guest limits disabled');
    
    // Enable guest limits (uses defaults)
    await client.agents.settings(agentId).setGuestLimits(true);
    console.log('✓ Guest limits enabled with defaults');
    
    // ========================================
    // 2. Set Limits with Individual Parameters
    // ========================================
    console.log('\n📝 Example 2: Set Limits with Parameters');
    console.log('-'.repeat(60));
    
    // Enable with specific rate limits
    await client.agents.settings(agentId).setGuestLimits(
        true,    // enabled
        120,     // max_requests_per_minute
        200,     // max_messages_per_hour
        1000,    // max_messages_per_day
        150000,  // max_total_tokens_per_day
        75000,   // max_input_tokens_per_day
        75000    // max_output_tokens_per_day
    );
    console.log('✓ Guest limits set with parameters:');
    console.log('  - 120 requests/minute');
    console.log('  - 200 messages/hour');
    console.log('  - 1000 messages/day');
    console.log('  - 150K tokens/day');
    
    // ========================================
    // 3. Set Limits with Object (Most Flexible)
    // ========================================
    console.log('\n📝 Example 3: Set Limits with Object');
    console.log('-'.repeat(60));
    
    // Full control with object
    await client.agents.settings(agentId).setGuestLimits({
        enabled: true,
        max_requests_per_minute: 100,
        max_messages_per_hour: 150,
        max_messages_per_day: 800,
        max_total_tokens_per_day: 120000,
        max_input_tokens_per_day: 60000,
        max_output_tokens_per_day: 60000
    });
    console.log('✓ Guest limits updated with object');
    
    // ========================================
    // 4. Partial Updates
    // ========================================
    console.log('\n📝 Example 4: Partial Updates');
    console.log('-'.repeat(60));
    
    // Update only specific limits
    await client.agents.settings(agentId).setGuestLimits({
        max_messages_per_day: 2000,
        max_total_tokens_per_day: 200000
    });
    console.log('✓ Updated daily message and token limits only');
    
    // ========================================
    // 5. Get Current Limits
    // ========================================
    console.log('\n📝 Example 5: Get Current Limits');
    console.log('-'.repeat(60));
    
    const limits = await client.agents.settings(agentId).getGuestLimits();
    console.log('Current guest limits:', JSON.stringify(limits, null, 2));
    
    // ========================================
    // 6. Common Use Cases
    // ========================================
    console.log('\n📝 Example 6: Common Use Cases');
    console.log('-'.repeat(60));
    
    // Strict limits for free tier
    console.log('\n🔒 Free Tier (Strict Limits):');
    await client.agents.settings(agentId).setGuestLimits({
        enabled: true,
        max_requests_per_minute: 30,      // 30/min
        max_messages_per_hour: 50,         // 50/hour
        max_messages_per_day: 200,         // 200/day
        max_total_tokens_per_day: 50000,   // 50K tokens/day
        max_input_tokens_per_day: 25000,
        max_output_tokens_per_day: 25000
    });
    console.log('✓ Set strict limits for free tier guests');
    
    // Premium limits for paid tier
    console.log('\n💎 Premium Tier (Generous Limits):');
    await client.agents.settings(agentId).setGuestLimits({
        enabled: true,
        max_requests_per_minute: 200,       // 200/min
        max_messages_per_hour: 500,         // 500/hour
        max_messages_per_day: 5000,         // 5K/day
        max_total_tokens_per_day: 1000000,  // 1M tokens/day
        max_input_tokens_per_day: 500000,
        max_output_tokens_per_day: 500000
    });
    console.log('✓ Set generous limits for premium guests');
    
    // No limits for testing/development
    console.log('\n🧪 Development Mode (No Limits):');
    await client.agents.settings(agentId).setGuestLimits(false);
    console.log('✓ All guest limits disabled for development');
    
    // ========================================
    // 7. Progressive Limits Strategy
    // ========================================
    console.log('\n📝 Example 7: Progressive Limits Strategy');
    console.log('-'.repeat(60));
    
    // Start with moderate limits
    console.log('\n📊 Initial Launch:');
    await client.agents.settings(agentId).setGuestLimits({
        enabled: true,
        max_requests_per_minute: 60,
        max_messages_per_day: 500,
        max_total_tokens_per_day: 100000
    });
    console.log('✓ Moderate limits for launch');
    
    // Adjust based on usage patterns
    console.log('\n📈 After Monitoring:');
    await client.agents.settings(agentId).setGuestLimits({
        max_requests_per_minute: 90,       // Increased by 50%
        max_messages_per_day: 750,         // Increased by 50%
        max_total_tokens_per_day: 150000   // Increased by 50%
    });
    console.log('✓ Limits adjusted based on usage patterns');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed!\n');
}

// Run examples
guestLimitsExamples()
    .then(() => {
        console.log('✓ Examples finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });

