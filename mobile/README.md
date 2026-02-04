# Gym CRM Mobile App

Expo-based React Native mobile application for gym members.

## Features

- **Authentication**: Login and Register with email/password
- **Dashboard**: Member stats and upcoming classes
- **Classes**: Browse and book fitness classes
- **Restaurants**: View and make restaurant reservations
- **Profile**: View and manage user profile
- **Automatic Token Refresh**: Seamless re-authentication

## Tech Stack

- **Expo SDK 52**: Modern React Native development
- **TypeScript**: Full type safety
- **Expo Router**: File-based navigation
- **Axios**: HTTP client with interceptors
- **AsyncStorage**: Secure token storage

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Backend server running on http://localhost:8080

## Installation

```bash
cd mobile
npm install
```

## Running the App

### Start Development Server

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

### Or run directly:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/           # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/           # Main app tabs
│   │   ├── index.tsx     # Home/Dashboard
│   │   ├── classes.tsx   # Classes list
│   │   ├── restaurants.tsx
│   │   └── profile.tsx
│   └── _layout.tsx       # Root layout
├── services/
│   └── api.ts            # API client with auto-refresh
├── types/
│   └── index.ts          # TypeScript definitions
├── constants/
│   └── config.ts         # App configuration
└── components/           # Reusable components
```

## Configuration

The app connects to the backend API. Edit `constants/config.ts` to change the API URL:

```typescript
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://localhost:8080'
    : 'http://10.0.2.2:8080'
  : 'https://your-production-api.com';
```

## Features

### Authentication
- Email/password login
- User registration
- Automatic token refresh (1-hour access tokens, 7-day refresh tokens)
- Secure token storage with AsyncStorage

### Dashboard
- Welcome message with user name
- Member statistics (total, active)
- Class count
- Upcoming classes preview

### Classes
- Browse all fitness classes
- View instructor, schedule, capacity
- Class booking functionality

### Restaurants
- Browse on-site restaurants
- View cuisine type, hours, contact info
- Make reservations

### Profile
- View account information
- Settings menu
- Logout functionality

## Development

### Clear Cache

```bash
npm start -- --clear
```

### Type Check

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Troubleshooting

### Cannot connect to backend

- **iOS Simulator**: Use `http://localhost:8080`
- **Android Emulator**: Use `http://10.0.2.2:8080`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:8080`)

### Metro bundler issues

```bash
npm start -- --reset-cache
```

### Dependency issues

```bash
rm -rf node_modules
npm install
```

## Notes

- This is an Expo-managed app (no native code directories needed)
- Uses Expo Router for file-based navigation
- All screens are TypeScript for type safety
- API service handles token refresh automatically
