import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FiArrowRight, FiStar, FiCheck, FiZap, FiShield, FiTrendingUp, FiUsers, FiShoppingBag, FiCreditCard, FiMapPin, FiClock, FiAward, FiHeart, FiCoffee } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const AnimatedSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
};

const features = [
  { icon: FiShoppingBag, title: 'Dine-in & Takeaway Orders', desc: 'Seamlessly manage dine-in, takeaway, and delivery orders from one place — no confusion, no delays.', color: 'text-primary-500', bg: 'bg-primary-50' },
  { icon: FiUsers, title: 'Staff Role Management', desc: 'Separate dashboards for Admin, Cashier, Waiter, and Delivery staff — everyone sees exactly what they need.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: FiCreditCard, title: 'Bills & Invoices', desc: 'Generate clean PDF bills instantly, email them to customers, and keep every transaction on record.', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: FiTrendingUp, title: 'Sales & Reports', desc: 'Track daily revenue, popular dishes, expenses, and overall business performance at a glance.', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: FiMapPin, title: 'Delivery Management', desc: 'Assign delivery staff, track order status in real-time, and keep customers updated at every step.', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: FiHeart, title: 'Customer Reviews', desc: 'Collect and manage customer feedback to keep improving your food and service every single day.', color: 'text-red-500', bg: 'bg-red-50' },
];

const stats = [
  { value: '200+', label: 'Happy Customers', icon: FiUsers },
  { value: '50+', label: 'Dishes on Menu', icon: FiCoffee },
  { value: '4.8★', label: 'Customer Rating', icon: FiStar },
  { value: '5 Yrs', label: 'Serving with Love', icon: FiHeart },
];

const testimonials = [
  { name: 'Amit Sharma', role: 'Regular Customer, Patna', text: 'Rasoi has the best Indian food in town. The dal makhani and biryani are absolutely outstanding. Always fresh, always delicious!', rating: 5 },
  { name: 'Priya Singh', role: 'Food Lover, Patna', text: 'I love how they serve everything from classic Indian curries to Chinese and fast food. One place for all my cravings!', rating: 5 },
  { name: 'Rohit Kumar', role: 'Regular Customer, Patna', text: 'The family thali is a must try. Great taste, generous portions, and very friendly staff. Rasoi truly feels like home food.', rating: 5 },
];

const menuHighlights = [
  { category: '🍛 Indian Favourites', items: ['Dal Makhani', 'Butter Chicken', 'Veg Biryani', 'Paneer Tikka'] },
  { category: '🍜 Chinese Delights', items: ['Veg Fried Rice', 'Hakka Noodles', 'Manchurian', 'Spring Rolls'] },
  { category: '🍔 Fast Food', items: ['Veg Burger', 'French Fries', 'Grilled Sandwich', 'Cold Drinks'] },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center hero-gradient">
        <div className="absolute inset-0 pattern-dots opacity-40" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-secondary-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen lg:min-h-0 lg:py-24">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6"
              >
                <FiZap className="w-4 h-4 text-primary-500" />
                Indian · Chinese · Fast Food — All Under One Roof
              </motion.div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-dark-500 leading-[1.1] mb-6">
                Welcome to<br />
                <span className="text-gradient">Rasoi</span><br />
                Eat Well, Live Well
              </h1>

              <p className="text-gray-500 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg">
                From piping hot Indian curries to Chinese favourites and crispy fast food — Rasoi brings you authentic flavours made fresh, every single day.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/menu')}
                  className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2"
                >
                  Explore Our Menu <FiArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register')}
                  className="btn-outline text-base py-4 px-8"
                >
                  Order Online
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-6">
                {['Fresh Ingredients Daily', 'Dine-in & Takeaway', 'Home Delivery Available'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-5 ml-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Today's Orders", value: '38', up: true, color: 'bg-primary-50 border-primary-100' },
                      { label: "Today's Revenue", value: '₹12,450', up: true, color: 'bg-green-50 border-green-100' },
                      { label: 'Tables Occupied', value: '8/15', up: false, color: 'bg-blue-50 border-blue-100' },
                      { label: 'Pending Delivery', value: '4', up: true, color: 'bg-amber-50 border-amber-100' },
                    ].map(card => (
                      <div key={card.label} className={`${card.color} border rounded-xl p-3`}>
                        <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                        <p className="font-heading font-bold text-dark-500 text-lg">{card.value}</p>
                        <p className={`text-xs ${card.up ? 'text-green-500' : 'text-red-400'}`}>{card.up ? '↑ 8%' : '↓ 2%'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Recent Orders</p>
                    {[
                      { name: 'Table 3 — Butter Chicken + Naan', amount: '₹520', status: 'Preparing' },
                      { name: 'Delivery — Veg Biryani x2', amount: '₹380', status: 'On the way' },
                      { name: 'Table 7 — Chinese Combo', amount: '₹650', status: 'Served' },
                    ].map(order => (
                      <div key={order.name} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-xs font-medium text-dark-500">{order.name}</p>
                          <p className="text-xs text-gray-400">{order.amount}</p>
                        </div>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order Delivered</p>
                    <p className="font-semibold text-dark-500 text-sm">₹480 received</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">New Review</p>
                    <p className="font-semibold text-dark-500 text-sm">⭐⭐⭐⭐⭐ Loved it!</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <p className="font-heading text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Menu Highlights ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">Our Menu</motion.p>
            <motion.h2 variants={fadeUp} className="section-title mx-auto">Something for Every Craving</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mx-auto mt-4">From traditional Indian meals to Chinese delicacies and quick bites — Rasoi has it all.</motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-6 mb-12">
            {menuHighlights.map(section => (
              <motion.div
                key={section.category}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card p-6 group"
              >
                <h3 className="font-heading font-bold text-xl text-dark-500 mb-4">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <FiCheck className="w-3 h-3 text-primary-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatedSection>

          <div className="text-center">
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2 py-3 px-8">
              View Full Menu <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">How We Work</motion.p>
            <motion.h2 variants={fadeUp} className="section-title mx-auto">A Smooth Experience<br />From Order to Table</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mx-auto mt-4">Our system keeps everything running smoothly so we can focus on what matters most — great food for you.</motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card p-6 group"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-bold text-xl text-dark-500 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">Order in 3 Simple Steps</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Your Meal, Your Way</motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse the Menu', desc: 'Explore our wide range of Indian, Chinese, and fast food dishes. Pick whatever excites you!', icon: FiCoffee },
              { step: '02', title: 'Place Your Order', desc: 'Order at the table, over the counter, or online. Our team gets it started right away.', icon: FiShoppingBag },
              { step: '03', title: 'Enjoy Your Meal', desc: 'Freshly prepared with quality ingredients, served hot — dine-in or delivered to your door.', icon: FiHeart },
            ].map(step => (
              <motion.div key={step.step} variants={fadeUp} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center shadow-primary">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-dark-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{step.step}</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-dark-500 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-wider mb-3">What Our Customers Say</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Loved by Food Lovers</motion.h2>
          </AnimatedSection>
          <AnimatedSection className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fadeUp} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-500 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Info Strip ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: FiMapPin, title: 'Find Us', desc: 'Located in the heart of Patna. Easy to reach, hard to forget.', color: 'bg-primary-50', iconColor: 'text-primary-500' },
              { icon: FiClock, title: 'Opening Hours', desc: 'Open every day from 10:00 AM to 10:30 PM. Come hungry!', color: 'bg-amber-50', iconColor: 'text-amber-500' },
              { icon: FiShield, title: 'Hygiene First', desc: 'We follow strict hygiene standards. Fresh, clean, and safe — always.', color: 'bg-green-50', iconColor: 'text-green-500' },
            ].map(info => (
              <motion.div key={info.title} variants={fadeUp} className="flex flex-col items-center">
                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <info.icon className={`w-7 h-7 ${info.iconColor}`} />
                </div>
                <h3 className="font-heading font-bold text-lg text-dark-500 mb-2">{info.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{info.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-dark-500 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">Hungry? Come to<br />Rasoi Today!</h2>
            <p className="text-gray-400 text-lg mb-10">Dine in, take away, or get it delivered — great food is just a few clicks away. Join hundreds of happy customers who love Rasoi.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu" className="btn-primary text-base py-4 px-10 inline-flex items-center justify-center gap-2">
                See Our Menu <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="border-2 border-white/20 text-white hover:border-primary-400 hover:text-primary-400 font-semibold py-4 px-10 rounded-xl transition-all duration-200 inline-flex items-center justify-center">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}