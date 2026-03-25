import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../store/slices/authSlice.js';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    const res = await dispatch(resetPassword({ email: form.email, otp: form.otp, password: form.password }));
    if (resetPassword.fulfilled.match(res)) navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-dark-500 mb-2">Reset password</h2>
            <p className="text-gray-500">Enter the OTP from your email and set a new password.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Email</label><input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><label className="label">OTP Code</label><input className="input-field tracking-widest font-mono text-center text-lg" placeholder="••••••" maxLength={6} value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} required /></div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-11 pr-11" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><FiEye className="w-4 h-4" /></button>
              </div>
            </div>
            <div><label className="label">Confirm Password</label><input type="password" className="input-field" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required /></div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">{isLoading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
          <Link to="/login" className="mt-6 text-sm text-gray-500 hover:text-primary-500 flex items-center justify-center gap-1">← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
