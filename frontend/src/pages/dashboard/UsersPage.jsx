import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../utils/api.js';
import { PageHeader, Table, Modal, Button, Input, Select, SearchBar, Badge, Avatar, ConfirmDialog, Pagination } from '../../components/common/index.jsx';
import { formatDateTime, getRoleColor, getRoleLabel } from '../../utils/helpers.js';
import { FiPlus, FiToggleLeft, FiTrash2, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'manager', 'cashier', 'waiter', 'delivery', 'customer'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'waiter' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users', { params: { page, limit: 15, search, role: roleFilter } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load users'); }
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) { await api.put(`/users/${editUser._id}`, form); toast.success('User updated!'); }
      else { await api.post('/users', { ...form, isEmailVerified: true }); toast.success('User created!'); }
      setShowForm(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (user) => {
    try { await api.patch(`/users/${user._id}/toggle-status`); toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/users/${deleteTarget._id}`); toast.success('User deleted'); setDeleteTarget(null); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { key: 'name', label: 'User', render: (v, row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar} name={v} size="sm" />
        <div><p className="font-semibold text-sm text-dark-500">{v}</p><p className="text-xs text-gray-400">{row.email}</p></div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => <span className={`badge ${getRoleColor(v)}`}>{getRoleLabel(v)}</span> },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'isEmailVerified', label: 'Verified', render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-warning'}`}>{v ? 'Yes' : 'No'}</span> },
    { key: 'isActive', label: 'Status', render: (v) => <span className={`badge ${v ? 'badge-success' : 'badge-error'}`}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', label: 'Joined', render: (v) => <span className="text-xs text-gray-400">{formatDateTime(v)}</span> },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => { setForm({ name: row.name, email: row.email, phone: row.phone || '', role: row.role, password: '' }); setEditUser(row); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-colors"><FiEdit className="w-4 h-4" /></button>
        <button onClick={() => handleToggle(row)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors"><FiToggleLeft className="w-4 h-4" /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle={`${pagination.total || 0} users`}
        action={<button onClick={() => { setForm({ name: '', email: '', password: '', phone: '', role: 'waiter' }); setEditUser(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm"><FiPlus className="w-4 h-4" /> Add User</button>}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="flex-1" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r} className="capitalize">{getRoleLabel(r)}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden"><Table columns={columns} data={users} isLoading={isLoading} /></div>
      <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editUser ? 'Edit User' : 'Add User'} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          {!editUser && <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />}
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} options={ROLES.map(r => ({ value: r, label: getRoleLabel(r) }))} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editUser ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
