# Alquemist - Product Requirements Document

## Overview

**Alquemist** is a production management system for licensed cannabis cultivation facilities. It handles the complete lifecycle from facility setup through production execution, with AI-powered quality control and pest detection.

**Target Market**: Licensed cannabis producers in Colombia (initially), expandable to other regulated markets.

**Tech Stack**: Next.js (Frontend), Convex (Backend), Gemini Vision (AI)

---

## Modules by Phase

### Phase 1: Onboarding & Authentication

#### Module 1: User Registration & Email Verification
**Functional Requirements**:
- Email/password registration with 6-digit verification code
- Password strength validation
- Email uniqueness check
- 24-hour code expiration with resend capability
- Auto-login after verification

#### Module 1B: Invited User Acceptance
**Functional Requirements**:
- Accept invitation via unique link
- Pre-filled form with name/email (readonly email)
- Password creation for new account
- Auto-assignment to company, facility, and role

#### Module 2: Login & Session Management
**Functional Requirements**:
- Email/password authentication
- Session token generation and validation
- Last login tracking
- Secure logout with token invalidation

#### Module 3: Company Creation
**Functional Requirements**:
- Company name, legal name, NIT (unique)
- Geographic location (country, department, municipality)
- Contact information
- Auto-assign "basic" subscription plan (1 facility, 10 users)
- Creator assigned as COMPANY_OWNER

#### Module 4: Facility Setup
**Functional Requirements**:
- Facility name, license number (unique), license type
- Primary crop type (Cannabis, Hemp, Vegetables, Flowers, Other)
- Total area with units (m�, ft�)
- Facility type (Indoor/Outdoor/Greenhouse)
- Climate controlled flag, climate zone
- Geographic location
- **Sample Data Generation (Opt-in)**:
  - Checkbox to generate example data during onboarding (checked by default)
  - Generates areas, cultivars, suppliers, products, inventory, and production template
  - Data marked with "(Demo)" suffix for easy identification
  - Configurable per crop type (Cannabis implemented)

#### Module 5: Role Management
**Functional Requirements**:
- Roles: COMPANY_OWNER, FACILITY_MANAGER, PRODUCTION_OPERATOR
- Permission-based access control
- Role assignment during invitation
- Role editing by authorized users

#### Module 6: Context Persistence
**Functional Requirements**:
- Store and retrieve user's primary facility
- Persist facility selection across sessions

#### Module 7: Reference Data
**Functional Requirements**:
- Crop types master list
- Geographic locations (departments � municipalities)
- Cascading dropdowns for location selection

---

### Phase 2: Basic Setup & Master Data

#### Module 8: Area Management
**Functional Requirements**:
- Create areas within facility (Propagation, Vegetative, Flowering, etc.)
- Area name (unique per facility), type, total area, capacity
- Temperature and humidity ranges
- Compatible crop types
- Occupancy tracking (current/capacity)
- Edit and delete areas

#### Module 15: Cultivar Management
**Functional Requirements**:
- View system cultivars (read-only, shared globally)
- Link system cultivars to facility
- Create custom cultivars (facility-specific)
- Cultivar attributes: name, type (Indica/Sativa/Hybrid), genetics, flowering time, THC/CBD ranges
- Filter by crop type compatibility

#### Module 16: Supplier Management
**Functional Requirements**:
- Create suppliers with contact info
- Supplier type categorization
- Rating and notes
- Link suppliers to inventory items

#### Module 17: Team Management
**Functional Requirements**:
- Invite users by email with role and facility assignment
- View pending and active team members
- Resend invitations
- Edit user roles
- User limit per subscription plan

#### Module 18: Facility Management & Switcher
**Functional Requirements**:
- View and edit facility settings
- Switch between facilities (multi-facility users)
- Update primary facility on switch

#### Module 19: Inventory Management
**Functional Requirements**:
- Create inventory items with category, supplier, unit of measure
- Track current stock, reorder point, reorder quantity
- Manual stock adjustments with reason tracking
- Low stock alerts (stock < reorder point)
- Transaction history (consumption, adjustments)

#### Module 20: Facility Settings
**Functional Requirements**:
- Edit facility name, area, climate zone
- View/update license information
- Non-editable: facility ID, creation date, primary crop type

#### Module 21: Account Settings
**Functional Requirements**:
- Edit profile: name, phone, language, notifications
- Password change (requires current password)
- Email change (requires re-verification)

---

### Phase 3: Production Templates & AI

#### Module 22: Production Templates
**Functional Requirements**:
- Create template: name, description, cultivar, total duration, status
- Add phases: name, start/end day, primary area, order
- Add activities to phases with scheduling types:
  - **One-Time**: Specific day execution
  - **Recurring**: Daily, weekly, or custom interval
  - **Dependent**: Offset from another activity (before/after)
- Activity attributes: name, description, duration, assigned role, is_critical
- Link inventory items with estimated consumption per instance
- Activate/deactivate templates
- Duplicate templates
- View estimated total inventory consumption

#### Module 23: AI Quality Check Templates
**Functional Requirements**:
- Upload PDF/image of QC form (max 10MB)
- Gemini Vision analyzes and extracts fields:
  - Text fields, dropdowns, checkboxes, numbers, dates
- Generate HTML form from AI analysis
- Save QC template with field structure
- Link QC templates to activities (required or optional)

---

### Phase 4: Production Execution

#### Module 24: Production Orders
**Functional Requirements**:
- Create order from active template
- Order: name, area, start date, quantity (plants)
- Auto-schedule all activities based on template rules
- Calculate estimated end date
- Approval workflow (pending_approval � active)
- Approval by manager with timestamp
- Order lifecycle: draft � pending_approval � active � paused � completed
- Pause/resume orders with schedule adjustment
- Progress tracking (% activities completed)
- Capacity validation against area limits

#### Module 25: Activity Execution & Quality Control
**Functional Requirements**:
- Operator view: list assigned activities by date
- Activity states: pending � in_progress � completed (or overdue)
- Start activity (record timestamp)
- Complete activity with required QC form
- Upload photos during activity (max 10 per activity)
- AI pest/disease detection on photos:
  - Gemini Vision analysis
  - Create pest_disease_records on detection
  - Severity estimation (1-5)
  - Generate alerts for managers
- Auto-consume inventory on activity completion
- Create ad-hoc remediation activities
- Manager: reschedule activities with reason
- Overdue activity alerts
- Dependent activities auto-adjust on parent reschedule

---

## Non-Functional Requirements

### Performance
- Order creation with 100+ activities: < 5 seconds
- Activity list loading: < 2 seconds
- Photo AI analysis: < 15 seconds per image
- Dashboard widgets: real-time updates

### Security
- Password hashing (bcrypt or similar)
- Session tokens with expiration
- Role-based access control on all endpoints
- Input validation and sanitization
- No sensitive data in logs

### Scalability
- Support multiple concurrent orders per facility
- Support facilities with 500+ areas
- Support templates with 200+ activities

### Reliability
- Email delivery within 5 minutes
- Graceful handling of AI service failures
- Inventory transaction atomicity

### Usability
- Mobile-responsive UI
- Spanish language support (Colombia market)
- Clear error messages
- Loading states for async operations

### Compliance
- Audit trail for all production activities
- QC data retention for regulatory requirements
- Photo evidence storage
- Pest/disease tracking with remediation history

### Integration
- Gemini Vision API for AI features
- Email service (Resend) for notifications
- File storage for photos and documents

---

## Data Model Summary

### Core Entities
- `users`: Authentication, profile, company/facility assignments
- `companies`: Business entity with subscription
- `facilities`: Physical locations with licensing
- `areas`: Production zones within facilities
- `cultivars`: Plant varieties (system and custom)
- `suppliers`: Vendor management
- `inventory_items`: Stock tracking

### Production Entities
- `production_templates`: Reusable production blueprints
- `template_phases`: Stages within templates
- `template_activities`: Activity definitions with scheduling rules
- `production_orders`: Active production batches
- `scheduled_activities`: Instantiated activities for orders

### Quality & Tracking
- `quality_check_templates`: AI-generated form structures
- `quality_check_records`: Completed QC data
- `pest_disease_records`: Detection history
- `inventory_transactions`: Stock movements
- `media_files`: Photo and document storage

---

## Success Metrics

### Phase 1
- User registration � email verified � company created � facility active

### Phase 2
- 3+ areas, 5+ cultivars, 2+ suppliers, 5+ inventory items, team configured

### Phase 3
- 1+ active template, 3+ phases, 10+ activities, QC templates linked

### Phase 4
- Order created � approved � 30%+ activities completed � inventory consumed � order completed

---

## Version
- Document Version: 1.0
- Last Updated: 2025-12-02
