import React from 'react';
import { ChatSession } from '../../types/database';
import { MessageCircle, Clock, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  sessions: ChatSession[];
  loading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ sessions, loading }) => {
  const totalSessions = sessions.length;
  const totalMessages = sessions.reduce((sum, session) => sum + session.message_count, 0);
  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;

  const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

  const stats = [
    {
      title: 'Total Sessions',
      value: totalSessions,
      icon: MessageCircle,
      color: 'blue',
      description: 'Therapy sessions completed'
    },
    {
      title: 'Messages Exchanged',
      value: totalMessages,
      icon: Clock,
      color: 'green',
      description: 'Total conversations'
    },
    {
      title: 'This Week',
      value: thisWeekSessions,
      icon: TrendingUp,
      color: 'purple',
      description: 'Sessions this week'
    },
    {
      title: 'Avg. per Session',
      value: averageMessagesPerSession,
      icon: Calendar,
      color: 'orange',
      description: 'Messages per session'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600',
      green: 'from-green-500 to-green-600 text-green-600',
      purple: 'from-purple-500 to-purple-600 text-purple-600',
      orange: 'from-orange-500 to-orange-600 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Your Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(stat.color).split(' ')[0]} ${getColorClasses(stat.color).split(' ')[1]} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};