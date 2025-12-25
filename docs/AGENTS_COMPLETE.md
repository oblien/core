## Oblien Agents - Complete Guide

Comprehensive SDK for managing AI agents with proper settings sections and tools management.

## Installation

```bash
npm install oblien
```

## Structure Overview

```
OblienAgents
├── CRUD Operations (create, get, list, search, update, delete)
├── Agent Instance (.agent(id))
│   ├── settings (Settings Manager)
│   │   ├── updateSwitches()
│   │   ├── updateModelConfig()
│   │   ├── updateTools()
│   │   ├── updateGuestLimits()
│   │   ├── updateContext()
│   │   └── getAll()
│   └── Operations (getOverview, getSessions, etc.)
└── tools (Tools Manager)
    ├── list()
    ├── search()
    ├── get()
    ├── create()
    └── validate()
```

## Quick Start

```javascript
import { OblienClient, OblienAgents } from 'oblien';

const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const agents = new OblienAgents(client);
```

---

## Settings Management

Settings are organized into **5 sections**, each with its own endpoint and validation:

### 1. Switches (Boolean Toggles)

```javascript
const agent = agents.agent('agent-id');

await agent.settings.updateSwitches({
    enable_memory: true,        // Enable conversation memory
    allow_thinking: true,       // Allow thinking process
    allow_images: true,         // Allow image uploads
    allow_videos: false,        // Allow video uploads
    allow_audio: false,         // Allow audio uploads
    allow_documents: true,      // Allow document uploads
    allow_built_in: true        // Allow built-in tools
});
```

**API:** `PUT /ai/agents/:id/switches`

---

### 2. Model Configuration

```javascript
await agent.settings.updateModelConfig({
    model: 'oblien-master',     // Model name
    temperature: 0.8,           // 0-2 (default: 1)
    max_tokens: 3000,           // 1-200000 (default: 2000)
    top_p: 0.9                  // 0-1 (default: 1)
});
```

**API:** `PUT /ai/agents/:id/model-config`

**Validation:**
- `temperature`: 0-2
- `max_tokens`: 1-200,000
- `top_p`: 0-1

---

### 3. Tools Configuration

```javascript
// Assign tools to agent
await agent.settings.updateTools([
    'web-search',
    'calculator',
    'file-read',
    'file-write'
]);
```

**API:** `PUT /ai/agents/:id/tools`

**Features:**
- Validates tool IDs against database
- Maximum 100 tools per agent
- Returns error for invalid tool IDs

---

### 4. Guest Limits

```javascript
await agent.settings.updateGuestLimits({
    enabled: true,
    max_requests_per_minute: 50,        // 1-1000
    max_messages_per_hour: 500,         // 1-10000
    max_messages_per_day: 5000,         // 1-50000
    max_total_tokens_per_day: 100000,   // 1000-10000000
    max_input_tokens_per_day: 50000,    // 1000-10000000
    max_output_tokens_per_day: 50000    // 1000-10000000
});
```

**API:** `PUT /ai/agents/:id/guest-limits`

**Validation:**
- All numeric fields have min/max ranges
- `enabled` must be boolean

---

### 5. Context Settings

```javascript
await agent.settings.updateContext({
    max_history_messages: 40,
    history_token_limit: 4000
});
```

**API:** `PUT /ai/agents/:id/context`

---

## Tools Management

Complete tools management system with **4 main operations**:

### Access Tools Manager

```javascript
const tools = agents.tools;
```

### 1. List Tools

```javascript
// List all tools
const allTools = await tools.list();

// Filter by type
const clientTools = await tools.list({
    type: 'client'  // 'client' | 'server' | 'hybrid'
});

// Filter by category
const fileTools = await tools.list({
    category: 'file'  // 'custom' | 'file' | 'search' | 'terminal' | 'browser' | 'project' | 'web'
});

// Filter by environment requirement
const contextTools = await tools.list({
    requireEnvironment: true
});

// Get only my custom tools
const myTools = await tools.list({
    myCustomTools: true
});

// Combine filters
const webClientTools = await tools.list({
    type: 'client',
    category: 'web'
});
```

**API:** `GET /ai/tools`

**Response:**
```json
{
    "success": true,
    "count": 15,
    "tools": [
        {
            "slug": "web-search",
            "name": "Web Search",
            "description": "Search the web",
            "type": "client",
            "category": "web",
            "require_environment": false,
            "context_type": null,
            "input_scheme": {...},
            "output_scheme": {...}
        }
    ]
}
```

---

### 2. Search Tools

```javascript
// Search by query
const results = await tools.search('search');

// Search with filters
const webSearch = await tools.search('search', {
    category: 'web',
    type: 'client'
});
```

**API:** `GET /ai/tools/search?q=query`

---

### 3. Get Tool by Slug

```javascript
const tool = await tools.get('web-search');

console.log(tool);
// {
//     slug: 'web-search',
//     tool_name: 'Web Search',
//     tool_description: 'Search the web',
//     type: 'client',
//     category: 'web',
//     input_scheme: {...},
//     output_scheme: {...},
//     require_environment: false,
//     context_type: null
// }
```

**API:** `GET /ai/tools/:slug`

---

### 4. Create Custom Tool

```javascript
const customTool = await tools.create({
    slug: 'data-analyzer',              // Required: Unique ID
    tool_name: 'Data Analyzer',         // Required: Display name
    tool_description: 'Analyzes data',  // Required: Description
    
    // Optional fields
    icon: '📊',
    type: 'client',                     // 'client' | 'server' | 'hybrid'
    category: 'custom',
    
    // Schemas (optional but recommended)
    input_scheme: {
        type: 'object',
        properties: {
            data: { type: 'array' },
            format: { type: 'string' }
        },
        required: ['data']
    },
    output_scheme: {
        type: 'object',
        properties: {
            result: { type: 'object' },
            insights: { type: 'array' }
        }
    },
    
    // Instructions for AI (optional)
    prompt: 'Analyze the provided data and return insights.',
    
    // Environment (optional)
    require_environment: false,         // Requires context?
    context_type: null                  // 'workspace' | 'session' | null
});
```

**API:** `POST /ai/tools`

**Types:**
- `client`: Client-side tool (user provides implementation)
- `server`: Server-side tool (handled by server)
- `hybrid`: Both client and server components

**Categories:**
- `custom`: User-created tools
- `file`: File operations
- `search`: Search operations
- `terminal`: Terminal commands
- `browser`: Browser automation
- `project`: Project management
- `web`: Web operations

---

### 5. Validate Tools

```javascript
const validation = await tools.validate([
    'web-search',
    'calculator',
    'invalid-tool'
]);

console.log(validation);
// {
//     valid: false,
//     validIds: ['web-search', 'calculator'],
//     invalidIds: ['invalid-tool'],
//     error: 'Invalid tool IDs: invalid-tool'
// }

// Assign only valid tools
if (validation.validIds.length > 0) {
    await agent.settings.updateTools(validation.validIds);
}
```

---

## Complete Workflow Example

```javascript
import { OblienClient, OblienAgents } from 'oblien';

const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const agents = new OblienAgents(client);

// Step 1: Browse and validate tools
const tools = agents.tools;
const availableTools = await tools.list({ type: 'client' });
console.log('Available tools:', availableTools.tools.map(t => t.slug));

// Validate tools before assigning
const toolValidation = await tools.validate([
    'web-search',
    'calculator',
    'file-read'
]);

// Step 2: Create agent
const agent = await agents.create({
    name: 'Support Agent',
    description: 'Customer support AI',
    namespace: 'production',
    prompts: {
        identity: 'You are a helpful support agent.',
        rules: 'Be professional and clear.',
        guidelines: 'Always provide actionable solutions.'
    }
});

const agentId = agent.agentId;

// Step 3: Configure settings
const agentInstance = agents.agent(agentId);
const settings = agentInstance.settings;

// Configure model
await settings.updateModelConfig({
    model: 'oblien-master',
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9
});

// Configure switches
await settings.updateSwitches({
    enable_memory: true,
    allow_thinking: true,
    allow_images: true,
    allow_documents: true,
    allow_videos: false,
    allow_audio: false,
    allow_built_in: true
});

// Assign validated tools
if (toolValidation.valid) {
    await settings.updateTools(toolValidation.validIds);
}

// Set guest limits
await settings.updateGuestLimits({
    enabled: true,
    max_messages_per_day: 1000,
    max_total_tokens_per_day: 50000
});

// Configure context
await settings.updateContext({
    max_history_messages: 40,
    history_token_limit: 4000
});

// Step 4: Verify configuration
const agentDetails = await agents.get(agentId);
console.log('Agent configured:', {
    name: agentDetails.agent_name,
    namespace: agentDetails.namespace,
    settings: agentDetails.settings,
    tools: agentDetails.tools  // Populated with full tool objects
});

// Step 5: Monitor performance
const overview = await agentInstance.getOverview({ days: 7 });
console.log('Performance:', overview);
```

---

## Settings Sections - Full Definitions

### AgentSwitches
```typescript
interface AgentSwitches {
    enable_memory?: boolean;        // Enable conversation memory
    allow_thinking?: boolean;       // Allow thinking/reasoning process
    allow_images?: boolean;         // Allow image file uploads
    allow_videos?: boolean;         // Allow video file uploads
    allow_audio?: boolean;          // Allow audio file uploads
    allow_documents?: boolean;      // Allow document uploads
    allow_built_in?: boolean;       // Allow built-in system tools
}
```

### ModelConfig
```typescript
interface ModelConfig {
    model?: string;                 // Model name (max 100 chars)
    temperature?: number;           // 0-2, controls randomness
    max_tokens?: number;            // 1-200000, max response tokens
    top_p?: number;                 // 0-1, nucleus sampling
}
```

### Tools
```typescript
type Tools = string[];              // Array of tool slugs (max 100)
```

### GuestLimits
```typescript
interface GuestLimits {
    enabled?: boolean;                          // Enable/disable limits
    max_requests_per_minute?: number;           // 1-1000
    max_messages_per_hour?: number;             // 1-10000
    max_messages_per_day?: number;              // 1-50000
    max_total_tokens_per_day?: number;          // 1000-10000000
    max_input_tokens_per_day?: number;          // 1000-10000000
    max_output_tokens_per_day?: number;         // 1000-10000000
}
```

### ContextSettings
```typescript
interface ContextSettings {
    max_history_messages?: number;              // Max messages in context
    history_token_limit?: number;               // Max tokens in history
}
```

### Tool Definition
```typescript
interface ToolData {
    slug: string;                               // Unique ID (required)
    tool_name: string;                          // Display name (required)
    tool_description: string;                   // Description (required)
    icon?: string;                              // Icon/emoji
    type?: 'client' | 'server' | 'hybrid';      // Tool type
    category?: string;                          // Category
    input_scheme?: object;                      // JSON Schema for input
    output_scheme?: object;                     // JSON Schema for output
    prompt?: string;                            // AI instructions
    require_environment?: boolean;              // Needs context?
    context_type?: 'workspace' | 'session' | null;  // Context type
}
```

---

## Best Practices

### 1. Always Validate Tools Before Assignment
```javascript
const validation = await agents.tools.validate(toolIds);
if (validation.valid) {
    await agent.settings.updateTools(validation.validIds);
} else {
    console.error('Invalid tools:', validation.invalidIds);
}
```

### 2. Use Settings Sections Appropriately
```javascript
// ✅ Good: Update specific sections
await agent.settings.updateSwitches({ enable_memory: true });
await agent.settings.updateModelConfig({ temperature: 0.8 });

// ❌ Bad: Don't mix sections in one call
// await agent.settings.updateSwitches({
//     enable_memory: true,
//     temperature: 0.8  // Wrong! This is model config
// });
```

### 3. Organize Tools by Category
```javascript
// Browse tools by category first
const fileTools = await agents.tools.list({ category: 'file' });
const webTools = await agents.tools.list({ category: 'web' });

// Assign relevant tools to agent
await agent.settings.updateTools([
    ...fileTools.tools.slice(0, 3).map(t => t.slug),
    ...webTools.tools.slice(0, 2).map(t => t.slug)
]);
```

### 4. Set Appropriate Guest Limits
```javascript
// Production: Strict limits
await agent.settings.updateGuestLimits({
    enabled: true,
    max_messages_per_day: 500,
    max_total_tokens_per_day: 25000
});

// Development: Generous limits
await agent.settings.updateGuestLimits({
    enabled: true,
    max_messages_per_day: 10000,
    max_total_tokens_per_day: 500000
});
```

---

## API Endpoints Reference

| Section | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **Agents** | POST | `/ai/agents/create` | Create agent |
| | GET | `/ai/agents/list` | List agents |
| | GET | `/ai/agents/search` | Search agents |
| | GET | `/ai/agents/:id` | Get agent |
| | PUT | `/ai/agents/:id` | Update agent |
| | DELETE | `/ai/agents/:id` | Delete agent |
| **Settings** | PUT | `/ai/agents/:id/switches` | Update switches |
| | PUT | `/ai/agents/:id/model-config` | Update model config |
| | PUT | `/ai/agents/:id/tools` | Update tools |
| | PUT | `/ai/agents/:id/guest-limits` | Update guest limits |
| | PUT | `/ai/agents/:id/context` | Update context |
| **Tools** | GET | `/ai/tools` | List tools |
| | GET | `/ai/tools/search` | Search tools |
| | GET | `/ai/tools/:slug` | Get tool |
| | POST | `/ai/tools` | Create custom tool |

---

## Support

- **Documentation**: https://docs.oblien.com
- **API Reference**: https://api.oblien.com/docs
- **Examples**: `/examples/agents-complete-example.js`
- **Support**: support@oblien.com

