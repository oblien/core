/**
 * Oblien Agents - Complete Examples with Settings & Tools
 */

import { OblienClient } from 'oblien';
import { OblienAgents } from 'oblien/agents';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const agents = new OblienAgents(client);

// ============================================================================
// TOOLS MANAGEMENT
// ============================================================================

async function toolsExamples() {
    // Access tools manager
    const tools = agents.tools;

    // 1. List all tools
    const allTools = await tools.list();
    console.log('All tools:', allTools.tools);

    // 2. Filter tools by type
    const clientTools = await tools.list({ type: 'client' });
    console.log('Client-side tools:', clientTools.tools);

    // 3. Filter tools by category
    const fileTools = await tools.list({ category: 'file' });
    console.log('File tools:', fileTools.tools);

    // 4. Get my custom tools only
    const myTools = await tools.list({ myCustomTools: true });
    console.log('My custom tools:', myTools.tools);

    // 5. Search tools
    const searchResults = await tools.search('search', {
        category: 'web'
    });
    console.log('Search results:', searchResults.tools);

    // 6. Get specific tool
    const tool = await tools.get('web-search');
    console.log('Tool details:', tool);

    // 7. Create custom client-side tool
    const customTool = await tools.create({
        slug: 'my-custom-tool',
        tool_name: 'My Custom Tool',
        tool_description: 'Custom tool for specific task',
        type: 'client',
        category: 'custom',
        input_scheme: {
            type: 'object',
            properties: {
                input: { type: 'string' }
            }
        },
        output_scheme: {
            type: 'object',
            properties: {
                result: { type: 'string' }
            }
        },
        prompt: 'Process the input and return result',
        require_environment: false
    });
    console.log('Created tool:', customTool);

    // 8. Validate tool IDs before assigning to agent
    const validation = await tools.validate([
        'web-search',
        'calculator',
        'invalid-tool'
    ]);
    console.log('Valid tools:', validation.validIds);
    console.log('Invalid tools:', validation.invalidIds);
}

// ============================================================================
// AGENT SETTINGS - PROPER STRUCTURE
// ============================================================================

async function settingsExamples() {
    const agentId = 'your-agent-id';

    // Access agent instance
    const agent = agents.agent(agentId);

    // Get settings manager
    const settings = agent.settings;

    // 1. Update Boolean Switches
    await settings.updateSwitches({
        enable_memory: true,
        allow_thinking: true,
        allow_images: true,
        allow_videos: false,
        allow_audio: false,
        allow_documents: true,
        allow_built_in: true
    });
    console.log('✓ Switches updated');

    // 2. Update Model Configuration
    await settings.updateModelConfig({
        model: 'oblien-master',
        temperature: 0.8,
        max_tokens: 3000,
        top_p: 0.9
    });
    console.log('✓ Model config updated');

    // 3. Update Tools (assign validated tools)
    await settings.updateTools([
        'web-search',
        'calculator',
        'file-read',
        'file-write'
    ]);
    console.log('✓ Tools updated');

    // 4. Update Guest Limits
    await settings.updateGuestLimits({
        enabled: true,
        max_requests_per_minute: 50,
        max_messages_per_hour: 500,
        max_messages_per_day: 5000,
        max_total_tokens_per_day: 100000,
        max_input_tokens_per_day: 50000,
        max_output_tokens_per_day: 50000
    });
    console.log('✓ Guest limits updated');

    // 5. Update Context Settings
    await settings.updateContext({
        max_history_messages: 40,
        history_token_limit: 4000
    });
    console.log('✓ Context updated');

    // 6. Get all settings
    const allSettings = await settings.getAll();
    console.log('All settings:', allSettings);
}

// ============================================================================
// COMPLETE AGENT WORKFLOW
// ============================================================================

async function completeWorkflow() {
    // Step 1: Create Agent
    const agent = await agents.create({
        name: 'Customer Support Agent',
        description: 'AI agent for customer support',
        namespace: 'production',
        prompts: {
            identity: 'You are a helpful customer support agent.',
            rules: 'Always be polite and professional.',
            guidelines: 'Provide clear solutions.'
        }
    });

    const agentId = agent.agentId || agent.id;
    console.log('✓ Agent created:', agentId);

    // Step 2: Configure Settings
    const agentInstance = agents.agent(agentId);
    const settings = agentInstance.settings;

    // Configure model
    await settings.updateModelConfig({
        model: 'oblien-master',
        temperature: 0.7,
        max_tokens: 2000
    });

    // Configure switches
    await settings.updateSwitches({
        enable_memory: true,
        allow_thinking: true,
        allow_images: true,
        allow_documents: true
    });

    // Step 3: Assign Tools
    // First, validate tools
    const toolValidation = await agents.tools.validate([
        'web-search',
        'calculator',
        'file-read'
    ]);

    if (toolValidation.valid) {
        await settings.updateTools(toolValidation.validIds);
        console.log('✓ Tools assigned:', toolValidation.validIds);
    }

    // Step 4: Set Guest Limits
    await settings.updateGuestLimits({
        enabled: true,
        max_messages_per_day: 1000,
        max_total_tokens_per_day: 50000
    });

    // Step 5: Verify Configuration
    const agentDetails = await agents.get(agentId);
    console.log('✓ Agent configured:', {
        name: agentDetails.agent_name,
        settings: agentDetails.settings,
        tools: agentDetails.tools
    });

    return agentInstance;
}

// ============================================================================
// SETTINGS VS DIRECT METHODS
// ============================================================================

async function comparisonExample() {
    const agentId = 'your-agent-id';

    // ❌ OLD WAY (flat, not structured):
    // await agents.updateModelConfig(agentId, { temperature: 0.8 });
    // await agents.updateTools(agentId, ['tool1']);

    // ✅ NEW WAY (proper structure with sections):
    const agent = agents.agent(agentId);
    
    // Settings are organized by section
    await agent.settings.updateModelConfig({
        model: 'oblien-master',
        temperature: 0.8,
        max_tokens: 3000
    });

    await agent.settings.updateTools([
        'web-search',
        'calculator'
    ]);

    await agent.settings.updateSwitches({
        enable_memory: true,
        allow_thinking: true
    });

    // Clean separation of concerns
    const overview = await agent.getOverview({ days: 7 });
    const sessions = await agent.getSessions({ limit: 10 });
    
    console.log('Agent overview:', overview);
    console.log('Recent sessions:', sessions);
}

// ============================================================================
// TOOLS + AGENT INTEGRATION
// ============================================================================

async function toolsIntegrationExample() {
    // 1. Browse available tools
    const tools = agents.tools;
    const availableTools = await tools.list({ type: 'client' });
    
    console.log('Available client tools:');
    availableTools.tools.forEach(tool => {
        console.log(`- ${tool.tool_name} (${tool.slug})`);
        console.log(`  Category: ${tool.category}`);
        console.log(`  Requires environment: ${tool.require_environment}`);
    });

    // 2. Create custom tool
    const customTool = await tools.create({
        slug: 'data-analyzer',
        tool_name: 'Data Analyzer',
        tool_description: 'Analyzes data and returns insights',
        type: 'client',
        category: 'custom',
        input_scheme: {
            type: 'object',
            properties: {
                data: { type: 'array' }
            }
        },
        require_environment: false
    });

    // 3. Assign tools to agent
    const agent = agents.agent('your-agent-id');
    await agent.settings.updateTools([
        'web-search',
        'calculator',
        'data-analyzer'  // Our custom tool
    ]);

    console.log('✓ Tools assigned to agent');
}

// ============================================================================
// TYPE DEFINITIONS (for TypeScript users)
// ============================================================================

/**
 * @typedef {Object} AgentSwitches
 * @property {boolean} [enable_memory] - Enable conversation memory
 * @property {boolean} [allow_thinking] - Allow thinking process
 * @property {boolean} [allow_images] - Allow image uploads
 * @property {boolean} [allow_videos] - Allow video uploads
 * @property {boolean} [allow_audio] - Allow audio uploads
 * @property {boolean} [allow_documents] - Allow document uploads
 * @property {boolean} [allow_built_in] - Allow built-in tools
 */

/**
 * @typedef {Object} ModelConfig
 * @property {string} [model] - Model name (e.g., 'oblien-master')
 * @property {number} [temperature] - Temperature 0-2 (default: 1)
 * @property {number} [max_tokens] - Max tokens 1-200000 (default: 2000)
 * @property {number} [top_p] - Top P 0-1 (default: 1)
 */

/**
 * @typedef {Object} GuestLimits
 * @property {boolean} [enabled] - Enable guest limits
 * @property {number} [max_requests_per_minute] - Max requests per minute (1-1000)
 * @property {number} [max_messages_per_hour] - Max messages per hour (1-10000)
 * @property {number} [max_messages_per_day] - Max messages per day (1-50000)
 * @property {number} [max_total_tokens_per_day] - Max total tokens per day
 * @property {number} [max_input_tokens_per_day] - Max input tokens per day
 * @property {number} [max_output_tokens_per_day] - Max output tokens per day
 */

/**
 * @typedef {Object} ContextSettings
 * @property {number} [max_history_messages] - Max history messages
 * @property {number} [history_token_limit] - History token limit
 */

/**
 * @typedef {Object} ToolData
 * @property {string} slug - Unique tool slug/ID
 * @property {string} tool_name - Tool name
 * @property {string} tool_description - Tool description
 * @property {string} [icon] - Tool icon
 * @property {'client'|'server'|'hybrid'} [type] - Tool type
 * @property {string} [category] - Tool category
 * @property {Object} [input_scheme] - Input schema
 * @property {Object} [output_scheme] - Output schema
 * @property {string} [prompt] - Tool prompt
 * @property {boolean} [require_environment] - Requires context
 * @property {string} [context_type] - Context type
 */

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
    try {
        // Uncomment to run specific examples:
        
        // await toolsExamples();
        // await settingsExamples();
        // await completeWorkflow();
        // await comparisonExample();
        // await toolsIntegrationExample();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    toolsExamples,
    settingsExamples,
    completeWorkflow,
    comparisonExample,
    toolsIntegrationExample
};

