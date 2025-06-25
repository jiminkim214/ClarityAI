export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  startTime: Date;
  lastActivity: Date;
}

export interface TherapistProfile {
  name: string;
  title: string;
  specialization: string;
  avatar: string;
}