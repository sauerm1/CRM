'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOffice, updateOffice, getClubs } from '@/lib/api';
import { Office, Club } from '@/types';

export default function EditOfficePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    club_id: '',
    name: '',
    description: '',
    type: 'private',
    capacity: 1,
    amenities: '',
    hourly_rate: 15,
    daily_rate: 90,
    active: true,
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [officeData, clubsData] = await Promise.all([
        getOffice(id),
        getClubs()
      ]);
      
      setClubs(clubsData);
      setFormData({
        club_id: officeData.club_id || '',
        name: officeData.name,
        description: officeData.description,
        type: officeData.type,
        capacity: officeData.capacity,
        amenities: officeData.amenities?.join(', ') || '',
        hourly_rate: officeData.hourly_rate,
        daily_rate: officeData.daily_rate,
        active: officeData.active,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading office data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const officeData = {
        ...formData,
        club_id: formData.club_id || undefined,
        amenities: amenitiesArray,
        capacity: Number(formData.capacity),
        hourly_rate: Number(formData.hourly_rate),
        daily_rate: Number(formData.daily_rate),
      };

      await updateOffice(id, officeData);
      alert('Office updated successfully!');
      router.push(`/dashboard/offices/${id}`);
    } catch (error: any) {
      console.error('Error updating office:', error);
      alert('Error updating office: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push(`/dashboard/offices/${id}`)}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Office Details
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Office</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Club *
            </label>
            <select
              required
              value={formData.club_id}
              onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            >
              <option value="">Select a club</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Office Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            >
              <option value="private">Private Office</option>
              <option value="shared">Shared Workspace</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="phone_booth">Phone Booth</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Daily Rate ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              placeholder="e.g., wifi, monitor, whiteboard, desk"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-900">
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
            onClick={() => router.push(`/dashboard/offices/${id}`)}
            className="bg-gray-300 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
