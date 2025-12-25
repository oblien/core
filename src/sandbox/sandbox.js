/**
 * Sandbox Class
 * Represents a single sandbox with methods for operations
 */

export class Sandbox {
    /**
     * @param {Object} options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} [options.sandboxId] - Sandbox ID
     */
    constructor({ client, sandboxId = null }) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
        this.sandboxId = sandboxId;
    }

    /**
     * Get sandbox details
     * @returns {Promise<Object>} Sandbox data
     */
    async get() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        const response = await this.client.get(`sandbox/${this.sandboxId}`);
        return response.sandbox || response;
    }

    /**
     * Update sandbox
     * @param {Object} updates - Fields to update
     * @param {string} [updates.name] - Sandbox name
     * @param {string} [updates.region] - Region
     * @param {Object} [updates.config] - Configuration
     * @returns {Promise<Object>} Update result
     */
    async update(updates) {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.put(`sandbox/${this.sandboxId}`, updates);
    }

    /**
     * Delete sandbox
     * @returns {Promise<Object>} Delete result
     */
    async delete() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.delete(`sandbox/${this.sandboxId}`);
    }

    /**
     * Start sandbox
     * @returns {Promise<Object>} Start result with new token
     */
    async start() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.post(`sandbox/${this.sandboxId}/start`);
    }

    /**
     * Stop sandbox
     * @returns {Promise<Object>} Stop result
     */
    async stop() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.post(`sandbox/${this.sandboxId}/stop`);
    }

    /**
     * Restart sandbox
     * @returns {Promise<Object>} Restart result with new token
     */
    async restart() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.post(`sandbox/${this.sandboxId}/restart`);
    }

    /**
     * Regenerate sandbox token
     * @returns {Promise<Object>} New token (1h expiry)
     */
    async regenerateToken() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.post(`sandbox/${this.sandboxId}/regenerate-token`);
    }

    /**
     * Get sandbox metrics
     * @returns {Promise<Object>} Sandbox metrics
     */
    async getMetrics() {
        if (!this.sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        return await this.client.get(`sandbox/${this.sandboxId}/metrics`);
    }
}

export default Sandbox;

