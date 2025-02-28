# Hasura Tapis Auth Webhook

A webhook authentication service that enables seamless integration between Hasura GraphQL Engine and Tapis authentication system. This service validates Tapis JWT tokens and transforms them into Hasura session variables for role-based access control.

## Features

- 🔐 JWT token validation using Tapis public key
- 🚀 Role-based access control mapping
- 📋 Session variable management
- ⚡ Performance optimization with caching
- 🛡️ TypeScript for type safety
- 🐳 Docker support
- 🧪 Comprehensive test suite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional)
- A running Hasura instance
- Tapis OAuth2 credentials

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/hasura-tapis-auth-webhook.git
cd hasura-tapis-auth-webhook
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

### Environment Variables

| Variable           | Description                 | Required | Default                               |
| ------------------ | --------------------------- | -------- | ------------------------------------- |
| PORT               | Server port                 | No       | 3000                                  |
| TAPIS_JWKS_URI     | URI for Tapis JWKS endpoint | No       | https://tacc.tapis.io/v3/tenants/tacc |
| TAPIS_TOKEN_ISSUER | Expected token issuer       | No       | https://tacc.tapis.io/v3/tokens       |
| NODE_ENV           | Environment mode            | No       | development                           |

### Hasura Configuration

Add these environment variables to your Hasura instance:

```bash
HASURA_GRAPHQL_AUTH_HOOK=http://your-webhook-url:3000/auth-webhook
HASURA_GRAPHQL_AUTH_HOOK_MODE=POST
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Manual Testing

Use the provided test script:

```bash
# Make script executable
chmod +x test-webhook.sh

# Run test (requires TACC_ACCESS_TOKEN environment variable)
./test-webhook.sh
```

## Docker

### Building the Image

```bash
docker build -t hasura-tapis-auth-webhook .
```

### Running the Container

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e TAPIS_JWKS_URI=https://tacc.tapis.io/v3/tenants/tacc \
  -e TAPIS_TOKEN_ISSUER=https://tacc.tapis.io/v3/tokens \
  hasura-tapis-auth-webhook
```

### Using GitHub Container Registry

```bash
# Pull the image
docker pull ghcr.io/your-username/hasura-tapis-auth-webhook:latest

# Run the container
docker run -p 3000:3000 ghcr.io/your-username/hasura-tapis-auth-webhook:latest
```

## API Documentation

### Authentication Webhook Endpoint

`POST /auth-webhook`

#### Request Headers

The original request headers from Hasura will be forwarded.

#### Response Format

```json
{
  "X-Hasura-Role": "user",
  "X-Hasura-User-Id": "username",
  "X-Hasura-Username": "username",
  "X-Hasura-Tenant-Id": "tacc",
  "Cache-Control": "max-age=600"
}
```

### Health Check Endpoint

`GET /health`

Returns the service health status.

## CI/CD

The project uses GitHub Actions for:

- Running tests
- Linting code
- Building Docker image
- Publishing to GitHub Container Registry

## Security Considerations

- Always use HTTPS in production
- Regularly update dependencies
- Monitor failed authentication attempts
- Keep authentication tokens secure
- Use appropriate CORS settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow ESLint rules
- Format code using Prettier
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
