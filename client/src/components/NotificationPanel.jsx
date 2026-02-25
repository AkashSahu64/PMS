import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiCheck } from 'react-icons/fi';
import API from '../store/authStore';

const fetchNotifications = async () => {
  const { data } = await API.get('/notifications');
  return data;
};

const markAsRead = async (id) => {
  await API.put(`/notifications/${id}/read`);
};

const NotificationPanel = () => {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications-panel'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    refetch();
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const recent = notifications?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiBell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {recent.map((notif) => (
            <motion.li
              key={notif._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-xl border-l-4 ${
                notif.read ? 'border-gray-300 bg-white/50' : 'border-primary-500 bg-white/80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Mark as read"
                  >
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-center">
        <Link to="/notifications" className="text-sm text-primary-600 hover:underline">
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationPanel;