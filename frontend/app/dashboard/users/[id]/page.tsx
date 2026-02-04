'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, getClubs } from '@/lib/api';
import { User, Club } from '@/types';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      const [userData, clubsData] = await Promise.all([
        getUser(resolvedParams.id),
        getClubs()
      ]);
      setUser(userData);
      setClubs(clubsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Error loading user data');
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'all_services':
        return 'bg-blue-100 text-blue-800';
      case 'restaurant':
        return 'bg-green-100 text-green-800';
      case 'office':
        return 'bg-yellow-100 text-yellow-800';
      case 'classes':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'all_services':
        return 'All Services';
      case 'restaurant':
        return 'Restaurant';
      case 'office':
        return 'Office/Co-working';
      case 'classes':
        return 'Classes';
      default:
        return role;
    }
  };

  const getServiceAccess = (role: string) => {
    switch (role) {
      case 'admin':
        return 'All services at all locations';
      case 'all_services':
        return 'All services at assigned locations';
      case 'restaurant':
        return 'Restaurant only';
      case 'office':
        return 'Office/Co-working only';
      case 'classes':
        return 'Classes only';
      default:
        return '-';
    }
  };

  const getAssignedClubNames = () => {
    if (!user?.assigned_club_ids || user.assigned_club_ids.length === 0) {
      return 'No clubs assigned';
    }
    const assignedClubs = clubs.filter(club => user.assigned_club_ids?.includes(club.id || ''));
    return assignedClubs.map(club => club.name).join(', ') || 'No clubs found';
  };

  if (loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-gray-900">User not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/users" className="text-blue-600 hover:text-blue-800">
          ← Back to Users
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/users/edit/${user.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit User
            </Link>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Provider</label>
                <p className="text-gray-900 capitalize">{user.provider}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role || '')}`}>
                    {getRoleLabel(user.role || '')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Service Access</label>
                <p className="text-gray-900">{getServiceAccess(user.role || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned Clubs</label>
                <p className="text-gray-900">{getAssignedClubNames()}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-900">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">
                  {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {user.assigned_club_ids && user.assigned_club_ids.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Locations</h2>
              <div className="space-y-2">
                {clubs.filter(club => user.assigned_club_ids?.includes(club.id || '')).map(club => (
                  <Link
                    key={club.id}
                    href={`/dashboard/clubs/edit/${club.id}`}
                    className="block p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <p className="font-medium text-gray-900">{club.name}</p>
                    <p className="text-sm text-gray-600">{club.city}, {club.state}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
