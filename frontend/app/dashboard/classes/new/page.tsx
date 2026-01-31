'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClass, getInstructors } from '@/lib/api';
import type { Instructor } from '@/types';

export default function NewClassPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    duration: 60,
    capacity: 20,
    recurring: false,
    recurring_days: [] as string[],
    recurring_weeks: 1,
    status: 'scheduled',
  });
  const [loading, setLoading] = useState(false);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const data = await getInstructors();
      setInstructors(data || []);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurring_days: prev.recurring_days.includes(day)
        ? prev.recurring_days.filter(d => d !== day)
        : [...prev.recurring_days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.recurring && formData.recurring_days.length > 0 && formData.recurring_weeks > 0) {
        // Generate multiple instances for recurring classes
        const baseDate = new Date(formData.date);
        const dayNameToNumber: { [key: string]: number } = {
          'Sunday': 0,
          'Monday': 1,
          'Tuesday': 2,
          'Wednesday': 3,
          'Thursday': 4,
          'Friday': 5,
          'Saturday': 6
        };

        const instances = [];
        
        // Generate instances for each week
        for (let week = 0; week < formData.recurring_weeks; week++) {
          // For each selected day
          for (const dayName of formData.recurring_days) {
            const targetDay = dayNameToNumber[dayName];
            const instanceDate = new Date(baseDate);
            
            // Calculate the date for this instance
            // Start from the base date and find the next occurrence of the target day
            const currentDay = instanceDate.getDay();
            let daysToAdd = targetDay - currentDay;
            
            // If the target day is before or same as current day in week 0, move to next occurrence
            if (daysToAdd <= 0) {
              daysToAdd += 7;
            }
            
            // Add the week offset (week 0 uses the first occurrence, week 1 adds 7 days, etc.)
            daysToAdd += (week * 7);
            
            instanceDate.setDate(instanceDate.getDate() + daysToAdd);
            
            instances.push({
              ...formData,
              date: instanceDate.toISOString().split('T')[0],
            });
          }
        }

        // Sort instances by date
        instances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Create all instances
        for (const instance of instances) {
          await createClass(instance);
        }
        
        alert(`Successfully created ${instances.length} class instances!`);
      } else {
        // Single class creation
        await createClass(formData);
      }
      
      router.push('/dashboard/classes');
    } catch (error: any) {
      console.error('Failed to create class:', error);
      alert('Failed to create class: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-3xl font-bold text-gray-900">Add New Class</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="e.g., Morning Yoga"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Brief description of the class"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="instructor" className="block text-sm font-medium text-gray-900">
                    Instructor *
                  </label>
                  <select
                    name="instructor"
                    id="instructor"
                    required
                    value={formData.instructor}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value="">Select an instructor</option>
                    {instructors
                      .filter(inst => inst.active)
                      .map(instructor => (
                        <option key={instructor.id} value={instructor.name}>
                          {instructor.name} - {instructor.specialty}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-900">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-900">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    id="duration"
                    required
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-900">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    required
                    value={formData.start_time}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-900">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    required
                    value={formData.end_time}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Recurring */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Class Settings</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-900">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-900">
                    Status *
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="recurring"
                      checked={formData.recurring}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Recurring Class</span>
                  </label>
                </div>

                {formData.recurring && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Recurring Days *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              formData.recurring_days.includes(day)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                      {formData.recurring_days.length === 0 && (
                        <p className="mt-1 text-sm text-red-600">Select at least one day</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="recurring_weeks" className="block text-sm font-medium text-gray-900">
                        Number of Weeks *
                      </label>
                      <input
                        type="number"
                        name="recurring_weeks"
                        id="recurring_weeks"
                        required
                        min="1"
                        max="52"
                        value={formData.recurring_weeks}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        This will create {formData.recurring_days.length * formData.recurring_weeks} class instances
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard/classes')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
