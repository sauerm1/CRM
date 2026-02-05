'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMember, deleteMember, getClasses, enrollMember } from '@/lib/api';
import type { Member, Class } from '@/types';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
  const [waitlistClasses, setWaitlistClasses] = useState<Class[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMember();
  }, []);

  const loadMember = async () => {
    try {
      const [memberData, classesData] = await Promise.all([
        getMember(id),
        getClasses()
      ]);
      setMember(memberData);
      
      // Filter classes where this member is enrolled or on waitlist
      const enrolled = classesData.filter((cls: Class) => 
        cls.enrolled_members?.includes(id)
      );
      const waitlist = classesData.filter((cls: Class) => 
        cls.wait_list?.includes(id)
      );
      
      // Filter available classes (not enrolled and not on waitlist, and in the future)
      const now = new Date();
      const available = classesData.filter((cls: Class) => {
        const classDate = new Date(cls.date);
        return !cls.enrolled_members?.includes(id) && 
               !cls.wait_list?.includes(id) &&
               classDate >= now;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEnrolledClasses(enrolled);
      setWaitlistClasses(waitlist);
      setAvailableClasses(available);
      setSelectedClasses(new Set());
    } catch (error: any) {
      console.error('Failed to load member:', error);
      setError('Failed to load member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${member?.first_name} ${member?.last_name}?`)) {
      try {
        await deleteMember(id);
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete member: ' + error.message);
      }
    }
  };

  const toggleClassSelection = (classId: string) => {
    const newSelection = new Set(selectedClasses);
    if (newSelection.has(classId)) {
      newSelection.delete(classId);
    } else {
      newSelection.add(classId);
    }
    setSelectedClasses(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedClasses.size === availableClasses.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(availableClasses.map(c => c.id)));
    }
  };

  const handleEnrollInSelected = async () => {
    if (selectedClasses.size === 0) {
      alert('Please select at least one class to enroll in');
      return;
    }

    if (!window.confirm(`Enroll ${member?.first_name} ${member?.last_name} in ${selectedClasses.size} class(es)?`)) {
      return;
    }

    setEnrolling(true);
    try {
      await Promise.all(
        Array.from(selectedClasses).map(classId => enrollMember(classId, id))
      );
      alert(`Successfully enrolled in ${selectedClasses.size} class(es)!`);
      await loadMember();
    } catch (error: any) {
      console.error('Failed to enroll in classes:', error);
      alert('Failed to enroll in some classes: ' + error.message);
    } finally {
      setEnrolling(false);
    }
  };

  const getFilteredAvailableClasses = () => {
    if (selectedDates.size === 0) return availableClasses;
    
    const selectedDateStr = Array.from(selectedDates)[0];
    return availableClasses.filter(cls => {
      // Get the date part from the class date, handling timezone properly
      const classDate = new Date(cls.date);
      const year = classDate.getFullYear();
      const month = String(classDate.getMonth() + 1).padStart(2, '0');
      const day = String(classDate.getDate()).padStart(2, '0');
      const classDateStr = `${year}-${month}-${day}`;
      
      return classDateStr === selectedDateStr;
    });
  };

  const getUniqueDates = () => {
    const dates = Array.from(new Set(availableClasses.map(c => c.date))).sort();
    return dates;
  };

  const toggleDateSelection = (date: string) => {
    const newSelection = new Set(selectedDates);
    if (newSelection.has(date)) {
      newSelection.delete(date);
    } else {
      newSelection.add(date);
    }
    setSelectedDates(newSelection);
  };

  const clearDateFilters = () => {
    setSelectedDates(new Set());
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'suspended':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Member not found'}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Member Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {member.first_name} {member.last_name}
                </h2>
                <span className={getStatusBadgeClass(member.status)}>
                  {member.status}
                </span>
              </div>
              {member.auto_renewal && (
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <p className="text-white text-sm font-medium">🔄 Auto-Renewal Active</p>
                </div>
              )}
            </div>
          </div>

          {/* Member Details */}
          <div className="px-6 py-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{member.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">{member.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
                  <p className="text-gray-900">{member.emergency_contact}</p>
                </div>
              </div>
            </div>

            {/* Membership Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Membership Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Membership Type</label>
                  <p className="text-gray-900 capitalize">{member.membership_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <p className="text-gray-900 capitalize">{member.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Join Date</label>
                  <p className="text-gray-900">{new Date(member.join_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Expiry Date</label>
                  <p className="text-gray-900">
                    {member.expiry_date ? new Date(member.expiry_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Auto-Renewal</label>
                  <p className="text-gray-900">{member.auto_renewal ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>

            {/* Billing History */}
            {member.billing_history && member.billing_history.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Billing History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {member.billing_history.map((entry, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap">${entry.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{entry.description}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              entry.status === 'paid' ? 'bg-green-100 text-green-800' :
                              entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              entry.status === 'failed' ? 'bg-red-100 text-red-800' :
                              entry.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {member.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
              </div>
            )}

            {/* Enrolled Classes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Enrolled Classes ({enrolledClasses.length})
              </h3>
              {enrolledClasses.length === 0 ? (
                <p className="text-gray-500">Not enrolled in any classes</p>
              ) : (
                <div className="space-y-3">
                  {enrolledClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/dashboard/classes/${cls.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{cls.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>👤 {cls.instructor}</span>
                            <span>📅 {new Date(cls.date).toLocaleDateString()}</span>
                            <span>⏰ {cls.start_time} - {cls.end_time}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Enrolled
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Waitlist Classes */}
            {waitlistClasses.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Waitlist ({waitlistClasses.length})
                </h3>
                <div className="space-y-3">
                  {waitlistClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/dashboard/classes/${cls.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{cls.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>👤 {cls.instructor}</span>
                            <span>📅 {new Date(cls.date).toLocaleDateString()}</span>
                            <span>⏰ {cls.start_time} - {cls.end_time}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Waitlist
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Available Classes to Enroll */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Available Classes ({getFilteredAvailableClasses().length})
                </h3>
                {availableClasses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                    >
                      {selectedClasses.size === availableClasses.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleEnrollInSelected}
                      disabled={enrolling || selectedClasses.size === 0}
                      className="px-4 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {enrolling ? 'Enrolling...' : `Enroll in Selected (${selectedClasses.size})`}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Date Filter */}
              {availableClasses.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Date
                      </label>
                      <input
                        type="date"
                        value={selectedDates.size > 0 ? Array.from(selectedDates)[0] : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDates(new Set([e.target.value]));
                          } else {
                            setSelectedDates(new Set());
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                      />
                    </div>
                    {selectedDates.size > 0 && (
                      <button
                        onClick={clearDateFilters}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {availableClasses.length === 0 ? (
                <p className="text-gray-500">No upcoming classes available for enrollment</p>
              ) : getFilteredAvailableClasses().length === 0 ? (
                <p className="text-gray-500">No classes found in the selected date range</p>
              ) : (
                <div className="space-y-3">
                  {getFilteredAvailableClasses().map((cls) => {
                    const isSelected = selectedClasses.has(cls.id);
                    const isFull = (cls.enrolled_members?.length || 0) >= cls.capacity;
                    
                    return (
                      <div
                        key={cls.id}
                        className={`p-4 border rounded-lg transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleClassSelection(cls.id)}
                            className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{cls.description}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                  <span>👤 {cls.instructor}</span>
                                  <span>📅 {new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span>⏰ {cls.start_time} - {cls.end_time}</span>
                                  <span>👥 {cls.enrolled_members?.length || 0}/{cls.capacity}</span>
                                </div>
                              </div>
                              {isFull && (
                                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  Full
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Link
                href={`/dashboard/edit/${member.id}`}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium"
              >
                Edit Member
              </Link>
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 font-medium"
              >
                Delete Member
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
