import { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { PageHeader, Table, Button, SearchBar, Pagination, Modal, EmptyState } from '../../components/common/index.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { FiDownload, FiEye, FiPrinter, FiFileText, FiUser, FiCreditCard, FiHash, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/invoices', { params: { page, limit: 15, search } });
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search]);

  const downloadPDF = async (id, invoiceNumber) => {
    const loadingToast = toast.loading('Preparing PDF...');
    try {
      const res = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `INV-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded!', { id: loadingToast });
    } catch {
      toast.error('Download failed', { id: loadingToast });
    }
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: v => <span className="font-mono font-bold text-dark-500">#{v}</span>
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v) => <span className="font-medium text-gray-700">{v || 'Walk-in'}</span>
    },
    {
      key: 'total',
      label: 'Amount',
      render: v => <span className="font-bold text-primary-600">{formatCurrency(v)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: v => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${v === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: v => <span className="text-xs text-gray-400">{formatDateTime(v)}</span>
    },
    {
      key: '_id',
      label: 'Actions',
      render: (v, row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setSelected(row)} className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-500 rounded-xl transition-all">
            <FiEye className="w-4 h-4" />
          </button>
          <button onClick={() => downloadPDF(row._id, row.invoiceNumber)} className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-xl transition-all">
            <FiDownload className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Invoices"
        subtitle="Manage and track your customer billing history"
        action={
          <button onClick={fetchInvoices} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Search Bar - Better Padding & Shadow */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice number or customer name..."
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          emptyState={<EmptyState icon="📑" title="No invoices found" description="Try adjusting your search filters." />}
        />
      </div>

      <Pagination page={page} pages={pagination.pages || 1} onPageChange={setPage} />

      {/* Modern Detailed Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected && (
          <div className="p-2 sm:p-4">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                  <FiFileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-500">Invoice Detail</h3>
                  <p className="text-sm font-mono text-gray-400">Ref: #{selected.invoiceNumber}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${selected.status === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                  {selected.status}
                </span>
                <p className="text-xs text-gray-400 mt-2">{formatDateTime(selected.createdAt)}</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <FiUser /> Customer Information
                </div>
                <p className="font-bold text-dark-500">{selected.customerName || 'Walk-in'}</p>
                <p className="text-sm text-gray-500">{selected.customerEmail || 'No email provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <FiCreditCard /> Payment Details
                </div>
                <p className="font-bold text-dark-500 capitalize">{selected.paymentMethod}</p>
                <p className="text-sm text-gray-500">Full Payment Received</p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-bold text-dark-400 px-1">Purchased Items</h4>
              <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
                {selected.items?.map((item, i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-dark-500">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatCurrency(item.price || (item.total / item.quantity))}</p>
                    </div>
                    <span className="font-bold text-dark-500">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-dark-500 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selected.subtotal || selected.total)}</span>
                </div>
                {selected.tax > 0 && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Tax</span>
                    <span>{formatCurrency(selected.tax)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-base font-medium">Final Amount</span>
                  <span className="text-3xl font-black text-primary-400">{formatCurrency(selected.total)}</span>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition-all text-sm"
              >
                <FiPrinter /> Print Receipt
              </button>
              <button
                onClick={() => downloadPDF(selected._id, selected.invoiceNumber)}
                className="flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-white transition-all text-sm shadow-lg shadow-primary-100"
              >
                <FiDownload /> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}