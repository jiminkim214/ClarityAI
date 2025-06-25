import React from 'react';
import { ChatSession } from '../../types/database';
import { MessageCircle, Clock, ArrowRight } from 'lucide-react';

interface RecentSessionsProps {
  sessions: ChatSession[];
  loading: boolean;
  onStartChat: () => void;
  showAll?: boolean;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ 
  sessions, 
  loading, 
  onStartChat,
  showAll = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getSessionTitle = (session: ChatSession) => {
    return session.title || `Session ${session.id.slice(-6)}`;
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          {showAll ? 'All Sessions' : 'Recent Sessions'}
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          {showAll ? 'All Sessions' : 'Recent Sessions'}
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No sessions yet</h3>
          <p className="text-slate-600 mb-6">Start your first therapy session to begin your journey.</p>
          <button
            onClick={onStartChat}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Start Your First Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          {showAll ? 'All Sessions' : 'Recent Sessions'}
        </h2>
        {!showAll && sessions.length > 5 && (
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all sessions
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {sessions.map((session) => (
          <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{getSessionTitle(session)}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(session.updated_at)}</span>
                    </div>
                    <span>{session.message_count} messages</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onStartChat}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span className="text-sm font-medium">Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};