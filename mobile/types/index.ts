export interface User {
  id?: string;
  email: string;
  name: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Member {
  id?: string;
  club_ids?: string[]; // Support multiple clubs
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  status: string;
  join_date: string;
  expiry_date: string;
  auto_renewal: boolean;
  emergency_contact: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Class {
  id?: string;
  name: string;
  description?: string;
  instructor_id?: string;
  instructor_name?: string;
  club_id?: string;
  club_name?: string;
  schedule: string;
  duration?: number;
  capacity?: number;
  enrolled?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Restaurant {
  id?: string;
  name: string;
  description?: string;
  club_id?: string;
  cuisine_type?: string;
  hours?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Club {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Office {
  id?: string;
  club_id?: string;
  name: string;
  description?: string;
  type: string; // private, shared, meeting_room, phone_booth
  capacity?: number;
  amenities?: string[];
  hourly_rate?: number;
  daily_rate?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassBooking {
  id?: string;
  class_id?: string;
  member_id?: string;
  status: string; // confirmed, waitlist, cancelled, attended, no-show
  booked_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfficeBooking {
  id?: string;
  office_id?: string;
  member_id?: string;
  start_time: string;
  end_time: string;
  status: string; // confirmed, cancelled, completed, no-show
  total_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id?: string;
  restaurant_id?: string;
  member_id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  date_time: string;
  status: string; // confirmed, cancelled, completed, no-show
  special_requests?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClassBookingRequest {
  class_id: string;
  notes?: string;
}

export interface CreateOfficeBookingRequest {
  office_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface CreateReservationRequest {
  restaurant_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  date_time: string;
  special_requests?: string;
}
