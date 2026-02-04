# Mobile App - React Native

The `mobile/` directory contains the React Native mobile application for gym members to browse classes, make reservations, and manage their profiles.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- For iOS: macOS with Xcode 14+ and CocoaPods
- For Android: Android Studio with SDK 31+
- Backend server running on `http://localhost:8080`

### Installation

```bash
cd mobile
npm install
```

### Running on iOS (macOS only)

```bash
# Install iOS dependencies
cd ios && bundle exec pod install && cd ..

# Start Metro bundler
npm start

# In a new terminal, run on iOS simulator
npm run ios
```

### Running on Android

```bash
# Start Metro bundler
npm start

# In a new terminal, run on Android emulator
npm run android
```

### Using the Development Script

```bash
cd mobile
./start-dev.sh
```

This script will:
- Install dependencies if needed
- Install iOS pods if on macOS
- Start the Metro bundler
- Launch the simulator/emulator

## What's Included

### Core Features
- **Authentication**: Login and registration for members
- **Class Booking**: Browse and book fitness classes
- **Restaurant Reservations**: Make dining reservations at gym restaurants
- **Profile Management**: View and manage member profile

### Technology Stack
- **React Native 0.83.1** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation and routing
- **Axios** - HTTP client for API calls
- **AsyncStorage** - Local data persistence

### Project Structure
```
mobile/
├── src/
│   ├── api/           # Backend API integration
│   ├── config/        # App configuration
│   ├── navigation/    # Navigation setup
│   ├── screens/       # App screens (Login, Home, Classes, etc.)
│   ├── types/         # TypeScript definitions
│   └── utils/         # Helper functions
├── ios/               # iOS native code
├── android/           # Android native code
└── App.tsx            # Root component
```

## Documentation

For detailed documentation, see:
- **[mobile/README.md](mobile/README.md)** - Getting started and installation
- **[mobile/MOBILE_GUIDE.md](mobile/MOBILE_GUIDE.md)** - Complete development guide with troubleshooting
- **[Backend README](backend/README.md)** - API documentation for integration

## Available Screens

1. **Login/Register** - Member authentication with email/password
2. **Home/Dashboard** - Overview with quick stats and upcoming classes
3. **Classes** - Browse and filter available fitness classes
4. **Class Details** - View class information, instructor, and book
5. **Restaurants** - Browse on-site gym restaurants
6. **Restaurant Details** - View menu, hours, and make reservations
7. **Profile** - View and edit member profile and settings

## API Configuration

The mobile app connects to the backend API. By default it uses:
- **Development**: `http://localhost:8080` (iOS simulator)
- **Development**: `http://10.0.2.2:8080` (Android emulator)

To change the API URL, edit `src/config/index.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://localhost:8080'
    : 'http://10.0.2.2:8080'
  : 'https://your-production-api.com';
```

**Important:** Make sure the backend server is running before starting the mobile app!

## Development Notes

- **Node.js version**: 18+ recommended (app works with 20.19.2+)
- **iOS development**: Requires macOS with Xcode 14 or later
- **Android development**: Requires Android Studio with SDK 31+
- **First-time setup**: May take 10-15 minutes for dependency installation and pod install
- **Hot reload**: Changes to code will automatically reload in the simulator

## Common Commands

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run tsc

# Clear cache and reinstall
npm run clean
rm -rf node_modules ios/Pods
npm install
cd ios && bundle exec pod install && cd ..
```

## Troubleshooting

### iOS Issues

**Pods won't install:**
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

**Simulator won't open:**
```bash
# Open Xcode and launch simulator manually
open -a Simulator
# Then run: npm run ios
```

### Android Issues

**Emulator not found:**
- Open Android Studio
- Tools → Device Manager
- Create or start an emulator
- Then run: `npm run android`

**Build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Metro Bundler Issues

**Port 8081 already in use:**
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

**Cache issues:**
```bash
npm start -- --reset-cache
```
