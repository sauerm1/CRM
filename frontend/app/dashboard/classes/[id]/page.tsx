'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClassWithMembers, getMembers, getClasses, enrollMember, unenrollMember, deleteClass } from '@/lib/api';
import type { ClassWithMembers, Member, Class } from '@/types';
import { use } from 'react';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [classData, setClassData] = useState<ClassWithMembers | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [recurringInstances, setRecurringInstances] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      const [classResponse, membersResponse, allClassesResponse] = await Promise.all([
        getClassWithMembers(resolvedParams.id),
        getMembers(),
        getClasses(),
      ]);
      setClassData(classResponse);
      setAllMembers(membersResponse || []);
      
      // If the class is recurring, find other instances
      if (classResponse.recurring) {
        const instances = allClassesResponse.filter((c: Class) => 
          c.recurring &&
          c.name === classResponse.name &&
          c.instructor === classResponse.instructor &&
          JSON.stringify(c.recurring_days) === JSON.stringify(classResponse.recurring_days)
        ).sort((a: Class, b: Class) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRecurringInstances(instances);
      } else {
        setRecurringInstances([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load class details');
      router.push('/dashboard/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (memberId: string) => {
    try {
      await enrollMember(resolvedParams.id, memberId);
      await loadData();
      setShowEnrollModal(false);
      setSearchTerm('');
      setSelectedMemberIds([]);
    } catch (error: any) {
      console.error('Failed to enroll member:', error);
      alert(error.message || 'Failed to enroll member');
    }
  };

  const handleEnrollSelected = async () => {
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one member to enroll');
      return;
    }

    try {
      // Enroll all selected members
      await Promise.all(
        selectedMemberIds.map(memberId => enrollMember(resolvedParams.id, memberId))
      );
      await loadData();
      setShowEnrollModal(false);
      setSearchTerm('');
      setSelectedMemberIds([]);
    } catch (error: any) {
      console.error('Failed to enroll members:', error);
      alert(error.message || 'Failed to enroll members');
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSelectAll = () => {
    const availableMembers = getAvailableMembers();
    if (selectedMemberIds.length === availableMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(availableMembers.map(m => m.id!).filter(Boolean));
    }
  };

  const handleUnenroll = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the class?')) {
      try {
        await unenrollMember(resolvedParams.id, memberId);
        await loadData();
      } catch (error: any) {
        console.error('Failed to unenroll member:', error);
        alert('Failed to unenroll member');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await deleteClass(resolvedParams.id);
        router.push('/dashboard/classes');
      } catch (error: any) {
        console.error('Failed to delete class:', error);
        alert('Failed to delete class');
      }
    }
  };

  const getAvailableMembers = () => {
    if (!classData) return [];
    
    const enrolledIds = new Set(classData.enrolled_members);
    const waitlistIds = new Set(classData.wait_list);
    
    return allMembers.filter(member => {
      if (!member.id) return false;
      if (enrolledIds.has(member.id) || waitlistIds.has(member.id)) return false;
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          member.first_name?.toLowerCase().includes(searchLower) ||
          member.last_name?.toLowerCase().includes(searchLower) ||
          member.email?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in-progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
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

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Class not found</div>
      </div>
    );
  }

  const enrolledCount = classData.enrolled_members_details?.length || 0;
  const waitlistCount = classData.wait_list_details?.length || 0;
  const availableSpots = classData.capacity - enrolledCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-1.5 text-sm bg-green-800 text-white rounded-md hover:bg-green-900 font-medium"
            >
              ← Dashboard
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
              <p className="text-green-100 mb-4">{classData.description}</p>
              
              {/* Recurring class instance selector */}
              {classData.recurring && (
                <div className="mb-4">
                  <label htmlFor="instance-select" className="block text-sm font-medium text-green-100 mb-2">
                    📅 Recurring Class Instances
                    {recurringInstances.length > 0 && ` (${recurringInstances.length} found)`}
                  </label>
                  {recurringInstances.length > 1 ? (
                    <select
                      id="instance-select"
                      value={resolvedParams.id}
                      onChange={(e) => router.push(`/dashboard/classes/${e.target.value}`)}
                      className="px-4 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                    >
                      {recurringInstances.map((instance) => (
                        <option key={instance.id} value={instance.id}>
                          {new Date(instance.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} - {instance.start_time}
                          {instance.id === resolvedParams.id && ' (Current)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-green-100 text-sm">
                      This is a recurring class. Create more instances with the same name, instructor, and recurring days to switch between them.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-semibold">Instructor:</span> {classData.instructor}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {new Date(classData.date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Time:</span> {classData.start_time} - {classData.end_time}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span> {classData.duration} min
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/classes/edit/${resolvedParams.id}`}
                className="px-4 py-2 bg-white text-green-700 rounded-md hover:bg-gray-100 font-medium"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
              <Link
                href="/dashboard/classes"
                className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 font-medium"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
            <div className="flex items-center justify-between">
              <span className={getStatusBadgeClass(classData.status)}>{classData.status}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Enrolled</div>
            <div className="text-3xl font-bold text-gray-900">{enrolledCount}/{classData.capacity}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Available Spots</div>
            <div className={`text-3xl font-bold ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableSpots}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Waitlist</div>
            <div className="text-3xl font-bold text-gray-900">{waitlistCount}</div>
          </div>
        </div>

        {/* Enrolled Members */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Enrolled Members ({enrolledCount})</h2>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium"
            >
              + Enroll Member
            </button>
          </div>

          {enrolledCount === 0 ? (
            <p className="text-gray-500 text-center py-8">No members enrolled yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Membership</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classData.enrolled_members_details?.map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => router.push(`/dashboard/member/${member.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{member.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 capitalize">{member.membership_type}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Waitlist */}
        {waitlistCount > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Waitlist ({waitlistCount})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Phone</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classData.wait_list_details?.map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => router.push(`/dashboard/member/${member.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{member.phone}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Member Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Enroll Members
                {selectedMemberIds.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-green-600">
                    ({selectedMemberIds.length} selected)
                  </span>
                )}
              </h3>
            </div>
            
            <div className="px-6 py-4 border-b space-y-3">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
              {getAvailableMembers().length > 0 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedMemberIds.length === getAvailableMembers().length && getAvailableMembers().length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Select All ({getAvailableMembers().length})
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {getAvailableMembers().length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'No members found matching your search' : 'All members are already enrolled or on waitlist'}
                </p>
              ) : (
                <div className="space-y-2">
                  {getAvailableMembers().map((member) => (
                    <div
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.id!)}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMemberIds.includes(member.id!)
                          ? 'bg-green-50 border-green-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(member.id!)}
                          onChange={() => toggleMemberSelection(member.id!)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.membership_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSearchTerm('');
                  setSelectedMemberIds([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              {selectedMemberIds.length > 0 && (
                <button
                  onClick={handleEnrollSelected}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Enroll {selectedMemberIds.length} Member{selectedMemberIds.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
