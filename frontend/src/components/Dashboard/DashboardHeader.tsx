import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MessageCircle, LogOut, User } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ClarityAI</h1>
              <p className="text-xs text-slate-600">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-600">Premium Member</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};