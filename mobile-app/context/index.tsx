import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Address } from '../types';
import { DEMO_USER, DEMO_ADDRESS } from '../data';

interface AppContextType {
  user: UserProfile;
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<UserProfile>(DEMO_USER);
  const [selectedAddress, setSelectedAddress] = useState<Address>(DEMO_ADDRESS);
  const [cartCount, setCartCount] = useState<number>(1);

  return (
    <AppContext.Provider
      value={{
        user,
        selectedAddress,
        setSelectedAddress,
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
