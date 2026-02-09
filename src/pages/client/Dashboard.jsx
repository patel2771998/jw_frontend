import React from 'react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Welcome</h1>
      <p className="mt-1 text-slate-600">Book your wellness session with our skilled practitioners</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link to="/client/book" className="card block transition-all hover:border-primary-200 hover:shadow-md">
          <h3 className="font-display text-lg font-semibold text-primary-700">Book Session</h3>
          <p className="mt-2 text-slate-600">
            View available staff by date and time, then book your wellness session.
          </p>
          <span className="mt-4 inline-block font-medium text-primary-600">Book now →</span>
        </Link>
        <Link to="/client/my-bookings" className="card block transition-all hover:border-primary-200 hover:shadow-md">
          <h3 className="font-display text-lg font-semibold text-primary-700">My Bookings</h3>
          <p className="mt-2 text-slate-600">
            View status of your booking requests (Pending, Approved, or Rejected).
          </p>
          <span className="mt-4 inline-block font-medium text-primary-600">View bookings →</span>
        </Link>
      </div>
    </div>
  );
}
