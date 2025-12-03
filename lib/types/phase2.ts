/**
 * Phase 2 TypeScript Types
 *
 * Complete type definitions for Phase 2 features:
 * - Areas management
 * - Cultivars management
 * - Suppliers management
 * - Inventory management
 * - User invitations
 * - Dashboard metrics
 *
 * These types match the Convex schema definitions in convex/schema.ts
 */

import { Id } from '@/convex/_generated/dataModel';

// ============================================================================
// AREA TYPES
// ============================================================================

export type AreaType =
  | 'propagation'
  | 'vegetative'
  | 'flowering'
  | 'drying'
  | 'curing'
  | 'storage'
  | 'processing'
  | 'quarantine';

export type AreaStatus = 'active' | 'maintenance' | 'inactive';

export interface EnvironmentalSpecs {
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  light_hours?: number;
  ph_min?: number;
  ph_max?: number;
}

export interface CapacityConfiguration {
  [key: string]: number; // Flexible capacity by crop type or unit
}

export interface Area {
  _id: Id<'areas'>;
  facility_id: Id<'facilities'>;
  name: string;
  area_type: AreaType;
  compatible_crop_type_ids: Id<'crop_types'>[];
  current_crop_type_id?: Id<'crop_types'>;

  // Dimensions
  length_meters?: number;
  width_meters?: number;
  height_meters?: number;
  total_area_m2?: number;
  usable_area_m2?: number;

  // Capacity
  capacity_configurations?: CapacityConfiguration;
  current_occupancy: number;
  reserved_capacity: number;

  // Technical Features
  climate_controlled: boolean;
  lighting_controlled: boolean;
  irrigation_system: boolean;
  environmental_specs?: EnvironmentalSpecs;
  equipment_list: any[];

  // Metadata
  status: AreaStatus;
  notes?: string;
  created_at: number;
  updated_at: number;
}

// ============================================================================
// CULTIVAR TYPES
// ============================================================================

export type CultivarType = 'system' | 'custom';

// Cannabis variety types
export type VarietyType = 'indica' | 'sativa' | 'hybrid' | 'ruderalis';

// Coffee variety types
export type CoffeeVarietyType = 'arabica' | 'robusta' | 'liberica';

export type CultivarStatus = 'active' | 'discontinued';

export interface GeneticLineage {
  mother?: string;
  father?: string;
  generation?: number;
}

export interface CultivarCharacteristics {
  // Cannabis specific
  thc_min?: number;
  thc_max?: number;
  cbd_min?: number;
  cbd_max?: number;
  terpene_profile?: string[];

  // General characteristics
  flowering_time_days?: number;
  yield_per_plant_g?: number;
  height_cm?: number;
  growth_difficulty?: 'easy' | 'medium' | 'difficult';

  // Sensory
  aroma?: string;
  flavor?: string;
  effects?: string[];
}

export interface OptimalConditions {
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  ph_min?: number;
  ph_max?: number;
  light_type?: string;
  light_hours?: number;
}

export interface PerformanceMetrics {
  average_yield?: number;
  success_rate?: number;
  total_batches?: number;
  quality_rating?: number;
}

export interface OriginMetadata {
  breeder?: string;
  origin_country?: string;
  year_developed?: number;
  awards?: string[];
}

export interface Cultivar {
  _id: Id<'cultivars'>;
  name: string;
  crop_type_id: Id<'crop_types'>;
  variety_type?: string; // VarietyType for cannabis, CoffeeVarietyType for coffee
  genetic_lineage?: string;
  supplier_id?: Id<'suppliers'>;
  origin_metadata?: OriginMetadata;
  characteristics?: CultivarCharacteristics;
  optimal_conditions?: OptimalConditions;
  performance_metrics: PerformanceMetrics;
  status: CultivarStatus;
  notes?: string;
  created_at: number;
}

// ============================================================================
// SUPPLIER TYPES
// ============================================================================

export type SupplierBusinessType = 'S.A.S' | 'S.A.' | 'Ltda' | 'E.U.' | 'Persona Natural';

export interface SupplierCertification {
  name: string;
  number: string;
  issued_by: string;
  issued_date: number;
  expiry_date?: number;
}

export interface SupplierLicense {
  type: string;
  number: string;
  authority: string;
  issued_date: number;
  expiry_date: number;
}

export interface Supplier {
  _id: Id<'suppliers'>;
  company_id: Id<'companies'>;

  // Basic Information
  name: string;
  legal_name?: string;
  tax_id?: string; // NIT
  business_type?: SupplierBusinessType;
  registration_number?: string;

  // Contact
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;

  // Location
  address?: string;
  city?: string;
  administrative_division_1?: string;
  country: string;

  // Product & Specialization
  product_categories: string[];
  crop_specialization: string[];

  // Performance
  rating?: number; // 0-5
  delivery_reliability?: number; // 0-100
  quality_score?: number; // 0-100

  // Compliance
  certifications?: SupplierCertification[];
  licenses?: SupplierLicense[];

  // Financial
  payment_terms?: string;
  currency: string;

  // Metadata
  is_approved: boolean;
  is_active: boolean;
  notes?: string;
  created_at: number;
  updated_at: number;
}

// ============================================================================
// INVENTORY TYPES
// ============================================================================

export type InventoryCategory =
  | 'seeds'
  | 'clones'
  | 'nutrients'
  | 'pesticides'
  | 'equipment'
  | 'materials';

export type ProductCategory =
  | 'nutrient'
  | 'pesticide'
  | 'equipment'
  | 'seed'
  | 'substrate'
  | 'container'
  | 'tool'
  | 'other';

export type ProductStatus = 'active' | 'discontinued';

export type LotStatus = 'available' | 'reserved' | 'expired' | 'quarantine';

export interface Product {
  _id: Id<'products'>;
  sku: string;
  gtin?: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subcategory?: string;

  // Crop Applicability
  applicable_crop_type_ids: Id<'crop_types'>[];

  // Supplier Information
  brand_id?: string;
  manufacturer?: string;
  preferred_supplier_id?: Id<'suppliers'>;
  regional_suppliers: Id<'suppliers'>[];

  // Physical Properties
  weight_value?: number;
  weight_unit?: string;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  dimensions_unit?: string;

  // Metadata
  product_metadata?: Record<string, any>;

  // Regulatory
  regulatory_registered: boolean;
  regulatory_registration_number?: string; // ICA number
  organic_certified: boolean;
  organic_cert_number?: string;

  // Pricing
  default_price?: number;
  price_currency: string;
  price_unit?: string;

  // Metadata
  status: ProductStatus;
  created_at: number;
  updated_at: number;
}

export interface StorageConditions {
  temperature_min?: number;
  temperature_max?: number;
  humidity_max?: number;
  light_exposure?: 'dark' | 'low' | 'ambient';
  special_requirements?: string[];
}

export interface InventoryItem {
  _id: Id<'inventory_items'>;
  product_id: Id<'products'>;
  area_id: Id<'areas'>;
  supplier_id?: Id<'suppliers'>;

  // Quantities
  quantity_available: number;
  quantity_reserved: number;
  quantity_committed: number;
  quantity_unit: string;

  // Batch Tracking
  batch_number?: string;
  supplier_lot_number?: string;
  serial_numbers: string[];

  // Dates
  received_date?: number;
  manufacturing_date?: number;
  expiration_date?: number;
  last_tested_date?: number;

  // Financial
  purchase_price?: number;
  current_value?: number;
  cost_per_unit?: number;

  // Quality
  quality_grade?: 'A' | 'B' | 'C';
  quality_notes?: string;
  certificates: any[];

  // Source
  source_type?: 'purchase' | 'production' | 'transfer';
  source_recipe_id?: Id<'recipes'>;
  source_batch_id?: Id<'batches'>;
  production_date?: number;

  // Storage
  storage_conditions?: StorageConditions;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  lead_time_days?: number;

  // Metadata
  lot_status: LotStatus;
  last_movement_date: number;
  notes?: string;
  created_at: number;
  updated_at: number;
}

// Computed stock status
export type StockStatus = 'available' | 'low' | 'critical' | 'out_of_stock';

export interface InventoryItemWithStatus extends InventoryItem {
  stock_status: StockStatus;
}

// ============================================================================
// INVITATION TYPES
// ============================================================================

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Invitation {
  _id: Id<'invitations'>;
  company_id: Id<'companies'>;
  email: string;
  role_id: Id<'roles'>;
  facility_ids: Id<'facilities'>[];

  // Invitation Token
  token: string;
  expires_at: number;

  // Inviter Information
  invited_by: Id<'users'>;

  // Status
  status: InvitationStatus;

  // Timestamps
  created_at: number;
  accepted_at?: number;
  rejected_at?: number;
}

// ============================================================================
// USER TYPES (Extended)
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type IdentificationType = 'CC' | 'CE' | 'NIT' | 'Passport';

export interface UserPreferences {
  locale: string;
  timezone: string;
  date_format?: string;
  time_format?: string;
  theme?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  preferred_language?: string;
}

export interface User {
  _id: Id<'users'>;
  company_id?: Id<'companies'>;
  email: string;
  email_verified: boolean;
  email_verified_at?: number;

  // Personal Information
  first_name?: string;
  last_name?: string;
  phone?: string;
  identification_type?: IdentificationType;
  identification_number?: string;

  // Roles & Access
  role_id: Id<'roles'>;
  additional_role_ids: Id<'roles'>[];
  primary_facility_id?: Id<'facilities'>;
  accessible_facility_ids: Id<'facilities'>[];
  accessible_area_ids: Id<'areas'>[];

  // Preferences
  locale: string;
  timezone: string;
  date_format?: string;
  time_format?: string;
  theme?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  preferred_language?: string;

  // Security
  mfa_enabled: boolean;
  last_login?: number;
  failed_login_attempts: number;
  account_locked_until?: number;

  // Metadata
  status: UserStatus;
  created_at: number;
  updated_at: number;
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export type RoleScopeLevel = 'company' | 'facility' | 'area';

export interface Role {
  _id: Id<'roles'>;
  name: string;
  display_name_es: string;
  display_name_en: string;
  description?: string;
  level: number; // 10-1000 hierarchical level
  scope_level: RoleScopeLevel;
  permissions: any; // Permission matrix
  inherits_from_role_ids: any[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  areas: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  };
  cultivars: {
    total: number;
    active: number;
    discontinued: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    criticalStock: number;
    expired: number;
  };
  suppliers: {
    total: number;
    active: number;
    approved: number;
  };
  alerts: number;
}

export type ActivityEntityType = 'area' | 'cultivar' | 'inventory' | 'supplier' | 'user' | 'facility';

export type ActivityType =
  | 'area_created'
  | 'area_updated'
  | 'area_status_changed'
  | 'cultivar_created'
  | 'cultivar_updated'
  | 'inventory_received'
  | 'inventory_low_stock'
  | 'inventory_expired'
  | 'supplier_created'
  | 'supplier_approved'
  | 'user_invited'
  | 'user_joined'
  | 'facility_created';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: number;
  entity_type: ActivityEntityType;
  entity_id: string;
  user_id?: Id<'users'>;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  entity_type?: ActivityEntityType;
  entity_id?: string;
  action_url?: string;
  created_at: number;
  read: boolean;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface FacilitySettings {
  timezone: string;
  workday_start: string;
  workday_end: string;
  workdays: string[];
  default_activity_duration: number;
  auto_scheduling: boolean;
  notifications_enabled: boolean;
  low_stock_alert_enabled: boolean;
  overdue_activity_alert_enabled: boolean;
}

export interface AccountSettings {
  company_name: string;
  legal_name?: string;
  tax_id?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  administrative_division_1?: string;
  postal_code?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    low_stock: boolean;
    overdue_activities: boolean;
    compliance_alerts: boolean;
    system_updates: boolean;
    team_mentions: boolean;
  };
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface AreaFormData {
  name: string;
  area_type: AreaType;
  status: AreaStatus;
  compatible_crop_type_ids: string[];
  total_area_m2: number;
  capacity: number;
  climate_controlled: boolean;
  environmental_specs?: EnvironmentalSpecs;
  description?: string;
}

export interface CultivarFormData {
  name: string;
  crop_type_id: string;
  variety_type?: string;
  genetic_lineage?: string;
  supplier_id?: string;
  characteristics?: CultivarCharacteristics;
  optimal_conditions?: OptimalConditions;
  notes?: string;
}

export interface SupplierFormData {
  name: string;
  legal_name?: string;
  tax_id?: string;
  business_type?: SupplierBusinessType;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address?: string;
  city?: string;
  administrative_division_1?: string;
  product_categories: string[];
  crop_specialization: string[];
  payment_terms?: string;
  notes?: string;
}

export interface InventoryFormData {
  product_id: string;
  area_id: string;
  supplier_id?: string;
  quantity_available: number;
  quantity_unit: string;
  batch_number?: string;
  received_date?: number;
  expiration_date?: number;
  purchase_price?: number;
  reorder_point?: number;
  notes?: string;
}

export interface InvitationFormData {
  email: string;
  role_id: string;
  facility_ids: string[];
  message?: string;
}
