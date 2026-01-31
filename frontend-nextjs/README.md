# Gym CRM - Next.js Frontend

Next.js frontend for the Gym/Wellness Club CRM application.

## Features

- **Authentication**: Login and Registration with session management
- **Member Management**: Full CRUD operations for gym members
- **Auto-renewal**: Automatic membership renewal feature
- **Responsive Design**: Built with Tailwind CSS
- **TypeScript**: Type-safe codebase
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
frontend-nextjs/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Member management dashboard
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── register/
│   │   └── page.tsx          # Registration page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page (redirects to login)
│   └── globals.css           # Global styles
├── lib/
│   └── api.ts                # API client functions
├── types/
│   └── index.ts              # TypeScript type definitions
└── .env.local                # Environment variables
```

## Member Management

The dashboard allows you to:

- **Add new members** with personal info, membership details, and emergency contacts
- **Edit existing members** with real-time updates
- **Delete members** with confirmation
- **View all members** in a responsive grid layout
- **Auto-renewal** - Toggle automatic membership renewal
- **Default dates** - Join date defaults to today, expiry to one year from now
- **Status badges** - Visual indicators for active/inactive/suspended members

## Member Fields

- **Personal Information**: First name, last name, email, phone
- **Membership Details**: Type (Basic, Premium, VIP, Student, Senior), status, join date, expiry date
- **Auto-renewal**: Checkbox for automatic renewal on expiry
- **Emergency Contact**: Required emergency contact information
- **Notes**: Optional additional notes

## API Integration

All API calls go through the `lib/api.ts` service layer. The backend must be running on port 8080.

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

