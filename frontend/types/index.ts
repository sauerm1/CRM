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
