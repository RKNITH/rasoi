import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateProfile } from '../../store/slices/authSlice.js';
import { Input, Button, Avatar } from '../../components/common/index.jsx';
import { getRoleLabel, getRoleColor } from '../../utils/helpers.js';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', form.name);
    data.append('phone', form.phone);
    if (avatarFile) data.append('avatar', avatarFile);
    dispatch(updateProfile(data));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setPwLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-dark-500">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="card p-6">
        <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar src={avatarPreview || user?.avatar} name={user?.name} size="xl" />
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-dark-500">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`badge text-xs mt-1 ${getRoleColor(user?.role)}`}>{getRoleLabel(user?.role)}</span>
            </div>
          </div>

          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <div>
            <label className="label">Email Address</label>
            <input type="email" value={user?.email} disabled className="input-field bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="10-digit phone number" />

          <Button type="submit" loading={isLoading}>Save Changes</Button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-heading font-bold text-xl text-dark-500 mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" type="password" value={passwordForm.currentPassword}
            onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
          <Input label="New Password" type="password" value={passwordForm.newPassword}
            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
          <Button type="submit" loading={pwLoading}>Update Password</Button>
        </form>
      </div>
    </div>
  );
}
