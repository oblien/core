# Chat Module Documentation

Complete guide for managing chat sessions, sending messages, and handling guests with the Oblien Chat SDK.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Session Management](#session-management)
- [Sending Messages](#sending-messages)
- [File Uploads](#file-uploads)
- [Guest Sessions](#guest-sessions)
- [Guest Monitoring](#guest-monitoring)
- [Hybrid Mode](#hybrid-mode)
- [Complete Examples](#complete-examples)
- [API Reference](#api-reference)

---

## Overview

The Chat module provides a complete solution for managing chat sessions with support for:

- ✅ **Session Management** - Create and manage chat sessions
- ✅ **Message Sending** - Send messages with streaming support
- ✅ **File Uploads** - Upload files for agent analysis
- ✅ **Guest Sessions** - Handle anonymous users with IP + fingerprint tracking
- ✅ **Rate Limiting** - Built-in guest rate limiting
- ✅ **Monitoring** - Track guest usage and cache statistics
- ✅ **Hybrid Mode** - Works server-side (client credentials) or client-side (session tokens)

---

## Installation

```bash
npm install oblien
```

---

## Quick Start

```javascript
import { OblienClient } from 'oblien';
import { OblienChat } from 'oblien/chat';

// Initialize client
const client = new OblienClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
});

const chat = new OblienChat(client);

// Create session
const session = await chat.createSession({
    agentId: 'agent-123',
    namespace: 'production'
});

// Send message
await chat.send({
    token: session.token,
    message: 'Hello, how can you help?'
});
```

---

## Session Management

### Create Session

Create a chat session for authenticated users:

```javascript
const session = await chat.createSession({
    agentId: 'agent-123',           // Required: Agent ID to chat with
    workflowId: 'workflow-456',     // Optional: Workflow ID
    namespace: 'production',        // Optional: Namespace
    endUserId: 'user-789',          // Optional: Your end user's ID
    workspace: {                     // Optional: Workspace config
        files: [],
        settings: {}
    }
});

console.log(session);
// {
//   success: true,
//   sessionId: "session-abc123",
//   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   agentId: "agent-123",
//   namespace: "production",
//   createdAt: "2024-01-15T10:30:00Z"
// }
```

### Get Session Info

```javascript
const session = await chat.getSession('session-123');
```

### List Sessions

```javascript
const sessions = await chat.listSessions({
    limit: 20,
    offset: 0,
    agentId: 'agent-123'  // Optional filter
});
```

### Delete Session

```javascript
await chat.deleteSession('session-123');
```

---

## Sending Messages

The `send()` method supports both regular and streaming responses.

### Basic Message

```javascript
const response = await chat.send({
    token: sessionToken,
    message: 'What is machine learning?'
});

console.log(response);
// {
//   success: true,
//   message: "Machine learning is...",
//   tokens: 150,
//   model: "oblien-master"
// }
```

### Streaming Messages

Real-time streaming for better UX:

```javascript
await chat.send({
    token: sessionToken,
    message: 'Tell me a story',
    stream: true,
    onChunk: (data) => {
        console.log('Chunk:', data);
        // Process streaming chunk
        if (data.content) {
            process.stdout.write(data.content);
        }
    },
    onComplete: () => {
        console.log('\nStream complete!');
    },
    onError: (error) => {
        console.error('Stream error:', error);
    }
});
```

### Server-Side Messages (No Token)

When running server-side, you can omit the token to use client credentials:

```javascript
// Server-side: No token needed
await chat.send({
    message: 'Hello from server',
    metadata: {
        userId: 'user-123',
        source: 'api'
    }
});
```

---

## File Uploads

Upload files before sending messages for agent analysis.

### Upload Files (Client-Side)

```javascript
// Browser: Upload from input
const fileInput = document.querySelector('input[type="file"]');
const files = Array.from(fileInput.files);

const uploadResult = await chat.upload({
    token: sessionToken,
    files: files,
    metadata: {
        category: 'documents',
        purpose: 'analysis'
    }
});

console.log(uploadResult);
// {
//   success: true,
//   uploadId: "upload-abc123",
//   files: [
//     { name: "document.pdf", size: 245678, type: "application/pdf" }
//   ]
// }

// Use uploadId in message
await chat.send({
    token: sessionToken,
    message: 'Please analyze these documents',
    uploadId: uploadResult.uploadId
});
```

### Upload Files (Node.js)

```javascript
import fs from 'fs';

// Node.js: Upload from filesystem
const files = [
    {
        buffer: fs.readFileSync('./document.pdf'),
        originalname: 'document.pdf',
        path: './document.pdf'
    }
];

const uploadResult = await chat.upload({
    token: sessionToken,
    files: files
});
```

### Server-Side Upload (No Token)

```javascript
// Server-side: No token needed
await chat.upload({
    files: files,
    metadata: {
        source: 'api-upload'
    }
});
```

---

## Guest Sessions

Handle anonymous users with dual-layer identification (IP + fingerprint).

### Create Guest Session

```javascript
// Express.js example
app.post('/api/chat/guest-session', async (req, res) => {
    const guestSession = await chat.createGuestSession({
        ip: req.ip,                              // Required: Client IP
        fingerprint: req.body.fingerprint,       // Optional: Browser fingerprint
        agentId: 'agent-123',                    // Required: Agent ID
        workflowId: 'workflow-456',              // Optional: Workflow ID
        metadata: {                               // Optional: Additional data
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer']
        }
    });

    res.json(guestSession);
    // {
    //   success: true,
    //   sessionId: "session-guest-abc",
    //   token: "eyJhbGciOiJIUzI1NiIs...",
    //   agentId: "agent-123",
    //   guest: {
    //     id: "guest-def456",
    //     namespace: "guest-192-168-1-1",
    //     createdAt: "2024-01-15T10:30:00Z"
    //   }
    // }
});
```

### Get Guest Info

Retrieve guest by IP and/or fingerprint:

```javascript
const guest = await chat.getGuest('192.168.1.1', 'fingerprint-abc123');

console.log(guest);
// {
//   id: "guest-def456",
//   namespace: "guest-192-168-1-1",
//   ip: "192.168.1.1",
//   fingerprint: "fingerprint-abc123",
//   isGuest: true,
//   createdAt: "2024-01-15T10:00:00Z",
//   lastSeen: "2024-01-15T10:30:00Z",
//   sessions: ["session-1", "session-2"],
//   metadata: {}
// }
```

---

## Guest Monitoring

### Get Guest Usage

Allow guests to check their own usage limits:

```javascript
// Client-side: Guest checking their usage
const usage = await chat.getGuestUsage(guestToken);

console.log(usage);
// {
//   success: true,
//   namespace: "guest-192-168-1-1",
//   requestCount: 45,
//   limit: 100,
//   remaining: 55,
//   resetAt: "2024-01-15T24:00:00Z"
// }

// Show to user
if (usage.remaining < 10) {
    alert(`Only ${usage.remaining} requests remaining today!`);
}
```

### Get All Guests (Admin)

Server-side monitoring of all guests:

```javascript
// Server-side: Get all active guests
const guests = await chat.getAllGuests();

console.log(guests);
// [
//   { id: "guest-1", ip: "192.168.1.1", sessions: [...] },
//   { id: "guest-2", ip: "192.168.1.2", sessions: [...] }
// ]
```

### Get Cache Statistics (Admin)

Monitor cache performance:

```javascript
// Server-side: Cache statistics
const stats = await chat.getCacheStatistics();

console.log(stats);
// {
//   success: true,
//   cache: {
//     keys: 1234,
//     hits: 5678,
//     misses: 234,
//     hitRate: 0.96,
//     keysSize: 45678,
//     valuesSize: 234567
//   }
// }
```

### Cleanup Expired Guests

```javascript
// Server-side: Cleanup expired guests
const cleanedCount = await chat.cleanupGuests();
console.log(`Cleaned up ${cleanedCount} expired guests`);
```

---

## Hybrid Mode

The Chat module works in **hybrid mode** - it automatically adapts to server-side or client-side usage.

### Client-Side (with Token)

Use session tokens for client-side applications:

```javascript
// Browser/Client-side
const sessionToken = localStorage.getItem('session-token');

await chat.send({
    token: sessionToken,  // Session token from createSession
    message: 'Hello!'
});

await chat.upload({
    token: sessionToken,
    files: files
});
```

### Server-Side (with Client Credentials)

Omit the token for server-side operations:

```javascript
// Node.js/Server-side
await chat.send({
    message: 'Hello from server'  // Uses client credentials automatically
});

await chat.upload({
    files: files  // Uses client credentials automatically
});
```

---

## Complete Examples

### Full-Stack Chat Application

**Backend (Express.js):**

```javascript
import express from 'express';
import { OblienClient } from 'oblien';
import { OblienChat } from 'oblien/chat';

const app = express();
const client = new OblienClient({
    clientId: process.env.OBLIEN_CLIENT_ID,
    clientSecret: process.env.OBLIEN_CLIENT_SECRET
});

const chat = new OblienChat(client);

// Create guest session endpoint
app.post('/api/chat/session', async (req, res) => {
    try {
        const session = await chat.createGuestSession({
            ip: req.ip,
            fingerprint: req.body.fingerprint,
            agentId: 'agent-123'
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check guest usage
app.get('/api/chat/usage', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const usage = await chat.getGuestUsage(token);
        res.json(usage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

**Frontend (React):**

```javascript
import { OblienClient } from 'oblien';
import { OblienChat } from 'oblien/chat';

// Initialize for client-side
const client = new OblienClient({
    clientId: 'public-client-id',  // Public client for frontend
    clientSecret: 'public-secret'
});

const chat = new OblienChat(client);

function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [sessionToken, setSessionToken] = useState(null);

    // Initialize session
    useEffect(() => {
        async function initSession() {
            const response = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fingerprint: await generateFingerprint()
                })
            });
            const session = await response.json();
            setSessionToken(session.token);
        }
        initSession();
    }, []);

    // Send message
    async function sendMessage(message) {
        const response = await chat.send({
            token: sessionToken,
            message: message,
            stream: true,
            onChunk: (data) => {
                // Update UI with streaming content
                setMessages(prev => [...prev, data]);
            }
        });
    }

    // Upload files
    async function uploadFiles(files) {
        const result = await chat.upload({
            token: sessionToken,
            files: files
        });

        await sendMessage(`Please analyze uploadId: ${result.uploadId}`);
    }

    return (
        <div>
            {/* Chat UI */}
        </div>
    );
}
```

### Rate Limiting with Guests

```javascript
// Check usage before allowing message
async function sendMessageWithCheck(token, message) {
    try {
        // Check guest usage first
        const usage = await chat.getGuestUsage(token);
        
        if (usage.remaining <= 0) {
            throw new Error(`Rate limit exceeded. Resets at ${usage.resetAt}`);
        }

        // Send message if under limit
        await chat.send({
            token: token,
            message: message
        });

        console.log(`${usage.remaining - 1} requests remaining`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

## API Reference

### `OblienChat`

Main class for chat operations.

#### Constructor

```javascript
new OblienChat(client, options?)
```

**Parameters:**
- `client` (OblienClient) - Required: Oblien client instance
- `options` (Object) - Optional: Configuration options
  - `guestManager` (GuestManager) - Custom guest manager
  - `guestStorage` (StorageAdapter) - Storage adapter for guests
  - `guestTTL` (number) - Guest session TTL in seconds

---

### Methods

#### `createSession(options)`

Create a chat session for authenticated users.

**Parameters:**
- `options.agentId` (string) - Required: Agent ID
- `options.workflowId` (string) - Optional: Workflow ID
- `options.workspace` (Object) - Optional: Workspace config
- `options.endUserId` (string) - Optional: End user ID
- `options.namespace` (string) - Optional: Namespace

**Returns:** `Promise<SessionData>`

---

#### `createGuestSession(options)`

Create a guest session with IP + fingerprint tracking.

**Parameters:**
- `options.ip` (string) - Required: Client IP address
- `options.fingerprint` (string) - Optional: Browser fingerprint
- `options.agentId` (string) - Required: Agent ID
- `options.workflowId` (string) - Optional: Workflow ID
- `options.metadata` (Object) - Optional: Additional metadata
- `options.workspace` (Object) - Optional: Workspace config
- `options.endUserId` (string) - Optional: End user ID

**Returns:** `Promise<GuestSessionData>`

---

#### `send(options)`

Send a message in a chat session.

**Parameters:**
- `options.token` (string) - Optional: Session token (omit for server-side)
- `options.message` (string) - Required: Message to send
- `options.uploadId` (string) - Optional: Upload ID for attached files
- `options.files` (Array) - Optional: File attachments
- `options.stream` (boolean) - Optional: Enable streaming
- `options.onChunk` (Function) - Optional: Callback for chunks
- `options.onError` (Function) - Optional: Error callback
- `options.onComplete` (Function) - Optional: Completion callback
- `options.metadata` (Object) - Optional: Additional metadata

**Returns:** `Promise<Object>`

---

#### `upload(options)`

Upload files for chat session.

**Parameters:**
- `options.token` (string) - Optional: Session token (omit for server-side)
- `options.files` (Array|File) - Required: Files to upload
- `options.metadata` (Object) - Optional: Upload metadata

**Returns:** `Promise<{ success: boolean, uploadId: string, files: Array }>`

---

#### `getGuest(ip, fingerprint?)`

Get guest by IP and/or fingerprint.

**Parameters:**
- `ip` (string) - Required: IP address
- `fingerprint` (string) - Optional: Fingerprint

**Returns:** `Promise<Guest|null>`

---

#### `getGuestUsage(token)`

Get usage information for a guest (requires session token).

**Parameters:**
- `token` (string) - Required: Guest session token

**Returns:** `Promise<GuestUsageInfo>`

---

#### `getCacheStatistics()`

Get cache statistics for monitoring (admin/server-side).

**Returns:** `Promise<CacheStatistics>`

---

#### `getSession(sessionId)`

Get session information.

**Parameters:**
- `sessionId` (string) - Required: Session ID

**Returns:** `Promise<Object>`

---

#### `listSessions(options?)`

List all sessions.

**Parameters:**
- `options` (Object) - Optional: Query options

**Returns:** `Promise<Array>`

---

#### `deleteSession(sessionId)`

Delete a session.

**Parameters:**
- `sessionId` (string) - Required: Session ID

**Returns:** `Promise<Object>`

---

#### `getAllGuests()`

Get all active guests (admin/monitoring).

**Returns:** `Promise<Guest[]>`

---

#### `cleanupGuests()`

Clean up expired guests.

**Returns:** `Promise<number>` - Number of cleaned guests

---

## TypeScript Types

```typescript
interface SendMessageOptions {
    token?: string;
    message: string;
    uploadId?: string;
    files?: any[];
    stream?: boolean;
    onChunk?: (data: any) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    metadata?: Record<string, any>;
}

interface UploadOptions {
    token?: string;
    files: any[] | any;
    metadata?: Record<string, any>;
}

interface SessionData {
    success: boolean;
    sessionId: string;
    token: string;
    agentId: string;
    namespace?: string;
    createdAt: string;
}

interface GuestSessionData extends SessionData {
    guest: {
        id: string;
        namespace: string;
        createdAt: string;
    };
}

interface GuestUsageInfo {
    success: boolean;
    namespace: string;
    requestCount: number;
    limit: number;
    remaining: number;
    resetAt?: Date;
}

interface CacheStatistics {
    success: boolean;
    cache: {
        keys: number;
        hits: number;
        misses: number;
        hitRate: number;
        keysSize: number;
        valuesSize: number;
    };
}
```

---

## Best Practices

1. **Token Security**: Never expose session tokens in URLs or logs
2. **Guest Tracking**: Use both IP and fingerprint for reliable guest identification
3. **Rate Limiting**: Check guest usage before allowing operations
4. **Cleanup**: Run `cleanupGuests()` periodically (e.g., daily cron job)
5. **Error Handling**: Always handle rate limit errors gracefully
6. **Streaming**: Use streaming for better UX with long responses
7. **File Size**: Validate file sizes before uploading
8. **Hybrid Mode**: Use tokens client-side, credentials server-side

---

## Links

- [Main Documentation](../README.md)
- [Agents Module](./AGENTS_COMPLETE.md)
- [Sandboxes Module](./SANDBOXES.md)
- [API Reference](https://api.oblien.com/docs)

---

Made with ❤️ by the Oblien Team

