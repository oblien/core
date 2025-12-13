/**
 * Guest Manager
 * Manages guest users based on IP addresses or custom identifiers
 */

import crypto from 'crypto';
import NodeCache from 'node-cache';

export class GuestManager {
    /**
     * @param {Object} options - Configuration options
     * @param {Object} [options.storage] - Custom storage adapter (must implement get, set, delete)
     * @param {number} [options.ttl] - Time to live for guest sessions in seconds (default: 24 hours)
     * @param {Function} [options.onGuestCreated] - Callback when a new guest is created
     */
    constructor(options = {}) {
        this.storage = options.storage || new NodeCacheStorage(options.ttl);
        this.ttl = options.ttl || 24 * 60 * 60; // 24 hours
        this.onGuestCreated = options.onGuestCreated;
    }

    /**
     * Generate guest ID from IP address
     * @param {string} ip - IP address
     * @returns {string} Guest ID
     */
    generateGuestId(ip) {
        // Hash IP to create consistent guest ID
        const hash = crypto.createHash('sha256').update(ip).digest('hex');
        return `guest_${hash.substring(0, 16)}`;
    }

    /**
     * Find existing guest by fingerprint or IP (dual-layer identification)
     * @param {string} fingerprint - Client fingerprint
     * @param {string} ip - IP address
     * @returns {Promise<Object|null>} Guest object or null
     */
    async findExistingGuest(fingerprint, ip) {
        // Layer 1: Try to find by fingerprint first
        const guestIdByFingerprint = await this.storage.get(`fingerprint:${fingerprint}`);
        if (guestIdByFingerprint) {
            const guest = await this.getGuest(guestIdByFingerprint);
            if (guest) {
                // Update IP mapping if it changed
                if (guest.metadata?.ip !== ip) {
                    await this._updateMappings(guest.id, fingerprint, ip);
                    await this.updateGuest(guest.id, {
                        ip: this._maskIP(ip),
                        metadata: {
                            ...guest.metadata,
                            ip,
                            previousIps: [...(guest.metadata?.previousIps || []), guest.metadata?.ip].filter(Boolean),
                        },
                    });
                }
                return guest;
            }
        }

        // Layer 2: Fallback to IP if fingerprint didn't match
        const guestIdByIp = await this.storage.get(`ip:${ip}`);
        if (guestIdByIp) {
            const guest = await this.getGuest(guestIdByIp);
            if (guest) {
                // Update fingerprint mapping
                await this._updateMappings(guest.id, fingerprint, ip);
                await this.updateGuest(guest.id, {
                    metadata: {
                        ...guest.metadata,
                        fingerprint,
                        previousFingerprints: [...(guest.metadata?.previousFingerprints || []), guest.metadata?.fingerprint].filter(Boolean),
                    },
                });
                return guest;
            }
        }

        return null;
    }

    /**
     * Update fingerprint and IP mappings
     * @private
     */
    async _updateMappings(guestId, fingerprint, ip) {
        await this.storage.set(`fingerprint:${fingerprint}`, guestId, this.ttl);
        await this.storage.set(`ip:${ip}`, guestId, this.ttl);
    }

    /**
     * Get or create guest user by IP and fingerprint (dual-layer identification)
     * Supports both old signature: getOrCreateGuest(ip, metadata)
     * and new signature: getOrCreateGuest(ip, fingerprint, metadata)
     * @param {string} ip - IP address
     * @param {string|Object} fingerprintOrMetadata - Client fingerprint (string) or metadata (object)
     * @param {Object} [metadata] - Additional metadata to store (only if fingerprint is provided)
     * @returns {Promise<Object>} Guest user object
     */
    async getOrCreateGuest(ip, fingerprintOrMetadata = null, metadata = {}) {
        // Handle backward compatibility: detect if second param is metadata (object) or fingerprint (string)
        let fingerprint = null;
        let finalMetadata = {};

        if (fingerprintOrMetadata === null || fingerprintOrMetadata === undefined) {
            // No second parameter
            finalMetadata = metadata || {};
        } else if (typeof fingerprintOrMetadata === 'string') {
            // New signature: (ip, fingerprint, metadata)
            fingerprint = fingerprintOrMetadata;
            finalMetadata = metadata || {};
        } else if (typeof fingerprintOrMetadata === 'object') {
            // Old signature: (ip, metadata) - fingerprint is in metadata
            finalMetadata = fingerprintOrMetadata;
            fingerprint = finalMetadata.fingerprint || null;
        }

        // Try to find existing guest by fingerprint or IP
        if (fingerprint) {
            const existingGuest = await this.findExistingGuest(fingerprint, ip);
            if (existingGuest) {
                // Update last seen
                existingGuest.lastSeen = new Date().toISOString();
                await this.storage.set(`guest:${existingGuest.id}`, existingGuest, this.ttl);
                return existingGuest;
            }
        } else {
            // Try to find by IP only
            const guestIdByIp = await this.storage.get(`ip:${ip}`);
            if (guestIdByIp) {
                const guest = await this.getGuest(guestIdByIp);
        if (guest) {
            guest.lastSeen = new Date().toISOString();
                    await this.storage.set(`guest:${guest.id}`, guest, this.ttl);
            return guest;
                }
            }
        }

        // Create new guest
        const guestId = this.generateGuestId(ip);
        const guest = {
            id: guestId,
            namespace: guestId, // For rate limiting
            ip: this._maskIP(ip), // Store masked IP for privacy
            isGuest: true,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            metadata: {
                ...finalMetadata,
                ip,
                fingerprint,
            },
            sessions: [],
        };

        await this.storage.set(`guest:${guestId}`, guest, this.ttl);

        // Store mappings
        if (fingerprint) {
            await this._updateMappings(guestId, fingerprint, ip);
        } else {
            // Fallback: just store IP mapping if no fingerprint
            await this.storage.set(`ip:${ip}`, guestId, this.ttl);
        }

        // Call callback if provided
        if (this.onGuestCreated) {
            this.onGuestCreated(guest);
        }

        return guest;
    }

    /**
     * Get guest by ID
     * @param {string} guestId - Guest ID
     * @returns {Promise<Object|null>} Guest object or null
     */
    async getGuest(guestId) {
        return await this.storage.get(`guest:${guestId}`);
    }

    /**
     * Update guest metadata
     * @param {string} guestId - Guest ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated guest object
     */
    async updateGuest(guestId, updates) {
        const guest = await this.storage.get(`guest:${guestId}`);
        
        if (!guest) {
            throw new Error(`Guest not found: ${guestId}`);
        }

        const updated = {
            ...guest,
            ...updates,
            lastSeen: new Date().toISOString(),
        };

        await this.storage.set(`guest:${guestId}`, updated, this.ttl);
        return updated;
    }

    /**
     * Add session to guest
     * @param {string} guestId - Guest ID
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Updated guest object
     */
    async addSession(guestId, sessionId) {
        const guest = await this.storage.get(`guest:${guestId}`);
        
        if (!guest) {
            throw new Error(`Guest not found: ${guestId}`);
        }

        if (!guest.sessions.includes(sessionId)) {
            guest.sessions.push(sessionId);
        }

        guest.lastSeen = new Date().toISOString();
        await this.storage.set(`guest:${guestId}`, guest, this.ttl);
        
        return guest;
    }

    /**
     * Delete guest
     * @param {string} guestId - Guest ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteGuest(guestId) {
        return await this.storage.delete(`guest:${guestId}`);
    }

    /**
     * Mask IP address for privacy (keep first 2 octets)
     * @private
     */
    _maskIP(ip) {
        if (!ip) return 'unknown';
        
        // IPv4
        if (ip.includes('.')) {
            const parts = ip.split('.');
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        
        // IPv6 - keep first 4 groups
        if (ip.includes(':')) {
            const parts = ip.split(':');
            return `${parts.slice(0, 4).join(':')}:xxxx:xxxx:xxxx:xxxx`;
        }
        
        return 'unknown';
    }

    /**
     * Get all active guests (for admin/monitoring)
     * @returns {Promise<Array>} Array of guest objects
     */
    async getAllGuests() {
        return await this.storage.getAll('guest:*');
    }

    /**
     * Clean up expired guests
     * @returns {Promise<number>} Number of cleaned guests
     */
    async cleanup() {
        const guests = await this.getAllGuests();
        const now = Date.now();
        let cleaned = 0;

        for (const guest of guests) {
            const lastSeen = new Date(guest.lastSeen).getTime();
            const age = now - lastSeen;

            if (age > this.ttl * 1000) {
                await this.deleteGuest(guest.id);
                cleaned++;
            }
        }

        return cleaned;
    }
}

/**
 * NodeCache Storage Adapter (Default)
 * Uses node-cache for automatic expiration and memory management
 */
class NodeCacheStorage {
    constructor(ttl = 24 * 60 * 60) {
        this.cache = new NodeCache({
            stdTTL: ttl,
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false, // Better performance
            maxKeys: 100000, // Limit memory usage
        });
    }

    async get(key) {
        return this.cache.get(key) || null;
    }

    async set(key, value, ttl) {
        return this.cache.set(key, value, ttl || undefined);
    }

    async delete(key) {
        return this.cache.del(key) > 0;
    }

    async getAll(pattern) {
        const prefix = pattern.replace('*', '');
        const keys = this.cache.keys();
        const results = [];
        
        for (const key of keys) {
            if (key.startsWith(prefix)) {
                const value = this.cache.get(key);
                if (value) results.push(value);
            }
        }
        
        return results;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.flushAll();
    }
}

/**
 * Simple In-Memory Storage (Fallback)
 * Use NodeCacheStorage or RedisStorage for production
 */
export class InMemoryStorage {
    constructor() {
        this.store = new Map();
        this.expirations = new Map();
    }

    async get(key) {
        // Check if expired
        const expiry = this.expirations.get(key);
        if (expiry && Date.now() > expiry) {
            this.store.delete(key);
            this.expirations.delete(key);
            return null;
        }

        return this.store.get(key) || null;
    }

    async set(key, value, ttl) {
        this.store.set(key, value);
        
        if (ttl) {
            this.expirations.set(key, Date.now() + (ttl * 1000));
        }
        
        return true;
    }

    async delete(key) {
        this.expirations.delete(key);
        return this.store.delete(key);
    }

    async getAll(pattern) {
        const results = [];
        const prefix = pattern.replace('*', '');
        
        for (const [key, value] of this.store.entries()) {
            if (key.startsWith(prefix)) {
                // Check expiration
                const expiry = this.expirations.get(key);
                if (!expiry || Date.now() <= expiry) {
                    results.push(value);
                }
            }
        }
        
        return results;
    }
}

/**
 * Redis Storage Adapter
 * For production use with Redis
 * Requires 'redis' package: npm install redis
 */
export class RedisStorage {
    constructor(redisClient) {
        if (!redisClient) {
            throw new Error('Redis client is required');
        }
        this.redis = redisClient;
    }

    async get(key) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key, value, ttl) {
        const data = JSON.stringify(value);
        if (ttl) {
            await this.redis.setEx(key, ttl, data);
        } else {
            await this.redis.set(key, data);
        }
        return true;
    }

    async delete(key) {
        await this.redis.del(key);
        return true;
    }

    async getAll(pattern) {
        const keys = await this.redis.keys(pattern);
        const results = [];
        
        for (const key of keys) {
            const data = await this.get(key);
            if (data) results.push(data);
        }
        
        return results;
    }
}

export { NodeCacheStorage };
export default GuestManager;
