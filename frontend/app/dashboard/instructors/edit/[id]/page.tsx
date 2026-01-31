'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInstructor, updateInstructor, deleteInstructor, getClubs } from '@/lib/api';
import type { Instructor, Club } from '@/types';

export default function EditInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    active: true,
    club_ids: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [instructorData, clubsData] = await Promise.all([
        getInstructor(id),
        getClubs()
      ]);
      
      setClubs(clubsData || []);
      setFormData({
        name: instructorData.name || '',
        email: instructorData.email || '',
        phone: instructorData.phone || '',
        specialty: instructorData.specialty || '',
        bio: instructorData.bio || '',
        active: instructorData.active ?? true,
        club_ids: instructorData.club_ids || [],
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleClubToggle = (clubId: string) => {
    setFormData(prev => ({
      ...prev,
      club_ids: prev.club_ids.includes(clubId)
        ? prev.club_ids.filter(id => id !== clubId)
        : [...prev.club_ids, clubId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateInstructor(id, formData);
      router.push('/dashboard/instructors');
    } catch (error: any) {
      console.error('Failed to update instructor:', error);
      alert('Failed to update instructor: ' + error.message);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${formData.name}?`)) {
      try {
        await deleteInstructor(id);
        router.push('/dashboard/instructors');
      } catch (error: any) {
        console.error('Failed to delete instructor:', error);
        alert('Failed to delete instructor: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard/instructors" className="text-blue-600 hover:underline">
            Back to Instructors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href="/dashboard/instructors"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Back to Instructors
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Instructor</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-900">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Yoga, Pilates, CrossFit, etc."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-900">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Club Locations *
                  </label>
                  <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-gray-50">
                    {clubs.length === 0 ? (
                      <p className="text-sm text-gray-500">No clubs available. <Link href="/dashboard/clubs/new" className="text-blue-600 hover:underline">Create one first</Link>.</p>
                    ) : (
                      clubs.map((club) => (
                        <div key={club.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`club-${club.id}`}
                            checked={formData.club_ids.includes(club.id!)}
                            onChange={() => handleClubToggle(club.id!)}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <label htmlFor={`club-${club.id}`} className="ml-2 block text-sm text-gray-900">
                            {club.name} - {club.city}, {club.state}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.club_ids.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one club location</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Active (available for class assignments)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 font-medium"
              >
                Delete Instructor
              </button>
              <Link
                href="/dashboard/instructors"
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
