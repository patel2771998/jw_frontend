import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

export default function StaffBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? { status: filter } : {};
    api.get('/staff/bookings', { params }).then(({ data }) => setBookings(data));
  }, [filter]);

  const statusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">My Bookings</h1>
      <p className="mt-1 text-slate-600">View bookings assigned to you</p>

      <div className="mt-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              !filter ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            All
          </button>
          {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === s ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="flex items-center gap-2">
                <span className="font-medium">{b.client.name}</span>
                {statusBadge(b.status)}
              </div>
              <p className="mt-2 text-slate-600">
                {new Date(b.date).toLocaleDateString()} @ {formatTimeAMPM(b.slotTime)}
                {b.duration ? ` (${b.duration} min)` : ''}
              </p>
              <p className="mt-1 text-sm text-slate-500">{b.client.mobile}</p>
            </div>
          ))}
        </div>
        {bookings.length === 0 && (
          <p className="mt-8 text-center text-slate-500">No bookings yet</p>
        )}
      </div>
    </div>
  );
}
