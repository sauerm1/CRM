// Type definitions for the mobile app

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  join_date: string;
  status: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_enrollment: number;
  location: string;
  status: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  bio: string;
  photo_url?: string;
}

export interface Reservation {
  id: string;
  member_id: string;
  class_id: string;
  reservation_date: string;
  status: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  location: string;
  phone: string;
  email: string;
  hours: string;
  capacity: number;
}

export interface RestaurantReservation {
  id: string;
  restaurant_id: string;
  member_id: string;
  reservation_time: string;
  party_size: number;
  status: string;
  special_requests?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
