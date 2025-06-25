export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
          message_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          sender: 'user' | 'therapist';
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          sender: 'user' | 'therapist';
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          sender?: 'user' | 'therapist';
          created_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];