import { supabase } from '../lib/supabase';

interface ChatMessage {
  content: string;
  session_id: string;
  context?: Record<string, any>;
}

interface ChatResponse {
  content: string;
  psychological_insight?: {
    pattern?: string;
    confidence: number;
    description: string;
    therapeutic_approach: string;
  };
  emotional_state?: string;
  topic_classification?: string;
  suggestions?: string[];
  session_id: string;
  timestamp: string;
  confidence_score: number;
}

interface ApiError {
  detail: string;
}

class ApiService {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.wsUrl = this.baseUrl.replace('http', 'ws');
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/session/${sessionId}/history`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('History fetch error:', error);
      return [];
    }
  }

  async getAvailableTopics(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      return data.topics || [];
    } catch (error) {
      console.error('Topics fetch error:', error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  createWebSocketConnection(sessionId: string): WebSocket {
    // Ensure /api/v1 is included in the WebSocket path to match backend route
    const ws = new WebSocket(`${this.wsUrl}/api/v1/ws/${sessionId}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return ws;
  }
}

export const apiService = new ApiService();
export type { ChatMessage, ChatResponse };