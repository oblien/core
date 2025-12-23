# Namespaces Module

Complete SDK for managing namespaces, service configurations, and usage tracking in the Oblien platform.

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
import { OblienClient } from 'oblien';
import { OblienNamespaces } from 'oblien/namespaces';

// Initialize
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
});

const namespaces = new OblienNamespaces(client);

// Create a namespace
const namespace = await namespaces.create({
    name: 'Production',
    type: 'production',
    metadata: { region: 'us-east-1' },
});

// Configure services
await namespaces.configureService(namespace.id, {
    service: 'ai',
    enabled: true,
    config: { model: 'gpt-4' },
});
```

## API Reference

### OblienNamespaces

Main manager class for namespace operations.

#### Constructor

```javascript
const namespaces = new OblienNamespaces(client);
```

**Parameters:**
- `client` (OblienClient) - Authenticated Oblien client instance

---

### Namespace Operations

#### `create(options)`

Create a new namespace.

```javascript
const namespace = await namespaces.create({
    name: 'Production Environment',
    slug: 'production',              // Optional (auto-generated)
    description: 'Main workspace',
    type: 'production',              // default, production, testing, development
    isDefault: false,
    metadata: { region: 'us-east-1' },
    tags: ['production', 'critical'],
});
```

**Returns:** `Promise<NamespaceData>`

---

#### `get(identifier)`

Get namespace by ID or slug.

```javascript
const namespace = await namespaces.get('namespace-id');
// or
const namespace = await namespaces.get('production'); // slug
```

**Returns:** `Promise<NamespaceData>`

---

#### `list(options)`

List namespaces with filtering and pagination.

```javascript
const result = await namespaces.list({
    limit: 50,
    offset: 0,
    status: 'active',                // active, inactive, suspended, archived
    type: 'production',
    search: 'prod',
    sortBy: 'created_at',            // name, created_at, updated_at, last_active_at
    sortOrder: 'DESC',               // ASC, DESC
});

console.log(result.data);           // Array of namespaces
console.log(result.pagination);     // Pagination info
```

**Returns:** `Promise<{ success: boolean, data: NamespaceData[], pagination: object }>`

---

#### `update(namespaceId, updates)`

Update namespace properties.

```javascript
const updated = await namespaces.update('namespace-id', {
    name: 'New Name',
    description: 'Updated description',
    status: 'active',
    metadata: { tier: 'enterprise' },
    tags: ['updated', 'production'],
});
```

**Returns:** `Promise<NamespaceData>`

---

#### `delete(namespaceId)`

Archive (soft delete) a namespace.

```javascript
await namespaces.delete('namespace-id');
```

**Returns:** `Promise<{ success: boolean, message: string }>`

---

#### `getActivity(namespaceId, options)`

Get activity audit log for a namespace.

```javascript
const activity = await namespaces.getActivity('namespace-id', {
    limit: 50,
    offset: 0,
});
```

**Returns:** `Promise<ActivityLog[]>`

---

#### `getUsage(namespaceId, options)`

Get usage statistics and quotas.

```javascript
const usage = await namespaces.getUsage('namespace-id', {
    service: 'ai',  // Optional: filter by service
    days: 30,       // Number of days
});

console.log(usage.usage);           // Daily breakdown
console.log(usage.summary);         // Totals per service
console.log(usage.quotas);          // Quota info
console.log(usage.active_sessions); // Active sessions count
```

**Returns:** `Promise<NamespaceUsage>`

---

### Service Configuration

#### `getAvailableServices()`

Get list of all available services.

```javascript
const services = await namespaces.getAvailableServices();
// [{ service: 'ai_chat', unit_name: 'token', description: '...' }, ...]
```

**Returns:** `Promise<Service[]>`

---

#### `configureService(namespaceId, options)`

Configure a service for a namespace.

```javascript
await namespaces.configureService('namespace-id', {
    service: 'ai',
    enabled: true,
    config: {
        model: 'gpt-4',
        maxTokens: 4000,
    },
    rateLimitRequests: 1000,
    rateLimitPeriod: 'hour',         // minute, hour, day
    features: ['streaming', 'tools'],
});
```

**Returns:** `Promise<ServiceConfig>`

---

#### `listServices(namespaceId)`

List all configured services for a namespace.

```javascript
const services = await namespaces.listServices('namespace-id');
```

**Returns:** `Promise<ServiceConfig[]>`

---

#### `getServiceConfig(namespaceId, service)`

Get configuration for a specific service.

```javascript
const config = await namespaces.getServiceConfig('namespace-id', 'ai');
```

**Returns:** `Promise<ServiceConfig>`

---

#### `toggleService(namespaceId, service, enabled)`

Enable or disable a service.

```javascript
await namespaces.toggleService('namespace-id', 'ai', false); // Disable
await namespaces.toggleService('namespace-id', 'ai', true);  // Enable
```

**Returns:** `Promise<ServiceConfig>`

---

#### `enableService(namespaceId, service)`

Shortcut to enable a service.

```javascript
await namespaces.enableService('namespace-id', 'ai');
```

---

#### `disableService(namespaceId, service)`

Shortcut to disable a service.

```javascript
await namespaces.disableService('namespace-id', 'ai');
```

---

#### `deleteService(namespaceId, service)`

Remove service configuration.

```javascript
await namespaces.deleteService('namespace-id', 'ai');
```

---

#### `bulkConfigureServices(namespaceId, services)`

Configure multiple services at once.

```javascript
await namespaces.bulkConfigureServices('namespace-id', [
    {
        service: 'ai',
        enabled: true,
        config: { model: 'gpt-4' },
    },
    {
        service: 'deployment',
        enabled: true,
    },
    {
        service: 'sandbox',
        enabled: false,
    },
]);
```

**Returns:** `Promise<ServiceConfig[]>`

---

### Namespace Instance

#### `namespace(namespaceId)`

Create a Namespace instance for chaining operations.

```javascript
const namespace = namespaces.namespace('namespace-id');

// Chain operations on the same namespace
await namespace.get();
await namespace.configureService({ service: 'ai', enabled: true });
const services = await namespace.listServices();
const usage = await namespace.getUsage();
```

---

## Namespace Class

Individual namespace entity for direct operations.

```javascript
import { Namespace } from 'oblien/namespaces';

const namespace = new Namespace({
    client,
    namespaceId: 'namespace-id',
});

await namespace.get();
await namespace.update({ name: 'New Name' });
await namespace.configureService({ service: 'ai', enabled: true });
```

All methods from OblienNamespaces are available on the Namespace instance.

---

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
    OblienNamespaces, 
    Namespace,
    NamespaceData,
    CreateNamespaceOptions,
    ServiceConfig,
} from 'oblien/namespaces';

const namespaces: OblienNamespaces = new OblienNamespaces(client);
const namespace: NamespaceData = await namespaces.create({
    name: 'Production',
    type: 'production',
});
```

---

## Error Handling

All methods throw errors that can be caught:

```javascript
try {
    await namespaces.create({ name: 'Production' });
} catch (error) {
    console.error('Failed to create namespace:', error.message);
}
```

Common errors:
- `401` - Unauthorized (invalid credentials)
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (namespace doesn't exist)
- `500` - Internal Server Error

---

## Examples

See `/examples/namespaces-example.js` for complete working examples covering all operations.

---

## Integration with Chat

Namespaces can be used with chat sessions:

```javascript
import { OblienChat } from 'oblien/chat';
import { OblienNamespaces } from 'oblien/namespaces';

const chat = new OblienChat(client);
const namespaces = new OblienNamespaces(client);

// Create namespace
const namespace = await namespaces.create({ name: 'Customer A' });

// Create session in that namespace
const session = await chat.createSession({
    agentId: 'agent-id',
    namespace: namespace.slug,
});
```

---

## License

MIT

