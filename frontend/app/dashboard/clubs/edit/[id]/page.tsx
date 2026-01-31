'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClub, updateClub, deleteClub, getInstructors } from '@/lib/api';
import type { Club, Instructor } from '@/types';

export default function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [club, setClub] = useState<Club | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    loadClub();
  }, [resolvedParams.id]);

  const loadClub = async () => {
    try {
      const [clubData, instructorsData] = await Promise.all([
        getClub(resolvedParams.id),
        getInstructors()
      ]);
      setClub(clubData);
      
      // Filter instructors assigned to this club
      const clubInstructors = instructorsData.filter(instructor => 
        instructor.club_ids?.includes(resolvedParams.id)
      );
      setInstructors(clubInstructors);
    } catch (error) {
      console.error('Failed to load club:', error);
      alert('Failed to load club');
      router.push('/dashboard/clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;

    setSaving(true);
    try {
      await updateClub(resolvedParams.id, club);
      router.push('/dashboard/clubs');
    } catch (error: any) {
      console.error('Failed to update club:', error);
      alert('Failed to update club: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!club) return;
    
    if (window.confirm(`Are you sure you want to delete "${club.name}"? This will affect all associated members, classes, and instructors.`)) {
      try {
        await deleteClub(resolvedParams.id);
        router.push('/dashboard/clubs');
      } catch (error: any) {
        console.error('Failed to delete club:', error);
        alert('Failed to delete club: ' + error.message);
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

  if (!club) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href="/dashboard/clubs"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Back to Clubs
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Edit Club</h1>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete Club
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Club Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={club.name}
                onChange={(e) => setClub({ ...club, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                required
                value={club.address}
                onChange={(e) => setClub({ ...club, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={club.city}
                  onChange={(e) => setClub({ ...club, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-900 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  required
                  maxLength={2}
                  value={club.state}
                  onChange={(e) => setClub({ ...club, state: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-900 mb-2">
                  Zip Code *
                </label>
                <input
                  type="text"
                  id="zip_code"
                  required
                  value={club.zip_code}
                  onChange={(e) => setClub({ ...club, zip_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={club.phone}
                onChange={(e) => setClub({ ...club, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={club.email}
                onChange={(e) => setClub({ ...club, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={club.active}
                onChange={(e) => setClub({ ...club, active: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active (club is currently operational)
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/dashboard/clubs"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Instructors Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Instructors at this Club ({instructors.length})
              </h3>
              <Link
                href="/dashboard/instructors/new"
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-medium"
              >
                + Add Instructor
              </Link>
            </div>
            
            {instructors.length > 0 ? (
              <div className="space-y-3">
                {instructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{instructor.name}</h4>
                        {instructor.active ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">{instructor.specialty}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>📧 {instructor.email}</span>
                          <span>📱 {instructor.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/instructors/edit/${instructor.id}`}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">No instructors assigned to this club yet.</p>
                <Link
                  href="/dashboard/instructors/new"
                  className="inline-block mt-2 text-green-600 hover:text-green-700 font-medium"
                >
                  Add an instructor →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}