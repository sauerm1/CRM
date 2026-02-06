const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Token management
const TOKEN_KEY = 'auth_token';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

const removeToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    const errorMessage = error.error || `HTTP error! status: ${response.status}`;
    console.error(`API Error: ${errorMessage}`, { status: response.status, url: response.url });
    throw new Error(errorMessage);
  }
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return { message: 'Success' };
  }
  return response.json();
};

// Helper to make authenticated API calls
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// Auth APIs
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await handleResponse(response);
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

export const logout = async () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return { message: 'Logged out successfully' };
};

export const getCurrentUser = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/me`);
};

// Revenue Analytics APIs
export const getRevenueAnalytics = async (params: {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'month';
}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.group_by) queryParams.append('group_by', params.group_by);
  
  return authenticatedFetch(`${API_BASE_URL}/api/revenue?${queryParams.toString()}`);
};

// Member APIs (CRM)
export const getMembers = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/members`);
};

export const getMember = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members/${id}`);
};

export const createMember = async (member: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members`, {
    method: 'POST',
    body: JSON.stringify(member),
  });
};

export const updateMember = async (id: string, member: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  });
};

export const deleteMember = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'DELETE',
  });
};

// Class APIs
export const getClasses = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes`);
};

export const getClass = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${id}`);
};

export const getClassWithMembers = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${id}/details`);
};

export const createClass = async (classData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    body: JSON.stringify(classData),
  });
};

export const updateClass = async (id: string, classData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(classData),
  });
};

export const deleteClass = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'DELETE',
  });
};

export const enrollMember = async (classId: string, memberId: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${classId}/enroll`, {
    method: 'POST',
    body: JSON.stringify({ member_id: memberId }),
  });
};

export const unenrollMember = async (classId: string, memberId: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${classId}/unenroll/${memberId}`, {
    method: 'DELETE',
  });
};

// Instructor APIs
export const getInstructors = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors`);
};

export const getInstructor = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors/${id}`);
};

export const createInstructor = async (instructorData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors`, {
    method: 'POST',
    body: JSON.stringify(instructorData),
  });
};

export const updateInstructor = async (id: string, instructorData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(instructorData),
  });
};

export const deleteInstructor = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'DELETE',
  });
};

// Club APIs
export const getClubs = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs`);
};

export const getClub = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs/${id}`);
};

export const createClub = async (clubData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs`, {
    method: 'POST',
    body: JSON.stringify(clubData),
  });
};

export const updateClub = async (id: string, clubData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clubData),
  });
};

export const deleteClub = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs/${id}`, {
    method: 'DELETE',
  });
};

// Restaurant APIs
export const getRestaurants = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants`);
};

export const getRestaurant = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants/${id}`);
};

export const createRestaurant = async (restaurantData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants`, {
    method: 'POST',
    body: JSON.stringify(restaurantData),
  });
};

export const updateRestaurant = async (id: string, restaurantData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(restaurantData),
  });
};

export const deleteRestaurant = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants/${id}`, {
    method: 'DELETE',
  });
};

// Reservation APIs
export const getReservations = async (restaurantId?: string) => {
  const url = restaurantId 
    ? `${API_BASE_URL}/api/reservations?restaurant_id=${restaurantId}`
    : `${API_BASE_URL}/api/reservations`;
  return authenticatedFetch(url);
};

export const getReservation = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/reservations/${id}`);
};

export const createReservation = async (reservationData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/reservations`, {
    method: 'POST',
    body: JSON.stringify(reservationData),
  });
};

export const updateReservation = async (id: string, reservationData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reservationData),
  });
};

export const deleteReservation = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/reservations/${id}`, {
    method: 'DELETE',
  });
};

// Office APIs
export const getOffices = async (clubId?: string) => {
  const url = clubId 
    ? `${API_BASE_URL}/api/offices?club_id=${clubId}`
    : `${API_BASE_URL}/api/offices`;
  return authenticatedFetch(url);
};

export const getOffice = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/offices/${id}`);
};

export const createOffice = async (officeData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/offices`, {
    method: 'POST',
    body: JSON.stringify(officeData),
  });
};

export const updateOffice = async (id: string, officeData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/offices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(officeData),
  });
};

export const deleteOffice = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/offices/${id}`, {
    method: 'DELETE',
  });
};

// Office Booking APIs
export const getOfficeBookings = async (officeId?: string, memberId?: string) => {
  const params = new URLSearchParams();
  if (officeId) params.append('office_id', officeId);
  if (memberId) params.append('member_id', memberId);
  
  const url = params.toString() 
    ? `${API_BASE_URL}/api/office-bookings?${params.toString()}`
    : `${API_BASE_URL}/api/office-bookings`;
  return authenticatedFetch(url);
};

export const getOfficeBooking = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/office-bookings/${id}`);
};

export const createOfficeBooking = async (bookingData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/office-bookings`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

export const updateOfficeBooking = async (id: string, bookingData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/office-bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData),
  });
};

export const deleteOfficeBooking = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/office-bookings/${id}`, {
    method: 'DELETE',
  });
};

// User Management APIs
export const getUsers = async (role?: string, clubId?: string) => {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (clubId) params.append('club_id', clubId);
  
  const url = params.toString() 
    ? `${API_BASE_URL}/api/users?${params.toString()}`
    : `${API_BASE_URL}/api/users`;
  return authenticatedFetch(url);
};

export const getUser = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users/${id}`);
};

export const createUser = async (userData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id: string, userData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
  });
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/me/change-password`, {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
};
