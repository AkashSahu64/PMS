// pages/ActivityLogs.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import API from '../store/authStore';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const fetchLogs = async ({ queryKey }) => {
  const [, { page, user, action, entity, startDate, endDate }] = queryKey;
  const params = new URLSearchParams({
    page,
    limit: 20,
    ...(user && { user }),
    ...(action && { action }),
    ...(entity && { entity }),
    ...(startDate && { startDate: startDate.toISOString() }),
    ...(endDate && { endDate: endDate.toISOString() })
  });
  const { data } = await API.get(`/activitylogs?${params}`);
  return data;
};

const ActivityLogs = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    entity: '',
    startDate: null,
    endDate: null
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activitylogs', { page, ...filters }],
    queryFn: fetchLogs,
    keepPreviousData: true
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ user: '', action: '', entity: '', startDate: null, endDate: null });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-gray-50"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <input
            type="text"
            name="user"
            placeholder="User ID or Name"
            value={filters.user}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-xl"
          />
          <input
            type="text"
            name="action"
            placeholder="Action"
            value={filters.action}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-xl"
          />
          <input
            type="text"
            name="entity"
            placeholder="Entity"
            value={filters.entity}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-xl"
          />
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            placeholderText="Start Date"
            className="px-3 py-2 border rounded-xl w-full"
          />
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            placeholderText="End Date"
            className="px-3 py-2 border rounded-xl w-full"
          />
          <div className="col-span-full flex justify-end gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border rounded-xl hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2"
            >
              <FiRefreshCw /> Apply
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Error loading logs</div>
      ) : (
        <>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-xl disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p+1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogs;