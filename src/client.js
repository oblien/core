/**
 * Oblien Core Client
 * Main client for authenticating and accessing Oblien API
 */

export class OblienClient {
    /**
     * @param {Object} config - Configuration options
     * @param {string} config.apiKey - Your Oblien API key
     * @param {string} [config.apiSecret] - Your Oblien API secret (for server-side)
     * @param {string} [config.baseURL] - Base URL for API (default: https://api.oblien.com)
     * @param {string} [config.version] - API version (default: v1)
     */
    constructor(config) {
        if (!config || !config.apiKey) {
            throw new Error('Oblien API key is required');
        }

        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.baseURL = config.baseURL || 'https://api.oblien.com';
        this.version = config.version || 'v1';
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Build full API URL
     * @private
     */
    _buildURL(path) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${this.baseURL}/${this.version}/${cleanPath}`;
    }

    /**
     * Authenticate and get access token
     * @returns {Promise<string>} Access token
     */
    async authenticate() {
        // Check if we have a valid token
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await fetch(this._buildURL('auth/authenticate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    apiSecret: this.apiSecret,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Authentication failed');
            }

            const data = await response.json();
            this.token = data.token;
            // Token expires in 1 hour, refresh 5 min before
            this.tokenExpiry = Date.now() + (55 * 60 * 1000);

            return this.token;
        } catch (error) {
            throw new Error(`Authentication error: ${error.message}`);
        }
    }

    /**
     * Get authentication headers
     * @returns {Promise<Object>} Headers object
     */
    async getAuthHeaders() {
        const token = await this.authenticate();
        return {
            'Authorization': `Bearer ${token}`,
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
        const headers = await this.getAuthHeaders();
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
        const headers = await this.getAuthHeaders();
        
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
        const headers = await this.getAuthHeaders();
        
        const response = await fetch(this._buildURL(path), {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });

        return this._handleResponse(response);
    }

    /**
     * Make DELETE request
     * @param {string} path - API path
     * @returns {Promise<any>} Response data
     */
    async delete(path) {
        const headers = await this.getAuthHeaders();
        
        const response = await fetch(this._buildURL(path), {
            method: 'DELETE',
            headers,
        });

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
