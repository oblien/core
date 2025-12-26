# Oblien Core SDK

Complete Node.js SDK for the Oblien AI Platform. Manage agents, chat sessions, sandboxes, namespaces, and more.

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
// Import client
import { OblienClient } from 'oblien';

// Import modules (tree-shakeable)
import { OblienAgents } from 'oblien/agents';
import { OblienChat } from 'oblien/chat';
import { OblienSandboxes } from 'oblien/sandbox';
import { OblienSearch } from 'oblien/search';
import { OblienIcons } from 'oblien/icons';
import { OblienNamespaces } from 'oblien/namespaces';
import { OblienCredits } from 'oblien/credits';

// Initialize client
const client = new OblienClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});

// Use modules
const agents = new OblienAgents(client);
const chat = new OblienChat(client);
const sandboxes = new OblienSandboxes(client);
const search = new OblienSearch(client);
const icons = new OblienIcons(client);
```

---

## Modules Overview

### 🤖 Agents Module

Manage AI agents with settings, tools, and analytics.

```javascript
import { OblienAgents } from 'oblien/agents';

const agents = new OblienAgents(client);

// Create agent
const agent = await agents.create({
    name: 'Support Agent',
    namespace: 'production',
    prompts: {
        identity: 'You are a helpful assistant.'
    }
});

// Configure settings
const agentInstance = agents.agent(agent.agentId);
await agentInstance.settings.updateModelConfig({
    model: 'oblien-master',
    temperature: 0.8
});

// Assign tools
await agentInstance.settings.updateTools(['web-search', 'calculator']);

// Get analytics
const overview = await agentInstance.getOverview({ days: 7 });
```

**Features:**
- ✅ CRUD operations (create, read, update, delete)
- ✅ Settings management (5 sections: switches, model, tools, guest limits, context)
- ✅ Tools management (list, search, create, validate)
- ✅ Analytics & monitoring
- ✅ Namespace support
- ✅ User management

📖 [Full Documentation](./docs/AGENTS_COMPLETE.md) | 💡 [Examples](./examples/agents-complete-example.js)

---

### 💬 Chat Module

Create sessions, send messages, and manage guests with streaming support.

```javascript
import { OblienChat } from 'oblien/chat';

const chat = new OblienChat(client);

// Create session
const session = await chat.createSession({
    agentId: 'agent-id',
    namespace: 'production'
});

// Send message with streaming
await chat.send({
    token: session.token,
    message: 'Tell me about AI',
    stream: true,
    onChunk: (data) => console.log(data)
});

// Upload files
const uploadResult = await chat.upload({
    token: session.token,
    files: fileArray
});

// Send message with uploaded files
await chat.send({
    token: session.token,
    message: 'Analyze these files',
    uploadId: uploadResult.uploadId
});

// Create guest session
const guestSession = await chat.createGuestSession({
    ip: '192.168.1.1',
    fingerprint: 'abc123',
    agentId: 'agent-id'
});

// Get guest usage
const usage = await chat.getGuestUsage(guestSession.token);
```

**Features:**
- ✅ Session management (create, list, delete)
- ✅ Message sending with streaming support
- ✅ File uploads for agent analysis
- ✅ Guest sessions with IP + fingerprint tracking
- ✅ Guest usage monitoring and rate limiting
- ✅ Hybrid mode (works with token or client credentials)
- ✅ Cache statistics for monitoring

📖 [Full Documentation](./docs/CHAT.md) | 💡 [Examples](./examples/chat-example.js)

---

### 📦 Sandboxes Module

Manage cloud sandboxes (containerized environments).

```javascript
import { OblienSandboxes } from 'oblien/sandbox';

const sandboxes = new OblienSandboxes(client);

// Create sandbox
const sandbox = await sandboxes.create({
    name: 'my-dev-env',
    region: 'us-east-1',
    template: 'node-20',
    autoStart: true
});

// Use sandbox
const { url, token } = sandbox.sandbox;
const response = await fetch(`${url}/files/list`, {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Control lifecycle
await sandboxes.stop(sandboxId);
await sandboxes.start(sandboxId);
await sandboxes.restart(sandboxId);

// Regenerate token (1h expiry)
const newToken = await sandboxes.regenerateToken(sandboxId);

// Get metrics
const metrics = await sandboxes.getMetrics(sandboxId);
```

**Features:**
- ✅ Create, start, stop, restart, delete sandboxes
- ✅ Auto-start option
- ✅ Token management (1h JWT)
- ✅ Resource metrics
- ✅ Multiple templates & regions
- ✅ Platform statistics

📖 [Full Documentation](./docs/SANDBOXES.md) | 💡 [Examples](./examples/sandbox-example.js)

---

### 🗂️ Namespaces Module

Manage namespaces and service configurations.

```javascript
import { OblienNamespaces } from 'oblien/namespaces';

const namespaces = new OblienNamespaces(client);

// Create namespace
const namespace = await namespaces.create({
    name: 'production',
    slug: 'prod',
    type: 'production'
});

// Configure services
await namespaces.configureService(namespaceId, {
    service: 'ai',
    enabled: true,
    config: { /* ... */ }
});

// Get usage stats
const usage = await namespaces.getUsage(namespaceId);
```

**Features:**
- ✅ Namespace CRUD
- ✅ Service configuration
- ✅ Usage tracking
- ✅ Activity logs

📖 [Documentation](./docs/NAMESPACES.md)

---

### 🎨 Icons Module

Search and fetch icons, images, and videos using AI-powered semantic search.

```javascript
import { OblienIcons } from 'oblien/icons';

const icons = new OblienIcons(client);

// Search for icons
const results = await icons.search('home', { limit: 20 });

// Fetch specific icons
const icon = await icons.fetchIcon('settings gear');

// Fetch multiple icons at once
const iconSet = await icons.fetchIcons([
    'home',
    'user profile',
    'settings',
    'notification bell'
]);

// Fetch mixed media (icons, images, videos)
const media = await icons.fetch([
    { type: 'icon', description: 'user avatar' },
    { type: 'image', description: 'mountain landscape' },
    { type: 'video', description: 'product demo' }
]);
```

**Features:**
- ✅ Semantic icon search with AI embeddings
- ✅ Fetch icons, images, and videos
- ✅ Relevance scoring
- ✅ Multiple icon styles (Outline, Filled, etc.)
- ✅ Batch fetching
- ✅ Pagination support
- ✅ CDN-hosted assets

📖 [Full Documentation](./docs/ICONS.md) | 💡 [Examples](./examples/icons-example.js)

---

### 💳 Credits Module

Manage billing and credits.

```javascript
import { OblienCredits } from 'oblien/credits';

const credits = new OblienCredits(client);

// Get balance
const balance = await credits.getBalance();

// Get usage
const usage = await credits.getUsage({ period: 'monthly' });
```

**Features:**
- ✅ Balance checking
- ✅ Usage tracking
- ✅ Transaction history

---

## Complete Example

```javascript
// Import client and modules
import { OblienClient } from 'oblien';
import { OblienAgents } from 'oblien/agents';
import { OblienChat } from 'oblien/chat';
import { OblienSandboxes } from 'oblien/sandbox';

// Initialize
const client = new OblienClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});

const agents = new OblienAgents(client);
const chat = new OblienChat(client);
const sandboxes = new OblienSandboxes(client);

async function main() {
    // 1. Create agent with tools
    const agent = await agents.create({
        name: 'Code Assistant',
        namespace: 'production',
        prompts: {
            identity: 'You are a coding assistant.'
        }
    });

    // Configure agent
    const agentInstance = agents.agent(agent.agentId);
    await agentInstance.settings.updateTools(['web-search', 'calculator']);
    await agentInstance.settings.updateModelConfig({
        temperature: 0.7,
        max_tokens: 3000
    });

    // 2. Create sandbox for code execution
    const sandbox = await sandboxes.create({
        name: 'code-env',
        template: 'node-20',
        autoStart: true
    });

    // 3. Create chat session
    const session = await chat.createSession({
        agentId: agent.agentId,
        namespace: 'production'
    });

    console.log('Setup complete!');
    console.log('- Agent ID:', agent.agentId);
    console.log('- Sandbox URL:', sandbox.sandbox.url);
    console.log('- Session ID:', session.sessionId);
}

main();
```

---

## Module Structure

```
oblien/
├── src/
│   ├── agents/          # Agents management
│   │   ├── index.js     # OblienAgents class
│   │   ├── agent.js     # Agent instance
│   │   ├── settings.js  # AgentSettings class
│   │   └── tools.js     # Tools class
│   ├── chat/            # Chat sessions
│   │   ├── index.js     # OblienChat class
│   │   └── session.js   # ChatSession class
│   ├── sandbox/         # Sandboxes management
│   │   ├── index.js     # OblienSandboxes class
│   │   └── sandbox.js   # Sandbox instance
│   ├── namespaces/      # Namespaces management
│   ├── credits/         # Credits & billing
│   └── client.js        # OblienClient (base)
├── docs/                # Documentation
│   ├── AGENTS_COMPLETE.md
│   ├── SANDBOXES.md
│   ├── CHAT.md
│   └── NAMESPACES.md
└── examples/            # Usage examples
    ├── agents-complete-example.js
    ├── sandbox-example.js
    └── chat-example.js
```

---

## API Endpoints

| Module | Base Path | Operations |
|--------|-----------|------------|
| **Agents** | `/ai/agents` | CRUD, settings, tools, analytics |
| **Chat** | `/ai/session` | Create, list, history |
| **Sandboxes** | `/sandbox` | CRUD, start/stop/restart, metrics |
| **Tools** | `/ai/tools` | List, search, create |
| **Namespaces** | `/namespaces` | CRUD, services, usage |

---

## Authentication

All modules use client credentials authentication:

```javascript
const client = new OblienClient({
    clientId: 'your-client-id',        // X-Client-ID header
    clientSecret: 'your-client-secret'  // X-Client-Secret header
});
```

Get your credentials from the [Oblien Dashboard](https://dashboard.oblien.com).

---

## TypeScript Support

The SDK includes TypeScript definitions:

```typescript
import { 
    OblienClient, 
    OblienAgents, 
    Agent,
    AgentSettings,
    Tools,
    OblienSandboxes,
    Sandbox
} from 'oblien';

const client: OblienClient = new OblienClient({
    clientId: string,
    clientSecret: string
});
```

---

## Error Handling

```javascript
try {
    const agent = await agents.create({ /* ... */ });
} catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
        // Authentication failed
    } else if (error.message.includes('404')) {
        // Resource not found
    } else if (error.message.includes('429')) {
        // Rate limit exceeded
    }
}
```

---

## Best Practices

1. **Reuse Client**: Create one client instance and share across modules
2. **Error Handling**: Always wrap API calls in try-catch
3. **Token Management**: For sandboxes, refresh tokens before 1h expiry
4. **Resource Cleanup**: Stop/delete unused sandboxes and sessions
5. **Namespace Organization**: Use namespaces to separate environments
6. **Tool Validation**: Validate tools before assigning to agents

---

## Examples

### Multi-Agent System

```javascript
// Create specialized agents
const coder = await agents.create({
    name: 'Coder',
    prompts: { identity: 'Expert coder' }
});

const reviewer = await agents.create({
    name: 'Reviewer',
    prompts: { identity: 'Code reviewer' }
});

// Configure each with specific tools
await agents.agent(coder.agentId).settings.updateTools([
    'web-search', 'code-interpreter'
]);

await agents.agent(reviewer.agentId).settings.updateTools([
    'code-analyzer', 'security-scanner'
]);
```

### Guest Chat System

```javascript
// Create agent for customer support
const supportAgent = await agents.create({
    name: 'Support Bot',
    namespace: 'production'
});

// Set guest limits
await agents.agent(supportAgent.agentId).settings.updateGuestLimits({
    enabled: true,
    max_messages_per_day: 100,
    max_total_tokens_per_day: 50000
});

// Create guest session
const session = await chat.createGuestSession({
    ip: req.ip,
    fingerprint: req.headers['x-fingerprint'],
    agentId: supportAgent.agentId
});
```

---

## Links

- **Website**: https://oblien.com
- **Documentation**: https://docs.oblien.com
- **Dashboard**: https://dashboard.oblien.com
- **API Reference**: https://api.oblien.com/docs
- **Support**: support@oblien.com
- **GitHub**: https://github.com/oblien/oblien

---

## License

MIT License - see LICENSE file for details

---

## Changelog

### v1.3.0 (Latest)
- ✅ Added `send()` method to Chat module with streaming support
- ✅ Added `upload()` method for file attachments
- ✅ Added guest usage monitoring (`getGuestUsage()`)
- ✅ Added cache statistics (`getCacheStatistics()`)
- ✅ Hybrid mode support (token or client credentials)
- ✅ Complete Chat documentation with examples

### v1.2.0
- ✅ Added Sandboxes module
- ✅ Enhanced Agents module with proper settings sections
- ✅ Added Tools management
- ✅ Improved documentation

### v1.1.0
- ✅ Added Agents module
- ✅ Added Namespaces module
- ✅ Guest session support

### v1.0.0
- ✅ Initial release
- ✅ Chat module
- ✅ Credits module

---

Made with ❤️ by the Oblien Team
