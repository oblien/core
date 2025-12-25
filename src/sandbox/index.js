/**
 * Sandboxes Module
 * Manages cloud sandboxes - create, control, monitor
 */

import { Sandbox } from './sandbox.js';

export class OblienSandboxes {
    /**
     * @param {import('../client.js').OblienClient} client - Oblien client instance
     */
    constructor(client) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
    }

    /**
     * Create a new sandbox
     * @param {Object} options - Sandbox options
     * @param {string} [options.name] - Sandbox name
     * @param {string} [options.region='us-east-1'] - Region: 'us-east-1' | 'us-west-1' | 'eu-west-1'
     * @param {string} [options.template='node-20'] - Template: 'node-20' | 'python-3' | 'blank' | custom
     * @param {Object} [options.config] - Custom configuration
     * @param {boolean} [options.autoStart=true] - Auto-start sandbox after creation
     * @returns {Promise<Object>} Created sandbox data with token
     */
    async create(options = {}) {
        const {
            name,
            region = 'us-east-1',
            template = 'node-20',
            config,
            autoStart = true
        } = options;

        const response = await this.client.post('sandbox', {
            name,
            region,
            template,
            config,
            autoStart
        });

        return response;
    }

    /**
     * List all sandboxes with pagination and filtering
     * @param {Object} [options] - Query options
     * @param {number} [options.page=1] - Page number
     * @param {number} [options.limit=20] - Results per page
     * @param {string} [options.status] - Filter by status: 'active' | 'stopped' | 'suspended' | 'deleted'
     * @returns {Promise<Object>} Sandboxes data with pagination info
     */
    async list(options = {}) {
        const params = {
            page: options.page || 1,
            limit: options.limit || 20
        };

        if (options.status) {
            params.status = options.status;
        }

        const response = await this.client.get('sandbox', params);
        return response;
    }

    /**
     * Get sandbox by ID
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Sandbox data
     */
    async get(sandboxId) {
        if (!sandboxId) {
            throw new Error('Sandbox ID is required');
        }

        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.get();
    }

    /**
     * Update sandbox
     * @param {string} sandboxId - Sandbox ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Update result
     */
    async update(sandboxId, updates) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.update(updates);
    }

    /**
     * Delete sandbox
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Delete result
     */
    async delete(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.delete();
    }

    /**
     * Start sandbox
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Start result with new token
     */
    async start(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.start();
    }

    /**
     * Stop sandbox
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Stop result
     */
    async stop(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.stop();
    }

    /**
     * Restart sandbox
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Restart result with new token
     */
    async restart(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.restart();
    }

    /**
     * Regenerate sandbox token
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} New token (1h expiry)
     */
    async regenerateToken(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.regenerateToken();
    }

    /**
     * Get sandbox metrics
     * @param {string} sandboxId - Sandbox ID
     * @returns {Promise<Object>} Sandbox metrics
     */
    async getMetrics(sandboxId) {
        const sandbox = new Sandbox({ client: this.client, sandboxId });
        return await sandbox.getMetrics();
    }

    /**
     * Get sandbox stats (overall statistics)
     * @returns {Promise<Object>} Sandbox statistics
     */
    async getStats() {
        return await this.client.get('sandbox/stats');
    }

    /**
     * Get sandbox activity
     * @returns {Promise<Object>} Sandbox activity logs
     */
    async getActivity() {
        return await this.client.get('sandbox/activity');
    }

    /**
     * Create a Sandbox instance for chaining operations
     * @param {string} sandboxId - Sandbox ID
     * @returns {Sandbox} Sandbox instance
     */
    sandbox(sandboxId) {
        return new Sandbox({ client: this.client, sandboxId });
    }
}

export { Sandbox };
export default OblienSandboxes;

