/**
 * Oblien Search Module - Usage Examples
 */

import { OblienClient } from 'oblien';
import { OblienSearch } from 'oblien/search';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret'
});

// Initialize search module
const search = new OblienSearch(client);

// ============================================================================
// EXAMPLE 1: Basic web search
// ============================================================================
async function basicSearch() {
    const results = await search.search({
        queries: ['artificial intelligence', 'machine learning'],
        includeAnswers: false
    });

    console.log('Search results:', results);
    results.forEach((result, index) => {
        console.log(`\nQuery ${index + 1}:`, result.query);
        console.log('Results:', result.results.length);
        result.results.forEach(item => {
            console.log(`- ${item.title}: ${item.url}`);
        });
    });

    return results;
}

// ============================================================================
// EXAMPLE 2: Search with AI-generated answers
// ============================================================================
async function searchWithAnswers() {
    const results = await search.search({
        queries: [
            'What is quantum computing?',
            'How does blockchain work?'
        ],
        includeAnswers: true  // Get AI-generated answers
    });

    results.forEach((result, index) => {
        console.log(`\nQuery: ${result.query}`);
        
        if (result.answer) {
            console.log('AI Answer:', result.answer);
        }
        
        console.log(`\nTop ${result.results.length} sources:`);
        result.results.slice(0, 5).forEach(item => {
            console.log(`- ${item.title}`);
            console.log(`  ${item.url}`);
        });
    });

    return results;
}

// ============================================================================
// EXAMPLE 3: Search with options
// ============================================================================
async function searchWithOptions() {
    const results = await search.search({
        queries: ['latest AI news'],
        includeAnswers: true,
        options: {
            maxResults: 20,
            region: 'us',
            timeRange: 'week'  // Past week
        }
    });

    console.log('Recent AI news:', results[0].results.length, 'results');
    return results;
}

// ============================================================================
// EXAMPLE 4: Extract content from web pages
// ============================================================================
async function extractContent() {
    const result = await search.extract({
        pages: [
            {
                url: 'https://example.com/article1',
                details: [
                    'main topic',
                    'key points',
                    'conclusion'
                ],
                summaryLevel: 'medium'
            },
            {
                url: 'https://example.com/article2',
                details: [
                    'author',
                    'publication date',
                    'main arguments'
                ],
                summaryLevel: 'detailed'
            }
        ]
    });

    console.log('Extraction successful:', result.success);
    console.log('Time taken:', result.time_took, 'ms');
    
    result.data.forEach((item, index) => {
        console.log(`\nPage ${index + 1}:`, item.page.url);
        console.log('Extracted content:', item.result);
    });

    return result;
}

// ============================================================================
// EXAMPLE 5: Extract with specific details
// ============================================================================
async function extractSpecificDetails() {
    const result = await search.extract({
        pages: [
            {
                url: 'https://docs.example.com/api',
                details: [
                    'authentication methods',
                    'rate limits',
                    'example requests',
                    'error codes'
                ],
                summaryLevel: 'detailed'
            }
        ],
        options: {
            language: 'en'
        }
    });

    console.log('API documentation extracted:');
    console.log(result.data[0].result);

    return result;
}

// ============================================================================
// EXAMPLE 6: Deep research crawl (standard)
// ============================================================================
async function deepResearch() {
    const result = await search.crawl({
        instructions: 'Create a comprehensive report about the current state of renewable energy technology, including solar, wind, and emerging technologies',
        reportType: 'pdf'
    });

    console.log('Research complete:', result.success);
    console.log('Time taken:', result.time_took, 'ms');

    return result;
}

// ============================================================================
// EXAMPLE 7: Deep research with streaming progress
// ============================================================================
async function deepResearchWithProgress() {
    console.log('Starting deep research with progress tracking...\n');

    const result = await search.crawl({
        instructions: 'Research the impact of artificial intelligence on healthcare, including diagnostics, drug discovery, and patient care',
        reportType: 'pdf',
        options: {
            thinking: true,
            stream_text: true
        },
        onProgress: (data) => {
            // Handle progress updates
            if (data.action === 'status') {
                console.log('Status:', data.message);
            } else if (data.action === 'result') {
                console.log('Partial result:', data.content);
            } else if (data.type === 'thinking') {
                console.log('AI is thinking:', data.thought);
            } else if (data.type === 'progress') {
                console.log(`Progress: ${data.percentage}%`);
            }
        }
    });

    console.log('\nResearch complete!');
    console.log('Time taken:', result.time_took, 'ms');

    return result;
}

// ============================================================================
// EXAMPLE 8: Multiple report types
// ============================================================================
async function multipleReportTypes() {
    // PDF report
    const pdfReport = await search.crawl({
        instructions: 'Summary of climate change initiatives',
        reportType: 'pdf'
    });

    console.log('PDF report generated');

    // Markdown report
    const mdReport = await search.crawl({
        instructions: 'Summary of climate change initiatives',
        reportType: 'markdown'
    });

    console.log('Markdown report generated');

    return { pdfReport, mdReport };
}

// ============================================================================
// EXAMPLE 9: Complex research workflow
// ============================================================================
async function complexResearchWorkflow() {
    console.log('Step 1: Initial broad search...');
    
    // Step 1: Broad search to find relevant sources
    const searchResults = await search.search({
        queries: [
            'latest advancements in quantum computing',
            'quantum computing applications'
        ],
        includeAnswers: true,
        options: {
            maxResults: 10
        }
    });

    console.log(`Found ${searchResults[0].results.length} sources\n`);

    // Step 2: Extract detailed content from top sources
    console.log('Step 2: Extracting detailed content...');
    
    const topUrls = searchResults[0].results.slice(0, 3).map(r => r.url);
    const extractedContent = await search.extract({
        pages: topUrls.map(url => ({
            url,
            details: [
                'main innovations',
                'technical specifications',
                'real-world applications',
                'challenges'
            ],
            summaryLevel: 'detailed'
        }))
    });

    console.log(`Extracted content from ${extractedContent.data.length} pages\n`);

    // Step 3: Deep research with progress tracking
    console.log('Step 3: Creating comprehensive research report...');
    
    const report = await search.crawl({
        instructions: `
            Create a detailed research report about quantum computing advancements.
            Focus on:
            - Recent breakthroughs
            - Current applications
            - Future potential
            - Technical challenges
            
            Include citations and evidence from recent sources.
        `,
        reportType: 'pdf',
        options: {
            thinking: true,
            stream_text: true
        },
        onProgress: (data) => {
            if (data.action === 'status') {
                console.log('  →', data.message);
            }
        }
    });

    console.log('\n✓ Complete research workflow finished!');
    
    return {
        searchResults,
        extractedContent,
        report
    };
}

// ============================================================================
// EXAMPLE 10: Error handling
// ============================================================================
async function errorHandlingExample() {
    try {
        // Missing required fields
        await search.search({
            queries: []  // Empty array
        });
    } catch (error) {
        console.error('Error:', error.message);
        // "Queries array is required and must not be empty"
    }

    try {
        // Invalid page structure
        await search.extract({
            pages: [
                { url: 'https://example.com' }  // Missing 'details'
            ]
        });
    } catch (error) {
        console.error('Error:', error.message);
        // "Page at index 0 is missing 'details' array"
    }

    try {
        // Missing instructions
        await search.crawl({
            instructions: ''  // Empty string
        });
    } catch (error) {
        console.error('Error:', error.message);
        // "Instructions string is required"
    }
}

// ============================================================================
// EXAMPLE 11: Competitive analysis use case
// ============================================================================
async function competitiveAnalysis() {
    const company = 'Tesla';
    
    console.log(`Performing competitive analysis for ${company}...\n`);

    // Search for recent news
    const news = await search.search({
        queries: [
            `${company} latest news`,
            `${company} competitors`,
            `${company} market analysis`
        ],
        includeAnswers: true,
        options: {
            timeRange: 'month',
            maxResults: 15
        }
    });

    // Extract detailed information from competitor websites
    const competitorUrls = [
        'https://competitor1.com/about',
        'https://competitor2.com/products',
        'https://competitor3.com/pricing'
    ];

    const competitorInfo = await search.extract({
        pages: competitorUrls.map(url => ({
            url,
            details: [
                'products and services',
                'pricing strategy',
                'target market',
                'competitive advantages'
            ],
            summaryLevel: 'detailed'
        }))
    });

    // Create comprehensive report
    const report = await search.crawl({
        instructions: `
            Create a detailed competitive analysis report for ${company}.
            Include:
            - Market position and trends
            - Key competitors and their strategies
            - Strengths and weaknesses
            - Market opportunities and threats
            - Strategic recommendations
        `,
        reportType: 'pdf',
        onProgress: (data) => {
            if (data.action === 'status') {
                console.log(data.message);
            }
        }
    });

    console.log('\n✓ Competitive analysis complete!');
    
    return { news, competitorInfo, report };
}

// ============================================================================
// EXAMPLE 12: Content summarization pipeline
// ============================================================================
async function contentSummarizationPipeline() {
    const topic = 'sustainable fashion trends 2024';
    
    // 1. Find relevant articles
    const articles = await search.search({
        queries: [topic],
        options: {
            maxResults: 10,
            timeRange: 'month'
        }
    });

    const articleUrls = articles[0].results.slice(0, 5).map(r => r.url);

    // 2. Extract and summarize each article
    const summaries = await search.extract({
        pages: articleUrls.map(url => ({
            url,
            details: [
                'main trends',
                'key statistics',
                'expert opinions',
                'future predictions'
            ],
            summaryLevel: 'brief'
        }))
    });

    // 3. Create aggregated report
    const finalReport = await search.crawl({
        instructions: `
            Synthesize the following articles about ${topic} into a cohesive report.
            Identify common themes, contradictions, and emerging patterns.
            Provide actionable insights.
        `,
        reportType: 'markdown'
    });

    return { articles, summaries, finalReport };
}

// ============================================================================
// Run examples
// ============================================================================
async function main() {
    try {
        // Uncomment the examples you want to run

        // await basicSearch();
        // await searchWithAnswers();
        // await searchWithOptions();
        // await extractContent();
        // await extractSpecificDetails();
        // await deepResearch();
        // await deepResearchWithProgress();
        // await complexResearchWorkflow();
        // await competitiveAnalysis();
        // await contentSummarizationPipeline();
        // await errorHandlingExample();

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export {
    basicSearch,
    searchWithAnswers,
    searchWithOptions,
    extractContent,
    extractSpecificDetails,
    deepResearch,
    deepResearchWithProgress,
    multipleReportTypes,
    complexResearchWorkflow,
    competitiveAnalysis,
    contentSummarizationPipeline,
    errorHandlingExample
};

