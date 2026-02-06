# Carrier Integration Service

A production-ready, extensible TypeScript service for integrating with shipping carriers. Currently supports UPS Rating API with a clean architecture designed to easily add support for FedEx, USPS, DHL, and other carriers.

## 🏗️ Architecture

### Design Philosophy

This service is built around three key principles:

1. **Carrier Agnosticism**: Application code works with domain models (Rate, Address, Package), never carrier-specific formats
2. **Extensibility**: Adding a new carrier or operation requires zero changes to existing code
3. **Production Quality**: Comprehensive error handling, validation, auth management, and testing

### Project Structure

```
src/
├── carriers/
│   ├── base/                    # Abstract base classes
│   │   ├── Carrier.ts          # Carrier interface (getRates, etc.)
│   │   └── AuthClient.ts       # Authentication interface
│   └── ups/                     # UPS implementation
│       ├── UPSCarrier.ts       # Main UPS carrier class
│       ├── UPSAuthClient.ts    # OAuth 2.0 implementation
│       ├── UPSRatingService.ts # Rating API integration
│       └── types.ts            # UPS-specific types
├── domain/                      # Carrier-agnostic models
│   ├── models.ts               # Rate, Address, Package, etc.
│   └── schemas.ts              # Zod validation schemas
├── errors/                      # Structured error types
│   └── CarrierError.ts         # Error hierarchy
├── config/                      # Configuration management
│   └── config.ts               # Environment variables
└── index.ts                     # Public API
```

### Key Design Patterns

#### 1. Abstract Base Classes

All carriers implement the `Carrier` abstract class:

```typescript
abstract class Carrier {
  abstract getName(): string;
  abstract getRates(request: RateRequest): Promise<RateResponse>;
  // Future: abstract createLabel(request: LabelRequest): Promise<Label>;
  // Future: abstract trackShipment(trackingNumber: string): Promise<TrackingInfo>;
}
```

This ensures a consistent interface regardless of the underlying carrier.

#### 2. Domain Model Translation

Each carrier translates between:
- **Internal models** (carrier-agnostic): `RateRequest`, `RateResponse`, `Rate`
- **External API formats** (carrier-specific): `UPSRateRequest`, `UPSRateResponse`

The application never sees UPS-specific types.

#### 3. Dependency Injection

Services accept their dependencies through constructors, making them easy to test and configure:

```typescript
class UPSRatingService {
  constructor(authClient?: UPSAuthClient) {
    this.authClient = authClient || new UPSAuthClient();
  }
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd carrier-integration-service

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` with your UPS credentials:

```bash
UPS_CLIENT_ID=your_client_id
UPS_CLIENT_SECRET=your_client_secret
```

### Build

```bash
npm run build
```

### Run Example / Start Service

You can run a demonstration script to see the service in action:

```bash
npm start
```

This will execute `src/example.ts`, which demonstrates how to initialize a carrier, prepare a request, and handle the response.

### Run Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 💻 Usage

### Basic Example

```typescript
import { createCarrier, CarrierType, ServiceLevel } from './src';

// Create a UPS carrier instance
const ups = createCarrier(CarrierType.UPS);

// Prepare a rate request
const request = {
  origin: {
    streetLines: ['123 Main St'],
    city: 'San Francisco',
    stateOrProvince: 'CA',
    postalCode: '94105',
    countryCode: 'US',
  },
  destination: {
    streetLines: ['456 Market St'],
    city: 'New York',
    stateOrProvince: 'NY',
    postalCode: '10001',
    countryCode: 'US',
  },
  packages: [
    {
      length: 12,
      width: 8,
      height: 6,
      dimensionUnit: 'IN',
      weight: 5,
      weightUnit: 'LBS',
    },
  ],
};

// Get rates
try {
  const response = await ups.getRates(request);
  
  response.rates.forEach(rate => {
    console.log(`${rate.service}: $${rate.totalCharges}`);
    console.log(`  Delivery: ${rate.transitDays} days`);
  });
} catch (error) {
  if (error instanceof CarrierError) {
    console.error(`Error: ${error.code} - ${error.message}`);
    console.error(`Retryable: ${error.retryable}`);
  }
}
```

### Request Specific Service Level

```typescript
const request = {
  // ... same as above
  serviceLevel: ServiceLevel.NEXT_DAY,
};

const response = await ups.getRates(request);
```

### Multi-Carrier Rate Shopping

```typescript
import { getRatesFromMultipleCarriers, CarrierType } from './src';

const response = await getRatesFromMultipleCarriers(request, [
  CarrierType.UPS,
  // CarrierType.FEDEX, // Future
  // CarrierType.USPS,  // Future
]);

// All rates from all carriers
console.log(`Found ${response.rates.length} total rates`);
```

## 🔧 Authentication

### UPS OAuth 2.0

The service implements OAuth 2.0 client credentials flow with:

- **Token Caching**: Tokens are cached in memory and reused while valid
- **Automatic Refresh**: Expired tokens are refreshed transparently
- **401 Retry**: Auth errors trigger one automatic token refresh + retry
- **Expiry Buffer**: Tokens are refreshed 5 minutes before actual expiry

Authentication is completely transparent to callers:

```typescript
// You never need to manage tokens manually
const response = await ups.getRates(request);
```

## 🛡️ Error Handling

All errors extend `CarrierError` and include:

```typescript
interface CarrierError {
  code: ErrorCode;           // Machine-readable error code
  message: string;           // Human-readable message
  carrier?: string;          // Which carrier (UPS, FedEx, etc.)
  statusCode?: number;       // HTTP status code
  retryable: boolean;        // Can this be retried?
  details?: unknown;         // Additional error context
}
```

### Error Types

| Error Type | When It Occurs | Retryable |
|------------|----------------|-----------|
| `ValidationError` | Invalid request data | No |
| `AuthenticationError` | Auth failure | No |
| `APIError` | Carrier API error (4xx/5xx) | 5xx only |
| `RateLimitError` | Too many requests | Yes |
| `NetworkError` | Timeout, connection failure | Yes |

### Error Handling Example

```typescript
try {
  const response = await ups.getRates(request);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
    // Implement retry logic
  } else if (error instanceof ValidationError) {
    console.log('Invalid request:', error.details);
    // Fix the request
  } else if (error instanceof CarrierError && error.retryable) {
    console.log('Retryable error, will retry...');
    // Implement retry with backoff
  }
}
```

## ✅ Testing

### Integration Tests

The test suite uses stubbed HTTP responses to verify:

1. **Request Building**: Domain models → Carrier API format
2. **Response Parsing**: Carrier API format → Domain models
3. **Auth Lifecycle**: Token acquisition, caching, refresh
4. **Error Handling**: All error paths produce correct error types

```bash
npm test
```

### Test Coverage

- ✅ Successful auth token acquisition
- ✅ Token caching and reuse
- ✅ Token refresh on expiry
- ✅ Single rate quote parsing
- ✅ Multiple rate quotes parsing
- ✅ Service-specific requests
- ✅ Multi-package requests
- ✅ Validation errors
- ✅ API errors (400, 401, 429, 500, 503)
- ✅ Network errors (timeout, connection refused)
- ✅ Malformed response handling
- ✅ Auth retry on 401

## 🔮 Adding a New Carrier

Adding FedEx, USPS, or any carrier requires 4 steps:

### 1. Create Carrier-Specific Types

```typescript
// src/carriers/fedex/types.ts
export interface FedExRateRequest { /* ... */ }
export interface FedExRateResponse { /* ... */ }
```

### 2. Implement AuthClient

```typescript
// src/carriers/fedex/FedExAuthClient.ts
export class FedExAuthClient extends AuthClient {
  async getAccessToken(): Promise<string> { /* ... */ }
  async refreshToken(): Promise<void> { /* ... */ }
}
```

### 3. Implement Service

```typescript
// src/carriers/fedex/FedExRatingService.ts
export class FedExRatingService {
  async getRates(request: RateRequest): Promise<RateResponse> {
    // Convert RateRequest → FedExRateRequest
    // Call FedEx API
    // Convert FedExRateResponse → RateResponse
  }
}
```

### 4. Implement Carrier

```typescript
// src/carriers/fedex/FedExCarrier.ts
export class FedExCarrier extends Carrier {
  getName(): string { return 'FedEx'; }
  
  async getRates(request: RateRequest): Promise<RateResponse> {
    return this.ratingService.getRates(request);
  }
}
```

### 5. Register in Factory

```typescript
// src/index.ts
export enum CarrierType {
  UPS = 'UPS',
  FEDEX = 'FEDEX',
}

export function createCarrier(type: CarrierType): Carrier {
  switch (type) {
    case CarrierType.UPS: return new UPSCarrier();
    case CarrierType.FEDEX: return new FedExCarrier();
  }
}
```

**No changes to existing UPS code required!**

## 🚧 Future Enhancements

Given more time, I would add:

### 1. Retry Logic with Exponential Backoff

```typescript
class RetryableHTTPClient {
  async request(config, options: { maxRetries: 3, backoff: 'exponential' }) {
    // Automatic retry for network errors and 5xx
  }
}
```

### 2. Request/Response Logging

```typescript
class Logger {
  logRequest(carrier, operation, request);
  logResponse(carrier, operation, response, duration);
  logError(carrier, operation, error);
}
```

### 3. Metrics and Monitoring

```typescript
// Track success/error rates, latencies per carrier
metrics.increment('carrier.request', { carrier: 'UPS', operation: 'getRates' });
metrics.timing('carrier.latency', duration, { carrier: 'UPS' });
```

### 4. Rate Limiting (Client-Side)

```typescript
// Prevent hitting carrier rate limits
class RateLimiter {
  async throttle(carrier: string, operation: string);
}
```

### 5. Caching Layer

```typescript
// Cache rates for identical requests (with TTL)
class RateCache {
  async get(request: RateRequest): Promise<RateResponse | null>;
  async set(request: RateRequest, response: RateResponse, ttl: number);
}
```

### 6. Additional Operations

- Label generation
- Shipment tracking
- Address validation
- Pickup scheduling

### 7. Webhook Support

```typescript
// Handle carrier webhooks (tracking updates, etc.)
abstract class Carrier {
  abstract handleWebhook(payload: unknown): Promise<WebhookResult>;
}
```

## 📚 API Reference

### Domain Models

#### `RateRequest`
```typescript
{
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel?: ServiceLevel;
  shipDate?: Date;
}
```

#### `RateResponse`
```typescript
{
  rates: Rate[];
  requestId?: string;
}
```

#### `Rate`
```typescript
{
  carrier: string;
  service: string;
  serviceLevel: ServiceLevel;
  totalCharges: number;
  currency: string;
  estimatedDeliveryDate?: Date;
  transitDays?: number;
  deliveryGuarantee?: boolean;
}
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Note**: This service requires valid carrier API credentials. UPS Developer Portal: https://developer.ups.com# carrier-intergration-service-backend
