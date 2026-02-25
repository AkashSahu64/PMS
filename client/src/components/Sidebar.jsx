import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiPieChart,
  FiBell,
  FiSettings,
  FiLogOut,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: "/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/patients/register", icon: FiUsers, label: "Register Patient" },
    { to: "/reports", icon: FiPieChart, label: "Reports" },
    { to: "/notifications", icon: FiBell, label: "Notifications" },
    { to: "/settings", icon: FiSettings, label: "Settings" },
    ...(user?.role === "admin"
      ? [{ to: "/activity-logs", icon: FiActivity, label: "Activity Logs" }]
      : []),
    { to: "/calendar", icon: FiCalendar, label: "Calendar" },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-white/70 backdrop-blur-md border-r border-gray-200/50 flex flex-col"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          PhysioManager
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-primary-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-primary-50"
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 rounded-xl transition"
        >
          <FiLogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
