# Oblien Core SDK

Server-side SDK for building AI-powered applications with Oblien platform.

## Installation

```bash
npm install oblien-core
```

## What This SDK Does

**Server-Side Only** - This SDK is for creating and managing chat sessions on your server. It **does not** handle actual messaging - that happens client-side in the browser using the tokens this SDK generates.

### Workflow:

1. **Server:** Create session using this SDK → Get token
2. **Server:** Send token to client (browser)
3. **Client:** Use token to chat directly with Oblien API
4. **Client:** Use [react-chat-agent](https://npmjs.com/package/react-chat-agent) or your own implementation

## Quick Start

### 1. Initialize Client

```javascript
import { OblienClient } from 'oblien-core';

const client = new OblienClient({
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret', // For server-side
});
```

### 2. Create Chat Session

```javascript
import { OblienChat } from 'oblien-core/chat';

const chat = new OblienChat(client);

// Create session
const session = await chat.createSession({
    agentId: 'your-agent-id',
    // workflowId: 'workflow-id', // Optional
    // workspace: {}, // Optional
});

console.log(session);
// {
//   sessionId: 'session-xxx',
//   token: 'jwt-token-for-client',
//   agentId: 'agent-id',
//   namespace: null
// }
```

### 3. Send Token to Client

```javascript
// Express example
app.post('/api/create-session', async (req, res) => {
    const session = await chat.createSession({
        agentId: req.body.agentId,
    });

    res.json({
        sessionId: session.sessionId,
        token: session.token, // Client uses this to chat
    });
});
```

### 4. Client Uses Token

```javascript
// In browser (using react-chat-agent)
import { ChatProvider } from 'react-chat-agent';

function App() {
    const [sessionToken, setSessionToken] = useState(null);

    useEffect(() => {
        // Get token from your server
        fetch('/api/create-session', {
            method: 'POST',
            body: JSON.stringify({ agentId: 'agent-id' }),
        })
        .then(r => r.json())
        .then(data => setSessionToken(data.token));
    }, []);

    if (!sessionToken) return <div>Loading...</div>;

    return (
        <ChatProvider token={sessionToken}>
            <ChatPanel />
        </ChatProvider>
    );
}
```

## Guest Sessions (Rate Limited)

For anonymous users, create guest sessions based on IP address:

```javascript
import { OblienChat } from 'oblien-core/chat';

const chat = new OblienChat(client);

// Express route
app.post('/api/guest-session', async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'];

    const session = await chat.createGuestSession({
        ip: ip,
        agentId: 'your-agent-id',
        metadata: {
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer'],
        },
    });

    res.json({
        sessionId: session.sessionId,
        token: session.token,
        guest: session.guest,
        // Guest sessions are rate-limited automatically
    });
});
```

### Guest Features:

- ✅ Automatic rate limiting (100K tokens/day, 50 messages/day)
- ✅ IP-based identification (privacy-friendly)
- ✅ Auto-expiring sessions (24h TTL)
- ✅ Built-in caching with `node-cache` (no Redis required!)
- ✅ Optional Redis support for distributed systems

## Guest Storage Options

### Default: NodeCache (Recommended)

Works out of the box - no setup needed:

```javascript
import { OblienChat } from 'oblien-core/chat';

const chat = new OblienChat(client);
// Uses NodeCacheStorage by default
// Automatic expiration, memory management, and cleanup
```

### Option 1: Custom NodeCache Settings

```javascript
import { OblienChat, NodeCacheStorage } from 'oblien-core/chat';

const storage = new NodeCacheStorage(86400); // 24 hours TTL

const chat = new OblienChat(client, {
    guestStorage: storage,
});

// Get cache stats
console.log(storage.getStats());
```

### Option 2: Redis (For Distributed Systems)

```javascript
import { createClient } from 'redis';
import { OblienChat, RedisStorage } from 'oblien-core/chat';

const redis = createClient();
await redis.connect();

const chat = new OblienChat(client, {
    guestStorage: new RedisStorage(redis),
    guestTTL: 86400, // 24 hours
});
```

### Option 3: Simple In-Memory (Dev Only)

```javascript
import { OblienChat, InMemoryStorage } from 'oblien-core/chat';

const chat = new OblienChat(client, {
    guestStorage: new InMemoryStorage(),
});
// Note: Basic Map storage, no advanced features
```

## API Reference

### `OblienClient`

Main client for authentication:

```javascript
const client = new OblienClient({
    apiKey: string,
    apiSecret?: string,
    baseURL?: string,
});
```

### `OblienChat`

Session management:

```javascript
const chat = new OblienChat(client, options?);

// Create regular session
await chat.createSession({ agentId, workflowId?, workspace? });

// Create guest session
await chat.createGuestSession({ ip, agentId, workflowId?, metadata?, workspace? });

// Get session info
await chat.getSession(sessionId);

// List sessions
await chat.listSessions({ page?, limit? });

// Delete session
await chat.deleteSession(sessionId);

// Guest management
await chat.getGuestByIP(ip);
await chat.getAllGuests(); // Admin only
await chat.cleanupGuests(); // Clean expired
```

### `GuestManager`

Manual guest management:

```javascript
import { GuestManager } from 'oblien-core/chat';

const guestManager = new GuestManager({
    storage?: StorageAdapter,
    ttl?: number, // seconds
    onGuestCreated?: (guest) => void,
});

await guestManager.getOrCreateGuest(ip, metadata?);
await guestManager.getGuest(guestId);
await guestManager.updateGuest(guestId, updates);
await guestManager.deleteGuest(guestId);
await guestManager.getAllGuests();
await guestManager.cleanup();
```

## Complete Example

### Express Server

```javascript
import express from 'express';
import { OblienClient, OblienChat } from 'oblien-core';

const app = express();
app.use(express.json());

// Initialize Oblien
const client = new OblienClient({
    apiKey: process.env.OBLIEN_API_KEY,
    apiSecret: process.env.OBLIEN_API_SECRET,
});

const chat = new OblienChat(client);

// Create authenticated session
app.post('/api/session', async (req, res) => {
    try {
        const session = await chat.createSession({
            agentId: req.body.agentId,
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create guest session
app.post('/api/guest-session', async (req, res) => {
    try {
        const ip = req.ip;
        
        const session = await chat.createGuestSession({
            ip,
            agentId: req.body.agentId,
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

### Next.js API Route

```javascript
// pages/api/session.js
import { OblienClient, OblienChat } from 'oblien-core';

const client = new OblienClient({
    apiKey: process.env.OBLIEN_API_KEY,
    apiSecret: process.env.OBLIEN_API_SECRET,
});

const chat = new OblienChat(client);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // For guests
        if (!req.headers.authorization) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            
            const session = await chat.createGuestSession({
                ip,
                agentId: req.body.agentId,
            });

            return res.json(session);
        }

        // For authenticated users
        const session = await chat.createSession({
            agentId: req.body.agentId,
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

## Environment Variables

```bash
OBLIEN_API_KEY=your-api-key
OBLIEN_API_SECRET=your-api-secret
OBLIEN_BASE_URL=https://api.oblien.com  # Optional
```

## Storage Comparison

| Feature | NodeCache (Default) | InMemory | Redis |
|---------|-------------------|----------|-------|
| **Setup** | ✅ Zero config | ✅ Zero config | ⚠️ Requires Redis |
| **Auto-expiry** | ✅ Yes | ✅ Manual | ✅ Yes |
| **Memory limit** | ✅ Configurable | ❌ No | ✅ Configurable |
| **Statistics** | ✅ Yes | ❌ No | ⚠️ Via Redis |
| **Distributed** | ❌ Single instance | ❌ Single instance | ✅ Multi-server |
| **Persistence** | ❌ Memory only | ❌ Memory only | ✅ Disk backup |
| **Production** | ✅ Recommended | ❌ Dev only | ✅ High-traffic |

### When to Use What:

- **NodeCache**: Most applications, single server, < 100K guests/day ✅ Recommended
- **InMemory**: Development, testing, quick prototypes
- **Redis**: Distributed systems, > 1M guests/day, need persistence

## Examples

Check the `/examples` folder for complete examples:

- `express-server.js` - Full Express.js implementation
- `nextjs-api-route.js` - Next.js API routes (App Router & Pages Router)
- `with-redis.js` - Production setup with Redis

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { OblienClient, OblienChat } from 'oblien-core';

const client: OblienClient = new OblienClient({
    apiKey: string,
    apiSecret?: string,
});

const chat: OblienChat = new OblienChat(client);
```

## FAQ

### Q: Do I need Redis?

**A:** No! NodeCache works great for most applications. Use Redis only if you need multi-server support or very high traffic.

### Q: How does guest rate limiting work?

**A:** Guest sessions are automatically rate-limited by the Oblien API based on the `namespace` (guest ID). Limits:
- 100K tokens/day
- 50 messages/day  
- 20 messages/hour

### Q: Can I use custom guest IDs instead of IP?

**A:** Yes! Just create your own guest ID and pass it as the `namespace`:

```javascript
await chat.createSession({
    agentId: 'agent-id',
    isGuest: true,
    namespace: 'custom-guest-id',
});
```

### Q: How do I clean up expired guests?

**A:** Call `chat.cleanupGuests()` periodically (e.g., cron job or `setInterval`).

## Performance

Benchmarks on standard server:

- Session creation: ~50ms
- Guest lookup (cached): ~1ms
- Guest cleanup (1000 guests): ~100ms

## Dependencies

- `node-cache` - Built-in caching (included)
- `redis` - Optional, for distributed systems (peer dependency)

## License

MIT

## Links

- [Documentation](https://oblien.com/docs/core-sdk)
- [GitHub](https://github.com/oblien/oblien-core)
- [Website](https://oblien.com)
- [React Chat Agent](https://npmjs.com/package/react-chat-agent) - Client-side chat component
- [Agent Sandbox](https://npmjs.com/package/agent-sandbox) - Sandbox SDK
- [AI smart assets fetch](https://npmjs.com/package/assets-ai) - Assets AI