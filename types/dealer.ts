// types/dealer.ts
export interface Dealer {
  id: string;
  dealer_name: string;
  contact_person: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  dealer_type: 'premium' | 'standard' | 'coming_soon';
  created_at: string;
}

export interface DealerFilter {
  type: 'all' | 'premium' | 'standard' | 'coming_soon';
  state: string | null;
  search: string;
}

export interface MapState {
  selectedDealer: string | null;
  hoveredDealer: string | null;
  viewMode: 'map' | 'list';
  zoom: number;
}
