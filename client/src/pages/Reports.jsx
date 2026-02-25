import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import API from '../store/authStore';

const Reports = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState('payments');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', reportType, startDate, endDate],
    queryFn: async () => {
      const { data } = await API.get('/reports', {
        params: {
          type: reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border rounded-xl px-3 py-2"
            >
              <option value="payments">Payments</option>
              <option value="patients">Patients</option>
              <option value="packages">Packages</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {reportType === 'payments' && data && (
              <div>
                <p className="text-lg">Total: ₹{data.total}</p>
                <p className="text-lg">Count: {data.count}</p>
                {/* Optionally show chart of payments over time */}
              </div>
            )}
            {reportType === 'patients' && (
              <p className="text-lg">Total Patients: {data.count}</p>
            )}
            {reportType === 'packages' && (
              <div>
                <p className="text-lg">Total Packages: {data.total}</p>
                <p className="text-lg">Completed: {data.completed}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;