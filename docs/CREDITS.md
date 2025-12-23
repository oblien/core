# Credits Module

Complete SDK for managing credits, quotas, usage tracking, and purchases in the Oblien platform.

## Installation

```bash
npm install oblien
```

## Quick Start

```javascript
import { OblienClient } from 'oblien';
import { OblienCredits } from 'oblien/credits';

// Initialize
const client = new OblienClient({
    apiKey: 'your-client-id',
    apiSecret: 'your-client-secret',
});

const credits = new OblienCredits(client);

// Get balance
const balance = await credits.getBalance();
console.log('Balance:', balance);

// Set quota
await credits.setQuota({
    namespace: 'production',
    service: 'ai',
    quotaLimit: 10000,
    period: 'monthly',
});

// Get usage stats
const stats = await credits.getUsageStats({ days: 7 });
```

## API Reference

### OblienCredits

Main manager class for credits operations.

#### Constructor

```javascript
const credits = new OblienCredits(client);
```

**Parameters:**
- `client` (OblienClient) - Authenticated Oblien client instance

---

## Balance Management

### `getBalance()`

Get current credit balance.

```javascript
const balance = await credits.getBalance();
// Returns: 15000.50
```

**Returns:** `Promise<number>`

---

### `addCredits(amount, reason, metadata)`

Add credits to account (admin only).

```javascript
await credits.addCredits(5000, 'bonus', {
    campaign: 'new-year-2024',
});
```

---

## Quota Management

### `getNamespaceQuotas(options)`

Get all namespace quotas with pagination.

```javascript
const result = await credits.getNamespaceQuotas({
    limit: 100,
    offset: 0,
    after: 'namespace:service',  // Cursor pagination
    search: 'production',
    status: 'active',  // active, warning, exceeded
});

console.log(result.data);          // Array of quotas
console.log(result.aggregations);  // Total stats
console.log(result.pagination);    // Pagination info
```

---

### `getNamespaceDetails(namespace, options)`

Get detailed namespace information.

```javascript
const details = await credits.getNamespaceDetails('production', {
    days: 30,
});

console.log(details.quotas);        // Quota info
console.log(details.usage);         // Usage statistics
console.log(details.transactions);  // Recent transactions
```

---

### `setQuota(options)`

Set or update namespace quota.

```javascript
await credits.setQuota({
    namespace: 'production',
    service: 'ai',
    quotaLimit: 10000,  // null or 0 for unlimited
    period: 'monthly',  // daily, monthly, unlimited
});
```

---

### `resetQuota(namespace, service)`

Reset namespace quota (e.g., monthly reset).

```javascript
await credits.resetQuota('production', 'ai');
```

---

## Usage History & Transactions

### `getHistory(options)`

Get credit transaction history.

```javascript
const history = await credits.getHistory({
    namespace: 'production',
    endUserId: 'user_123',
    service: 'ai',
    type: 'deduction',  // deduction, addition, refund, adjustment
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    limit: 50,
    offset: 0,
    // Or use cursor pagination:
    after: '2024-01-15T00:00:00Z',
    afterId: 12345,
});

console.log(history.data);        // Transaction array
console.log(history.pagination);  // Pagination info
```

---

### `getHistoryFilters()`

Get available filter options.

```javascript
const filters = await credits.getHistoryFilters();

console.log(filters.namespaces);  // Available namespaces
console.log(filters.services);    // Available services
```

---

### `getSummary(options)`

Get aggregated usage summary.

```javascript
const summary = await credits.getSummary({
    namespace: 'production',
    days: 30,
    limit: 50,
    after: 1234.56,  // Cursor pagination by total_spent
});
```

---

### `getUsageStats(options)`

Get daily usage statistics (perfect for charts).

```javascript
const stats = await credits.getUsageStats({
    days: 7,
});

// Returns daily breakdown of usage
```

---

## Pricing & Packages

### `getPackages()`

Get available credit packages.

```javascript
const packages = await credits.getPackages();

// [
//   {
//     id: 'starter',
//     name: 'Starter',
//     credits: 10000,
//     price: 10.00,
//     currency: 'USD'
//   },
//   ...
// ]
```

---

### `getPricingInfo()`

Get pricing information and limits.

```javascript
const info = await credits.getPricingInfo();

console.log(info.rates);     // Pricing rates
console.log(info.minimum);   // Minimum purchase
console.log(info.maximum);   // Maximum purchase
```

---

### `calculateCost(options)`

Calculate credits from money or vice versa.

```javascript
// By package
const pkg = await credits.calculateCost({
    packageId: 'pro',
});

// By amount
const fromMoney = await credits.calculateCost({
    amount: 100,  // $100
});
console.log('Credits:', fromMoney.credits);

// By credits
const fromCredits = await credits.calculateCost({
    credits: 50000,
});
console.log('Cost:', fromCredits.amount);
```

---

### `calculateCredits(amount)`

Quick calculation for preview.

```javascript
const result = await credits.calculateCredits(50); // $50
console.log('Credits:', result.credits);
```

---

## Purchase Management

### `createCheckout(options)`

Create Stripe checkout to purchase credits.

```javascript
// Purchase by package
const checkout = await credits.createCheckout({
    packageId: 'pro',
});

// Or custom amount
const checkout = await credits.createCheckout({
    amount: 75.50,
    metadata: {
        source: 'dashboard',
    },
});

console.log(checkout.checkoutUrl);  // Redirect user here
console.log(checkout.sessionId);
```

---

### `getPurchaseHistory(options)`

Get purchase history.

```javascript
// Light version (faster, basic data only)
const history = await credits.getPurchaseHistory({
    limit: 20,
    offset: 0,
    light: true,
});

// Full version (includes invoices, receipts)
const fullHistory = await credits.getPurchaseHistory({
    limit: 20,
    light: false,
});
```

---

### `getPurchaseDetails(purchaseId)`

Get single purchase details.

```javascript
const purchase = await credits.getPurchaseDetails('purchase-id');

console.log(purchase.invoicePdf);
console.log(purchase.receiptUrl);
console.log(purchase.paymentInfo);
```

---

### `getPurchaseSession(purchaseId)`

Get checkout URL for pending purchase.

```javascript
const session = await credits.getPurchaseSession('purchase-id');

// Redirect user to complete payment
window.location.href = session.checkoutUrl;
```

---

### `cancelPurchase(purchaseId)`

Cancel a pending purchase.

```javascript
await credits.cancelPurchase('purchase-id');
```

---

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
    OblienCredits,
    QuotaData,
    CreditTransaction,
    SetQuotaOptions,
    HistoryOptions,
} from 'oblien/credits';

const credits: OblienCredits = new OblienCredits(client);

const quota: QuotaData = await credits.setQuota({
    namespace: 'production',
    service: 'ai',
    quotaLimit: 10000,
    period: 'monthly',
});
```

---

## Error Handling

All methods throw errors that can be caught:

```javascript
try {
    await credits.setQuota({
        namespace: 'production',
        service: 'ai',
        quotaLimit: 10000,
    });
} catch (error) {
    console.error('Failed to set quota:', error.message);
}
```

Common errors:
- `401` - Unauthorized (invalid credentials)
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Examples

See `/examples/credits-example.js` for complete working examples covering all operations.

---

## Integration with Namespaces

Credits work seamlessly with namespaces:

```javascript
import { OblienNamespaces } from 'oblien/namespaces';
import { OblienCredits } from 'oblien/credits';

const namespaces = new OblienNamespaces(client);
const credits = new OblienCredits(client);

// Create namespace
const namespace = await namespaces.create({ name: 'Production' });

// Set quota for that namespace
await credits.setQuota({
    namespace: namespace.slug,
    service: 'ai',
    quotaLimit: 10000,
});

// Track usage
const stats = await credits.getUsageStats({ days: 7 });
```

---

## License

MIT

