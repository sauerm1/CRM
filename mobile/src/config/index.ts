// Environment configuration for the mobile app

export const config = {
  // API base URL - change this based on environment
  API_URL: __DEV__ 
    ? 'http://localhost:8080'  // Development - backend running locally
    : 'https://your-production-api.com',  // Production
  
  // API timeout in milliseconds
  API_TIMEOUT: 10000,
  
  // App version
  APP_VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    RESTAURANT_RESERVATIONS: true,
    CLASS_BOOKING: true,
    PUSH_NOTIFICATIONS: false,
  },
};

export default config;
