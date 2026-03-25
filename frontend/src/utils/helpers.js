export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', ...options
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    ready: 'success',
    delivered: 'success',
    completed: 'success',
    cancelled: 'error',
    available: 'success',
    occupied: 'error',
    reserved: 'warning',
    maintenance: 'error',
    paid: 'success',
    unpaid: 'warning',
    refunded: 'info',
    active: 'success',
    inactive: 'error',
  };
  return colors[status] || 'info';
};

export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);
  return `badge-${color}`;
};

export const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    cashier: 'bg-green-100 text-green-700',
    waiter: 'bg-amber-100 text-amber-700',
    delivery: 'bg-cyan-100 text-cyan-700',
    customer: 'bg-gray-100 text-gray-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

export const getRoleLabel = (role) => {
  const labels = {
    admin: 'Admin', manager: 'Manager', cashier: 'Cashier',
    waiter: 'Waiter', delivery: 'Delivery', customer: 'Customer'
  };
  return labels[role] || role;
};

export const truncate = (str, n = 50) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  WAITER: 'waiter',
  DELIVERY: 'delivery',
  CUSTOMER: 'customer',
};

export const ORDER_STATUS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
export const ORDER_TYPES = ['dine-in', 'takeaway', 'delivery', 'online'];
export const PAYMENT_METHODS = ['cash', 'card', 'upi', 'online', 'wallet'];
