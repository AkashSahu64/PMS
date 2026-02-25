import { motion } from 'framer-motion';

const ChartCard = ({ title, children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 ${className}`}
    >
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </motion.div>
  );
};

export default ChartCard;