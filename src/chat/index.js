/**
 * Chat Module (Server-Side Session Management)
 * Creates sessions and returns tokens for client-side chat
 */

import { ChatSession } from './session.js';
import { GuestManager } from '../utils/guest-manager.js';

export class OblienChat {
    /**
     * @param {import('../client.js').OblienClient} client - Oblien client instance
     * @param {Object} [options] - Configuration options
     * @param {Object} [options.guestManager] - Custom guest manager instance
     * @param {Object} [options.guestStorage] - Storage adapter for guest manager
     * @param {number} [options.guestTTL] - Guest session TTL in seconds
     */
    constructor(client, options = {}) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
        
        // Initialize guest manager if not provided
        this.guestManager = options.guestManager || new GuestManager({
            storage: options.guestStorage,
            ttl: options.guestTTL,
        });
    }

    /**
     * Create a new session and return token for client
     * @param {Object} options - Session options
     * @param {string} options.agentId - Agent ID to chat with
     * @param {string} [options.workflowId] - Workflow ID (if using workflow)
     * @param {Object} [options.workspace] - Workspace configuration
     * @returns {Promise<Object>} Session data with token
     */
    async createSession(options) {
        const session = new ChatSession({
            client: this.client,
            ...options,
        });

        return await session.create();
    }

    /**
     * Create a guest session based on IP
     * @param {Object} options - Guest session options
     * @param {string} options.ip - Client IP address
     * @param {string} options.agentId - Agent ID to chat with
     * @param {string} [options.workflowId] - Workflow ID
     * @param {Object} [options.metadata] - Additional guest metadata
     * @param {Object} [options.workspace] - Workspace configuration
     * @returns {Promise<Object>} Session data with token and guest info
     */
    async createGuestSession(options) {
        const { ip, agentId, workflowId, metadata, workspace } = options;

        if (!ip) {
            throw new Error('IP address is required for guest sessions');
        }

        // Get or create guest user
        const guest = await this.guestManager.getOrCreateGuest(ip, metadata);

        // Create session
        const session = new ChatSession({
            client: this.client,
            agentId,
            workflowId,
            workspace,
            isGuest: true,
            namespace: guest.namespace,
        });

        const sessionData = await session.create();

        // Link session to guest
        await this.guestManager.addSession(guest.id, sessionData.sessionId);

        return {
            ...sessionData,
            guest: {
                id: guest.id,
                namespace: guest.namespace,
                createdAt: guest.createdAt,
            },
        };
    }

    /**
     * Get guest by IP
     * @param {string} ip - IP address
     * @returns {Promise<Object|null>} Guest object or null
     */
    async getGuestByIP(ip) {
        const guestId = this.guestManager.generateGuestId(ip);
        return await this.guestManager.getGuest(guestId);
    }

    /**
     * Get session info
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session details
     */
    async getSession(sessionId) {
        return await this.client.get(`ai/session/${sessionId}`);
    }

    /**
     * List sessions
     * @param {Object} [options] - Query options
     * @returns {Promise<Array>} Array of sessions
     */
    async listSessions(options = {}) {
        const data = await this.client.get('ai/session', options);
        return data.sessions || data;
    }

    /**
     * Delete a session
     * @param {string} sessionId - Session ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteSession(sessionId) {
        return await this.client.delete(`ai/session/${sessionId}`);
    }

    /**
     * Get all active guests (admin/monitoring)
     * @returns {Promise<Array>} Array of guest objects
     */
    async getAllGuests() {
        return await this.guestManager.getAllGuests();
    }

    /**
     * Clean up expired guests
     * @returns {Promise<number>} Number of cleaned guests
     */
    async cleanupGuests() {
        return await this.guestManager.cleanup();
    }
}

export { ChatSession } from './session.js';
export default OblienChat;
