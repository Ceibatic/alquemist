/**
 * Alquemist Database Schema
 * Complete schema for multi-crop agricultural management platform
 * 29 tables organized in 8 functional groups
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // ============================================================================
  // CORE SYSTEM TABLES (6)
  // ============================================================================

  // Company-level settings and integrations
  company_settings: defineTable({
    company_id: v.id("companies"),

    // AI Features Configuration
    ai_features_enabled: v.boolean(), // Default: true
    gemini_api_configured: v.boolean(), // Set by system based on env check
    ai_pest_detection_enabled: v.boolean(), // Default: true
    ai_template_extraction_enabled: v.boolean(), // Default: true
    ai_quality_analysis_enabled: v.boolean(), // Default: true

    // Email Configuration
    email_notifications_enabled: v.boolean(), // Default: true
    email_api_configured: v.boolean(), // Set by system based on env check

    // Compliance & Regulatory
    require_quality_checks: v.boolean(), // Default: false
    require_batch_photos: v.boolean(), // Default: false
    require_activity_notes: v.boolean(), // Default: false
    auto_generate_reports: v.boolean(), // Default: false

    // Default Values
    default_tracking_level: v.string(), // "batch" | "individual"
    default_batch_size: v.number(), // Default: 50
    default_quality_template_id: v.optional(v.id("quality_check_templates")),

    // Notification Preferences
    notify_on_phase_change: v.boolean(), // Default: true
    notify_on_low_inventory: v.boolean(), // Default: true
    notify_on_scheduled_activity: v.boolean(), // Default: true
    notify_on_overdue_activity: v.boolean(), // Default: true
    low_inventory_threshold_percentage: v.number(), // Default: 20

    // Audit & Logging
    log_all_activities: v.boolean(), // Default: true
    retain_logs_days: v.number(), // Default: 365

    // Metadata
    updated_by: v.optional(v.id("users")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"]),

  // AI Provider configurations (for dynamic AI model switching)
  ai_providers: defineTable({
    provider_name: v.string(), // "gemini" | "claude" | "openai"
    display_name: v.string(), // "Google Gemini" | "Anthropic Claude" | "OpenAI GPT"
    is_active: v.boolean(), // Whether this provider is enabled
    is_default: v.boolean(), // Only one should be default

    // API Configuration
    api_key_configured: v.boolean(), // Set by system based on env check
    api_endpoint: v.optional(v.string()), // Custom endpoint if needed

    // Model Configuration
    default_model: v.string(), // "gemini-1.5-pro" | "claude-sonnet-4-20250514" | "gpt-4o"
    available_models: v.array(v.string()), // List of available models

    // Default Parameters
    default_temperature: v.number(), // 0-2
    default_top_k: v.optional(v.number()), // For Gemini
    default_top_p: v.number(), // 0-1
    default_max_tokens: v.number(), // Max output tokens

    // Capabilities
    supports_vision: v.boolean(), // Can analyze images
    supports_function_calling: v.optional(v.boolean()),

    // Metadata
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_provider", ["provider_name"])
    .index("by_is_default", ["is_default"])
    .index("by_is_active", ["is_active"]),

  // System prompts for AI features (editable without code changes)
  ai_prompts: defineTable({
    prompt_key: v.string(), // "template_extraction" | "pest_detection" | "quality_analysis"
    display_name: v.string(), // Human-readable name
    description: v.optional(v.string()), // What this prompt does

    // Prompt content
    system_prompt: v.string(), // The actual system prompt
    user_prompt_template: v.optional(v.string()), // Template for user prompts

    // Feature association
    feature_type: v.string(), // "template_extraction" | "pest_detection" | "quality_analysis"

    // Status & Versioning
    is_active: v.boolean(),
    version: v.number(), // Increment on each update

    // Metadata
    updated_by: v.optional(v.id("users")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_key", ["prompt_key"])
    .index("by_feature", ["feature_type"])
    .index("by_is_active", ["is_active"]),

  // Audit logs for platform admin actions
  audit_logs: defineTable({
    action_type: v.string(), // "config_update" | "subscription_change" | "ai_config_update" | "company_suspend"
    entity_type: v.string(), // "ai_provider" | "ai_prompt" | "company" | "platform_config"
    entity_id: v.optional(v.string()), // ID of the affected entity

    // Actor
    performed_by: v.id("users"), // Platform admin who performed the action

    // Change details
    previous_value: v.optional(v.any()), // Value before change
    new_value: v.optional(v.any()), // Value after change
    description: v.string(), // Human-readable description

    // Request context
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),

    created_at: v.number(),
  })
    .index("by_action_type", ["action_type"])
    .index("by_entity", ["entity_type", "entity_id"])
    .index("by_performer", ["performed_by"])
    .index("by_created_at", ["created_at"]),

  companies: defineTable({
    // DEPRECATED: Clerk organization ID (kept for backward compatibility)
    organization_id: v.optional(v.string()),

    // Basic Information
    name: v.string(),
    legal_name: v.optional(v.string()),
    tax_id: v.optional(v.string()),
    company_type: v.string(),
    business_entity_type: v.optional(v.string()),
    business_registration_number: v.optional(v.string()),
    regional_administrative_code: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),

    // Licensing
    primary_license_number: v.optional(v.string()),
    license_authority: v.optional(v.string()),
    compliance_certifications: v.optional(v.array(v.any())),

    // Contact Information
    primary_contact_name: v.optional(v.string()),
    primary_contact_email: v.optional(v.string()),
    primary_contact_phone: v.optional(v.string()),

    // Address
    address_line1: v.optional(v.string()),
    address_line2: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_2: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    country: v.string(), // Default: "CO"

    // Localization
    default_locale: v.string(), // Default: "es"
    default_currency: v.string(), // Default: "COP"
    default_timezone: v.string(), // Default: "America/Bogota"

    // Subscription
    subscription_plan: v.string(), // Default: "basic"
    max_facilities: v.number(), // Default: 3
    max_users: v.number(), // Default: 10
    feature_flags: v.object({}),

    // Metadata
    status: v.string(), // active/suspended/closed
    created_by: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_tax_id", ["tax_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),

  roles: defineTable({
    name: v.string(), // COMPANY_OWNER, FACILITY_MANAGER, etc.
    display_name_es: v.string(),
    display_name_en: v.string(),
    description: v.optional(v.string()),
    level: v.number(), // 10-1000 hierarchical level
    scope_level: v.string(), // company/facility/area
    permissions: v.any(), // Permission matrix
    inherits_from_role_ids: v.array(v.any()),
    is_system_role: v.boolean(), // Default: true
    is_active: v.boolean(), // Default: true
    created_at: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_level", ["level"])
    .index("by_is_active", ["is_active"]),

  users: defineTable({
    // Company & Authentication
    company_id: v.optional(v.id("companies")), // Optional during step 1
    email: v.string(),
    email_verified: v.boolean(), // Default: false
    email_verified_at: v.optional(v.number()), // Timestamp when verified

    // Onboarding
    onboarding_completed: v.optional(v.boolean()), // Default: false

    // Personal Information
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    phone: v.optional(v.string()),
    identification_type: v.optional(v.string()), // CC/CE/NIT/Passport
    identification_number: v.optional(v.string()),

    // Roles & Access
    role_id: v.id("roles"),
    additional_role_ids: v.array(v.id("roles")),
    primary_facility_id: v.optional(v.id("facilities")),
    accessible_facility_ids: v.array(v.id("facilities")),
    accessible_area_ids: v.array(v.id("areas")),

    // Preferences
    locale: v.string(), // Default: "es"
    timezone: v.string(), // Default: "America/Bogota"
    date_format: v.optional(v.string()), // Default: "DD/MM/YYYY"
    time_format: v.optional(v.string()), // Default: "24h"
    theme: v.optional(v.string()), // Default: "light"
    email_notifications: v.optional(v.boolean()), // Default: true
    sms_notifications: v.optional(v.boolean()), // Default: false
    preferred_language: v.optional(v.string()), // "es" | "en" - for Bubble UI language preference

    // Notification Settings (Module 21)
    notification_types: v.optional(v.any()), // Object with notification type preferences
    notification_delivery: v.optional(v.any()), // Object with delivery preferences
    quiet_hours_enabled: v.optional(v.boolean()), // Default: false
    quiet_hours_start: v.optional(v.string()), // Default: "20:00"
    quiet_hours_end: v.optional(v.string()), // Default: "08:00"

    // Security
    mfa_enabled: v.boolean(), // Default: false
    mfa_secret: v.optional(v.string()),
    last_login: v.optional(v.number()),
    failed_login_attempts: v.number(), // Default: 0
    account_locked_until: v.optional(v.number()),

    // Metadata
    status: v.string(), // active/inactive/suspended
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_company", ["company_id"])
    .index("by_role", ["role_id"])
    .index("by_status", ["status"])
    .index("by_onboarding", ["onboarding_completed"]),

  sessions: defineTable({
    // Session Token Management (for Bubble.io API authentication)
    user_id: v.id("users"),
    token: v.string(), // Random session token (30-day validity)
    expires_at: v.number(), // 30 days from creation
    last_used_at: v.optional(v.number()), // Track last activity

    // Device/Client Information (optional)
    user_agent: v.optional(v.string()),
    ip_address: v.optional(v.string()),

    // Status
    is_active: v.boolean(), // Default: true
    revoked_at: v.optional(v.number()), // When session was manually invalidated

    // Metadata
    created_at: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["user_id"])
    .index("by_expires", ["expires_at"])
    .index("by_is_active", ["is_active"]),

  invitations: defineTable({
    // Company & Invitation Details
    company_id: v.id("companies"),
    email: v.string(), // Email of the invited user
    role_id: v.id("roles"), // Role to assign to the user
    facility_ids: v.array(v.id("facilities")), // Facilities the user will have access to

    // Invitation Token
    token: v.string(), // Unique invitation token (UUID)
    expires_at: v.number(), // 72 hours from creation

    // Inviter Information
    invited_by: v.id("users"), // User who sent the invitation

    // Status
    status: v.string(), // pending/accepted/rejected/expired

    // Timestamps
    created_at: v.number(),
    accepted_at: v.optional(v.number()),
    rejected_at: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_company", ["company_id"])
    .index("by_status", ["status"])
    .index("by_expires", ["expires_at"]),

  geographic_locations: defineTable({
    // Regional Hierarchical Structure
    country_code: v.string(), // ISO 3166-1 alpha-2 (e.g., "CO")
    country_name: v.string(),
    administrative_level: v.number(), // 1 = Department/State, 2 = Municipality/City

    // Division 1 (Department/State)
    division_1_code: v.optional(v.string()), // DANE code for Colombia
    division_1_name: v.optional(v.string()),

    // Division 2 (Municipality/City)
    division_2_code: v.optional(v.string()), // DANE code for Colombia
    division_2_name: v.optional(v.string()),
    parent_division_1_code: v.optional(v.string()), // Links to parent department

    // Geographic Data
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    timezone: v.optional(v.string()), // IANA timezone (e.g., "America/Bogota")

    // Metadata
    is_active: v.boolean(), // Default: true
    created_at: v.number(),
  })
    .index("by_country", ["country_code"])
    .index("by_division_1", ["country_code", "division_1_code"])
    .index("by_division_2", ["country_code", "division_2_code"])
    .index("by_parent", ["parent_division_1_code"])
    .index("by_is_active", ["is_active"]),

  // ============================================================================
  // CROP CONFIGURATION TABLES (2)
  // ============================================================================

  crop_types: defineTable({
    name: v.string(), // Unique: Cannabis, Coffee, Cocoa, Flowers
    display_name_es: v.string(),
    display_name_en: v.string(),
    scientific_name: v.optional(v.string()),

    // Tracking Configuration
    default_tracking_level: v.string(), // "batch" or "individual"
    individual_tracking_optional: v.boolean(), // Default: true

    // Compliance & Configuration
    compliance_profile: v.any(), // Regional regulatory requirements
    default_phases: v.array(v.any()), // Production phases
    environmental_requirements: v.optional(v.any()),

    // Yield Information
    average_cycle_days: v.optional(v.number()),
    average_yield_per_plant: v.optional(v.number()),
    yield_unit: v.optional(v.string()), // kg/g/units

    // Metadata
    is_active: v.boolean(), // Default: true
    created_at: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_is_active", ["is_active"]),

  cultivars: defineTable({
    company_id: v.id("companies"), // Owner company
    name: v.string(),
    crop_type_id: v.id("crop_types"),
    variety_type: v.optional(v.string()), // Indica/Sativa, Arabica/Robusta
    genetic_lineage: v.optional(v.string()),
    flowering_time_days: v.optional(v.number()), // Days from start of flowering to harvest
    supplier_id: v.optional(v.id("suppliers")),
    thc_min: v.optional(v.number()), // THC range min %
    thc_max: v.optional(v.number()), // THC range max %
    cbd_min: v.optional(v.number()), // CBD range min %
    cbd_max: v.optional(v.number()), // CBD range max %
    performance_metrics: v.object({}), // Default: {}
    status: v.string(), // active/discontinued
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.optional(v.number()),
  })
    .index("by_company", ["company_id"])
    .index("by_company_crop", ["company_id", "crop_type_id"])
    .index("by_crop_type", ["crop_type_id"])
    .index("by_supplier", ["supplier_id"])
    .index("by_status", ["status"]),

  other_crops: defineTable({
    facility_id: v.id("facilities"),
    name: v.string(),
    category: v.string(), // herbs/vegetables/fruits/ornamental/experimental/other
    purpose: v.string(), // companion_planting/pest_control/experimental/diversification/other
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    planting_date: v.optional(v.number()),
    expected_harvest_date: v.optional(v.number()),
    location_notes: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.string(), // active/harvested/removed/failed
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_facility", ["facility_id"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // ============================================================================
  // FACILITIES & OPERATIONS TABLES (2)
  // ============================================================================

  facilities: defineTable({
    // Basic Information
    company_id: v.id("companies"), // Link to Convex companies table
    name: v.string(),

    // Licensing
    license_number: v.string(), // Unique
    license_type: v.optional(v.string()), // INVIMA/ICA/Municipal
    license_authority: v.optional(v.string()),
    license_issued_date: v.optional(v.number()),
    license_expiry_date: v.optional(v.number()),

    // Facility Details
    facility_type: v.optional(v.string()), // indoor/outdoor/greenhouse/mixed
    primary_crop_type_ids: v.array(v.id("crop_types")),

    // Location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),
    administrative_division_2: v.optional(v.string()),
    regional_code: v.optional(v.string()), // DANE code
    postal_code: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    altitude_meters: v.optional(v.number()),

    // Area Measurements
    total_area_m2: v.optional(v.number()),
    canopy_area_m2: v.optional(v.number()),
    cultivation_area_m2: v.optional(v.number()),

    // Technical Specifications
    facility_specifications: v.optional(v.object({})),
    climate_monitoring: v.boolean(), // Default: false
    weather_api_provider: v.optional(v.string()), // IDEAM
    weather_station_id: v.optional(v.string()),

    // Facility Settings (Module 20)
    timezone: v.optional(v.string()), // Default: "America/Bogota"
    workday_start: v.optional(v.string()), // Default: "08:00"
    workday_end: v.optional(v.string()), // Default: "17:00"
    workdays: v.optional(v.array(v.string())), // Default: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    default_activity_duration: v.optional(v.number()), // Default: 60 minutes
    auto_scheduling: v.optional(v.boolean()), // Default: false
    notifications_enabled: v.optional(v.boolean()), // Default: true
    low_stock_alert_enabled: v.optional(v.boolean()), // Default: true
    overdue_activity_alert_enabled: v.optional(v.boolean()), // Default: true
    license_expiration_alert_enabled: v.optional(v.boolean()), // Default: true
    critical_alert_email: v.optional(v.string()),

    // Metadata
    status: v.string(), // active/inactive/suspended
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_license_number", ["license_number"])
    .index("by_status", ["status"])
    .index("by_regional_code", ["regional_code"]),

  areas: defineTable({
    facility_id: v.id("facilities"),
    name: v.string(),
    area_type: v.string(), // propagation/vegetative/flowering/drying
    compatible_crop_type_ids: v.array(v.id("crop_types")),
    current_crop_type_id: v.optional(v.id("crop_types")),

    // Dimensions
    length_meters: v.optional(v.number()),
    width_meters: v.optional(v.number()),
    height_meters: v.optional(v.number()),
    total_area_m2: v.optional(v.number()),
    usable_area_m2: v.optional(v.number()),

    // Capacity
    capacity_configurations: v.optional(v.any()), // { max_capacity: number, ... }
    current_occupancy: v.number(), // Default: 0
    reserved_capacity: v.number(), // Default: 0

    // Technical Features
    climate_controlled: v.boolean(), // Default: false
    lighting_controlled: v.boolean(), // Default: false
    irrigation_system: v.boolean(), // Default: false
    environmental_specs: v.optional(v.any()), // { temperature_min, temperature_max, humidity_min, humidity_max, light_hours, ph_min, ph_max }
    equipment_list: v.array(v.any()), // Default: []

    // Metadata
    status: v.string(), // active/maintenance/inactive
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_facility", ["facility_id"])
    .index("by_current_crop_type", ["current_crop_type_id"])
    .index("by_status", ["status"]),

  // ============================================================================
  // SUPPLY CHAIN TABLES (3)
  // ============================================================================

  suppliers: defineTable({
    company_id: v.id("companies"),

    // Basic Information
    name: v.string(),
    legal_name: v.optional(v.string()),
    tax_id: v.optional(v.string()), // NIT
    business_type: v.optional(v.string()), // S.A.S/S.A./Ltda
    registration_number: v.optional(v.string()),

    // Contact
    primary_contact_name: v.optional(v.string()),
    primary_contact_email: v.optional(v.string()),
    primary_contact_phone: v.optional(v.string()),

    // Location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),
    country: v.string(), // Default: "CO"

    // Product & Specialization
    product_categories: v.array(v.string()),
    crop_specialization: v.array(v.string()),

    // Performance
    rating: v.optional(v.number()), // 0-5
    delivery_reliability: v.optional(v.number()), // 0-100
    quality_score: v.optional(v.number()), // 0-100

    // Compliance
    certifications: v.optional(v.array(v.any())),
    licenses: v.optional(v.array(v.any())),

    // Financial
    payment_terms: v.optional(v.string()),
    currency: v.string(), // Default: "COP"

    // Metadata
    is_approved: v.boolean(), // Default: false
    is_active: v.boolean(), // Default: true
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_is_approved", ["is_approved"])
    .index("by_is_active", ["is_active"]),

  products: defineTable({
    company_id: v.id("companies"),
    sku: v.string(), // Unique
    gtin: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // seed/nutrient/pesticide/equipment/substrate/container/tool/clone/seedling/mother_plant/plant_material/other
    subcategory: v.optional(v.string()),

    // Inventory Unit - default unit for tracking inventory (kg/g/L/mL/unidades/etc)
    default_unit: v.optional(v.string()),

    // Crop Applicability
    applicable_crop_type_ids: v.array(v.id("crop_types")),

    // Supplier Information
    brand_id: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    preferred_supplier_id: v.optional(v.id("suppliers")),
    regional_suppliers: v.array(v.id("suppliers")), // Default: []

    // Physical Properties
    weight_value: v.optional(v.number()),
    weight_unit: v.optional(v.string()), // kg/g/lb
    dimensions_length: v.optional(v.number()),
    dimensions_width: v.optional(v.number()),
    dimensions_height: v.optional(v.number()),
    dimensions_unit: v.optional(v.string()), // cm/m/in

    // Metadata
    product_metadata: v.optional(v.object({})),

    // Regulatory
    regulatory_registered: v.boolean(), // Default: false
    regulatory_registration_number: v.optional(v.string()), // ICA number
    organic_certified: v.boolean(), // Default: false
    organic_cert_number: v.optional(v.string()),

    // Pricing
    default_price: v.optional(v.number()),
    price_currency: v.string(), // Default: "COP"
    price_unit: v.optional(v.string()), // per_kg/per_unit

    // Metadata
    status: v.string(), // active/discontinued
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_sku", ["sku"])
    .index("by_category", ["category"])
    .index("by_regulatory_registered", ["regulatory_registered"])
    .index("by_status", ["status"]),

  // Product Price History - Audit trail for price changes
  product_price_history: defineTable({
    product_id: v.id("products"),

    // Price Change
    old_price: v.optional(v.number()), // null if first price
    new_price: v.number(),
    price_currency: v.string(), // COP/USD/EUR

    // Change Metadata
    change_type: v.string(), // initial/update/correction/promotion/cost_increase
    change_reason: v.optional(v.string()), // User-provided reason
    change_category: v.optional(v.string()), // market_adjustment/supplier_change/inflation/promotion/error_correction

    // Audit
    changed_by: v.id("users"),
    changed_at: v.number(),

    // Additional context
    notes: v.optional(v.string()),
    effective_date: v.optional(v.number()), // When the price becomes effective (if different from changed_at)
  })
    .index("by_product", ["product_id"])
    .index("by_changed_at", ["changed_at"])
    .index("by_change_type", ["change_type"]),

  inventory_items: defineTable({
    product_id: v.id("products"),
    area_id: v.id("areas"),
    supplier_id: v.optional(v.id("suppliers")),

    // Quantities
    quantity_available: v.number(), // Default: 0
    quantity_reserved: v.number(), // Default: 0
    quantity_committed: v.number(), // Default: 0
    quantity_unit: v.string(), // kg/g/L/units

    // Batch Tracking
    batch_number: v.optional(v.string()),
    supplier_lot_number: v.optional(v.string()),
    serial_numbers: v.array(v.string()), // Default: []

    // Dates
    received_date: v.optional(v.number()),
    manufacturing_date: v.optional(v.number()),
    expiration_date: v.optional(v.number()),
    last_tested_date: v.optional(v.number()),

    // Financial
    purchase_price: v.optional(v.number()),
    current_value: v.optional(v.number()),
    cost_per_unit: v.optional(v.number()),

    // Quality
    quality_grade: v.optional(v.string()), // A/B/C
    quality_notes: v.optional(v.string()),
    certificates: v.array(v.any()), // Default: []

    // Source
    source_type: v.optional(v.string()), // purchase/production/transfer
    source_recipe_id: v.optional(v.id("recipes")),
    source_batch_id: v.optional(v.id("batches")),
    production_date: v.optional(v.number()),

    // Storage
    storage_conditions: v.optional(v.object({})),
    minimum_stock_level: v.optional(v.number()),
    maximum_stock_level: v.optional(v.number()),
    reorder_point: v.optional(v.number()),
    lead_time_days: v.optional(v.number()),

    // Metadata
    lot_status: v.string(), // available/reserved/expired/quarantine
    last_movement_date: v.number(),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),

    // Activity tracking - links to the activity that created this inventory item
    created_by_activity_id: v.optional(v.id("activities")),

    // Transformation tracking - for plant lifecycle and material conversions
    transformation_status: v.optional(v.union(
      v.literal("active"),        // Currently in use
      v.literal("transformed"),   // Transformed to another category
      v.literal("consumed"),      // Fully consumed
      v.literal("harvested"),     // Harvested (plants)
      v.literal("expired"),       // Expired
      v.literal("waste")          // Discarded as waste
    )),
    transformed_to_item_id: v.optional(v.id("inventory_items")),
    transformed_by_activity_id: v.optional(v.id("activities")),
  })
    .index("by_product", ["product_id"])
    .index("by_area", ["area_id"])
    .index("by_lot_status", ["lot_status"])
    .index("by_expiration_date", ["expiration_date"])
    .index("by_created_activity", ["created_by_activity_id"])
    .index("by_transformation_status", ["transformation_status"]),

  /**
   * Inventory Transactions - Audit trail for all inventory movements
   * Records every change to inventory quantities for full traceability
   */
  inventory_transactions: defineTable({
    inventory_item_id: v.id("inventory_items"),
    product_id: v.id("products"), // Denormalized for easier queries

    // Transaction Details
    transaction_type: v.string(), // adjustment/consumption/addition/transfer/waste/correction/receipt
    quantity_change: v.number(), // Positive for additions, negative for deductions
    quantity_before: v.number(),
    quantity_after: v.number(),
    quantity_unit: v.string(),

    // Reference & Context
    reason: v.string(), // User-provided reason
    reference_type: v.optional(v.string()), // activity/production_order/transfer/adjustment
    reference_id: v.optional(v.string()), // ID of related entity

    // Source/Destination (for transfers)
    source_area_id: v.optional(v.id("areas")),
    destination_area_id: v.optional(v.id("areas")),

    // Audit
    performed_by: v.id("users"),
    performed_at: v.number(),
    notes: v.optional(v.string()),

    // Metadata
    created_at: v.number(),
  })
    .index("by_inventory_item", ["inventory_item_id"])
    .index("by_product", ["product_id"])
    .index("by_transaction_type", ["transaction_type"])
    .index("by_performed_at", ["performed_at"])
    .index("by_performed_by", ["performed_by"]),

  // ============================================================================
  // PRODUCTION & TEMPLATES TABLES (5)
  // ============================================================================

  recipes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    recipe_type: v.string(), // nutrient/pesticide/fertilizer
    applicable_crop_types: v.array(v.id("crop_types")),
    applicable_growth_stages: v.array(v.string()),

    // Recipe Details
    ingredients: v.array(v.any()),
    output_quantity: v.optional(v.number()),
    output_unit: v.optional(v.string()),
    batch_size: v.optional(v.number()),

    // Instructions
    preparation_steps: v.optional(v.array(v.any())),
    application_method: v.optional(v.string()),
    storage_instructions: v.optional(v.string()),
    shelf_life_hours: v.optional(v.number()),

    // Target Parameters
    target_ph: v.optional(v.number()),
    target_ec: v.optional(v.number()),
    acceptable_ph_range: v.optional(v.object({})),
    acceptable_ec_range: v.optional(v.object({})),

    // Cost & Performance
    estimated_cost: v.optional(v.number()),
    cost_per_unit: v.optional(v.number()),
    times_used: v.number(), // Default: 0
    success_rate: v.optional(v.number()),
    last_used_date: v.optional(v.number()),

    // Metadata
    company_id: v.id("companies"),
    created_by: v.optional(v.id("users")),
    status: v.string(), // active/archived
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_recipe_type", ["recipe_type"])
    .index("by_status", ["status"]),

  production_templates: defineTable({
    name: v.string(),
    crop_type_id: v.id("crop_types"),
    cultivar_id: v.optional(v.id("cultivars")),
    template_category: v.optional(v.string()), // seed-to-harvest/propagation
    production_method: v.optional(v.string()), // indoor/outdoor/greenhouse
    source_type: v.optional(v.string()), // seed/clone/tissue_culture

    // Batch Configuration
    default_batch_size: v.number(), // Default: 50
    enable_individual_tracking: v.boolean(), // Default: false

    // Details
    description: v.optional(v.string()),
    estimated_duration_days: v.optional(v.number()),
    estimated_yield: v.optional(v.number()),
    yield_unit: v.optional(v.string()),
    difficulty_level: v.optional(v.string()), // beginner/intermediate/advanced

    // Requirements
    environmental_requirements: v.optional(v.object({})),
    space_requirements: v.optional(v.object({})),

    // Cost
    estimated_cost: v.optional(v.number()),
    cost_breakdown: v.optional(v.object({})),

    // Performance
    usage_count: v.number(), // Default: 0
    average_success_rate: v.optional(v.number()),
    average_actual_yield: v.optional(v.number()),
    last_used_date: v.optional(v.number()),

    // Metadata
    company_id: v.id("companies"),
    is_public: v.boolean(), // Default: false
    created_by: v.optional(v.id("users")),
    status: v.string(), // active/archived
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_crop_type", ["crop_type_id"])
    .index("by_is_public", ["is_public"])
    .index("by_status", ["status"]),

  template_phases: defineTable({
    template_id: v.id("production_templates"),
    phase_name: v.string(),
    phase_order: v.number(),
    estimated_duration_days: v.number(),
    area_type: v.string(), // Required area type
    previous_phase_id: v.optional(v.id("template_phases")),

    // Requirements
    required_conditions: v.optional(v.object({})),
    completion_criteria: v.optional(v.object({})),
    required_equipment: v.array(v.any()), // Default: []
    required_materials: v.array(v.any()), // Default: []

    // Details
    description: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_template", ["template_id"])
    .index("by_phase_order", ["template_id", "phase_order"]),

  template_activities: defineTable({
    phase_id: v.id("template_phases"),
    activity_name: v.string(),
    activity_order: v.number(),
    activity_type: v.string(), // watering/feeding/pruning
    is_recurring: v.boolean(), // Default: false
    is_quality_check: v.boolean(), // Default: false

    // Timing
    timing_configuration: v.any(),

    // Requirements
    required_materials: v.array(v.any()), // Default: []
    estimated_duration_minutes: v.optional(v.number()),
    skill_level_required: v.optional(v.string()),

    // Quality Check
    quality_check_template_id: v.optional(v.id("quality_check_templates")),

    // Instructions
    instructions: v.optional(v.string()),
    safety_notes: v.optional(v.string()),

    created_at: v.number(),
  })
    .index("by_phase", ["phase_id"])
    .index("by_activity_order", ["phase_id", "activity_order"])
    .index("by_activity_type", ["activity_type"]),

  quality_check_templates: defineTable({
    name: v.string(),
    crop_type_id: v.id("crop_types"),
    procedure_type: v.optional(v.string()), // visual/measurement/laboratory
    inspection_level: v.optional(v.string()), // batch/sample/individual

    // Compliance
    regulatory_requirement: v.boolean(), // Default: false
    compliance_standard: v.optional(v.string()), // INVIMA/ICA/FNC

    // Template Structure
    template_structure: v.any(), // Form definition (sections with fields)

    // AI Features
    ai_assisted: v.boolean(), // Default: false
    ai_analysis_types: v.array(v.string()),

    // Applicability
    applicable_stages: v.array(v.string()),
    frequency_recommendation: v.optional(v.string()),

    // Performance
    usage_count: v.number(), // Default: 0
    average_completion_time_minutes: v.optional(v.number()),

    // Metadata
    company_id: v.id("companies"),
    created_by: v.optional(v.id("users")),
    status: v.string(), // active/archived
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_company", ["company_id"])
    .index("by_crop_type", ["crop_type_id"])
    .index("by_regulatory_requirement", ["regulatory_requirement"])
    .index("by_status", ["status"]),

  quality_checks: defineTable({
    template_id: v.id("quality_check_templates"),
    entity_type: v.string(), // batch/plant
    entity_id: v.string(),
    performed_by: v.id("users"),

    // Form Data
    form_data: v.any(), // Completed form responses
    ai_analysis_results: v.optional(v.any()), // AI analysis results

    // Results
    overall_result: v.string(), // pass/fail/conditional
    duration_minutes: v.optional(v.number()),

    // Media
    photos: v.array(v.string()), // URLs

    // Follow-up
    notes: v.optional(v.string()),
    follow_up_required: v.boolean(), // Default: false
    follow_up_date: v.optional(v.number()),

    // Context
    company_id: v.id("companies"),
    facility_id: v.id("facilities"),

    // Status
    status: v.string(), // draft/completed
    created_at: v.number(),
  })
    .index("by_template", ["template_id"])
    .index("by_entity", ["entity_type", "entity_id"])
    .index("by_company", ["company_id"])
    .index("by_facility", ["facility_id"])
    .index("by_performed_by", ["performed_by"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),

  // ============================================================================
  // PRODUCTION OPERATIONS TABLES (10)
  // ============================================================================

  // Phase 4: Order phases - instances of template phases for a specific order
  order_phases: defineTable({
    order_id: v.id("production_orders"),
    template_phase_id: v.optional(v.id("template_phases")),
    phase_name: v.string(),
    phase_order: v.number(),

    // Dates
    planned_start_date: v.number(),
    actual_start_date: v.optional(v.number()),
    planned_end_date: v.number(),
    actual_end_date: v.optional(v.number()),

    // Location
    area_id: v.optional(v.id("areas")),

    // Status
    status: v.string(), // pending/in_progress/completed/skipped
    completion_notes: v.optional(v.string()),

    created_at: v.number(),
  })
    .index("by_order", ["order_id"])
    .index("by_order_phase_order", ["order_id", "phase_order"])
    .index("by_status", ["status"]),

  // Phase 4: Batch movements - track batch location changes
  batch_movements: defineTable({
    batch_id: v.id("batches"),
    from_area_id: v.optional(v.id("areas")),
    to_area_id: v.id("areas"),
    movement_date: v.number(),
    reason: v.string(), // phase_change/reorganization/quarantine/other
    notes: v.optional(v.string()),
    performed_by: v.id("users"),
    created_at: v.number(),
  })
    .index("by_batch", ["batch_id"])
    .index("by_movement_date", ["movement_date"]),

  // Phase 4: Batch losses - track plant losses
  batch_losses: defineTable({
    batch_id: v.id("batches"),
    quantity: v.number(),
    reason: v.string(), // disease/pest/environmental/genetic/accident/discard
    description: v.optional(v.string()),
    detection_date: v.number(),
    photos: v.array(v.string()),
    incident_id: v.optional(v.id("compliance_events")),
    recorded_by: v.id("users"),
    created_at: v.number(),
  })
    .index("by_batch", ["batch_id"])
    .index("by_reason", ["reason"])
    .index("by_detection_date", ["detection_date"]),

  // Phase 4: Batch harvests - track harvest data
  batch_harvests: defineTable({
    batch_id: v.id("batches"),
    harvest_date: v.number(),
    total_weight: v.number(),
    weight_unit: v.string(), // kg/lb/g
    quality_grade: v.string(), // A/B/C
    humidity_percentage: v.optional(v.number()),
    destination_area_id: v.optional(v.id("areas")),
    product_lot_id: v.optional(v.string()),
    notes: v.optional(v.string()),
    photos: v.array(v.string()),
    harvested_by: v.id("users"),
    created_at: v.number(),
  })
    .index("by_batch", ["batch_id"])
    .index("by_harvest_date", ["harvest_date"])
    .index("by_quality_grade", ["quality_grade"]),

  // Phase 4: Plant measurements - track individual plant growth
  plant_measurements: defineTable({
    plant_id: v.id("plants"),
    measurement_date: v.number(),
    height_cm: v.optional(v.number()),
    nodes: v.optional(v.number()),
    stem_diameter_mm: v.optional(v.number()),
    health_status: v.string(), // healthy/stressed/sick
    notes: v.optional(v.string()),
    photo_url: v.optional(v.string()),
    recorded_by: v.id("users"),
    created_at: v.number(),
  })
    .index("by_plant", ["plant_id"])
    .index("by_measurement_date", ["measurement_date"]),

  // Phase 4: Plant activities - individual plant activities
  plant_activities: defineTable({
    plant_id: v.id("plants"),
    batch_activity_id: v.optional(v.id("scheduled_activities")),
    activity_type: v.string(),
    activity_date: v.number(),
    description: v.optional(v.string()),
    materials_used: v.array(v.any()),
    notes: v.optional(v.string()),
    photos: v.array(v.string()),
    performed_by: v.id("users"),
    created_at: v.number(),
  })
    .index("by_plant", ["plant_id"])
    .index("by_activity_date", ["activity_date"])
    .index("by_activity_type", ["activity_type"]),

  production_orders: defineTable({
    order_number: v.string(), // Unique (ORD-YYYY-XXXX)
    template_id: v.optional(v.id("production_templates")),
    crop_type_id: v.id("crop_types"),
    cultivar_id: v.optional(v.id("cultivars")),
    order_type: v.string(), // seed-to-harvest/propagation
    source_type: v.string(), // seed/clone/tissue_culture

    // Quantity
    requested_quantity: v.number(),
    unit_of_measure: v.string(), // plants/kg/units
    batch_size: v.optional(v.number()),
    enable_individual_tracking: v.boolean(), // Default: false

    // Source
    mother_plant_id: v.optional(v.id("mother_plants")),
    seed_inventory_id: v.optional(v.id("inventory_items")),
    supplier_id: v.optional(v.id("suppliers")),

    // Target
    target_facility_id: v.id("facilities"),
    target_area_id: v.optional(v.id("areas")),

    // Phase 4: Current phase tracking
    current_phase_id: v.optional(v.id("order_phases")),
    total_plants_planned: v.optional(v.number()),
    total_plants_actual: v.optional(v.number()),

    // Yield tracking
    estimated_yield: v.optional(v.number()),
    actual_yield: v.optional(v.number()),
    yield_unit: v.optional(v.string()),

    // Dates
    requested_delivery_date: v.optional(v.number()),
    planned_start_date: v.optional(v.number()),
    estimated_completion_date: v.optional(v.number()),
    actual_start_date: v.optional(v.number()),
    actual_completion_date: v.optional(v.number()),

    // Compliance
    transport_manifest_required: v.boolean(), // Default: false
    phytosanitary_cert_required: v.boolean(), // Default: false
    regulatory_documentation: v.object({}), // Default: {}

    // Cost
    estimated_cost: v.optional(v.number()),
    actual_cost: v.optional(v.number()),

    // Approval
    requested_by: v.id("users"),
    approved_by: v.optional(v.id("users")),
    approval_date: v.optional(v.number()),

    // Status
    status: v.string(), // planning/active/completed/cancelled
    priority: v.string(), // low/normal/high/urgent (Default: normal)
    completion_percentage: v.number(), // Default: 0
    cancellation_reason: v.optional(v.string()),

    // Metadata
    company_id: v.id("companies"),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_order_number", ["order_number"])
    .index("by_company", ["company_id"])
    .index("by_template", ["template_id"])
    .index("by_facility", ["target_facility_id"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_planned_start_date", ["planned_start_date"]),

  scheduled_activities: defineTable({
    entity_type: v.string(), // batch/plant/area
    entity_id: v.string(), // Foreign key to entity
    activity_type: v.string(), // watering/feeding/pruning
    activity_template_id: v.optional(v.id("template_activities")),
    production_order_id: v.optional(v.id("production_orders")),

    // Scheduling
    scheduled_date: v.number(),
    estimated_duration_minutes: v.optional(v.number()),

    // Recurrence
    is_recurring: v.boolean(), // Default: false
    recurring_pattern: v.optional(v.string()), // daily/weekly/biweekly
    recurring_end_date: v.optional(v.number()),
    parent_recurring_id: v.optional(v.id("scheduled_activities")),

    // Assignment
    assigned_to: v.optional(v.id("users")),
    assigned_team: v.array(v.id("users")),

    // Requirements
    required_materials: v.array(v.any()), // Default: []
    required_equipment: v.array(v.any()), // Default: []

    // Quality Check
    quality_check_template_id: v.optional(v.id("quality_check_templates")),

    // Instructions
    instructions: v.optional(v.string()),
    activity_metadata: v.optional(v.any()), // Flexible object for activity-specific data

    // Execution
    status: v.string(), // pending/in_progress/completed/skipped/cancelled
    actual_start_time: v.optional(v.number()),
    actual_end_time: v.optional(v.number()),
    completed_by: v.optional(v.id("users")),
    completion_notes: v.optional(v.string()),
    execution_results: v.optional(v.object({})),
    execution_variance: v.optional(v.object({})),

    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_entity", ["entity_type", "entity_id"])
    .index("by_status", ["status"])
    .index("by_scheduled_date", ["scheduled_date"]),

  mother_plants: defineTable({
    qr_code: v.string(), // Unique
    facility_id: v.id("facilities"),
    area_id: v.id("areas"),
    cultivar_id: v.id("cultivars"),
    name: v.optional(v.string()),

    // Source
    generation: v.number(), // Default: 1
    source_type: v.optional(v.string()), // seed/clone/tissue_culture
    source_reference: v.optional(v.string()),

    // Dates
    established_date: v.number(),
    last_clone_date: v.optional(v.number()),
    retirement_date: v.optional(v.number()),
    retirement_reason: v.optional(v.string()),

    // Performance
    total_clones_taken: v.number(), // Default: 0
    successful_clones: v.number(), // Default: 0

    // Health
    health_status: v.string(), // healthy/declining/diseased (Default: healthy)
    last_health_check: v.optional(v.number()),
    maintenance_notes: v.optional(v.string()),

    // Genetics
    genetic_stability: v.optional(v.string()),
    phenotype_notes: v.optional(v.string()),
    plant_metrics: v.optional(v.object({})),

    // Metadata
    status: v.string(), // active/retired/deceased
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_qr_code", ["qr_code"])
    .index("by_facility", ["facility_id"])
    .index("by_area", ["area_id"])
    .index("by_cultivar", ["cultivar_id"])
    .index("by_status", ["status"]),

  batches: defineTable({
    batch_code: v.string(), // Unique (cultivar-YYMMDD-XXX)
    qr_code: v.optional(v.string()), // QR code for scanning
    facility_id: v.id("facilities"),
    area_id: v.id("areas"),
    crop_type_id: v.id("crop_types"),
    cultivar_id: v.optional(v.id("cultivars")),
    production_order_id: v.optional(v.id("production_orders")),
    template_id: v.optional(v.id("production_templates")),

    // Phase 4: Genealogy
    parent_batch_id: v.optional(v.id("batches")), // If split from another batch
    merged_into_batch_id: v.optional(v.id("batches")), // If merged into another batch
    source_batch_id: v.optional(v.id("batches")), // Original source

    // Batch Type
    batch_type: v.string(), // production/mother/research/rescue
    source_type: v.string(), // seed/clone/purchase/rescue
    tracking_level: v.string(), // batch/individual (Default: batch)
    enable_individual_tracking: v.boolean(), // Default: false

    // Quantities
    planned_quantity: v.number(),
    initial_quantity: v.number(),
    current_quantity: v.number(),
    lost_quantity: v.number(), // Default: 0
    unit_of_measure: v.string(), // plants/kg/units

    // Phase 4: Mortality tracking
    mortality_rate: v.optional(v.number()), // Percentage

    // Current phase
    current_phase: v.optional(v.string()),

    // Quality Control
    sample_size: v.optional(v.number()),
    sample_frequency: v.optional(v.string()),

    // Dates
    germination_date: v.optional(v.number()),
    created_date: v.number(),
    planned_completion_date: v.optional(v.number()),
    actual_completion_date: v.optional(v.number()),
    harvest_date: v.optional(v.number()),

    // Phase 4: Days tracking
    days_in_production: v.optional(v.number()),

    // Quality
    quality_grade: v.optional(v.string()), // A/B/C
    quality_distribution: v.optional(v.object({})),
    batch_metrics: v.optional(v.object({})),
    environmental_history: v.array(v.any()), // Default: []

    // External Source
    supplier_id: v.optional(v.id("suppliers")),
    external_lot_number: v.optional(v.string()),
    received_date: v.optional(v.number()),
    phytosanitary_certificate: v.optional(v.string()),

    // Metadata
    company_id: v.id("companies"),
    created_by: v.optional(v.id("users")),
    status: v.string(), // active/harvested/archived/split/merged/lost
    priority: v.string(), // low/normal/high (Default: normal)
    notes: v.optional(v.string()),
    updated_at: v.number(),
  })
    .index("by_batch_code", ["batch_code"])
    .index("by_qr_code", ["qr_code"])
    .index("by_company", ["company_id"])
    .index("by_facility", ["facility_id"])
    .index("by_area", ["area_id"])
    .index("by_cultivar", ["cultivar_id"])
    .index("by_production_order", ["production_order_id"])
    .index("by_status", ["status"]),

  plants: defineTable({
    plant_code: v.string(), // Unique (batch_code-PXXX)
    qr_code: v.optional(v.string()), // QR code for scanning
    batch_id: v.id("batches"),
    mother_plant_id: v.optional(v.id("plants")), // Mother plant if clone (changed from mother_plants)
    facility_id: v.id("facilities"),
    area_id: v.id("areas"),
    crop_type_id: v.id("crop_types"),
    cultivar_id: v.optional(v.id("cultivars")),

    // Phase 4: Phenotype
    phenotype: v.optional(v.string()),

    // Growth Stage
    plant_stage: v.string(), // seedling/vegetative/flowering/harvest
    sex: v.optional(v.string()), // male/female/unknown

    // Dates
    germination_date: v.optional(v.number()),
    planted_date: v.number(),
    stage_progression_dates: v.optional(v.object({})),
    harvested_date: v.optional(v.number()),
    destroyed_date: v.optional(v.number()),
    destruction_reason: v.optional(v.string()),

    // Phase 4: Current measurements
    current_height_cm: v.optional(v.number()),
    current_nodes: v.optional(v.number()),
    stem_diameter_mm: v.optional(v.number()),

    // Metrics
    plant_metrics: v.optional(v.object({})), // Additional metrics
    health_status: v.string(), // healthy/stressed/sick (Default: healthy)
    last_quality_score: v.optional(v.number()),
    last_inspection_date: v.optional(v.number()),
    inspection_notes: v.optional(v.string()),

    // Phase 4: Cloning
    clones_taken_count: v.number(), // Default: 0

    // Phase 4: Harvest
    harvest_weight: v.optional(v.number()),
    harvest_quality: v.optional(v.string()), // A/B/C

    // Location
    position: v.optional(v.object({})), // { row, column }
    position_x: v.optional(v.number()),
    position_y: v.optional(v.number()),
    container_id: v.optional(v.string()),

    // Metadata
    company_id: v.id("companies"),
    status: v.string(), // active/harvested/lost/transferred
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_plant_code", ["plant_code"])
    .index("by_qr_code", ["qr_code"])
    .index("by_batch", ["batch_id"])
    .index("by_company", ["company_id"])
    .index("by_facility", ["facility_id"])
    .index("by_area", ["area_id"])
    .index("by_health_status", ["health_status"])
    .index("by_status", ["status"]),

  // ============================================================================
  // ACTIVITY & QUALITY TABLES (3)
  // ============================================================================

  activities: defineTable({
    entity_type: v.string(), // batch/plant/area
    entity_id: v.string(), // Foreign key to entity
    activity_type: v.string(), // watering/feeding/pruning/harvest
    scheduled_activity_id: v.optional(v.id("scheduled_activities")),
    performed_by: v.id("users"),

    // Execution Details
    timestamp: v.number(), // Default: now
    duration_minutes: v.optional(v.number()),

    // Movement
    area_from: v.optional(v.id("areas")),
    area_to: v.optional(v.id("areas")),

    // Quantity Changes
    quantity_before: v.optional(v.number()),
    quantity_after: v.optional(v.number()),

    // QR Tracking
    qr_scanned: v.optional(v.string()),
    scan_timestamp: v.optional(v.number()),

    // Resources
    materials_consumed: v.array(v.any()), // Default: []
    equipment_used: v.array(v.any()), // Default: []

    // Materials produced - for transformations (phase transitions, harvests)
    materials_produced: v.optional(v.array(v.object({
      product_id: v.id("products"),
      inventory_item_id: v.optional(v.id("inventory_items")), // Item created
      quantity: v.number(),
      quantity_unit: v.string(),
    }))),

    // Quality & Environment
    quality_check_data: v.optional(v.object({})),
    environmental_data: v.optional(v.object({})),

    // Media
    photos: v.array(v.string()), // File references
    files: v.array(v.string()),
    media_metadata: v.optional(v.object({})),

    // AI
    ai_assistance_data: v.optional(v.object({})),

    // Metadata - flexible object to store activity-specific data (inventory movements, etc.)
    activity_metadata: v.optional(v.any()),
    notes: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_entity", ["entity_type", "entity_id"])
    .index("by_activity_type", ["activity_type"])
    .index("by_timestamp", ["timestamp"]),

  pest_disease_records: defineTable({
    facility_id: v.id("facilities"),
    area_id: v.id("areas"),
    entity_type: v.string(), // batch/plant/area
    entity_id: v.string(),
    pest_disease_id: v.id("pest_diseases"),

    // Detection
    detection_method: v.optional(v.string()), // visual/ai/laboratory
    confidence_level: v.optional(v.string()), // low/medium/high
    severity_level: v.optional(v.string()), // low/medium/high/critical
    affected_percentage: v.optional(v.number()), // 0-100
    affected_plant_count: v.optional(v.number()),
    progression_stage: v.optional(v.string()), // early/progressing/severe

    // Who & When
    detected_by: v.id("users"),
    detection_date: v.number(), // Default: now

    // AI & Environment
    ai_detection_data: v.optional(v.object({})),
    environmental_conditions: v.optional(v.object({})),

    // Causes & Media
    likely_causes: v.array(v.string()),
    photos: v.array(v.string()),
    description: v.optional(v.string()),

    // Actions
    immediate_action_taken: v.boolean(), // Default: false
    immediate_actions: v.optional(v.array(v.any())),
    treatment_plan_id: v.optional(v.string()),

    // Followup
    followup_required: v.boolean(), // Default: true
    scheduled_followup_date: v.optional(v.number()),

    // Resolution
    resolution_status: v.string(), // active/monitoring/resolved (Default: active)
    resolution_date: v.optional(v.number()),
    resolution_notes: v.optional(v.string()),

    // Metadata
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_facility", ["facility_id"])
    .index("by_area", ["area_id"])
    .index("by_pest_disease", ["pest_disease_id"])
    .index("by_resolution_status", ["resolution_status"]),

  pest_diseases: defineTable({
    name: v.string(), // Common name (Spanish)
    scientific_name: v.string(),
    type: v.string(), // pest/disease/deficiency
    category: v.string(), // insect/fungal/bacterial/viral

    // Crop & Region
    affected_crop_types: v.array(v.id("crop_types")),
    regional_prevalence: v.array(v.string()), // Colombian departments
    seasonal_pattern: v.optional(v.string()),

    // Identification
    identification_guide: v.optional(v.string()),
    symptoms: v.optional(v.object({})),
    similar_conditions: v.array(v.string()),

    // AI
    ai_model_trained: v.boolean(), // Default: false
    ai_detection_accuracy: v.optional(v.number()),

    // Treatment
    prevention_methods: v.optional(v.array(v.any())),
    treatment_options: v.optional(v.array(v.any())),

    // Impact
    economic_impact: v.optional(v.string()),
    spread_rate: v.optional(v.string()),

    // Compliance
    is_quarantinable: v.boolean(), // Default: false
    regulatory_status: v.optional(v.string()), // ICA/INVIMA status

    // Metadata
    status: v.string(), // active/archived
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // ============================================================================
  // MEDIA & COMPLIANCE TABLES (3)
  // ============================================================================

  media_files: defineTable({
    // File Information
    filename: v.string(),
    original_filename: v.string(),
    file_size_bytes: v.number(),
    mime_type: v.string(),
    file_extension: v.string(),

    // Storage
    storage_provider: v.string(), // minio/s3/convex
    storage_path: v.string(),
    storage_bucket: v.string(),
    public_url: v.optional(v.string()),

    // Location
    gps_coordinates: v.optional(v.object({})), // MAGNA-SIRGAS
    location_taken: v.optional(v.string()),
    administrative_location: v.optional(v.string()),
    altitude_meters: v.optional(v.number()),

    // Media Properties
    resolution_width: v.optional(v.number()),
    resolution_height: v.optional(v.number()),
    duration_seconds: v.optional(v.number()),

    // AI Analysis
    ai_analysis_performed: v.boolean(), // Default: false
    ai_analysis_results: v.optional(v.object({})),

    // Associations
    associated_entity_type: v.optional(v.string()), // batch/plant/facility
    associated_entity_id: v.optional(v.string()),
    activity_id: v.optional(v.id("activities")),

    // Tags
    tags: v.array(v.string()),
    auto_generated_tags: v.array(v.string()),
    category: v.optional(v.string()), // photo/document/certificate

    // Compliance
    is_compliance_document: v.boolean(), // Default: false
    regulatory_significance: v.optional(v.string()), // INVIMA/ICA/FNC
    retention_period_years: v.optional(v.number()), // Default: 5

    // Processing
    quality_score: v.optional(v.number()), // 0-100
    is_processed: v.boolean(), // Default: false
    processing_status: v.optional(v.string()), // pending/processing/complete/error

    // Visibility
    visibility: v.string(), // public/private/company (Default: private)

    // Metadata
    company_id: v.id("companies"),
    uploaded_by: v.id("users"),
    captured_at: v.optional(v.number()),
    uploaded_at: v.number(),
    processed_at: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.string(), // active/archived/deleted
  })
    .index("by_company", ["company_id"])
    .index("by_associated_entity", ["associated_entity_type", "associated_entity_id"])
    .index("by_category", ["category"])
    .index("by_is_compliance_document", ["is_compliance_document"]),

  compliance_events: defineTable({
    event_type: v.string(), // inspection/violation/permit/audit
    event_category: v.string(), // ica/invima/municipal/fnc
    regulatory_authority: v.optional(v.string()),
    regulation_reference: v.optional(v.string()),
    compliance_requirement: v.optional(v.string()),

    // Entity
    entity_type: v.string(), // company/facility/batch
    entity_id: v.string(),
    company_id: v.id("companies"),
    facility_id: v.optional(v.id("facilities")),

    // Details
    title: v.string(),
    description: v.string(),
    severity: v.optional(v.string()), // low/medium/high/critical

    // Detection
    detected_by: v.optional(v.string()),
    detected_by_user_id: v.optional(v.id("users")),
    detection_date: v.number(), // Default: now

    // Status
    status: v.string(), // open/in_progress/resolved/closed
    assigned_to: v.optional(v.id("users")),
    due_date: v.optional(v.number()),
    resolution_date: v.optional(v.number()),
    resolution_notes: v.optional(v.string()),

    // Actions
    immediate_actions: v.optional(v.array(v.any())),
    preventive_actions: v.optional(v.array(v.any())),
    corrective_actions: v.optional(v.array(v.any())),

    // Media
    supporting_documents: v.array(v.string()),
    photos: v.array(v.string()),

    // Regulatory
    requires_authority_notification: v.boolean(), // Default: false
    notification_sent: v.optional(v.number()),
    authority_response: v.optional(v.string()),

    // Cost
    estimated_cost: v.optional(v.number()),
    actual_cost: v.optional(v.number()),

    // Followup
    followup_required: v.boolean(), // Default: false
    followup_date: v.optional(v.number()),
    recurring_check_frequency: v.optional(v.string()), // daily/weekly/monthly

    // Metadata
    created_by: v.optional(v.id("users")),
    updated_by: v.optional(v.id("users")),
    created_at: v.number(),
    updated_at: v.number(),
    is_audit_locked: v.boolean(), // Default: false
    audit_lock_reason: v.optional(v.string()),
  })
    .index("by_company", ["company_id"])
    .index("by_facility", ["facility_id"])
    .index("by_event_category", ["event_category"])
    .index("by_status", ["status"])
    .index("by_due_date", ["due_date"]),

  certificates: defineTable({
    certificate_number: v.string(), // Unique
    certificate_name: v.string(),
    certificate_type: v.string(), // license/certification/permit
    issuing_authority: v.string(),
    issuer_accreditation: v.string(),

    // Applies To
    applies_to_entity_type: v.string(), // company/facility/batch
    applies_to_entity_id: v.string(),
    company_id: v.id("companies"),

    // Regulatory
    regulatory_authority: v.optional(v.string()), // INVIMA/ICA/FNC/Municipal
    national_registration_number: v.optional(v.string()),

    // Dates
    issued_date: v.number(),
    expiry_date: v.number(),
    is_renewable: v.boolean(), // Default: true
    renewal_notice_days: v.number(), // Default: 90

    // Details
    scope_description: v.optional(v.string()),
    conditions: v.optional(v.array(v.any())),
    standards_met: v.array(v.string()),

    // Documents
    certificate_document_url: v.optional(v.string()),
    supporting_documents: v.array(v.string()),

    // Verification
    verification_method: v.optional(v.string()),
    verification_url: v.optional(v.string()),
    verification_code: v.optional(v.string()),

    // Status
    status: v.string(), // valid/expired/suspended/revoked
    suspension_reason: v.optional(v.string()),
    suspension_date: v.optional(v.number()),
    reinstatement_date: v.optional(v.number()),

    // Compliance
    regulatory_weight: v.optional(v.number()), // 1-10
    automatic_compliance_check: v.boolean(), // Default: true
    last_verification_date: v.optional(v.number()),
    next_verification_due: v.optional(v.number()),
    renewal_notification_sent: v.optional(v.number()),

    // Metadata
    uploaded_by: v.optional(v.id("users")),
    verified_by: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_certificate_number", ["certificate_number"])
    .index("by_company", ["company_id"])
    .index("by_certificate_type", ["certificate_type"])
    .index("by_expiry_date", ["expiry_date"])
    .index("by_status", ["status"]),
});
