/**
 * Format 24h time string (HH:MM) to 12h with AM/PM
 * e.g. "11:00" -> "11:00 AM", "14:30" -> "2:30 PM"
 */
export function formatTimeAMPM(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr || '';
  const [h, m] = timeStr.split(':').map(Number);
  const hour = h || 0;
  const min = m || 0;
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${String(min).padStart(2, '0')} ${period}`;
}
