export type TreatmentType = 'PPF' | 'SUNFILM' | 'GRAPHENE_COATING' | 'MULTIPLE';
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
export type PartnershipStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface CustomerEnquiry {
  id?: string;
  customer_name: string;
  mobile_number: string;
  city_name: string;
  vehicle_name_model: string;
  treatment_type: TreatmentType;
  status?: EnquiryStatus;
  source?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DealerEnquiry {
  id?: string;
  dealer_name: string;
  mobile_number: string;
  studio_name: string;
  products_interested: string[];
  city: string;
  state: string;
  investment_capacity?: string;
  existing_business?: boolean;
  status?: PartnershipStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DistributorEnquiry {
  id?: string;
  distributor_name: string;
  mobile_number: string;
  firm_name: string;
  products_interested: string[];
  city: string;
  state: string;
  gst_number?: string;
  current_distribution_network?: string;
  status?: PartnershipStatus;
  created_at?: string;
  updated_at?: string;
}

export type FormTheme = 'purple' | 'orange' | 'green' | 'blue';

export interface FormThemeConfig {
  primary: string;
  primaryLight: string;
  gradient: string;
  glow: string;
  borderFocus: string;
  ringFocus: string;
  icon: string;
}