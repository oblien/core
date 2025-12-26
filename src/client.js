/**
 * Oblien Core Client
 * Main client for authenticating and accessing Oblien API
 */

export class OblienClient {
    /**
     * @param {Object} config - Configuration options
     * @param {string} config.clientId - Your Oblien Client ID (x-client-id)
     * @param {string} config.clientSecret - Your Oblien Client Secret (x-client-secret)
     */
    constructor(config) {
        if (!config || !config.clientId) {
            throw new Error('Oblien client ID is required');
        }
        if (!config.clientSecret) {
            throw new Error('Oblien client secret is required');
        }

        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.baseURL = config.baseURL || 'https://api.oblien.com';
    }

    /**
     * Build full API URL
     * @private
     */
    _buildURL(path) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        // Backend doesn't use version prefix, routes are directly mounted
        return `${this.baseURL}/${cleanPath}`;
    }

    /**
     * Get authentication headers
     * @returns {Object} Headers object with x-client-id and x-client-secret
     */
    getAuthHeaders() {
        return {
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Make GET request
     * @param {string} path - API path
     * @param {Object} [params] - Query parameters
     * @returns {Promise<any>} Response data
     */
    async get(path, params = {}) {
        const headers = this.getAuthHeaders();
        const url = new URL(this._buildURL(path));
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        return this._handleResponse(response);
    }

    /**
     * Make POST request
     * @param {string} path - API path
     * @param {Object} [body] - Request body
     * @returns {Promise<any>} Response data
     */
    async post(path, body = {}) {
        const headers = this.getAuthHeaders();
        
        const response = await fetch(this._buildURL(path), {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        return this._handleResponse(response);
    }

    /**
     * Make PUT request
     * @param {string} path - API path
     * @param {Object} [body] - Request body
     * @returns {Promise<any>} Response data
     */
    async put(path, body = {}) {
        const headers = this.getAuthHeaders();
        
        const response = await fetch(this._buildURL(path), {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });

        return this._handleResponse(response);
    }

    /**
     * Make PATCH request
     * @param {string} path - API path
     * @param {Object} [body] - Request body
     * @returns {Promise<any>} Response data
     */
    async patch(path, body = {}) {
        const headers = this.getAuthHeaders();
        
        const response = await fetch(this._buildURL(path), {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body),
        });

        return this._handleResponse(response);
    }

    /**
     * Make DELETE request
     * @param {string} path - API path
     * @param {Object} [body] - Request body
     * @returns {Promise<any>} Response data
     */
    async delete(path, body = null) {
        const headers = this.getAuthHeaders();
        
        const options = {
            method: 'DELETE',
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(this._buildURL(path), options);

        return this._handleResponse(response);
    }

    /**
     * Handle API response
     * @private
     */
    async _handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        // Handle non-JSON responses
        if (!contentType || !contentType.includes('application/json')) {
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            return response.text();
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || `API error: ${response.status}`);
        }

        return data;
    }

}

export default OblienClient;
