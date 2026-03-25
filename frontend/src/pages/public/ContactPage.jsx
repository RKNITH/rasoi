import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const handleSubmit = (e) => { e.preventDefault(); toast.success('Message sent! We\'ll get back to you within 24 hours.'); setForm({ name: '', email: '', subject: '', message: '' }); };
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-5xl font-bold text-dark-500 mb-6">Get in <span className="text-gradient">Touch</span></h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </motion.div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            {[{ icon: FiMail, title: 'Email', value: 'support@restaurantpro.com' }, { icon: FiPhone, title: 'Phone', value: '+91 98765 43210' }, { icon: FiMapPin, title: 'Location', value: 'Bangalore, India' }].map(c => (
              <div key={c.title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div><p className="font-semibold text-dark-500">{c.title}</p><p className="text-gray-500 text-sm">{c.value}</p></div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">Your Name</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required /></div>
                <div><label className="label">Email Address</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" required /></div>
              </div>
              <div><label className="label">Subject</label><input className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="How can we help?" required /></div>
              <div><label className="label">Message</label><textarea className="input-field" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us more..." required /></div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><FiSend className="w-4 h-4" />Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
