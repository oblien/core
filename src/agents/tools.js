/**
 * Tools Class
 * Manages AI tools - listing, searching, creating, and getting tool details
 */

export class Tools {
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
     * List all available tools with optional filters
     * @param {Object} [options] - Filter options
     * @param {string} [options.type] - Filter by type: 'client' | 'server' | 'hybrid'
     * @param {string} [options.category] - Filter by category: 'custom' | 'file' | 'search' | 'terminal' | 'browser' | 'project' | 'web'
     * @param {boolean} [options.requireEnvironment] - Filter by environment requirement
     * @param {boolean} [options.myCustomTools] - Show only user's custom tools
     * @returns {Promise<Object>} List of tools
     */
    async list(options = {}) {
        const params = {};

        if (options.type) params.type = options.type;
        if (options.category) params.category = options.category;
        if (options.requireEnvironment !== undefined) {
            params.require_environment = String(options.requireEnvironment);
        }
        if (options.myCustomTools) params.my_custom_tools = 'true';

        const response = await this.client.get('ai/tools', params);
        return response;
    }

    /**
     * Search tools by query
     * @param {string} query - Search query
     * @param {Object} [options] - Filter options
     * @param {string} [options.type] - Filter by type
     * @param {string} [options.category] - Filter by category
     * @param {boolean} [options.myCustomTools] - Show only user's custom tools
     * @returns {Promise<Object>} Search results
     */
    async search(query, options = {}) {
        const params = { q: query };

        if (options.type) params.type = options.type;
        if (options.category) params.category = options.category;
        if (options.myCustomTools) params.my_custom_tools = 'true';

        const response = await this.client.get('ai/tools/search', params);
        return response;
    }

    /**
     * Get tool by slug
     * @param {string} slug - Tool slug/ID
     * @returns {Promise<Object>} Tool details
     */
    async get(slug) {
        if (!slug) {
            throw new Error('Tool slug is required');
        }

        const response = await this.client.get(`ai/tools/${slug}`);
        return response;
    }

    /**
     * Create a custom tool (client-side tool)
     * @param {Object} toolData - Tool configuration
     * @param {string} toolData.slug - Unique tool slug/ID
     * @param {string} toolData.tool_name - Tool name
     * @param {string} toolData.tool_description - Tool description
     * @param {string} [toolData.icon] - Tool icon
     * @param {string} [toolData.type='client'] - Tool type: 'client' | 'server' | 'hybrid'
     * @param {string} [toolData.category='custom'] - Tool category
     * @param {Object} [toolData.input_scheme] - Input schema/parameters
     * @param {Object} [toolData.output_scheme] - Output schema
     * @param {string} [toolData.prompt] - Tool prompt/instructions
     * @param {boolean} [toolData.require_environment=false] - Requires context/environment
     * @param {string} [toolData.context_type] - Context type if required
     * @returns {Promise<Object>} Created tool
     */
    async create(toolData) {
        const {
            slug,
            tool_name,
            tool_description,
            icon,
            type = 'client',
            category = 'custom',
            input_scheme,
            output_scheme,
            prompt,
            require_environment = false,
            context_type
        } = toolData;

        if (!slug || !tool_name || !tool_description) {
            throw new Error('slug, tool_name, and tool_description are required');
        }

        const payload = {
            slug,
            tool_name,
            tool_description,
            icon,
            type,
            category,
            input_scheme,
            output_scheme,
            prompt,
            require_environment,
            context_type
        };

        const response = await this.client.post('ai/tools', payload);
        return response;
    }

    /**
     * Validate tool IDs
     * @param {Array<string>} toolIds - Array of tool slugs to validate
     * @returns {Promise<Object>} Validation result
     */
    async validate(toolIds) {
        if (!Array.isArray(toolIds)) {
            throw new Error('toolIds must be an array');
        }

        // Get all tools and check which ones exist
        const allTools = await this.list();
        const existingSlugs = allTools.tools.map(t => t.slug);
        
        const validIds = toolIds.filter(id => existingSlugs.includes(id));
        const invalidIds = toolIds.filter(id => !existingSlugs.includes(id));

        return {
            valid: invalidIds.length === 0,
            validIds,
            invalidIds,
            error: invalidIds.length > 0 ? `Invalid tool IDs: ${invalidIds.join(', ')}` : null
        };
    }
}

export default Tools;

