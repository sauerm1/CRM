import apiClient from './client';
import { Class, Reservation } from '../types';

export const classesAPI = {
  // Get all classes
  getClasses: async (): Promise<Class[]> => {
    const response = await apiClient.get<Class[]>('/classes');
    return response.data;
  },

  // Get class by ID
  getClass: async (id: string): Promise<Class> => {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  // Get upcoming classes
  getUpcomingClasses: async (): Promise<Class[]> => {
    const response = await apiClient.get<Class[]>('/classes?status=upcoming');
    return response.data;
  },

  // Book a class
  bookClass: async (classId: string, memberId: string): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations', {
      class_id: classId,
      member_id: memberId,
      reservation_date: new Date().toISOString(),
      status: 'confirmed',
    });
    return response.data;
  },

  // Get member's reservations
  getMemberReservations: async (memberId: string): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/members/${memberId}/reservations`);
    return response.data;
  },

  // Cancel reservation
  cancelReservation: async (reservationId: string): Promise<void> => {
    await apiClient.delete(`/reservations/${reservationId}`);
  },
};
