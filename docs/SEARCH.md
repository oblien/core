# Oblien Search Module

Complete web search, content extraction, and AI-powered research capabilities.

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
import { OblienClient, OblienSearch } from 'oblien';

const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

const search = new OblienSearch(client);

// Web search
const results = await search.search({
    queries: ['artificial intelligence'],
    includeAnswers: true
});

// Extract content
const extracted = await search.extract({
    pages: [{
        url: 'https://example.com/article',
        details: ['main topic', 'key points']
    }]
});

// Deep research
const report = await search.crawl({
    instructions: 'Research renewable energy trends',
    reportType: 'pdf'
});
```

---

## Features

### ✅ Web Search
- Multiple query support
- AI-generated answers
- Region and time filters
- Configurable result limits

### ✅ Content Extraction
- Extract specific details from URLs
- Batch processing
- Multiple summary levels
- Structured output

### ✅ Deep Research (Crawl)
- AI-powered research reports
- Multiple report formats (PDF, Markdown, HTML)
- Real-time progress streaming
- Comprehensive analysis

---

## API Reference

### OblienSearch

#### Constructor

```javascript
const search = new OblienSearch(client);
```

---

### `search(options)`

Perform web search with multiple queries.

```javascript
const results = await search.search({
    queries: ['query 1', 'query 2'],
    includeAnswers: false,
    options: {
        maxResults: 10,
        region: 'us',
        timeRange: 'week'
    }
});
```

**Parameters:**
- `queries` (Array<string>, required): Array of search queries
- `includeAnswers` (boolean, optional): Include AI-generated answers (default: false)
- `options` (object, optional): Additional search options
  - `maxResults` (number): Maximum results per query
  - `region` (string): Search region ('us', 'uk', 'eu', etc.)
  - `timeRange` (string): Time filter ('day', 'week', 'month', 'year')

**Returns:**
```javascript
[
    {
        query: 'artificial intelligence',
        answer: 'AI is...',  // Only if includeAnswers: true
        results: [
            {
                title: 'Article Title',
                url: 'https://example.com',
                snippet: 'Description...',
                source: 'example.com'
            }
        ],
        success: true
    }
]
```

---

### `extract(options)`

Extract and summarize content from web pages.

```javascript
const result = await search.extract({
    pages: [
        {
            url: 'https://example.com/article',
            details: [
                'main topic',
                'key points',
                'conclusion'
            ],
            summaryLevel: 'medium'
        }
    ],
    options: {
        language: 'en'
    }
});
```

**Parameters:**
- `pages` (Array<object>, required): Array of pages to extract
  - `url` (string, required): Page URL
  - `details` (Array<string>, required): Specific details to extract
  - `summaryLevel` (string, optional): 'brief' | 'medium' | 'detailed' (default: 'medium')
- `options` (object, optional): Additional extraction options

**Returns:**
```javascript
{
    success: true,
    data: [
        {
            page: {
                url: 'https://example.com/article',
                details: ['main topic', 'key points']
            },
            result: {
                'main topic': 'Extracted content...',
                'key points': ['Point 1', 'Point 2']
            }
        }
    ],
    errors: [],
    time_took: 1234
}
```

---

### `crawl(options)`

Create deep research report with AI crawling.

```javascript
// Standard (JSON response)
const result = await search.crawl({
    instructions: 'Research climate change solutions',
    reportType: 'pdf',
    options: {
        thinking: true
    }
});

// With progress streaming
const result = await search.crawl({
    instructions: 'Research AI ethics',
    reportType: 'pdf',
    options: {
        thinking: true,
        stream_text: true
    },
    onProgress: (data) => {
        console.log('Progress:', data);
    }
});
```

**Parameters:**
- `instructions` (string, required): Research instructions/topic
- `reportType` (string, optional): 'pdf' | 'markdown' | 'html' (default: 'pdf')
- `options` (object, optional): Additional crawl options
  - `thinking` (boolean): Enable AI thinking mode
  - `allow_thinking_callback` (boolean): Allow thinking callbacks
  - `stream_text` (boolean): Stream text responses
- `onProgress` (Function, optional): Callback for progress updates (enables streaming)

**Progress Callback Data:**
```javascript
{
    action: 'status' | 'result',
    message: 'Searching sources...',
    content: 'Partial content...',
    type: 'thinking' | 'progress',
    percentage: 45
}
```

**Returns:**
```javascript
{
    success: true,
    time_took: 45000
}
```

---

## Usage Examples

### Example 1: Basic Web Search

```javascript
const results = await search.search({
    queries: ['machine learning basics'],
    includeAnswers: false
});

results[0].results.forEach(result => {
    console.log(`${result.title}: ${result.url}`);
});
```

### Example 2: Search with AI Answers

```javascript
const results = await search.search({
    queries: [
        'What is quantum computing?',
        'How does blockchain work?'
    ],
    includeAnswers: true
});

results.forEach(result => {
    console.log('Question:', result.query);
    console.log('Answer:', result.answer);
    console.log('Sources:', result.results.length);
});
```

### Example 3: Extract Content from Pages

```javascript
const result = await search.extract({
    pages: [
        {
            url: 'https://blog.example.com/post',
            details: [
                'author',
                'publication date',
                'main arguments',
                'conclusion'
            ],
            summaryLevel: 'detailed'
        }
    ]
});

console.log('Extracted:', result.data[0].result);
```

### Example 4: Deep Research with Progress

```javascript
const result = await search.crawl({
    instructions: `
        Research the impact of AI on healthcare.
        Focus on:
        - Diagnostics and imaging
        - Drug discovery
        - Patient care and monitoring
        - Ethical considerations
    `,
    reportType: 'pdf',
    options: {
        thinking: true,
        stream_text: true
    },
    onProgress: (data) => {
        if (data.action === 'status') {
            console.log('Status:', data.message);
        } else if (data.action === 'result') {
            console.log('Result:', data.content);
        }
    }
});

console.log('Research complete! Time:', result.time_took, 'ms');
```

### Example 5: Complete Research Workflow

```javascript
// 1. Initial search
const searchResults = await search.search({
    queries: ['renewable energy innovations'],
    options: { maxResults: 10 }
});

// 2. Extract details from top sources
const topUrls = searchResults[0].results.slice(0, 5).map(r => r.url);
const extracted = await search.extract({
    pages: topUrls.map(url => ({
        url,
        details: ['innovations', 'benefits', 'challenges'],
        summaryLevel: 'medium'
    }))
});

// 3. Create comprehensive report
const report = await search.crawl({
    instructions: `
        Create a detailed report on renewable energy innovations.
        Synthesize the following sources and provide insights.
    `,
    reportType: 'pdf'
});

console.log('Complete workflow finished!');
```

---

## Use Cases

### 1. Competitive Analysis

```javascript
const analysis = async (company) => {
    // Search recent news
    const news = await search.search({
        queries: [`${company} news`, `${company} competitors`],
        options: { timeRange: 'month' }
    });

    // Extract competitor data
    const competitorData = await search.extract({
        pages: competitorUrls.map(url => ({
            url,
            details: ['products', 'pricing', 'market position']
        }))
    });

    // Generate report
    const report = await search.crawl({
        instructions: `Create competitive analysis for ${company}`
    });

    return { news, competitorData, report };
};
```

### 2. Content Summarization

```javascript
const summarize = async (urls) => {
    const summaries = await search.extract({
        pages: urls.map(url => ({
            url,
            details: ['main points', 'key takeaways'],
            summaryLevel: 'brief'
        }))
    });

    return summaries.data;
};
```

### 3. Market Research

```javascript
const marketResearch = async (industry) => {
    const report = await search.crawl({
        instructions: `
            Research ${industry} market:
            - Market size and growth
            - Key players
            - Trends and opportunities
            - Challenges and threats
        `,
        reportType: 'pdf',
        onProgress: (data) => console.log(data.message)
    });

    return report;
};
```

---

## Report Types

| Type | Extension | Description |
|------|-----------|-------------|
| `pdf` | .pdf | PDF document (default) |
| `markdown` | .md | Markdown format |
| `html` | .html | HTML document |

---

## Summary Levels

| Level | Description |
|-------|-------------|
| `brief` | Short summary, main points only |
| `medium` | Balanced summary (default) |
| `detailed` | Comprehensive extraction |

---

## Streaming vs. Standard

### Standard (JSON Response)
- Simple request/response
- Get result when complete
- No progress updates

```javascript
const result = await search.crawl({
    instructions: 'Research topic'
});
```

### Streaming (Progress Callbacks)
- Real-time progress updates
- See AI thinking process
- Track research stages

```javascript
const result = await search.crawl({
    instructions: 'Research topic',
    onProgress: (data) => {
        console.log(data.message);
    }
});
```

---

## Error Handling

```javascript
try {
    const results = await search.search({
        queries: ['query']
    });
} catch (error) {
    console.error('Search error:', error.message);
}

try {
    const extracted = await search.extract({
        pages: [{ url: 'https://example.com' }]
    });
} catch (error) {
    // "Page at index 0 is missing 'details' array"
}

try {
    const report = await search.crawl({
        instructions: ''
    });
} catch (error) {
    // "Instructions string is required"
}
```

---

## Best Practices

1. **Multiple Queries**: Use array of queries for comprehensive results
2. **Include Answers**: Set `includeAnswers: true` for quick summaries
3. **Specific Details**: Be specific in `details` array for better extraction
4. **Streaming**: Use `onProgress` for long research tasks
5. **Error Handling**: Always wrap in try-catch blocks
6. **Batch Processing**: Extract multiple pages in one call

---

## Type Definitions

```typescript
interface SearchOptions {
    queries: string[];
    includeAnswers?: boolean;
    options?: {
        maxResults?: number;
        region?: string;
        timeRange?: 'day' | 'week' | 'month' | 'year';
    };
}

interface ExtractOptions {
    pages: Array<{
        url: string;
        details: string[];
        summaryLevel?: 'brief' | 'medium' | 'detailed';
    }>;
    options?: object;
}

interface CrawlOptions {
    instructions: string;
    reportType?: 'pdf' | 'markdown' | 'html';
    options?: {
        thinking?: boolean;
        allow_thinking_callback?: boolean;
        stream_text?: boolean;
    };
    onProgress?: (data: any) => void;
}
```

---

## Related Modules

- [Agents Module](./AGENTS_COMPLETE.md) - AI agents with search tools
- [Sandboxes Module](./SANDBOXES.md) - Execute code in sandboxes
- [Chat Module](./CHAT.md) - Chat with AI

---

## Support

- **Documentation**: https://docs.oblien.com/search
- **API Reference**: https://api.oblien.com/docs/search
- **Examples**: `/examples/search-example.js`
- **Support**: support@oblien.com

