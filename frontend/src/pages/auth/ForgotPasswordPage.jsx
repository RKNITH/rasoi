import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice.js';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const dispatch = useDispatch();
  const { isLoading } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(res)) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h2 className="font-heading text-3xl font-bold text-dark-500 mb-3">Check your inbox</h2>
              <p className="text-gray-500 mb-6">If an account with <strong>{email}</strong> exists, we've sent a password reset OTP.</p>
              <Link to="/reset-password" className="btn-primary w-full block text-center">Enter OTP →</Link>
              <Link to="/login" className="mt-4 text-sm text-gray-500 hover:text-primary-500 flex items-center justify-center gap-2"><FiArrowLeft className="w-4 h-4" />Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold text-dark-500 mb-2">Forgot password?</h2>
                <p className="text-gray-500">Enter your email and we'll send you a reset OTP.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" className="input-field pl-11" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Sending...' : 'Send Reset OTP'}
                </button>
              </form>
              <Link to="/login" className="mt-6 text-sm text-gray-500 hover:text-primary-500 flex items-center justify-center gap-2"><FiArrowLeft className="w-4 h-4" />Back to Login</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
