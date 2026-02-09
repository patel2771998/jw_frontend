import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import StaffLayout from './layouts/StaffLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import StaffManagement from './pages/admin/StaffManagement';
import AvailabilityCalendar from './pages/admin/AvailabilityCalendar';
import BookingApproval from './pages/admin/BookingApproval';

// Client
import ClientDashboard from './pages/client/Dashboard';
import BookStaff from './pages/client/BookStaff';
import MyBookings from './pages/client/MyBookings';

// Staff
import StaffDashboard from './pages/staff/Dashboard';
import StaffBookings from './pages/staff/StaffBookings';
import StaffSchedule from './pages/staff/StaffSchedule';

// Shared
import Home from './pages/Home';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="availability" element={<AvailabilityCalendar />} />
        <Route path="bookings" element={<BookingApproval />} />
      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute roles={['CLIENT']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="book" element={<BookStaff />} />
        <Route path="my-bookings" element={<MyBookings />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['STAFF']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="bookings" element={<StaffBookings />} />
        <Route path="schedule" element={<StaffSchedule />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
