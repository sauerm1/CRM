'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClubs, deleteClub } from '@/lib/api';
import type { Club } from '@/types';

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data || []);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete club "${name}"? This will affect all associated members, classes, and instructors.`)) {
      try {
        await deleteClub(id);
        await loadClubs();
      } catch (error: any) {
        console.error('Failed to delete club:', error);
        alert('Failed to delete club: ' + error.message);
      }
    }
  };

  const getFilteredClubs = () => {
    if (!searchTerm) return clubs;
    
    return clubs.filter(club => {
      const searchLower = searchTerm.toLowerCase();
      return (
        club.name?.toLowerCase().includes(searchLower) ||
        club.city?.toLowerCase().includes(searchLower) ||
        club.state?.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredClubs = getFilteredClubs();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Dashboard
              </Link>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Club Locations</h1>
              <Link
                href="/dashboard/clubs/new"
                className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium"
              >
                + Add New Club
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Clubs ({filteredClubs.length}{clubs.length !== filteredClubs.length && ` of ${clubs.length}`})
            </h2>
            <div className="w-72">
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? `No clubs found matching "${searchTerm}"` : 'No clubs found. Add your first club location!'}
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club) => (
                    <tr 
                      key={club.id}
                      onClick={() => router.push(`/dashboard/clubs/edit/${club.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{club.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{club.address}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{club.city}, {club.state} {club.zip_code}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{club.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          club.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {club.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/dashboard/clubs/edit/${club.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(club.id!, club.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
