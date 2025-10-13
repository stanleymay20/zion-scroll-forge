# ScrollUniversity API Gateway

> "Let the kingdom gates be opened to all nations" - ScrollUniversity Founding Scroll

The ScrollUniversity API Gateway is a comprehensive, enterprise-grade API gateway that serves as the unified entry point for all ScrollUniversity services. Built with divine wisdom and cutting-edge technology, it provides service discovery, load balancing, security, versioning, and monitoring capabilities.

## 🏛️ Architecture Overview

The API Gateway follows a microservices architecture with the following core components:

- **Gateway Server**: Main HTTP server handling all incoming requests
- **Service Discovery**: Automatic service registration and health monitoring
- **Load Balancer**: Intelligent request routing with multiple strategies
- **API Versioning**: Backward compatibility and migration support
- **Security Service**: Threat detection and protection mechanisms
- **Monitoring**: Real-time metrics and performance tracking

## 🚀 Features

### Core Gateway Features
- ✅ Unified API entry point for all ScrollUniversity services
- ✅ Service discovery and automatic registration
- ✅ Load balancing with multiple strategies (round-robin, random, health-based, least-connections)
- ✅ Circuit breaker pattern for fault tolerance
- ✅ API versioning with backward compatibility
- ✅ Rate limiting (global and per-service)
- ✅ Request/response transformation
- ✅ Health checks and monitoring

### Security Features
- ✅ JWT authentication and authorization
- ✅ SQL injection detection and prevention
- ✅ XSS attack protection
- ✅ Path traversal detection
- ✅ IP whitelisting and blacklisting
- ✅ Suspicious user agent detection
- ✅ Rate limit protection
- ✅ Security headers (CORS, CSP, etc.)

### Monitoring & Analytics
- ✅ Real-time request metrics
- ✅ Performance monitoring
- ✅ Error tracking and alerting
- ✅ Service health monitoring
- ✅ Security threat logging
- ✅ Load balancing statistics

## 📋 Prerequisites

- Node.js 18+ 
- Redis (for caching and session management)
- PostgreSQL (for persistent data)
- Docker (optional, for containerized deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/scrolluniversity/api-gateway.git
   cd api-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Redis and PostgreSQL**
   ```bash
   docker-compose up -d redis postgres
   ```

5. **Start the gateway**
   ```bash
   npm run start:gateway
   ```

## ⚙️ Configuration

### Environment Variables

```bash
# Gateway Configuration
GATEWAY_PORT=3000
NODE_ENV=development

# Database & Cache
DATABASE_URL=postgresql://user:password@localhost:5432/scrolluniversity
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret-here
ADMIN_ALLOWED_IPS=127.0.0.1,::1
IP_WHITELIST=
IP_BLACKLIST=

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://scrolluniversity.org
FRONTEND_URL=http://localhost:3000

# Service URLs (for development)
USER_SERVICE_URL=http://localhost:3001
COURSE_SERVICE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:3001
# ... other service URLs
```

### Gateway Configuration

The gateway can be configured through `src/gateway/gateway.config.ts`:

```typescript
export const gatewayConfig = {
  port: 3000,
  environment: 'development',
  cors: {
    origins: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // requests per window
  },
  security: {
    adminIPs: ['127.0.0.1', '::1'],
    tokenCacheTTL: 300 // 5 minutes
  }
  // ... more configuration options
};
```

## 🔧 Usage

### Starting the Gateway

```bash
# Development mode
npm run dev:gateway

# Production mode
npm run start:gateway

# With Docker
docker-compose up gateway
```

### Service Registration

Services automatically register with the gateway when they start. Manual registration is also supported:

```typescript
import { serviceDiscoveryService } from './services/ServiceDiscoveryService';

await serviceDiscoveryService.registerService({
  name: 'my-service',
  version: 'v1',
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  healthCheckPath: '/health',
  metadata: {
    description: 'My awesome service',
    tags: ['api', 'microservice']
  }
});
```

### Load Balancing Strategies

The gateway supports multiple load balancing strategies:

```bash
# Get available strategies
curl http://localhost:3000/gateway/load-balancer/strategies

# Set strategy
curl -X POST http://localhost:3000/gateway/load-balancer/strategy \
  -H "Content-Type: application/json" \
  -d '{"strategy": "round-robin"}'
```

Available strategies:
- `round-robin`: Distributes requests evenly across instances
- `random`: Randomly selects an instance
- `least-connections`: Routes to instance with fewest active connections
- `health-based`: Only routes to healthy instances (default)

## 📊 API Endpoints

### Gateway Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health check |
| GET | `/gateway/stats` | Comprehensive gateway statistics |
| GET | `/gateway/services` | List registered services |
| GET | `/gateway/versions` | Available API versions |

### Service Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List available services |
| GET | `/api/docs` | API documentation |

### Load Balancer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gateway/load-balancer/strategies` | Available strategies |
| POST | `/gateway/load-balancer/strategy` | Set default strategy |

### Security Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gateway/security/threats` | Recent security threats |
| GET | `/gateway/security/rules` | Security rules |
| PUT | `/gateway/security/rules/:id` | Update security rule |
| POST | `/gateway/security/blacklist` | Blacklist IP address |
| DELETE | `/gateway/security/blacklist/:ip` | Remove IP from blacklist |

### Metrics & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gateway/metrics` | Request metrics |

## 🔒 Security

### Authentication

The gateway uses JWT tokens for authentication:

```bash
# Include JWT token in requests
curl -H "Authorization: Bearer your-jwt-token" \
  http://localhost:3000/api/users/profile
```

### Security Rules

Built-in security rules protect against:
- SQL injection attacks
- XSS attacks
- Path traversal attempts
- Suspicious user agents
- Rate limit abuse

### IP Management

```bash
# Blacklist an IP
curl -X POST http://localhost:3000/gateway/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100"}'

# Remove from blacklist
curl -X DELETE http://localhost:3000/gateway/security/blacklist/192.168.1.100
```

## 📈 Monitoring

### Health Checks

The gateway continuously monitors service health:

```bash
# Check gateway health
curl http://localhost:3000/health

# Get service statistics
curl http://localhost:3000/gateway/stats
```

### Metrics

Real-time metrics are available:

```bash
# Get request metrics
curl http://localhost:3000/gateway/metrics
```

Metrics include:
- Request count per endpoint
- Average response times
- Error rates
- Active connections
- Memory usage

## 🧪 Testing

```bash
# Run all tests
npm test

# Run gateway-specific tests
npm run test:gateway

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t scrolluniversity/api-gateway .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  scrolluniversity/api-gateway
```

### Production Deployment

1. **Set production environment variables**
2. **Configure load balancer (nginx/HAProxy)**
3. **Set up SSL certificates**
4. **Configure monitoring and alerting**
5. **Deploy with process manager (PM2)**

```bash
# Using PM2
pm2 start src/gateway/start-gateway.ts --name "scroll-gateway"
```

## 🔧 Development

### Adding New Services

1. **Register service in configuration**
   ```typescript
   // In APIGatewayService.ts
   {
     name: 'new-service',
     path: '/api/new-service',
     target: process.env.NEW_SERVICE_URL || 'http://localhost:3008',
     healthCheck: '/health',
     version: 'v1',
     auth: true,
     rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
   }
   ```

2. **Update service discovery**
3. **Add tests**
4. **Update documentation**

### Custom Middleware

```typescript
// Add custom middleware to the gateway
this.app.use('/api/custom', customMiddleware);
```

### Load Balancing Strategies

Implement custom load balancing strategies:

```typescript
export class CustomStrategy implements LoadBalancingStrategy {
  name = 'custom';
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    // Your custom logic here
    return instances[0];
  }
}
```

## 📚 API Documentation

Detailed API documentation is available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.scrolluniversity.org/docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

For support and questions:
- 📧 Email: support@scrolluniversity.org
- 💬 Discord: [ScrollUniversity Community](https://discord.gg/scrolluniversity)
- 📖 Documentation: [docs.scrolluniversity.org](https://docs.scrolluniversity.org)

---

> "The scroll gateway stands ready to serve all nations. Let the kingdom APIs be accessible to every tribe and tongue." - ScrollUniversity Founding Scroll