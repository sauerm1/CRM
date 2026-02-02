'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createOfficeBooking, getOffice, getMembers } from '@/lib/api';
import { Office, Member } from '@/types';

export default function NewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const officeId = params.id as string;

  const [office, setOffice] = useState<Office | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '17:00',
    notes: '',
  });

  useEffect(() => {
    if (officeId) {
      fetchData();
    }
  }, [officeId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(member =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members.slice(0, 10));
    }
  }, [searchTerm, members]);

  const fetchData = async () => {
    try {
      const [officeData, membersData] = await Promise.all([
        getOffice(officeId),
        getMembers()
      ]);
      
      setOffice(officeData);
      setMembers(membersData);
      setFilteredMembers(membersData.slice(0, 10));

      // Set default dates to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_date: today,
        end_date: today,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    if (!office || !formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
      return 0;
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
    const hours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));
    
    return hours * office.hourly_rate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id) {
      alert('Please select a member');
      return;
    }

    setSaving(true);

    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        setSaving(false);
        return;
      }

      const bookingData = {
        office_id: officeId,
        member_id: formData.member_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_cost: calculateCost(),
        notes: formData.notes,
        status: 'confirmed',
      };

      await createOfficeBooking(bookingData);
      alert('Booking created successfully!');
      router.push(`/dashboard/offices/${officeId}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Error creating booking: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const selectedMember = members.find(m => m.id === formData.member_id);

  if (loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (!office) {
    return <div className="p-8 text-gray-900">Office not found</div>;
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push(`/dashboard/offices/${officeId}`)}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Office
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">New Booking</h1>
      <p className="text-gray-600 mb-6">{office.name}</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Member * (Members Only)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members by name or email..."
              className="w-full border border-gray-300 rounded-md p-2 mb-2 text-gray-900"
            />
            {selectedMember ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                <div className="flex justify-between items-center">
                  <div className="text-gray-900">
                    <p className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                    <p className="text-sm text-gray-600">{selectedMember.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, member_id: '' })}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="p-3 text-gray-600">No members found</p>
                ) : (
                  filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, member_id: member.id || '' });
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-200 text-gray-900"
                    >
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              />
            </div>
          </div>

          {/* Cost Display */}
          <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
            <p className="text-sm text-gray-600">Estimated Cost</p>
            <p className="text-2xl font-bold text-gray-900">${calculateCost().toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">
              Rate: ${office.hourly_rate}/hour
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
              rows={3}
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={saving || !formData.member_id}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Creating...' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/offices/${officeId}`)}
            className="bg-gray-300 text-gray-900 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
