import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/index.js';
import { FiMenu, FiX, FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../../store/slices/cartSlice.js';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardPath } = useAuth();
  const cartCount = useSelector(selectCartItemCount);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary group-hover:shadow-primary-lg transition-shadow">
                <span className="text-white text-lg">🍽</span>
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-dark-500">Restaurant</span>
                <span className="font-heading font-bold text-xl text-primary-500">Pro</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.to ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2.5 rounded-xl hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-all"
                title="View Cart"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">{cartCount}</span>
                )}
              </button>

              {isAuthenticated ? (
                <button onClick={() => navigate(getDashboardPath())} className="btn-primary py-2 px-4 text-sm hidden sm:block">
                  Dashboard →
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm py-2">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
                </div>
              )}

              {/* Mobile menu btn */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === link.to ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 flex gap-2">
                  {isAuthenticated ? (
                    <button onClick={() => navigate(getDashboardPath())} className="btn-primary w-full text-sm">Dashboard</button>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1 text-center border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:border-primary-500 hover:text-primary-500 transition-all">Login</Link>
                      <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2.5">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🍽</span>
                </div>
                <span className="font-heading font-bold text-xl">Rasoi</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Complete restaurant management solution built for modern restaurants. Streamline operations, delight customers.</p>
            </div>

            {[
              { title: 'Quick Links', links: [{ to: '/', l: 'Home' }, { to: '/menu', l: 'Menu' }, { to: '/about', l: 'About Us' }, { to: '/features', l: 'Features' }, { to: '/contact', l: 'Contact' }] },
              { title: 'Legal', links: [{ to: '/privacy', l: 'Privacy Policy' }, { to: '/terms', l: 'Terms & Conditions' }] },
              { title: 'Account', links: [{ to: '/login', l: 'Login' }, { to: '/register', l: 'Register' }] },
            ].map(section => (
              <div key={section.title}>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map(link => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-gray-400 text-sm hover:text-primary-400 transition-colors">{link.l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Rasoi. All rights reserved.</p>
            <p className="text-gray-500 text-sm">Built with ❤️ for Rasoi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
