/**
 * Agents Module
 * Manages AI agents, their settings, and operations
 */

import { Agent } from './agent.js';
import { Tools } from './tools.js';

export class OblienAgents {
    /**
     * @param {import('../client.js').OblienClient} client - Oblien client instance
     */
    constructor(client) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
        this._tools = null;
    }

    /**
     * Get tools manager
     * @returns {Tools} Tools manager instance
     */
    get tools() {
        if (!this._tools) {
            this._tools = new Tools(this.client);
        }
        return this._tools;
    }

    /**
     * Create a new agent
     * @param {Object} options - Agent options
     * @param {string} options.name - Agent name (required)
     * @param {Object} options.prompts - Agent prompts/configuration (required)
     * @param {string} [options.description] - Agent description
     * @param {string} [options.namespace] - Namespace for organization
     * @param {Array<string>} [options.collectionIds] - Collection IDs
     * @param {Object} [options.settings] - Agent settings
     * @returns {Promise<Object>} Created agent data
     */
    async create(options) {
        const agent = new Agent({ client: this.client });
        return await agent.create(options);
    }

    /**
     * Get agent by ID
     * @param {string} agentId - Agent ID
     * @param {string} [section] - Optional section to retrieve
     * @returns {Promise<Object>} Agent data
     */
    async get(agentId, section = null) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.get(section);
    }

    /**
     * List all agents with filtering and pagination
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results (default: 50, max: 100)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.namespace] - Filter by namespace
     * @returns {Promise<Object>} Agents data with pagination info
     */
    async list(options = {}) {
        const response = await this.client.get('ai/agents/list', options);
        return response;
    }

    /**
     * Search agents
     * @param {string} query - Search query
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results (default: 20)
     * @param {string} [options.namespace] - Filter by namespace
     * @returns {Promise<Object>} Search results
     */
    async search(query, options = {}) {
        const response = await this.client.get('ai/agents/search', {
            q: query,
            ...options
        });
        return response;
    }

    /**
     * Update agent
     * @param {string} agentId - Agent ID
     * @param {Object} updates - Fields to update
     * @param {string} [updates.name] - Agent name
     * @param {string} [updates.description] - Description
     * @param {Object} [updates.prompts] - Prompts
     * @param {Object} [updates.settings] - Settings
     * @param {string} [updates.namespace] - Namespace (for validation)
     * @returns {Promise<Object>} Update result
     */
    async update(agentId, updates) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.update(updates);
    }

    /**
     * Delete agent
     * @param {string} agentId - Agent ID
     * @param {Object} [options] - Delete options
     * @param {string} [options.namespace] - Namespace for validation
     * @returns {Promise<Object>} Delete result
     */
    async delete(agentId, options = {}) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.delete(options);
    }

    /**
     * Get agent overview/analytics
     * @param {string} agentId - Agent ID
     * @param {Object} [options] - Query options
     * @param {number} [options.days=7] - Number of days for activity data
     * @returns {Promise<Object>} Analytics data
     */
    async getOverview(agentId, options = {}) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.getOverview(options);
    }

    /**
     * Get agent sessions
     * @param {string} agentId - Agent ID
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.search] - Search term
     * @param {string} [options.sortBy] - Sort by field
     * @param {string} [options.sortOrder] - Sort order (asc/desc)
     * @returns {Promise<Object>} Sessions data
     */
    async getSessions(agentId, options = {}) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.getSessions(options);
    }

    /**
     * Get agent bans
     * @param {string} agentId - Agent ID
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} Bans data
     */
    async getBans(agentId, options = {}) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.getBans(options);
    }

    /**
     * Get platform stats
     * @returns {Promise<Object>} Platform statistics
     */
    async getStats() {
        return await this.client.get('ai/agents/stats');
    }


    /**
     * Get agent users
     * @param {string} agentId - Agent ID
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} Agent users data
     */
    async getUsers(agentId, options = {}) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.getUsers(options);
    }

    /**
     * Get specific agent user
     * @param {string} agentId - Agent ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    async getUser(agentId, userId) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.getUser(userId);
    }

    /**
     * Reset user limits
     * @param {string} agentId - Agent ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Reset result
     */
    async resetUserLimits(agentId, userId) {
        const agent = new Agent({ client: this.client, agentId });
        return await agent.resetUserLimits(userId);
    }

    /**
     * Create an Agent instance for chaining operations
     * @param {string} [agentId] - Agent ID
     * @returns {Agent} Agent instance
     */
    agent(agentId) {
        return new Agent({ client: this.client, agentId });
    }
}

export { Agent };
export { Tools } from './tools.js';
export { AgentSettings } from './settings.js';
export default OblienAgents;

