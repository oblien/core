/**
 * Oblien Icons Module
 * Search and fetch icons, images, and videos
 */

export class OblienIcons {
    constructor(client) {
        if (!client) throw new Error('Oblien client is required');
        this.client = client;
    }

    /**
     * Search for icons using semantic search
     * 
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @param {number} options.offset - Pagination offset (default: 0)
     * @param {number} options.limit - Number of results (default: 100)
     * @returns {Promise<Object>} Search results with pagination info
     * 
     * @example
     * const results = await icons.search('home', { limit: 50 });
     * // Returns:
     * // {
     * //   results: [
     * //     {
     * //       url: 'https://cdn.oblien.com/static/png-icons/...',
     * //       filename: 'home-outline.png',
     * //       name: 'home',
     * //       description: 'home',
     * //       style: 'Outline',
     * //       score: 0.95,
     * //       success: true
     * //     }
     * //   ],
     * //   hasMore: true,
     * //   offset: 50,
     * //   total: 245
     * // }
     */
    async search(query, options = {}) {
        if (!query || typeof query !== 'string') {
            throw new Error('Query must be a non-empty string');
        }

        const { offset = 0, limit = 100 } = options;

        return this.client.post('icons/search-icons', {
            query: query.trim(),
            offset,
            limit
        });
    }

    /**
     * Fetch multiple items (icons, images, videos) with semantic matching
     * 
     * @param {Array<Object>} items - Array of items to fetch
     * @param {string} items[].type - Type: 'icon', 'image', or 'video'
     * @param {string} items[].description - Description for semantic matching
     * @param {boolean} items[].is_vector - Whether the item is a vector (optional)
     * @param {string} items[].variant - Variant type (optional, for images/videos)
     * @returns {Promise<Array>} Array of fetched items with URLs
     * 
     * @example
     * const items = await icons.fetch([
     *   { type: 'icon', description: 'user profile' },
     *   { type: 'icon', description: 'settings gear' },
     *   { type: 'image', description: 'mountain landscape' },
     *   { type: 'video', description: 'ocean waves' }
     * ]);
     * 
     * // Returns:
     * // [
     * //   {
     * //     url: 'https://cdn.oblien.com/static/icons/...',
     * //     description: 'user profile',
     * //     style: 'Outline',
     * //     success: true
     * //   },
     * //   {
     * //     url: 'https://cdn.oblien.com/static/assets/...',
     * //     type: 'image',
     * //     description: 'mountain landscape',
     * //     variant: 'regular',
     * //     success: true
     * //   }
     * // ]
     */
    async fetch(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items must be a non-empty array');
        }

        // Validate items
        for (const item of items) {
            if (!item.type || !['icon', 'image', 'video'].includes(item.type)) {
                throw new Error('Each item must have a valid type: icon, image, or video');
            }
            if (!item.description || typeof item.description !== 'string') {
                throw new Error('Each item must have a description string');
            }
        }

        return this.client.post('icons/fetch', { data: items });
    }

    /**
     * Fetch a single icon
     * Convenience method for fetching one icon
     * 
     * @param {string} description - Icon description
     * @returns {Promise<Object>} Icon object with URL
     * 
     * @example
     * const icon = await icons.fetchIcon('home');
     * // Returns: { url: '...', description: 'home', style: 'Outline', success: true }
     */
    async fetchIcon(description) {
        if (!description || typeof description !== 'string') {
            throw new Error('Description must be a non-empty string');
        }

        const result = await this.fetch([{ type: 'icon', description }]);
        return result[0] || null;
    }

    /**
     * Fetch multiple icons at once
     * Convenience method for fetching multiple icons
     * 
     * @param {Array<string>} descriptions - Array of icon descriptions
     * @returns {Promise<Array>} Array of icon objects
     * 
     * @example
     * const icons = await icons.fetchIcons(['home', 'settings', 'user']);
     * // Returns: [{ url: '...', description: 'home', ... }, ...]
     */
    async fetchIcons(descriptions) {
        if (!Array.isArray(descriptions) || descriptions.length === 0) {
            throw new Error('Descriptions must be a non-empty array');
        }

        const items = descriptions.map(desc => ({ type: 'icon', description: desc }));
        return this.fetch(items);
    }

    /**
     * Search icons with pagination helper
     * Automatically handles pagination and returns all results
     * 
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @param {number} options.maxResults - Maximum results to fetch (default: 500)
     * @param {number} options.batchSize - Results per batch (default: 100)
     * @returns {Promise<Array>} All matching icons
     * 
     * @example
     * const allIcons = await icons.searchAll('home', { maxResults: 200 });
     * // Returns: [{ url: '...', name: 'home', ... }, ...]
     */
    async searchAll(query, options = {}) {
        const { maxResults = 500, batchSize = 100 } = options;
        const allResults = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore && allResults.length < maxResults) {
            const response = await this.search(query, {
                offset,
                limit: Math.min(batchSize, maxResults - allResults.length)
            });

            if (response.results && response.results.length > 0) {
                allResults.push(...response.results);
            }

            hasMore = response.hasMore && allResults.length < maxResults;
            offset = response.offset;
        }

        return allResults;
    }
}

