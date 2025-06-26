import React, { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Create API instance with base URL
export const API = axios.create({
  baseURL: 'http://localhost:8080/api/v2/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API_SUPPLY_API = axios.create({
  baseURL: 'http://localhost:8081/api/v2/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: any; // For other properties that might exist
}

// Auth context interface
export interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<{ encryptedToken?: string; username?: string; role?: string; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

// Create context with default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if the user is authenticated
  const isAuthenticated = !!token;

  // Parse user roles from the stored user object
  const userRoles = user?.role ? [user.role] : [];

  // Function to check if the current user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  // Function to check if the current user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }, [user]);

  // Handle login
  // Handle login
const login = useCallback(async (
  username: string,
  password: string
): Promise<{ encryptedToken?: string; username?: string; role?: string; error?: string }> => {
  setLoading(true);
  setAuthError(null);

  try {
    const response = await API.post('auth/login', { username, password });

    const { encryptedToken, username: name, role } = response.data;

    if (encryptedToken && name && role) {
      const user: User = {
        id: '', // ID não está vindo da resposta, pode deixar em branco ou ajustar depois
        username: name,
        email: '', // idem
        role: role,
        name: name,
      };

      // Salvar no localStorage
      localStorage.setItem('token', encryptedToken);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(encryptedToken);
      setUser(user);

      return { encryptedToken, username: name, role };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage =
      axiosError.response?.data?.message || axiosError.message || 'Login failed';
    setAuthError(errorMessage);
    toast.error(errorMessage);
    return { error: errorMessage };
  } finally {
    setLoading(false);
  }
}, []);



  // Handle logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out');
  }, []);

  // Function to request password reset
  const requestPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await API.post('auth/forgot-password', null, {
        params: { email }
      });
      toast.success('Password reset email sent successfully');
      return { success: true, message: response.data?.message };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to send reset email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Function to reset password with token
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await API.post('auth/reset-password/${token}', newPassword, {
        params: { token }
      });
      toast.success('Password reset successfully');
      return { success: true, message: response.data?.message };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to reset password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Set up axios interceptors for token handling
  useEffect(() => {
    if (!token) return; // Só configura interceptors se o token existir

    const requestInterceptor = API.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
        }
        if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action');
        }
        return Promise.reject(error);
      }
    );

    setLoading(false); // move para cá

    return () => {
      API.interceptors.request.eject(requestInterceptor);
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout]);


  // Context value to be provided
  const contextValue: AuthContextType = {
    token,
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    authError,
    userRoles,
    hasRole,
    hasAnyRole,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

