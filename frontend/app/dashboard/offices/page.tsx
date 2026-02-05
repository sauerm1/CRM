'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOffices, getClubs } from '@/lib/api';
import { Office, Club } from '@/types';

export default function OfficesPage() {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [officesData, clubsData] = await Promise.all([
        getOffices(),
        getClubs()
      ]);
      setOffices(officesData);
      setClubs(clubsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // If authentication error, the API will redirect to login
      if (error.message?.includes('Session expired') || error.message?.includes('Authentication required')) {
        // Let the API handle redirect
        return;
      }
      alert('Error loading offices: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getClubName = (clubId?: string) => {
    if (!clubId) return 'No Club';
    const club = clubs.find(c => c.id === clubId);
    return club?.name || 'Unknown Club';
  };

  const filteredOffices = selectedClub === 'all' 
    ? offices 
    : offices.filter(office => office.club_id === selectedClub);

  const getOfficeTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      private: 'Private Office',
      shared: 'Shared Workspace',
      meeting_room: 'Meeting Room',
      phone_booth: 'Phone Booth'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-900">Loading offices...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Office Spaces</h1>
        <button
          onClick={() => router.push('/dashboard/offices/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Office
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Filter by Club
        </label>
        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-64 text-gray-900"
        >
          <option value="all">All Clubs</option>
          {clubs.map(club => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {filteredOffices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No offices found. Some clubs may not have office spaces available.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Club</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Rates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffices.map((office) => (
                <tr 
                  key={office.id}
                  onClick={() => router.push(`/dashboard/offices/${office.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{office.name}</div>
                    {office.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">{office.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{getClubName(office.club_id)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getOfficeTypeLabel(office.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {office.capacity} {office.capacity === 1 ? 'person' : 'people'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      ${office.hourly_rate}/hr
                    </div>
                    <div className="text-xs text-gray-500">
                      ${office.daily_rate}/day
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      office.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {office.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
