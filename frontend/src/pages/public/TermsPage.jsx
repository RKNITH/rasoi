import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using RestaurantPro, you agree to be bound by these Terms. If you do not agree, do not use the platform.' },
    { title: '2. Use of the Platform', content: 'You may use RestaurantPro for lawful restaurant management purposes only. You must not misuse the platform for fraud, unauthorized access, or any illegal activity.' },
    { title: '3. Account Responsibilities', content: 'You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access. You are responsible for all activity under your account.' },
    { title: '4. Payments & Billing', content: 'Subscription fees are billed monthly or annually. All fees are non-refundable except as required by law. We reserve the right to modify pricing with 30 days notice.' },
    { title: '5. Intellectual Property', content: 'RestaurantPro and its content are protected by copyright and trademark law. You may not copy, modify, or distribute our software without permission.' },
    { title: '6. Limitation of Liability', content: 'To the maximum extent permitted by law, RestaurantPro shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform.' },
    { title: '7. Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms. You may cancel your subscription at any time through the account settings.' },
    { title: '8. Governing Law', content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.' },
  ];
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-4">Terms & Conditions</h1>
          <p className="text-gray-500">Last updated: January 1, 2025</p>
        </motion.div>
        <div className="card p-8 space-y-8">
          <p className="text-gray-600 leading-relaxed">Please read these Terms carefully before using RestaurantPro. These Terms constitute a legally binding agreement between you and RestaurantPro.</p>
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
