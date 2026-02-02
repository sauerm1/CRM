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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffices.map((office) => (
            <div
              key={office.id}
              onClick={() => router.push(`/dashboard/offices/${office.id}`)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{office.name}</h3>
                {office.active ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">{getClubName(office.club_id)}</p>
              
              <div className="mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {getOfficeTypeLabel(office.type)}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{office.description}</p>

              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>Capacity: {office.capacity} {office.capacity === 1 ? 'person' : 'people'}</p>
                <p>Hourly: ${office.hourly_rate}/hr • Daily: ${office.daily_rate}/day</p>
              </div>

              {office.amenities && office.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {office.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {office.amenities.length > 3 && (
                    <span className="text-gray-500 text-xs px-2 py-1">
                      +{office.amenities.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
