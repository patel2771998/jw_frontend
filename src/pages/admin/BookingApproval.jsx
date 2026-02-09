import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

export default function BookingApproval() {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [selectedStaffMap, setSelectedStaffMap] = useState({});
  const [approvingId, setApprovingId] = useState(null);

  const fetchBookings = () => {
    const params = filter ? { status: filter } : {};
    api.get('/admin/bookings', { params }).then(({ data }) => setBookings(data));
  };

  useEffect(() => {
    fetchBookings();
    api.get('/admin/staff').then(({ data }) => setStaff(data));
  }, [filter]);

  const approve = async (booking) => {
    const staffId = selectedStaffMap[booking.id] || booking.staffId;
    if (!staffId) {
      alert('Please select a staff first');
      return;
    }
    setApprovingId(booking.id);
    try {
      await api.patch(`/admin/bookings/${booking.id}/approve`, {
        staffId,
        slotTime: booking.slotTime,
      });
      setSelectedStaffMap((prev) => {
        const next = { ...prev };
        delete next[booking.id];
        return next;
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setApprovingId(null);
    }
  };

  const reject = async (booking) => {
    if (!confirm('Reject this booking?')) return;
    try {
      await api.patch(`/admin/bookings/${booking.id}/reject`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

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
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Booking Requests
      </h1>
      <p className="mt-1 text-slate-600">Review and approve or reject wellness session bookings</p>

      <div className="mt-6">
        <div className="flex gap-2">
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

        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{b.client.name}</span>
                  {statusBadge(b.status)}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  <strong>Mobile:</strong> {b.client.mobile}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {b.staff?.name || '—'} • {new Date(b.date).toLocaleDateString()} @ {formatTimeAMPM(b.slotTime)}
                  {b.duration ? ` (${b.duration} min)` : ''}
                </p>
                {b.message && (
                  <p className="mt-1 text-sm text-slate-500">Message: {b.message}</p>
                )}
              </div>
              {b.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <select
                    className="input-field w-40"
                    value={selectedStaffMap[b.id] || b.staffId || ''}
                    onChange={(e) =>
                      setSelectedStaffMap((prev) => ({
                        ...prev,
                        [b.id]: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select staff...</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => approve(b)}
                    disabled={!selectedStaffMap[b.id] && !b.staffId}
                    className="btn-primary"
                  >
                    {approvingId === b.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button onClick={() => reject(b)} className="btn-danger">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {bookings.length === 0 && (
          <p className="mt-8 text-center text-slate-500">No bookings found</p>
        )}
      </div>
    </div>
  );
}
