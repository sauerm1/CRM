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
