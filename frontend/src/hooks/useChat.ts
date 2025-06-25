import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession } from '../types/chat';
import { generateTherapistResponse } from '../utils/therapistResponses';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('therapy-session');
    if (savedSession) {
      const session: ChatSession = JSON.parse(savedSession);
      
      // Convert timestamp strings back to Date objects
      const messagesWithDates = session.messages.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));
      
      const sessionWithDates = {
        ...session,
        messages: messagesWithDates,
        startTime: new Date(session.startTime),
        lastActivity: new Date(session.lastActivity)
      };
      
      setCurrentSession(sessionWithDates);
      setMessages(messagesWithDates);
    } else {
      // Create initial session with welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! I'm here to provide a supportive space for you to explore your thoughts and feelings. What's on your mind today?",
        sender: 'therapist',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      
      const newSession: ChatSession = {
        id: Date.now().toString(),
        messages: [welcomeMessage],
        startTime: new Date(),
        lastActivity: new Date(),
      };
      setCurrentSession(newSession);
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (currentSession && messages.length > 0) {
      const updatedSession: ChatSession = {
        ...currentSession,
        messages,
        lastActivity: new Date(),
      };
      setCurrentSession(updatedSession);
      localStorage.setItem('therapy-session', JSON.stringify(updatedSession));
    }
  }, [messages, currentSession]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate therapist response delay
    setTimeout(async () => {
      const therapistResponse = await generateTherapistResponse(content, messages);
      const therapistMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: therapistResponse,
        sender: 'therapist',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, therapistMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000); // 1.5-3.5 second delay
  }, [messages]);

  const clearSession = useCallback(() => {
    localStorage.removeItem('therapy-session');
    setMessages([]);
    setCurrentSession(null);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearSession,
    currentSession,
  };
};