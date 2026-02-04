import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../constants/config';
import type {
  User,
  Member,
  Class,
  Restaurant,
  Club,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private refreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.refreshing) {
            // Wait for the refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data;
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);

            // Retry all queued requests
            this.refreshSubscribers.forEach((callback) => callback(access_token));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            this.refreshing = false;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.refreshing = false;
            this.refreshSubscribers = [];
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    const data: AuthResponse = response.data;
    
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
    const data: AuthResponse = response.data;
    
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/api/me');
    return response.data;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  }

  async getStoredUser(): Promise<User | null> {
    const userString = await AsyncStorage.getItem(USER_KEY);
    return userString ? JSON.parse(userString) : null;
  }

  // Member methods
  async getMembers(): Promise<Member[]> {
    const response = await this.api.get('/api/members');
    return response.data;
  }

  async getMember(id: string): Promise<Member> {
    const response = await this.api.get(`/api/members/${id}`);
    return response.data;
  }

  // Class methods
  async getClasses(): Promise<Class[]> {
    const response = await this.api.get('/api/classes');
    return response.data;
  }

  async getClass(id: string): Promise<Class> {
    const response = await this.api.get(`/api/classes/${id}`);
    return response.data;
  }

  async bookClass(classId: string): Promise<void> {
    await this.api.post(`/api/classes/${classId}/book`);
  }

  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await this.api.get('/api/restaurants');
    return response.data;
  }

  async getRestaurant(id: string): Promise<Restaurant> {
    const response = await this.api.get(`/api/restaurants/${id}`);
    return response.data;
  }

  async makeReservation(restaurantId: string, data: any): Promise<void> {
    await this.api.post(`/api/restaurants/${restaurantId}/reservations`, data);
  }

  // Club methods
  async getClubs(): Promise<Club[]> {
    const response = await this.api.get('/api/clubs');
    return response.data;
  }
}

// Export singleton instance
export default new ApiService();
