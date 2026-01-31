'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClasses, deleteClass } from '@/lib/api';
import type { Class } from '@/types';

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'instructor' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterInstructor, setFilterInstructor] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        await loadClasses();
      } catch (error: any) {
        console.error('Failed to delete class:', error);
        alert('Failed to delete class: ' + error.message);
      }
    }
  };

  const toggleClassSelection = (classId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = new Set(selectedClasses);
    if (newSelection.has(classId)) {
      newSelection.delete(classId);
    } else {
      newSelection.add(classId);
    }
    setSelectedClasses(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedClasses.size === filteredClasses.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(filteredClasses.map(c => c.id!)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedClasses.size === 0) {
      alert('Please select at least one class to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedClasses.size} class(es)?`)) {
      return;
    }

    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedClasses).map(classId => deleteClass(classId))
      );
      alert(`Successfully deleted ${selectedClasses.size} class(es)!`);
      setSelectedClasses(new Set());
      await loadClasses();
    } catch (error: any) {
      console.error('Failed to delete classes:', error);
      alert('Failed to delete some classes: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const getFilteredClasses = () => {
    return classes.filter(cls => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          cls.name?.toLowerCase().includes(searchLower) ||
          cls.instructor?.toLowerCase().includes(searchLower) ||
          cls.status?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Instructor filter
      if (filterInstructor && cls.instructor !== filterInstructor) {
        return false;
      }

      // Date filter
      if (filterDate && cls.date !== filterDate) {
        return false;
      }

      // Duration filter
      if (filterDuration && cls.duration?.toString() !== filterDuration) {
        return false;
      }

      return true;
    });
  };

  const getSortedClasses = (classesToSort: Class[]) => {
    return [...classesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'instructor':
          comparison = (a.instructor || '').localeCompare(b.instructor || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: 'date' | 'name' | 'instructor' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: 'date' | 'name' | 'instructor' | 'status' }) => {
    if (sortBy !== field) return <span className="text-gray-400 ml-1">↕</span>;
    return <span className="text-green-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const uniqueInstructors = Array.from(new Set(classes.map(c => c.instructor).filter(Boolean)));
  const uniqueDates = Array.from(new Set(classes.map(c => c.date).filter(Boolean))).sort();
  const uniqueDurations = Array.from(new Set(classes.map(c => c.duration).filter(Boolean))).sort((a, b) => a - b);

  const clearFilters = () => {
    setFilterInstructor('');
    setFilterDate('');
    setFilterDuration('');
    setSearchTerm('');
  };

  const filteredClasses = getSortedClasses(getFilteredClasses());

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getAvailability = (cls: Class) => {
    const enrolled = cls.enrolled_members?.length || 0;
    const capacity = cls.capacity;
    const percentage = (enrolled / capacity) * 100;
    
    let colorClass = 'text-green-600';
    if (percentage >= 100) colorClass = 'text-red-600';
    else if (percentage >= 75) colorClass = 'text-yellow-600';
    
    return (
      <span className={colorClass}>
        {enrolled}/{capacity}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
                href="/dashboard"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
              >
                ← Dashboard
              </Link>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
              <Link
                href="/dashboard/classes/new"
                className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium"
              >
                + Add New Class
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  All Classes ({filteredClasses.length}{classes.length !== filteredClasses.length && ` of ${classes.length}`})
                </h2>
                {filteredClasses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                    >
                      {selectedClasses.size === filteredClasses.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedClasses.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={deleting}
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {deleting ? 'Deleting...' : `Delete Selected (${selectedClasses.size})`}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="w-72">
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  value={filterInstructor}
                  onChange={(e) => setFilterInstructor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">All Instructors</option>
                  {uniqueInstructors.map(instructor => (
                    <option key={instructor} value={instructor}>{instructor}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="">All Durations</option>
                  {uniqueDurations.map(duration => (
                    <option key={duration} value={duration.toString()}>{duration} min</option>
                  ))}
                </select>
              </div>
              
              {(filterInstructor || filterDate || filterDuration || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredClasses.length > 0 && selectedClasses.size === filteredClasses.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Class Name<SortIcon field="name" />
                  </th>
                  <th 
                    onClick={() => handleSort('instructor')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Instructor<SortIcon field="instructor" />
                  </th>
                  <th 
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Date<SortIcon field="date" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Enrolled</th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Status<SortIcon field="status" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? `No classes found matching "${searchTerm}"` : 'No classes scheduled'}
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((cls) => {
                    const isSelected = selectedClasses.has(cls.id!);
                    return (
                      <tr 
                        key={cls.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <td 
                          className="px-4 py-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleClassSelection(cls.id!, e)}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                          {cls.recurring && <div className="text-xs text-blue-600">🔄 Recurring</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm text-gray-600">{cls.instructor}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm text-gray-600">{formatDate(cls.date)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm text-gray-600">{cls.start_time} - {cls.end_time}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm text-gray-600">{cls.duration} min</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <div className="text-sm font-medium">
                            {getAvailability(cls)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" onClick={() => router.push(`/dashboard/classes/${cls.id}`)}>
                          <span className={getStatusBadgeClass(cls.status)}>
                            {cls.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/dashboard/classes/edit/${cls.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(cls.id!)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
