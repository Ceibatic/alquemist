# Database Schema - Alquemist

**Complete Data Model for Multi-Crop Agriculture Platform**

**Version**: 1.0
**Date**: January 2025

---

## Document Purpose

This document provides a **technology-agnostic** definition of the Alquemist database schema. The schema can be implemented using any relational database (PostgreSQL, MySQL) or modern serverless database (Convex, Supabase).

**For feature requirements**, see [Product-Requirements.md]
**For technical implementation**, see [Technical-Specification.md]

---

## Schema Overview

### Database Structure

**26 Tables organized in 8 functional groups:**

1. **Core System** (3 tables) - Multi-tenancy, authentication, permissions
2. **Crop Configuration** (2 tables) - Multi-crop support system
3. **Facilities & Operations** (2 tables) - Licensed cultivation sites
4. **Supply Chain** (3 tables) - Suppliers, products, inventory
5. **Production & Templates** (5 tables) - Workflow templates
6. **Production Operations** (4 tables) - Batch-first tracking
7. **Activity & Quality** (3 tables) - Work execution, pest management
8. **Media & Compliance** (3 tables) - Documents, regulatory tracking

### Design Principles

- **Multi-tenant**: All tables include `company_id` for tenant isolation
- **Batch-first**: Primary tracking at batch level (50-1000 plants)
- **Colombian compliance**: Extensive Colombian-specific fields
- **Audit trail**: Immutable activity and audit logging
- **Flexible metadata**: JSON fields for crop-specific/evolving data

---

# Core System Tables

## Table: companies

**Purpose**: Multi-tenant company accounts with Colombian business details

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Company name |
| legal_name | String | No | Legal business name |
| tax_id | String | No | Tax ID (NIT) - unique |
| company_type | String | Yes | Business classification |
| business_entity_type | String | No | S.A.S, S.A., Ltda, E.U., Persona Natural |
| camara_comercio_registration | String | No | Chamber of Commerce registration |
| dane_municipality_code | String | No | DANE code for municipality |
| colombian_department | String | No | Colombian department |
| primary_license_number | String | No | Primary license number |
| license_authority | String | No | Licensing authority |
| compliance_certifications | JSON | No | Array of certifications |
| primary_contact_name | String | No | Primary contact person |
| primary_contact_email | String | No | Contact email |
| primary_contact_phone | String | No | Contact phone |
| address_line1 | String | No | Address line 1 |
| address_line2 | String | No | Address line 2 |
| city | String | No | City |
| department | String | No | Department/state |
| postal_code | String | No | Postal code |
| country | String | Yes | Default: "Colombia" |
| default_locale | String | Yes | Default: "es" |
| default_currency | String | Yes | Default: "COP" |
| default_timezone | String | Yes | Default: "America/Bogota" |
| subscription_plan | String | Yes | Current plan (default: "basic") |
| max_facilities | Number | Yes | Facility limit (default: 3) |
| max_users | Number | Yes | User limit (default: 10) |
| feature_flags | JSON | Yes | Enabled features (default: {}) |
| status | String | Yes | active/suspended/closed |
| created_by | String | No | User ID who created company |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Has many: users, facilities, suppliers, production_templates, quality_check_templates, compliance_events, certificates, recipes, media_files

### Indexes

- Unique: tax_id
- Index: status, created_at

---

## Table: roles

**Purpose**: System and custom roles with permission matrix

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Role name (e.g., "COMPANY_OWNER") |
| display_name_es | String | Yes | Spanish display name |
| display_name_en | String | Yes | English display name |
| description | String | No | Role description |
| level | Number | Yes | Hierarchical level (10-1000) |
| scope_level | String | Yes | company/facility/area |
| permissions | JSON | Yes | Permission matrix object |
| inherits_from_role_ids | Array[String] | Yes | Role inheritance chain |
| is_system_role | Boolean | Yes | System-defined (default: true) |
| is_active | Boolean | Yes | Active status (default: true) |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Has many: users

### Indexes

- Unique: name
- Index: level, is_active

### Standard Roles

1. **COMPANY_OWNER** (level 1000) - Full access
2. **FACILITY_MANAGER** (level 500) - Facility operations
3. **PRODUCTION_SUPERVISOR** (level 300) - Production management
4. **WORKER** (level 100) - Activity execution
5. **VIEWER** (level 10) - Read-only access

---

## Table: users

**Purpose**: User accounts with authentication and Colombian identification

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| company_id | String | Yes | Foreign key → companies.id |
| email | String | Yes | Unique email address |
| password_hash | String | Yes | Hashed password |
| email_verified | Boolean | Yes | Verification status (default: false) |
| first_name | String | No | First name |
| last_name | String | No | Last name |
| phone | String | No | Phone number |
| identification_type | String | No | CC/CE/NIT/Passport |
| identification_number | String | No | ID number |
| role_id | String | Yes | Foreign key → roles.id |
| additional_role_ids | Array[String] | Yes | Multiple roles support |
| primary_facility_id | String | No | Foreign key → facilities.id |
| accessible_facility_ids | Array[String] | Yes | Facility access list |
| accessible_area_ids | Array[String] | Yes | Area access list |
| locale | String | Yes | Language preference (default: "es") |
| timezone | String | Yes | Timezone (default: "America/Bogota") |
| mfa_enabled | Boolean | Yes | MFA status (default: false) |
| mfa_secret | String | No | MFA secret key |
| last_login | DateTime | No | Last login timestamp |
| failed_login_attempts | Number | Yes | Failed attempts (default: 0) |
| account_locked_until | DateTime | No | Account lock expiration |
| status | String | Yes | active/inactive/suspended |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: company, role, facility (primary)
- Has many: activities, scheduled_activities, production_orders, pest_disease_records, compliance_events, media_files, recipes, templates

### Indexes

- Unique: email
- Index: company_id, role_id, status, email_verified

---

# Crop Configuration Tables

## Table: crop_types

**Purpose**: Multi-crop support with batch-first tracking configuration

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Unique crop name (e.g., "Cannabis") |
| display_name_es | String | Yes | Spanish display name |
| display_name_en | String | Yes | English display name |
| scientific_name | String | No | Scientific name |
| default_tracking_level | String | Yes | "batch" or "individual" (default: "batch") |
| individual_tracking_optional | Boolean | Yes | Allow individual tracking (default: true) |
| compliance_profile | JSON | Yes | Colombian regulatory requirements |
| default_phases | JSON | Yes | Production phases for crop |
| environmental_requirements | JSON | No | Temperature, humidity, etc. |
| average_cycle_days | Number | No | Typical growing cycle |
| average_yield_per_plant | Decimal | No | Average yield |
| yield_unit | String | No | kg/g/units |
| is_active | Boolean | Yes | Active status (default: true) |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Has many: cultivars, production_templates, quality_check_templates, batches, plants

### Indexes

- Unique: name
- Index: is_active

### Standard Crop Types

1. **Cannabis** - INVIMA compliance, batch/individual tracking
2. **Coffee** - FNC standards, batch tracking
3. **Cocoa** - Export quality standards
4. **Flowers** - Export certification requirements

---

## Table: cultivars

**Purpose**: Specific varieties/strains for each crop type

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Cultivar name |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| variety_type | String | No | Indica/Sativa/Hybrid, Arabica/Robusta, etc. |
| genetic_lineage | String | No | Parent genetics |
| supplier_id | String | No | Foreign key → suppliers.id |
| colombian_origin | JSON | No | Colombian origin information |
| characteristics | JSON | No | Crop-specific characteristics |
| optimal_conditions | JSON | No | Growing requirements |
| performance_metrics | JSON | Yes | Tracked performance data (default: {}) |
| status | String | Yes | active/discontinued |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Belongs to: crop_type, supplier
- Has many: production_templates, production_orders, batches, plants, mother_plants

### Indexes

- Index: crop_type_id, supplier_id, status

---

# Facilities & Operations Tables

## Table: facilities

**Purpose**: Licensed cultivation facilities with Colombian geographic data

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| company_id | String | Yes | Foreign key → companies.id |
| name | String | Yes | Facility name |
| license_number | String | Yes | Unique license number |
| license_type | String | No | INVIMA/ICA/Municipal |
| license_authority | String | No | Issuing authority |
| license_issued_date | DateTime | No | Issue date |
| license_expiry_date | DateTime | No | Expiration date |
| facility_type | String | No | indoor/outdoor/greenhouse/mixed |
| primary_crop_type_ids | Array[String] | Yes | Supported crop types |
| address | String | No | Street address |
| city | String | No | City |
| department | String | No | Colombian department |
| municipality | String | No | Municipality |
| dane_code | String | No | DANE municipality code |
| postal_code | String | No | Postal code |
| latitude | Decimal | No | GPS latitude (MAGNA-SIRGAS) |
| longitude | Decimal | No | GPS longitude (MAGNA-SIRGAS) |
| altitude_msnm | Number | No | Altitude in meters above sea level |
| total_area_m2 | Decimal | No | Total facility area |
| canopy_area_m2 | Decimal | No | Canopy area |
| cultivation_area_m2 | Decimal | No | Cultivation area |
| facility_specifications | JSON | No | Infrastructure details |
| climate_monitoring | Boolean | Yes | Climate monitoring enabled (default: false) |
| weather_api_provider | String | No | IDEAM/other |
| weather_station_id | String | No | Weather station ID |
| status | String | Yes | active/inactive/suspended |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: company
- Has many: areas, users (primary), production_orders, batches, plants, mother_plants, pest_disease_records, compliance_events

### Indexes

- Unique: license_number
- Index: company_id, status, dane_code

---

## Table: areas

**Purpose**: Cultivation zones within facilities with multi-crop compatibility

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| facility_id | String | Yes | Foreign key → facilities.id |
| name | String | Yes | Area name |
| area_type | String | Yes | propagation/vegetative/flowering/drying/etc. |
| compatible_crop_type_ids | Array[String] | Yes | Compatible crops |
| current_crop_type_id | String | No | Foreign key → crop_types.id |
| length_meters | Decimal | No | Length in meters |
| width_meters | Decimal | No | Width in meters |
| height_meters | Decimal | No | Height in meters |
| total_area_m2 | Decimal | No | Total area |
| usable_area_m2 | Decimal | No | Usable area |
| capacity_configurations | JSON | No | Capacity calculations |
| current_occupancy | Number | Yes | Current occupancy (default: 0) |
| reserved_capacity | Number | Yes | Reserved capacity (default: 0) |
| climate_controlled | Boolean | Yes | Climate control (default: false) |
| lighting_controlled | Boolean | Yes | Lighting control (default: false) |
| irrigation_system | Boolean | Yes | Irrigation system (default: false) |
| environmental_specs | JSON | No | Temperature, humidity ranges |
| equipment_list | JSON | Yes | Equipment in area (default: []) |
| status | String | Yes | active/maintenance/inactive |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: facility, crop_type (current)
- Has many: inventory_items, batches, plants, mother_plants, activities, pest_disease_records

### Indexes

- Index: facility_id, current_crop_type_id, status

---

# Supply Chain Tables

## Table: suppliers

**Purpose**: Colombian suppliers with performance tracking

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| company_id | String | Yes | Foreign key → companies.id |
| name | String | Yes | Supplier name |
| legal_name | String | No | Legal business name |
| tax_id | String | No | NIT/tax ID |
| business_type | String | No | S.A.S/S.A./Ltda/etc. |
| registration_number | String | No | Registration number |
| primary_contact_name | String | No | Contact person |
| primary_contact_email | String | No | Contact email |
| primary_contact_phone | String | No | Contact phone |
| address | String | No | Street address |
| city | String | No | City |
| department | String | No | Colombian department |
| country | String | Yes | Default: "Colombia" |
| product_categories | Array[String] | Yes | Product categories supplied |
| crop_specialization | Array[String] | Yes | Crop specialization |
| rating | Decimal | No | Overall rating (0-5) |
| delivery_reliability | Decimal | No | Delivery reliability (0-100) |
| quality_score | Decimal | No | Quality score (0-100) |
| certifications | JSON | No | Supplier certifications |
| licenses | JSON | No | Supplier licenses |
| payment_terms | String | No | Payment terms |
| currency | String | Yes | Default: "COP" |
| is_approved | Boolean | Yes | Approval status (default: false) |
| is_active | Boolean | Yes | Active status (default: true) |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: company
- Has many: products, inventory_items, cultivars, batches, production_orders

### Indexes

- Index: company_id, is_approved, is_active

---

## Table: products

**Purpose**: Product catalog with Colombian compliance and multi-crop applicability

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| sku | String | Yes | Unique SKU |
| gtin | String | No | Global Trade Item Number |
| name | String | Yes | Product name |
| description | String | No | Product description |
| category | String | Yes | nutrient/pesticide/equipment/etc. |
| subcategory | String | No | Subcategory |
| applicable_crop_type_ids | Array[String] | Yes | Applicable crops |
| brand_id | String | No | Brand identifier |
| manufacturer | String | No | Manufacturer name |
| preferred_supplier_id | String | No | Foreign key → suppliers.id |
| colombian_suppliers | Array[String] | Yes | Colombian supplier IDs |
| weight_value | Decimal | No | Product weight |
| weight_unit | String | No | kg/g/lb |
| dimensions_length | Decimal | No | Length |
| dimensions_width | Decimal | No | Width |
| dimensions_height | Decimal | No | Height |
| dimensions_unit | String | No | cm/m/in |
| product_metadata | JSON | No | Additional product data |
| ica_registered | Boolean | Yes | ICA registration (default: false) |
| ica_registration_number | String | No | ICA registration number |
| organic_certified | Boolean | Yes | Organic certification (default: false) |
| organic_cert_number | String | No | Certification number |
| default_price | Decimal | No | Default price |
| price_currency | String | Yes | Default: "COP" |
| price_unit | String | No | per_kg/per_unit/etc. |
| status | String | Yes | active/discontinued |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: supplier (preferred)
- Has many: inventory_items

### Indexes

- Unique: sku
- Index: category, ica_registered, status

---

## Table: inventory_items

**Purpose**: Stock management with batch tracking and Colombian pricing

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| product_id | String | Yes | Foreign key → products.id |
| area_id | String | Yes | Foreign key → areas.id |
| supplier_id | String | No | Foreign key → suppliers.id |
| quantity_available | Decimal | Yes | Available quantity (default: 0) |
| quantity_reserved | Decimal | Yes | Reserved quantity (default: 0) |
| quantity_committed | Decimal | Yes | Committed quantity (default: 0) |
| quantity_unit | String | Yes | kg/g/L/units |
| batch_number | String | No | Batch number |
| supplier_lot_number | String | No | Supplier lot number |
| serial_numbers | Array[String] | Yes | Serial numbers for tracking |
| received_date | DateTime | No | Date received |
| manufacturing_date | DateTime | No | Manufacturing date |
| expiration_date | DateTime | No | Expiration date |
| last_tested_date | DateTime | No | Quality test date |
| purchase_price_cop | Decimal | No | Purchase price in COP |
| current_value_cop | Decimal | No | Current value in COP |
| cost_per_unit_cop | Decimal | No | Cost per unit in COP |
| quality_grade | String | No | A/B/C quality grade |
| quality_notes | String | No | Quality notes |
| certificates | JSON | Yes | Quality certificates (default: []) |
| source_type | String | No | purchase/production/transfer |
| source_recipe_id | String | No | Foreign key → recipes.id |
| source_batch_id | String | No | Foreign key → batches.id |
| production_date | DateTime | No | Production date |
| storage_conditions | JSON | No | Required storage conditions |
| minimum_stock_level | Decimal | No | Reorder threshold |
| maximum_stock_level | Decimal | No | Maximum stock |
| reorder_point | Decimal | No | Reorder point |
| lead_time_days | Number | No | Supplier lead time |
| lot_status | String | Yes | available/reserved/expired/quarantine |
| last_movement_date | DateTime | Yes | Last movement timestamp |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: product, area, supplier, recipe (source), batch (source)

### Indexes

- Index: product_id, area_id, lot_status, expiration_date

---

# Production & Templates Tables

## Table: recipes

**Purpose**: Formulation recipes for nutrients, pesticides, fertilizers

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Recipe name |
| description | String | No | Recipe description |
| recipe_type | String | Yes | nutrient/pesticide/fertilizer/other |
| applicable_crop_types | Array[String] | Yes | Applicable crop type IDs |
| applicable_growth_stages | Array[String] | Yes | Growth stages |
| ingredients | JSON | Yes | Recipe ingredients list |
| output_quantity | Decimal | No | Output quantity |
| output_unit | String | No | Output unit |
| batch_size | Number | No | Batch size |
| preparation_steps | JSON | No | Preparation instructions |
| application_method | String | No | How to apply |
| storage_instructions | String | No | Storage requirements |
| shelf_life_hours | Number | No | Shelf life |
| target_ph | Decimal | No | Target pH level |
| target_ec | Decimal | No | Target EC level |
| acceptable_ph_range | JSON | No | pH range object |
| acceptable_ec_range | JSON | No | EC range object |
| estimated_cost_cop | Decimal | No | Estimated cost in COP |
| cost_per_unit_cop | Decimal | No | Cost per unit in COP |
| times_used | Number | Yes | Usage count (default: 0) |
| success_rate | Decimal | No | Success percentage |
| last_used_date | DateTime | No | Last usage date |
| company_id | String | Yes | Foreign key → companies.id |
| created_by | String | No | Foreign key → users.id |
| status | String | Yes | active/archived |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: company, user (creator)
- Has many: inventory_items (derived from recipe)

### Indexes

- Index: company_id, recipe_type, status

---

## Table: production_templates

**Purpose**: Reusable production workflows with batch-first design

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Template name |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| cultivar_id | String | No | Foreign key → cultivars.id |
| template_category | String | No | seed-to-harvest/propagation/etc. |
| production_method | String | No | indoor/outdoor/greenhouse |
| source_type | String | No | seed/clone/tissue_culture |
| default_batch_size | Number | Yes | Default batch size (default: 50) |
| enable_individual_tracking | Boolean | Yes | Individual tracking (default: false) |
| description | String | No | Template description |
| estimated_duration_days | Number | No | Estimated duration |
| estimated_yield | Decimal | No | Expected yield |
| yield_unit | String | No | Yield unit |
| difficulty_level | String | No | beginner/intermediate/advanced |
| environmental_requirements | JSON | No | Environmental requirements |
| space_requirements | JSON | No | Space requirements |
| estimated_cost_cop | Decimal | No | Estimated cost in COP |
| cost_breakdown | JSON | No | Cost breakdown details |
| usage_count | Number | Yes | Times used (default: 0) |
| average_success_rate | Decimal | No | Success percentage |
| average_actual_yield | Decimal | No | Actual yield average |
| last_used_date | DateTime | No | Last usage date |
| company_id | String | Yes | Foreign key → companies.id |
| is_public | Boolean | Yes | Public template (default: false) |
| created_by | String | No | Foreign key → users.id |
| status | String | Yes | active/archived |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: crop_type, cultivar, company, user (creator)
- Has many: template_phases, production_orders, batches

### Indexes

- Index: company_id, crop_type_id, is_public, status

---

## Table: template_phases

**Purpose**: Sequential phases within production templates

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| template_id | String | Yes | Foreign key → production_templates.id |
| phase_name | String | Yes | Phase name |
| phase_order | Number | Yes | Sequential order |
| estimated_duration_days | Number | Yes | Duration in days |
| area_type | String | Yes | Required area type |
| previous_phase_id | String | No | Foreign key → template_phases.id |
| required_conditions | JSON | No | Environmental conditions |
| completion_criteria | JSON | No | Completion criteria |
| required_equipment | JSON | Yes | Equipment list (default: []) |
| required_materials | JSON | Yes | Materials list (default: []) |
| description | String | No | Phase description |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Belongs to: production_template, template_phase (previous)
- Has many: template_phases (next), template_activities

### Indexes

- Index: template_id, phase_order

---

## Table: template_activities

**Purpose**: Scheduled activities within template phases

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| phase_id | String | Yes | Foreign key → template_phases.id |
| activity_name | String | Yes | Activity name |
| activity_order | Number | Yes | Sequential order |
| activity_type | String | Yes | watering/feeding/pruning/etc. |
| is_recurring | Boolean | Yes | Recurring activity (default: false) |
| is_quality_check | Boolean | Yes | Quality check (default: false) |
| timing_configuration | JSON | Yes | Timing rules |
| required_materials | JSON | Yes | Materials needed (default: []) |
| estimated_duration_minutes | Number | No | Duration estimate |
| skill_level_required | String | No | Required skill level |
| quality_check_template_id | String | No | Foreign key → quality_check_templates.id |
| instructions | String | No | Activity instructions |
| safety_notes | String | No | Safety guidelines |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Belongs to: template_phase, quality_check_template
- Has many: scheduled_activities

### Indexes

- Index: phase_id, activity_order, activity_type

---

## Table: quality_check_templates

**Purpose**: Quality inspection templates with AI integration

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Template name |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| procedure_type | String | No | visual/measurement/laboratory |
| inspection_level | String | No | batch/sample/individual |
| regulatory_requirement | Boolean | Yes | Required by regulation (default: false) |
| compliance_standard | String | No | INVIMA/ICA/FNC/etc. |
| template_structure | JSON | Yes | Form structure definition |
| ai_assisted | Boolean | Yes | AI analysis (default: false) |
| ai_analysis_types | Array[String] | Yes | Types of AI analysis |
| applicable_stages | Array[String] | Yes | Growth stages |
| frequency_recommendation | String | No | Recommended frequency |
| usage_count | Number | Yes | Times used (default: 0) |
| average_completion_time_minutes | Number | No | Average completion time |
| company_id | String | Yes | Foreign key → companies.id |
| created_by | String | No | Foreign key → users.id |
| status | String | Yes | active/archived |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: crop_type, company, user (creator)
- Has many: template_activities, scheduled_activities

### Indexes

- Index: company_id, crop_type_id, regulatory_requirement, status

---

# Production Operations Tables

## Table: production_orders

**Purpose**: Work orders for production runs with Colombian compliance

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| order_number | String | Yes | Unique order number |
| template_id | String | No | Foreign key → production_templates.id |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| cultivar_id | String | No | Foreign key → cultivars.id |
| order_type | String | Yes | seed-to-harvest/propagation/etc. |
| source_type | String | Yes | seed/clone/tissue_culture |
| requested_quantity | Number | Yes | Requested quantity |
| unit_of_measure | String | Yes | plants/kg/units |
| batch_size | Number | No | Batch size |
| enable_individual_tracking | Boolean | Yes | Individual tracking (default: false) |
| mother_plant_id | String | No | Foreign key → mother_plants.id |
| seed_inventory_id | String | No | Foreign key → inventory_items.id |
| supplier_id | String | No | Foreign key → suppliers.id |
| target_facility_id | String | Yes | Foreign key → facilities.id |
| target_area_id | String | No | Foreign key → areas.id |
| requested_delivery_date | DateTime | No | Requested date |
| planned_start_date | DateTime | No | Planned start |
| estimated_completion_date | DateTime | No | Estimated completion |
| actual_start_date | DateTime | No | Actual start |
| actual_completion_date | DateTime | No | Actual completion |
| transport_manifest_required | Boolean | Yes | Requires transport manifest (default: false) |
| phytosanitary_cert_required | Boolean | Yes | Requires phytosanitary cert (default: false) |
| regulatory_documentation | JSON | Yes | Compliance documentation (default: {}) |
| estimated_cost_cop | Decimal | No | Estimated cost in COP |
| actual_cost_cop | Decimal | No | Actual cost in COP |
| requested_by | String | Yes | Foreign key → users.id |
| approved_by | String | No | Foreign key → users.id |
| approval_date | DateTime | No | Approval timestamp |
| status | String | Yes | pendiente/aprobado/en_proceso/completado/cancelado |
| priority | String | Yes | low/normal/high/urgent (default: normal) |
| completion_percentage | Decimal | Yes | Completion % (default: 0) |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: production_template, crop_type, cultivar, mother_plant, inventory_item (seed), supplier, facility (target), users (requested/approved)
- Has many: scheduled_activities, batches

### Indexes

- Unique: order_number
- Index: template_id, status, priority, planned_start_date

---

## Table: scheduled_activities

**Purpose**: Planned activities for entities with recurring support

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| entity_type | String | Yes | batch/plant/area |
| entity_id | String | Yes | Foreign key to entity |
| activity_type | String | Yes | watering/feeding/pruning/etc. |
| activity_template_id | String | No | Foreign key → template_activities.id |
| production_order_id | String | No | Foreign key → production_orders.id |
| scheduled_date | DateTime | Yes | Scheduled date/time |
| estimated_duration_minutes | Number | No | Duration estimate |
| is_recurring | Boolean | Yes | Recurring activity (default: false) |
| recurring_pattern | String | No | daily/weekly/biweekly/etc. |
| recurring_end_date | DateTime | No | Recurrence end date |
| parent_recurring_id | String | No | Foreign key → scheduled_activities.id |
| assigned_to | String | No | Foreign key → users.id |
| assigned_team | Array[String] | Yes | User IDs assigned |
| required_materials | JSON | Yes | Materials needed (default: []) |
| required_equipment | JSON | Yes | Equipment needed (default: []) |
| quality_check_template_id | String | No | Foreign key → quality_check_templates.id |
| instructions | String | No | Activity instructions |
| activity_metadata | JSON | Yes | Additional metadata (default: {}) |
| status | String | Yes | pending/in_progress/completed/skipped/cancelled |
| actual_start_time | DateTime | No | Actual start |
| actual_end_time | DateTime | No | Actual end |
| completed_by | String | No | Completed by user |
| completion_notes | String | No | Completion notes |
| execution_results | JSON | No | Execution results |
| execution_variance | JSON | No | Planned vs actual variance |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: template_activity, production_order, user (assigned), scheduled_activity (parent recurring), quality_check_template
- Has many: scheduled_activities (child recurring), activities

### Indexes

- Index: entity_type, entity_id, status, scheduled_date

---

## Table: mother_plants

**Purpose**: Elite plants for cloning/propagation

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| qr_code | String | Yes | Unique QR code |
| facility_id | String | Yes | Foreign key → facilities.id |
| area_id | String | Yes | Foreign key → areas.id |
| cultivar_id | String | Yes | Foreign key → cultivars.id |
| name | String | No | Custom name |
| generation | Number | Yes | Generation number (default: 1) |
| source_type | String | No | seed/clone/tissue_culture |
| source_reference | String | No | Source reference |
| established_date | DateTime | Yes | Establishment date |
| last_clone_date | DateTime | No | Last clone date |
| retirement_date | DateTime | No | Retirement date |
| retirement_reason | String | No | Reason for retirement |
| total_clones_taken | Number | Yes | Clone count (default: 0) |
| successful_clones | Number | Yes | Successful clones (default: 0) |
| health_status | String | Yes | healthy/declining/diseased (default: healthy) |
| last_health_check | DateTime | No | Last health check |
| maintenance_notes | String | No | Maintenance notes |
| genetic_stability | String | No | Genetic stability assessment |
| phenotype_notes | String | No | Phenotype observations |
| plant_metrics | JSON | No | Height, vigor, etc. |
| status | String | Yes | active/retired/deceased |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: facility, area, cultivar
- Has many: production_orders, plants (derived)

### Indexes

- Unique: qr_code
- Index: facility_id, area_id, cultivar_id, status

---

## Table: batches

**Purpose**: Primary tracking entity for groups of plants/materials

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| qr_code | String | Yes | Unique QR code |
| facility_id | String | Yes | Foreign key → facilities.id |
| area_id | String | Yes | Foreign key → areas.id |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| cultivar_id | String | No | Foreign key → cultivars.id |
| production_order_id | String | No | Foreign key → production_orders.id |
| template_id | String | No | Foreign key → production_templates.id |
| source_batch_id | String | No | Foreign key → batches.id |
| batch_type | String | Yes | propagation/growth/harvest |
| tracking_level | String | Yes | batch/individual (default: batch) |
| individual_plant_tracking | Boolean | Yes | Individual tracking enabled (default: false) |
| planned_quantity | Number | Yes | Planned quantity |
| current_quantity | Number | Yes | Current quantity |
| initial_quantity | Number | Yes | Initial quantity |
| unit_of_measure | String | Yes | plants/kg/units |
| sample_size | Number | No | Sample size for QC |
| sample_frequency | String | No | QC frequency |
| created_date | DateTime | Yes | Creation date |
| planned_completion_date | DateTime | No | Planned completion |
| actual_completion_date | DateTime | No | Actual completion |
| quality_grade | String | No | A/B/C grade |
| quality_distribution | JSON | No | Quality distribution by grade |
| batch_metrics | JSON | No | Crop-specific metrics |
| environmental_history | JSON | Yes | Environmental data history (default: []) |
| supplier_id | String | No | Foreign key → suppliers.id |
| external_lot_number | String | No | Supplier lot number |
| received_date | DateTime | No | Received date |
| phytosanitary_certificate | String | No | Certificate reference |
| status | String | Yes | active/completed/harvested/destroyed/archived |
| priority | String | Yes | low/normal/high (default: normal) |
| notes | String | No | Additional notes |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: facility, area, crop_type, cultivar, production_order, production_template, batch (source), supplier
- Has many: batches (derived), plants, activities, inventory_items (derived)

### Indexes

- Unique: qr_code
- Index: facility_id, area_id, production_order_id, status

---

## Table: plants

**Purpose**: Individual plant tracking (when enabled)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| qr_code | String | Yes | Unique QR code |
| batch_id | String | Yes | Foreign key → batches.id |
| mother_plant_id | String | No | Foreign key → mother_plants.id |
| facility_id | String | Yes | Foreign key → facilities.id |
| area_id | String | Yes | Foreign key → areas.id |
| crop_type_id | String | Yes | Foreign key → crop_types.id |
| cultivar_id | String | No | Foreign key → cultivars.id |
| plant_stage | String | Yes | seedling/vegetative/flowering/harvest |
| sex | String | No | male/female/unknown |
| planted_date | DateTime | Yes | Planted date |
| stage_progression_dates | JSON | No | Stage transition dates |
| harvested_date | DateTime | No | Harvest date |
| destroyed_date | DateTime | No | Destruction date |
| destruction_reason | String | No | Reason for destruction |
| plant_metrics | JSON | No | Height, width, health, etc. |
| health_status | String | Yes | healthy/stressed/diseased (default: healthy) |
| last_inspection_date | DateTime | No | Last inspection |
| inspection_notes | String | No | Inspection notes |
| position_x | Decimal | No | X coordinate in area |
| position_y | Decimal | No | Y coordinate in area |
| container_id | String | No | Container/pot identifier |
| status | String | Yes | active/harvested/destroyed/archived |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: batch, mother_plant, facility, area, crop_type, cultivar
- Has many: activities

### Indexes

- Unique: qr_code
- Index: batch_id, facility_id, area_id, status

---

# Activity & Quality Tables

## Table: activities

**Purpose**: Executed activities with QR tracking and media attachments

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| entity_type | String | Yes | batch/plant/area |
| entity_id | String | Yes | Foreign key to entity |
| activity_type | String | Yes | watering/feeding/pruning/harvest/etc. |
| scheduled_activity_id | String | No | Foreign key → scheduled_activities.id |
| performed_by | String | Yes | Foreign key → users.id |
| timestamp | DateTime | Yes | Execution timestamp (default: now) |
| duration_minutes | Number | No | Actual duration |
| area_from | String | No | Foreign key → areas.id |
| area_to | String | No | Foreign key → areas.id |
| quantity_before | Number | No | Quantity before activity |
| quantity_after | Number | No | Quantity after activity |
| qr_scanned | String | No | QR code scanned |
| scan_timestamp | DateTime | No | Scan timestamp |
| materials_consumed | JSON | Yes | Materials used (default: []) |
| equipment_used | JSON | Yes | Equipment used (default: []) |
| quality_check_data | JSON | No | Quality check results |
| environmental_data | JSON | No | Temperature, humidity, etc. |
| photos | Array[String] | Yes | Photo file references |
| files | Array[String] | Yes | Other file references |
| media_metadata | JSON | No | Photo metadata |
| ai_assistance_data | JSON | No | AI analysis results |
| activity_metadata | JSON | Yes | Additional metadata (default: {}) |
| notes | String | No | Activity notes |
| created_at | DateTime | Yes | Creation timestamp |

### Relationships

- Belongs to: scheduled_activity, user (performed), areas (from/to)
- Can belong to: batch OR plant (polymorphic)

### Indexes

- Index: entity_type, entity_id, activity_type, timestamp

---

## Table: pest_disease_records

**Purpose**: Pest and disease detection incidents with AI support

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| facility_id | String | Yes | Foreign key → facilities.id |
| area_id | String | Yes | Foreign key → areas.id |
| entity_type | String | Yes | batch/plant/area |
| entity_id | String | Yes | Foreign key to entity |
| pest_disease_id | String | Yes | Foreign key → pest_diseases.id |
| detection_method | String | No | visual/ai/laboratory |
| confidence_level | String | No | low/medium/high |
| severity_level | String | No | low/medium/high/critical |
| affected_percentage | Decimal | No | % affected (0-100) |
| affected_plant_count | Number | No | Plant count affected |
| progression_stage | String | No | early/progressing/severe |
| detected_by | String | Yes | Foreign key → users.id |
| detection_date | DateTime | Yes | Detection timestamp (default: now) |
| ai_detection_data | JSON | No | AI detection results |
| environmental_conditions | JSON | No | Temp, humidity at detection |
| likely_causes | Array[String] | Yes | Likely cause factors |
| photos | Array[String] | Yes | Photo references |
| description | String | No | Description |
| immediate_action_taken | Boolean | Yes | Action taken (default: false) |
| immediate_actions | JSON | No | Actions taken |
| treatment_plan_id | String | No | Treatment plan reference |
| followup_required | Boolean | Yes | Followup needed (default: true) |
| scheduled_followup_date | DateTime | No | Followup date |
| resolution_status | String | Yes | active/monitoring/resolved (default: active) |
| resolution_date | DateTime | No | Resolution date |
| resolution_notes | String | No | Resolution notes |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: facility, area, pest_disease, user (detected)

### Indexes

- Index: facility_id, area_id, pest_disease_id, resolution_status

---

## Table: pest_diseases

**Purpose**: Colombian pest and disease database with AI training data

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| name | String | Yes | Common name (Spanish) |
| scientific_name | String | Yes | Scientific name |
| type | String | Yes | pest/disease/deficiency |
| category | String | Yes | insect/fungal/bacterial/viral/etc. |
| affected_crop_types | Array[String] | Yes | Affected crop types |
| colombian_regions | Array[String] | Yes | Colombian regions affected |
| seasonal_pattern | String | No | Seasonal occurrence pattern |
| identification_guide | String | No | How to identify |
| symptoms | JSON | No | Symptom descriptions |
| similar_conditions | Array[String] | Yes | Similar pests/diseases |
| ai_model_trained | Boolean | Yes | AI model available (default: false) |
| ai_detection_accuracy | Decimal | No | AI accuracy % |
| prevention_methods | JSON | No | Prevention strategies |
| treatment_options | JSON | No | Treatment options |
| economic_impact | String | No | Economic impact level |
| spread_rate | String | No | How fast it spreads |
| is_quarantinable | Boolean | Yes | Quarantine required (default: false) |
| regulatory_status | String | No | ICA/INVIMA status |
| status | String | Yes | active/archived |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Has many: pest_disease_records

### Indexes

- Index: type, category, affected_crop_types, status

### Common Colombian Pests

- **Araña roja** (Red spider mite)
- **Broca del café** (Coffee berry borer)
- **Trips** (Thrips)
- **Mosca blanca** (Whitefly)

---

# Media & Compliance Tables

## Table: media_files

**Purpose**: Photos, videos, documents with Colombian GPS data and AI analysis

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| filename | String | Yes | Stored filename |
| original_filename | String | Yes | Original filename |
| file_size_bytes | Number | Yes | File size |
| mime_type | String | Yes | MIME type |
| file_extension | String | Yes | File extension |
| storage_provider | String | Yes | minio/s3/convex |
| storage_path | String | Yes | Storage path |
| storage_bucket | String | Yes | Storage bucket |
| public_url | String | No | Public URL (if public) |
| gps_coordinates | JSON | No | GPS coordinates (MAGNA-SIRGAS) |
| location_taken | String | No | Location description |
| colombian_municipality | String | No | Municipality name |
| altitude_msnm | Number | No | Altitude in meters |
| resolution_width | Number | No | Image width |
| resolution_height | Number | No | Image height |
| duration_seconds | Number | No | Video duration |
| ai_analysis_performed | Boolean | Yes | AI analyzed (default: false) |
| ai_analysis_results | JSON | No | AI analysis results |
| associated_entity_type | String | No | batch/plant/facility |
| associated_entity_id | String | No | Foreign key to entity |
| activity_id | String | No | Foreign key → activities.id |
| tags | Array[String] | Yes | User tags |
| auto_generated_tags | Array[String] | Yes | AI-generated tags |
| category | String | No | photo/document/certificate |
| is_compliance_document | Boolean | Yes | Compliance doc (default: false) |
| regulatory_significance | String | No | INVIMA/ICA/FNC |
| retention_period_years | Number | No | Retention requirement |
| quality_score | Decimal | No | Image quality (0-100) |
| is_processed | Boolean | Yes | Processing complete (default: false) |
| processing_status | String | No | pending/processing/complete/error |
| visibility | String | Yes | public/private/company (default: private) |
| company_id | String | Yes | Foreign key → companies.id |
| uploaded_by | String | Yes | Foreign key → users.id |
| captured_at | DateTime | No | Capture timestamp |
| uploaded_at | DateTime | Yes | Upload timestamp |
| processed_at | DateTime | No | Processing timestamp |
| notes | String | No | Additional notes |
| status | String | Yes | active/archived/deleted |

### Relationships

- Belongs to: company, user (uploaded), activity

### Indexes

- Index: company_id, associated_entity_type, associated_entity_id, category, is_compliance_document

---

## Table: compliance_events

**Purpose**: Regulatory compliance tracking with Colombian authorities

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| event_type | String | Yes | inspection/violation/permit/audit |
| event_category | String | Yes | ica/invima/municipal/fnc |
| regulatory_authority | String | No | Authority name |
| regulation_reference | String | No | Regulation reference |
| compliance_requirement | String | No | Specific requirement |
| entity_type | String | Yes | company/facility/batch |
| entity_id | String | Yes | Foreign key to entity |
| company_id | String | Yes | Foreign key → companies.id |
| facility_id | String | No | Foreign key → facilities.id |
| title | String | Yes | Event title |
| description | String | Yes | Event description |
| severity | String | No | low/medium/high/critical |
| detected_by | String | No | Detection source |
| detected_by_user_id | String | No | Foreign key → users.id |
| detection_date | DateTime | Yes | Detection timestamp (default: now) |
| status | String | Yes | open/in_progress/resolved/closed |
| assigned_to | String | No | Foreign key → users.id |
| due_date | DateTime | No | Due date |
| resolution_date | DateTime | No | Resolution date |
| resolution_notes | String | No | Resolution notes |
| immediate_actions | JSON | No | Immediate actions taken |
| preventive_actions | JSON | No | Preventive measures |
| corrective_actions | JSON | No | Corrective actions |
| supporting_documents | Array[String] | Yes | Document references |
| photos | Array[String] | Yes | Photo references |
| requires_government_notification | Boolean | Yes | Notify government (default: false) |
| notification_sent | DateTime | No | Notification sent date |
| government_response | String | No | Government response |
| estimated_cost_cop | Decimal | No | Estimated cost |
| actual_cost_cop | Decimal | No | Actual cost |
| followup_required | Boolean | Yes | Followup needed (default: false) |
| followup_date | DateTime | No | Followup date |
| recurring_check_frequency | String | No | daily/weekly/monthly |
| created_by | String | No | Foreign key → users.id |
| updated_by | String | No | Foreign key → users.id |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |
| is_audit_locked | Boolean | Yes | Locked for audit (default: false) |
| audit_lock_reason | String | No | Lock reason |

### Relationships

- Belongs to: company, facility, users (detected/assigned/created)

### Indexes

- Index: company_id, facility_id, event_category, status, due_date

---

## Table: certificates

**Purpose**: License and certification management with expiry tracking

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | Primary key |
| certificate_number | String | Yes | Certificate number |
| certificate_name | String | Yes | Certificate name |
| certificate_type | String | Yes | license/certification/permit |
| issuing_authority | String | Yes | Issuing authority |
| issuer_accreditation | String | Yes | Accreditation details |
| applies_to_entity_type | String | Yes | company/facility/batch |
| applies_to_entity_id | String | Yes | Foreign key to entity |
| company_id | String | Yes | Foreign key → companies.id |
| colombian_authority | String | No | INVIMA/ICA/FNC/Municipal |
| national_registration | String | No | National registration number |
| issued_date | DateTime | Yes | Issue date |
| expiry_date | DateTime | Yes | Expiration date |
| is_renewable | Boolean | Yes | Can be renewed (default: true) |
| renewal_notice_days | Number | Yes | Days before renewal notice (default: 90) |
| scope_description | String | No | Scope description |
| conditions | JSON | No | Conditions/restrictions |
| standards_met | Array[String] | Yes | Standards met |
| certificate_document_url | String | No | Certificate file URL |
| supporting_documents | Array[String] | Yes | Supporting documents |
| verification_method | String | No | How to verify |
| verification_url | String | No | Verification URL |
| verification_code | String | No | Verification code |
| status | String | Yes | valid/expired/suspended/revoked |
| suspension_reason | String | No | Suspension reason |
| suspension_date | DateTime | No | Suspension date |
| reinstatement_date | DateTime | No | Reinstatement date |
| regulatory_weight | Number | No | Regulatory importance (1-10) |
| automatic_compliance_check | Boolean | Yes | Auto check compliance (default: true) |
| last_verification_date | DateTime | No | Last verification |
| next_verification_due | DateTime | No | Next verification date |
| renewal_notification_sent | DateTime | No | Renewal reminder sent |
| uploaded_by | String | No | Foreign key → users.id |
| verified_by | String | No | Foreign key → users.id |
| notes | String | No | Additional notes |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

### Relationships

- Belongs to: company, users (uploaded/verified)

### Indexes

- Unique: certificate_number
- Index: company_id, certificate_type, expiry_date, status

---

## Field Type Legend

| Type | Description | Examples |
|------|-------------|----------|
| String | Text | "Cannabis", "john@example.com" |
| Number | Integer | 50, 1000, 5 |
| Decimal | Decimal number | 19.5, 1250.75 |
| Boolean | True/False | true, false |
| DateTime | Date and time | "2025-01-15T10:30:00Z" |
| JSON | JSON object | {"temp": 25, "humidity": 60} |
| Array[String] | Array of strings | ["value1", "value2"] |

---

## Colombian-Specific Fields Summary

### Geographic Fields
- `dane_municipality_code` - DANE codes for all locations
- `colombian_department` - Department selection
- `altitude_msnm` - Altitude in meters above sea level
- GPS coordinates in MAGNA-SIRGAS system

### Business Fields
- `business_entity_type` - S.A.S, S.A., Ltda, E.U., Persona Natural
- `tax_id` - NIT format
- `camara_comercio_registration` - Chamber of Commerce
- `default_currency` - COP currency

### Compliance Fields
- `ica_registration_number` - ICA chemical registration
- `phytosanitary_certificate` - Transport requirements
- `regulatory_documentation` - Flexible compliance data
- `colombian_authority` - INVIMA/ICA/FNC/Municipal

---

## Implementation Notes

### Multi-Tenancy
All tables include `company_id` for tenant isolation. Always filter queries by `company_id` to ensure data separation.

### Batch-First Philosophy
The `batches` table is the **primary tracking entity**. Individual `plants` are optional and only enabled when regulatory compliance requires it (e.g., INVIMA cannabis tracking).

### Immutable Audit Trails
Activity logs and compliance events should never be deleted or modified after creation. Implement "soft deletes" or status changes instead.

### Colombian Compliance
5-year data retention required for compliance documents. Implement automatic archival and retention policies.

### JSON Field Usage
JSON fields provide flexibility for:
- Crop-specific characteristics
- Evolving regulatory requirements
- Multi-crop compatibility
- AI analysis results

---

## Next Steps

1. **Choose database technology** (PostgreSQL, Convex, etc.)
2. **Implement schema** using chosen technology
3. **Add indexes** for performance optimization
4. **Set up migrations** for schema changes
5. **Implement seed data** with Colombian sample data

**For feature requirements**, see [Product-Requirements.md]
**For technical implementation**, see [Technical-Specification.md]
