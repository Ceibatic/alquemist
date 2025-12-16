# DATABASE SCHEMA

**Single Source of Truth for All Tables, Fields, and Relationships**

This document defines the complete database structure for Alquemist. Each table includes field names, types, relationships, and purpose.

---

## CORE ENTITIES

### users
**Purpose**: User accounts with authentication and profile data

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| email | string | Unique email address |
| email_verified | boolean | Email verification status |
| email_verified_at | number | Timestamp when email was verified |
| password_hash | string | Bcrypt hashed password |
| firstName | string | User's first name |
| lastName | string | User's last name |
| phone | string? | Optional phone number |
| company_id | Id? | Reference to companies table |
| role_id | Id | Reference to roles table |
| timezone | string | User timezone (from municipality) |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: users → companies
- Many-to-one: users → roles

---

### companies
**Purpose**: Company/organization records

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| name | string | Company display name |
| legal_name | string? | Legal registered name |
| business_entity_type | string | S.A.S, S.A., Ltda, E.U., Persona Natural |
| company_type | string | cannabis, coffee, cocoa, flowers, mixed |
| nit | string? | Tax ID number (NIT in Colombia) |
| country | string | Country code (e.g., "CO") |
| department_code | string | Department/state code |
| municipality_code | string | Municipality/city code |
| primary_contact_phone | string? | Business phone |
| primary_contact_email | string? | Business email |
| subscription_plan | string | trial, starter, pro, enterprise |
| subscription_tier | string | Subscription tier level |
| max_facilities | number | Facility limit based on plan |
| max_users | number | User limit based on plan |
| subscription_start_date | number | When subscription started |
| subscription_end_date | number | When subscription expires |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- One-to-many: companies → users
- One-to-many: companies → facilities
- One-to-many: companies → suppliers

---

### roles
**Purpose**: User role definitions (RBAC)

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| role_name | string | COMPANY_OWNER, FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER, VIEWER |
| permissions | array | List of permission strings |
| created_at | number | Creation timestamp |

**Relationships**:
- One-to-many: roles → users

---

### emailVerificationTokens
**Purpose**: Email verification tokens for signup

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| user_id | Id | Reference to users table |
| email | string | Email being verified |
| token | string | Unique verification token |
| expires_at | number | Token expiration (24h from creation) |
| used | boolean | Whether token was used |
| verified_at | number? | When token was verified |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: emailVerificationTokens → users

---

### invitations
**Purpose**: User invitation tracking and acceptance for team member onboarding

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| email | string | Invited user email address |
| firstName | string | Invitee first name |
| lastName | string | Invitee last name |
| inviter_user_id | Id | User who sent the invitation |
| company_id | Id | Reference to companies table |
| role_id | Id | Pre-assigned role for invited user |
| facility_ids | array | Array of facility IDs user will have access to |
| token | string | Unique invitation token (UUID v4) |
| status | string | pending, accepted, expired, revoked, rejected |
| expires_at | number | Token expiration timestamp (72h from creation) |
| accepted_at | number? | When invitation was accepted (null if pending) |
| rejected_at | number? | When invitation was rejected (null if not rejected) |
| revoked_at | number? | When invitation was revoked by inviter (null if not revoked) |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: invitations → companies
- Many-to-one: invitations → users (inviter)
- Many-to-one: invitations → roles
- One-to-one: invitations → users (invitee, created after acceptance)

**Notes**:
- Invitation links are sent via email with unique token
- Tokens expire after 72 hours for security
- Invited users skip email verification (invitation link acts as verification)
- When accepted, a new user account is created and invitation status changes to "accepted"
- Resending an invitation generates a new token and invalidates the old one

---

## GEOGRAPHIC & REFERENCE DATA

### geographic_locations
**Purpose**: Colombian departments and municipalities (DANE codes)

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| country_code | string | Country code ("CO") |
| division_1_code | string? | Department code (e.g., "05" for Antioquia) |
| division_1_name | string? | Department name |
| division_2_code | string? | Municipality code (e.g., "05001" for Medellín) |
| division_2_name | string? | Municipality name |
| parent_division_1_code | string? | Parent department (for municipalities) |
| administrative_level | number | 1 = department, 2 = municipality |
| timezone | string | Timezone (e.g., "America/Bogota") |

**Relationships**:
- Hierarchical: departments → municipalities

---

### crop_types
**Purpose**: Available crop types (Cannabis, Coffee, Cocoa, Flowers)

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| name | string | Crop type name (Cannabis, Coffee, etc.) |
| display_name_es | string | Spanish display name |
| category | string | Crop category |
| default_units | string | Default measurement unit (kg, lb, etc.) |

**Relationships**:
- One-to-many: crop_types → cultivars
- Many-to-many: crop_types → facilities

---

### cultivars
**Purpose**: Crop varieties (strains, species) - **Company-scoped**

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | **Reference to companies (owner)** |
| crop_type_id | Id | Reference to crop_types |
| name | string | Cultivar name (e.g., "Blue Dream") |
| variety_type | string? | Indica, Sativa, Hybrid, etc. |
| genetic_lineage | string? | Parent genetics |
| supplier_id | Id? | Reference to suppliers |
| flowering_time_days | number? | Days to flower (cannabis) |
| thc_min | number? | Min THC % (cannabis) |
| thc_max | number? | Max THC % (cannabis) |
| cbd_min | number? | Min CBD % (cannabis) |
| cbd_max | number? | Max CBD % (cannabis) |
| performance_metrics | object | Yield/performance data (default: {}) |
| status | string | active, discontinued |
| notes | string? | Additional notes |
| created_at | number | Creation timestamp |
| updated_at | number? | Last update timestamp |

**Relationships**:
- Many-to-one: cultivars → companies
- Many-to-one: cultivars → crop_types
- Many-to-one: cultivars → suppliers (optional)

**Indexes**:
- by_company: company_id
- by_company_crop: company_id, crop_type_id
- by_status: status

---

## FACILITY & OPERATIONS

### facilities
**Purpose**: Physical cultivation locations

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| name | string | Facility display name |
| license_number | string | Government license number |
| license_type | string | commercial_growing, research, processing, other |
| primary_crop_type_ids | array | Array of crop_type IDs |
| address | string? | Street address |
| municipality_code | string | Municipality code |
| department_code | string | Department code |
| latitude | number? | GPS latitude |
| longitude | number? | GPS longitude |
| total_area_m2 | number | Total licensed area in square meters |
| climate_zone | string | tropical, subtropical, temperate |
| status | string | active, inactive, suspended |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: facilities → companies
- One-to-many: facilities → areas
- One-to-many: facilities → production_orders
- One-to-many: facilities → inventory_items

---

### areas
**Purpose**: Zones within facilities (propagation, vegetative, flowering, drying)

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| facility_id | Id | Reference to facilities |
| name | string | Area name (e.g., "Propagation Room") |
| area_type | string | propagation, vegetative, flowering, drying, processing, storage |
| compatible_crop_type_ids | array | Array of crop_type IDs |
| total_area_m2 | number? | Area size in square meters |
| capacity | number? | Max plants or batches |
| climate_controlled | boolean | Whether environment is controlled |
| environmental_specs | object? | { temp, humidity, light cycle } |
| status | string | active, maintenance, inactive |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: areas → facilities
- One-to-many: areas → batches (current location)
- One-to-many: areas → inventory_items

---

## INVENTORY & SUPPLIERS

### suppliers
**Purpose**: Input material suppliers

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| name | string | Supplier name |
| tax_id | string? | Supplier tax ID |
| product_categories | array | seeds, nutrients, pesticides, equipment, other |
| contact_name | string? | Contact person name |
| contact_email | string? | Contact email |
| contact_phone | string? | Contact phone |
| address | string? | Supplier address |
| status | string | active, inactive |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: suppliers → companies
- One-to-many: suppliers → products
- One-to-many: suppliers → inventory_items

---

### products
**Purpose**: Product catalog from suppliers

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| supplier_id | Id | Reference to suppliers |
| name | string | Product name |
| sku | string? | Product SKU/code |
| category | string | seeds, nutrients, pesticides, equipment, other |
| quantity_unit | string | L, kg, units, etc. |
| cost_per_unit | number? | Purchase cost |
| description | string? | Product details |

**Relationships**:
- Many-to-one: products → suppliers
- One-to-many: products → inventory_items

---

### inventory_items
**Purpose**: Stock tracking per area

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| product_id | Id | Reference to products |
| area_id | Id | Reference to areas |
| supplier_id | Id | Reference to suppliers |
| quantity_available | number | Current stock level |
| quantity_reserved | number | Reserved for scheduled activities |
| quantity_unit | string | L, kg, units, etc. |
| reorder_point | number | Minimum quantity before reorder alert |
| purchase_price | number? | Last purchase price |
| batch_number | string? | Lot/batch number from supplier |
| expiration_date | number? | Expiration timestamp |
| last_restocked_at | number? | Last restock timestamp |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: inventory_items → products
- Many-to-one: inventory_items → areas
- Many-to-one: inventory_items → suppliers

---

## PRODUCTION TEMPLATES

### production_templates
**Purpose**: Reusable production workflows

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| name | string | Template name |
| crop_type_id | Id | Reference to crop_types |
| cultivar_id | Id? | Optional specific cultivar |
| default_batch_size | number | Recommended batch size (plants) |
| enable_individual_tracking | boolean | Track individual plants vs. batch-only |
| description | string? | Template description |
| estimated_duration_days | number | Total duration estimate |
| environmental_requirements | object? | { tempMin, tempMax, humidityMin, humidityMax } |
| status | string | active, archived |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: production_templates → companies
- Many-to-one: production_templates → crop_types
- One-to-many: production_templates → template_phases
- One-to-many: production_templates → production_orders

---

### template_phases
**Purpose**: Phases within production templates

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| template_id | Id | Reference to production_templates |
| phase_name | string | Phase name (e.g., "Vegetative") |
| phase_order | number | Order in workflow (1, 2, 3...) |
| estimated_duration_days | number | Expected phase duration |
| area_type | string | propagation, vegetative, flowering, drying |
| required_conditions | object? | { temp, humidity, lightCycle } |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: template_phases → production_templates
- One-to-many: template_phases → template_activities

---

### template_activities
**Purpose**: Activities within template phases

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| phase_id | Id | Reference to template_phases |
| activity_name | string | Activity name (e.g., "Watering") |
| activity_order | number | Order within phase |
| activity_type | string | watering, feeding, pruning, inspection, treatment, other |
| is_recurring | boolean | Whether activity repeats |
| timing_configuration | object | { frequency, startDay } |
| required_materials | array? | [{ productId, quantityPerPlant, unit }] |
| instructions | string? | Step-by-step instructions |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: template_activities → template_phases

---

## PRODUCTION ORDERS & BATCHES

### production_orders
**Purpose**: Actual production runs from templates

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| order_number | string | Unique order number (e.g., "PO-2025-001") |
| template_id | Id | Reference to production_templates |
| company_id | Id | Reference to companies |
| facility_id | Id | Reference to facilities |
| requested_by | Id | Reference to users |
| status | string | draft, approved, en_proceso, completado, cancelled |
| start_date | number | Order start date |
| estimated_completion_date | number? | Expected completion |
| actual_completion_date | number? | Actual completion |
| notes | string? | Order notes |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: production_orders → production_templates
- Many-to-one: production_orders → facilities
- One-to-many: production_orders → batches
- One-to-many: production_orders → scheduled_activities

---

### batches
**Purpose**: Groups of plants tracked together

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| production_order_id | Id | Reference to production_orders |
| batch_qr_code | string | Unique QR code for scanning |
| cultivar_id | Id | Reference to cultivars |
| current_area_id | Id | Current location (reference to areas) |
| planned_quantity | number | Initial plant count |
| current_quantity | number | Current plant count |
| quantity_unit | string | plants, seedlings, clones |
| current_phase | string | propagation, vegetative, flowering, drying, completed |
| health_status | string | healthy, at_risk, diseased |
| start_date | number | Batch start date |
| harvest_date | number? | Harvest timestamp |
| harvested_quantity | number? | Final yield |
| harvested_quantity_unit | string? | kg, lb, units |
| quality_grade | string? | A, B, C grade |
| status | string | active, harvested, disposed, lost |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: batches → production_orders
- Many-to-one: batches → cultivars
- Many-to-one: batches → areas (current location)
- One-to-many: batches → activities
- One-to-many: batches → pest_disease_records

---

### scheduled_activities
**Purpose**: Auto-generated activities from templates

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| production_order_id | Id | Reference to production_orders |
| batch_id | Id | Reference to batches |
| template_activity_id | Id? | Reference to template_activities |
| activity_type | string | watering, feeding, pruning, inspection, etc. |
| scheduled_date | number | When activity should occur |
| assigned_to | Id? | Reference to users |
| status | string | pending, in_progress, completed, skipped, overdue |
| completed_at | number? | Actual completion timestamp |
| notes | string? | Activity notes |

**Relationships**:
- Many-to-one: scheduled_activities → production_orders
- Many-to-one: scheduled_activities → batches
- Many-to-one: scheduled_activities → users (assigned)

---

### activities
**Purpose**: Logged activity events (audit trail)

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| batch_id | Id | Reference to batches |
| production_order_id | Id? | Reference to production_orders |
| activity_type | string | watering, feeding, pruning, harvest, movement, quality_check, etc. |
| performed_by | Id | Reference to users |
| timestamp | number | When activity was performed |
| duration_minutes | number? | How long it took |
| area_id | Id? | Where activity occurred |
| materials_consumed | array? | [{ inventoryItemId, quantity, unit }] |
| observations | string? | Activity notes |
| quality_check_data | object? | QC check results |
| ai_assistance_data | object? | AI analysis results |
| photos | array? | Array of media_file IDs |
| qr_scanned | string? | QR code scanned for activity |
| location | object? | { lat, lng } GPS coordinates |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: activities → batches
- Many-to-one: activities → production_orders
- Many-to-one: activities → users (performed by)
- Many-to-one: activities → areas

---

## QUALITY CONTROL

### quality_check_templates
**Purpose**: Reusable QC procedures

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| name | string | QC template name |
| crop_type_id | Id | Reference to crop_types |
| procedure_type | string | visual, measurement, laboratory, ai_assisted |
| inspection_level | string | batch, individual_plant, area |
| regulatory_requirement | boolean | Whether required by regulation |
| template_structure | object | { criteria: [{ name, type, description }] } |
| ai_assisted | boolean | Whether AI analysis is used |
| ai_analysis_types | array? | pest_detection, disease_detection, etc. |
| applicable_stages | array | [vegetative, flowering, drying] |
| frequency_recommendation | string | daily, weekly, as_needed |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: quality_check_templates → companies
- Many-to-one: quality_check_templates → crop_types

---

### pest_diseases
**Purpose**: Reference library of pests and diseases

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| name | string | Pest/disease name |
| category | string | pest, disease, deficiency |
| crop_type_ids | array | Applicable crop types |
| symptoms | array | List of visual symptoms |
| treatment_recommendations | array | Recommended treatments |
| prevention_methods | array | Prevention strategies |

**Relationships**:
- One-to-many: pest_diseases → pest_disease_records

---

### pest_disease_records
**Purpose**: Logged pest/disease detections

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| batch_id | Id | Reference to batches |
| pest_disease_id | Id? | Reference to pest_diseases |
| detection_date | number | When detected |
| severity | string | light, moderate, severe |
| area_affected | number? | Percentage of batch affected |
| treatment_applied | string? | Treatment description |
| treatment_date | number? | When treatment was applied |
| resolution_date | number? | When resolved |
| status | string | active, treated, resolved |
| detected_by | Id | Reference to users |
| ai_detected | boolean | Whether AI detected it |
| confidence_score | number? | AI confidence (0-100) |

**Relationships**:
- Many-to-one: pest_disease_records → batches
- Many-to-one: pest_disease_records → pest_diseases
- Many-to-one: pest_disease_records → users (detected by)

---

## COMPLIANCE & MEDIA

### compliance_events
**Purpose**: Track regulatory events and deadlines

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| facility_id | Id | Reference to facilities |
| event_type | string | inspection, permit, report, audit, violation |
| event_category | string | ica, invima, environmental, tax, other |
| title | string | Event title |
| description | string? | Event details |
| due_date | number? | Deadline timestamp |
| completion_date | number? | When completed |
| status | string | pending, in_progress, completed, overdue |
| assigned_to | Id? | Reference to users |
| severity | string | low, medium, high, critical |
| documents | array? | Array of media_file IDs |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: compliance_events → facilities
- Many-to-one: compliance_events → users (assigned)

---

### certificates
**Purpose**: Licenses, permits, certifications

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| facility_id | Id | Reference to facilities |
| certificate_name | string | Certificate name |
| certificate_type | string | license, permit, certification |
| issuing_authority | string | Who issued it |
| certificate_number | string? | Certificate number |
| issued_date | number | Issue timestamp |
| expiry_date | number? | Expiration timestamp |
| is_renewable | boolean | Whether can be renewed |
| renewal_notice_days | number? | Days before expiry to notify |
| document_url | string? | Link to certificate file |
| status | string | valid, expiring_soon, expired, revoked |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: certificates → facilities

---

### media_files
**Purpose**: Photos, documents, files

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| url | string | File URL (cloud storage) |
| thumbnail_url | string? | Thumbnail URL for images |
| filename | string | Original filename |
| file_type | string | image, document, video, audio |
| mime_type | string | MIME type (e.g., image/jpeg) |
| file_size | number | File size in bytes |
| category | string | quality_check, pest, harvest, license, compliance_report, other |
| entity_type | string? | batch, facility, company, activity |
| entity_id | Id? | Reference to related entity |
| caption | string? | Image caption |
| uploaded_by | Id | Reference to users |
| uploaded_at | number | Upload timestamp |
| location | object? | { lat, lng } where photo was taken |
| ai_analysis_available | boolean | Whether AI analyzed it |
| ai_analysis_results | object? | AI analysis data |

**Relationships**:
- Many-to-one: media_files → users (uploaded by)
- Polymorphic: media_files → batches/facilities/companies/activities

---

## INTEGRATIONS

### integrations
**Purpose**: Third-party API connections

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| name | string | Integration name |
| integration_type | string | supplier, analytics, lab, distributor, other |
| status | string | active, paused, error, disconnected |
| config | object | { apiKey, apiUrl, dataToSync, syncFrequency, syncTime } |
| last_sync | number? | Last successful sync timestamp |
| next_sync | number? | Next scheduled sync |
| sync_frequency | string | realtime, hourly, daily, weekly |
| error_message | string? | Last error message |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Relationships**:
- Many-to-one: integrations → companies
- One-to-many: integrations → integration_logs

---

### integration_logs
**Purpose**: Track sync history

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| integration_id | Id | Reference to integrations |
| timestamp | number | Sync timestamp |
| action | string | sync, webhook_received, api_call |
| status | string | success, partial_failure, failure |
| records_synced | number? | Number of records synced |
| records_failed | number? | Number of failed records |
| duration | number? | Sync duration in ms |
| error | string? | Error message if failed |

**Relationships**:
- Many-to-one: integration_logs → integrations

---

### webhook_subscriptions
**Purpose**: Webhook endpoints for external systems

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| webhook_url | string | External webhook URL |
| events | array | [batch_completed, low_stock, harvest_recorded, etc.] |
| secret | string | Webhook signing secret |
| status | string | active, paused, failed |
| last_triggered | number? | Last webhook trigger |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: webhook_subscriptions → companies

---

### api_keys
**Purpose**: API keys for public API access

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| company_id | Id | Reference to companies |
| key_prefix | string | First 8 chars of key (for display) |
| key_hash | string | Hashed API key |
| name | string | Key name/description |
| permissions | array | List of allowed endpoints |
| rate_limit | number | Requests per hour |
| last_used | number? | Last usage timestamp |
| expires_at | number? | Expiration timestamp |
| status | string | active, revoked, expired |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: api_keys → companies

---

## PLATFORM ADMINISTRATION

### ai_providers
**Purpose**: AI provider configurations for dynamic model switching

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| provider_name | string | "gemini" \| "claude" \| "openai" |
| display_name | string | Display name for UI |
| is_active | boolean | Whether provider is available |
| is_default | boolean | Default provider for AI calls |
| api_key_configured | boolean | Whether API key is set in env |
| api_endpoint | string? | Custom API endpoint |
| default_model | string | Default model to use |
| available_models | array | List of available models |
| default_temperature | number | Temperature (0-2) |
| default_top_k | number? | Top K for sampling |
| default_top_p | number | Top P (nucleus sampling) |
| default_max_tokens | number | Max output tokens |
| supports_vision | boolean | Whether supports image analysis |
| supports_function_calling | boolean? | Whether supports function calling |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Indexes**:
- by_provider: provider_name
- by_is_default: is_default
- by_is_active: is_active

---

### ai_prompts
**Purpose**: Configurable system prompts for AI features

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| prompt_key | string | Unique identifier (e.g., "template_extraction") |
| display_name | string | Display name for UI |
| description | string? | Description of prompt purpose |
| system_prompt | string | System prompt content |
| user_prompt_template | string? | User prompt template |
| feature_type | string | "quality_check" \| "pest_detection" |
| is_active | boolean | Whether prompt is active |
| version | number | Prompt version number |
| updated_by | Id? | Reference to users (who last updated) |
| created_at | number | Creation timestamp |
| updated_at | number | Last update timestamp |

**Indexes**:
- by_key: prompt_key
- by_feature: feature_type
- by_is_active: is_active

---

### audit_logs
**Purpose**: Audit trail for platform admin actions

| Field | Type | Description |
|-------|------|-------------|
| _id | Id | Convex auto-generated ID |
| action_type | string | Type of action performed |
| entity_type | string | Type of entity affected |
| entity_id | string? | ID of affected entity |
| performed_by | Id | Reference to users |
| previous_value | any? | Value before change |
| new_value | any? | Value after change |
| description | string | Human-readable description |
| ip_address | string? | IP address of request |
| user_agent | string? | User agent string |
| created_at | number | Creation timestamp |

**Relationships**:
- Many-to-one: audit_logs → users (performed by)

**Indexes**:
- by_action_type: action_type
- by_entity: entity_type, entity_id
- by_performer: performed_by
- by_created_at: created_at

---

## RELATIONSHIPS SUMMARY

```
companies
  ├── users (one-to-many)
  ├── facilities (one-to-many)
  ├── suppliers (one-to-many)
  ├── production_templates (one-to-many)
  └── integrations (one-to-many)

facilities
  ├── areas (one-to-many)
  ├── production_orders (one-to-many)
  ├── inventory_items (one-to-many)
  ├── compliance_events (one-to-many)
  └── certificates (one-to-many)

production_templates
  ├── template_phases (one-to-many)
  │   └── template_activities (one-to-many)
  └── production_orders (one-to-many)

production_orders
  ├── batches (one-to-many)
  ├── scheduled_activities (one-to-many)
  └── activities (one-to-many)

batches
  ├── activities (one-to-many)
  ├── pest_disease_records (one-to-many)
  └── current_area (many-to-one → areas)

suppliers
  ├── products (one-to-many)
  └── inventory_items (one-to-many)
```

---

## INDEXES (For Performance)

Recommended indexes for common queries:

- `users`: email (unique)
- `companies`: nit (unique)
- `facilities`: license_number (unique)
- `batches`: batch_qr_code (unique)
- `production_orders`: order_number (unique)
- `activities`: batch_id, timestamp
- `inventory_items`: area_id, quantity_available
- `scheduled_activities`: batch_id, scheduled_date, status

---

**Status**: Complete database schema definition
**Usage**: Reference this document when implementing API endpoints and UI features
**Updates**: Update this file when adding new tables or fields
