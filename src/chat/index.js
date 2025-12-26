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
     * @param {string} [options.endUserId] - End user ID (for client's end users)
     * @param {string} [options.namespace] - Guest namespace for rate limiting
     * @param {boolean} [options.isGuest] - Is this a guest session
     * @param {string} [options.ipAddress] - IP address of the user
     * @param {string} [options.userAgent] - User agent of the user
     * @param {string} [options.fingerprint] - Fingerprint of the user
     * @returns {Promise<Object>} Session data with token
     */
    async createSession(options) {
        const session = new ChatSession({
            client: this.client,
        });

        return await session.create(options);
    }

    /**
     * Create a guest session based on IP and fingerprint (dual-layer identification)
     * @param {Object} options - Guest session options
     * @param {string} options.ip - Client IP address
     * @param {string} [options.fingerprint] - Client fingerprint for identification
     * @param {string} options.agentId - Agent ID to chat with
     * @param {string} [options.workflowId] - Workflow ID
     * @param {Object} [options.metadata] - Additional guest metadata
     * @param {Object} [options.workspace] - Workspace configuration
     * @param {string} [options.endUserId] - End user ID (for client's end users)
     * @returns {Promise<Object>} Session data with token and guest info
     */
    async createGuestSession(options) {
        const { ip, fingerprint, agentId, workflowId, metadata = {}, workspace, endUserId } = options;

        if (!ip) {
            throw new Error('IP address is required for guest sessions');
        }

        // Get or create guest user (handles fingerprint and IP mapping internally)
        const guest = await this.guestManager.getOrCreateGuest(ip, fingerprint, {
            ...metadata,
            fingerprint,
            ip,
        });

        // Create session
        const session = new ChatSession({
            client: this.client,
        });

        const sessionData = await session.create({
            agentId,
            workflowId,
            workspace,
            isGuest: true,
            namespace: guest.namespace,
            ipAddress: ip,
            userAgent: metadata.userAgent,
            fingerprint: fingerprint,
            endUserId: endUserId,
        });

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
     * Get guest by IP and/or fingerprint (dual-layer identification)
     * @param {string} ip - IP address
     * @param {string} [fingerprint] - Client fingerprint (optional)
     * @returns {Promise<Object|null>} Guest object or null
     */
    async getGuest(ip, fingerprint = null) {
        // Try fingerprint first if provided
        if (fingerprint) {
            const guestIdByFingerprint = await this.guestManager.storage.get(`fingerprint:${fingerprint}`);
            if (guestIdByFingerprint) {
                const guest = await this.guestManager.getGuest(guestIdByFingerprint);
                if (guest) return guest;
            }
        }

        // Fallback to IP
        if (ip) {
            const guestIdByIp = await this.guestManager.storage.get(`ip:${ip}`);
            if (guestIdByIp) {
                const guest = await this.guestManager.getGuest(guestIdByIp);
                if (guest) return guest;
            }
            
            // Fallback to old method (generate guest ID from IP)
            const fallbackGuestId = this.guestManager.generateGuestId(ip);
            return await this.guestManager.getGuest(fallbackGuestId);
        }

        return null;
    }

    /**
     * Send a message in a chat session
     * Hybrid mode: Works with session token OR client credentials
     * 
     * @param {Object} options - Send options
     * @param {string} [options.token] - Session token (optional, uses client credentials if not provided)
     * @param {string} options.message - Message to send
     * @param {string} [options.uploadId] - Upload ID for attached files
     * @param {Array} [options.files] - File attachments (alternative to uploadId)
     * @param {boolean} [options.stream] - Enable streaming response
     * @param {Function} [options.onChunk] - Callback for streaming chunks (data) => void
     * @param {Function} [options.onError] - Callback for errors (error) => void
     * @param {Function} [options.onComplete] - Callback when stream completes () => void
     * @param {Object} [options.metadata] - Additional metadata
     * @returns {Promise<Object>} Response data
     */
    async send(options = {}) {
        const { 
            token,
            message,
            uploadId, 
            files, 
            stream = false, 
            onChunk,
            onError,
            onComplete,
            metadata = {} 
        } = options;

        if (!message || !message.trim()) {
            throw new Error('Message is required');
        }

        const payload = {
            message,
            stream,
            ...metadata,
        };

        if (uploadId) {
            payload.upload_id = uploadId;
        }

        if (files) {
            payload.files = files;
        }

        // Build headers - use token if provided, otherwise use client credentials
        const headers = {
            ...this.client.getAuthHeaders(),
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = this.client._buildURL('ai/chat/send');

        if (stream) {
            // Handle streaming response
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `API error: ${response.status}`);
            }

            // Process SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        if (onComplete) onComplete();
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        
                        try {
                            const data = JSON.parse(line);
                            if (onChunk) onChunk(data);
                        } catch (e) {
                            // Skip non-JSON lines (SSE format)
                            if (line.startsWith('data: ')) {
                                try {
                                    const jsonStr = line.substring(6);
                                    const data = JSON.parse(jsonStr);
                                    if (onChunk) onChunk(data);
                                } catch (parseError) {
                                    console.warn('Failed to parse chunk:', line);
                                }
                            }
                        }
                    }
                }

                return { success: true, stream: true };
            } catch (error) {
                if (onError) onError(error);
                throw error;
            }
        } else {
            // Regular non-streaming request
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || error.error || `API error: ${response.status}`);
            }

            return await response.json();
        }
    }

    /**
     * Upload files for a chat session
     * Hybrid mode: Works with session token OR client credentials
     * 
     * @param {Object} options - Upload options
     * @param {string} [options.token] - Session token (optional, uses client credentials if not provided)
     * @param {Array|Object} options.files - Files to upload
     * @param {Object} [options.metadata] - Additional metadata
     * @returns {Promise<Object>} Upload result with uploadId
     */
    async upload(options = {}) {
        const { token, files, metadata } = options;

        if (!files || (Array.isArray(files) && files.length === 0)) {
            throw new Error('Files are required');
        }

        const formData = new FormData();
        
        // Handle both single file and array of files
        const fileArray = Array.isArray(files) ? files : [files];
        
        fileArray.forEach((file, index) => {
            if (file instanceof File || file instanceof Blob) {
                formData.append('files', file);
            } else if (file.path && file.buffer) {
                // Node.js file object
                formData.append('files', file.buffer, file.originalname || file.path);
            } else {
                throw new Error(`Invalid file at index ${index}`);
            }
        });

        // Add any additional options
        if (metadata) {
            formData.append('metadata', JSON.stringify(metadata));
        }

        // Build headers - use token if provided, otherwise use client credentials
        const headers = {
            ...this.client.getAuthHeaders(),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Remove Content-Type for FormData (browser will set it with boundary)
        delete headers['Content-Type'];

        const url = this.client._buildURL('ai/chat/upload');

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || error.error || `API error: ${response.status}`);
        }

        return await response.json();
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
    async listSessions(options = {}) {
        const session = new ChatSession({
            client: this.client,
        });
        
        return await session.list(options);
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

    /**
     * Get guest usage information (requires session token)
     * @param {string} token - Session token from guest session
     * @returns {Promise<Object>} Usage information for the guest
     */
    async getGuestUsage(token) {
        if (!token) {
            throw new Error('Session token is required');
        }

        const headers = {
            ...this.client.getAuthHeaders(),
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(this.client._buildURL('ai/guest/usage'), {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || error.error || `API error: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Get cache statistics (admin/monitoring)
     * @returns {Promise<Object>} Cache statistics
     */
    async getCacheStatistics() {
        const data = await this.client.get('ai/guest/cache-stats');
        return data;
    }
}

export { ChatSession } from './session.js';
export default OblienChat;
