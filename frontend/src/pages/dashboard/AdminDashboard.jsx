import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice.js';
import { fetchOrders } from '../../store/slices/orderSlice.js';
import { StatCard, Badge, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime, timeAgo } from '../../utils/helpers.js';
import {
  FiShoppingBag, FiDollarSign, FiUsers, FiTable,
  FiTrendingUp, FiClock, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#FF6B35', '#F7931E', '#1a1a2e', '#10b981', '#6366f1', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector(s => s.dashboard);
  const { orders } = useSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchOrders({ limit: 5 }));
  }, [dispatch]);

  const o = stats?.overview;

  const statusData = stats?.charts?.ordersByStatus?.map(s => ({
    name: s._id,
    value: s.count
  })) || [];

  const dailyData = stats?.charts?.dailyRevenue?.slice(-14).map(d => ({
    date: d._id?.slice(5),
    revenue: d.revenue,
    orders: d.orders
  })) || [];

  const typeData = stats?.charts?.ordersByType?.map(t => ({
    name: t._id,
    value: t.count
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-dark-500">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Updates
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(o?.totalRevenue)} icon={FiDollarSign} color="primary" change={o?.revenueGrowth} loading={isLoading} />
        <StatCard title="Today's Revenue" value={formatCurrency(o?.todayRevenue)} icon={FiTrendingUp} color="green" loading={isLoading} />
        <StatCard title="Total Orders" value={o?.totalOrders?.toLocaleString() || '0'} icon={FiShoppingBag} color="blue" subtitle={`${o?.todayOrders || 0} today`} loading={isLoading} />
        <StatCard title="Pending Orders" value={o?.pendingOrders || '0'} icon={FiClock} color="amber" loading={isLoading} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="This Month" value={formatCurrency(o?.thisMonthRevenue)} icon={FiDollarSign} color="purple" loading={isLoading} />
        <StatCard title="Last Month" value={formatCurrency(o?.lastMonthRevenue)} icon={FiDollarSign} color="blue" loading={isLoading} />
        <StatCard title="Total Users" value={o?.totalUsers?.toLocaleString() || '0'} icon={FiUsers} color="green" loading={isLoading} />
        <StatCard title="Occupied Tables" value={o?.activeTables || '0'} icon={FiTable} color="amber" loading={isLoading} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Revenue & Orders (Last 14 days)</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <EmptyState icon="📊" title="No data yet" description="Revenue data will appear here once orders are placed" />
            </div>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Orders by Status</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.slice(0, 4).map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 capitalize">{s.name}</span>
                    </div>
                    <span className="font-semibold text-dark-500">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="🥧" title="No orders yet" />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Types Bar */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Order Types</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="value" name="Orders" fill="#FF6B35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" title="No data" />}
        </div>

        {/* Top Items */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-4">Top Menu Items</h3>
          <div className="space-y-3">
            {stats?.topItems?.length > 0 ? stats.topItems.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-500 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.count} orders · {formatCurrency(item.revenue)}</p>
                </div>
              </div>
            )) : <EmptyState icon="🍽" title="No data" />}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order._id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-500 truncate">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary-500">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <EmptyState icon="📦" title="No orders" />}
          </div>
        </div>
      </div>
    </div>
  );
}
