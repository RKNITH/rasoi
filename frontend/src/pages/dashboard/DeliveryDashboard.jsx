import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice.js';
import { StatCard, Badge, Button, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { FiTruck, FiClock, FiCheckCircle, FiMapPin } from 'react-icons/fi';

export default function DeliveryDashboard() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchOrders({ orderType: 'delivery', limit: 30 }));
  }, [dispatch]);

  const pending = orders.filter(o => o.status === 'ready');
  const inTransit = orders.filter(o => o.status === 'delivered');
  const completed = orders.filter(o => o.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-dark-500">Delivery Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your deliveries</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ready for Pickup" value={pending.length} icon={FiClock} color="amber" loading={isLoading} />
        <StatCard title="In Transit" value={inTransit.length} icon={FiTruck} color="blue" loading={isLoading} />
        <StatCard title="Completed Today" value={completed.length} icon={FiCheckCircle} color="green" loading={isLoading} />
        <StatCard title="Total Orders" value={orders.length} icon={FiMapPin} color="primary" loading={isLoading} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-xl text-dark-500">Orders Ready for Pickup</h2>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon="🚚" title="No deliveries pending" description="All caught up! New orders will appear here." />
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-dark-500">{order.orderNumber}</p>
                    <Badge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">{order.customer?.name || order.customerName}</p>
                  {order.deliveryAddress && (
                    <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" />
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-bold text-primary-500 text-lg">{formatCurrency(order.total)}</p>
                  <Button size="sm" onClick={() => dispatch(updateOrderStatus({ id: order._id, status: 'delivered' }))}>
                    Pick Up
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {inTransit.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-bold text-xl text-dark-500">In Transit</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {inTransit.map(order => (
              <div key={order._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-dark-500">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customer?.name || order.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-primary-500">{formatCurrency(order.total)}</p>
                  <Button size="sm" variant="outline" onClick={() => dispatch(updateOrderStatus({ id: order._id, status: 'completed' }))}>
                    Mark Delivered
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
