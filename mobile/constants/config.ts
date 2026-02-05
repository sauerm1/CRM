import { Platform } from 'react-native';

// API Configuration
// For iOS Simulator: use 127.0.0.1 or localhost
// For Android Emulator: use 10.0.2.2
// For physical devices: use your computer's network IP (e.g., 10.7.150.85)
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'ios'
    ? 'http://127.0.0.1:8080' // iOS Simulator
    : 'http://10.0.2.2:8080' // Android emulator
  : 'https://your-production-api.com';

// Token Configuration
export const ACCESS_TOKEN_KEY = '@gym_crm_access_token';
export const REFRESH_TOKEN_KEY = '@gym_crm_refresh_token';
export const USER_KEY = '@gym_crm_user';
