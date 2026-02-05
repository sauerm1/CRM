'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInstructor, getClubs, getClasses, deleteInstructor } from '@/lib/api';
import { Instructor, Club, Class } from '@/types';

export default function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      const [instructorData, clubsData, classesData] = await Promise.all([
        getInstructor(resolvedParams.id),
        getClubs(),
        getClasses()
      ]);
      setInstructor(instructorData);
      setClubs(clubsData);
      
      // Filter classes taught by this instructor
      const instructorClasses = classesData.filter(
        (c: Class) => c.instructor === instructorData.name
      );
      setClasses(instructorClasses);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      alert('Error loading instructor data');
      router.push('/dashboard/instructors');
    } finally {
      setLoading(false);
    }
  };

  const getAssignedClubs = () => {
    if (!instructor?.club_ids || instructor.club_ids.length === 0) {
      return [];
    }
    return clubs.filter(club => instructor.club_ids?.includes(club.id || ''));
  };

  const getUpcomingClasses = () => {
    const now = new Date();
    return classes.filter(c => new Date(c.date) >= now).slice(0, 5);
  };

  const getPastClasses = () => {
    const now = new Date();
    return classes.filter(c => new Date(c.date) < now).slice(0, 5);
  };

  const handleDelete = async () => {
    if (!instructor) return;
    if (!window.confirm(`Are you sure you want to delete instructor "${instructor.name}"? This action cannot be undone.`)) return;

    try {
      await deleteInstructor(instructor.id!);
      router.push('/dashboard/instructors');
    } catch (error: any) {
      console.error('Failed to delete instructor:', error);
      alert('Failed to delete instructor: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (!instructor) {
    return <div className="p-8 text-gray-900">Instructor not found</div>;
  }

  const assignedClubs = getAssignedClubs();
  const upcomingClasses = getUpcomingClasses();
  const pastClasses = getPastClasses();

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/instructors" className="text-blue-600 hover:text-blue-800">
          ← Back to Instructors
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{instructor.name}</h1>
            <p className="text-lg text-gray-600">{instructor.specialty}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/instructors/edit/${instructor.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit Instructor
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <span className={`px-3 py-2 rounded-md text-sm font-medium ${
              instructor.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {instructor.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Instructor Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{instructor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{instructor.phone}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Specialty</label>
                <p className="text-gray-900">{instructor.specialty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Classes</label>
                <p className="text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {instructor.bio && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Biography</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line">{instructor.bio}</p>
            </div>
          </div>
        )}

        {/* Assigned Clubs */}
        {assignedClubs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Assigned Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedClubs.map(club => (
                <Link
                  key={club.id}
                  href={`/dashboard/clubs/edit/${club.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
                >
                  <p className="font-medium text-gray-900">{club.name}</p>
                  <p className="text-sm text-gray-600">{club.city}, {club.state}</p>
                  <p className="text-sm text-gray-500">{club.address}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Classes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Classes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Upcoming Classes ({upcomingClasses.length})
            </h2>
            {upcomingClasses.length === 0 ? (
              <p className="text-gray-500">No upcoming classes</p>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map(cls => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classes/${cls.id}`}
                    className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200"
                  >
                    <p className="font-medium text-gray-900">{cls.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(cls.date).toLocaleDateString()} at {cls.start_time}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cls.enrolled_members?.length || 0} / {cls.capacity} enrolled
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Past Classes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Recent Past Classes
            </h2>
            {pastClasses.length === 0 ? (
              <p className="text-gray-500">No past classes</p>
            ) : (
              <div className="space-y-3">
                {pastClasses.map(cls => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classes/${cls.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
                  >
                    <p className="font-medium text-gray-900">{cls.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(cls.date).toLocaleDateString()} at {cls.start_time}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cls.enrolled_members?.length || 0} / {cls.capacity} enrolled
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingClasses.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Locations</p>
            <p className="text-2xl font-bold text-gray-900">{assignedClubs.length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {classes.reduce((sum, cls) => sum + (cls.enrolled_members?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
