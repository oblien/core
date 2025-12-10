/**
 * Chat Session Manager (Server-Side Only)
 * Creates and manages chat sessions - returns tokens for client-side chat
 */

export class ChatSession {
    /**
     * @param {Object} options - Session options
     * @param {import('../client.js').OblienClient} options.client - Oblien client instance
     * @param {string} [options.sessionId] - Existing session ID
     * @param {string} options.agentId - Agent ID to chat with
     * @param {string} [options.workflowId] - Workflow ID (if using workflow)
     * @param {boolean} [options.isGuest] - Is this a guest session
     * @param {string} [options.namespace] - Guest namespace for rate limiting
     * @param {Object} [options.workspace] - Workspace configuration
     */
    constructor(options) {
        if (!options.client) {
            throw new Error('Oblien client is required');
        }

        if (!options.agentId && !options.workflowId) {
            throw new Error('Either agentId or workflowId is required');
        }

        this.client = options.client;
        this.sessionId = options.sessionId || null;
        this.agentId = options.agentId;
        this.workflowId = options.workflowId;
        this.isGuest = options.isGuest || false;
        this.namespace = options.namespace;
        this.workspace = options.workspace;
        this.token = null;
        this.data = null;
    }

    /**
     * Create session and get token for client
     * @returns {Promise<Object>} Session data with token for browser
     */
    async create() {
        const payload = {
            agent_id: this.agentId,
            workflow_id: this.workflowId,
            is_guest: this.isGuest,
            namespace: this.namespace,
            workspace: this.workspace,
        };

        this.data = await this.client.post('ai/session', payload);
        this.sessionId = this.data.sessionId || this.data.session_id;
        this.token = this.data.token || this.data.tokens?.token;

        return {
            sessionId: this.sessionId,
            token: this.token,
            agentId: this.data.agentId || this.agentId,
            workflowId: this.data.workflowId || this.workflowId,
            namespace: this.namespace,
        };
    }

    /**
     * Get existing session info
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session details
     */
    async get(sessionId) {
        this.data = await this.client.get(`ai/session/${sessionId || this.sessionId}`);
        return this.data;
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
     * @returns {Promise<Array>} Array of sessions
     */
    async list(options = {}) {
        const data = await this.client.get('ai/session', options);
        return data.sessions || data;
    }
}

export default ChatSession;