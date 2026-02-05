'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUser, getClubs } from '@/lib/api';
import { Club } from '@/types';

export default function NewUserPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'all_services',
    assigned_club_ids: [] as string[],
    active: true,
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData);
      alert('User created successfully!');
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClubToggle = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_club_ids: prev.assigned_club_ids.includes(clubId)
        ? prev.assigned_club_ids.filter(id => id !== clubId)
        : [...prev.assigned_club_ids, clubId]
    }));
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard/users')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Users
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New User</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            >
              <option value="admin">Admin - All services at all locations</option>
              <option value="club_manager">Club Manager - All services at assigned locations (can manage users)</option>
              <option value="all_services">All Services - All services at assigned locations</option>
              <option value="restaurant">Restaurant - Restaurant service only</option>
              <option value="office">Office/Co-working - Office service only</option>
              <option value="classes">Classes - Fitness classes only</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'admin' && 'Full access to all services at all locations'}
              {formData.role === 'club_manager' && 'Can manage all services and users at assigned locations'}
              {formData.role === 'all_services' && 'Access to all services at assigned locations only'}
              {formData.role === 'restaurant' && 'Access to restaurant management only'}
              {formData.role === 'office' && 'Access to office/co-working management only'}
              {formData.role === 'classes' && 'Access to fitness class management only'}
            </p>
          </div>

          {/* Assigned Clubs */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Assigned Locations {formData.role !== 'admin' && '*'}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {formData.role === 'admin' 
                ? 'Admin role has access to all locations automatically' 
                : formData.role === 'club_manager'
                ? 'Club managers can manage all services and users at these locations'
                : 'Select the locations this user can access'}
            </p>
            <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {clubs.map((club) => (
                <label key={club.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.assigned_club_ids.includes(club.id || '')}
                    onChange={() => handleClubToggle(club.id || '')}
                    className="mr-2"
                  />
                  <span className="text-gray-900">{club.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/users')}
            className="bg-gray-300 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
