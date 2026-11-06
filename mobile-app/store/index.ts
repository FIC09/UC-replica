// Client-side local demonstration store definitions for Phase 1 & 2
export interface LocalStoreState {
  cart: {
    serviceIds: string[];
    couponCode?: string;
  };
  filters: {
    selectedCategory?: string;
    sortBy?: 'rating' | 'price_low' | 'price_high';
  };
}

export const INITIAL_STORE_STATE: LocalStoreState = {
  cart: {
    serviceIds: ['srv-1'],
    couponCode: 'WELCOME100',
  },
  filters: {
    sortBy: 'rating',
  },
};

