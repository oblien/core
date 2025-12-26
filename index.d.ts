/**
 * TypeScript definitions for oblien
 */

// ============ Client Types ============

export interface OblienConfig {
    clientId: string;
    clientSecret: string;
    baseURL?: string;
}

export class OblienClient {
    constructor(config: OblienConfig);
    
    authenticate(): Promise<string>;
    getAuthHeaders(): Promise<Record<string, string>>;
    get(path: string, params?: Record<string, any>): Promise<any>;
    post(path: string, body?: Record<string, any>): Promise<any>;
    put(path: string, body?: Record<string, any>): Promise<any>;
    patch(path: string, body?: Record<string, any>): Promise<any>;
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
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
    endUserId?: string;
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
    namespace?: string; // For authenticated users, typically user_id
    workspace?: Record<string, any>;
    endUserId?: string;
    isGuest?: boolean;
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
}

export interface CreateGuestSessionOptions {
    ip: string;
    fingerprint?: string;
    agentId: string;
    workflowId?: string;
    metadata?: Record<string, any>;
    workspace?: Record<string, any>;
    endUserId?: string;
}

export interface GuestSessionData extends SessionData {
    guest: {
        id: string;
        namespace: string;
        createdAt: string;
    };
}

export interface SendMessageOptions {
    token?: string;
    message: string;
    uploadId?: string;
    files?: any[];
    stream?: boolean;
    onChunk?: (data: any) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    metadata?: Record<string, any>;
}

export interface UploadOptions {
    token?: string;
    files: any[] | any;
    metadata?: Record<string, any>;
}

export interface GuestUsageInfo {
    success: boolean;
    namespace: string;
    requestCount: number;
    limit: number;
    remaining: number;
    resetAt?: Date;
}

export interface CacheStatistics {
    success: boolean;
    cache: {
        keys: number;
        hits: number;
        misses: number;
        hitRate: number;
        keysSize: number;
        valuesSize: number;
    };
}

export class OblienChat {
    constructor(client: OblienClient, options?: ChatOptions);
    
    createSession(options: CreateSessionOptions): Promise<SessionData>;
    createGuestSession(options: CreateGuestSessionOptions): Promise<GuestSessionData>;
    getGuest(ip: string, fingerprint?: string): Promise<Guest | null>;
    send(options: SendMessageOptions): Promise<any>;
    upload(options: UploadOptions): Promise<any>;
    getSession(sessionId: string): Promise<any>;
    listSessions(options?: Record<string, any>): Promise<any[]>;
    deleteSession(sessionId: string): Promise<any>;
    getAllGuests(): Promise<Guest[]>;
    cleanupGuests(): Promise<number>;
    getGuestUsage(token: string): Promise<GuestUsageInfo>;
    getCacheStatistics(): Promise<CacheStatistics>;
}

// ============ Namespaces ============

export interface NamespaceData {
    id: string;
    client_id: string;
    name: string;
    slug: string;
    description?: string;
    end_user_id?: string;
    fingerprint?: string;
    ip_address?: string;
    user_agent?: string;
    country?: string;
    status: 'active' | 'inactive' | 'suspended' | 'archived';
    type: string;
    is_default: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    created_at: string;
    updated_at: string;
    last_active_at?: string;
    archived_at?: string;
}

export interface CreateNamespaceOptions {
    name: string;
    slug?: string;
    description?: string;
    type?: 'default' | 'production' | 'testing' | 'development';
    isDefault?: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    endUserId?: string;
}

export interface UpdateNamespaceOptions {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'suspended' | 'archived';
    type?: string;
    metadata?: Record<string, any>;
    tags?: string[];
}

export interface ListNamespacesOptions {
    limit?: number;
    offset?: number;
    status?: 'active' | 'inactive' | 'suspended' | 'archived';
    type?: string;
    search?: string;
    sortBy?: 'name' | 'created_at' | 'updated_at' | 'last_active_at';
    sortOrder?: 'ASC' | 'DESC';
}

export interface ServiceConfig {
    id: number;
    namespace_id: string;
    service: string;
    enabled: boolean;
    config?: Record<string, any>;
    rate_limit_requests?: number;
    rate_limit_period?: string;
    features?: string[];
    created_at: string;
    updated_at: string;
}

export interface ConfigureServiceOptions {
    service: string;
    enabled?: boolean;
    config?: Record<string, any>;
    rateLimitRequests?: number;
    rateLimitPeriod?: 'minute' | 'hour' | 'day';
    features?: string[];
}

export interface NamespaceUsage {
    usage: Array<{
        service: string;
        date: string;
        requests: number;
        credits: number;
        deductions: number;
    }>;
    summary: Array<{
        service: string;
        total_requests: number;
        total_credits: number;
        first_used: string;
        last_used: string;
    }>;
    quotas: Array<any>;
    active_sessions: number;
}

export class Namespace {
    constructor(options: { client: OblienClient; namespaceId?: string; data?: NamespaceData });
    
    namespaceId: string | null;
    data: NamespaceData | null;
    
    create(options: CreateNamespaceOptions): Promise<NamespaceData>;
    get(identifier?: string): Promise<NamespaceData>;
    update(updates: UpdateNamespaceOptions, namespaceId?: string): Promise<NamespaceData>;
    delete(namespaceId?: string): Promise<any>;
    getActivity(options?: { limit?: number; offset?: number }, namespaceId?: string): Promise<any[]>;
    getUsage(options?: { service?: string; days?: number }, namespaceId?: string): Promise<NamespaceUsage>;
    configureService(options: ConfigureServiceOptions, namespaceId?: string): Promise<ServiceConfig>;
    listServices(namespaceId?: string): Promise<ServiceConfig[]>;
    getServiceConfig(service: string, namespaceId?: string): Promise<ServiceConfig>;
    toggleService(service: string, enabled: boolean, namespaceId?: string): Promise<ServiceConfig>;
    deleteService(service: string, namespaceId?: string): Promise<any>;
    bulkConfigureServices(services: ConfigureServiceOptions[], namespaceId?: string): Promise<ServiceConfig[]>;
}

export class OblienNamespaces {
    constructor(client: OblienClient);
    
    create(options: CreateNamespaceOptions): Promise<NamespaceData>;
    get(identifier: string): Promise<NamespaceData>;
    list(options?: ListNamespacesOptions): Promise<{ success: boolean; data: NamespaceData[]; pagination: any }>;
    update(namespaceId: string, updates: UpdateNamespaceOptions): Promise<NamespaceData>;
    delete(namespaceId: string): Promise<any>;
    getActivity(namespaceId: string, options?: { limit?: number; offset?: number }): Promise<any[]>;
    getUsage(namespaceId: string, options?: { service?: string; days?: number }): Promise<NamespaceUsage>;
    getAvailableServices(): Promise<any[]>;
    configureService(namespaceId: string, options: ConfigureServiceOptions): Promise<ServiceConfig>;
    listServices(namespaceId: string): Promise<ServiceConfig[]>;
    getServiceConfig(namespaceId: string, service: string): Promise<ServiceConfig>;
    toggleService(namespaceId: string, service: string, enabled: boolean): Promise<ServiceConfig>;
    enableService(namespaceId: string, service: string): Promise<ServiceConfig>;
    disableService(namespaceId: string, service: string): Promise<ServiceConfig>;
    deleteService(namespaceId: string, service: string): Promise<any>;
    bulkConfigureServices(namespaceId: string, services: ConfigureServiceOptions[]): Promise<ServiceConfig[]>;
    namespace(namespaceId?: string): Namespace;
}

// ============ Credits ============

export interface QuotaData {
    id: number;
    client_id: string;
    namespace: string;
    service: string;
    quota_limit: number | null;
    quota_used: number;
    period: string;
    period_start?: string;
    period_end?: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreditTransaction {
    id: number;
    client_id: string;
    namespace: string;
    end_user_id?: string;
    amount: number;
    client_balance_after: number;
    namespace_quota_used?: number;
    type: 'deduction' | 'addition' | 'refund' | 'adjustment';
    service?: string;
    description?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface SetQuotaOptions {
    namespace: string;
    service: string;
    quotaLimit: number;
    period?: 'daily' | 'monthly' | 'unlimited';
}

export interface SetEndUserQuotaOptions {
    namespace: string;
    endUserId: string;
    service: string;
    quotaLimit: number;
    period?: 'daily' | 'monthly' | 'unlimited';
}

export interface EndUserQuota {
    limit: number;
    used: number;
    remaining: number;
    period: string;
    enabled: boolean;
}

export interface SetDefaultQuotaOptions {
    level: 'namespace' | 'end_user';
    service: string;
    quotaLimit: number | null;
    period?: 'daily' | 'monthly' | 'unlimited';
    autoApply?: boolean;
}

export interface DefaultQuotaConfig {
    id: number;
    level: 'namespace' | 'end_user';
    service: string;
    quotaLimit: number | null;
    period: string;
    autoApply: boolean;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HistoryOptions {
    namespace?: string;
    endUserId?: string;
    service?: string;
    type?: 'deduction' | 'addition' | 'refund' | 'adjustment';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    after?: string;
    afterId?: number;
}

export interface SummaryOptions {
    namespace?: string;
    days?: number;
    limit?: number;
    offset?: number;
    after?: number;
}

export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    active: boolean;
}

export interface CalculateCostOptions {
    packageId?: string;
    amount?: number;
    credits?: number;
}

export interface PurchaseOptions {
    packageId?: string;
    amount?: number;
    metadata?: Record<string, any>;
}

export interface PurchaseHistoryOptions {
    limit?: number;
    offset?: number;
    light?: boolean;
}

export class OblienCredits {
    constructor(client: OblienClient);
    
    // Balance Management
    getBalance(): Promise<number>;
    addCredits(amount: number, reason?: string, metadata?: Record<string, any>): Promise<any>;
    
    // Quota Management
    getNamespaceQuotas(options?: { limit?: number; offset?: number; after?: string; search?: string; status?: string }): Promise<any>;
    getNamespaceDetails(namespace: string, options?: { days?: number }): Promise<any>;
    setQuota(options: SetQuotaOptions): Promise<QuotaData>;
    resetQuota(namespace: string, service: string): Promise<any>;
    
    // End User Quota Management (Optional Third Level)
    setEndUserQuota(options: SetEndUserQuotaOptions): Promise<any>;
    getEndUserQuota(namespace: string, endUserId: string, service: string): Promise<{ success: boolean; quota: EndUserQuota | null }>;
    resetEndUserQuota(namespace: string, endUserId: string, service: string): Promise<any>;
    
    // Default Quota Configuration (Dynamic, per client)
    setDefaultQuota(options: SetDefaultQuotaOptions): Promise<any>;
    getDefaultQuota(level: 'namespace' | 'end_user', service: string): Promise<{ success: boolean; config: DefaultQuotaConfig | null }>;
    getAllDefaultQuotas(level?: 'namespace' | 'end_user'): Promise<{ success: boolean; configs: DefaultQuotaConfig[] }>;
    deleteDefaultQuota(level: 'namespace' | 'end_user', service: string): Promise<any>;
    toggleDefaultQuotaAutoApply(level: 'namespace' | 'end_user', service: string, autoApply: boolean): Promise<any>;
    
    // Usage History & Transactions
    getHistory(options?: HistoryOptions): Promise<{ success: boolean; data: CreditTransaction[]; pagination: any }>;
    getHistoryFilters(): Promise<{ namespaces: string[]; services: string[] }>;
    getSummary(options?: SummaryOptions): Promise<any>;
    getUsageStats(options?: { days?: number }): Promise<any>;
    
    // Pricing & Packages
    getPackages(): Promise<CreditPackage[]>;
    getPricingInfo(): Promise<any>;
    calculateCost(options: CalculateCostOptions): Promise<any>;
    calculateCredits(amount: number): Promise<any>;
    
    // Purchase Management
    createCheckout(options: PurchaseOptions): Promise<any>;
    getPurchaseHistory(options?: PurchaseHistoryOptions): Promise<any>;
    getPurchaseDetails(purchaseId: string): Promise<any>;
    getPurchaseSession(purchaseId: string): Promise<any>;
    cancelPurchase(purchaseId: string): Promise<any>;
}

// ============ Exports ============

declare const _default: {
    OblienClient: typeof OblienClient;
    OblienChat: typeof OblienChat;
    ChatSession: typeof ChatSession;
    OblienNamespaces: typeof OblienNamespaces;
    Namespace: typeof Namespace;
    OblienCredits: typeof OblienCredits;
    GuestManager: typeof GuestManager;
    NodeCacheStorage: typeof NodeCacheStorage;
    InMemoryStorage: typeof InMemoryStorage;
    RedisStorage: typeof RedisStorage;
};

export default _default;
