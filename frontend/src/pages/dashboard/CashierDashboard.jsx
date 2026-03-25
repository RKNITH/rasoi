import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchOrders } from '../../store/slices/orderSlice.js';
import { StatCard, Badge, Button, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function CashierDashboard() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector(s => s.orders);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({ limit: 50 }));
  }, [dispatch]);

  const pending = orders.filter(o => o.paymentStatus === 'pending' && o.status !== 'cancelled');
  const today = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayRevenue = today.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  const handleCreateInvoice = async (orderId) => {
    setCreating(orderId);
    try {
      await api.post('/invoices', { orderId });
      toast.success('Invoice created!');
    } catch {
      toast.error('Failed to create invoice');
    }
    setCreating(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-dark-500">Cashier Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage billing and payments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Payments" value={pending.length} icon={FiClock} color="amber" loading={isLoading} />
        <StatCard title="Today's Revenue" value={formatCurrency(todayRevenue)} icon={FiDollarSign} color="green" loading={isLoading} />
        <StatCard title="Today's Orders" value={today.length} icon={FiShoppingBag} color="blue" loading={isLoading} />
        <StatCard title="Completed" value={today.filter(o => o.status === 'completed').length} icon={FiCheckCircle} color="primary" loading={isLoading} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-xl text-dark-500">Pending Bills</h2>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon="💳" title="No pending payments" description="All bills are settled!" />
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((order) => (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-dark-500">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.customer?.name || order.customerName || 'Walk-in'} · Table {order.table?.tableNumber || 'N/A'} · {formatDateTime(order.createdAt)}
                  </p>
                  <Badge status={order.status} />
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold text-primary-500 text-lg">{formatCurrency(order.total)}</p>
                    <Badge status={order.paymentStatus} />
                  </div>
                  <Button size="sm" onClick={() => handleCreateInvoice(order._id)} loading={creating === order._id}>
                    Generate Invoice
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
