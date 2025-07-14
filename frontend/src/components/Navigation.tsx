import React from 'react';
import { Brain, User, MessageCircle } from 'lucide-react';

interface NavigationProps {
  currentSection: 'home' | 'chat';
  setCurrentSection: (section: 'home' | 'chat') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export function Navigation({ currentSection, setCurrentSection, isLoggedIn, setIsLoggedIn }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentSection('home')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-medium text-lg">Clarity</div>
              <div className="text-gray-400 text-xs -mt-1 tracking-wider">AI • POWERED</div>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
            <button
              onClick={() => setCurrentSection('home')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currentSection === 'home'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentSection('chat')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currentSection === 'chat'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Chat
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-gray-300 hover:bg-white/20 hover:text-white transition-all"
          >
            <User className="w-4 h-4" />
            {isLoggedIn ? 'Profile' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
}