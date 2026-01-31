'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createInstructor, getClubs } from '@/lib/api';
import type { Club } from '@/types';

export default function NewInstructorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data || []);
    } catch (error) {
      console.error('Failed to load clubs:', error);
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
    
    // Validate at least one club is selected
    if (formData.club_ids.length === 0) {
      alert('Please select at least one club');
      return;
    }
    
    setLoading(true);

    try {
      await createInstructor(formData);
      router.push('/dashboard/instructors');
    } catch (error: any) {
      console.error('Failed to create instructor:', error);
      alert('Failed to create instructor: ' + error.message);
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Add New Instructor</h1>
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Clubs *
                  </label>
                  {clubs.length > 0 ? (
                    <>
                      <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-gray-50">
                        {clubs.map((club) => (
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
                        ))}
                      </div>
                      {formData.club_ids.length === 0 && (
                        <p className="mt-2 text-sm text-red-600">Please select at least one club</p>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600">
                      No clubs available. <Link href="/dashboard/clubs/new" className="text-green-600 hover:text-green-700 font-medium">Create a club first</Link>
                    </div>
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
                disabled={loading}
                className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Instructor'}
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
