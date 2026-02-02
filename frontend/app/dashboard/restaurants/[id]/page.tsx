'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getRestaurant, getClubs } from '@/lib/api';
import type { Restaurant, Club } from '@/types';

export default function RestaurantDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const restaurantData = await getRestaurant(restaurantId);
      setRestaurant(restaurantData);
      
      if (restaurantData.club_id) {
        const clubsData = await getClubs();
        const foundClub = clubsData.find((c: Club) => c.id === restaurantData.club_id);
        setClub(foundClub || null);
      }
    } catch (err) {
      console.error('Failed to load restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-4">
              <Link
                href="/dashboard/restaurants"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Back to Restaurants
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/restaurants/edit/${restaurant.id}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Edit Restaurant
                </Link>
                <Link
                  href={`/dashboard/restaurants/${restaurant.id}/reservations`}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Manage Reservations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cuisine Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.cuisine}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Club Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {club ? `${club.name} - ${club.city}, ${club.state}` : 'No club assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          restaurant.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {restaurant.active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact & Capacity */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Capacity</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.capacity} seats</dd>
                  </div>
                </dl>
              </div>

              {/* Hours */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Opening Time:</span>
                      <span className="ml-2 text-lg font-semibold text-gray-900">{restaurant.opening_time}</span>
                    </div>
                    <div className="text-gray-400">—</div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Closing Time:</span>
                      <span className="ml-2 text-lg font-semibold text-gray-900">{restaurant.closing_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
