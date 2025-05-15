
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'customer';
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'seller' | 'customer') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Demo Seller',
    email: 'seller@example.com',
    role: 'seller'
  },
  {
    id: '2',
    name: 'Demo Customer',
    email: 'customer@example.com',
    role: 'customer'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (in a real app, you'd validate the password too)
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // After successful login, navigate based on role
      if (user.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, password: string, role: 'seller' | 'customer'): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already in use');
      }
      
      // Create new user (in a real app, you'd store this in a database)
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        role
      };
      
      // Add to mock users list (for demo purposes)
      MOCK_USERS.push(newUser);
      
      // Store user in state and localStorage
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // After successful signup, navigate based on role
      if (newUser.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
