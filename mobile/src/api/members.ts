import apiClient from './client';
import { Member } from '../types';

export const membersAPI = {
  // Get member profile
  getMember: async (id: string): Promise<Member> => {
    const response = await apiClient.get<Member>(`/members/${id}`);
    return response.data;
  },

  // Update member profile
  updateMember: async (id: string, data: Partial<Member>): Promise<Member> => {
    const response = await apiClient.put<Member>(`/members/${id}`, data);
    return response.data;
  },

  // Get member statistics
  getMemberStats: async (id: string) => {
    const response = await apiClient.get(`/members/${id}/stats`);
    return response.data;
  },
};
