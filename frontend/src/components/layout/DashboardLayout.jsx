import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/index.js';
import { toggleSidebar, setSidebarOpen } from '../../store/slices/uiSlice.js';
import { getInitials, getRoleColor, getRoleLabel } from '../../utils/helpers.js';
import {
  FiGrid, FiShoppingBag, FiBook, FiUsers, FiFileText,
  FiMessageSquare, FiSettings, FiLogOut, FiMenu, FiBell,
  FiChevronLeft, FiTable, FiDollarSign, FiActivity, FiUser, FiTruck, FiHome, FiX
} from 'react-icons/fi';

const getNavLinks = (role) => {
  const adminLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { to: 'orders', label: 'Orders', icon: FiShoppingBag },
    { to: 'menu', label: 'Menu', icon: FiBook },
    { to: 'tables', label: 'Tables', icon: FiTable },
    { to: 'users', label: 'Users', icon: FiUsers },
    { to: 'invoices', label: 'Invoices', icon: FiFileText },
    { to: 'expenses', label: 'Expenses', icon: FiDollarSign },
    { to: 'reviews', label: 'Reviews', icon: FiMessageSquare },
    { to: 'activity', label: 'Activity Log', icon: FiActivity },
    { to: 'settings', label: 'Settings', icon: FiSettings },
    { to: 'profile', label: 'My Profile', icon: FiUser },
  ];
  const cashierLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { to: 'orders', label: 'Orders', icon: FiShoppingBag },
    { to: 'invoices', label: 'Invoices', icon: FiFileText },
    { to: 'profile', label: 'My Profile', icon: FiUser },
  ];
  const waiterLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { to: 'orders', label: 'Orders', icon: FiShoppingBag },
    { to: 'tables', label: 'Tables', icon: FiTable },
    { to: 'profile', label: 'My Profile', icon: FiUser },
  ];
  const deliveryLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { to: 'orders', label: 'Deliveries', icon: FiTruck },
    { to: 'profile', label: 'My Profile', icon: FiUser },
  ];
  const customerLinks = [
    { to: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { to: 'orders', label: 'My Orders', icon: FiShoppingBag },
    { to: 'reviews', label: 'My Reviews', icon: FiMessageSquare },
    { to: 'profile', label: 'My Profile', icon: FiUser },
  ];
  const map = { admin: adminLinks, manager: adminLinks, cashier: cashierLinks, waiter: waiterLinks, delivery: deliveryLinks, customer: customerLinks };
  return map[role] || customerLinks;
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { sidebarOpen } = useSelector(state => state.ui);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) dispatch(setSidebarOpen(true));
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [dispatch]);

  const navLinks = getNavLinks(user?.role);
  const rolePrefix = ['admin', 'manager'].includes(user?.role) ? '/admin' : `/${user?.role}`;
  const isActive = (path) => location.pathname.endsWith(`/${path}`);

  // Sidebar variants for smooth animation
  const sidebarVariants = {
    expanded: { width: 256, x: 0 },
    collapsed: { width: 80, x: 0 },
    mobileOpen: { x: 0, width: 280 },
    mobileClosed: { x: -280, width: 280 }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? (sidebarOpen ? "mobileOpen" : "mobileClosed")
            : (collapsed ? "collapsed" : "expanded")
        }
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`bg-dark-500 flex flex-col flex-shrink-0 z-50 h-full ${isMobile ? 'fixed' : 'relative'}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-white/10 overflow-hidden">
          <Link to="/" className="flex items-center gap-3 min-w-max">
            <div className="w-9 h-9 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-lg">🍽</span>
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-heading font-bold text-white text-xl tracking-tight"
                >
                  Rasoi
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="px-4 py-6 border-b border-white/10">
          <div className={`flex items-center gap-3 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-white border border-white/10 overflow-hidden flex-shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(user?.name)}
            </div>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="min-w-0"
              >
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${getRoleColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={`${rolePrefix}/${to}`}
              onClick={() => isMobile && dispatch(setSidebarOpen(false))}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative
                ${isActive(to) ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                ${collapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(to) ? 'scale-110' : ''}`} />
              {(!collapsed || isMobile) && <span className="truncate">{label}</span>}

              {/* Tooltip for Collapsed Sidebar */}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-2xl transition-opacity">
                  {label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <FiHome className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>Public Site</span>}
          </Link>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium ${collapsed && !isMobile ? 'justify-center' : ''}`}
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => isMobile ? dispatch(toggleSidebar()) : setCollapsed(!collapsed)}
              className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all active:scale-95"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-bold text-gray-800 text-lg capitalize tracking-tight">
                {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div
              onClick={() => navigate(`${rolePrefix}/profile`)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-primary-600 transition-colors">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">View Profile</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-bold border-2 border-transparent group-hover:border-primary-200 transition-all overflow-hidden shadow-sm">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}