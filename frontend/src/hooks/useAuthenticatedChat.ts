import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useAuthenticatedChat() {
  const { user, session } = useAuth();
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.access_token) {
      setAuthHeaders({
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      });
    } else {
      setAuthHeaders({
        'Content-Type': 'application/json',
      });
    }
  }, [session]);

  const createAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  };

  return {
    user,
    session,
    authHeaders,
    createAuthenticatedRequest,
    isAuthenticated: !!user,
  };
}
