import { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { PageHeader, Table, Modal, Button, Input, Select, Pagination } from '../../components/common/index.jsx';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATS = ['ingredients', 'utilities', 'staff', 'maintenance', 'marketing', 'equipment', 'rent', 'other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', date: '', paymentMethod: 'cash', description: '' });

  const fetch = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/expenses', { params: { page, limit: 15 } });
      setExpenses(res.data.data); setPagination(res.data.pagination); setTotalAmount(res.data.totalAmount);
    } catch { toast.error('Failed'); }
    setIsLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', form); toast.success('Expense recorded!'); setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/expenses/${id}`); toast.success('Expense deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v, row) => (<div><p className="font-semibold text-sm text-dark-500">{v}</p><p className="text-xs text-gray-400">{row.description}</p></div>) },
    { key: 'category', label: 'Category', render: v => <span className="badge badge-info capitalize">{v}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-bold text-red-500">{formatCurrency(v)}</span> },
    { key: 'paymentMethod', label: 'Method', render: v => <span className="capitalize text-sm text-gray-500">{v}</span> },
    { key: 'date', label: 'Date', render: v => <span className="text-xs text-gray-400">{formatDate(v)}</span> },
    { key: '_id', label: '', render: v => <button onClick={() => handleDelete(v)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" subtitle={`Total: ${formatCurrency(totalAmount)}`} action={<button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><FiPlus className="w-4 h-4" /> Add Expense</button>} />
      <div className="card overflow-hidden"><Table columns={columns} data={expenses} isLoading={isLoading} /></div>
      <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Record Expense" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} options={CATS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
            <Select label="Payment Method" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} options={['cash','card','upi','bank_transfer'].map(m => ({ value: m, label: m.toUpperCase() }))} />
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
