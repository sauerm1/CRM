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
  expiry_date?: string;
  auto_renewal: boolean;
  emergency_contact: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Class {
  id?: string;
  club_id?: string;
  name: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  capacity: number;
  enrolled_members: string[];
  wait_list: string[];
  recurring: boolean;
  recurring_days: string[];
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClassWithMembers extends Class {
  enrolled_members_details: Member[];
  wait_list_details: Member[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string; // admin, club_manager, all_services, restaurant, office, classes
  assigned_club_ids?: string[];
  active?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Instructor {
  id?: string;
  club_ids?: string[];
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  active: boolean;
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

export interface Restaurant {
  id?: string;
  club_id?: string;
  name: string;
  description: string;
  cuisine: string;
  phone: string;
  email: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  active: boolean;
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
  status: string;
  special_requests?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Office {
  id?: string;
  club_id?: string;
  name: string;
  description: string;
  type: string; // private, shared, meeting_room, phone_booth
  capacity: number;
  amenities: string[];
  hourly_rate: number;
  daily_rate: number;
  active: boolean;
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
  total_cost: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
