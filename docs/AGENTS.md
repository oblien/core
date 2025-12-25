# Oblien Agents Module

Complete SDK support for managing AI agents in the Oblien platform.

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
import { OblienClient, OblienAgents } from 'oblien';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

// Initialize agents module
const agents = new OblienAgents(client);

// Create an agent
const agent = await agents.create({
    name: 'My Agent',
    prompts: {
        identity: 'You are a helpful assistant.'
    },
    namespace: 'production'
});

console.log('Agent created:', agent.agentId);
```

## Features

### ✅ Agent CRUD Operations
- Create, read, update, delete agents
- Namespace support for organization
- Collection management

### ✅ Settings Management
- Model configuration (model, temperature, max_tokens)
- Boolean switches (enable_memory, allow_thinking, etc.)
- Tools configuration
- Guest limits
- Context settings

### ✅ Analytics & Monitoring
- Agent overview/analytics
- Session tracking
- Token usage statistics
- Platform-wide stats

### ✅ User Management
- Get agent users
- View user details
- Reset user limits

### ✅ Security & Moderation
- Ban management
- Namespace validation
- Session locking

## API Reference

### OblienAgents

Main class for agent operations.

#### Constructor

```javascript
const agents = new OblienAgents(client);
```

---

### Agent Creation & Management

#### `create(options)`

Create a new agent.

```javascript
const agent = await agents.create({
    name: 'Customer Support',           // Required
    prompts: {                          // Required
        identity: 'You are...',
        rules: 'Always...',
        guidelines: 'Provide...'
    },
    description: 'Support agent',       // Optional
    namespace: 'production',            // Optional
    collectionIds: ['col1', 'col2'],   // Optional
    settings: {                         // Optional
        model: 'oblien-master',
        temperature: 0.7,
        max_tokens: 2000
    }
});
```

**Parameters:**
- `name` (string, required): Agent name
- `prompts` (object, required): Agent prompts/configuration
- `description` (string, optional): Agent description
- `namespace` (string, optional): Namespace for organization
- `collectionIds` (array, optional): Collection IDs
- `settings` (object, optional): Agent settings

**Returns:** `Promise<Object>` - Created agent data with `agentId`

---

#### `get(agentId, section?)`

Get agent details.

```javascript
// Get full agent
const agent = await agents.get('agent-id');

// Get specific section
const prompts = await agents.get('agent-id', 'prompts');
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `section` (string, optional): Specific section ('prompts', etc.)

**Returns:** `Promise<Object>` - Agent data

---

#### `list(options?)`

List all agents with filtering.

```javascript
const result = await agents.list({
    limit: 50,
    offset: 0,
    namespace: 'production'
});
```

**Parameters:**
- `limit` (number, optional): Max results (default: 50, max: 100)
- `offset` (number, optional): Offset for pagination
- `namespace` (string, optional): Filter by namespace

**Returns:** `Promise<Object>` - Agents data with pagination info

---

#### `search(query, options?)`

Search agents by name or description.

```javascript
const results = await agents.search('support', {
    limit: 20,
    namespace: 'production'
});
```

**Parameters:**
- `query` (string, required): Search query
- `options.limit` (number, optional): Max results (default: 20)
- `options.namespace` (string, optional): Filter by namespace

**Returns:** `Promise<Object>` - Search results

---

#### `update(agentId, updates)`

Update agent details.

```javascript
const result = await agents.update('agent-id', {
    name: 'Updated Name',
    description: 'New description',
    namespace: 'production'  // For validation
});
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `updates` (object, required): Fields to update
  - `name` (string, optional): New name
  - `description` (string, optional): New description
  - `prompts` (object, optional): New prompts
  - `settings` (object, optional): New settings
  - `namespace` (string, optional): Namespace for validation

**Returns:** `Promise<Object>` - Update result

---

#### `delete(agentId, options?)`

Delete an agent.

```javascript
const result = await agents.delete('agent-id', {
    namespace: 'production'  // Optional validation
});
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `options.namespace` (string, optional): Namespace for validation

**Returns:** `Promise<Object>` - Delete result

---

### Settings Management

#### `updateModelConfig(agentId, config)`

Update model configuration.

```javascript
await agents.updateModelConfig('agent-id', {
    model: 'oblien-master',
    temperature: 0.8,
    max_tokens: 3000
});
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `config` (object, required): Model configuration
  - `model` (string, optional): Model name
  - `temperature` (number, optional): Temperature (0-2)
  - `max_tokens` (number, optional): Max tokens

---

#### `updateSwitches(agentId, switches)`

Update boolean toggles.

```javascript
await agents.updateSwitches('agent-id', {
    enable_memory: true,
    allow_thinking: true,
    allow_images: false,
    allow_videos: false
});
```

---

#### `updateTools(agentId, tools)`

Update agent tools.

```javascript
await agents.updateTools('agent-id', [
    'web-search',
    'calculator',
    'code-interpreter'
]);
```

---

#### `updateGuestLimits(agentId, limits)`

Update guest user limits.

```javascript
await agents.updateGuestLimits('agent-id', {
    daily_tokens: 50000,
    daily_messages: 100
});
```

---

#### `updateContext(agentId, context)`

Update context settings.

```javascript
await agents.updateContext('agent-id', {
    max_context_messages: 10,
    context_strategy: 'recent'
});
```

---

### Analytics & Monitoring

#### `getOverview(agentId, options?)`

Get agent analytics/overview.

```javascript
const overview = await agents.getOverview('agent-id', {
    days: 30
});

console.log(overview.total_chats);
console.log(overview.total_messages);
console.log(overview.total_tokens);
console.log(overview.usage_data);
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `options.days` (number, optional): Number of days (default: 7)

**Returns:** `Promise<Object>` - Analytics data

---

#### `getSessions(agentId, options?)`

Get agent sessions.

```javascript
const sessions = await agents.getSessions('agent-id', {
    limit: 20,
    offset: 0,
    search: 'query',
    sortBy: 'time',
    sortOrder: 'desc'
});
```

**Parameters:**
- `agentId` (string, required): Agent ID
- `options.limit` (number, optional): Max results
- `options.offset` (number, optional): Offset for pagination
- `options.search` (string, optional): Search term
- `options.sortBy` (string, optional): Sort field
- `options.sortOrder` (string, optional): Sort order (asc/desc)

**Returns:** `Promise<Object>` - Sessions data

---

#### `getStats()`

Get platform-wide statistics.

```javascript
const stats = await agents.getStats();

console.log(stats.agents.total);
console.log(stats.agents.active);
console.log(stats.tokens.total);
console.log(stats.sessions.thisMonth);
```

**Returns:** `Promise<Object>` - Platform statistics

---

### User Management

#### `getUsers(agentId, options?)`

Get all users for an agent.

```javascript
const users = await agents.getUsers('agent-id');
```

---

#### `getUser(agentId, userId)`

Get specific user details.

```javascript
const user = await agents.getUser('agent-id', 'user-id');
```

---

#### `resetUserLimits(agentId, userId)`

Reset user limits.

```javascript
await agents.resetUserLimits('agent-id', 'user-id');
```

---

### Security & Moderation

#### `getBans(agentId, options?)`

Get agent bans.

```javascript
const bans = await agents.getBans('agent-id');
```

---

### Agent Instance (Chaining)

Create an Agent instance for chaining operations:

```javascript
const agent = agents.agent('agent-id');

// Chain operations
await agent.get();
await agent.updateModelConfig({ temperature: 0.8 });
await agent.updateTools(['web-search']);
const overview = await agent.getOverview({ days: 7 });
```

## Usage Examples

### Example 1: Create and Configure Agent

```javascript
// Create agent
const agent = await agents.create({
    name: 'Sales Assistant',
    description: 'AI agent for sales',
    namespace: 'production',
    prompts: {
        identity: 'You are a sales assistant.',
        rules: 'Be professional and helpful.'
    }
});

const agentId = agent.agentId;

// Configure settings
await agents.updateModelConfig(agentId, {
    model: 'oblien-master',
    temperature: 0.7,
    max_tokens: 2000
});

await agents.updateTools(agentId, ['web-search', 'calculator']);

await agents.updateGuestLimits(agentId, {
    daily_tokens: 50000,
    daily_messages: 100
});

console.log('Agent configured!');
```

### Example 2: Monitor Agent Performance

```javascript
// Get overview
const overview = await agents.getOverview('agent-id', { days: 30 });

console.log('Performance:');
console.log('- Chats:', overview.total_chats);
console.log('- Messages:', overview.total_messages);
console.log('- Tokens:', overview.total_tokens);

// Get recent sessions
const sessions = await agents.getSessions('agent-id', {
    limit: 10,
    sortBy: 'time',
    sortOrder: 'desc'
});

console.log('Recent sessions:', sessions.sessions.length);
```

### Example 3: Namespace Organization

```javascript
// Create agents in different namespaces
await agents.create({
    name: 'Production Agent',
    namespace: 'production',
    prompts: { identity: 'Production assistant' }
});

await agents.create({
    name: 'Staging Agent',
    namespace: 'staging',
    prompts: { identity: 'Staging assistant' }
});

// List agents by namespace
const prodAgents = await agents.list({ namespace: 'production' });
const stagingAgents = await agents.list({ namespace: 'staging' });

console.log('Production agents:', prodAgents.agents.length);
console.log('Staging agents:', stagingAgents.agents.length);
```

### Example 4: Search and Update

```javascript
// Search for agents
const results = await agents.search('support', {
    namespace: 'production'
});

// Update each found agent
for (const agent of results.agents) {
    await agents.updateSwitches(agent.agent_id, {
        enable_memory: true,
        allow_thinking: true
    });
}

console.log(`Updated ${results.agents.length} agents`);
```

## Error Handling

```javascript
try {
    const agent = await agents.create({
        name: 'My Agent',
        prompts: { identity: 'Assistant' }
    });
} catch (error) {
    if (error.message.includes('required')) {
        console.error('Missing required fields');
    } else if (error.message.includes('401')) {
        console.error('Authentication failed');
    } else {
        console.error('Error:', error.message);
    }
}
```

## Best Practices

1. **Use Namespaces**: Organize agents by environment (production, staging, etc.)
2. **Validate Operations**: Include namespace in update/delete for safety
3. **Monitor Performance**: Regularly check analytics and usage
4. **Manage Limits**: Set appropriate guest limits per agent
5. **Use Chaining**: Use Agent instances for multiple operations on same agent

## Related Modules

- [Chat Module](./CHAT.md) - Create sessions with agents
- [Namespaces Module](./NAMESPACES.md) - Manage namespaces
- [Credits Module](./CREDITS.md) - Manage billing and credits

## Support

For issues or questions:
- Documentation: https://docs.oblien.com
- API Reference: https://api.oblien.com/docs
- Support: support@oblien.com

