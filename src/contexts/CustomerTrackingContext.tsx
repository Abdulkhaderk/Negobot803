
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CustomerActivity {
  id: string;
  timestamp: Date;
  type: 'visit' | 'product_view' | 'negotiation_start' | 'price_offer' | 'deal_success' | 'cart_add';
  productId?: string;
  productName?: string;
  details?: string;
  userId?: string;
  userName?: string;
  offerAmount?: number;
  finalPrice?: number;
}

interface CustomerData {
  sessionId: string;
  startTime: Date;
  currentPage: string;
  activities: CustomerActivity[];
  isActive: boolean;
  userAgent: string;
  location?: string;
}

interface CustomerTrackingContextType {
  customers: CustomerData[];
  currentSession: CustomerData | null;
  trackActivity: (activity: Omit<CustomerActivity, 'id' | 'timestamp'>) => void;
  updateCurrentPage: (page: string) => void;
  getAllActivities: () => CustomerActivity[];
  getProductAnalytics: () => { [productId: string]: { views: number; negotiations: number; deals: number } };
}

const CustomerTrackingContext = createContext<CustomerTrackingContextType | undefined>(undefined);

export const CustomerTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [currentSession, setCurrentSession] = useState<CustomerData | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newSession: CustomerData = {
      sessionId,
      startTime: new Date(),
      currentPage: '/',
      activities: [],
      isActive: true,
      userAgent: navigator.userAgent,
      location: 'Unknown' // In a real app, you'd get this from IP geolocation
    };

    setCurrentSession(newSession);
    setCustomers(prev => [...prev, newSession]);

    // Track initial visit
    trackActivity({
      type: 'visit',
      details: 'User visited the website'
    });

    // Set up activity tracking
    const handleBeforeUnload = () => {
      // Mark session as inactive when user leaves
      setCustomers(prev => 
        prev.map(customer => 
          customer.sessionId === sessionId 
            ? { ...customer, isActive: false }
            : customer
        )
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const trackActivity = (activity: Omit<CustomerActivity, 'id' | 'timestamp'>) => {
    if (!currentSession) return;

    const newActivity: CustomerActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date()
    };

    // Update current session
    const updatedSession = {
      ...currentSession,
      activities: [...currentSession.activities, newActivity]
    };

    setCurrentSession(updatedSession);

    // Update customers list
    setCustomers(prev => 
      prev.map(customer => 
        customer.sessionId === currentSession.sessionId 
          ? updatedSession
          : customer
      )
    );

    // Log for seller dashboard (in real app, this would be sent to backend)
    console.log('Customer Activity:', newActivity);
  };

  const updateCurrentPage = (page: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      currentPage: page
    };

    setCurrentSession(updatedSession);
    setCustomers(prev => 
      prev.map(customer => 
        customer.sessionId === currentSession.sessionId 
          ? updatedSession
          : customer
      )
    );

    // Track page view
    trackActivity({
      type: 'visit',
      details: `Navigated to ${page}`
    });
  };

  const getAllActivities = (): CustomerActivity[] => {
    return customers.flatMap(customer => customer.activities)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getProductAnalytics = () => {
    const analytics: { [productId: string]: { views: number; negotiations: number; deals: number } } = {};
    
    customers.forEach(customer => {
      customer.activities.forEach(activity => {
        if (activity.productId) {
          if (!analytics[activity.productId]) {
            analytics[activity.productId] = { views: 0, negotiations: 0, deals: 0 };
          }
          
          switch (activity.type) {
            case 'product_view':
              analytics[activity.productId].views++;
              break;
            case 'negotiation_start':
              analytics[activity.productId].negotiations++;
              break;
            case 'deal_success':
              analytics[activity.productId].deals++;
              break;
          }
        }
      });
    });
    
    return analytics;
  };

  return (
    <CustomerTrackingContext.Provider value={{
      customers,
      currentSession,
      trackActivity,
      updateCurrentPage,
      getAllActivities,
      getProductAnalytics
    }}>
      {children}
    </CustomerTrackingContext.Provider>
  );
};

export const useCustomerTracking = () => {
  const context = useContext(CustomerTrackingContext);
  if (context === undefined) {
    throw new Error('useCustomerTracking must be used within a CustomerTrackingProvider');
  }
  return context;
};
