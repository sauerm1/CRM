'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createReservation, getMembers, getRestaurant } from '@/lib/api';
import type { Member, Restaurant } from '@/types';

export default function NewReservationPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [formData, setFormData] = useState({
    member_id: '',
    party_size: 2,
    date_time: '',
    status: 'confirmed',
    special_requests: '',
    notes: '',
  });

  useEffect(() => {
    fetchMembers();
    fetchRestaurant();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const fetchRestaurant = async () => {
    try {
      const data = await getRestaurant(restaurantId);
      setRestaurant(data);
    } catch (err) {
      console.error('Failed to load restaurant:', err);
    }
  };

  const validateReservationTime = (dateTimeStr: string): boolean => {
    if (!restaurant || !dateTimeStr) return true;
    
    const selectedDate = new Date(dateTimeStr);
    const selectedTime = selectedDate.toTimeString().slice(0, 5); // HH:MM format
    
    if (selectedTime < restaurant.opening_time || selectedTime > restaurant.closing_time) {
      setTimeError(`Restaurant is only open from ${restaurant.opening_time} to ${restaurant.closing_time}`);
      return false;
    }
    
    setTimeError('');
    return true;
  };

  const filteredMembers = members.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(search) ||
      member.last_name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    );
  });

  const selectedMember = members.find(m => m.id === formData.member_id);

  const handleSelectMember = (member: Member) => {
    setFormData({ ...formData, member_id: member.id! });
    setSearchTerm(`${member.first_name} ${member.last_name}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateReservationTime(formData.date_time)) {
      return;
    }
    
    setLoading(true);

    try {
      await createReservation({
        ...formData,
        restaurant_id: restaurantId,
      });
      router.push(`/dashboard/restaurants/${restaurantId}/reservations`);
    } catch (err) {
      alert('Failed to create reservation');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href={`/dashboard/restaurants/${restaurantId}/reservations`}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Back to Reservations
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">New Reservation</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member *
            </label>
            <div className="relative">
              <input
                type="text"
                required={!formData.member_id}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setFormData({ ...formData, member_id: '' });
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a member..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No members found</div>
                  )}
                </div>
              )}
            </div>
            {selectedMember && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
              {restaurant && (
                <span className="ml-2 text-xs text-gray-500">
                  (Restaurant hours: {restaurant.opening_time} - {restaurant.closing_time})
                </span>
              )}
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date_time}
              onChange={(e) => {
                setFormData({ ...formData, date_time: e.target.value });
                validateReservationTime(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {timeError && (
              <p className="mt-1 text-sm text-red-600">{timeError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.party_size}
              onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              rows={2}
              placeholder="Dietary restrictions, seating preferences, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Internal notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Reservation'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
