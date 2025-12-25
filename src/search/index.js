/**
 * Search Module
 * Web search, content extraction, and research crawling
 */

export class OblienSearch {
    /**
     * @param {import('../client.js').OblienClient} client - Oblien client instance
     */
    constructor(client) {
        if (!client) {
            throw new Error('Oblien client is required');
        }

        this.client = client;
    }

    /**
     * Search the web with multiple queries
     * @param {Object} options - Search options
     * @param {Array<string>} options.queries - Array of search queries (required)
     * @param {boolean} [options.includeAnswers=false] - Include AI-generated answers
     * @param {Object} [options.options] - Additional search options
     * @param {number} [options.options.maxResults] - Max results per query
     * @param {string} [options.options.region] - Search region
     * @param {string} [options.options.timeRange] - Time range filter
     * @returns {Promise<Array>} Search results
     */
    async search(options) {
        const { queries, includeAnswers = false, options: searchOptions = {} } = options;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            throw new Error('Queries array is required and must not be empty');
        }

        const response = await this.client.post('search', {
            queries,
            includeAnswers,
            options: searchOptions
        });

        return response;
    }

    /**
     * Extract and summarize content from web pages
     * @param {Object} options - Extract options
     * @param {Array<Object>} options.pages - Array of pages to extract (required)
     * @param {string} options.pages[].url - Page URL (required)
     * @param {Array<string>} options.pages[].details - Details to extract (required)
     * @param {string} [options.pages[].summaryLevel='medium'] - Summary level: 'brief' | 'medium' | 'detailed'
     * @param {Object} [options.options] - Additional extraction options
     * @returns {Promise<Object>} Extracted content
     */
    async extract(options) {
        const { pages, options: extractOptions = {} } = options;

        if (!pages || !Array.isArray(pages) || pages.length === 0) {
            throw new Error('Pages array is required and must not be empty');
        }

        // Validate pages
        pages.forEach((page, index) => {
            if (!page.url) {
                throw new Error(`Page at index ${index} is missing 'url'`);
            }
            if (!page.details || !Array.isArray(page.details) || page.details.length === 0) {
                throw new Error(`Page at index ${index} is missing 'details' array`);
            }
        });

        const response = await this.client.post('search/extract', {
            pages,
            options: extractOptions
        });

        return response;
    }

    /**
     * Create deep research report with AI crawling
     * @param {Object} options - Crawl options
     * @param {string} options.instructions - Research instructions (required)
     * @param {Object} [options.options] - Additional crawl options
     * @param {boolean} [options.options.thinking] - Enable thinking mode
     * @param {boolean} [options.options.allow_thinking_callback] - Allow thinking callbacks
     * @param {boolean} [options.options.stream_text] - Stream text responses
     * @param {string} [options.reportType='pdf'] - Report type: 'pdf' | 'markdown' | 'html'
     * @param {Function} [options.onProgress] - Callback for progress updates (streaming)
     * @returns {Promise<Object>} Research report result
     */
    async crawl(options) {
        const {
            instructions,
            options: crawlOptions = {},
            reportType = 'pdf',
            onProgress = null
        } = options;

        if (!instructions || typeof instructions !== 'string') {
            throw new Error('Instructions string is required');
        }

        // If onProgress is provided, we need to handle streaming
        if (onProgress && typeof onProgress === 'function') {
            return this._crawlWithStreaming({
                instructions,
                options: crawlOptions,
                reportType,
                onProgress
            });
        }

        // Standard JSON response
        const response = await this.client.post('search/crawl', {
            instructions,
            options: crawlOptions,
            responseType: 'json',
            reportType
        });

        return response;
    }

    /**
     * Handle streaming crawl with progress callbacks
     * @private
     */
    async _crawlWithStreaming({ instructions, options, reportType, onProgress }) {
        const url = this.client._buildURL('search/crawl');
        const headers = this.client.getAuthHeaders();

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                instructions,
                options,
                responseType: 'stream',
                reportType
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Crawl request failed');
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalResult = null;

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE messages
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete message in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.type === 'crawl_end') {
                            finalResult = data.data;
                        } else if (data.type === 'error') {
                            throw new Error(data.error);
                        } else {
                            // Progress update
                            onProgress(data);
                        }
                    } catch (error) {
                        console.error('Error parsing SSE data:', error);
                    }
                }
            }
        }

        return finalResult || { success: true };
    }
}

export default OblienSearch;

