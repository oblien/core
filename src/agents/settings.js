/**
 * Agent Settings Class
 * Manages all agent settings with proper sections
 */

export class AgentSettings {
    /**
     * @param {Object} options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} options.agentId - Agent ID
     */
    constructor({ client, agentId }) {
        if (!client) {
            throw new Error('Oblien client is required');
        }
        if (!agentId) {
            throw new Error('Agent ID is required');
        }

        this.client = client;
        this.agentId = agentId;
    }

    /**
     * Update boolean switches
     * @param {Object} switches - Switch values
     * @param {boolean} [switches.enable_memory] - Enable conversation memory
     * @param {boolean} [switches.allow_thinking] - Allow thinking process
     * @param {boolean} [switches.allow_images] - Allow image uploads
     * @param {boolean} [switches.allow_videos] - Allow video uploads
     * @param {boolean} [switches.allow_audio] - Allow audio uploads
     * @param {boolean} [switches.allow_documents] - Allow document uploads
     * @param {boolean} [switches.allow_built_in] - Allow built-in tools
     * @returns {Promise<Object>} Update result
     */
    async updateSwitches(switches) {
        return await this.client.put(`ai/agents/${this.agentId}/switches`, switches);
    }

    /**
     * Update model configuration
     * @param {Object} config - Model configuration
     * @param {string} [config.model] - Model name (e.g., 'oblien-master')
     * @param {number} [config.temperature] - Temperature 0-2 (default: 1)
     * @param {number} [config.max_tokens] - Max tokens 1-200000 (default: 2000)
     * @param {number} [config.top_p] - Top P 0-1 (default: 1)
     * @returns {Promise<Object>} Update result
     */
    async updateModelConfig(config) {
        return await this.client.put(`ai/agents/${this.agentId}/model-config`, config);
    }

    /**
     * Update tools array
     * @param {Array<string>} tools - Array of tool slugs
     * @returns {Promise<Object>} Update result
     */
    async updateTools(tools) {
        return await this.client.put(`ai/agents/${this.agentId}/tools`, { tools });
    }

    /**
     * Update guest limits
     * @param {Object} limits - Guest limit configuration
     * @param {boolean} [limits.enabled] - Enable guest limits
     * @param {number} [limits.max_requests_per_minute] - Max requests per minute (1-1000)
     * @param {number} [limits.max_messages_per_hour] - Max messages per hour (1-10000)
     * @param {number} [limits.max_messages_per_day] - Max messages per day (1-50000)
     * @param {number} [limits.max_total_tokens_per_day] - Max total tokens per day (1000-10000000)
     * @param {number} [limits.max_input_tokens_per_day] - Max input tokens per day (1000-10000000)
     * @param {number} [limits.max_output_tokens_per_day] - Max output tokens per day (1000-10000000)
     * @returns {Promise<Object>} Update result
     */
    async updateGuestLimits(limits) {
        return await this.client.put(`ai/agents/${this.agentId}/guest-limits`, limits);
    }

    /**
     * Update context settings
     * @param {Object} context - Context configuration
     * @param {number} [context.max_history_messages] - Max history messages
     * @param {number} [context.history_token_limit] - History token limit
     * @returns {Promise<Object>} Update result
     */
    async updateContext(context) {
        return await this.client.put(`ai/agents/${this.agentId}/context`, context);
    }

    /**
     * Get all settings sections
     * @returns {Promise<Object>} All settings
     */
    async getAll() {
        const agent = await this.client.get(`ai/agents/${this.agentId}`);
        return agent.agent?.settings || agent.settings || {};
    }
}

export default AgentSettings;

