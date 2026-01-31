# Authentication Implementation

This Go API includes comprehensive authentication with multiple strategies.

## Features

- **OAuth Providers**: Google and GitHub authentication
- **Local Authentication**: Username/password registration and login
- **Password Security**: Bcrypt hashing for local accounts
- **Session Management**: Secure cookie-based sessions stored in MongoDB
- **Authentication Middleware**: Protect routes with `RequireAuth` or `OptionalAuth`
- **User Management**: Automatic user creation and updates from OAuth providers

## Setup

### 1. Install Dependencies

```bash
go mod tidy
```

### 2. Configure OAuth Providers

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:8080/auth/callback/google`
4. Copy Client ID and Client Secret

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:8080/auth/callback/github`
4. Copy Client ID and Client Secret

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following variables:
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET` (use a random string in production)

## API Endpoints

### Local Authentication Routes

- **POST /auth/register** - Register with email/password
- **POST /auth/login** - Login with email/password
- **GET /auth/logout** - Logout and clear session

### OAuth Routes

- **GET /auth/google** - Initiate Google OAuth login
- **GET /auth/github** - Initiate GitHub OAuth login
- **GET /auth/callback/google** - Google OAuth callback
- **GET /auth/callback/github** - GitHub OAuth callback

### Protected Routes

- **GET /api/me** - Get current authenticated user (requires auth)

### Existing Routes

- **GET /health** - Health check (public)
- **GET /api/members** - List all members (requires auth)
- **GET /api/classes** - List all classes (requires auth)

## Usage Flows

### Local Authentication Flow

1. **Register**: POST to `/auth/register` with email, password, and name
2. **Login**: POST to `/auth/login` with email and password
3. **Session**: A session cookie is created and stored in MongoDB
4. **Access**: Use the session cookie to access protected routes
5. **Logout**: GET `/auth/logout` to end the session

### OAuth Flow

1. **Login**: Navigate to `/auth/google` or `/auth/github` to initiate OAuth
2. **Callback**: User is redirected to the provider's login page, then back to your app
3. **Session**: A session cookie is created and stored in MongoDB
4. **Access**: Use the session cookie to access protected routes
5. **Logout**: GET `/auth/logout` to end the session

## Security Features

- State token validation to prevent CSRF attacks (OAuth)
- Bcrypt password hashing with salt (Local auth)
- HttpOnly cookies to prevent XSS attacks
- Session expiration (7 days by default)
- Automatic cleanup of expired sessions
- Password strength validation (minimum 8 characters)
- Email format validation
- Protection against user enumeration (generic error messages)

## Database Collections

The OAuth implementation uses two MongoDB collections:

- **users**: Stores user profiles from OAuth providers
- **sessions**: Stores active user sessions

## Examples: Testing Authentication

### Local Authentication

```bash
# Register a new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}' \
  -c cookies.txt

# Access protected route with session
curl http://localhost:8080/api/me -b cookies.txt

# Logout
curl http://localhost:8080/auth/logout -b cookies.txt
```

### OAuth Authentication

```bash
# Start the server
go run main.go

# In your browser, visit:
# http://localhost:8080/auth/google
# or
# http://localhost:8080/auth/github

# After authentication, you'll be redirected to:
# http://localhost:8080/api/me

# This will show your user information
```

## Production Considerations

1. Set `Secure: true` in cookie options when using HTTPS
2. Use a strong random `SESSION_SECRET`
3. Configure appropriate CORS settings
4. Consider adding rate limiting
5. Implement refresh token rotation for enhanced security
6. Add proper logging and monitoring
