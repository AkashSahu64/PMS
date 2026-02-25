import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There are no items to display at the moment.',
  icon: Icon = FiInbox,
  actionText,
  onAction 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20"
    >
      <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;