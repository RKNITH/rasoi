import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toggle, Button, Input, Textarea, PageHeader } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true, orderAlerts: true,
    maintenanceMode: false, autoInvoice: true,
    lowStockAlert: true, dailyReport: false
  });
  const [restaurant, setRestaurant] = useState({
    name: 'RestaurantPro', email: 'info@restaurantpro.com',
    phone: '9876543210', address: '123 Main St, Mumbai',
    taxRate: '5', currency: '₹'
  });

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" />

      <div className="card p-6">
        <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Restaurant Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Restaurant Name" value={restaurant.name} onChange={e => setRestaurant({...restaurant, name: e.target.value})} />
          <Input label="Email" type="email" value={restaurant.email} onChange={e => setRestaurant({...restaurant, email: e.target.value})} />
          <Input label="Phone" value={restaurant.phone} onChange={e => setRestaurant({...restaurant, phone: e.target.value})} />
          <Input label="Tax Rate (%)" type="number" value={restaurant.taxRate} onChange={e => setRestaurant({...restaurant, taxRate: e.target.value})} />
          <div className="col-span-2">
            <Textarea label="Address" value={restaurant.address} onChange={e => setRestaurant({...restaurant, address: e.target.value})} rows={2} />
          </div>
        </div>
        <Button className="mt-4" onClick={() => toast.success('Restaurant info saved!')}>Save Information</Button>
      </div>

      {[
        { title: 'Notifications', items: [
          ['emailNotifications', 'Email Notifications', 'Receive email alerts for new orders'],
          ['orderAlerts', 'Order Alerts', 'Desktop notifications for pending orders'],
          ['dailyReport', 'Daily Reports', 'Get daily revenue summary via email'],
          ['lowStockAlert', 'Low Stock Alerts', 'Alerts when menu items run low'],
        ]},
        { title: 'System', items: [
          ['maintenanceMode', 'Maintenance Mode', 'Temporarily disable customer ordering'],
          ['autoInvoice', 'Auto-Generate Invoices', 'Automatically create invoices on order completion'],
        ]},
      ].map(section => (
        <div key={section.title} className="card p-6">
          <h3 className="font-heading font-bold text-xl text-dark-500 mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.items.map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-dark-500 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle checked={settings[key]} onChange={v => setSettings({...settings, [key]: v})} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={() => toast.success('All settings saved!')}>Save All Settings</Button>
    </div>
  );
}
