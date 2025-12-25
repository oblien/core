# Oblien Icons Module

The Icons module provides semantic search and fetching capabilities for icons, images, and videos using AI-powered embeddings.

## Installation

```bash
npm install oblien
```

## Import

```javascript
import { OblienClient } from 'oblien';
import { OblienIcons } from 'oblien/icons';
```

## Quick Start

```javascript
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const icons = new OblienIcons(client);

// Search for icons
const results = await icons.search('home', { limit: 20 });

// Fetch a single icon
const icon = await icons.fetchIcon('settings gear');

// Fetch multiple icons
const iconSet = await icons.fetchIcons(['home', 'user', 'settings']);
```

---

## API Reference

### `new OblienIcons(client)`

Creates a new Icons module instance.

**Parameters:**
- `client` (OblienClient) - Authenticated Oblien client

**Example:**
```javascript
const icons = new OblienIcons(client);
```

---

### `search(query, options)`

Search for icons using semantic search with AI embeddings.

**Parameters:**
- `query` (string) - Search query (required)
- `options` (object) - Search options
  - `offset` (number) - Pagination offset (default: 0)
  - `limit` (number) - Number of results (default: 100)

**Returns:** `Promise<Object>`
```javascript
{
  results: [
    {
      url: 'https://cdn.oblien.com/static/png-icons/...',
      filename: 'home-outline.png',
      name: 'home',
      description: 'home',
      style: 'Outline',
      score: 0.95,
      success: true
    }
  ],
  hasMore: true,
  offset: 50,
  total: 245
}
```

**Example:**
```javascript
const results = await icons.search('home', {
    offset: 0,
    limit: 50
});

console.log(`Found ${results.total} icons`);
console.log(`Showing ${results.results.length} icons`);

results.results.forEach(icon => {
    console.log(`${icon.name}: ${icon.url}`);
});
```

---

### `searchAll(query, options)`

Search and automatically fetch all matching icons with pagination handling.

**Parameters:**
- `query` (string) - Search query (required)
- `options` (object) - Search options
  - `maxResults` (number) - Maximum results to fetch (default: 500)
  - `batchSize` (number) - Results per batch (default: 100)

**Returns:** `Promise<Array>` - Array of all matching icons

**Example:**
```javascript
const allIcons = await icons.searchAll('user', {
    maxResults: 200,
    batchSize: 50
});

console.log(`Fetched ${allIcons.length} icons`);
```

---

### `fetch(items)`

Fetch multiple items (icons, images, videos) with semantic matching.

**Parameters:**
- `items` (Array<Object>) - Array of items to fetch
  - `type` (string) - 'icon', 'image', or 'video' (required)
  - `description` (string) - Description for semantic matching (required)
  - `is_vector` (boolean) - Whether the item is a vector (optional)
  - `variant` (string) - Variant type for images/videos (optional)

**Returns:** `Promise<Array>` - Array of fetched items with URLs

**Example:**
```javascript
const items = await icons.fetch([
    { type: 'icon', description: 'user profile' },
    { type: 'icon', description: 'settings gear' },
    { type: 'image', description: 'mountain landscape' },
    { type: 'video', description: 'ocean waves' }
]);

items.forEach(item => {
    console.log(`${item.description}: ${item.url}`);
});
```

---

### `fetchIcon(description)`

Convenience method to fetch a single icon.

**Parameters:**
- `description` (string) - Icon description (required)

**Returns:** `Promise<Object|null>` - Icon object or null

**Example:**
```javascript
const icon = await icons.fetchIcon('home');

if (icon) {
    console.log(`URL: ${icon.url}`);
    console.log(`Style: ${icon.style}`);
}
```

---

### `fetchIcons(descriptions)`

Convenience method to fetch multiple icons at once.

**Parameters:**
- `descriptions` (Array<string>) - Array of icon descriptions (required)

**Returns:** `Promise<Array>` - Array of icon objects

**Example:**
```javascript
const iconSet = await icons.fetchIcons([
    'home',
    'user profile',
    'settings',
    'notification bell'
]);

iconSet.forEach((icon, i) => {
    console.log(`Icon ${i + 1}: ${icon.url}`);
});
```

---

## Usage Patterns

### Pattern 1: Basic Icon Search

```javascript
const results = await icons.search('settings', { limit: 10 });

results.results.forEach(icon => {
    console.log(`${icon.name} (${icon.style})`);
    console.log(`Score: ${icon.score}`);
    console.log(`URL: ${icon.url}\n`);
});
```

### Pattern 2: Paginated Search

```javascript
let offset = 0;
const limit = 20;
let hasMore = true;

while (hasMore) {
    const results = await icons.search('user', { offset, limit });
    
    // Process results
    console.log(`Page ${offset / limit + 1}: ${results.results.length} icons`);
    
    // Update pagination
    hasMore = results.hasMore;
    offset = results.offset;
}
```

### Pattern 3: Build Complete Icon Set

```javascript
const uiIcons = {
    navigation: ['home', 'back', 'forward', 'menu'],
    actions: ['add', 'edit', 'delete', 'save'],
    social: ['like', 'share', 'comment', 'bookmark']
};

const iconSet = {};

for (const [category, descriptions] of Object.entries(uiIcons)) {
    const icons = await icons.fetchIcons(descriptions);
    iconSet[category] = descriptions.reduce((acc, desc, i) => {
        acc[desc] = icons[i];
        return acc;
    }, {});
}

// Use iconSet in your application
```

### Pattern 4: Filter by Relevance Score

```javascript
const results = await icons.search('shopping cart', { limit: 50 });

const highQualityMatches = results.results.filter(icon => icon.score >= 0.85);

console.log(`High quality matches: ${highQualityMatches.length}`);
```

### Pattern 5: Mixed Media Fetching

```javascript
const mediaItems = [
    { type: 'icon', description: 'user avatar' },
    { type: 'icon', description: 'settings' },
    { type: 'image', description: 'landscape' },
    { type: 'video', description: 'tutorial demo' }
];

const results = await icons.fetch(mediaItems);

// Group by type
const grouped = results.reduce((acc, item, i) => {
    const type = mediaItems[i].type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
}, {});
```

### Pattern 6: Error Handling

```javascript
try {
    const icon = await icons.fetchIcon('settings');
    
    if (icon && icon.success) {
        console.log('Icon found:', icon.url);
    } else {
        console.log('Icon not found or failed');
    }
} catch (error) {
    console.error('Error fetching icon:', error.message);
}
```

---

## Response Objects

### Icon Response

```javascript
{
  url: 'https://cdn.oblien.com/static/png-icons/home-outline.png',
  filename: 'home-outline.png',
  name: 'home',
  description: 'home',
  style: 'Outline',        // Icon style (e.g., Outline, Filled, etc.)
  score: 0.95,             // Relevance score (0-1)
  success: true            // Whether fetch was successful
}
```

### Search Response

```javascript
{
  results: [...],          // Array of icon objects
  hasMore: true,           // Whether more results available
  offset: 50,              // Next offset for pagination
  total: 245               // Total number of matches
}
```

### Media Response (Image/Video)

```javascript
{
  url: 'https://cdn.oblien.com/static/assets/...',
  type: 'image',           // 'image' or 'video'
  description: 'mountain landscape',
  variant: 'regular',      // Variant type
  success: true
}
```

---

## Icon Styles

Icons are available in different styles:

- **Outline** - Line-based outline icons
- **Filled** - Solid filled icons
- **Rounded** - Rounded corner icons
- **Sharp** - Sharp corner icons
- **Two-tone** - Two-tone color icons

**Example: Filter by style**
```javascript
const results = await icons.search('heart', { limit: 50 });

const outlineIcons = results.results.filter(icon => icon.style === 'Outline');
const filledIcons = results.results.filter(icon => icon.style === 'Filled');

console.log(`Outline: ${outlineIcons.length}, Filled: ${filledIcons.length}`);
```

---

## CDN URLs

All icons and media are served from the Oblien CDN:

**Icon URLs:**
```
https://cdn.oblien.com/static/png-icons/{path}
https://cdn.oblien.com/static/icons/{encoded-path}
```

**Media URLs (Images/Videos):**
```
https://cdn.oblien.com/static/assets/{encoded-url}
```

URLs are pre-signed and ready to use in your application.

---

## Best Practices

### 1. Use Descriptive Queries

```javascript
// Good
await icons.fetchIcon('settings gear icon');
await icons.fetchIcon('user profile avatar');

// Less specific
await icons.fetchIcon('gear');
await icons.fetchIcon('person');
```

### 2. Batch Similar Requests

```javascript
// Good - single request
const icons = await icons.fetchIcons(['home', 'user', 'settings']);

// Less efficient - multiple requests
const home = await icons.fetchIcon('home');
const user = await icons.fetchIcon('user');
const settings = await icons.fetchIcon('settings');
```

### 3. Use Pagination for Large Results

```javascript
// Good - paginated search
const page1 = await icons.search('icon', { limit: 50, offset: 0 });
const page2 = await icons.search('icon', { limit: 50, offset: 50 });

// Less efficient - fetch all at once
const all = await icons.search('icon', { limit: 1000 });
```

### 4. Cache Results

```javascript
const iconCache = new Map();

async function getCachedIcon(description) {
    if (!iconCache.has(description)) {
        const icon = await icons.fetchIcon(description);
        iconCache.set(description, icon);
    }
    return iconCache.get(description);
}
```

### 5. Handle Errors Gracefully

```javascript
async function safelyFetchIcon(description, fallbackUrl = null) {
    try {
        const icon = await icons.fetchIcon(description);
        return icon?.url || fallbackUrl;
    } catch (error) {
        console.error(`Failed to fetch icon: ${description}`, error);
        return fallbackUrl;
    }
}
```

---

## Error Handling

The Icons module throws errors for invalid inputs:

```javascript
// Empty query
try {
    await icons.search('');
} catch (error) {
    // Error: Query must be a non-empty string
}

// Invalid items format
try {
    await icons.fetch('not-an-array');
} catch (error) {
    // Error: Items must be a non-empty array
}

// Invalid item type
try {
    await icons.fetch([{ type: 'invalid', description: 'test' }]);
} catch (error) {
    // Error: Each item must have a valid type: icon, image, or video
}

// Missing description
try {
    await icons.fetch([{ type: 'icon' }]);
} catch (error) {
    // Error: Each item must have a description string
}
```

---

## Complete Example

```javascript
import { OblienClient } from 'oblien';
import { OblienIcons } from 'oblien/icons';

const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const icons = new OblienIcons(client);

async function setupAppIcons() {
    // Search for navigation icons
    const navResults = await icons.search('navigation', { limit: 10 });
    console.log(`Found ${navResults.total} navigation icons`);
    
    // Fetch specific icons for UI
    const uiIcons = await icons.fetchIcons([
        'home',
        'user profile',
        'settings gear',
        'notification bell',
        'search magnifying glass'
    ]);
    
    // Create icon mapping
    const iconMap = {
        home: uiIcons[0],
        user: uiIcons[1],
        settings: uiIcons[2],
        notifications: uiIcons[3],
        search: uiIcons[4]
    };
    
    // Fetch mixed media
    const media = await icons.fetch([
        { type: 'icon', description: 'logo' },
        { type: 'image', description: 'hero background' },
        { type: 'video', description: 'product demo' }
    ]);
    
    return { iconMap, media };
}

setupAppIcons()
    .then(({ iconMap, media }) => {
        console.log('Icons ready:', iconMap);
        console.log('Media ready:', media);
    })
    .catch(console.error);
```

---

## See Also

- [Main Documentation](../README.md)
- [Examples](../examples/icons-example.js)
- [OblienClient](../README.md#oblien-client)
- [Search Module](./SEARCH.md)

