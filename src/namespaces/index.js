/**
 * Namespaces Module
 * Manages namespaces, service configurations, and usage tracking
 */

import { Namespace } from './namespace.js';

export class OblienNamespaces {
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
     * Create a new namespace
     * @param {Object} options - Namespace options
     * @param {string} options.name - Namespace name (required)
     * @param {string} [options.slug] - URL-friendly slug
     * @param {string} [options.description] - Description
     * @param {string} [options.type] - Type: 'default', 'production', 'testing', 'development'
     * @param {boolean} [options.isDefault] - Is default namespace
     * @param {Object} [options.metadata] - Custom metadata
     * @param {Array<string>} [options.tags] - Tags
     * @param {string} [options.endUserId] - End user ID
     * @returns {Promise<Object>} Created namespace data
     */
    async create(options) {
        const namespace = new Namespace({ client: this.client });
        return await namespace.create(options);
    }

    /**
     * Get namespace by ID or slug
     * @param {string} identifier - Namespace ID or slug
     * @returns {Promise<Object>} Namespace data
     */
    async get(identifier) {
        const namespace = new Namespace({ client: this.client });
        return await namespace.get(identifier);
    }

    /**
     * List all namespaces with filtering and pagination
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results (default: 50, max: 100)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.status] - Filter by status: 'active', 'inactive', 'suspended', 'archived'
     * @param {string} [options.type] - Filter by type: 'default', 'production', 'testing', 'development'
     * @param {string} [options.search] - Search in name, slug, description
     * @param {string} [options.sortBy] - Sort by: 'name', 'created_at', 'updated_at', 'last_active_at'
     * @param {string} [options.sortOrder] - Sort order: 'ASC', 'DESC'
     * @returns {Promise<Object>} Namespaces data with pagination info
     */
    async list(options = {}) {
        const response = await this.client.get('namespaces', options);
        return response;
    }

    /**
     * Update namespace
     * @param {string} namespaceId - Namespace ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated namespace data
     */
    async update(namespaceId, updates) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.update(updates);
    }

    /**
     * Delete (archive) namespace
     * @param {string} namespaceId - Namespace ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(namespaceId) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.delete();
    }

    /**
     * Get namespace activity log
     * @param {string} namespaceId - Namespace ID
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Number of activities (default: 50)
     * @param {number} [options.offset] - Offset for pagination
     * @returns {Promise<Array>} Array of activity logs
     */
    async getActivity(namespaceId, options = {}) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.getActivity(options);
    }

    /**
     * Get namespace usage statistics
     * @param {string} namespaceId - Namespace ID
     * @param {Object} [options] - Query options
     * @param {string} [options.service] - Filter by service
     * @param {number} [options.days] - Number of days (default: 30)
     * @returns {Promise<Object>} Usage statistics
     */
    async getUsage(namespaceId, options = {}) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.getUsage(options);
    }

    /**
     * Get available services
     * @returns {Promise<Array>} Array of available services
     */
    async getAvailableServices() {
        const response = await this.client.get('namespaces/services/available');
        return response.data || response;
    }

    /**
     * Configure a service for a namespace
     * @param {string} namespaceId - Namespace ID
     * @param {Object} options - Service configuration
     * @param {string} options.service - Service name (required)
     * @param {boolean} [options.enabled] - Enable/disable service
     * @param {Object} [options.config] - Service-specific configuration
     * @param {number} [options.rateLimitRequests] - Rate limit requests
     * @param {string} [options.rateLimitPeriod] - Rate limit period
     * @param {Array<string>} [options.features] - Enabled features
     * @returns {Promise<Object>} Service configuration
     */
    async configureService(namespaceId, options) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.configureService(options);
    }

    /**
     * List all services for a namespace
     * @param {string} namespaceId - Namespace ID
     * @returns {Promise<Array>} Array of service configurations
     */
    async listServices(namespaceId) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.listServices();
    }

    /**
     * Get specific service configuration
     * @param {string} namespaceId - Namespace ID
     * @param {string} service - Service name
     * @returns {Promise<Object>} Service configuration
     */
    async getServiceConfig(namespaceId, service) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.getServiceConfig(service);
    }

    /**
     * Toggle service enabled/disabled
     * @param {string} namespaceId - Namespace ID
     * @param {string} service - Service name
     * @param {boolean} enabled - Enable or disable
     * @returns {Promise<Object>} Updated service configuration
     */
    async toggleService(namespaceId, service, enabled) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.toggleService(service, enabled);
    }

    /**
     * Enable a service for a namespace
     * @param {string} namespaceId - Namespace ID
     * @param {string} service - Service name
     * @returns {Promise<Object>} Updated service configuration
     */
    async enableService(namespaceId, service) {
        return await this.toggleService(namespaceId, service, true);
    }

    /**
     * Disable a service for a namespace
     * @param {string} namespaceId - Namespace ID
     * @param {string} service - Service name
     * @returns {Promise<Object>} Updated service configuration
     */
    async disableService(namespaceId, service) {
        return await this.toggleService(namespaceId, service, false);
    }

    /**
     * Delete service configuration
     * @param {string} namespaceId - Namespace ID
     * @param {string} service - Service name
     * @returns {Promise<Object>} Deletion result
     */
    async deleteService(namespaceId, service) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.deleteService(service);
    }

    /**
     * Bulk configure multiple services
     * @param {string} namespaceId - Namespace ID
     * @param {Array<Object>} services - Array of service configurations
     * @returns {Promise<Array>} Array of configured services
     */
    async bulkConfigureServices(namespaceId, services) {
        const namespace = new Namespace({ client: this.client, namespaceId });
        return await namespace.bulkConfigureServices(services);
    }

    /**
     * Create a Namespace instance for chaining operations
     * @param {string} [namespaceId] - Namespace ID
     * @returns {Namespace} Namespace instance
     */
    namespace(namespaceId) {
        return new Namespace({ client: this.client, namespaceId });
    }
}

export { Namespace };
export default OblienNamespaces;

