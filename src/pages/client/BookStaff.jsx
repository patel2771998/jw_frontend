import React, { useState } from 'react';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

const DURATIONS = [60, 90, 120];

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + m + minutes;
  const nh = Math.floor(totalMin / 60) % 24;
  const nm = totalMin % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export default function BookStaff() {
  const [date, setDate] = useState('');
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('anyone');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const endTime = startTime ? addMinutes(startTime, duration) : '';

  const search = async () => {
    if (!date) {
      alert('Please select date');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/client/staff-available', {
        params: { date },
      });
      setAvailable(data);
      setSelectedStaff('anyone');
      setStartTime('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const timeToMinutes = (t) => {
    const [h, m] = (t || '').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const overlaps = (startMin, endMin, ranges) =>
    ranges.some((r) => startMin < r.end && endMin > r.start);

  const isPast = (dateStr, timeStr) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dateStr !== today) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const slotMin = timeToMinutes(timeStr);
    return slotMin <= nowMin;
  };

  const getSlotAvailable = (slot, item, dur = duration) => {
    const startMin = timeToMinutes(slot.time);
    const endMin = startMin + dur;
    if (endMin > 21 * 60) return false;
    if (overlaps(startMin, endMin, item.bookedRanges || [])) return false;
    return slot.available;
  };

  const getAllTimeSlots = () => {
    const slotMap = new Map();
    available.forEach((item) => {
      (item.timeSlots || []).forEach((slot) => {
        if (!slotMap.has(slot.time)) {
          slotMap.set(slot.time, { time: slot.time, available: false, busy: false, items: [] });
        }
        const s = slotMap.get(slot.time);
        s.items = s.items || [];
        s.items.push({ ...item, slot });
        if (slot.available) s.available = true;
        if (slot.busy) s.busy = true;
      });
    });
    return Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getStaffForSlot = (time) => {
    const slotMin = timeToMinutes(time);
    const endMin = slotMin + duration;
    return available.find((item) => {
      const ranges = item.bookedRanges || [];
      if (endMin > 21 * 60) return false;
      if (overlaps(slotMin, endMin, ranges)) return false;
      const slot = item.timeSlots?.find((s) => s.time === time);
      return slot?.available;
    })?.staff;
  };

  const submitBooking = async () => {
    if (!date || !startTime) {
      alert('Please select date and start time');
      return;
    }
    let staffId = null;
    if (selectedStaff === 'anyone') {
      const staff = getStaffForSlot(startTime);
      staffId = staff?.id;
    } else {
      staffId = selectedStaff;
    }
    if (!staffId) {
      alert('Please select a valid staff or time slot');
      return;
    }
    setLoading(true);
    try {
      await api.post('/client/bookings', {
        staffId,
        date,
        slotTime: startTime,
        duration,
        message: message || null,
      });
      setSubmitted(true);
      setAvailable([]);
      setSelectedStaff('anyone');
      setStartTime('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots =
    selectedStaff === 'anyone'
      ? getAllTimeSlots()
      : (available.find((a) => a.staff.id === selectedStaff)?.timeSlots || []);

  const isSlotSelectable = (slot, dur = duration) => {
    const s = typeof slot === 'string' ? { time: slot, available: true, busy: false } : slot;
    if (isPast(date, s.time)) return false;
    if (selectedStaff === 'anyone') {
      return available.some((item) => {
        const slotData = item.timeSlots?.find((t) => t.time === s.time);
        return slotData && getSlotAvailable(slotData, item, dur);
      });
    }
    const item = available.find((a) => a.staff.id === selectedStaff);
    const slotData = item?.timeSlots?.find((t) => t.time === s.time);
    return slotData && getSlotAvailable(slotData, item, dur);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Book Your Session</h1>
      <p className="mt-1 text-slate-600">Select date, start time, duration (60/90/120 min)</p>

      {submitted && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">
          Booking request submitted! You will be notified when it is approved.
        </div>
      )}

      <div className="mt-6 card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-40"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={search} className="btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {available.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-medium">Available Staff</h2>

          <div className="card">
            <label className="mb-2 block text-sm font-medium">Preferred Practitioner (default: Anyone)</label>
            <select
              value={selectedStaff}
              onChange={(e) => {
                setSelectedStaff(e.target.value);
                setStartTime('');
              }}
              className="input-field w-64"
            >
              <option value="anyone">Anyone</option>
              {available.map((item) => (
                <option key={item.staff.id} value={item.staff.id}>
                  {item.staff.name} ({item.staff.state})
                </option>
              ))}
            </select>
          </div>

          <div className="card grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Select time</option>
                {timeSlots
                  .filter((slot) => {
                    const s = typeof slot === 'string' ? { time: slot } : slot;
                    return !isPast(date, s.time);
                  })
                  .map((slot) => {
                    const s = typeof slot === 'string' ? { time: slot, available: true, busy: false } : slot;
                    const selectable = isSlotSelectable(slot);
                    const disabled = !selectable;
                    const label = disabled
                      ? s.busy
                        ? ' (Busy)'
                        : ' (Not available)'
                      : '';
                    return (
                    <option key={s.time} value={s.time} disabled={disabled}>
                      {formatTimeAMPM(s.time)}{label}
                    </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Duration</label>
              <select
                value={duration}
                onChange={(e) => {
                  const newDur = Number(e.target.value);
                  setDuration(newDur);
                  if (startTime && !isSlotSelectable({ time: startTime, available: true, busy: false }, newDur)) {
                    setStartTime('');
                  }
                }}
                className="input-field w-full"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">End Time</label>
              <div className="flex h-10 items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-700">
                {endTime || '—'}
              </div>
            </div>
          </div>

          <div className="card border-2 border-primary-200 bg-primary-50/30">
            <h3 className="font-medium">Confirm Booking</h3>
            <p className="mt-1 text-sm">
              {selectedStaff === 'anyone'
                ? `Anyone on ${date}`
                : `${available.find((a) => a.staff.id === selectedStaff)?.staff.name} on ${date}`}
              {' — '}
              {startTime ? `${formatTimeAMPM(startTime)} to ${formatTimeAMPM(endTime)} (${duration} min)` : 'Select start time'}
            </p>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Any special requests?"
              />
            </div>
            <button
              onClick={submitBooking}
              disabled={loading || !startTime}
              className="btn-primary mt-4"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
