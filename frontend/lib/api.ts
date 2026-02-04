const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Track if we're currently refreshing the token to avoid multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Helper function to refresh the access token
const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  }).then(async (response) => {
    isRefreshing = false;
    refreshPromise = null;
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    return response.json();
  }).catch((error) => {
    isRefreshing = false;
    refreshPromise = null;
    throw error;
  });

  return refreshPromise;
};

// Helper function to handle API responses with automatic token refresh
const handleResponse = async (response: Response, originalRequest?: () => Promise<Response>) => {
  // If we get a 401 and we have a function to retry the request
  if (response.status === 401 && originalRequest) {
    try {
      // Try to refresh the token
      await refreshAccessToken();
      // Retry the original request
      const retryResponse = await originalRequest();
      return handleResponse(retryResponse);
    } catch (refreshError) {
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  // Handle 204 No Content responses
  if (response.status === 204) {
    return { message: 'Success' };
  }
  return response.json();
};

// Helper to make authenticated API calls with auto-refresh
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const makeRequest = () => fetch(url, { ...options, credentials: 'include' });
  const response = await makeRequest();
  return handleResponse(response, makeRequest);
};

// Auth APIs
export const register = async (email: string, password: string, name: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(response);
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (response.ok) {
    return response.json();
  }
  return { message: 'Logged out' };
};

export const getCurrentUser = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/me`);
};

// OAuth URLs
export const getGoogleLoginUrl = () => `${API_BASE_URL}/auth/google`;
export const getGitHubLoginUrl = () => `${API_BASE_URL}/auth/github`;

// Member APIs (CRM)
export const getMembers = async () => {
  return authenticatedFetch(`${API_BASE_URL}/api/members`);
};

export const getMember = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members/${id}`);
  return handleResponse(response);
};

export const createMember = async (member: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
};

export const updateMember = async (id: string, member: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
};

export const updateClass = async (id: string, classData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(instructorData),
  });
};

export const updateInstructor = async (id: string, instructorData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clubData),
  });
};

export const updateClub = async (id: string, clubData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/clubs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(restaurantData),
  });
};

export const updateRestaurant = async (id: string, restaurantData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/restaurants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData),
  });
};

export const updateReservation = async (id: string, reservationData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(officeData),
  });
};

export const updateOffice = async (id: string, officeData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/offices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
};

export const updateOfficeBooking = async (id: string, bookingData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/office-bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id: string, userData: any) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string) => {
  return authenticatedFetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
  });
};
