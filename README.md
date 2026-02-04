# Gym CRM - Member Management System

A full-stack gym/wellness club CRM application with Go backend and React/Next.js frontend options, featuring OAuth 2.0 and local authentication.

## Project Structure

```
├── backend/              # Go REST API with MongoDB
│   ├── main.go
│   ├── handlers/
│   │   ├── oauth.go     # Authentication handlers
│   │   └── customers.go # Member CRUD handlers
│   ├── models/
│   │   └── item.go      # Member data model
│   ├── database/
│   ├── config/
│   └── middleware/
├── frontend/             # React web application (original)
│   ├── src/
│   ├── public/
│   └── package.json
├── frontend-nextjs/      # Next.js application (modern)
│   ├── app/
│   ├── lib/
│   ├── types/
│   └── package.json
├── mobile/               # React Native mobile app 📱 NEW
│   ├── src/
│   │   ├── api/         # Backend API integration
│   │   ├── navigation/  # App navigation
│   │   ├── screens/     # Mobile screens
│   │   └── types/       # TypeScript types
│   ├── ios/             # iOS native code
│   ├── android/         # Android native code
│   └── App.tsx
└── README.md             # This file
```

## Features

### Backend (Go + MongoDB)
- ✅ RESTful API for member management (CRUD operations)
- ✅ Multiple authentication methods:
  - Email/Password with bcrypt hashing
  - Google OAuth 2.0
  - GitHub OAuth 2.0
- ✅ Session management with MongoDB
- ✅ Protected API endpoints
- ✅ Optimized MongoDB connection (5s timeouts, pool size 10-50)
- ✅ CORS support for frontend integration

### Frontend Options

**React (frontend/) - Original**
- ✅ Login/Register with email/password
- ✅ OAuth login buttons (Google & GitHub)
- ✅ Member management dashboard (CRUD)
- ✅ Auto-renewal feature for memberships
- ✅ Default date handling (today, +1 year)
- ✅ Responsive design with custom CSS

**Next.js (frontend-nextjs/) - Modern** ⭐ Recommended
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Next.js App Router
- ✅ Same member management features as React
- ✅ Modern component architecture
- ✅ Better performance and DX

**React Native (mobile/) - Mobile App** 📱 NEW
- ✅ Cross-platform iOS & Android
- ✅ Member authentication (Login/Register)
- ✅ Class booking and management
- ✅ Restaurant reservations
- ✅ Profile management
- ✅ Real-time updates
- ✅ TypeScript + React Navigation
- ✅ Native look and feel

## Member Management Features

Both frontends provide:
- **Add/Edit Members** - Personal info, membership details, emergency contacts
- **Member Types** - Basic, Premium, VIP, Student, Senior
- **Status Management** - Active, Inactive, Suspended with visual badges
- **Auto-renewal** - Toggle automatic membership renewal
- **Default Dates** - Join date defaults to today, expiry to one year from now
- **Emergency Contacts** - Required contact information for safety
- **Notes** - Optional notes for each member
- **Search & Filter** - Easy member lookup

## Quick Start

### ⚡ ONE COMMAND (Recommended)

```bash
./dev.sh
```

**That's it!** This automatically:
- ✅ Starts MongoDB (if not running)
- ✅ Starts backend with health checks
- ✅ Starts frontend with dependency management
- ✅ Handles port conflicts
- ✅ Creates `.env` with defaults
- ✅ Logs everything to `logs/`

**Other commands:**
```bash
./stop-dev.sh   # Stop all services
./status.sh     # Check what's running
./logs.sh       # View logs
```

See [SCRIPTS.md](SCRIPTS.md) for complete documentation.

---

### Manual Setup (Traditional)

If you prefer manual control:

### Prerequisites
- Go 1.21 or higher
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- OAuth credentials (optional, for Google/GitHub login)

### 1. Start MongoDB

Make sure MongoDB is running locally or have a MongoDB Atlas connection string ready.

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Edit `.env` with your MongoDB URI and OAuth credentials:

```env
MONGODB_URI=mongodb://localhost:27017
PORT=8080
SESSION_SECRET=your-secret-key-here
SESSION_MAX_AGE=604800

# Optional: OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

FRONTEND_URL=http://localhost:3000
```

Install dependencies and run:

```bash
go mod download
go run main.go
```

The API will start on `http://localhost:8080`

### 3a. Setup Frontend (React - Original)

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### 3b. Setup Frontend (Next.js - Modern) ⭐ Recommended

In a new terminal:
 (gym staff/admin)
- Login with email/password
- Login with Google or GitHub (if configured)
- Manage gym members (create, view, edit, delete)
- Set membership types and auto-renewal options
- Track membership expiry dates

## Documentation

- **[Backend README](backend/README.md)** - Complete Go API documentation
- **[React Frontend README](frontend/README.md)** - Original React app
- **[Next.js Frontend README](frontend-nextjs/README.md)** - Modern Next.js app ⭐
- **[Mobile App Guide](MOBILE.md)** - React Native mobile app setup 📱 NEW
- **[Mobile Development Guide](mobile/MOBILE_GUIDE.md)** - Complete mobile dev docs 📱
- **[OAuth Setup Guide](backend/OAUTH.md)** - How to configure Google/GitHub OAuth
- **[API Security](backend/API_SECURITY.md)** - Authentication requirements and endpoints
- **[Testing Guide](backend/TESTING.md)** - How to run backend tests

## API Overview

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `POST /auth/register` - Register with email/password
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/github` - Initiate GitHub OAuth

### Protected Endpoints (Auth Required)
- `GET /api/me` - Get current user
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `GET /api/members/{id}` - Get member by ID
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `POST /auth/logout` - Logout (also accepts GET)ister with email/password
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/github` - Initiate GitHub OAuth

### Protected Endpoints (Auth Required)
- `GET /api/me` - Get current user
- Items endpoints removed (legacy bootstrap code)
- `GET /auth/logout` - Logout

## Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
cd frontend
npm start
```

### Run Backend Tests
```bash
cd backend
make test
# or
./run_tests.sh
```

### Build for Production

**Backend:**
```bash
cd backend
make build
# Binary will be in backend/bin/server
```

**Frontend:**
```bash
cd frontend
npm run build
# Static files will be in frontend/build/
```

## Architecture

### Backend Stack
- **Language**: Go 1.24
- **Database**: MongoDB
- **Authentication**: OAuth 2.0 + bcrypt
- **Sessions**: MongoDB-backed cookie sessions

**React (frontend/):**
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Custom CSS
- **API Client**: Fetch API with credentials

**Next.js (frontend-nextjs/):** ⭐ Recommended
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Client**: Custom TypeScript service layer
- **Routing**: Next.js Navigation
- **Routing**: React Router v6
- **Styling**: Plain CSS (no framework)
- **API Client**: Fetch API with credentials

### Communication
- Frontend proxies API requests to backend during development
- Session cookies are automatically handled
- CORS is configured for cross-origin requests

## Environment Variables

### Backend (.env in backend/)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `PORT` | No | `8080` | Server port |
| `SESSION_SECRET` | No | `your-secret-key-here` | Session encryption key |
| `SESSION_MAX_AGE` | No | `604800` | Session duration (7 days) |
| `GOOGLE_CLIENT_ID` | Optional | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | - | Google OAuth secret |
| `GITHUB_CLIENT_ID` | Optional | - | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | - | GitHub OAuth secret |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL |

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongod` or verify Atlas connection
- Verify `.env` file exists in backend/ directory
- Check port 8080 isn't already in use

### Frontend can't connect to API
- Ensure backend is running on port 8080
- Check `package.json` proxy setting points to `http://localhost:8080`
- Clear browser cookies if authentication issues occur

### OAuth not working
- Verify OAuth credentials in `.env`
- Check redirect URIs match in OAuth provider settings:
  - Google: `http://localhost:8080/auth/callback/google`
  - GitHub: `http://localhost:8080/auth/callback/github`
- See [backend/OAUTH.md](backend/OAUTH.md) for detailed setup

### Tests failing
```bash
cd backend
go clean -testcache
go test ./...
```

## Security Features

- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ HttpOnly session cookies (prevents XSS)
- ✅ SameSite cookie attribute (CSRF protection)
- ✅ CORS middleware with credentials support
- ✅ Environment variable configuration (no secrets in code)
- ✅ Protected API endpoints (authentication required)
- ✅ OAuth 2.0 integration (delegated authentication)
- ✅ Session expiration (7-day default)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`cd backend && make test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT License

## Support

For detailed documentation:
- Backend API: See [backend/README.md](backend/README.md)
- Frontend: See [frontend/README.md](frontend/README.md)
- OAuth Setup: See [backend/OAUTH.md](backend/OAUTH.md)
- Testing: See [backend/TESTING.md](backend/TESTING.md)
