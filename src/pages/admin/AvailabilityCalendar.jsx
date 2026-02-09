import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

const TIME_SLOTS = [
  '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45',
];
const DURATIONS = [60, 90, 120];

const DEFAULT_SLOTS = [
  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00',
];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Extract YYYY-MM-DD from API date (avoids timezone shift - DB stores calendar dates) */
const toDateStr = (d) => {
  if (!d) return '';
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.slice(0, 10);
};

export default function AvailabilityCalendar() {
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [allAvailability, setAllAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableStaff, setAvailableStaff] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    api.get('/admin/staff').then(({ data }) => setStaff(data));
  }, []);

  useEffect(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, d - 7));
    const end = new Date(Date.UTC(y, m - 1, d + 7));
    api
      .get('/admin/availability', {
        params: {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
        },
      })
      .then(({ data }) => {
        setAllAvailability(data);
        const forDate = data.filter((a) => toDateStr(a.date) === selectedDate);
        const map = {};
        forDate.forEach((a) => {
          map[a.staffId] = Array.isArray(a.slots) && a.slots.length > 0;
        });
        setAvailableStaff(map);
      })
      .catch(() => setAllAvailability([]));
  }, [selectedDate]);

  useEffect(() => {
    api
      .get('/admin/bookings', {
        params: { startDate: selectedDate, endDate: selectedDate },
      })
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]));
  }, [selectedDate]);

  const toggleStaffAvailable = async (staffId) => {
    if (loadingId) return;
    const av = allAvailability.find(
      (a) => a.staffId === staffId && toDateStr(a.date) === selectedDate
    );
    const isCurrentlyAvailable = Array.isArray(av?.slots) && av.slots.length > 0;
    const newSlots = isCurrentlyAvailable ? [] : DEFAULT_SLOTS;

    setLoadingId(staffId);
    try {
      await api.post('/admin/availability', {
        staffId,
        date: selectedDate,
        slots: newSlots,
      });
      setAvailableStaff((prev) => ({
        ...prev,
        [staffId]: !isCurrentlyAvailable,
      }));
      const [y, m, d] = selectedDate.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, d - 7));
      const end = new Date(Date.UTC(y, m - 1, d + 7));
      const { data } = await api.get('/admin/availability', {
        params: {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
        },
      });
      setAllAvailability(data);
      const forDate = data.filter((a) => toDateStr(a.date) === selectedDate);
      const map = {};
      forDate.forEach((a) => {
        map[a.staffId] = Array.isArray(a.slots) && a.slots.length > 0;
      });
      setAvailableStaff(map);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setLoadingId(null);
    }
  };

  const approvedBookings = bookings.filter((b) => b.status === 'APPROVED' || b.status === 'PENDING');

  const isToday = selectedDate === todayStr();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ staffId: '', slotTime: '', duration: 60 });
  const [savingId, setSavingId] = useState(null);

  const openEdit = (b) => {
    setEditingId(b.id);
    setEditForm({
      staffId: b.staffId || b.staff?.id,
      slotTime: b.slotTime || '',
      duration: b.duration || 60,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({ staffId: '', slotTime: '', duration: 60 });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingId(editingId);
    try {
      await api.patch(`/admin/bookings/${editingId}`, {
        staffId: editForm.staffId,
        slotTime: editForm.slotTime,
        duration: editForm.duration,
      });
      const { data } = await api.get('/admin/bookings', {
        params: { startDate: selectedDate, endDate: selectedDate },
      });
      setBookings(data);
      closeEdit();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = async (b) => {
    if (!confirm(`Cancel ${b.client?.name || 'this'}'s booking for ${formatTimeAMPM(b.slotTime)}?`)) return;
    try {
      await api.patch(`/admin/bookings/${b.id}/cancel`);
      const { data } = await api.get('/admin/bookings', {
        params: { startDate: selectedDate, endDate: selectedDate },
      });
      setBookings(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Staff Availability
      </h1>
      <p className="mt-1 text-slate-600">
        {isToday ? "Today's" : 'Selected date'} availability – check staff and view bookings
      </p>

      <div className="mt-6 card">
        <div className="flex items-center gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDate(todayStr())}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  isToday ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Today
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-40"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium text-slate-700">
            {isToday ? "Today's" : 'Selected date'} Staff Availability
          </h3>
          <div className="flex flex-wrap gap-4">
            {staff.map((s) => {
              const isAvailable = availableStaff[s.id] === true;
              const isLoading = loadingId === s.id;
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                    isLoading ? 'cursor-wait border-slate-100 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => {
                      if (!isLoading) toggleStaffAvailable(s.id);
                    }}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-slate-500">({s.state || '—'})</span>
                  <span
                    className={`text-xs ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}
                  >
                    {isLoading ? '...' : isAvailable ? 'Available' : 'Not available'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden p-0">
        <h3 className="border-b border-slate-200 px-4 py-3 font-medium">
          Booked Staff – {isToday ? 'Today' : selectedDate}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Staff</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Client Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No bookings for this date
                  </td>
                </tr>
              ) : (
                approvedBookings.map((b) => (
                  <tr key={b.id} className="border-t border-slate-200">
                    {editingId === b.id ? (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.staffId}
                            onChange={(e) => setEditForm((f) => ({ ...f, staffId: e.target.value }))}
                            className="input-field w-36 text-sm"
                          >
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <select
                              value={editForm.slotTime}
                              onChange={(e) => setEditForm((f) => ({ ...f, slotTime: e.target.value }))}
                              className="input-field w-28 text-sm"
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t} value={t}>{formatTimeAMPM(t)}</option>
                              ))}
                            </select>
                            <select
                              value={editForm.duration}
                              onChange={(e) => setEditForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                              className="input-field w-20 text-sm"
                            >
                              {DURATIONS.map((d) => (
                                <option key={d} value={d}>{d}m</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.client?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Editing</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={saveEdit}
                            disabled={savingId === b.id}
                            className="mr-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                          >
                            {savingId === b.id ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={closeEdit}
                            disabled={savingId === b.id}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{b.staff?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatTimeAMPM(b.slotTime)}
                          {b.duration ? ` (${b.duration} min)` : ''}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.client?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              b.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEdit(b)}
                            className="mr-2 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(b)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
