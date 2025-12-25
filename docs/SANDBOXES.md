# Oblien Sandboxes Module

Complete SDK support for managing cloud sandboxes (containerized environments).

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
import { OblienClient, OblienSandboxes } from 'oblien';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

// Initialize sandboxes module
const sandboxes = new OblienSandboxes(client);

// Create sandbox
const sandbox = await sandboxes.create({
    name: 'my-dev-sandbox',
    region: 'us-east-1',
    template: 'node-20',
    autoStart: true
});

console.log('Sandbox URL:', sandbox.sandbox.url);
console.log('Token:', sandbox.sandbox.token);  // 1h JWT
```

## Features

### ✅ Sandbox Management
- Create, read, update, delete sandboxes
- Auto-start option (default: true)
- Region and template selection

### ✅ Lifecycle Control
- Start/stop/restart sandboxes
- Status monitoring
- Container management

### ✅ Token Management
- Auto-generated 1h JWT tokens
- Token regeneration
- Secure authentication

### ✅ Monitoring
- Sandbox metrics (CPU, memory, disk, network)
- Platform statistics
- Activity logs

---

## API Reference

### OblienSandboxes

Main class for sandbox operations.

#### Constructor

```javascript
const sandboxes = new OblienSandboxes(client);
```

---

### Sandbox Creation & Management

#### `create(options)`

Create a new sandbox.

```javascript
const sandbox = await sandboxes.create({
    name: 'my-sandbox',                // Optional
    region: 'us-east-1',               // Optional (default: 'us-east-1')
    template: 'node-20',               // Optional (default: 'node-20')
    config: {                          // Optional custom config
        memory: '2GB',
        cpu: '2'
    },
    autoStart: true                    // Optional (default: true)
});
```

**Parameters:**
- `name` (string, optional): Sandbox name
- `region` (string, optional): Region - 'us-east-1' | 'us-west-1' | 'eu-west-1'
- `template` (string, optional): Template - 'node-20' | 'python-3' | 'blank' | custom
- `config` (object, optional): Custom configuration
- `autoStart` (boolean, optional): Auto-start after creation (default: true)

**Returns:**
```javascript
{
    success: true,
    sandbox: {
        sandbox_id: 'sb-abc123',
        name: 'my-sandbox',
        url: 'https://sb-abc123.oblien.app',
        token: 'eyJ...',  // 1h JWT token
        region: 'us-east-1',
        template: 'node-20',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
    }
}
```

**Important:** The token expires after 1 hour. Use `regenerateToken()` to get a new one.

---

#### `list(options)`

List all sandboxes with pagination and filtering.

```javascript
const result = await sandboxes.list({
    page: 1,
    limit: 20,
    status: 'active'
});
```

**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)
- `status` (string, optional): Filter by status - 'active' | 'stopped' | 'suspended' | 'deleted'

**Returns:**
```javascript
{
    success: true,
    sandboxes: [...],
    pagination: {
        currentPage: 1,
        totalPages: 5,
        total: 100,
        limit: 20
    }
}
```

---

#### `get(sandboxId)`

Get sandbox details.

```javascript
const sandbox = await sandboxes.get('sb-abc123');
```

**Returns:** Sandbox object with full details

---

#### `update(sandboxId, updates)`

Update sandbox properties.

```javascript
await sandboxes.update('sb-abc123', {
    name: 'Updated Name',
    config: {
        memory: '4GB',
        cpu: '4'
    }
});
```

**Parameters:**
- `sandboxId` (string, required): Sandbox ID
- `updates` (object, required): Fields to update
  - `name` (string, optional): New name
  - `region` (string, optional): New region
  - `config` (object, optional): New config

---

#### `delete(sandboxId)`

Delete a sandbox.

```javascript
await sandboxes.delete('sb-abc123');
```

**Note:** This permanently deletes the sandbox and all its data.

---

### Lifecycle Control

#### `start(sandboxId)`

Start a stopped sandbox.

```javascript
const result = await sandboxes.start('sb-abc123');
console.log('New token:', result.sandbox.token);
```

**Returns:** Sandbox object with new 1h token

---

#### `stop(sandboxId)`

Stop a running sandbox.

```javascript
await sandboxes.stop('sb-abc123');
```

**Note:** Stops the container but preserves data. Use `start()` to resume.

---

#### `restart(sandboxId)`

Restart a sandbox (stop + start).

```javascript
const result = await sandboxes.restart('sb-abc123');
console.log('New token:', result.sandbox.token);
```

**Returns:** Sandbox object with new 1h token

---

### Token Management

#### `regenerateToken(sandboxId)`

Generate a new 1h JWT token.

```javascript
const result = await sandboxes.regenerateToken('sb-abc123');
console.log('New token:', result.sandbox.token);
```

**Use case:** When your token expires (after 1 hour), regenerate it to continue using the sandbox.

**Returns:** Sandbox object with new token

---

### Monitoring

#### `getMetrics(sandboxId)`

Get sandbox resource metrics.

```javascript
const metrics = await sandboxes.getMetrics('sb-abc123');
console.log('CPU:', metrics.cpu);
console.log('Memory:', metrics.memory);
console.log('Disk:', metrics.disk);
```

**Returns:**
```javascript
{
    success: true,
    metrics: {
        cpu: { usage: '45%', cores: 2 },
        memory: { used: '1.2GB', total: '2GB' },
        disk: { used: '5GB', total: '20GB' },
        network: { in: '100MB', out: '50MB' }
    }
}
```

---

#### `getStats()`

Get platform-wide sandbox statistics.

```javascript
const stats = await sandboxes.getStats();
console.log('Total sandboxes:', stats.total);
console.log('Active sandboxes:', stats.active);
```

**Returns:**
```javascript
{
    success: true,
    total: 150,
    active: 45,
    stopped: 100,
    suspended: 5
}
```

---

#### `getActivity()`

Get sandbox activity logs.

```javascript
const activity = await sandboxes.getActivity();
activity.activities.forEach(log => {
    console.log(`${log.action} at ${log.timestamp}`);
});
```

---

### Sandbox Instance (Chaining)

Create a Sandbox instance for chaining operations:

```javascript
const sandbox = sandboxes.sandbox('sb-abc123');

// Chain operations
await sandbox.get();
await sandbox.stop();
await sandbox.start();
const metrics = await sandbox.getMetrics();
const token = await sandbox.regenerateToken();
```

---

## Usage Examples

### Example 1: Create and Use Sandbox

```javascript
// Create sandbox
const result = await sandboxes.create({
    name: 'my-dev-env',
    region: 'us-east-1',
    template: 'node-20',
    autoStart: true
});

const { sandbox_id, url, token } = result.sandbox;

// Use sandbox API
const response = await fetch(`${url}/files/list`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ dirPath: '/opt/app' })
});

const files = await response.json();
console.log('Files:', files);
```

### Example 2: Manual Start Control

```javascript
// Create without auto-start
const result = await sandboxes.create({
    name: 'staging-env',
    autoStart: false  // Don't start yet
});

const sandboxId = result.sandbox.sandbox_id;

// Do some configuration...

// Start when ready
const startResult = await sandboxes.start(sandboxId);
console.log('Started with token:', startResult.sandbox.token);
```

### Example 3: Lifecycle Management

```javascript
const sandboxId = 'sb-abc123';

// Stop for maintenance
await sandboxes.stop(sandboxId);
console.log('✓ Stopped');

// Update configuration
await sandboxes.update(sandboxId, {
    config: { memory: '4GB' }
});

// Restart with new config
const result = await sandboxes.restart(sandboxId);
console.log('✓ Restarted with token:', result.sandbox.token);
```

### Example 4: Token Refresh Pattern

```javascript
let sandbox = await sandboxes.create({
    name: 'long-running-task',
    autoStart: true
});

let token = sandbox.sandbox.token;
let url = sandbox.sandbox.url;

// Set up token refresh (before 1h expiry)
setInterval(async () => {
    const result = await sandboxes.regenerateToken(sandbox.sandbox.sandbox_id);
    token = result.sandbox.token;
    console.log('✓ Token refreshed');
}, 50 * 60 * 1000);  // Refresh every 50 minutes

// Use token for operations
async function useSandbox() {
    const response = await fetch(`${url}/api/execute`, {
        headers: { 'Authorization': `Bearer ${token}` },
        // ...
    });
}
```

### Example 5: Monitoring and Cleanup

```javascript
// Create multiple sandboxes
const sandboxIds = [];
for (let i = 0; i < 3; i++) {
    const result = await sandboxes.create({
        name: `worker-${i}`,
        autoStart: true
    });
    sandboxIds.push(result.sandbox.sandbox_id);
}

// Monitor them
for (const id of sandboxIds) {
    const metrics = await sandboxes.getMetrics(id);
    console.log(`${id} - CPU: ${metrics.cpu.usage}`);
}

// Cleanup when done
for (const id of sandboxIds) {
    await sandboxes.stop(id);
    await sandboxes.delete(id);
}
```

### Example 6: List and Filter

```javascript
// Get all active sandboxes
const active = await sandboxes.list({
    status: 'active',
    limit: 50
});

console.log(`Active sandboxes: ${active.sandboxes.length}`);

// Get stopped sandboxes
const stopped = await sandboxes.list({
    status: 'stopped',
    page: 1,
    limit: 20
});

console.log(`Stopped sandboxes: ${stopped.sandboxes.length}`);
```

---

## Available Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| `node-20` | Node.js 20 environment | JavaScript/TypeScript apps |
| `python-3` | Python 3 environment | Python apps |
| `blank` | Minimal environment | Custom setups |
| `custom` | Custom template | Contact support |

## Available Regions

| Region | Location | Code |
|--------|----------|------|
| US East | Virginia | `us-east-1` |
| US West | California | `us-west-1` |
| EU West | Ireland | `eu-west-1` |

---

## Token Details

### Token Lifecycle

- **Creation:** Token is generated when sandbox is created (if autoStart: true) or started
- **Expiry:** 1 hour from generation
- **Storage:** Not stored in database (generated on-the-fly)
- **Refresh:** Use `regenerateToken()` to get a new token
- **Format:** JWT with sandbox permissions

### Token Usage

```javascript
// Token is used for all sandbox API calls
const response = await fetch(`${sandboxUrl}/api/endpoint`, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ /* data */ })
});
```

---

## Error Handling

```javascript
try {
    const sandbox = await sandboxes.create({
        name: 'test-sandbox'
    });
} catch (error) {
    if (error.message.includes('NOT_FOUND')) {
        console.error('Sandbox not found');
    } else if (error.message.includes('creation_failed')) {
        console.error('Failed to create sandbox');
    } else {
        console.error('Error:', error.message);
    }
}
```

## Best Practices

1. **Token Management**: Refresh tokens before they expire (< 1h)
2. **Resource Cleanup**: Stop or delete unused sandboxes
3. **Error Handling**: Always handle creation/start failures
4. **Monitoring**: Check metrics regularly for resource-intensive operations
5. **Naming**: Use descriptive names for easy identification

## Type Definitions

```typescript
interface SandboxOptions {
    name?: string;
    region?: 'us-east-1' | 'us-west-1' | 'eu-west-1';
    template?: 'node-20' | 'python-3' | 'blank' | string;
    config?: object;
    autoStart?: boolean;
}

interface SandboxData {
    sandbox_id: string;
    name: string;
    url: string;
    token?: string;  // Only present when started
    region: string;
    template: string;
    status: 'active' | 'stopped' | 'suspended' | 'deleted';
    created_at: string;
    updated_at: string;
}

interface ListOptions {
    page?: number;
    limit?: number;
    status?: 'active' | 'stopped' | 'suspended' | 'deleted';
}
```

---

## Related Modules

- [Agents Module](./AGENTS_COMPLETE.md) - AI agents management
- [Chat Module](./CHAT.md) - Chat sessions
- [Namespaces Module](./NAMESPACES.md) - Workspace management

## Support

- **Documentation**: https://docs.oblien.com/sandboxes
- **API Reference**: https://api.oblien.com/docs/sandbox
- **Examples**: `/examples/sandbox-example.js`
- **Support**: support@oblien.com

