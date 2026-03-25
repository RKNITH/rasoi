import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchOrders } from '../../store/slices/orderSlice.js';
import { Badge, EmptyState, Button } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime, timeAgo } from '../../utils/helpers.js';
import { FiShoppingBag, FiStar, FiArrowRight, FiPackage } from 'react-icons/fi';

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  useEffect(() => { dispatch(fetchOrders({ limit: 10 })); }, [dispatch]);

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpent = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card p-8 bg-gradient-to-r from-dark-500 to-dark-600 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-48 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-gray-400 text-sm">Welcome back,</p>
        <h1 className="font-heading text-3xl font-bold mt-1">{user?.name} 👋</h1>
        <p className="text-gray-400 mt-2">You have {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</p>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate('/menu')} className="bg-primary-500 hover:bg-primary-600 text-white">
            Order Now <FiArrowRight />
          </Button>
          <Button onClick={() => navigate('/customer/orders')} variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
            My Orders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦' },
          { label: 'Active Orders', value: activeOrders.length, icon: '🔄' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), icon: '💰' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card p-5 text-center">
            <span className="text-3xl">{stat.icon}</span>
            <p className="font-heading font-bold text-xl text-dark-500 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading font-bold text-xl text-dark-500">Active Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activeOrders.map(order => (
              <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-dark-500">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.items?.length} items · {formatCurrency(order.total)} · {timeAgo(order.createdAt)}
                  </p>
                </div>
                <Badge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed orders — prompt review */}
      {completedOrders.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl text-dark-500">Leave a Review</h2>
              <p className="text-xs text-gray-400 mt-0.5">Your feedback helps us improve!</p>
            </div>
            <Link to="/customer/reviews" className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-700 font-medium">
              <FiStar className="w-4 h-4" /> All Reviews →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {completedOrders.slice(0, 3).map(order => (
              <div key={order._id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-500 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.items?.length} items · {formatCurrency(order.total)} · {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/customer/reviews')}
                  className="flex-shrink-0 flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-semibold bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-all"
                >
                  <FiStar className="w-4 h-4" /> Rate Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-dark-500">Recent Orders</h2>
          <Link to="/customer/orders" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon="🍽" title="No orders yet" description="Browse our menu and place your first order!"
            action={<Button onClick={() => navigate('/menu')}>Order Now</Button>} />
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(order => (
              <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-dark-500 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)} · {order.items?.length} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-dark-500">{formatCurrency(order.total)}</p>
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
