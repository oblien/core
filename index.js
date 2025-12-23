/**
 * Oblien Core SDK
 * Server-side SDK for Oblien AI Platform
 */

import { OblienClient } from './src/client.js';
import { OblienChat, ChatSession } from './src/chat/index.js';
import { OblienNamespaces, Namespace } from './src/namespaces/index.js';
import { OblienCredits } from './src/credits/index.js';
import { 
    GuestManager, 
    NodeCacheStorage,
    InMemoryStorage,
    RedisStorage 
} from './src/utils/guest-manager.js';

// Re-export as named exports
export { OblienClient };
export { OblienChat, ChatSession };
export { OblienNamespaces, Namespace };
export { OblienCredits };
export { 
    GuestManager, 
    NodeCacheStorage,
    InMemoryStorage,
    RedisStorage 
};

// Default export
export default {
    OblienClient,
    OblienChat,
    ChatSession,
    OblienNamespaces,
    Namespace,
    OblienCredits,
    GuestManager,
    NodeCacheStorage,
    InMemoryStorage,
    RedisStorage,
};
