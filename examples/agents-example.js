/**
 * Oblien Agents Module - Usage Examples
 */

import { OblienClient } from 'oblien';
import { OblienAgents } from 'oblien/agents';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
    baseURL: 'https://api.oblien.com'
});

// Initialize agents module
const agents = new OblienAgents(client);

// ============================================================================
// EXAMPLE 1: Create a new agent
// ============================================================================
async function createAgent() {
    const agent = await agents.create({
        name: 'Customer Support Agent',
        description: 'AI agent for customer support',
        namespace: 'production',
        prompts: {
            identity: 'You are a helpful customer support agent.',
            rules: 'Always be polite and professional.',
            guidelines: 'Provide clear and concise answers.'
        },
        settings: {
            model: 'oblien-master',
            temperature: 0.7,
            max_tokens: 2000,
            enable_memory: true,
            allow_thinking: true
        }
    });

    console.log('Created agent:', agent.agentId);
    return agent;
}

// ============================================================================
// EXAMPLE 2: List all agents with namespace filter
// ============================================================================
async function listAgents() {
    const result = await agents.list({
        limit: 50,
        offset: 0,
        namespace: 'production'
    });

    console.log(`Found ${result.agents.length} agents`);
    result.agents.forEach(agent => {
        console.log(`- ${agent.agent_name} (${agent.agent_id})`);
    });

    return result;
}

// ============================================================================
// EXAMPLE 3: Search agents
// ============================================================================
async function searchAgents() {
    const results = await agents.search('support', {
        limit: 20,
        namespace: 'production'
    });

    console.log('Search results:', results.agents);
    return results;
}

// ============================================================================
// EXAMPLE 4: Get agent details
// ============================================================================
async function getAgentDetails(agentId) {
    // Get full agent details
    const agent = await agents.get(agentId);
    console.log('Agent:', agent);

    // Get specific section (e.g., prompts only)
    const prompts = await agents.get(agentId, 'prompts');
    console.log('Agent prompts:', prompts);

    return agent;
}

// ============================================================================
// EXAMPLE 5: Update agent
// ============================================================================
async function updateAgent(agentId) {
    const result = await agents.update(agentId, {
        name: 'Updated Agent Name',
        description: 'Updated description',
        namespace: 'production' // For validation
    });

    console.log('Agent updated:', result);
    return result;
}

// ============================================================================
// EXAMPLE 6: Update agent settings (various endpoints)
// ============================================================================
async function updateAgentSettings(agentId) {
    // Update model configuration
    await agents.updateModelConfig(agentId, {
        model: 'oblien-master',
        temperature: 0.8,
        max_tokens: 3000
    });

    // Update switches
    await agents.updateSwitches(agentId, {
        enable_memory: true,
        allow_thinking: true,
        allow_images: false
    });

    // Update tools
    await agents.updateTools(agentId, ['web-search', 'calculator']);

    // Update guest limits
    await agents.updateGuestLimits(agentId, {
        daily_tokens: 10000,
        daily_messages: 50
    });

    console.log('Settings updated');
}

// ============================================================================
// EXAMPLE 7: Get agent analytics
// ============================================================================
async function getAgentAnalytics(agentId) {
    const overview = await agents.getOverview(agentId, {
        days: 30 // Last 30 days
    });

    console.log('Agent Analytics:');
    console.log('- Total chats:', overview.total_chats);
    console.log('- Total messages:', overview.total_messages);
    console.log('- Total tokens:', overview.total_tokens);
    console.log('- Usage data:', overview.usage_data);

    return overview;
}

// ============================================================================
// EXAMPLE 8: Get agent sessions
// ============================================================================
async function getAgentSessions(agentId) {
    const sessions = await agents.getSessions(agentId, {
        limit: 20,
        offset: 0,
        search: 'user query',
        sortBy: 'time',
        sortOrder: 'desc'
    });

    console.log(`Found ${sessions.sessions.length} sessions`);
    return sessions;
}

// ============================================================================
// EXAMPLE 9: Manage agent users
// ============================================================================
async function manageAgentUsers(agentId) {
    // Get all users
    const users = await agents.getUsers(agentId);
    console.log('Agent users:', users);

    // Get specific user
    const user = await agents.getUser(agentId, 'user123');
    console.log('User details:', user);

    // Reset user limits
    const reset = await agents.resetUserLimits(agentId, 'user123');
    console.log('Limits reset:', reset);

    return users;
}

// ============================================================================
// EXAMPLE 10: Get bans for agent
// ============================================================================
async function getAgentBans(agentId) {
    const bans = await agents.getBans(agentId);
    console.log('Agent bans:', bans);
    return bans;
}

// ============================================================================
// EXAMPLE 11: Get platform stats
// ============================================================================
async function getPlatformStats() {
    const stats = await agents.getStats();
    console.log('Platform Stats:');
    console.log('- Total agents:', stats.stats.agents.total);
    console.log('- Active agents:', stats.stats.agents.active);
    console.log('- Total tokens:', stats.stats.tokens.total);
    console.log('- Sessions this month:', stats.stats.sessions.thisMonth);

    return stats;
}

// ============================================================================
// EXAMPLE 12: Delete agent (with namespace validation)
// ============================================================================
async function deleteAgent(agentId) {
    const result = await agents.delete(agentId, {
        namespace: 'production' // Optional validation
    });

    console.log('Agent deleted:', result);
    return result;
}

// ============================================================================
// EXAMPLE 13: Using Agent instance for chaining operations
// ============================================================================
async function usingAgentInstance(agentId) {
    // Create an agent instance
    const agent = agents.agent(agentId);

    // Chain operations
    const details = await agent.get();
    console.log('Agent details:', details);

    const overview = await agent.getOverview({ days: 7 });
    console.log('Agent overview:', overview);

    const sessions = await agent.getSessions({ limit: 10 });
    console.log('Recent sessions:', sessions);

    // Update settings
    await agent.updateModelConfig({
        temperature: 0.9,
        max_tokens: 4000
    });

    await agent.updateTools(['web-search', 'code-interpreter']);

    console.log('Agent operations completed');
}

// ============================================================================
// EXAMPLE 14: Complete workflow - Create, configure, and use agent
// ============================================================================
async function completeWorkflow() {
    try {
        // 1. Create agent
        console.log('Step 1: Creating agent...');
        const newAgent = await agents.create({
            name: 'Sales Assistant',
            description: 'AI agent for sales inquiries',
            namespace: 'production',
            prompts: {
                identity: 'You are a knowledgeable sales assistant.',
                rules: 'Focus on product benefits and customer needs.',
                guidelines: 'Always offer solutions, not just information.'
            }
        });

        const agentId = newAgent.agentId || newAgent.id;
        console.log('✓ Agent created:', agentId);

        // 2. Configure settings
        console.log('\nStep 2: Configuring agent...');
        await agents.updateModelConfig(agentId, {
            model: 'oblien-master',
            temperature: 0.7,
            max_tokens: 2000
        });

        await agents.updateTools(agentId, ['web-search', 'calculator']);

        await agents.updateGuestLimits(agentId, {
            daily_tokens: 50000,
            daily_messages: 100
        });
        console.log('✓ Agent configured');

        // 3. Get agent details
        console.log('\nStep 3: Verifying agent...');
        const agent = await agents.get(agentId);
        console.log('✓ Agent verified:', agent.agent_name);

        // 4. Get initial analytics
        console.log('\nStep 4: Getting analytics...');
        const analytics = await agents.getOverview(agentId, { days: 1 });
        console.log('✓ Analytics:', analytics);

        return {
            agentId,
            agent,
            analytics
        };

    } catch (error) {
        console.error('Error in workflow:', error.message);
        throw error;
    }
}

// ============================================================================
// Run examples
// ============================================================================
async function main() {
    try {
        // Uncomment the examples you want to run

        // await createAgent();
        // await listAgents();
        // await searchAgents();
        // await getPlatformStats();
        // await completeWorkflow();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    createAgent,
    listAgents,
    searchAgents,
    getAgentDetails,
    updateAgent,
    updateAgentSettings,
    getAgentAnalytics,
    getAgentSessions,
    manageAgentUsers,
    getAgentBans,
    getPlatformStats,
    deleteAgent,
    usingAgentInstance,
    completeWorkflow
};

