import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/admin/login', credentials);
      localStorage.setItem('admin_token', res.data.data.token);
      localStorage.setItem('admin_username', res.data.data.username);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!localStorage.getItem('admin_token');
  const username = localStorage.getItem('admin_username');

  return { login, logout, isAuthenticated, isLoading, error, username };
}
