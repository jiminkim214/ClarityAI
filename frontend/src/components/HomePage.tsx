import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './Navigation';
import { MessageCircle, Brain, Shield, Zap, ArrowRight, Sparkles, Star, Orbit, Layers } from 'lucide-react';

interface HomePageProps {
  currentSection: 'home' | 'chat';
  setCurrentSection: (section: 'home' | 'chat') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export function HomePage({ currentSection, setCurrentSection, isLoggedIn, setIsLoggedIn }: HomePageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Psychological Intelligence',
      description: 'Advanced pattern recognition and personalized therapeutic insights',
      color: 'from-purple-500 to-pink-500',
      delay: '0ms'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'End-to-end encryption ensures complete confidentiality',
      color: 'from-blue-500 to-cyan-500',
      delay: '200ms'
    },
    {
      icon: Zap,
      title: 'Always Available',
      description: 'Get support whenever you need it, day or night',
      color: 'from-green-500 to-emerald-500',
      delay: '400ms'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-indigo-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        {/* Parallax Elements */}
        <div 
          className="absolute inset-0 transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-400/40 rounded-full"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <Navigation 
          currentSection={currentSection} 
          setCurrentSection={setCurrentSection}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
        
        <main className="container mx-auto px-6 pt-32 pb-20">
          {/* Hero Section */}
          <div 
            ref={heroRef}
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 text-gray-300 text-sm mb-12 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
              </div>
              Smarter Decisions, Every Day
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Main Heading with 3D Effect */}
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-light text-white mb-8 leading-tight tracking-tight transform-gpu">
                <span className="inline-block hover:scale-105 transition-transform duration-300">Meet</span>{' '}
                <span className="inline-block hover:scale-105 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>Your</span>{' '}
                <span className="inline-block hover:scale-105 transition-transform duration-300" style={{ transitionDelay: '200ms' }}>AI-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent font-normal inline-block hover:scale-105 transition-transform duration-300 relative" style={{ transitionDelay: '300ms' }}>
                  Therapy Assistant
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 via-pink-300/20 to-blue-300/20 blur-xl -z-10"></div>
                </span>
              </h1>
              
              {/* 3D Shadow Effect */}
              <div className="absolute inset-0 text-6xl md:text-8xl font-light leading-tight tracking-tight text-purple-900/20 transform translate-x-2 translate-y-2 -z-10">
                Meet Your AI-Powered
                <br />
                Therapy Assistant
              </div>
            </div>
            
            <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed font-light transform transition-all duration-700 delay-300">
              Smart, personalized therapeutic guidance for your mental health, emotional well-being, 
              and personal growth—right when you need it.
            </p>
            
            {/* 3D CTA Button */}
            <div className="relative inline-block group">
              <button
                onClick={() => setCurrentSection('chat')}
                className="relative px-12 py-5 bg-white text-gray-900 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto text-lg overflow-hidden"
              >
                {/* Button Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-300"></div>
                
                {/* Button Content */}
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Your Journey</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
                
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              </button>
              
              {/* 3D Button Shadow */}
              <div className="absolute inset-0 bg-gray-800/30 rounded-full transform translate-y-2 translate-x-1 -z-10 group-hover:translate-y-3 group-hover:translate-x-2 transition-transform duration-300"></div>
            </div>
          </div>
          
          {/* Interactive Chat Preview */}
          <div className={`max-w-4xl mx-auto mb-20 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-50 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Clarity AI</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-gray-400 text-sm">Online & Learning</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-green-300 text-xs">Active</span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages with Animations */}
                <div className="p-6 space-y-6 min-h-[400px] relative">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSIjZmZmZmZmIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdHMpIi8+PC9zdmc+')]"></div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end animate-slide-in-right">
                    <div className="max-w-md transform transition-all duration-300 hover:scale-105">
                      <div className="bg-white text-gray-900 p-4 rounded-2xl rounded-tr-md shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                        <p className="text-sm relative z-10">I've been feeling overwhelmed lately. How can I better organize my week?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">16:46</p>
                    </div>
                  </div>

                  {/* AI Response with Enhanced Effects */}
                  <div className="flex justify-start animate-slide-in-left">
                    <div className="max-w-md transform transition-all duration-300 hover:scale-105">
                      <div className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-2xl rounded-tl-md border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <p className="text-sm leading-relaxed mb-3 relative z-10">
                          Let's simplify things. I'll create a personalized weekly plan with balanced work, rest, and focus time. 
                          Would you like to include daily goals or just priorities?
                        </p>
                        
                        {/* Enhanced Insights */}
                        <div className="mt-3 pt-3 border-t border-white/20 relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="relative">
                              <Brain className="w-4 h-4 text-purple-300" />
                              <div className="absolute inset-0 bg-purple-300/30 rounded-full blur-sm animate-pulse"></div>
                            </div>
                            <span className="text-xs font-medium text-purple-300">AI Insight</span>
                            <div className="ml-auto flex items-center gap-1">
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-300">95% confidence</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300">
                            Recognizing overwhelm patterns and offering structured support
                          </p>
                        </div>

                        {/* Animated Tags */}
                        <div className="mt-3 flex gap-2 relative z-10">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200">
                            overwhelmed
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 hover:bg-green-500/30 transition-colors duration-200">
                            organization
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">16:46</p>
                    </div>
                  </div>

                  {/* User Response */}
                  <div className="flex justify-end animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
                    <div className="max-w-md transform transition-all duration-300 hover:scale-105">
                      <div className="bg-white text-gray-900 p-4 rounded-2xl rounded-tr-md shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
                        <p className="text-sm relative z-10">Daily goals sound good.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">16:46</p>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-2xl rounded-tl-md border border-white/20 max-w-md">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
                        <span className="text-xs text-purple-300">Crafting your personalized plan...</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Chat Input */}
                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        placeholder="Write Your Request Here"
                        className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                        disabled
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <button className="p-4 bg-white rounded-2xl text-gray-900 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl group">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Features Grid */}
          <div 
            ref={featuresRef}
            className={`grid md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group transform transition-all duration-500 hover:scale-105 hover:-translate-y-4"
                style={{ animationDelay: feature.delay }}
              >
                <div className="relative mb-6 mx-auto w-20 h-20">
                  {/* 3D Card Effect */}
                  <div className="absolute inset-0 bg-gray-800/50 rounded-2xl transform translate-y-2 translate-x-2 group-hover:translate-y-4 group-hover:translate-x-4 transition-transform duration-300"></div>
                  
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-300 shadow-xl`}>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                    
                    <feature.icon className="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Floating Particles */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Section */}
          <div className={`text-center transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-2xl mx-auto">
                <h2 className="text-4xl font-light text-white mb-6">
                  Ready to start your{' '}
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    journey?
                  </span>
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Experience personalized therapy assistance designed to support your mental wellness and personal growth.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setCurrentSection('chat')}
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                    <span className="relative z-10">Try Clarity AI</span>
                  </button>
                  
                  <button className="px-8 py-4 border border-white/20 rounded-full text-white font-medium hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}