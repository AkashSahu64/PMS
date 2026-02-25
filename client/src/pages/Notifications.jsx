import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import API from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const fetchNotifications = async () => {
  const { data } = await API.get('/notifications');
  return data;
};

const markAsRead = async (id) => {
  await API.put(`/notifications/${id}/read`);
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30000,        // ✅ 30 seconds
  refetchOnWindowFocus: true,    // ✅ When user returns to tab
});

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
      <div className="space-y-3">
        {notifications?.map((notif) => (
          <motion.div
            key={notif._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white/70 backdrop-blur-sm p-4 rounded-xl border-l-4 ${
              notif.read ? 'border-gray-300' : 'border-primary-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{notif.title}</h3>
                <p className="text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => handleMarkRead(notif._id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Mark as read"
                >
                  <FiCheck className="w-5 h-5 text-green-600" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {notifications?.length === 0 && (
          <p className="text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;