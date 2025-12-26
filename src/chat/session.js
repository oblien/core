/**
 * Chat Session Manager (Server-Side Only)
 * Creates and manages chat sessions - returns tokens for client-side chat
 */

export class ChatSession {
    /**
     * @param {Object} options - Session options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} [options.sessionId] - Existing session ID
     */
    constructor({ client, sessionId = null }) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
        this.sessionId = sessionId;
    }

    /**
     * Create session and get token for client
     * @param {Object} options - Session creation options
     * @param {string} options.agentId - Agent ID to chat with
     * @param {string} [options.workflowId] - Workflow ID (if using workflow)
     * @param {boolean} [options.isGuest] - Is this a guest session
     * @param {string} [options.namespace] - Guest namespace for rate limiting
     * @param {Object} [options.workspace] - Workspace configuration
     * @param {string} [options.ipAddress] - IP address of the user
     * @param {string} [options.userAgent] - User agent of the user
     * @param {string} [options.fingerprint] - Fingerprint of the user
     * @param {string} [options.endUserId] - End user ID (for client's end users)
     * @returns {Promise<Object>} Session data with token for browser
     */
    async create(options) {
        if (!options.agentId && !options.workflowId) {
            throw new Error('Either agentId or workflowId is required');
        }

        const data = await this.client.post('ai/session/create', options);
        return data
    }

    /**
     * Get existing session info
     * @param {string} [sessionId] - Session ID (uses instance sessionId if not provided)
     * @returns {Promise<Object>} Session details
     */
    async get(sessionId) {
        const id = sessionId || this.sessionId;
        if (!id) {
            throw new Error('Session ID required');
        }

        return await this.client.get(`ai/session/${id}`);
    }

    /**
     * Delete session
     * @param {string} [sessionId] - Session ID (uses instance sessionId if not provided)
     * @returns {Promise<Object>} Deletion result
     */
    async delete(sessionId) {
        const id = sessionId || this.sessionId;
        if (!id) {
            throw new Error('Session ID required');
        }

        return await this.client.delete(`ai/session/${id}`);
    }

    /**
     * List all sessions
     * @param {Object} [options] - Query options
     * @param {string} [options.namespace] - Filter by namespace
     * @param {string} [options.agentId] - Filter by agent ID
     * @param {string} [options.endUserId] - Filter by end user ID
     * @param {number} [options.limit] - Number of results (max 100)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.search] - Search in title and user ID
     * @param {string} [options.sortBy] - Sort by 'time' or 'tokens'
     * @param {string} [options.sortOrder] - 'asc' or 'desc'
     * @param {boolean} [options.includeStats] - Include message count and tokens
     * @returns {Promise<Array>} Array of sessions
     */
    async list(options = {}) {
        const data = await this.client.get('ai/session/list', options);
        return data;
    }
}

export default ChatSession;
