import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/staff/bookings').then(({ data }) => setBookings(data));
  }, []);

  const upcoming = bookings.filter(
    (b) => b.status === 'APPROVED' && new Date(b.date) >= new Date()
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Welcome</h1>
      <p className="mt-1 text-slate-600">View your assigned bookings and schedule</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-medium">Upcoming Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{upcoming.length}</p>
          <Link to="/staff/bookings" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
            View all bookings
          </Link>
        </div>
        <Link to="/staff/schedule" className="card block transition-shadow hover:shadow-md">
          <h3 className="font-medium">My Schedule</h3>
          <p className="mt-2 text-slate-600">
            View your availability and booked appointments.
          </p>
          <span className="mt-4 inline-block text-primary-600 font-medium">View schedule →</span>
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-8">
          <h2 className="font-medium">Next Appointments</h2>
          <div className="mt-4 space-y-3">
            {upcoming.slice(0, 5).map((b) => (
              <div key={b.id} className="card">
                <p className="font-medium">{b.client.name}</p>
                <p className="text-sm text-slate-600">
                  {new Date(b.date).toLocaleDateString()} at {formatTimeAMPM(b.slotTime || b.timeSlot)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
