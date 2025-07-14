import { useState, useRef, useCallback, useEffect } from 'react';
import { apiService, ChatMessage, ChatResponse } from '../services/api';

interface Message extends ChatResponse {
  id: string;
  sender: 'user' | 'ai';
  reactions?: {
    helpful: number;
    insightful: number;
    supportive: number;
  };
  userReaction?: 'helpful' | 'insightful' | 'supportive' | null;
}

interface UseChatOptions {
  sessionId: string;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useChat({ sessionId, onError, onConnectionChange }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize connection and load history
  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const initializeChat = async () => {
    try {
      // Check backend health
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('Backend service is not available');
      }

      // Load session history
      const history = await apiService.getSessionHistory(sessionId);
      if (history.length > 0) {
        const formattedHistory = history.map((item, index) => ({
          id: `history-${index}`,
          content: item.ai_response || item.content,
          sender: 'ai' as const,
          timestamp: new Date(item.timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          session_id: sessionId,
          confidence_score: 0.8,
          reactions: { helpful: 0, insightful: 0, supportive: 0 }
        }));
        setMessages(formattedHistory);
        setMessageCount(history.length);
      }

      // Establish WebSocket connection
      connectWebSocket();
    } catch (error) {
      console.error('Chat initialization failed:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to initialize chat');
    }
  };

  const connectWebSocket = () => {
    try {
      wsRef.current = apiService.createWebSocketConnection(sessionId);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        onConnectionChange?.(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onConnectionChange?.(false);
        attemptReconnect();
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        onConnectionChange?.(false);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
      onConnectionChange?.(false);
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Reconnection attempt ${reconnectAttempts.current}`);
        connectWebSocket();
      }, delay);
    } else {
      onError?.('Connection lost. Please refresh the page.');
    }
  };

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'chat_response') {
      const aiResponse: Message = {
        ...data.data,
        id: Date.now().toString(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        reactions: { helpful: 0, insightful: 0, supportive: 0 }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      setMessageCount(prev => prev + 1);
    } else if (data.type === 'typing') {
      setIsTyping(data.isTyping);
    } else if (data.type === 'error') {
      onError?.(data.message);
      setIsTyping(false);
    }
  };

  const sendMessage = useCallback(async (content: string, context?: Record<string, any>) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      session_id: sessionId,
      confidence_score: 1.0
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Use WebSocket for real-time communication
        wsRef.current.send(JSON.stringify({
          content,
          context: context || {}
        }));
      } else {
        // Fallback to REST API
        const response = await apiService.sendMessage({
          content,
          session_id: sessionId,
          context: context || {}
        });

        const aiResponse: Message = {
          ...response,
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          reactions: { helpful: 0, insightful: 0, supportive: 0 }
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        setMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to send message');
      setIsTyping(false);
    }
  }, [sessionId, onError]);

  const addReaction = useCallback((messageId: string, reactionType: 'helpful' | 'insightful' | 'supportive') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.reactions) {
        const newReactions = { ...msg.reactions };
        
        // Remove previous reaction if exists
        if (msg.userReaction) {
          newReactions[msg.userReaction]--;
        }
        
        // Add new reaction
        if (msg.userReaction !== reactionType) {
          newReactions[reactionType]++;
          return { ...msg, reactions: newReactions, userReaction: reactionType };
        } else {
          return { ...msg, reactions: newReactions, userReaction: null };
        }
      }
      return msg;
    }));
  }, []);

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  return {
    messages,
    isTyping,
    isConnected,
    messageCount,
    sendMessage,
    addReaction
  };
}