import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
        <div className="text-8xl mb-6">🍽</div>
        <h1 className="font-heading text-8xl font-bold text-gradient mb-4">404</h1>
        <h2 className="font-heading text-3xl font-bold text-dark-500 mb-4">Page Not Found</h2>
        <p className="text-gray-500 text-lg mb-10">Looks like this page went out for delivery and never came back.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2"><FiArrowLeft className="w-5 h-5" />Back to Home</Link>
      </motion.div>
    </div>
  );
}
