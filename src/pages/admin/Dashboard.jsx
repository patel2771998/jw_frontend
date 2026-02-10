import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function getThisMonthYYYYMM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getLastMonthYYYYMM() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatTotalTime(totalMinutes) {
  if (!totalMinutes) return '—';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ staff: 0, pendingBookings: 0, totalBookings: 0 });
  const [messageCounts, setMessageCounts] = useState({ staff: [], startDate: null, endDate: null });
  const [messageFilter, setMessageFilter] = useState('this_month'); // this_month | last_month | custom
  const [customMonth, setCustomMonth] = useState(getThisMonthYYYYMM());
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/staff').then((r) => r.data.length),
      api.get('/admin/bookings?status=PENDING').then((r) => r.data.length),
      api.get('/admin/bookings').then((r) => r.data.length),
    ]).then(([staff, pendingBookings, totalBookings]) =>
      setStats({ staff, pendingBookings, totalBookings })
    );
  }, []);

  useEffect(() => {
    setLoadingMessages(true);
    const params = {};
    if (messageFilter === 'last_month') params.month = getLastMonthYYYYMM();
    else if (messageFilter === 'custom') params.month = customMonth;
    api
      .get('/admin/dashboard/staff-message-counts', { params })
      .then(({ data }) => setMessageCounts({ staff: data.staff || [], startDate: data.startDate, endDate: data.endDate }))
      .catch(() => setMessageCounts({ staff: [], startDate: null, endDate: null }))
      .finally(() => setLoadingMessages(false));
  }, [messageFilter, customMonth]);

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

      <div className="mt-8 card overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">Staff Bookings</h2>
            <p className="mt-0.5 text-sm text-slate-500">Booked/completed bookings and total time per staff for the selected period.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              className="input-field w-36 text-sm"
            >
              <option value="this_month">This month</option>
              <option value="last_month">Last month</option>
              <option value="custom">Pick month</option>
            </select>
            {messageFilter === 'custom' && (
              <input
                type="month"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                className="input-field w-40 text-sm"
              />
            )}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          ) : messageCounts.staff.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No staff or no data for this period.</div>
          ) : (
            <table className="w-full min-w-[400px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">#</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Staff Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">State</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Bookings</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Total time</th>
                </tr>
              </thead>
              <tbody>
                {messageCounts.staff.map((row, index) => (
                  <tr
                    key={row.staffId}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.state || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary-600">{row.bookingCount ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatTotalTime(row.totalMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
