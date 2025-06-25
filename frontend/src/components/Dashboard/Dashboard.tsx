import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { RecentSessions } from './RecentSessions';
import { ProfileSettings } from './ProfileSettings';
import { ChatSession } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { MessageCircle, BarChart3, Settings, Plus } from 'lucide-react';

interface DashboardProps {
  onStartChat: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartChat }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'settings'>('overview');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sessions', label: 'Sessions', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <p className="text-slate-600">
            Continue your mental health journey with personalized AI support.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button
            onClick={onStartChat}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Start New Session</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <DashboardStats sessions={sessions} loading={loading} />
              <RecentSessions sessions={sessions.slice(0, 5)} loading={loading} onStartChat={onStartChat} />
            </>
          )}

          {activeTab === 'sessions' && (
            <RecentSessions sessions={sessions} loading={loading} onStartChat={onStartChat} showAll />
          )}

          {activeTab === 'settings' && (
            <ProfileSettings />
          )}
        </div>
      </div>
    </div>
  );
};