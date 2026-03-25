import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from './store/slices/authSlice.js';
import { useAuth } from './hooks/index.js';

// Layout components
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Public pages — no auth needed, always accessible
import HomePage from './pages/public/HomePage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import FeaturesPage from './pages/public/FeaturesPage.jsx';
import MenuPage from './pages/public/MenuPage.jsx';
import PrivacyPage from './pages/public/PrivacyPage.jsx';
import TermsPage from './pages/public/TermsPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import CartPage from './pages/public/CartPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import OrdersPage from './pages/dashboard/OrdersPage.jsx';
import MenuManagementPage from './pages/dashboard/MenuManagementPage.jsx';
import TablesPage from './pages/dashboard/TablesPage.jsx';
import UsersPage from './pages/dashboard/UsersPage.jsx';
import InvoicesPage from './pages/dashboard/InvoicesPage.jsx';
import ExpensesPage from './pages/dashboard/ExpensesPage.jsx';
import ReviewsPage from './pages/dashboard/ReviewsPage.jsx';
import SettingsPage from './pages/dashboard/SettingsPage.jsx';
import ProfilePage from './pages/dashboard/ProfilePage.jsx';
import ActivityPage from './pages/dashboard/ActivityPage.jsx';
import CashierDashboard from './pages/dashboard/CashierDashboard.jsx';
import WaiterDashboard from './pages/dashboard/WaiterDashboard.jsx';
import DeliveryDashboard from './pages/dashboard/DeliveryDashboard.jsx';
import CustomerDashboard from './pages/dashboard/CustomerDashboard.jsx';
import CustomerReviewPage from './pages/dashboard/CustomerReviewPage.jsx';

import LoadingScreen from './components/common/LoadingScreen.jsx';

// ── ProtectedRoute ───────────────────────────────────────────────────────────
// Only blocks access to dashboard routes. Shows loader only until auth check
// is done, then redirects to login if not authenticated.
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();
  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

// ── GuestRoute ───────────────────────────────────────────────────────────────
// Only used for login/register pages — if already logged in, go to dashboard.
// Does NOT block: renders children immediately while auth is initializing,
// so the login page shows instantly (no flash of loader).
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, getDashboardPath } = useAuth();
  // Wait for init only on guest routes so we don't redirect wrongly
  if (!isInitialized) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;
  return children;
};

const ADMIN_MANAGER = ['admin', 'manager'];

export default function App() {
  const dispatch = useDispatch();

  // Silently check if user is already logged in (via cookie).
  // Public pages render immediately — they do NOT wait for this.
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Routes>

      {/* ── PUBLIC ROUTES ─────────────────────────────────────────────────── */}
      {/* These are always accessible — no auth check, no loader, no redirect  */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      {/* ── AUTH ROUTES ───────────────────────────────────────────────────── */}
      {/* Redirect to dashboard if already logged in                           */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      {/* ── ADMIN / MANAGER ───────────────────────────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute roles={ADMIN_MANAGER}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── CASHIER ───────────────────────────────────────────────────────── */}
      <Route path="/cashier" element={<ProtectedRoute roles={['admin', 'manager', 'cashier']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<CashierDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── WAITER ────────────────────────────────────────────────────────── */}
      <Route path="/waiter" element={<ProtectedRoute roles={['admin', 'manager', 'waiter']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<WaiterDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── DELIVERY ──────────────────────────────────────────────────────── */}
      <Route path="/delivery" element={<ProtectedRoute roles={['admin', 'manager', 'delivery']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── CUSTOMER ──────────────────────────────────────────────────────── */}
      <Route path="/customer" element={<ProtectedRoute roles={['customer']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reviews" element={<CustomerReviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ── FALLBACK ──────────────────────────────────────────────────────── */}
      <Route path="/unauthorized" element={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-6xl mb-4">🚫</p>
            <h1 className="text-4xl font-heading font-bold text-dark-500 mb-3">Access Denied</h1>
            <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
            <a href="/" className="btn-primary inline-block">Go Home</a>
          </div>
        </div>
      } />
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}