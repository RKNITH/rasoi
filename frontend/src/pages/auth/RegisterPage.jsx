import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, setPendingEmail } from '../../store/slices/authSlice.js';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(res)) {
      dispatch(setPendingEmail(form.email));
      navigate('/verify-email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-xl">🍽</span>
          </div>
          <span className="font-heading font-bold text-2xl text-dark-500">Rasoi</span>
        </div>
        <div className="card p-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-dark-500 mb-2">Create account</h2>
            <p className="text-gray-500">Start your free 14-day trial today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input className="input-field pl-11" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" className="input-field pl-11" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative"><FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="tel" className="input-field pl-11" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-11 pr-11" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">By registering, you agree to our <Link to="/terms" className="text-primary-500 hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>.</p>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><FiArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">Sign in →</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
