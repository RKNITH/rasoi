import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrders, updateOrderStatus, updateOrderPayment } from '../../store/slices/orderSlice.js';
import { PageHeader, Table, Badge, Modal, Button, Select, SearchBar, Pagination, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime, getStatusBadgeClass, ORDER_STATUS, PAYMENT_METHODS } from '../../utils/helpers.js';
import { useAuth } from '../../hooks/index.js';
import { FiEye, FiEdit, FiFilter, FiRefreshCw, FiDownload, FiUser, FiMapPin, FiClock, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const statusFlow = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'ready',
  ready: 'delivered', delivered: 'completed'
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, isLoading, pagination } = useSelector(s => s.orders);
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', orderType: '' });
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: 'paid', paymentMethod: 'cash' });

  useEffect(() => {
    dispatch(fetchOrders({ page, limit: 15, status: filters.status, orderType: filters.orderType, search }));
  }, [dispatch, page, filters, search]);

  const handleStatusUpdate = async (order, toStatus) => {
    await dispatch(updateOrderStatus({ id: order._id, status: toStatus }));
    setShowDetail(false);
  };

  const handlePayment = async () => {
    await dispatch(updateOrderPayment({ id: selectedOrder._id, ...paymentForm }));
    setShowDetail(false);
  };

  const handleCreateInvoice = async (orderId) => {
    try {
      await api.post('/invoices', { orderId, sendEmail: false });
      toast.success('Invoice created!');
    } catch { toast.error('Failed to create invoice'); }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => <span className="font-mono text-sm font-semibold text-dark-500">{v}</span> },
    { key: 'orderType', label: 'Type', render: (v) => <span className="capitalize badge badge-info">{v}</span> },
    { key: 'customer', label: 'Customer', render: (v, row) => <span className="text-sm">{v?.name || row.customerName || 'Walk-in'}</span> },
    {
      key: 'items', label: 'Items',
      render: (v) => <span className="text-sm text-gray-500">{v?.length} item{v?.length !== 1 ? 's' : ''}</span>
    },
    { key: 'total', label: 'Total', render: (v) => <span className="font-bold text-primary-500">{formatCurrency(v)}</span> },
    {
      key: 'status', label: 'Status',
      render: (v) => <span className={getStatusBadgeClass(v)}>{v}</span>
    },
    {
      key: 'paymentStatus', label: 'Payment',
      render: (v) => <span className={`badge ${v === 'paid' ? 'badge-success' : 'badge-warning'}`}>{v}</span>
    },
    { key: 'createdAt', label: 'Placed', render: (v) => <span className="text-xs text-gray-400">{formatDateTime(v)}</span> },
    {
      key: '_id', label: 'Actions',
      render: (v, row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); setShowDetail(true); }}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-colors">
            <FiEye className="w-4 h-4" />
          </button>
          {['admin', 'manager', 'cashier'].includes(user?.role) && (
            <button onClick={(e) => { e.stopPropagation(); handleCreateInvoice(row._id); }}
              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors">
              <FiDownload className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <PageHeader
        title="Orders"
        subtitle={`${pagination?.total || 0} total orders`}
        action={
          <button onClick={() => dispatch(fetchOrders({ page, limit: 15 }))} className="btn-ghost flex items-center gap-2 text-sm">
            <FiRefreshCw className="w-4 h-4" />Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 shadow-sm border-gray-100">
        <SearchBar value={search} onChange={setSearch} placeholder="Search order number..." className="flex-1" />
        <div className="flex gap-2">
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-full sm:w-40">
            <option value="">All Status</option>
            {ORDER_STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={filters.orderType} onChange={e => setFilters({ ...filters, orderType: e.target.value })}
            className="input-field w-full sm:w-40">
            <option value="">All Types</option>
            {['dine-in', 'takeaway', 'delivery', 'online'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden shadow-sm border-gray-100">
        <Table
          columns={columns}
          data={orders}
          isLoading={isLoading}
          emptyState={<EmptyState icon="📦" title="No orders found" description="Orders will appear here once placed" />}
          onRowClick={(row) => { setSelectedOrder(row); setShowDetail(true); }}
        />
      </div>

      <div className="flex justify-center mt-6">
        <Pagination page={page} pages={pagination?.pages || 1} onPageChange={setPage} />
      </div>

      {/* Improved Order Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">Order Details</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{selectedOrder?.orderNumber}</span>
          </div>
        }
        size="xl"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6 p-1">
            {/* Top Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Order Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Status', value: selectedOrder.status, icon: <FiClock />, color: getStatusBadgeClass(selectedOrder.status) },
                    { label: 'Payment', value: selectedOrder.paymentStatus, icon: <FiCreditCard />, color: selectedOrder.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning' },
                    { label: 'Type', value: selectedOrder.orderType, icon: <FiMapPin />, color: 'badge-info' },
                    { label: 'Customer', value: selectedOrder.customer?.name || selectedOrder.customerName || 'Walk-in', icon: <FiUser /> },
                    { label: 'Table', value: selectedOrder.table?.tableNumber || 'N/A' },
                    { label: 'Date', value: formatDateTime(selectedOrder.createdAt) },
                  ].map((r, i) => (
                    <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 transition-all">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{r.label}</span>
                      </div>
                      <div className={`text-sm font-bold capitalize flex items-center gap-2 ${r.color || 'text-dark-500'}`}>
                        {typeof r.value === 'string' && r.color ? <span className={r.color}>{r.value}</span> : r.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items Section */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                    <h4 className="font-bold text-dark-500">Order Items</h4>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto px-5">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="py-4 flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-dark-500 leading-tight">{item.name}</p>
                          {item.specialInstructions && (
                            <div className="bg-orange-50 text-orange-700 text-[11px] px-2 py-1 rounded-md inline-block italic">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dark-500">{formatCurrency(item.price * item.quantity)}</p>
                          <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Billing & Actions */}
              <div className="space-y-6">
                {/* Billing Card */}
                <div className="bg-dark-500 text-white rounded-2xl p-6 shadow-lg space-y-4">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm opacity-80"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                    <div className="flex justify-between text-sm opacity-80"><span>Tax ({selectedOrder.taxRate}%)</span><span>{formatCurrency(selectedOrder.tax)}</span></div>
                    {selectedOrder.discount > 0 && <div className="flex justify-between text-sm text-green-400 font-medium"><span>Discount</span><span>-{formatCurrency(selectedOrder.discount)}</span></div>}
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-sm font-medium">Grand Total</span>
                      <span className="text-2xl font-bold text-primary-400">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Processing (Conditional) */}
                {selectedOrder.paymentStatus !== 'paid' && ['admin', 'manager', 'cashier'].includes(user?.role) && (
                  <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 space-y-4">
                    <p className="font-bold text-primary-900 text-sm flex items-center gap-2">
                      <FiCreditCard className="text-primary-500" /> Process Payment
                    </p>
                    <Select
                      value={paymentForm.paymentMethod}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      options={PAYMENT_METHODS.map(m => ({ value: m, label: m.toUpperCase() }))}
                    />
                    <Button block onClick={handlePayment}>Complete Payment</Button>
                  </div>
                )}

                {/* History */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-dark-400 px-1">Timeline</h4>
                  <div className="space-y-4 pl-2">
                    {selectedOrder.statusHistory?.map((h, i) => (
                      <div key={i} className="relative flex gap-4 pb-2 group">
                        {i !== selectedOrder.statusHistory.length - 1 && (
                          <div className="absolute left-[5px] top-4 w-[1px] h-full bg-gray-100" />
                        )}
                        <div className="w-[11px] h-[11px] rounded-full bg-primary-500 ring-4 ring-primary-50 mt-1 z-10" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-dark-500 capitalize leading-none mb-1">{h.status}</p>
                          <p className="text-[10px] text-gray-400">{formatDateTime(h.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              {['pending', 'confirmed'].includes(selectedOrder?.status) && ['admin', 'manager'].includes(user?.role) && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder, 'cancelled')}
                  className="px-6 py-2.5 text-red-500 hover:bg-red-50 text-sm font-bold rounded-xl transition-all"
                >
                  Cancel Order
                </button>
              )}
              {statusFlow[selectedOrder?.status] && (
                <Button
                  className="px-8 shadow-md shadow-primary-200"
                  onClick={() => handleStatusUpdate(selectedOrder, statusFlow[selectedOrder.status])}
                >
                  Move to {statusFlow[selectedOrder.status].toUpperCase()}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}