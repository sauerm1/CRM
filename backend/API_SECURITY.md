# API Authentication Requirements

## Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| POST | `/auth/register` | Register new user with email/password |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/google` | Initiate Google OAuth login |
| GET | `/auth/github` | Initiate GitHub OAuth login |
| GET | `/auth/callback/google` | Google OAuth callback |
| GET | `/auth/callback/github` | GitHub OAuth callback |

## Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current authenticated user |
| GET | `/api/members` | List all members |
| GET | `/api/classes` | List all classes |
| GET | `/auth/logout` | Logout (clears session) |

## Authentication Flow

### Option 1: Email/Password
1. Register: `POST /auth/register` with `{ email, password, name }`
2. Login: `POST /auth/login` with `{ email, password }`
3. Session cookie is automatically set
4. Use cookie for all subsequent API calls

### Option 2: OAuth (Google/GitHub)
1. Navigate to `/auth/google` or `/auth/github`
2. Complete OAuth flow with provider
3. Session cookie is automatically set
4. Use cookie for all subsequent API calls

## Error Responses

### 401 Unauthorized
Returned when accessing protected endpoints without authentication:
```json
{
  "error": "Authentication required"
}
```

**Common causes:**
- No session cookie present
- Invalid session token
- Expired session (7-day expiration)

### Example: Accessing Protected Endpoint Without Auth

```bash
# This will return 401 Unauthorized
curl http://localhost:8080/api/members

# Response:
# {"error":"Authentication required"}
```

### Example: Accessing Protected Endpoint With Auth

```bash
# First login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}' \
  -c cookies.txt

# Then access API with cookies
curl http://localhost:8080/api/members -b cookies.txt

# Response:
# [{"id":"...","first_name":"...","last_name":"...","email":"..."}]
```

## Session Management

- **Duration:** 7 days
- **Storage:** MongoDB sessions collection
- **Cookie Name:** `session_token`
- **Cookie Attributes:** HttpOnly, SameSite=Lax
- **Automatic Cleanup:** Expired sessions are deleted on access attempt

## Testing Authentication

### Test Unauthenticated Access (Should Fail)
```bash
curl -v http://localhost:8080/api/members
# Expected: 401 Unauthorized
```

### Test Authenticated Access (Should Succeed)
```bash
# 1. Login first
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  -c cookies.txt

# 2. Access API
curl http://localhost:8080/api/members -b cookies.txt
# Expected: 200 OK with members array
```

### Test Session Expiration
```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  -c cookies.txt

# Wait 7+ days or manually delete session from MongoDB

# Try to access API
curl http://localhost:8080/api/members -b cookies.txt
# Expected: 401 Unauthorized with "Session expired"
```

## Implementation Details

All protected routes use the `RequireAuth` middleware which:
1. Checks for session cookie
2. Validates session token in MongoDB
3. Checks session expiration
4. Retrieves user from database
5. Adds user to request context
6. Allows request to proceed OR returns 401

Public routes bypass this middleware entirely.
