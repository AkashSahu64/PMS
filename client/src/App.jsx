import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterPatient from './pages/RegisterPatient';
import PatientProfile from './pages/PatientProfile';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerify from './pages/OTPVerify';
import UpdatePassword from './pages/UpdatePassword';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layouts/Layout';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useThemeStore } from './store/themeStore';
import ActivityLogs from './pages/ActivityLogs';
import SearchResults from './pages/SearchResults';
import CalendarPage from './pages/Calendar';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { darkMode } = useThemeStore();
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTPVerify />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients/register" element={<RegisterPatient />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="reports" element={<Reports />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="search" element={<SearchResults />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;