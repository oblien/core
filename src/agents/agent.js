/**
 * Agent Class
 * Represents a single agent with methods for operations
 */

import { AgentSettings } from './settings.js';

export class Agent {
    /**
     * @param {Object} options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} [options.agentId] - Agent ID
     */
    constructor({ client, agentId = null }) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
        this.agentId = agentId;
        this._settings = null;
    }

    /**
     * Get settings manager for this agent
     * @returns {AgentSettings} Settings manager instance
     */
    get settings() {
        if (!this.agentId) {
            throw new Error('Agent ID is required for settings operations');
        }
        
        if (!this._settings) {
            this._settings = new AgentSettings({
                client: this.client,
                agentId: this.agentId
            });
        }

        return this._settings;
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
        const { name, prompts, description, namespace, collectionIds, settings } = options;

        if (!name) {
            throw new Error('Agent name is required');
        }
        if (!prompts) {
            throw new Error('Agent prompts are required');
        }

        const response = await this.client.post('ai/agents/create', {
            name,
            prompts,
            description,
            namespace,
            collectionIds,
            settings
        });

        if (response.agentId || response.id) {
            this.agentId = response.agentId || response.id;
        }

        return response;
    }

    /**
     * Get agent details
     * @param {string} [section] - Optional section to retrieve
     * @returns {Promise<Object>} Agent data
     */
    async get(section = null) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        const path = section 
            ? `ai/agents/${this.agentId}/${section}`
            : `ai/agents/${this.agentId}`;

        return await this.client.get(path);
    }

    /**
     * Update agent
     * @param {Object} updates - Fields to update
     * @param {string} [updates.name] - Agent name
     * @param {string} [updates.description] - Description
     * @param {Object} [updates.prompts] - Prompts
     * @param {Object} [updates.settings] - Settings
     * @param {string} [updates.namespace] - Namespace (for validation)
     * @returns {Promise<Object>} Update result
     */
    async update(updates) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        return await this.client.put(`ai/agents/${this.agentId}`, updates);
    }

    /**
     * Delete agent
     * @param {Object} [options] - Delete options
     * @param {string} [options.namespace] - Namespace for validation
     * @returns {Promise<Object>} Delete result
     */
    async delete(options = {}) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        // Use POST with body for DELETE with namespace validation
        const response = await fetch(this.client._buildURL(`ai/agents/${this.agentId}`), {
            method: 'DELETE',
            headers: this.client.getAuthHeaders(),
            body: JSON.stringify(options)
        });

        return this.client._handleResponse(response);
    }

    /**
     * Get agent overview/analytics
     * @param {Object} [options] - Query options
     * @param {number} [options.days=7] - Number of days for activity data
     * @returns {Promise<Object>} Analytics data
     */
    async getOverview(options = {}) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        return await this.client.get(`ai/agents/${this.agentId}/overview`, options);
    }

    /**
     * Get agent sessions
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.search] - Search term
     * @param {string} [options.sortBy] - Sort by field
     * @param {string} [options.sortOrder] - Sort order (asc/desc)
     * @returns {Promise<Object>} Sessions data
     */
    async getSessions(options = {}) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        return await this.client.get(`ai/agents/${this.agentId}/sessions`, options);
    }

    /**
     * Get agent bans
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} Bans data
     */
    async getBans(options = {}) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        return await this.client.get(`ai/agents/${this.agentId}/bans`, options);
    }


    /**
     * Get agent users
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} Agent users data
     */
    async getUsers(options = {}) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }

        return await this.client.get(`ai/agents/${this.agentId}/users`, options);
    }

    /**
     * Get specific agent user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    async getUser(userId) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }
        if (!userId) {
            throw new Error('User ID is required');
        }

        return await this.client.get(`ai/agents/${this.agentId}/users/${userId}`);
    }

    /**
     * Reset user limits
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Reset result
     */
    async resetUserLimits(userId) {
        if (!this.agentId) {
            throw new Error('Agent ID is required');
        }
        if (!userId) {
            throw new Error('User ID is required');
        }

        return await this.client.post(`ai/agents/${this.agentId}/users/${userId}/reset-limits`);
    }
}

export default Agent;

