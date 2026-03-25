import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', content: 'We collect information you provide directly (name, email, phone), information from device usage (IP address, browser type), and order/transaction data necessary to provide our services.' },
    { title: '2. How We Use Your Information', content: 'We use your information to provide and improve our services, process transactions, send transactional emails (OTPs, invoices), and ensure platform security.' },
    { title: '3. Data Storage & Security', content: 'All data is encrypted in transit using TLS. Passwords are hashed using bcrypt. JWT tokens are stored in HTTP-only cookies. We use MongoDB with proper access controls.' },
    { title: '4. Cookies', content: 'We use essential cookies for authentication (HTTP-only JWT cookie). We do not use tracking or advertising cookies.' },
    { title: '5. Data Sharing', content: 'We do not sell your personal data. We may share data with service providers (Cloudinary for images, SMTP for emails) strictly to provide our services.' },
    { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal data. Contact us at privacy@restaurantpro.com to exercise these rights.' },
    { title: '7. Data Retention', content: 'We retain your data for as long as your account is active. On account deletion, personal data is removed within 30 days, except where required by law.' },
    { title: '8. Contact Us', content: 'For privacy concerns, email us at privacy@restaurantpro.com or write to us at our registered address in Bangalore, India.' },
  ];
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: January 1, 2025</p>
        </motion.div>
        <div className="card p-8 space-y-8">
          <p className="text-gray-600 leading-relaxed">This Privacy Policy describes how RestaurantPro collects, uses, and shares information about you when you use our restaurant management platform.</p>
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <h2 className="font-heading font-bold text-xl text-dark-500 mb-3">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
