# Gym CRM - Multi-Club Management System

A comprehensive full-stack gym/wellness club CRM application with Go backend and Next.js frontend, featuring OAuth 2.0 authentication, multi-club support, instructor management, class scheduling, and mobile app.

## Project Structure

```
├── backend/              # Go REST API with MongoDB
│   ├── main.go
│   ├── handlers/
│   │   ├── local_auth.go      # Email/password authentication
│   │   ├── oauth.go           # OAuth handlers (Google/GitHub)
│   │   ├── member_handlers.go # Member CRUD
│   │   ├── club_handlers.go   # Multi-club management
│   │   ├── instructor_handlers.go  # Instructor management
│   │   ├── class_handlers.go  # Class scheduling
│   │   ├── restaurant_handlers.go  # Restaurant management
│   │   └── office_handlers.go # Office/co-working space management
│   ├── models/
│   │   ├── user.go           # User/staff accounts
│   │   ├── member.go         # Gym members
│   │   ├── club.go           # Club locations
│   │   ├── instructor.go     # Instructors (multi-club support)
│   │   ├── class.go          # Fitness classes
│   │   ├── restaurant.go     # On-site restaurants
│   │   └── office.go         # Co-working spaces
│   ├── database/
│   ├── middleware/
│   └── scripts/          # Database seeding scripts
├── frontend/             # Next.js TypeScript application ⭐ Primary UI
│   ├── app/
│   │   ├── dashboard/    # Main dashboard
│   │   │   ├── members/  # Member management
│   │   │   ├── clubs/    # Club locations
│   │   │   ├── instructors/  # Instructor management
│   │   │   ├── classes/  # Class scheduling
│   │   │   ├── restaurants/  # Restaurant management
│   │   │   ├── offices/  # Office management
│   │   │   └── users/    # User management
│   │   ├── login/
│   │   └── register/
│   ├── lib/
│   │   └── api.ts        # API client with auto-refresh tokens
│   └── types/
├── mobile/               # React Native mobile app 📱
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
- ✅ RESTful API with full CRUD operations for all entities
- ✅ **Multi-Club Support**: Manage multiple gym locations
- ✅ **Member Management**: Complete member lifecycle tracking
- ✅ **Instructor Management**: Assign instructors to multiple clubs
- ✅ **Class Scheduling**: Create and manage fitness classes
- ✅ **Restaurant Management**: On-site dining facilities
- ✅ **Office/Co-working Spaces**: Manage bookable office spaces
- ✅ Multiple authentication methods:
  - Email/Password with bcrypt hashing
  - Google OAuth 2.0
  - GitHub OAuth 2.0
- ✅ **Refresh Token System**: 1-hour access tokens, 7-day refresh tokens with automatic renewal
- ✅ Session management with MongoDB
- ✅ Protected API endpoints with middleware
- ✅ Optimized MongoDB connection (5s timeouts, pool size 10-50)
- ✅ CORS support for frontend integration

### Frontend (Next.js TypeScript) ⭐ Primary Application
- ✅ **TypeScript**: Full type safety across the application
- ✅ **Tailwind CSS**: Modern, responsive design
- ✅ **Next.js 16 App Router**: Latest routing paradigm
- ✅ **Dashboard Analytics**: Member count, active classes, club stats with charts
- ✅ **Multi-Club Management**: 
  - Create, edit, delete club locations
  - View instructors assigned to each club
  - Club-specific filtering (planned)
- ✅ **Member Management**:
  - Full CRUD operations
  - Club assignment
  - Auto-renewal toggle
  - Status badges (Active, Inactive, Suspended)
  - Emergency contact tracking
- ✅ **Instructor Management**:
  - Multi-club assignment via checkboxes
  - Specialty and bio fields
  - Active/inactive status
  - View instructors by club
- ✅ **Class Management**: Schedule and manage fitness classes
- ✅ **Restaurant Management**: Manage on-site dining facilities
- ✅ **Office Management**: Co-working space bookings
- ✅ **User Management**: Staff/admin account management
- ✅ **Automatic Token Refresh**: Seamless re-authentication without logout
- ✅ **Search & Filter**: Quick lookup across all entities
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile browsers

### Mobile App (React Native) 📱
- ✅ Cross-platform iOS & Android
- ✅ Member authentication (Login/Register)
- ✅ Class booking and management
- ✅ Restaurant reservations
- ✅ Profile management
- ✅ Real-time updates
- ✅ TypeScript + React Navigation
- ✅ Native look and feel

## Key Features by Entity

### Clubs (Multi-Location Support)
- Create and manage multiple gym locations
- Track name, address, city, state, zip code
- Contact information (phone, email)
- Active/inactive status
- View all instructors assigned to each club
- Club-specific member and class filtering (planned)

### Members
- Personal info: First name, last name, email, phone
- Membership types: Basic, Premium, VIP, Student, Senior
- Status: Active, Inactive, Suspended
- Join date and expiry date with auto-calculated defaults
- Auto-renewal toggle
- Emergency contact (required)
- Club assignment
- Notes field for additional information

### Instructors
- **Multi-club assignment**: Instructors can work at multiple locations
- Name, email, phone
- Specialty (Yoga, Pilates, CrossFit, etc.)
- Bio/description
- Active/inactive status
- View which clubs an instructor is assigned to
- Checkbox selection UI for club assignment

### Classes
- Class scheduling and management
- Instructor assignment
- Club location assignment
- Capacity tracking

### Authentication & Security
- **Refresh token flow**: Short-lived access tokens (1 hour) with long-lived refresh tokens (7 days)
- **Automatic token renewal**: Frontend automatically refreshes expired tokens
- **Multiple login methods**: Email/password, Google OAuth, GitHub OAuth
- **Session management**: Secure cookie-based sessions
- **Protected routes**: All API endpoints require authentication except login/register

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

### 3. Setup Frontend (Next.js) ⭐ Primary Application

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Setup Mobile App (Optional) 📱

For iOS (macOS required):
```bash
cd mobile
npm install
cd ios && bundle exec pod install && cd ..
npm run ios
```

For Android:
```bash
cd mobile
npm install
npm run android
```

See [MOBILE.md](MOBILE.md) for detailed mobile setup instructions.

## First Time Setup

1. **Register an account**: Navigate to http://localhost:3000, click "Register"
2. **Create a club**: Go to Dashboard → Clubs → Add New Club
3. **Add instructors**: Dashboard → Instructors → Add Instructor (assign to one or more clubs)
4. **Add members**: Dashboard → Members → Add Member (assign to a club)
5. **Schedule classes**: Dashboard → Classes → Add Class

## Usage Guide

### For Gym Staff/Administrators
- Login with email/password or OAuth
- Access the dashboard to view overview stats
- Manage members, instructors, classes across all club locations
- View club-specific information
- Track membership renewals and status

### For Mobile App Users (Members)
- Login with member credentials
- Browse available classes
- Make restaurant reservations
- View and update profile
- Book classes at any club location

## Documentation

- **[Backend README](backend/README.md)** - Complete Go API documentation and endpoints
- **[Frontend README](frontend/README.md)** - Next.js application guide
- **[Mobile App Guide](MOBILE.md)** - React Native mobile app quick start 📱
- **[Mobile Development Guide](mobile/MOBILE_GUIDE.md)** - Complete mobile development docs 📱
- **[OAuth Setup Guide](backend/OAUTH.md)** - Configure Google/GitHub OAuth
- **[API Security](backend/API_SECURITY.md)** - Authentication requirements and security
- **[Testing Guide](backend/TESTING.md)** - Backend testing instructions
- **[Scripts Documentation](SCRIPTS.md)** - Development scripts and automation
- **[Role System](ROLE_SYSTEM.md)** - User roles and permissions (planned)

## API Overview

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `POST /auth/register` - Register with email/password
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/github` - Initiate GitHub OAuth
- `POST /auth/refresh` - Refresh access token using refresh token

### Protected Endpoints (Auth Required)

#### User/Auth
- `GET /api/me` - Get current authenticated user
- `POST /auth/logout` - Logout and invalidate session

#### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create new member
- `GET /api/members/{id}` - Get member by ID
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

#### Clubs
- `GET /api/clubs` - List all clubs
- `POST /api/clubs` - Create new club
- `GET /api/clubs/{id}` - Get club by ID
- `PUT /api/clubs/{id}` - Update club
- `DELETE /api/clubs/{id}` - Delete club

#### Instructors
- `GET /api/instructors` - List all instructors
- `POST /api/instructors` - Create new instructor
- `GET /api/instructors/{id}` - Get instructor by ID
- `PUT /api/instructors/{id}` - Update instructor (including club assignments)
- `DELETE /api/instructors/{id}` - Delete instructor

#### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/{id}` - Get class by ID
- `PUT /api/classes/{id}` - Update class
- `DELETE /api/classes/{id}` - Delete class

#### Restaurants
- `GET /api/restaurants` - List all restaurants
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/{id}` - Get restaurant by ID
- `PUT /api/restaurants/{id}` - Update restaurant
- `DELETE /api/restaurants/{id}` - Delete restaurant

#### Offices
- `GET /api/offices` - List all offices
- `POST /api/offices` - Create new office
- `GET /api/offices/{id}` - Get office by ID
- `PUT /api/offices/{id}` - Update office
- `DELETE /api/offices/{id}` - Delete office

#### Users
- `GET /api/users` - List all users (staff/admin accounts)
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Development

### Backend Development
```bash
cd backend
go run main.go
# Server runs on http://localhost:8080
```

### Frontend Development
```bash
cd frontend
npm run dev
# Next.js dev server on http://localhost:3000
```

### Mobile App Development
```bash
cd mobile
npm run ios     # iOS simulator
npm run android # Android emulator
```

### Database Seeding
Populate the database with sample data for testing:
```bash
cd backend/scripts
./seed.sh
```

This creates:
- 5 sample gym clubs
- 15 instructors with various specialties
- 100 members with realistic data
- Sample classes

### Run Backend Tests
```bash
cd backend
make test
# or
go test ./...
```

### Build for Production

**Backend:**
```bash
cd backend
go build -o bin/server main.go
./bin/server
```

**Frontend:**
```bash
cd frontend
npm run build
npm start  # Production server
```

## Architecture

### Backend Stack
- **Language**: Go 1.24
- **Database**: MongoDB with optimized connection pooling
- **Authentication**: 
  - Local: bcrypt password hashing
  - OAuth 2.0: Google and GitHub
  - Refresh tokens: 1-hour access tokens, 7-day refresh tokens
- **Sessions**: MongoDB-backed secure cookie sessions
- **Middleware**: CORS, authentication validation

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Client**: Custom service layer with automatic token refresh
- **Routing**: Next.js file-based routing
- **State Management**: React hooks (useState, useEffect)
- **Charts**: Recharts for dashboard analytics

### Mobile Stack
- **Framework**: React Native 0.83.1
- **Language**: TypeScript
- **Navigation**: React Navigation
- **API Client**: Axios
- **Storage**: AsyncStorage

### Communication
- Frontend uses REST API calls to backend
- Automatic token refresh on 401 responses
- Session cookies handled automatically
- CORS configured for local development

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
- ✅ **Refresh token flow**: Short-lived access tokens with automatic renewal
- ✅ HttpOnly session cookies (prevents XSS attacks)
- ✅ SameSite cookie attribute (CSRF protection)
- ✅ CORS middleware with credentials support
- ✅ Environment variable configuration (no secrets in code)
- ✅ Protected API endpoints (middleware authentication)
- ✅ OAuth 2.0 integration (Google, GitHub)
- ✅ Session expiration (7-day default for refresh tokens)
- ✅ Automatic token refresh (seamless re-authentication)

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
