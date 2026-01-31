const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
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
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

// OAuth URLs
export const getGoogleLoginUrl = () => `${API_BASE_URL}/auth/google`;
export const getGitHubLoginUrl = () => `${API_BASE_URL}/auth/github`;

// Member APIs (CRM)
export const getMembers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/members`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getMember = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createMember = async (member: any) => {
  const response = await fetch(`${API_BASE_URL}/api/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(member),
  });
  return handleResponse(response);
};

export const updateMember = async (id: string, member: any) => {
  const response = await fetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(member),
  });
  return handleResponse(response);
};

export const deleteMember = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/members/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// Class APIs
export const getClasses = async () => {
  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getClass = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getClassWithMembers = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}/details`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createClass = async (classData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(classData),
  });
  return handleResponse(response);
};

export const updateClass = async (id: string, classData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(classData),
  });
  return handleResponse(response);
};

export const deleteClass = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const enrollMember = async (classId: string, memberId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ member_id: memberId }),
  });
  return handleResponse(response);
};

export const unenrollMember = async (classId: string, memberId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/unenroll/${memberId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// Instructor APIs
export const getInstructors = async () => {
  const response = await fetch(`${API_BASE_URL}/api/instructors`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getInstructor = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createInstructor = async (instructorData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/instructors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(instructorData),
  });
  return handleResponse(response);
};

export const updateInstructor = async (id: string, instructorData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(instructorData),
  });
  return handleResponse(response);
};

export const deleteInstructor = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/instructors/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
