import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { Homepage } from './components/Homepage';
import { Home } from 'lucide-react';

function App() {
  const { user, loading, signIn, signUp } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'homepage' | 'dashboard' | 'chat'>('homepage');

  const handleAuth = async (email: string, password: string, fullName?: string) => {
    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName!);
      }
      setCurrentView('dashboard');
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStartChat = () => {
    setCurrentView('chat');
  };

  const handleGoHome = () => {
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('homepage');
    }
  };

  const handleSignInFromHomepage = () => {
    setAuthMode('signin');
    setCurrentView('dashboard');
  };

  // Show loading spinner while checking auth state
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-slate-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show auth form if user is not authenticated and trying to access protected views
  if (!user && (currentView === 'dashboard' || currentView === 'chat')) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        loading={authLoading}
      />
    );
  }

  // Show homepage for non-authenticated users
  if (!user && currentView === 'homepage') {
    return <Homepage onStartChat={handleSignInFromHomepage} />;
  }

  // Show dashboard for authenticated users
  if (user && currentView === 'dashboard') {
    return <Dashboard onStartChat={handleStartChat} />;
  }

  // Show chat interface
  if (currentView === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Home Button */}
        <button
          onClick={handleGoHome}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Return to Dashboard"
        >
          <Home className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex h-screen">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatInterface />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to homepage
  return <Homepage onStartChat={handleSignInFromHomepage} />;
}

export default App;