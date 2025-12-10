/**
 * TypeScript definitions for oblien-core
 */

// ============ Client Types ============

export interface OblienConfig {
    apiKey: string;
    apiSecret?: string;
    baseURL?: string;
    version?: string;
}

export class OblienClient {
    constructor(config: OblienConfig);
    
    authenticate(): Promise<string>;
    getAuthHeaders(): Promise<Record<string, string>>;
    get(path: string, params?: Record<string, any>): Promise<any>;
    post(path: string, body?: Record<string, any>): Promise<any>;
    put(path: string, body?: Record<string, any>): Promise<any>;
    delete(path: string): Promise<any>;
}

// ============ Storage Adapters ============

export interface StorageAdapter {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getAll(pattern: string): Promise<any[]>;
}

export class NodeCacheStorage implements StorageAdapter {
    constructor(ttl?: number);
    
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getAll(pattern: string): Promise<any[]>;
    getStats(): any;
    clear(): void;
}

export class InMemoryStorage implements StorageAdapter {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getAll(pattern: string): Promise<any[]>;
}

export class RedisStorage implements StorageAdapter {
    constructor(redisClient: any);
    
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getAll(pattern: string): Promise<any[]>;
}

// ============ Guest Manager ============

export interface GuestManagerOptions {
    storage?: StorageAdapter;
    ttl?: number;
    onGuestCreated?: (guest: Guest) => void;
}

export interface Guest {
    id: string;
    namespace: string;
    ip: string;
    isGuest: boolean;
    createdAt: string;
    lastSeen: string;
    metadata: Record<string, any>;
    sessions: string[];
}

export class GuestManager {
    constructor(options?: GuestManagerOptions);
    
    generateGuestId(ip: string): string;
    getOrCreateGuest(ip: string, metadata?: Record<string, any>): Promise<Guest>;
    getGuest(guestId: string): Promise<Guest | null>;
    updateGuest(guestId: string, updates: Partial<Guest>): Promise<Guest>;
    addSession(guestId: string, sessionId: string): Promise<Guest>;
    deleteGuest(guestId: string): Promise<boolean>;
    getAllGuests(): Promise<Guest[]>;
    cleanup(): Promise<number>;
}

// ============ Chat Session ============

export interface SessionOptions {
    client: OblienClient;
    sessionId?: string;
    agentId?: string;
    workflowId?: string;
    isGuest?: boolean;
    namespace?: string;
    workspace?: Record<string, any>;
}

export interface SessionData {
    sessionId: string;
    token: string;
    agentId?: string;
    workflowId?: string;
    namespace?: string;
}

export class ChatSession {
    constructor(options: SessionOptions);
    
    sessionId: string | null;
    token: string | null;
    
    create(): Promise<SessionData>;
    get(sessionId?: string): Promise<any>;
    delete(sessionId?: string): Promise<any>;
    list(options?: Record<string, any>): Promise<any[]>;
}

// ============ Chat Manager ============

export interface ChatOptions {
    guestManager?: GuestManager;
    guestStorage?: StorageAdapter;
    guestTTL?: number;
}

export interface CreateSessionOptions {
    agentId: string;
    workflowId?: string;
    workspace?: Record<string, any>;
}

export interface CreateGuestSessionOptions {
    ip: string;
    agentId: string;
    workflowId?: string;
    metadata?: Record<string, any>;
    workspace?: Record<string, any>;
}

export interface GuestSessionData extends SessionData {
    guest: {
        id: string;
        namespace: string;
        createdAt: string;
    };
}

export class OblienChat {
    constructor(client: OblienClient, options?: ChatOptions);
    
    createSession(options: CreateSessionOptions): Promise<SessionData>;
    createGuestSession(options: CreateGuestSessionOptions): Promise<GuestSessionData>;
    getGuestByIP(ip: string): Promise<Guest | null>;
    getSession(sessionId: string): Promise<any>;
    listSessions(options?: Record<string, any>): Promise<any[]>;
    deleteSession(sessionId: string): Promise<any>;
    getAllGuests(): Promise<Guest[]>;
    cleanupGuests(): Promise<number>;
}

// ============ Exports ============

declare const _default: {
    OblienClient: typeof OblienClient;
    OblienChat: typeof OblienChat;
    ChatSession: typeof ChatSession;
    GuestManager: typeof GuestManager;
    NodeCacheStorage: typeof NodeCacheStorage;
    InMemoryStorage: typeof InMemoryStorage;
    RedisStorage: typeof RedisStorage;
};

export default _default;
