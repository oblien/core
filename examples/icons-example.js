/**
 * Oblien Icons Module - Usage Examples
 * 
 * The Icons module provides semantic search and fetching for icons, images, and videos.
 * It uses AI-powered embeddings to find the most relevant visual assets for your descriptions.
 */

import { OblienClient } from 'oblien';
import { OblienIcons } from 'oblien/icons';

// Initialize client
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
    baseURL: 'https://api.oblien.com'
});

const icons = new OblienIcons(client);

/**
 * Example 1: Basic Icon Search
 * Search for icons using natural language queries
 */
async function basicSearchExample() {
    console.log('=== Basic Icon Search ===\n');
    
    const results = await icons.search('home', {
        limit: 10,
        offset: 0
    });
    
    console.log(`Found ${results.total} total icons`);
    console.log(`Showing ${results.results.length} icons`);
    console.log(`Has more: ${results.hasMore}`);
    
    results.results.forEach(icon => {
        console.log(`- ${icon.name} (${icon.style})`);
        console.log(`  URL: ${icon.url}`);
        console.log(`  Score: ${icon.score}`);
    });
}

/**
 * Example 2: Paginated Search
 * Fetch results with pagination
 */
async function paginatedSearchExample() {
    console.log('\n=== Paginated Search ===\n');
    
    let offset = 0;
    let page = 1;
    const limit = 20;
    
    // Fetch first page
    const firstPage = await icons.search('settings', { limit, offset });
    console.log(`Page ${page}: ${firstPage.results.length} icons`);
    
    // Fetch second page if available
    if (firstPage.hasMore) {
        page++;
        offset = firstPage.offset;
        const secondPage = await icons.search('settings', { limit, offset });
        console.log(`Page ${page}: ${secondPage.results.length} icons`);
    }
}

/**
 * Example 3: Search All Results
 * Automatically fetch all matching icons with pagination handling
 */
async function searchAllExample() {
    console.log('\n=== Search All Results ===\n');
    
    const allIcons = await icons.searchAll('user', {
        maxResults: 200,
        batchSize: 50
    });
    
    console.log(`Total icons fetched: ${allIcons.length}`);
    
    // Group by style
    const byStyle = allIcons.reduce((acc, icon) => {
        acc[icon.style] = (acc[icon.style] || 0) + 1;
        return acc;
    }, {});
    
    console.log('Icons by style:', byStyle);
}

/**
 * Example 4: Fetch Single Icon
 * Get the best matching icon for a description
 */
async function fetchSingleIconExample() {
    console.log('\n=== Fetch Single Icon ===\n');
    
    const icon = await icons.fetchIcon('settings gear');
    
    if (icon) {
        console.log('Icon found:');
        console.log(`- Description: ${icon.description}`);
        console.log(`- URL: ${icon.url}`);
        console.log(`- Style: ${icon.style}`);
        console.log(`- Success: ${icon.success}`);
    } else {
        console.log('No icon found');
    }
}

/**
 * Example 5: Fetch Multiple Icons
 * Get multiple icons at once for batch processing
 */
async function fetchMultipleIconsExample() {
    console.log('\n=== Fetch Multiple Icons ===\n');
    
    const descriptions = [
        'home',
        'user profile',
        'settings',
        'notification bell',
        'search magnifying glass'
    ];
    
    const fetchedIcons = await icons.fetchIcons(descriptions);
    
    fetchedIcons.forEach((icon, index) => {
        console.log(`${descriptions[index]}:`);
        console.log(`  URL: ${icon.url}`);
        console.log(`  Style: ${icon.style}`);
    });
}

/**
 * Example 6: Fetch Mixed Media Items
 * Fetch icons, images, and videos together
 */
async function fetchMixedMediaExample() {
    console.log('\n=== Fetch Mixed Media ===\n');
    
    const items = [
        { type: 'icon', description: 'user profile avatar' },
        { type: 'icon', description: 'settings gear' },
        { type: 'image', description: 'mountain landscape sunset' },
        { type: 'image', description: 'abstract geometric pattern' },
        { type: 'video', description: 'ocean waves crashing' }
    ];
    
    const results = await icons.fetch(items);
    
    results.forEach((item, index) => {
        console.log(`\n${items[index].type}: ${items[index].description}`);
        console.log(`  URL: ${item.url}`);
        console.log(`  Success: ${item.success}`);
        
        if (item.type === 'icon') {
            console.log(`  Style: ${item.style}`);
        } else if (item.variant) {
            console.log(`  Variant: ${item.variant}`);
        }
    });
}

/**
 * Example 7: Build UI Icon Set
 * Fetch a complete set of icons for a UI project
 */
async function buildIconSetExample() {
    console.log('\n=== Build UI Icon Set ===\n');
    
    const uiIcons = {
        navigation: [
            'home',
            'back arrow',
            'forward arrow',
            'menu hamburger',
            'close X'
        ],
        actions: [
            'add plus',
            'edit pencil',
            'delete trash',
            'save',
            'download'
        ],
        social: [
            'like heart',
            'share',
            'comment bubble',
            'bookmark',
            'star favorite'
        ]
    };
    
    const iconSet = {};
    
    for (const [category, descriptions] of Object.entries(uiIcons)) {
        console.log(`\nFetching ${category} icons...`);
        const fetchedIcons = await icons.fetchIcons(descriptions);
        
        iconSet[category] = descriptions.reduce((acc, desc, i) => {
            const key = desc.split(' ')[0]; // Use first word as key
            acc[key] = {
                description: desc,
                url: fetchedIcons[i]?.url,
                style: fetchedIcons[i]?.style
            };
            return acc;
        }, {});
        
        console.log(`  Fetched ${fetchedIcons.length} ${category} icons`);
    }
    
    console.log('\nComplete icon set:', JSON.stringify(iconSet, null, 2));
}

/**
 * Example 8: Search with Different Styles
 * Search for icons and filter by style preference
 */
async function searchByStyleExample() {
    console.log('\n=== Search by Style ===\n');
    
    const results = await icons.search('heart', { limit: 50 });
    
    // Group results by style
    const styleGroups = results.results.reduce((acc, icon) => {
        if (!acc[icon.style]) {
            acc[icon.style] = [];
        }
        acc[icon.style].push(icon);
        return acc;
    }, {});
    
    console.log('Available styles:');
    Object.entries(styleGroups).forEach(([style, iconsInStyle]) => {
        console.log(`- ${style}: ${iconsInStyle.length} icons`);
    });
    
    // Get only outline style icons
    const outlineIcons = styleGroups['Outline'] || [];
    console.log(`\nUsing ${outlineIcons.length} outline icons`);
}

/**
 * Example 9: Error Handling
 * Proper error handling for icon operations
 */
async function errorHandlingExample() {
    console.log('\n=== Error Handling ===\n');
    
    try {
        // Empty query
        await icons.search('');
    } catch (error) {
        console.log('Empty query error:', error.message);
    }
    
    try {
        // Invalid items format
        await icons.fetch('not an array');
    } catch (error) {
        console.log('Invalid format error:', error.message);
    }
    
    try {
        // Missing description
        await icons.fetch([{ type: 'icon' }]);
    } catch (error) {
        console.log('Missing description error:', error.message);
    }
    
    try {
        // Invalid type
        await icons.fetch([{ type: 'invalid', description: 'test' }]);
    } catch (error) {
        console.log('Invalid type error:', error.message);
    }
}

/**
 * Example 10: Advanced Search with Scoring
 * Use relevance scores to filter results
 */
async function advancedSearchExample() {
    console.log('\n=== Advanced Search with Scoring ===\n');
    
    const results = await icons.search('shopping cart', { limit: 30 });
    
    // Filter by minimum score
    const minScore = 0.85;
    const highQualityMatches = results.results.filter(icon => icon.score >= minScore);
    
    console.log(`Total results: ${results.results.length}`);
    console.log(`High quality matches (score >= ${minScore}): ${highQualityMatches.length}`);
    
    // Show top 5 matches
    console.log('\nTop 5 matches:');
    results.results.slice(0, 5).forEach((icon, i) => {
        console.log(`${i + 1}. ${icon.name} - Score: ${icon.score.toFixed(3)}`);
        console.log(`   ${icon.url}`);
    });
}

/**
 * Example 11: Batch Processing with Error Recovery
 * Process multiple items with individual error handling
 */
async function batchProcessingExample() {
    console.log('\n=== Batch Processing ===\n');
    
    const descriptions = [
        'user profile',
        'settings',
        'notification',
        'message',
        'calendar'
    ];
    
    const results = [];
    const errors = [];
    
    // Process in batches of 2
    const batchSize = 2;
    for (let i = 0; i < descriptions.length; i += batchSize) {
        const batch = descriptions.slice(i, i + batchSize);
        
        try {
            const batchResults = await icons.fetchIcons(batch);
            results.push(...batchResults);
            console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${batchResults.length} icons fetched`);
        } catch (error) {
            console.log(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
            errors.push({ batch, error: error.message });
        }
    }
    
    console.log(`\nTotal successful: ${results.length}`);
    console.log(`Total errors: ${errors.length}`);
}

/**
 * Example 12: Icon CDN URL Structure
 * Understanding and using the CDN URLs
 */
async function cdnUrlExample() {
    console.log('\n=== CDN URL Structure ===\n');
    
    const icon = await icons.fetchIcon('home');
    
    console.log('CDN URL:', icon.url);
    console.log('- Base: https://cdn.oblien.com');
    console.log('- Path: /static/png-icons/ or /static/icons/');
    console.log('- Filename:', icon.url.split('/').pop());
    
    console.log('\nIcon details:');
    console.log('- Description:', icon.description);
    console.log('- Style:', icon.style);
    console.log('- Success:', icon.success);
}

// Run all examples
async function runAllExamples() {
    try {
        await basicSearchExample();
        await paginatedSearchExample();
        await searchAllExample();
        await fetchSingleIconExample();
        await fetchMultipleIconsExample();
        await fetchMixedMediaExample();
        await buildIconSetExample();
        await searchByStyleExample();
        await errorHandlingExample();
        await advancedSearchExample();
        await batchProcessingExample();
        await cdnUrlExample();
        
        console.log('\n✅ All examples completed successfully!');
    } catch (error) {
        console.error('❌ Error running examples:', error);
    }
}

// Export examples
export {
    basicSearchExample,
    paginatedSearchExample,
    searchAllExample,
    fetchSingleIconExample,
    fetchMultipleIconsExample,
    fetchMixedMediaExample,
    buildIconSetExample,
    searchByStyleExample,
    errorHandlingExample,
    advancedSearchExample,
    batchProcessingExample,
    cdnUrlExample,
    runAllExamples
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}

