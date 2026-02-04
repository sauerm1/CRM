# Gym CRM - Next.js Frontend

Next.js TypeScript frontend for the Gym/Wellness Club CRM application with multi-club support.

## Features

- **Authentication**: Login and Registration with OAuth support (Google, GitHub)
- **Refresh Tokens**: Automatic token refresh (1-hour access tokens, 7-day refresh tokens)
- **Multi-Club Management**: Manage multiple gym locations
- **Member Management**: Full CRUD operations with club assignment
- **Instructor Management**: Assign instructors to multiple clubs with checkbox UI
- **Class Scheduling**: Create and manage fitness classes
- **Restaurant Management**: Manage on-site dining facilities
- **Office Management**: Co-working space bookings
- **User Management**: Staff/admin account management
- **Dashboard Analytics**: Member count, active classes, club stats with charts
- **Responsive Design**: Built with Tailwind CSS
- **TypeScript**: Full type safety across the application
- **Modern Stack**: Next.js 16 with App Router

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8080`
- MongoDB instance (for backend)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

The app will redirect you to the login page. You can register a new account or login with existing credentials.

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard with analytics
│   │   ├── members/
│   │   │   ├── page.tsx          # Member list
│   │   │   ├── new/page.tsx      # Add new member
│   │   │   └── edit/[id]/page.tsx # Edit member
│   │   ├── clubs/
│   │   │   ├── page.tsx          # Club list
│   │   │   ├── new/page.tsx      # Add new club
│   │   │   └── edit/[id]/page.tsx # Edit club (includes instructor list)
│   │   ├── instructors/
│   │   │   ├── page.tsx          # Instructor list
│   │   │   ├── new/page.tsx      # Add instructor (multi-club selection)
│   │   │   └── edit/[id]/page.tsx # Edit instructor (multi-club selection)
│   │   ├── classes/
│   │   │   ├── page.tsx          # Class list
│   │   │   ├── new/page.tsx      # Add new class
│   │   │   └── edit/[id]/page.tsx # Edit class
│   │   ├── restaurants/
│   │   │   └── page.tsx          # Restaurant management
│   │   ├── offices/
│   │   │   └── page.tsx          # Office management
│   │   └── users/
│   │       └── page.tsx          # User management
│   ├── login/
│   │   └── page.tsx              # Login page (email/password + OAuth)
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to dashboard)
│   └── globals.css               # Global styles (Tailwind)
├── lib/
│   └── api.ts                    # API client with auto-refresh tokens
├── types/
│   └── index.ts                  # TypeScript type definitions
├── package.json
└── .env.local                    # Environment variables
```

## Core Features

### Dashboard
- Overview analytics with charts (member count, active classes, club stats)
- Quick navigation to all management sections
- Visual stats using Recharts library

### Club Management
- Create, edit, delete club locations
- Track: name, address, city, state, zip code, phone, email
- View all instructors assigned to each club
- Active/inactive status toggle

### Member Management
- **Add new members** with personal info and membership details
- **Edit existing members** with real-time updates
- **Delete members** with confirmation dialog
- **Club assignment** - assign members to specific locations
- **Auto-renewal** - toggle automatic membership renewal
- **Status badges** - visual indicators (Active/Inactive/Suspended)
- **Default dates** - join date defaults to today, expiry to +1 year
- **Emergency contact** - required contact information
- **Search functionality** - quick member lookup

### Instructor Management
- **Multi-club assignment** - instructors can work at multiple locations
- **Checkbox selection UI** - easy club assignment interface
- **Specialty tracking** - Yoga, Pilates, CrossFit, etc.
- **Bio field** - detailed instructor information
- **Active/inactive status** - track instructor availability
- **View by club** - see which instructors work at each location

### Class Management
- Schedule and manage fitness classes
- Assign instructors to classes
- Set class location (club)
- Track capacity and bookings

### User Management
- Create staff/admin accounts
- Role-based access (planned)
- Email/password authentication

### Authentication
- **Email/Password** login with bcrypt hashing
- **OAuth login** - Google and GitHub
- **Automatic token refresh** - seamless re-authentication
- **Session persistence** - stay logged in across browser sessions

## API Integration

All API calls go through the `lib/api.ts` service layer with automatic token refresh:

### Key Features
- **Automatic token refresh**: Intercepts 401 errors and refreshes access tokens
- **Credential handling**: Automatic cookie management
- **Type-safe**: Full TypeScript support
- **Error handling**: Standardized error responses

### Available API Functions

**Authentication:**
- `login(email, password)` - Email/password login
- `register(email, password, name)` - Create new account
- `logout()` - End session
- `getCurrentUser()` - Get logged-in user
- `refreshAccessToken()` - Refresh expired token

**Members:**
- `getMembers()` - List all members
- `getMember(id)` - Get single member
- `createMember(data)` - Create new member
- `updateMember(id, data)` - Update member
- `deleteMember(id)` - Delete member

**Clubs:**
- `getClubs()` - List all clubs
- `getClub(id)` - Get single club
- `createClub(data)` - Create new club
- `updateClub(id, data)` - Update club
- `deleteClub(id)` - Delete club

**Instructors:**
- `getInstructors()` - List all instructors
- `getInstructor(id)` - Get single instructor
- `createInstructor(data)` - Create instructor with club assignments
- `updateInstructor(id, data)` - Update instructor and clubs
- `deleteInstructor(id)` - Delete instructor

**Classes:**
- `getClasses()` - List all classes
- `getClass(id)` - Get single class
- `createClass(data)` - Create new class
- `updateClass(id, data)` - Update class
- `deleteClass(id)` - Delete class

The backend must be running on port 8080 for API calls to work.

## Backend Integration

Make sure the Go backend is running:

```bash
cd ../backend
go run main.go
```

The backend provides:
- Session-based authentication with HttpOnly cookies
- CORS support for localhost:3000
- Member CRUD endpoints at `/api/members`
- MongoDB integration with optimized connection settings

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8080)

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Tech Stack

- **Next.js 16.1.6**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: Latest React features

## Learn More

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Notes

- The app uses `useRef` to prevent duplicate API calls during React.StrictMode
- Dates are converted from HTML date format (YYYY-MM-DD) to ISO 8601 for backend
- Auto-renewal defaults to `true` for new members
- All routes except `/login` and `/register` require authentication

