import { Platform } from 'react-native';

// API Configuration
// Use your computer's local IP address when running on physical device or Expo Go
// For iOS Simulator, use localhost; for Android Emulator, use 10.0.2.2
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://192.168.13.237:8080' // Your computer's IP - change if needed
    : 'http://10.0.2.2:8080' // Android emulator
  : 'https://your-production-api.com';

// Token Configuration
export const ACCESS_TOKEN_KEY = '@gym_crm_access_token';
export const REFRESH_TOKEN_KEY = '@gym_crm_refresh_token';
export const USER_KEY = '@gym_crm_user';
