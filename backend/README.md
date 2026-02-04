# Go REST API with MongoDB - Multi-Club Gym CRM

A comprehensive REST API built with Go for managing multi-location gym/wellness clubs, featuring member management, instructor assignments, class scheduling, and more.

## Features

- **RESTful API** endpoints for all entities (CRUD operations)
- **Multi-Club Support**: Manage multiple gym locations
- **Member Management**: Complete member lifecycle tracking with club assignment
- **Instructor Management**: Assign instructors to multiple clubs
- **Class Scheduling**: Create and manage fitness classes
- **Restaurant Management**: On-site dining facilities
- **Office Management**: Co-working space bookings
- **User Management**: Staff/admin account system
- **Multiple authentication methods:**
  - Local authentication (email/password with bcrypt)
  - OAuth 2.0 (Google and GitHub)
  - Refresh token system (1-hour access, 7-day refresh)
- **Session management with secure cookies**
- **Protected and public routes** with middleware
- Graceful server shutdown
- Health check endpoint
- Environment variable configuration
- Database seeding scripts for development

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

### Seeding the Database

For development, you can populate the database with sample data:

```bash
cd scripts
./seed.sh
```

Or run directly with Go:
```bash
cd scripts
go run seed_database.go
```

This will create:
- 5 gym clubs with full addresses and contact info
- 15 instructors with various specialties (assigned to multiple clubs)
- 100 members with realistic membership data (assigned to clubs)
- Sample classes linked to instructors and clubs

⚠️ **Note:** The seed script **clears existing data** before inserting sample data. Do not run in production!

See [scripts/README.md](scripts/README.md) for more details.

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

Returns access token and refresh token.

#### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token-here"
}
```

Returns new access token. Access tokens expire after 1 hour, refresh tokens after 7 days.

#### OAuth Login
- `GET /auth/google` - Login with Google
- `GET /auth/github` - Login with GitHub
- `GET /auth/callback/google` - Google OAuth callback
- `GET /auth/callback/github` - GitHub OAuth callback

#### Get Current User
```bash
GET /api/me
Authorization: Bearer <access-token>
```

#### Logout
```bash
POST /auth/logout
Authorization: Bearer <access-token>
```

### Member Endpoints

All member endpoints require authentication.

```bash
# Get all members
GET /api/members

# Get single member
GET /api/members/{id}

# Create member
POST /api/members
Content-Type: application/json
{
  "club_id": "club-id-here",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "membership_type": "Premium",
  "status": "active",
  "auto_renewal": true,
  "emergency_contact": "Jane Doe - 555-5678"
}

# Update member
PUT /api/members/{id}
Content-Type: application/json
{ ... same as create ... }

# Delete member
DELETE /api/members/{id}
```

### Club Endpoints

```bash
# Get all clubs
GET /api/clubs

# Get single club
GET /api/clubs/{id}

# Create club
POST /api/clubs
Content-Type: application/json
{
  "name": "Downtown Fitness",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "phone": "555-1234",
  "email": "downtown@gymcrm.com",
  "active": true
}

# Update club
PUT /api/clubs/{id}

# Delete club
DELETE /api/clubs/{id}
```

### Instructor Endpoints

```bash
# Get all instructors
GET /api/instructors

# Get single instructor
GET /api/instructors/{id}

# Create instructor with multi-club assignment
POST /api/instructors
Content-Type: application/json
{
  "name": "Sarah Smith",
  "email": "sarah@example.com",
  "phone": "555-1234",
  "specialty": "Yoga",
  "bio": "Certified yoga instructor with 10 years experience",
  "active": true,
  "club_ids": ["club-id-1", "club-id-2"]  // Array of club IDs
}

# Update instructor
PUT /api/instructors/{id}

# Delete instructor
DELETE /api/instructors/{id}
```

### Class Endpoints

```bash
# Get all classes
GET /api/classes

# Get single class
GET /api/classes/{id}

# Create class
POST /api/classes
Content-Type: application/json
{
  "name": "Morning Yoga",
  "instructor_id": "instructor-id-here",
  "club_id": "club-id-here",
  "schedule": "Mon/Wed/Fri 9:00 AM",
  "capacity": 20
}

# Update class
PUT /api/classes/{id}

# Delete class
DELETE /api/classes/{id}
```

### Restaurant Endpoints

```bash
GET /api/restaurants
POST /api/restaurants
GET /api/restaurants/{id}
PUT /api/restaurants/{id}
DELETE /api/restaurants/{id}
```

### Office Endpoints

```bash
GET /api/offices
POST /api/offices
GET /api/offices/{id}
PUT /api/offices/{id}
DELETE /api/offices/{id}
```

### User Endpoints

```bash
GET /api/users
POST /api/users
GET /api/users/{id}
PUT /api/users/{id}
DELETE /api/users/{id}
```

### Health Check
```bash
GET /health
```

Public endpoint, returns server status.

## Project Structure

```
backend/
├── main.go                   # Application entry point and server setup
├── database/
│   └── database.go           # MongoDB connection and configuration
├── handlers/
│   ├── local_auth.go         # Email/password authentication
│   ├── oauth.go              # Google/GitHub OAuth handlers
│   ├── member_handlers.go    # Member CRUD operations
│   ├── club_handlers.go      # Club management
│   ├── instructor_handlers.go # Instructor management (multi-club)
│   ├── class_handlers.go     # Class scheduling
│   ├── restaurant_handlers.go # Restaurant management
│   ├── office_handlers.go    # Office management
│   └── user_handlers.go      # User account management
├── models/
│   ├── user.go               # Staff/admin user model
│   ├── member.go             # Gym member model
│   ├── club.go               # Club location model
│   ├── instructor.go         # Instructor model (with club_ids array)
│   ├── class.go              # Fitness class model
│   ├── restaurant.go         # Restaurant model
│   └── office.go             # Office model
├── middleware/
│   └── auth.go               # Authentication middleware
├── scripts/
│   ├── seed_database.go      # Database seeding script
│   ├── seed.sh               # Shell wrapper for seeding
│   └── README.md             # Scripts documentation
├── go.mod                    # Go module dependencies
├── go.sum                    # Dependency checksums
├── .env.example              # Example environment variables
└── README.md                 # This file
```

## Testing with curl

Here's a complete workflow to test the API:

1. Check health (public endpoint):
```bash
curl http://localhost:8080/health
```

2. Register a new user:
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepass123","name":"Admin User"}'
```

3. Login to get access token:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepass123"}'
```

Save the `access_token` and `refresh_token` from the response.

4. Use the access token for authenticated requests:
```bash
# Get all clubs
curl http://localhost:8080/api/clubs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get all members
curl http://localhost:8080/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get all instructors
curl http://localhost:8080/api/instructors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

5. Create a new club:
```bash
curl -X POST http://localhost:8080/api/clubs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Fitness",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "phone": "555-1234",
    "email": "downtown@gymcrm.com",
    "active": true
  }'
```

6. Refresh token when access token expires:
```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

**Note:** 
- All `/api/*` endpoints require authentication via Bearer token
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Without a valid token, you'll receive a `401 Unauthorized` response

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
