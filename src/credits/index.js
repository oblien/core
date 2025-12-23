/**
 * Credits Module
 * Manages credits, quotas, usage tracking, and transactions
 */

export class OblienCredits {
    /**
     * @param {import('../client.js').OblienClient} client - Oblien client instance
     */
    constructor(client) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
    }

    // =============================================================================
    // Balance Management
    // =============================================================================

    /**
     * Get client's total credit balance
     * @returns {Promise<number>} Current credit balance
     */
    async getBalance() {
        const response = await this.client.get('credits/balance');
        return response.balance;
    }

    /**
     * Add credits to client (internal use - requires admin permissions)
     * @param {number} amount - Amount of credits to add
     * @param {string} [reason] - Reason for adding credits
     * @param {Object} [metadata] - Additional metadata
     * @returns {Promise<Object>} Result with new balance
     */
    async addCredits(amount, reason = 'manual', metadata = {}) {
        const response = await this.client.post('credits/add', {
            amount,
            reason,
            metadata
        });
        return response;
    }

    // =============================================================================
    // Quota Management
    // =============================================================================

    /**
     * Get all namespace quotas with pagination and filtering
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results (default: 100, max: 500)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.after] - Cursor for pagination (format: "namespace:service")
     * @param {string} [options.search] - Search query
     * @param {string} [options.status] - Filter by status: 'active', 'warning', 'exceeded'
     * @returns {Promise<Object>} Namespaces with quotas and pagination info
     */
    async getNamespaceQuotas(options = {}) {
        const response = await this.client.get('credits/namespaces', options);
        return response;
    }

    /**
     * Get detailed namespace quota information
     * @param {string} namespace - Namespace slug or ID
     * @param {Object} [options] - Query options
     * @param {number} [options.days] - Number of days for stats (default: 7, max: 90)
     * @returns {Promise<Object>} Namespace details with quotas, usage, and transactions
     */
    async getNamespaceDetails(namespace, options = {}) {
        const response = await this.client.get(`credits/namespaces/${namespace}`, options);
        return response;
    }

    /**
     * Set quota for a namespace and service
     * @param {Object} options - Quota options
     * @param {string} options.namespace - Namespace slug
     * @param {string} options.service - Service name (e.g., 'ai', 'deployment', 'sandbox')
     * @param {number} options.quotaLimit - Quota limit (null or 0 for unlimited)
     * @param {string} [options.period] - Quota period: 'daily', 'monthly', 'unlimited'
     * @returns {Promise<Object>} Created/updated quota
     */
    async setQuota(options) {
        if (!options.namespace || !options.service) {
            throw new Error('namespace and service are required');
        }

        if (options.quotaLimit === undefined) {
            throw new Error('quotaLimit is required');
        }

        const response = await this.client.post('credits/namespace-quota', {
            namespace: options.namespace,
            service: options.service,
            quotaLimit: options.quotaLimit,
            period: options.period || 'unlimited'
        });

        return response;
    }

    /**
     * Reset namespace quota (e.g., for monthly reset)
     * @param {string} namespace - Namespace slug
     * @param {string} service - Service name
     * @returns {Promise<Object>} Reset result
     */
    async resetQuota(namespace, service) {
        if (!namespace || !service) {
            throw new Error('namespace and service are required');
        }

        const response = await this.client.post('credits/reset-quota', {
            namespace,
            service
        });

        return response;
    }

    // =============================================================================
    // Usage History & Transactions
    // =============================================================================

    /**
     * Get credit usage history with filtering and pagination
     * @param {Object} [options] - Query options
     * @param {string} [options.namespace] - Filter by namespace
     * @param {string} [options.endUserId] - Filter by end user ID
     * @param {string} [options.service] - Filter by service
     * @param {string} [options.type] - Filter by type: 'deduction', 'addition', 'refund', 'adjustment'
     * @param {string} [options.startDate] - Start date (ISO string)
     * @param {string} [options.endDate] - End date (ISO string)
     * @param {number} [options.limit] - Max results (default: 50)
     * @param {number} [options.offset] - Offset for pagination
     * @param {string} [options.after] - Cursor for pagination (timestamp)
     * @param {number} [options.afterId] - Cursor ID for pagination
     * @returns {Promise<Object>} History with transactions and pagination
     */
    async getHistory(options = {}) {
        const response = await this.client.get('credits/history', options);
        return response;
    }

    /**
     * Get available filter options for history
     * @returns {Promise<Object>} Available namespaces and services
     */
    async getHistoryFilters() {
        const response = await this.client.get('credits/history/filters');
        return response;
    }

    /**
     * Get usage summary by namespace/service
     * @param {Object} [options] - Query options
     * @param {string} [options.namespace] - Filter by namespace
     * @param {number} [options.days] - Number of days to look back (default: 30)
     * @param {number} [options.limit] - Max results (default: 50, max: 500)
     * @param {number} [options.offset] - Offset for pagination
     * @param {number} [options.after] - Cursor for pagination (total_spent value)
     * @returns {Promise<Object>} Summary with aggregated usage
     */
    async getSummary(options = {}) {
        const response = await this.client.get('credits/summary', options);
        return response;
    }

    /**
     * Get daily usage statistics (for charts)
     * @param {Object} [options] - Query options
     * @param {number} [options.days] - Number of days (default: 7)
     * @returns {Promise<Object>} Daily usage statistics
     */
    async getUsageStats(options = {}) {
        const response = await this.client.get('credits/usage-stats', options);
        return response;
    }

    // =============================================================================
    // Pricing & Packages
    // =============================================================================

    /**
     * Get available credit packages
     * @returns {Promise<Array>} Array of credit packages
     */
    async getPackages() {
        const response = await this.client.get('credits/packages');
        return response.packages || response.data || response;
    }

    /**
     * Get pricing information and limits
     * @returns {Promise<Object>} Pricing info with rates and limits
     */
    async getPricingInfo() {
        const response = await this.client.get('credits/pricing-info');
        return response;
    }

    /**
     * Calculate credits from money or vice versa
     * @param {Object} options - Calculation options
     * @param {string} [options.packageId] - Package ID to calculate
     * @param {number} [options.amount] - Money amount to convert to credits
     * @param {number} [options.credits] - Credits to convert to money
     * @returns {Promise<Object>} Calculation result with amount and credits
     */
    async calculateCost(options) {
        if (!options.packageId && !options.amount && !options.credits) {
            throw new Error('Must provide either packageId, amount, or credits');
        }

        const response = await this.client.post('credits/calculate-cost', options);
        return response;
    }

    /**
     * Calculate credits for a given amount (preview)
     * @param {number} amount - Money amount
     * @returns {Promise<Object>} Credits calculation
     */
    async calculateCredits(amount) {
        const response = await this.client.get('credits/calculate', { amount });
        return response;
    }

    // =============================================================================
    // Purchase Management
    // =============================================================================

    /**
     * Create Stripe checkout to purchase credits
     * @param {Object} options - Purchase options
     * @param {string} [options.packageId] - Package ID to purchase
     * @param {number} [options.amount] - Custom amount to purchase
     * @param {Object} [options.metadata] - Additional metadata
     * @returns {Promise<Object>} Checkout session with URL
     */
    async createCheckout(options) {
        if (!options.packageId && !options.amount) {
            throw new Error('Must provide either packageId or amount');
        }

        const response = await this.client.post('credits/purchase', options);
        return response;
    }

    /**
     * Get purchase history
     * @param {Object} [options] - Query options
     * @param {number} [options.limit] - Max results (default: 50, max: 100)
     * @param {number} [options.offset] - Offset for pagination
     * @param {boolean} [options.light] - If true, returns basic data only (faster)
     * @returns {Promise<Object>} Purchase history with pagination
     */
    async getPurchaseHistory(options = {}) {
        const response = await this.client.get('credits/purchases', options);
        return response;
    }

    /**
     * Get single purchase details
     * @param {string} purchaseId - Purchase ID
     * @returns {Promise<Object>} Purchase details
     */
    async getPurchaseDetails(purchaseId) {
        const response = await this.client.get(`credits/purchases/${purchaseId}`);
        return response;
    }

    /**
     * Get Stripe checkout session URL for pending purchase
     * @param {string} purchaseId - Purchase ID
     * @returns {Promise<Object>} Session with checkout URL
     */
    async getPurchaseSession(purchaseId) {
        const response = await this.client.get(`credits/purchases/${purchaseId}/session`);
        return response;
    }

    /**
     * Cancel a pending purchase
     * @param {string} purchaseId - Purchase ID
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelPurchase(purchaseId) {
        const response = await this.client.post(`credits/purchases/${purchaseId}/cancel`);
        return response;
    }
}

export default OblienCredits;

