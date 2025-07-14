import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Lock, MessageCircle, Brain, AlertCircle, Mic, MicOff, Settings, MoreVertical, Copy, ThumbsUp, ThumbsDown, Bookmark, Share, Zap, Heart, Star } from 'lucide-react';
import { useChat } from '../hooks/useChat';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  psychological_insight?: {
    pattern?: string;
    confidence: number;
    description: string;
    therapeutic_approach: string;
  };
  emotional_state?: string;
  topic_classification?: string;
  suggestions?: string[];
  confidence_score?: number;
  reactions?: {
    helpful: number;
    insightful: number;
    supportive: number;
  };
  userReaction?: 'helpful' | 'insightful' | 'supportive' | null;
}

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [aiPersonality, setAiPersonality] = useState('empathetic');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // New state for slider interactions
  const [isTypingSpeedActive, setIsTypingSpeedActive] = useState(false);
  const [typingSpeedTimeout, setTypingSpeedTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the custom chat hook
  const { 
    messages, 
    isTyping, 
    isConnected, 
    messageCount, 
    sendMessage, 
    addReaction 
  } = useChat({
    sessionId,
    onError: (error) => setConnectionError(error),
    onConnectionChange: (connected) => {
      if (connected) {
        setConnectionError(null);
      }
    }
  });

  const quickReplies = [
    "I'm feeling anxious today",
    "Help me organize my thoughts", 
    "I need someone to talk to",
    "How can I manage stress?",
    "I'm struggling with motivation"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingSpeedTimeout) {
        clearTimeout(typingSpeedTimeout);
      }
    };
  }, [typingSpeedTimeout]);

  // Handle typing speed slider interaction
  const handleTypingSpeedChange = (value: number) => {
    setTypingSpeed(value);
    setIsTypingSpeedActive(true);
    
    // Clear existing timeout
    if (typingSpeedTimeout) {
      clearTimeout(typingSpeedTimeout);
    }
    
    // Set new timeout to hide slider after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsTypingSpeedActive(false);
    }, 2000);
    
    setTypingSpeedTimeout(timeout);
  };

  // Show slider when user starts interacting
  const handleTypingSpeedFocus = () => {
    setIsTypingSpeedActive(true);
    if (typingSpeedTimeout) {
      clearTimeout(typingSpeedTimeout);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    setInputMessage('');
    
    // Send message with context
    await sendMessage(textToSend, {
      personality: aiPersonality,
      typing_speed: typingSpeed,
      session_duration: sessionDuration
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSessionDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">Clarity AI</h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-400">{isConnected ? 'Online' : 'Reconnecting...'}</span>
              </div>
              {messageCount > 0 && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{formatSessionDuration(sessionDuration)}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{messageCount} messages</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'hover:bg-white/10 text-gray-400'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <Volume2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3">
          <div className="flex items-center gap-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      {/* Settings Panel with Conditional Slider Visibility */}
      {showSettings && (
        <div className="absolute top-20 right-6 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-50 w-80 shadow-2xl">
          <h4 className="text-white font-medium mb-4">Chat Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm block mb-2">AI Response Speed</label>
              
              {/* Slider container with conditional visibility */}
              <div className="relative">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={typingSpeed}
                  onChange={(e) => handleTypingSpeedChange(Number(e.target.value))}
                  onFocus={handleTypingSpeedFocus}
                  onMouseDown={handleTypingSpeedFocus}
                  className={`w-full accent-purple-500 transition-opacity duration-300 ${
                    isTypingSpeedActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                
                {/* Visual indicator when slider is hidden */}
                {!isTypingSpeedActive && (
                  <div 
                    className="absolute inset-0 flex items-center cursor-pointer"
                    onClick={handleTypingSpeedFocus}
                  >
                    <div className="w-full h-2 bg-white/10 rounded-full relative">
                      <div 
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${((typingSpeed - 20) / 80) * 100}%` }}
                      ></div>
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500"
                        style={{ left: `calc(${((typingSpeed - 20) / 80) * 100}% - 8px)` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Labels with conditional visibility */}
              <div className={`flex justify-between text-xs text-gray-400 mt-1 transition-opacity duration-300 ${
                isTypingSpeedActive ? 'opacity-100' : 'opacity-60'
              }`}>
                <span>Fast</span>
                <span className="text-purple-300 font-medium">
                  {typingSpeed < 40 ? 'Fast' : typingSpeed < 70 ? 'Balanced' : 'Thoughtful'}
                </span>
                <span>Thoughtful</span>
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm block mb-2">AI Personality</label>
              <select
                value={aiPersonality}
                onChange={(e) => setAiPersonality(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="empathetic">Empathetic</option>
                <option value="analytical">Analytical</option>
                <option value="supportive">Supportive</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Quick Replies</span>
              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  showQuickReplies ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  showQuickReplies ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-6 space-y-6 relative">
        {/* Welcome Message for Empty Chat */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-medium text-white">Welcome to Clarity AI</h3>
              <p className="text-gray-400 max-w-md leading-relaxed">
                I'm here to provide psychologically-informed support using advanced reasoning and therapeutic insights. 
                Share what's on your mind - this is a safe, confidential space.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">🔒 Private</span>
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">🧠 RAG-Powered</span>
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">💝 Therapeutic</span>
            </div>
          </div>
        )}

        {/* Floating session stats - only show when there are messages */}
        {messages.length > 0 && (
          <div className="sticky top-0 z-10 flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-xs text-gray-300">
              Psychological insights: {messages.filter(m => m.psychological_insight).length} • 
              Session: {Math.floor(sessionDuration / 60)} min • 
              Connection: {isConnected ? 'Secure' : 'Reconnecting'}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'} relative`}>
              {/* Message bubble */}
              <div
                className={`p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  message.sender === 'user'
                    ? 'bg-white text-gray-900 rounded-tr-md shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-tl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* AI Response Enhancements */}
                {message.sender === 'ai' && (
                  <>
                    {/* Psychological Insight */}
                    {message.psychological_insight && (
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-300" />
                          <span className="text-xs font-medium text-purple-300">Psychological Insight</span>
                          <div className="ml-auto flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-yellow-300">{Math.round(message.psychological_insight.confidence * 100)}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-1">
                          <strong>Pattern:</strong> {message.psychological_insight.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          <strong>Approach:</strong> {message.psychological_insight.therapeutic_approach}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {(message.emotional_state || message.topic_classification) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.emotional_state && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                            {message.emotional_state}
                          </span>
                        )}
                        {message.topic_classification && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            {message.topic_classification}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs font-medium text-yellow-300">Therapeutic Suggestions</span>
                        </div>
                        <div className="space-y-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(suggestion)}
                              className="block w-full text-left text-xs text-gray-300 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence Score */}
                    {message.confidence_score && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Confidence:</span>
                        <div className="flex-1 bg-white/20 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${message.confidence_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round(message.confidence_score * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Reaction Buttons */}
                    {message.reactions && (
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">Was this helpful?</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addReaction(message.id, 'helpful')}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                message.userReaction === 'helpful'
                                  ? 'bg-green-500/30 text-green-300'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {message.reactions.helpful}
                            </button>
                            <button
                              onClick={() => addReaction(message.id, 'insightful')}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                message.userReaction === 'insightful'
                                  ? 'bg-purple-500/30 text-purple-300'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <Star className="w-3 h-3" />
                              {message.reactions.insightful}
                            </button>
                            <button
                              onClick={() => addReaction(message.id, 'supportive')}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                message.userReaction === 'supportive'
                                  ? 'bg-pink-500/30 text-pink-300'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <Heart className="w-3 h-3" />
                              {message.reactions.supportive}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Message actions */}
              <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
                <button
                  onClick={() => copyMessage(message.content)}
                  className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-gray-300 transition-colors">
                  <Bookmark className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-gray-300 transition-colors">
                  <Share className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 p-4 rounded-2xl rounded-tl-md max-w-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="w-5 h-5 text-purple-300 animate-pulse" />
                  <div className="absolute inset-0 bg-purple-300/30 rounded-full blur-sm animate-ping"></div>
                </div>
                <div>
                  <div className="text-xs text-purple-300 font-medium">Clarity is analyzing...</div>
                  <div className="text-xs text-gray-400">Processing psychological patterns & retrieving insights</div>
                </div>
              </div>
              <div className="flex space-x-1 mt-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies - Clean Grid Layout */}
      {showQuickReplies && messages.length === 0 && (
        <div className="px-6 py-4 border-t border-white/10">
          <div className="text-center mb-4">
            <span className="text-xs text-gray-400">Quick start suggestions:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all hover:scale-105 text-left"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Chat Input */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-r from-transparent to-white/5">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "🎤 Recording..." : messages.length === 0 ? "Share what's on your mind..." : "Continue the conversation..."}
              className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all pr-12"
              disabled={isTyping || isRecording || !isConnected}
            />
            
            {/* Character count */}
            <div className="absolute bottom-1 right-3 text-xs text-gray-500">
              {inputMessage.length}/500
            </div>
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !inputMessage.trim() || !isConnected}
            className="p-4 bg-white rounded-2xl text-gray-900 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🔒 End-to-end encrypted</span>
            <span>•</span>
            <span>🧠 RAG-powered insights</span>
            <span>•</span>
            <span>💝 Therapeutic reasoning</span>
          </div>
          
          {!isConnected && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Reconnecting...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}