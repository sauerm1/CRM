# Postman Collection Guide

This guide explains how to use the Postman collection to test all API endpoints.

## Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **Go_API.postman_collection.json**
4. Click **Import**

### 2. Setup Environment (Optional)

The collection uses a default base URL of `http://localhost:8080`. To customize:

1. Click **Environments** in the sidebar
2. Create a new environment named "Go API Local"
3. Add variables:
   - `baseUrl` = `http://localhost:8080`
   - `session_token` = (leave empty - auto-populated on login)
   - `item_id` = (leave empty - auto-populated on item creation)
   - `user_id` = (leave empty - auto-populated on registration/login)
4. Select this environment from the dropdown (top right)

### 3. Enable Cookie Management

**Important:** Postman must be able to manage cookies for authentication to work.

1. Go to **Settings** (gear icon)
2. Navigate to **General** tab
3. Ensure **Automatically follow redirects** is ON
4. Ensure **Send cookies** is ON

### 4. Start Your Backend Server

```bash
cd backend
go run main.go
```

Ensure the server is running on `http://localhost:8080` before testing.

## Testing Workflow

### Authentication Flow

#### Option 1: Register a New User

1. Open **Authentication → Register (Email/Password)**
2. Update the request body with your details:
   ```json
   {
       "email": "your@email.com",
       "password": "yourpassword123",
       "name": "Your Name"
   }
   ```
3. Click **Send**
4. ✅ Session cookie is automatically stored

#### Option 2: Login with Existing User

1. Open **Authentication → Login (Email/Password)**
2. Update credentials:
   ```json
   {
       "email": "your@email.com",
       "password": "yourpassword123"
   }
   ```
3. Click **Send**
4. ✅ Session cookie is automatically stored

#### Verify Authentication

1. Open **Authentication → Get Current User**
2. Click **Send**
3. Should return your user information

### Logout

1. Open **Authentication → Logout**
2. Click **Send**
3. ✅ Session cookie is automatically cleared

## Features

### Automatic Session Management

The collection includes scripts that automatically:
- ✅ Store session cookies after login/register
- ✅ Clear session cookies on logout
- ✅ Store item IDs for subsequent requests
- ✅ Store user IDs

### Variables Used

| Variable | Description | Auto-populated |
|----------|-------------|----------------|
| `baseUrl` | API base URL | No (default: localhost:8080) |
| `session_token` | Session authentication token | Yes (on login/register) |
| `item_id` | Last created item ID | Yes (on item creation) |
| `user_id` | Current user ID | Yes (on login/register) |

### Request Organization

Requests are organized into folders:

1. **Health Check** - Server status
2. **Authentication** - Registration, login, logout, OAuth
3. **Members (CRM)** - Member management operations
4. **Classes** - Class scheduling and enrollment

## OAuth Testing

OAuth flows (Google, GitHub) cannot be fully tested in Postman because they require browser redirects.

To test OAuth:

1. Open **Authentication → Google OAuth Login** or **GitHub OAuth Login**
2. Right-click the request → **Copy → Copy URL**
3. Paste the URL in your browser
4. Complete the OAuth flow in the browser
5. Session will be stored in browser cookies

Alternatively, use the React frontend to test OAuth flows.

## Troubleshooting

### 401 Unauthorized Error

**Problem:** Getting 401 errors on protected endpoints

**Solutions:**
1. Ensure you've logged in first (Register or Login)
2. Check that cookies are enabled in Postman settings
3. Verify the backend server is running
4. Check the **Cookies** tab in Postman to see if `session_token` exists

### Session Not Persisting

**Problem:** Session doesn't work between requests

**Solutions:**
1. Ensure **Send cookies** is enabled in Postman Settings
2. Make sure you're using the same workspace/collection
3. Check that the domain matches (localhost:8080)
4. Manually add cookie if needed:
   - Go to **Cookies** (below the Send button)
   - Add cookie: `session_token` with the value from login response

### Cannot Connect to Server

**Problem:** Connection refused or timeout

**Solutions:**
1. Verify backend is running: `cd backend && go run main.go`
2. Check the correct port (default: 8080)
3. Verify `baseUrl` variable is correct
4. Check MongoDB is running

## Manual Cookie Management (Advanced)

If automatic cookie management doesn't work, you can manually manage cookies:

### Get Session Token

After login, look at the response headers:
```
Set-Cookie: session_token=abc123...; HttpOnly; Path=/
```

### Add Cookie to Requests

1. Go to **Cookies** (below Send button)
2. Click **Add Cookie**
3. Add: `session_token=abc123...`

Or use the **Cookie** header:
```
Cookie: session_token=abc123...
```

## Testing Scenarios

### Complete Flow Test

1. ✅ Health Check
2. ✅ Register new user
3. ✅ Get current user (verify auth)
4. ✅ Create item
5. ✅ Get all items
6. ✅ Get item by ID
7. ✅ Update item
8. ✅ Get item by ID (verify update)
9. ✅ Delete item
10. ✅ Get all items (verify deletion)
11. ✅ Logout

### Authentication Test

1. ✅ Register with new email
2. ✅ Logout
3. ✅ Login with same credentials
4. ✅ Get current user
5. ✅ Logout

### Error Handling Test

1. ❌ Try to access `/api/members` without authentication (should get 401)
2. ❌ Login with wrong password (should get error)
3. ❌ Get non-existent member ID (should get 404)

## Environment Setup Examples

### Development
```
baseUrl: http://localhost:8080
```

### Staging
```
baseUrl: https://staging.yourapi.com
```

### Production
```
baseUrl: https://api.yourapi.com
```

## Additional Resources

- [Backend README](README.md) - Full API documentation
- [OAuth Setup](OAUTH.md) - OAuth configuration
- [API Security](API_SECURITY.md) - Authentication details
