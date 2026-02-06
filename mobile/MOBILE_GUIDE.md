# Mobile App Development Guide

## Overview

This is the React Native mobile application for gym members to interact with the CRM system. Members can book classes, make restaurant reservations, and manage their profiles.

## Architecture

### Project Structure

```
mobile/
├── src/
│   ├── api/              # API services and endpoints
│   │   ├── client.ts     # Axios client configuration
│   │   ├── auth.ts       # Authentication endpoints
│   │   ├── classes.ts    # Class booking endpoints
│   │   ├── members.ts    # Member management endpoints
│   │   └── restaurants.ts # Restaurant reservation endpoints
│   ├── components/       # Reusable UI components (to be added)
│   ├── config/           # App configuration
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ClassesScreen.tsx
│   │   ├── ClassDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RestaurantsScreen.tsx
│   │   └── RestaurantDetailScreen.tsx
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── ios/                  # iOS native code
├── android/              # Android native code
├── App.tsx               # Root component
└── package.json
```

## Key Features

### Authentication
- Login and registration
- JWT token management
- Automatic token refresh
- Secure storage using AsyncStorage

### Class Booking
- Browse available classes
- View class details
- Book classes
- View upcoming reservations
- Cancel reservations

### Restaurant Reservations
- Browse restaurants
- View restaurant details
- Make reservations
- Manage reservations

### Profile Management
- View membership information
- Edit profile
- View activity statistics

## API Integration

The app communicates with the backend API running at `http://localhost:8080` (development) or your production URL.

### API Client Configuration

The API client ([src/api/client.ts](src/api/client.ts)) handles:
- Base URL configuration
- Request/response interceptors
- Authentication token management
- Error handling
- 401 (Unauthorized) handling

### Available API Modules

1. **authAPI** - Authentication and user management
2. **classesAPI** - Class browsing and booking
3. **membersAPI** - Member profile management
4. **restaurantsAPI** - Restaurant reservations

## Navigation

The app uses React Navigation with the following structure:

```
Root Stack
├── Auth Stack (unauthenticated)
│   ├── Login
│   └── Register
└── Main Tabs (authenticated)
    ├── Home
    ├── Classes Stack
    │   ├── ClassesList
    │   └── ClassDetail
    ├── Restaurants Stack
    │   ├── RestaurantsList
    │   └── RestaurantDetail
    └── Profile
```

## Development

### Running the App

#### iOS
```bash
# Install CocoaPods dependencies (first time only)
cd ios
bundle install
bundle exec pod install
cd ..

# Run the app
npm run ios
```

#### Android
```bash
# Make sure you have an Android emulator running or device connected
npm run android
```

### Debugging

#### React Native Debugger
1. Install React Native Debugger
2. Enable Debug Mode in the app (Cmd+D on iOS, Cmd+M on Android)
3. Select "Debug" from the menu

#### Chrome DevTools
1. Enable Debug Mode
2. Select "Debug in Chrome"
3. Open Chrome DevTools (Cmd+Option+J)

#### Flipper
Flipper is included by default for advanced debugging:
- Network inspector
- Layout inspector
- Database viewer
- Logs

### Hot Reloading

Hot reloading is enabled by default. Changes to most files will automatically reload the app.

## TypeScript

The app is fully typed with TypeScript. Type definitions are located in [src/types/index.ts](src/types/index.ts).

### Adding New Types

```typescript
// src/types/index.ts
export interface NewType {
  id: string;
  name: string;
}
```

## Styling

The app uses React Native's StyleSheet API for styling. A consistent color scheme is used throughout:

- Primary: `#007AFF` (iOS blue)
- Success: `#4CAF50`
- Error: `#FF3B30`
- Warning: `#FF9500`
- Background: `#f5f5f5`
- Text: `#333`
- Secondary Text: `#666`

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

Tests should be placed in `__tests__` directories next to the files they test.

Example:
```
src/
  screens/
    HomeScreen.tsx
    __tests__/
      HomeScreen.test.tsx
```

## Building for Production

### iOS

1. Open Xcode project:
```bash
open ios/mobile.xcodeproj
```

2. Select your device/simulator
3. Product > Archive
4. Follow the App Store submission process

### Android

1. Generate a release APK:
```bash
cd android
./gradlew assembleRelease
```

2. Find the APK at:
```
android/app/build/outputs/apk/release/app-release.apk
```

3. For Play Store, generate an AAB:
```bash
./gradlew bundleRelease
```

## Environment Configuration

Update [src/config/index.ts](src/config/index.ts) for different environments:

```typescript
export const config = {
  API_URL: __DEV__ 
    ? 'http://localhost:8080'  // Development
    : 'https://your-production-api.com',  // Production
};
```

## Common Issues

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

### Clear All Caches
```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Clear watchman
watchman watch-del-all

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Future Enhancements

- [ ] Push notifications
- [ ] In-app messaging
- [ ] Class check-in via QR code
- [ ] Workout tracking
- [ ] Social features
- [ ] Dark mode support
- [ ] Offline support
- [ ] Analytics integration
- [ ] Biometric authentication

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)
