// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language: 'es' | 'en';
  companyId?: string;
  currentFacilityId?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export type UserRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'operator'
  | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// Company Types
export interface Company {
  _id: string;
  name: string;
  businessType: BusinessType;
  industry: Industry;
  departmentCode: string;
  municipalityCode: string;
  timezone: string;
  plan: CompanyPlan;
  maxFacilities: number;
  maxUsers: number;
  trialEndsAt?: number;
  status: CompanyStatus;
  createdAt: number;
  updatedAt: number;
}

export type BusinessType = 'SAS' | 'SA' | 'LTDA' | 'EU' | 'PersonaNatural';

export type Industry = 'Cannabis' | 'Cafe' | 'Cacao' | 'Flores' | 'Mixto';

export type CompanyPlan = 'trial' | 'starter' | 'pro' | 'enterprise';

export type CompanyStatus = 'active' | 'inactive' | 'suspended';

// Facility Types
export interface Facility {
  _id: string;
  companyId: string;
  name: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licensedArea: number;
  primaryCrops: Industry[];
  departmentCode: string;
  municipalityCode: string;
  address: string;
  latitude: number;
  longitude: number;
  climateZone: ClimateZone;
  status: FacilityStatus;
  createdAt: number;
  updatedAt: number;
}

export type LicenseType =
  | 'CultivoComercial'
  | 'Investigacion'
  | 'Procesamiento'
  | 'Otro';

export type ClimateZone = 'Tropical' | 'Subtropical' | 'Templado';

export type FacilityStatus = 'active' | 'inactive';

// Invitation Types
export interface Invitation {
  _id: string;
  companyId: string;
  email: string;
  role: UserRole;
  facilityIds: string[];
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: number;
  createdAt: number;
  acceptedAt?: number;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Geographic Types
export interface Department {
  code: string;
  name: string;
}

export interface Municipality {
  code: string;
  name: string;
  departmentCode: string;
  timezone: string;
}

// Auth Types
export interface AuthToken {
  token: string;
  userId: string;
  companyId?: string;
  expiresAt: number;
}

export interface Session {
  user: User;
  token: string;
  company?: Company;
  currentFacility?: Facility;
}

// Form State Types
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  termsAccepted: boolean;
}

export interface EmailVerificationFormData {
  code: string;
}

export interface CompanySetupFormData {
  name: string;
  businessType: BusinessType;
  industry: Industry;
  departmentCode: string;
  municipalityCode: string;
}

export interface FacilityBasicInfoFormData {
  name: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licensedArea: number;
  primaryCrops: Industry[];
}

export interface FacilityLocationFormData {
  departmentCode: string;
  municipalityCode: string;
  address: string;
  latitude: number;
  longitude: number;
  climateZone: ClimateZone;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface InvitationAcceptFormData {
  password: string;
  confirmPassword: string;
  phone?: string;
  language: 'es' | 'en';
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
