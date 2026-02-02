# Mobile App Directory

The `mobile/` directory contains the React Native mobile application for gym members.

## Quick Start

```bash
cd mobile
npm install

# For iOS
cd ios && bundle exec pod install && cd ..
npm run ios

# For Android  
npm run android
```

Or use the development script:
```bash
cd mobile
./start-dev.sh
```

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

## Backend Integration

The mobile app connects to the backend API at:
- **Development**: `http://localhost:8080`
- **Production**: Configure in `src/config/index.ts`

Make sure the backend server is running before starting the mobile app.

## Documentation

For detailed documentation, see:
- [mobile/README.md](mobile/README.md) - Getting started and installation
- [mobile/MOBILE_GUIDE.md](mobile/MOBILE_GUIDE.md) - Complete development guide

## Available Screens

1. **Login/Register** - Member authentication
2. **Home** - Dashboard with quick stats and upcoming classes
3. **Classes** - Browse and book fitness classes
4. **Class Details** - View class information and book
5. **Restaurants** - Browse gym restaurants
6. **Restaurant Details** - View details and make reservations
7. **Profile** - Member profile and settings

## Development Notes

- Node.js version >= 20.19.4 recommended
- iOS development requires macOS with Xcode
- Android development requires Android Studio
- First-time setup may take 10-15 minutes for dependency installation

## Next Steps

After setting up the mobile app:
1. Ensure backend is running at `http://localhost:8080`
2. Run the app on iOS simulator or Android emulator
3. Test login/registration flow
4. Test class booking functionality
5. Test restaurant reservations

## Known Issues

- Node version warning for 20.19.2 (app works but 20.19.4+ recommended)
- iOS simulator requires Xcode to be installed
- Android emulator requires Android SDK

For troubleshooting, see [mobile/MOBILE_GUIDE.md](mobile/MOBILE_GUIDE.md#common-issues)
