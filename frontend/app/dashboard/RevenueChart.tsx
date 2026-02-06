'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRevenueAnalytics } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  booking_revenue: number;
  billing_revenue: number;
}

interface RevenueChartProps {
  className?: string;
}

export default function RevenueChart({ className = '' }: RevenueChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
  const [visibleLines, setVisibleLines] = useState({
    revenue: true,
    booking_revenue: true,
    billing_revenue: true,
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // Today
  });

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRevenueAnalytics({
        start_date: dateRange.start,
        end_date: dateRange.end,
        group_by: groupBy,
      });
      setData(response.data || []);
      setTotalRevenue(response.total_revenue || 0);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  }, [groupBy, dateRange.start, dateRange.end]);

  useEffect(() => {
    loadRevenueData();
  }, [loadRevenueData]);

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const setQuickRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ start, end });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateStr: string | number) => {
    const str = String(dateStr);
    if (groupBy === 'month') {
      const [year, month] = str.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    }
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLegendClick = (dataKey: string) => {
    const allOthersVisible = Object.entries(visibleLines).some(
      ([key, value]) => key !== dataKey && value
    );
    
    if (allOthersVisible) {
      // If other lines are visible, hide them and show only the clicked one
      setVisibleLines({
        revenue: dataKey === 'revenue',
        booking_revenue: dataKey === 'booking_revenue',
        billing_revenue: dataKey === 'billing_revenue',
      });
    } else {
      // If only this line is visible, show all lines
      setVisibleLines({
        revenue: true,
        booking_revenue: true,
        billing_revenue: true,
      });
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Revenue Analytics</h2>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Date Range Inputs */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="border rounded px-3 py-1.5 text-sm text-gray-900"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="border rounded px-3 py-1.5 text-sm text-gray-900"
            />
          </div>

          {/* Quick Range Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setQuickRange(7)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 text-gray-700"
            >
              7 Days
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 text-gray-700"
            >
              30 Days
            </button>
            <button
              onClick={() => setQuickRange(90)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 text-gray-700"
            >
              90 Days
            </button>
          </div>

          {/* Group By Toggle */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setGroupBy('day')}
              className={`px-4 py-1.5 text-sm rounded ${
                groupBy === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-100 text-gray-700'
              }`}
            >
              By Day
            </button>
            <button
              onClick={() => setGroupBy('month')}
              className={`px-4 py-1.5 text-sm rounded ${
                groupBy === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-100 text-gray-700'
              }`}
            >
              By Month
            </button>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
          <div className="text-3xl font-bold text-blue-900">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">Loading revenue data...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">No revenue data available for this period</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#6b7280"
              tick={{ fill: '#374151', dy: 10 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#6b7280"
              tick={{ fill: '#374151' }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              itemStyle={{ color: '#374151' }}
            />
            <Legend 
              wrapperStyle={{ color: '#374151' }}
              iconType="line"
              onClick={(e) => handleLegendClick(e.dataKey as string)}
              wrapperStyle={{ color: '#374151', cursor: 'pointer' }}
            />
            {visibleLines.revenue && (
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                name="Total Revenue"
                dot={{ r: 4, fill: '#2563eb' }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            )}
            {visibleLines.booking_revenue && (
              <Line
                type="monotone"
                dataKey="booking_revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Office Bookings"
                dot={{ r: 3, fill: '#10b981' }}
              />
            )}
            {visibleLines.billing_revenue && (
              <Line
                type="monotone"
                dataKey="billing_revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Member Billing"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
