# Go REST API with MongoDB and OAuth

A simple REST API built with Go that receives API calls, stores data in MongoDB, and includes OAuth 2.0 authentication.

## Features

- RESTful API endpoints for CRUD operations
- MongoDB integration for data persistence
- **Multiple authentication methods:**
  - Local authentication (email/password with bcrypt)
  - OAuth 2.0 (Google and GitHub)
- **Session management with secure cookies**
- **Protected and public routes**
- Graceful server shutdown
- Health check endpoint
- Environment variable configuration

## Prerequisites

- Go 1.21 or higher
- MongoDB (running locally or accessible via connection string)

## Installation

1. Install dependencies:
```bash
go mod download
```

2. Make sure MongoDB is running. If using local MongoDB:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run manually
mongod --dbpath /path/to/your/data/directory
```

## Configuration

The application can be configured using environment variables:

### Database Configuration
- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DATABASE` - Database name (default: `goapi`)

### OAuth Configuration
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `OAUTH_REDIRECT_URL` - Base redirect URL (default: `http://localhost:8080/auth/callback`)
- `SESSION_SECRET` - Secret key for session management

**See [OAUTH.md](OAUTH.md) for detailed OAuth setup instructions.**

## Running the Application

Start the server:
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication Endpoints

#### Register (Local Auth)
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

Example with curl:
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123","name":"John Doe"}'
```

#### Login (Local Auth)
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}
```

Example with curl:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}' \
  -c cookies.txt
```

#### OAuth Login
- `GET /auth/google` - Login with Google
- `GET /auth/github` - Login with GitHub

#### Get Current User
```bash
GET /api/me
```

Example with curl (using saved cookies from login):
```bash
curl http://localhost:8080/api/me -b cookies.txt
```

#### Logout
```bash
GET /auth/logout
```

### Health Check
```bash
GET /health
```

## Project Structure

```
.
├── main.go              # Application entry point and server setup
├── database/
│   └── database.go      # MongoDB connection and configuration
├── handlers/
│   └── handlers.go      # HTTP request handlers
├── models/
│   └── item.go          # Data models
├── go.mod               # Go module dependencies
└── README.md            # This file
```

## Testing with curl

Here's a complete workflow to test the API:

1. Check health (public endpoint):
```bash
curl http://localhost:8080/health
```

2. Register or login to get a session:
```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123","name":"Test User"}' \
  -c cookies.txt

# OR Login if already registered
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}' \
  -c cookies.txt
```

3. Get all members (requires authentication):
```bash
curl http://localhost:8080/api/members -b cookies.txt
```

4. Get all classes (requires authentication):
```bash
curl http://localhost:8080/api/classes -b cookies.txt
```

**Note:** All `/api/*` endpoints require authentication. Without a valid session cookie, you'll receive a `401 Unauthorized` response.

## Testing

This project includes comprehensive automated tests for all components.

### Running Tests

#### Quick Start - Run All Tests
```bash
# Using the test script
./run_tests.sh

# Or using Make
make test
```

#### Run Unit Tests Only
Unit tests run quickly and don't require MongoDB to be running:

```bash
# Using go test
go test -short -v ./...

# Using Make
make test-unit
```

#### Run Integration Tests
Integration tests require MongoDB to be running locally:

```bash
# Start MongoDB first
brew services start mongodb-community

# Run integration tests
make test-integration

# Or run all tests (including integration)
go test -v ./...
```

#### Run Tests with Coverage
```bash
# Generate coverage report
make test-coverage

# This will:
# - Run all unit tests
# - Generate coverage.out file
# - Display coverage summary in terminal
# - Create coverage.html for detailed view
```

View the HTML coverage report:
```bash
open coverage.html
```

### Test Organization

The test suite is organized by package:

- **config/oauth_test.go** - OAuth configuration tests
- **handlers/handlers_test.go** - CRUD handler tests
- **handlers/oauth_test.go** - OAuth flow tests
- **middleware/auth_test.go** - Authentication middleware tests
- **database/database_test.go** - Database connection tests
- **models/models_test.go** - Data model tests

### Test Types

#### Unit Tests
Run independently without external dependencies:
- Configuration initialization
- Token generation
- Request/response handling
- Model creation

#### Integration Tests
Require MongoDB connection (skipped in short mode):
- Database operations
- Session management
- Full authentication flow
- Middleware with real database

### Makefile Commands

```bash
make help              # Show all available commands
make test              # Run all tests
make test-unit         # Run unit tests only
make test-integration  # Run integration tests only
make test-coverage     # Run tests with coverage report
make run               # Run the application
make build             # Build the binary
make clean             # Clean test artifacts
make fmt               # Format code
make vet               # Run go vet
```

### Continuous Integration

To run tests in CI/CD pipelines:

```bash
# Run only unit tests (no MongoDB required)
go test -short -v ./...

# Or with coverage
go test -short -coverprofile=coverage.out ./...
```

### Writing New Tests

When adding new features, follow these patterns:

1. **Unit tests**: Test individual functions without dependencies
2. **Integration tests**: Use `testing.Short()` to skip when MongoDB isn't available
3. **Table-driven tests**: Use subtests with `t.Run()` for multiple scenarios
4. **Cleanup**: Use `defer` to clean up resources

Example:
```go
func TestMyFeature(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration test in short mode")
    }
    
    t.Run("successful case", func(t *testing.T) {
        // Test code here
    })
    
    t.Run("error case", func(t *testing.T) {
        // Test code here
    })
}
```

## Graceful Shutdown

The server supports graceful shutdown. Press `Ctrl+C` to stop the server, and it will:
1. Stop accepting new connections
2. Wait for existing requests to complete (up to 10 seconds)
3. Close the database connection
4. Exit cleanly
