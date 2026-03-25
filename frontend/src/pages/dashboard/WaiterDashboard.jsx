import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice.js';
import { fetchTables } from '../../store/slices/tableSlice.js';
import { StatCard, Badge, Button, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { FiShoppingBag, FiTable, FiClock, FiCheck } from 'react-icons/fi';

export default function WaiterDashboard() {
  const dispatch = useDispatch();
  const { orders, isLoading: ordersLoading } = useSelector(s => s.orders);
  const { tables } = useSelector(s => s.tables);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchOrders({ limit: 30 }));
    dispatch(fetchTables());
  }, [dispatch]);

  const myOrders = orders.filter(o => o.waiter?._id === user?._id || o.waiter === user?._id);
  const activeOrders = myOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const occupiedTables = tables.filter(t => t.status === 'occupied');

  const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'completed' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-dark-500">Waiter Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your tables and orders</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Orders" value={activeOrders.length} icon={FiShoppingBag} color="primary" loading={ordersLoading} />
        <StatCard title="My Tables" value={occupiedTables.length} icon={FiTable} color="blue" loading={ordersLoading} />
        <StatCard title="Pending" value={activeOrders.filter(o => o.status === 'pending').length} icon={FiClock} color="amber" loading={ordersLoading} />
        <StatCard title="Ready to Serve" value={activeOrders.filter(o => o.status === 'ready').length} icon={FiCheck} color="green" loading={ordersLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-dark-500">Active Orders</h2>
            <span className="badge badge-primary">{activeOrders.length}</span>
          </div>
          {activeOrders.length === 0 ? <EmptyState icon="🍽" title="No active orders" /> : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {activeOrders.map(order => (
                <div key={order._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-dark-500 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">Table {order.table?.tableNumber || 'N/A'} · {formatCurrency(order.total)}</p>
                    </div>
                    <Badge status={order.status} />
                  </div>
                  {nextStatus[order.status] && (
                    <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: order._id, status: nextStatus[order.status] }))}>
                      Mark as {nextStatus[order.status]}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-bold text-xl text-dark-500">Table Status</h2>
          </div>
          <div className="p-6 grid grid-cols-3 gap-3">
            {tables.map(table => (
              <div key={table._id} className={`p-3 rounded-xl text-center border-2 transition-all ${
                table.status === 'occupied' ? 'bg-red-50 border-red-200' :
                table.status === 'reserved' ? 'bg-amber-50 border-amber-200' :
                'bg-green-50 border-green-200'
              }`}>
                <p className="font-bold text-dark-500 text-sm">T{table.tableNumber}</p>
                <p className="text-xs text-gray-500 mt-0.5">{table.capacity}p</p>
                <span className={`text-xs font-medium ${table.status === 'occupied' ? 'text-red-600' : table.status === 'reserved' ? 'text-amber-600' : 'text-green-600'}`}>
                  {table.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
