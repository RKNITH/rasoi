import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiZap, FiUsers } from 'react-icons/fi';

const values = [
  { icon: FiTarget, title: 'Mission-Driven', desc: 'We exist to empower restaurant owners with technology that was previously only available to large chains.' },
  { icon: FiHeart, title: 'Customer First', desc: 'Every feature we build starts with a real problem faced by real restaurant operators.' },
  { icon: FiZap, title: 'Always Innovating', desc: 'We continuously improve our platform based on feedback from our growing community of users.' },
  { icon: FiUsers, title: 'Built for Teams', desc: 'Designed so every team member — from admin to delivery rider — has exactly what they need.' },
];

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-6">About <span className="text-gradient">RestaurantPro</span></h1>
          <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
            We're a passionate team of technologists and food industry veterans who believe every restaurant deserves enterprise-grade management tools.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-4xl font-bold text-dark-500 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>RestaurantPro was founded in 2022 by a team frustrated with clunky, expensive restaurant software that required weeks of training and still couldn't do basic things like email a PDF invoice.</p>
              <p>We spent 18 months talking to restaurant owners, managers, and staff across India to understand their real pain points. The result is a platform that's powerful enough for enterprise restaurants yet simple enough for a family-owned café.</p>
              <p>Today, RestaurantPro powers over 500 restaurants and processes thousands of orders daily. We're just getting started.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-500 to-secondary-400 rounded-3xl p-8 text-white"
          >
            <div className="grid grid-cols-2 gap-6">
              {[{ v: '2022', l: 'Founded' }, { v: '500+', l: 'Restaurants' }, { v: '50K+', l: 'Orders/month' }, { v: '6', l: 'Roles supported' }].map(s => (
                <div key={s.l} className="text-center p-4 bg-white/10 rounded-2xl">
                  <p className="font-heading font-bold text-4xl mb-1">{s.v}</p>
                  <p className="text-white/70 text-sm">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mb-24">
          <h2 className="font-heading text-4xl font-bold text-dark-500 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="font-heading font-bold text-lg text-dark-500 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
