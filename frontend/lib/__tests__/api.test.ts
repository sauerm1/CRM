/**
 * @jest-environment jsdom
 */

import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getClasses,
  getClass,
  getClassWithMembers,
  createClass,
  updateClass,
  deleteClass,
  enrollMember,
  unenrollMember,
  login,
  register,
  logout,
  getCurrentUser,
} from '../api';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Client Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Member APIs', () => {
    test('getMembers should fetch all members', async () => {
      const mockMembers = [
        { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      } as Response);

      const result = await getMembers();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/members', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockMembers);
    });

    test('getMember should fetch a single member by ID', async () => {
      const mockMember = { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      } as Response);

      const result = await getMember('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/members/1', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockMember);
    });

    test('createMember should create a new member', async () => {
      const newMember = { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com' };
      const createdMember = { id: '3', ...newMember };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdMember,
      } as Response);

      const result = await createMember(newMember);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newMember),
      });
      expect(result).toEqual(createdMember);
    });

    test('updateMember should update an existing member', async () => {
      const updates = { first_name: 'John Updated' };
      const updatedMember = { id: '1', first_name: 'John Updated', last_name: 'Doe', email: 'john@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedMember,
      } as Response);

      const result = await updateMember('1', updates);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/members/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedMember);
    });

    test('deleteMember should delete a member', async () => {
      const deleteResponse = { message: 'Member deleted' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse,
      } as Response);

      const result = await deleteMember('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/members/1', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(result).toEqual(deleteResponse);
    });

    test('getMember should throw error when member not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Member not found' }),
      } as Response);

      await expect(getMember('999')).rejects.toThrow('Member not found');
    });
  });

  describe('Class APIs', () => {
    test('getClasses should fetch all classes', async () => {
      const mockClasses = [
        { id: '1', name: 'Yoga', instructor: 'John Doe', capacity: 20 },
        { id: '2', name: 'Pilates', instructor: 'Jane Smith', capacity: 15 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClasses,
      } as Response);

      const result = await getClasses();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockClasses);
    });

    test('getClass should fetch a single class by ID', async () => {
      const mockClass = { id: '1', name: 'Yoga', instructor: 'John Doe', capacity: 20 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClass,
      } as Response);

      const result = await getClass('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/1', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockClass);
    });

    test('getClassWithMembers should fetch class with enrolled members', async () => {
      const mockClassWithMembers = {
        id: '1',
        name: 'Yoga',
        enrolled_members_details: [{ id: '1', first_name: 'John', last_name: 'Doe' }],
        wait_list_details: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClassWithMembers,
      } as Response);

      const result = await getClassWithMembers('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/1/details', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockClassWithMembers);
    });

    test('createClass should create a new class', async () => {
      const newClass = { name: 'Zumba', instructor: 'Alice', capacity: 25 };
      const createdClass = { id: '3', ...newClass };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdClass,
      } as Response);

      const result = await createClass(newClass);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newClass),
      });
      expect(result).toEqual(createdClass);
    });

    test('updateClass should update an existing class', async () => {
      const updates = { capacity: 30 };
      const updatedClass = { id: '1', name: 'Yoga', instructor: 'John Doe', capacity: 30 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedClass,
      } as Response);

      const result = await updateClass('1', updates);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedClass);
    });

    test('deleteClass should delete a class', async () => {
      const deleteResponse = { message: 'Class deleted' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse,
      } as Response);

      const result = await deleteClass('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/1', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('Enrollment APIs', () => {
    test('enrollMember should enroll a member in a class', async () => {
      const enrollResponse = { message: 'Member enrolled successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => enrollResponse,
      } as Response);

      const result = await enrollMember('class1', 'member1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/class1/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ member_id: 'member1' }),
      });
      expect(result).toEqual(enrollResponse);
    });

    test('unenrollMember should unenroll a member from a class', async () => {
      const unenrollResponse = { message: 'Member unenrolled successfully' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => unenrollResponse,
      } as Response);

      const result = await unenrollMember('class1', 'member1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/classes/class1/unenroll/member1', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(result).toEqual(unenrollResponse);
    });
  });

  describe('Auth APIs', () => {
    test('login should authenticate user', async () => {
      const loginResponse = { user: { id: '1', email: 'test@example.com' }, token: 'abc123' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      } as Response);

      const result = await login('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(result).toEqual(loginResponse);
    });

    test('register should create new user', async () => {
      const registerResponse = { user: { id: '2', email: 'new@example.com', name: 'New User' } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => registerResponse,
      } as Response);

      const result = await register('new@example.com', 'password123', 'New User');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'new@example.com', password: 'password123', name: 'New User' }),
      });
      expect(result).toEqual(registerResponse);
    });

    test('logout should log out user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      } as Response);

      const result = await logout();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      expect(result).toEqual({ message: 'Logged out' });
    });

    test('getCurrentUser should fetch current user', async () => {
      const userResponse = { id: '1', email: 'test@example.com', name: 'Test User' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => userResponse,
      } as Response);

      const result = await getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/me', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(userResponse);
    });

    test('login should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response);

      await expect(login('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getMembers()).rejects.toThrow('Network error');
    });

    test('should handle server errors with custom message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      } as Response);

      await expect(getMembers()).rejects.toThrow('Internal server error');
    });

    test('should handle server errors without error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(getMembers()).rejects.toThrow('An error occurred');
    });
  });
});
