import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  LogOut, 
  Edit2,
  Save,
  X,
  Camera
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement profile update
    // This would typically update the user profile in Supabase
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 bg-gray-800 border border-white/20 rounded-full hover:bg-gray-700 transition-colors">
                <Camera className="w-3 h-3 text-gray-300" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xl font-medium text-white bg-white/10 border border-white/20 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter your name"
                />
              ) : (
                <h2 className="text-xl font-medium text-white">
                  {user.user_metadata?.full_name || 'Anonymous User'}
                </h2>
              )}
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </div>
            
            {/* Edit Button */}
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isEditing ? (
                <Save className="w-4 h-4 text-green-400" />
              ) : (
                <Edit2 className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Account Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white">{formatDate(user.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-white">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Therapy Statistics */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Therapy Journey
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-gray-400">Sessions</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">8h</p>
                <p className="text-sm text-gray-400">Total Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
