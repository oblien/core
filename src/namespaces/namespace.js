/**
 * Namespace Entity Manager
 * Manages individual namespace operations
 */

export class Namespace {
    /**
     * @param {Object} options - Namespace options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} [options.namespaceId] - Existing namespace ID
     * @param {Object} [options.data] - Namespace data
     */
    constructor(options) {
        if (!options.client) {
            throw new Error('Oblien client is required');
        }

        this.client = options.client;
        this.namespaceId = options.namespaceId || null;
        this.data = options.data || null;
    }

    /**
     * Create a new namespace
     * @param {Object} options - Namespace options
     * @param {string} options.name - Namespace name (required)
     * @param {string} [options.slug] - URL-friendly slug (auto-generated from name if not provided)
     * @param {string} [options.description] - Namespace description
     * @param {string} [options.type] - Type: 'default', 'production', 'testing', 'development'
     * @param {boolean} [options.isDefault] - Is this the default namespace
     * @param {Object} [options.metadata] - Custom metadata object
     * @param {Array<string>} [options.tags] - Array of tags
     * @param {string} [options.endUserId] - End user ID (creator)
     * @returns {Promise<Object>} Created namespace data
     */
    async create(options) {
        if (!options.name) {
            throw new Error('Namespace name is required');
        }

        const payload = {
            name: options.name,
            slug: options.slug,
            description: options.description,
            type: options.type || 'default',
            isDefault: options.isDefault || false,
            metadata: options.metadata || {},
            tags: options.tags || [],
            endUserId: options.endUserId,
        };

        const response = await this.client.post('namespaces', payload);
        this.data = response.data;
        this.namespaceId = this.data.id;

        return this.data;
    }

    /**
     * Get namespace details
     * @param {string} [identifier] - Namespace ID or slug (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Namespace data
     */
    async get(identifier) {
        const id = identifier || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID or slug is required');
        }

        const response = await this.client.get(`namespaces/${id}`);
        this.data = response.data;
        this.namespaceId = this.data.id;

        return this.data;
    }

    /**
     * Update namespace
     * @param {Object} updates - Fields to update
     * @param {string} [updates.name] - New name
     * @param {string} [updates.description] - New description
     * @param {string} [updates.status] - New status: 'active', 'inactive', 'suspended', 'archived'
     * @param {string} [updates.type] - New type
     * @param {Object} [updates.metadata] - New metadata
     * @param {Array<string>} [updates.tags] - New tags
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Updated namespace data
     */
    async update(updates, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        const response = await this.client.put(`namespaces/${id}`, updates);
        this.data = response.data;

        return this.data;
    }

    /**
     * Delete (archive) namespace
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Deletion result
     */
    async delete(namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        return await this.client.delete(`namespaces/${id}`);
    }

    /**
     * Get namespace activity log
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Number of activities to return (default: 50)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Array>} Array of activity logs
     */
    async getActivity(options = {}, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        const response = await this.client.get(`namespaces/${id}/activity`, options);
        return response.data || response;
    }

    /**
     * Get namespace usage statistics
     * @param {Object} [options] - Query options
     * @param {string} [options.service] - Filter by specific service
     * @param {number} [options.days] - Number of days to include (default: 30)
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Usage statistics
     */
    async getUsage(options = {}, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        const response = await this.client.get(`namespaces/${id}/usage`, options);
        return response.data || response;
    }

    /**
     * Configure a service for this namespace
     * @param {Object} options - Service configuration
     * @param {string} options.service - Service name (required)
     * @param {boolean} [options.enabled] - Enable/disable service
     * @param {Object} [options.config] - Service-specific configuration
     * @param {number} [options.rateLimitRequests] - Rate limit requests per period
     * @param {string} [options.rateLimitPeriod] - Rate limit period: 'minute', 'hour', 'day'
     * @param {Array<string>} [options.features] - Enabled features
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Service configuration
     */
    async configureService(options, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        if (!options.service) {
            throw new Error('Service name is required');
        }

        const response = await this.client.post(`namespaces/${id}/services`, options);
        return response.data || response;
    }

    /**
     * List all services for this namespace
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Array>} Array of service configurations
     */
    async listServices(namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        const response = await this.client.get(`namespaces/${id}/services`);
        return response.data || response;
    }

    /**
     * Get specific service configuration
     * @param {string} service - Service name
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Service configuration
     */
    async getServiceConfig(service, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        if (!service) {
            throw new Error('Service name is required');
        }

        const response = await this.client.get(`namespaces/${id}/services/${service}`);
        return response.data || response;
    }

    /**
     * Toggle service enabled/disabled
     * @param {string} service - Service name
     * @param {boolean} enabled - Enable or disable
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Updated service configuration
     */
    async toggleService(service, enabled, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        if (!service) {
            throw new Error('Service name is required');
        }

        const response = await this.client.patch(`namespaces/${id}/services/${service}/toggle`, { enabled });
        return response.data || response;
    }

    /**
     * Delete service configuration
     * @param {string} service - Service name
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Object>} Deletion result
     */
    async deleteService(service, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        if (!service) {
            throw new Error('Service name is required');
        }

        return await this.client.delete(`namespaces/${id}/services/${service}`);
    }

    /**
     * Bulk configure multiple services
     * @param {Array<Object>} services - Array of service configurations
     * @param {string} [namespaceId] - Namespace ID (uses instance namespaceId if not provided)
     * @returns {Promise<Array>} Array of service configurations
     */
    async bulkConfigureServices(services, namespaceId) {
        const id = namespaceId || this.namespaceId;
        if (!id) {
            throw new Error('Namespace ID is required');
        }

        if (!Array.isArray(services)) {
            throw new Error('Services must be an array');
        }

        const response = await this.client.post(`namespaces/${id}/services/bulk`, { services });
        return response.data || response;
    }
}

export default Namespace;

