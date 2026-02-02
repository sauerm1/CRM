import apiClient from './client';
import { Restaurant, RestaurantReservation } from '../types';

export const restaurantsAPI = {
  // Get all restaurants
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await apiClient.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  // Get restaurant by ID
  getRestaurant: async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  // Make a restaurant reservation
  makeReservation: async (data: Partial<RestaurantReservation>): Promise<RestaurantReservation> => {
    const response = await apiClient.post<RestaurantReservation>('/restaurant-reservations', data);
    return response.data;
  },

  // Get member's restaurant reservations
  getMemberReservations: async (memberId: string): Promise<RestaurantReservation[]> => {
    const response = await apiClient.get<RestaurantReservation[]>(`/members/${memberId}/restaurant-reservations`);
    return response.data;
  },

  // Cancel restaurant reservation
  cancelReservation: async (reservationId: string): Promise<void> => {
    await apiClient.delete(`/restaurant-reservations/${reservationId}`);
  },
};
