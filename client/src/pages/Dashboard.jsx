import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiPackage, FiDollarSign, FiCalendar 
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import API from '../store/authStore';
import StatCard from '../components/StatCard';
import NotificationPanel from '../components/NotificationPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';

const fetchDashboardStats = async () => {
  const { data } = await API.get('/reports/dashboard');
  return data;
};

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <div>Error loading dashboard</div>;

  const stats = [
    { title: 'Total Patients', value: data.totalPatients, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Packages', value: data.activePackages, icon: FiPackage, color: 'from-green-500 to-green-600' },
    { title: 'Pending Balance', value: `₹${data.pendingBalances}`, icon: FiDollarSign, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Upcoming Appointments', value: data.appointments.length, icon: FiCalendar, color: 'from-purple-500 to-purple-600' },
  ];

  const revenueData = data.dailyRevenue.map(item => ({
    date: item._id,
    amount: item.total
  }));

  const treatmentData = [
    { name: 'Completed Days', value: data.packageStats.completedDays },
    { name: 'Remaining Days', value: data.packageStats.totalDays - data.packageStats.completedDays }
  ];
  const COLORS = ['#0ea5e9', '#d946ef'];

  return (
    <div className="space-y-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800"
      >
        Dashboard
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
        >
          <h2 className="text-lg font-semibold mb-4">Daily Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
        >
          <h2 className="text-lg font-semibold mb-4">Treatment Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={treatmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {treatmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Appointments and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
        >
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          {data.appointments.length > 0 ? (
            <ul className="space-y-3">
              {data.appointments.map((appt, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">{appt.patientName}</p>
                    <p className="text-sm text-gray-500">{appt.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Day {appt.day}</p>
                    <p className="text-xs text-gray-500">{new Date(appt.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments</p>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20"
        >
          <NotificationPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;