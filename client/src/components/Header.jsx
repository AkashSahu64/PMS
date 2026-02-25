import { useState } from 'react';
import { FiSearch, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import API from '../store/authStore';

const Header = () => {
  const [search, setSearch] = useState('');
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  // 🔔 Unread Notification Count (Real-time Polling)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      const { data } = await API.get('/notifications?unreadOnly=true');
      return data.filter((n) => !n.read).length;
    },
    refetchInterval: 30000, // 30 sec
    refetchOnWindowFocus: true,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    // If 10-digit mobile number
    if (/^\d{10}$/.test(search)) {
      try {
        const { data } = await API.get('/patients', {
          params: { search, limit: 1 },
        });

        if (data.patients.length > 0) {
          navigate(`/patients/${data.patients[0]._id}`);
          return;
        }
      } catch (err) {
        // Ignore and fallback
      }
    }

    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* 🔍 Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, mobile, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
        </form>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4 ml-6">

          {/* 🔔 Notification Bell */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiBell className="w-5 h-5 text-gray-700 dark:text-gray-200" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* 🌙 Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-700" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;