'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOffice, getOfficeBookings, getClubs, deleteOffice } from '@/lib/api';
import { Office, OfficeBooking, Club } from '@/types';

export default function OfficeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [office, setOffice] = useState<Office | null>(null);
  const [bookings, setBookings] = useState<OfficeBooking[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const officeData = await getOffice(id);
      setOffice(officeData);
      
      const bookingsData = await getOfficeBookings(id);
      setBookings(bookingsData);

      if (officeData.club_id) {
        const clubsData = await getClubs();
        const foundClub = clubsData.find((c: Club) => c.id === officeData.club_id);
        if (foundClub) setClub(foundClub);
      }
    } catch (error) {
      console.error('Error fetching office:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOfficeTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      private: 'Private Office',
      shared: 'Shared Workspace',
      meeting_room: 'Meeting Room',
      phone_booth: 'Phone Booth'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    if (!office) return;
    if (!window.confirm(`Are you sure you want to delete office space "${office.name}"? This action cannot be undone.`)) return;

    try {
      await deleteOffice(office.id!);
      router.push('/dashboard/offices');
    } catch (error: any) {
      console.error('Failed to delete office:', error);
      alert('Failed to delete office: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (!office) {
    return <div className="p-8 text-gray-900">Office not found</div>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard/offices')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Offices
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{office.name}</h1>
            <p className="text-gray-600 mt-1">{club?.name || 'No club assigned'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/offices/edit/${id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit Office
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => router.push(`/dashboard/offices/${id}/bookings/new`)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              New Booking
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Office Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Type:</span> {getOfficeTypeLabel(office.type)}</p>
              <p><span className="font-medium">Capacity:</span> {office.capacity} {office.capacity === 1 ? 'person' : 'people'}</p>
              <p><span className="font-medium">Hourly Rate:</span> ${office.hourly_rate}/hour</p>
              <p><span className="font-medium">Daily Rate:</span> ${office.daily_rate}/day</p>
              <p><span className="font-medium">Status:</span> {office.active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700">{office.description}</p>

            {office.amenities && office.amenities.length > 0 && (
              <>
                <h3 className="text-md font-semibold text-gray-900 mt-4 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {office.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const start = new Date(booking.start_time);
                  const end = new Date(booking.end_time);
                  const durationHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {start.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {end.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.total_cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
