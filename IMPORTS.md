# Oblien SDK Import Guide

All Oblien modules support tree-shakeable subpath imports for optimal bundle size.

## Available Import Patterns

### 1. Client (Core)
```javascript
import { OblienClient } from 'oblien';
```

### 2. Agents Module
```javascript
import { OblienAgents, Agent, AgentSettings, Tools } from 'oblien/agents';
```

### 3. Chat Module
```javascript
import { OblienChat, ChatSession, RedisStorage, NodeCacheStorage } from 'oblien/chat';
```

### 4. Sandbox Module
```javascript
import { OblienSandboxes, Sandbox } from 'oblien/sandbox';
```

### 5. Search Module
```javascript
import { OblienSearch } from 'oblien/search';
```

### 6. Icons Module
```javascript
import { OblienIcons } from 'oblien/icons';
```

### 7. Namespaces Module
```javascript
import { OblienNamespaces, Namespace } from 'oblien/namespaces';
```

### 8. Credits Module
```javascript
import { OblienCredits } from 'oblien/credits';
```

## Benefits of Subpath Imports

1. **Tree-shaking**: Only import what you need
2. **Smaller bundles**: Reduce final bundle size
3. **Clearer dependencies**: Explicit about which features you use
4. **Better organization**: Each module is self-contained

## Example: Full Setup

```javascript
// Import only what you need
import { OblienClient } from 'oblien';
import { OblienAgents } from 'oblien/agents';
import { OblienChat } from 'oblien/chat';
import { OblienIcons } from 'oblien/icons';

const client = new OblienClient({
    apiKey: 'your-key',
    apiSecret: 'your-secret'
});

const agents = new OblienAgents(client);
const chat = new OblienChat(client);
const icons = new OblienIcons(client);
```

## Legacy Support

You can still import everything from the main entry point:

```javascript
import { 
    OblienClient,
    OblienAgents,
    OblienChat,
    OblienSandboxes,
    OblienSearch,
    OblienIcons,
    OblienNamespaces,
    OblienCredits
} from 'oblien';
```

However, this may result in larger bundle sizes as all modules are included.

## Package.json Exports

The package exports are configured as follows:

```json
{
  "exports": {
    ".": "./index.js",
    "./chat": "./chat.js",
    "./namespaces": "./namespaces.js",
    "./credits": "./credits.js",
    "./agents": "./agents.js",
    "./sandbox": "./sandbox.js",
    "./search": "./search.js",
    "./icons": "./icons.js"
  }
}
```

This ensures that each module can be imported independently with optimal tree-shaking support.

