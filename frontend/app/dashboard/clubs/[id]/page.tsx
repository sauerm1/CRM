'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClub, getMembers, getInstructors, getClasses, deleteClub } from '@/lib/api';
import type { Club, Member, Instructor, Class } from '@/types';

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'instructors' | 'classes'>('overview');

  useEffect(() => {
    loadClubData();
  }, [resolvedParams.id]);

  const loadClubData = async () => {
    try {
      const [clubData, membersData, instructorsData, classesData] = await Promise.all([
        getClub(resolvedParams.id),
        getMembers(),
        getInstructors(),
        getClasses()
      ]);
      
      setClub(clubData);
      
      // Filter members by this club
      const clubMembers = (membersData || []).filter(m => 
        m.assigned_clubs?.includes(resolvedParams.id)
      );
      setMembers(clubMembers);
      
      // Filter instructors by this club
      const clubInstructors = (instructorsData || []).filter(i => 
        i.assigned_clubs?.includes(resolvedParams.id)
      );
      setInstructors(clubInstructors);
      
      // Filter classes by this club
      const clubClasses = (classesData || []).filter(c => 
        c.club_id === resolvedParams.id
      );
      setClasses(clubClasses);
      
    } catch (error) {
      console.error('Failed to load club data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading club details...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-gray-600 mb-4">Club not found</div>
        <Link href="/dashboard/clubs" className="text-blue-600 hover:text-blue-800">
          ← Back to Clubs
        </Link>
      </div>
    );
  }

  const activeClasses = classes.filter(c => c.status === 'scheduled');
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled || 0), 0);

  const handleDelete = async () => {
    if (!club) return;
    if (!window.confirm(`Are you sure you want to delete club "${club.name}"? This will affect all associated members, classes, and instructors. This action cannot be undone.`)) return;

    try {
      await deleteClub(club.id!);
      router.push('/dashboard/clubs');
    } catch (error: any) {
      console.error('Failed to delete club:', error);
      alert('Failed to delete club: ' + error.message);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/clubs" className="text-blue-600 hover:text-blue-800">
          ← Back to Clubs
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
            <p className="text-gray-600 mt-1">{club.address}, {club.city}, {club.state} {club.zip_code}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/clubs/edit/${club.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Club
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Status and Contact Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              club.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {club.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
            <p className="text-gray-900">{club.phone || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-gray-900">{club.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Members</h3>
          <p className="text-3xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Instructors</h3>
          <p className="text-3xl font-bold text-gray-900">{instructors.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Classes</h3>
          <p className="text-3xl font-bold text-gray-900">{activeClasses.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Class Capacity</h3>
          <p className="text-3xl font-bold text-gray-900">{totalEnrolled}/{totalCapacity}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('instructors')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'instructors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Instructors ({instructors.length})
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'classes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Classes ({classes.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Address</label>
                    <p className="text-gray-900 mt-1">
                      {club.address}<br />
                      {club.city}, {club.state} {club.zip_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Information</label>
                    <p className="text-gray-900 mt-1">
                      Phone: {club.phone || 'N/A'}<br />
                      Email: {club.email || 'N/A'}
                    </p>
                  </div>
                  {club.amenities && club.amenities.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Amenities</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {club.amenities.map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {club.hours && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Operating Hours</label>
                      <p className="text-gray-900 mt-1 whitespace-pre-line">{club.hours}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Members</h3>
              {members.length === 0 ? (
                <p className="text-gray-500">No members assigned to this club yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => (
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
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{member.email}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : member.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Instructors</h3>
              {instructors.length === 0 ? (
                <p className="text-gray-500">No instructors assigned to this club yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Specialties</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {instructors.map((instructor) => (
                        <tr 
                          key={instructor.id} 
                          onClick={() => router.push(`/dashboard/instructors/${instructor.id}`)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{instructor.email}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {instructor.specialties?.slice(0, 3).map((specialty, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Classes</h3>
              {classes.length === 0 ? (
                <p className="text-gray-500">No classes scheduled at this club yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Class</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Enrollment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes.map((cls) => (
                        <tr 
                          key={cls.id} 
                          onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {new Date(cls.date).toLocaleDateString()} {cls.time}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {cls.enrolled}/{cls.capacity}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cls.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800'
                                : cls.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cls.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
