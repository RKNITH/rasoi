import { motion } from 'framer-motion';
import { FiShoppingBag, FiGrid, FiTable, FiUsers, FiFileText, FiTrendingUp, FiTruck, FiMessageSquare, FiShield, FiMail, FiDownload, FiActivity } from 'react-icons/fi';

const features = [
  { icon: FiShoppingBag, title: 'Order Management', desc: 'Handle dine-in, takeaway, delivery, and online orders with real-time status tracking across all channels.', tag: 'Core' },
  { icon: FiGrid, title: 'Menu Management', desc: 'Create and manage your menu with categories, photos, pricing, dietary flags, and availability toggles.', tag: 'Core' },
  { icon: FiTable, title: 'Table Management', desc: 'Visual table map, reservation system, occupancy tracking, and automatic table release on order completion.', tag: 'Core' },
  { icon: FiUsers, title: 'Role-Based Access', desc: '6 distinct roles with granular permissions. Admin, Manager, Cashier, Waiter, Delivery, Customer.', tag: 'Security' },
  { icon: FiFileText, title: 'PDF Invoicing', desc: 'Auto-generate professional PDF invoices for every order. Download instantly or email directly to customers.', tag: 'Billing' },
  { icon: FiTrendingUp, title: 'Analytics Dashboard', desc: 'Real-time sales analytics, revenue trends, top-selling items, and expense tracking in one view.', tag: 'Analytics' },
  { icon: FiTruck, title: 'Delivery Tracking', desc: 'Assign delivery staff to orders, track status in real-time, and keep customers updated automatically.', tag: 'Delivery' },
  { icon: FiMessageSquare, title: 'Reviews & Feedback', desc: 'Customer reviews with star ratings, manager replies, and aggregated scores on menu items.', tag: 'Customer' },
  { icon: FiMail, title: 'Email Notifications', desc: 'Automated OTP verification, welcome emails, invoice delivery, and order confirmations via SMTP.', tag: 'Communication' },
  { icon: FiShield, title: 'Enterprise Security', desc: 'JWT auth, HTTP-only cookies, rate limiting, Helmet headers, and MongoDB sanitization.', tag: 'Security' },
  { icon: FiDownload, title: 'Data Export', desc: 'Export sales reports, transaction logs, and expense records for accounting and compliance.', tag: 'Analytics' },
  { icon: FiActivity, title: 'Activity Logs', desc: 'Complete audit trail of all system activities — who did what and when.', tag: 'Compliance' },
];

const tagColors = {
  Core: 'bg-primary-100 text-primary-700', Security: 'bg-red-100 text-red-700',
  Billing: 'bg-green-100 text-green-700', Analytics: 'bg-purple-100 text-purple-700',
  Delivery: 'bg-amber-100 text-amber-700', Customer: 'bg-blue-100 text-blue-700',
  Communication: 'bg-cyan-100 text-cyan-700', Compliance: 'bg-gray-100 text-gray-700',
};

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-6">Powerful <span className="text-gradient">Features</span></h1>
          <p className="text-gray-500 text-xl max-w-3xl mx-auto">Everything you need to run a world-class restaurant, all in one platform.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}
              className="card p-6 group hover:border-primary-200 border border-transparent transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <f.icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[f.tag]}`}>{f.tag}</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-dark-500 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
