import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../../store/slices/authSlice.js';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingEmail, isLoading } = useSelector(s => s.auth);

  useEffect(() => {
    if (!pendingEmail) navigate('/register');
    const t = setInterval(() => setResendTimer(v => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [pendingEmail, navigate]);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter all 6 digits');
    const res = await dispatch(verifyEmail({ email: pendingEmail, otp: code }));
    if (verifyEmail.fulfilled.match(res)) {
      const role = res.payload.user?.role;
      const paths = {
        admin: '/admin/dashboard', manager: '/admin/dashboard',
        cashier: '/cashier/dashboard', waiter: '/waiter/dashboard',
        delivery: '/delivery/dashboard', customer: '/customer/dashboard'
      };
      navigate(paths[role] || '/customer/dashboard');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email: pendingEmail });
      toast.success('New OTP sent to your email!');
      setResendTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-dark-500 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-2">We sent a 6-digit OTP to</p>
          <p className="text-primary-500 font-semibold mb-8">{pendingEmail}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-8">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => refs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-primary-500 transition-colors text-dark-500"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Verify Email</span><FiArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || resending}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed mx-auto transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}