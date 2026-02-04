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
  club_id?: string;
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
