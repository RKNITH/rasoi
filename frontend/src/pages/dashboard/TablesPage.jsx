import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTables, createTable, updateTableStatus, deleteTable } from '../../store/slices/tableSlice.js';
import { PageHeader, Modal, Button, Input, ConfirmDialog } from '../../components/common/index.jsx';
import { formatDateTime } from '../../utils/helpers.js';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const statusColors = { available: 'bg-green-100 border-green-300 text-green-700', occupied: 'bg-red-100 border-red-300 text-red-700', reserved: 'bg-amber-100 border-amber-300 text-amber-700', maintenance: 'bg-gray-100 border-gray-300 text-gray-700' };

export default function TablesPage() {
  const dispatch = useDispatch();
  const { tables, isLoading } = useSelector(s => s.tables);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ tableNumber: '', capacity: '', floor: 'Ground', section: '' });
  const [filter, setFilter] = useState('');

  useEffect(() => { dispatch(fetchTables()); }, [dispatch]);

  const filtered = filter ? tables.filter(t => t.status === filter) : tables;

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await dispatch(createTable(form));
    if (createTable.fulfilled.match(res)) setShowCreate(false);
  };

  const statusCounts = tables.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" subtitle={`${tables.length} tables`}
        action={<button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm"><FiPlus className="w-4 h-4" /> Add Table</button>}
      />

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[['all', '🪑 All', tables.length], ['available', '✅ Available', statusCounts.available || 0], ['occupied', '🔴 Occupied', statusCounts.occupied || 0], ['reserved', '🟡 Reserved', statusCounts.reserved || 0]].map(([s, l, c]) => (
          <button key={s} onClick={() => setFilter(s === 'all' ? '' : s)} className={`card p-4 text-center transition-all ${filter === (s === 'all' ? '' : s) ? 'ring-2 ring-primary-500' : ''}`}>
            <p className="text-2xl font-heading font-bold text-dark-500">{c}</p>
            <p className="text-xs text-gray-500 mt-1">{l}</p>
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => <div key={i} className="card h-36 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(table => (
            <motion.div key={table._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`card p-4 border-2 ${statusColors[table.status]} text-center cursor-pointer hover:shadow-lg transition-all group`}
            >
              <p className="font-heading font-bold text-3xl mb-1">T{table.tableNumber}</p>
              <p className="text-xs font-medium mb-2">{table.floor} · {table.capacity} seats</p>
              <span className="text-xs font-semibold capitalize px-3 py-1 rounded-full bg-white/50">{table.status}</span>
              {table.currentOrder && <p className="text-xs mt-2 opacity-70">Order #{table.currentOrder?.orderNumber?.slice(-4)}</p>}
              <div className="mt-3 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {table.status !== 'available' && (
                  <button onClick={() => dispatch(updateTableStatus({ id: table._id, status: 'available' }))}
                    className="text-xs bg-white/80 text-gray-700 px-2 py-1 rounded-lg hover:bg-white transition-all">Free</button>
                )}
                {table.status !== 'maintenance' && (
                  <button onClick={() => dispatch(updateTableStatus({ id: table._id, status: 'maintenance' }))}
                    className="text-xs bg-white/80 text-gray-700 px-2 py-1 rounded-lg hover:bg-white transition-all">Maintenance</button>
                )}
                <button onClick={() => setDeleteTarget(table)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200 transition-all"><FiTrash2 className="w-3 h-3" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Table" size="sm">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <Input label="Table Number" value={form.tableNumber} onChange={e => setForm({...form, tableNumber: e.target.value})} placeholder="e.g. 1, A1, T5" required />
          <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} placeholder="Number of seats" required />
          <Input label="Floor" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} placeholder="e.g. Ground, First" />
          <Input label="Section" value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="e.g. Indoor, Outdoor, VIP" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Add Table</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { dispatch(deleteTable(deleteTarget._id)); setDeleteTarget(null); }}
        title="Remove Table" message={`Remove Table ${deleteTarget?.tableNumber}?`} confirmText="Remove"
      />
    </div>
  );
}
