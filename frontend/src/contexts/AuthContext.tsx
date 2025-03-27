import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Создаем типы для аутентификации
interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер контекста
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Здесь в будущем можно добавить проверку токена через API
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to authenticate', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Функция для входа
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.auth.login(email, password);
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      setError('Неверный email или пароль');
      throw error;
    }
  };

  // Функция для регистрации
  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.auth.register(email, password);
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      setError('Ошибка при регистрации');
      throw error;
    }
  };

  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Хук для использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 