import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatTimeAMPM } from '../../utils/formatTime';

export default function StaffSchedule() {
  const [data, setData] = useState({ availability: [], bookings: [] });

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    api
      .get('/staff/schedule', {
        params: {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
        },
      })
      .then(({ data }) => setData(data));
  }, []);

  const byDate = {};
  data.availability.forEach((a) => {
    const d = new Date(a.date).toISOString().slice(0, 10);
    byDate[d] = { ...byDate[d], availability: a };
  });
  data.bookings.forEach((b) => {
    const d = new Date(b.date).toISOString().slice(0, 10);
    byDate[d] = { ...byDate[d], bookings: [...(byDate[d]?.bookings || []), b] };
  });

  const dates = Object.keys(byDate).sort();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">My Schedule</h1>
      <p className="mt-1 text-slate-600">Availability and wellness sessions (next 14 days)</p>

      <div className="mt-8 space-y-6">
        {dates.map((date) => {
          const day = byDate[date];
          return (
            <div key={date} className="card">
              <h3 className="font-medium text-primary-700">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {day.availability && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600">Availability</h4>
                    <p className="mt-1 text-sm">
                      Slots: {day.availability.slots?.map(formatTimeAMPM).join(', ') || '-'}
                    </p>
                  </div>
                )}
                {day.bookings?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600">Bookings</h4>
                    {day.bookings.map((b) => (
                      <div key={b.id} className="mt-2 rounded-lg bg-primary-50 p-3 text-sm">
                        <p className="font-medium">{b.client.name}</p>
                        <p className="text-slate-600">
                          {formatTimeAMPM(b.slotTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {dates.length === 0 && (
        <p className="mt-8 text-center text-slate-500">No schedule data for the next 14 days</p>
      )}
    </div>
  );
}
