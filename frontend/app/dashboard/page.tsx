'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout, getMembers, getClubs, getRestaurants, getClasses, getInstructors, getOffices, getOfficeBookings } from '@/lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalClubs: 0,
    totalRestaurants: 0,
    totalClasses: 0,
    totalInstructors: 0,
    totalOffices: 0,
    totalBookings: 0,
    bookingRevenue: 0,
  });
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [officeTypeData, setOfficeTypeData] = useState<any[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeDashboard();
    }
  }, []);

  const initializeDashboard = async () => {
    try {
      const [userData, membersData, clubsData, restaurantsData, classesData, instructorsData, officesData, bookingsData] = await Promise.all([
        getCurrentUser(),
        getMembers().catch(() => []),
        getClubs().catch(() => []),
        getRestaurants().catch(() => []),
        getClasses().catch(() => []),
        getInstructors().catch(() => []),
        getOffices().catch(() => []),
        getOfficeBookings().catch(() => []),
      ]);
      
      setUser(userData.user);
      
      // Calculate stats
      const activeMembers = membersData?.filter((m: any) => m.status === 'active').length || 0;
      const totalRevenue = bookingsData?.reduce((sum: number, booking: any) => sum + (booking.total_cost || 0), 0) || 0;
      
      setStats({
        totalMembers: membersData?.length || 0,
        activeMembers,
        totalClubs: clubsData?.length || 0,
        totalRestaurants: restaurantsData?.length || 0,
        totalClasses: classesData?.length || 0,
        totalInstructors: instructorsData?.length || 0,
        totalOffices: officesData?.length || 0,
        totalBookings: bookingsData?.length || 0,
        bookingRevenue: totalRevenue,
      });

      // Process membership type data for chart
      const membershipTypes: any = {};
      membersData?.forEach((m: any) => {
        const type = m.membership_type || 'Unknown';
        membershipTypes[type] = (membershipTypes[type] || 0) + 1;
      });
      setMembershipData(
        Object.entries(membershipTypes).map(([name, value]) => ({ name, value }))
      );

      // Process status data for chart
      const statuses: any = {};
      membersData?.forEach((m: any) => {
        const status = m.status || 'Unknown';
        statuses[status] = (statuses[status] || 0) + 1;
      });
      setStatusData(
        Object.entries(statuses).map(([name, value]) => ({ name, value }))
      );

      // Process office type data for chart
      const officeTypes: any = {};
      officesData?.forEach((o: any) => {
        const type = o.type || 'Unknown';
        officeTypes[type] = (officeTypes[type] || 0) + 1;
      });
      setOfficeTypeData(
        Object.entries(officeTypes).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const quickLinks = [
    { name: 'Members', href: '/dashboard/members', icon: '👥', color: 'bg-blue-500', count: stats.totalMembers },
    { name: 'Clubs', href: '/dashboard/clubs', icon: '🏢', color: 'bg-indigo-500', count: stats.totalClubs },
    { name: 'Classes', href: '/dashboard/classes', icon: '📅', color: 'bg-purple-500', count: stats.totalClasses },
    { name: 'Instructors', href: '/dashboard/instructors', icon: '👨‍🏫', color: 'bg-pink-500', count: stats.totalInstructors },
    { name: 'Restaurants', href: '/dashboard/restaurants', icon: '🍽️', color: 'bg-orange-500', count: stats.totalRestaurants },
    { name: 'Offices', href: '/dashboard/offices', icon: '💼', color: 'bg-teal-500', count: stats.totalOffices },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Gym CRM Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <p className="mt-2 text-sm text-green-600">{stats.activeMembers} active</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Club Locations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClubs}</p>
                </div>
                <div className="text-4xl">🏢</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Instructors</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInstructors}</p>
                </div>
                <div className="text-4xl">👨‍🏫</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Restaurants</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRestaurants}</p>
                </div>
                <div className="text-4xl">🍽️</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Office Spaces</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOffices}</p>
                </div>
                <div className="text-4xl">💼</div>
              </div>
              <p className="mt-2 text-sm text-blue-600">{stats.totalBookings} bookings</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booking Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.bookingRevenue.toFixed(0)}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
              <p className="mt-2 text-sm text-gray-600">from office bookings</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Membership Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Types</h3>
            {membershipData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No membership data available</p>
            )}
          </div>

          {/* Member Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Members" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No status data available</p>
            )}
          </div>

          {/* Office Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Spaces by Type</h3>
            {officeTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={officeTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#14b8a6" name="Offices" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No office data available</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`${link.color} text-white rounded-lg p-3 text-2xl`}>
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {link.name}
                    </h3>
                    <p className="text-sm text-gray-500">{link.count} total</p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
