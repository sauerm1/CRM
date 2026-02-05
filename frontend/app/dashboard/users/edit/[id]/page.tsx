'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, updateUser, getClubs } from '@/lib/api';
import { User, Club } from '@/types';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'all_services',
    assigned_club_ids: [] as string[],
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      const [userData, clubsData] = await Promise.all([
        getUser(resolvedParams.id),
        getClubs()
      ]);
      
      setClubs(clubsData);
      setFormData({
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        password: '', // Leave empty unless changing password
        role: userData.role || 'all_services',
        assigned_club_ids: userData.assigned_club_ids || [],
        active: userData.active !== undefined ? userData.active : true,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Only include password if it's been changed
      const updateData: any = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        assigned_club_ids: formData.assigned_club_ids,
        active: formData.active,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(resolvedParams.id, updateData);
      alert('User updated successfully!');
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard/users')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Users
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit User</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
              Password
            </label>
            <input
              type="password"
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              placeholder="Leave empty to keep current password"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password. Minimum 8 characters if changing.</p>
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
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
