import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ staff: 0, pendingBookings: 0, totalBookings: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/staff').then((r) => r.data.length),
      api.get('/admin/bookings?status=PENDING').then((r) => r.data.length),
      api.get('/admin/bookings').then((r) => r.data.length),
    ]).then(([staff, pendingBookings, totalBookings]) =>
      setStats({ staff, pendingBookings, totalBookings })
    );
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-slate-600">Overview of Jolly Wellness</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="card">
          <h3 className="text-sm font-medium text-slate-500">Total Staff</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.staff}</p>
          <Link to="/admin/staff" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
            Manage staff
          </Link>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-slate-500">Pending Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-accent-500">{stats.pendingBookings}</p>
          <Link to="/admin/bookings" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
            Review requests
          </Link>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-slate-500">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-slate-800">{stats.totalBookings}</p>
          <Link to="/admin/bookings" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to="/admin/staff" className="btn-primary">
            Add Staff
          </Link>
          <Link to="/admin/availability" className="btn-secondary">
            Set Availability
          </Link>
          <Link to="/admin/bookings" className="btn-secondary">
            Approve Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
