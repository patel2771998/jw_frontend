import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATES = ['Indian', 'North-East', 'Thai'];

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState({ open: false, edit: null });
  const [form, setForm] = useState({ name: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = () => {
    api.get('/admin/staff').then(({ data }) => setStaff(data));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAdd = () => {
    setForm({ name: '', state: '' });
    setModal({ open: true, edit: null });
    setError('');
  };

  const openEdit = (s) => {
    setForm({ name: s.name, state: s.state || '' });
    setModal({ open: true, edit: s });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (modal.edit) {
        await api.put(`/admin/staff/${modal.edit.id}`, form);
      } else {
        await api.post('/admin/staff', form);
      }
      setModal({ open: false });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Staff Management</h1>
        <button onClick={openAdd} className="btn-primary">Add Staff</button>
      </div>

      <div className="mt-6 card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">State</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.state || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="mr-2 text-primary-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <p className="p-8 text-center text-slate-500">No staff yet. Add your first staff member.</p>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md">
            <h2 className="font-display text-lg font-semibold">
              {modal.edit ? 'Edit Staff' : 'Add Staff'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select state</option>
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
