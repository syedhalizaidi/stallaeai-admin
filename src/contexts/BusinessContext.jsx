import React, { createContext, useContext, useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService';

const BusinessContext = createContext();

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const result = await restaurantService.getRestaurants();
      if (result.success) {
        setBusinesses(result.data);
        
        // Try to restore from localStorage
        const savedId = localStorage.getItem('businessId');
        let businessToSelect = null;

        if (savedId) {
          businessToSelect = result.data.find(biz => biz.id === savedId);
        }

        if (!businessToSelect && result.data.length > 0) {
          businessToSelect = result.data[0];
        }

        if (businessToSelect) {
          setSelectedBusiness(businessToSelect);
          localStorage.setItem('businessId', businessToSelect.id);
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const selectBusiness = (business) => {
    setSelectedBusiness(business);
    localStorage.setItem('businessId', business.id);
  };

  return (
    <BusinessContext.Provider value={{ 
      selectedBusiness, 
      selectBusiness, 
      businesses, 
      loading,
      refreshBusinesses: fetchBusinesses
    }}>
      {children}
    </BusinessContext.Provider>
  );
};
