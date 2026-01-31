# Authentication Quick Reference

## Local Authentication (Email/Password)

### Register a New User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "created_at": "2026-01-30T10:00:00Z",
    "updated_at": "2026-01-30T10:00:00Z"
  },
  "message": "Registration successful"
}
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }' \
  -c cookies.txt
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "created_at": "2026-01-30T10:00:00Z",
    "updated_at": "2026-01-30T10:00:00Z"
  },
  "message": "Login successful"
}
```

### Access Protected Routes
```bash
# Get current user
curl http://localhost:8080/api/me -b cookies.txt
```

### Logout
```bash
curl http://localhost:8080/auth/logout -b cookies.txt
```

## OAuth Authentication

### Google OAuth
1. Navigate to: `http://localhost:8080/auth/google`
2. Authorize with Google
3. Redirected back with session cookie

### GitHub OAuth
1. Navigate to: `http://localhost:8080/auth/github`
2. Authorize with GitHub
3. Redirected back with session cookie

## Password Requirements

- **Minimum length:** 8 characters
- **Email format:** Must contain `@`
- **Hashing:** Bcrypt with default cost factor

## Security Features

✅ **Password Security**
- Bcrypt hashing with salt
- Passwords never returned in API responses
- Password strength validation

✅ **Session Security**
- HttpOnly cookies (prevents XSS)
- 7-day expiration
- Stored in MongoDB
- Automatic cleanup of expired sessions

✅ **Additional Security**
- CSRF protection for OAuth (state tokens)
- Generic error messages (prevents user enumeration)
- Email validation
- Secure cookie settings

## Error Responses

### Registration Errors
- `400 Bad Request` - Missing or invalid fields
- `409 Conflict` - Email already registered

### Login Errors
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid email or password

### Session Errors
- `401 Unauthorized` - No session cookie, invalid session, or expired session

## Testing with Postman

1. **Register:**
   - Method: POST
   - URL: `http://localhost:8080/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "testpass123",
       "name": "Test User"
     }
     ```

2. **Login:**
   - Method: POST
   - URL: `http://localhost:8080/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "testpass123"
     }
     ```
   - Note: Postman automatically saves cookies

3. **Access Protected Route:**
   - Method: GET
   - URL: `http://localhost:8080/api/me`
   - Cookies are automatically sent by Postman

## Database Structure

### Users Collection
```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "John Doe",
  "provider": "local",  // or "google", "github"
  "password": "$2a$10$...",  // only for local auth
  "picture": "...",  // only for OAuth
  "provider_id": "...",  // only for OAuth
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

### Sessions Collection
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "token": "random-session-token",
  "expires_at": ISODate("..."),
  "created_at": ISODate("...")
}
```
