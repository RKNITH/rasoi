import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { logoutUser } from '../store/slices/authSlice.js';
import { ROLES } from '../utils/helpers.js';

// Auth hook
export const useAuth = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const hasRole = (...roles) => roles.includes(auth.user?.role);
  const isAdmin = auth.user?.role === ROLES.ADMIN;
  const isManager = auth.user?.role === ROLES.MANAGER;
  const isCashier = auth.user?.role === ROLES.CASHIER;
  const isWaiter = auth.user?.role === ROLES.WAITER;
  const isDelivery = auth.user?.role === ROLES.DELIVERY;
  const isCustomer = auth.user?.role === ROLES.CUSTOMER;
  const isStaff = hasRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER, ROLES.DELIVERY);

  const getDashboardPath = () => {
    const paths = {
      admin: '/admin/dashboard',
      manager: '/admin/dashboard',
      cashier: '/cashier/dashboard',
      waiter: '/waiter/dashboard',
      delivery: '/delivery/dashboard',
      customer: '/customer/dashboard',
    };
    return paths[auth.user?.role] || '/';
  };

  return { ...auth, logout, hasRole, isAdmin, isManager, isCashier, isWaiter, isDelivery, isCustomer, isStaff, getDashboardPath };
};

// Click outside hook
export const useClickOutside = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
};

// Debounce hook
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// Local storage hook
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initialValue; }
    catch { return initialValue; }
  });

  const setStoredValue = useCallback((val) => {
    try {
      setValue(val);
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key]);

  return [value, setStoredValue];
};

// Pagination hook
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const goToPage = (p) => setPage(p);
  const reset = () => setPage(1);

  return { page, limit, setPage, setLimit, nextPage, prevPage, goToPage, reset };
};

// Window size hook
export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
};

// Intersection observer hook
export const useIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting), options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isIntersecting];
};
