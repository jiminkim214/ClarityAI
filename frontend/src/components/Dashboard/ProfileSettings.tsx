import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Save, Shield } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile({ full_name: fullName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  disabled
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">Profile updated successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Security</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-slate-800">End-to-End Encryption</p>
                <p className="text-sm text-slate-600">Your conversations are encrypted and secure.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-slate-800">Data Privacy</p>
                <p className="text-sm text-slate-600">Your personal information is never shared with third parties.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-slate-800">Secure Storage</p>
                <p className="text-sm text-slate-600">All data is stored securely with industry-standard protection.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Account Created</p>
              <p className="font-medium text-slate-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Last Sign In</p>
              <p className="font-medium text-slate-800">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Account Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>
            <div>
              <p className="text-slate-600">Plan</p>
              <p className="font-medium text-slate-800">Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};