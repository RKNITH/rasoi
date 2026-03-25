import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInbox, FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';
import { getInitials } from '../../utils/helpers.js';

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-7xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="font-heading font-semibold text-lg text-dark-500">{title}</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, change, changeLabel, color = 'primary', loading }) {
  const colorMap = { primary: 'bg-primary-50 text-primary-600', blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600', cyan: 'bg-cyan-50 text-cyan-600' };
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.primary}`}>
        {loading ? <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" /> : Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading ? <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-1" /> : (
          <p className="text-2xl font-bold text-dark-500 font-heading mt-0.5">{value}</p>
        )}
        {change !== undefined && !loading && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel || 'vs last month'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, isLoading, emptyMessage = 'No data found', emptyState, onRowClick }) {
  if (loading || isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr>{columns.map(col => <th key={col.key} className="table-header text-left">{col.label}</th>)}</tr></thead>
          <tbody>{[...Array(5)].map((_, i) => (
            <tr key={i}>{columns.map(col => <td key={col.key} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /></td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  if (!(loading || isLoading) && !data?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {emptyState || (
        <>
          <FiInbox className="w-12 h-12 mb-3 opacity-50" />
          <p className="font-medium">{emptyMessage}</p>
        </>
      )}
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead><tr>{columns.map(col => <th key={col.key} className={`table-header text-left ${col.className || ''}`}>{col.label}</th>)}</tr></thead>
        <tbody>{data.map((row, i) => (
          <motion.tr key={row._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick && onRowClick(row)}>
            {columns.map(col => (
              <td key={col.key} className={`table-cell ${col.className || ''}`}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
              </td>
            ))}
          </motion.tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">Page {page} of {pages}</p>
      <div className="flex gap-1.5">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">←</button>
        {[...Array(Math.min(5, pages))].map((_, i) => {
          const p = Math.max(1, Math.min(page - 2, pages - 4)) + i;
          return p <= pages ? (
            <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${p === page ? 'bg-primary-500 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
          ) : null;
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">→</button>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ status, children }) {
  const label = children || status;
  const map = { pending: 'badge-warning', confirmed: 'badge-info', preparing: 'badge-info', ready: 'badge-success', delivered: 'badge-success', completed: 'badge-success', cancelled: 'badge-error', available: 'badge-success', occupied: 'badge-error', reserved: 'badge-warning', maintenance: 'badge-error', paid: 'badge-success', unpaid: 'badge-warning', refunded: 'badge-info', active: 'badge-success', inactive: 'badge-error', draft: 'badge-warning', sent: 'badge-info', 'dine-in': 'badge-primary', takeaway: 'badge-info', delivery: 'badge-warning', online: 'badge-primary' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{label}</span>;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, type = 'button', className = '' }) {
  const variants = { primary: 'btn-primary', secondary: 'btn-secondary', outline: 'btn-outline', ghost: 'btn-ghost', danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all' };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 ${className}`}>
      {loading && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, name, type = 'text', value, onChange, placeholder, required, error, icon: Icon, disabled, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled}
          className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, name, value, onChange, placeholder, rows = 3, required, error, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required}
        className={`input-field resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''}`} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options = [], required, error, className = '', placeholder = 'Select...' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <div className="relative">
        <select name={name} value={value} onChange={onChange} required={required}
          className={`input-field appearance-none pr-10 ${error ? 'border-red-400 focus:ring-red-400' : ''}`}>
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
          ))}
        </select>
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input-field pl-9 py-2.5 text-sm" />
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Delete', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiAlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm leading-relaxed pt-1">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="font-heading text-3xl font-bold text-dark-500">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Nothing here', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="font-heading font-bold text-xl text-dark-500 mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 ${className}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={`${s[size]} border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />;
}
