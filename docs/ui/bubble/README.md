# Alquemist UI Documentation - Bubble.io Implementation

## Overview

This directory contains comprehensive UI specifications for implementing Alquemist using Bubble.io, a no-code platform. The documentation is organized into phases that represent the implementation roadmap.

## Documentation Structure

### Core Patterns
- **[CRUD-PATTERN.md](CRUD-PATTERN.md)** - Standard CRUD pattern used across all modules
- **[DASHBOARD-HOME.md](DASHBOARD-HOME.md)** - Main dashboard and navigation

### Implementation Phases

The system is implemented in 5 progressive phases:

---

## Phase 1: Onboarding & Foundation

**File**: [PHASE-1-ONBOARDING.md](PHASE-1-ONBOARDING.md)

**Focus**: User authentication, company setup, initial facility configuration

**Modules**:
- MODULE 1: Authentication (Signup/Login)
- MODULE 2: Company Creation
- MODULE 3: Facility Creation & Basics
- MODULE 4: User Role Assignment
- MODULE 5: Dashboard Home (Read-only view)

**Key Features**:
- Custom authentication system (email/password)
- Multi-tenant setup (company → facilities)
- Role-based access control (Owner, Manager, Supervisor, Worker, Viewer)
- Initial dashboard with widgets

**User Roles Created**: COMPANY_OWNER, FACILITY_MANAGER

**Estimated Pages**: ~12 screens

---

## Phase 2: Basic Setup & Master Data

**Files**:
- [PHASE-2-BASIC-SETUP.md](PHASE-2-BASIC-SETUP.md) - Configuration and master data
- [PHASE-2-OPERATIONS.md](PHASE-2-OPERATIONS.md) - Legacy operations (being reorganized)

**Focus**: Configure essential master data for operations

### PHASE-2-BASIC-SETUP.md

**Modules**:
- MODULE 8: Area Management (Production zones)
- MODULE 15: Cultivar Management (Plant varieties)
- MODULE 16: Supplier Management (Vendor registry)
- MODULE 17: Other Crops Management (Non-primary crops)
- MODULE 18: Compliance Templates (Regulatory forms)
- **MODULE 19: Inventory Management** (NEW)
  - Living inventory (mother plants, seeds, clones)
  - Equipment (grow lights, sensors, tools)
  - Materials (nutrients, pesticides, growing media)
  - Consumables (labels, packaging)
  - Stock tracking, reorder points, consumption logging
- **MODULE 20: Facility Settings** (Facility configuration)
- **MODULE 21: Account Settings** (User preferences)

**Key Features**:
- Full CRUD for all master data entities
- Inventory categorization and stock management
- Multi-category inventory support
- Facility and account customization

**Estimated Pages**: ~21 screens

---

## Phase 3: Production Templates & AI

**File**: [PHASE-3-TEMPLATES.md](PHASE-3-TEMPLATES.md)

**Focus**: Create reusable production workflows and quality check templates with AI

**Modules**:
- **MODULE 22: Production Templates with Activity Scheduling**
  - Multi-phase production workflows
  - Activity scheduling types:
    - One-time (specific day)
    - Recurring (daily, weekly, every N days)
    - Dependent (after another activity)
  - Projected inventory requirements
  - Quality check template integration
  - Timeline visualization

- **MODULE 23: AI Quality Check Templates**
  - Upload PDF/image of existing forms
  - AI extracts form structure (fields, labels, types)
  - Create digital templates from extracted data
  - Store as HTML/JSON in database
  - Render dynamically in Bubble
  - Export to PDF/Excel

**Key Features**:
- Complex activity auto-scheduling logic (see [ACTIVITY-SCHEDULING-LOGIC.md](../../ACTIVITY-SCHEDULING-LOGIC.md))
- AI-powered document processing (see [AI-QUALITY-CHECKS.md](../../AI-QUALITY-CHECKS.md))
- Template versioning and duplication
- Pre-defined templates by crop type

**AI Integration**:
- OCR for text extraction (Google Cloud Vision API)
- NLP for field classification (OpenAI GPT-4 / Claude 3)
- Structured data generation

**Estimated Pages**: ~15 screens

---

## Phase 4: Production Execution

**File**: [PHASE-4-PRODUCTION.md](PHASE-4-PRODUCTION.md)

**Focus**: Create and execute production orders with real-time tracking

**Modules**:
- **MODULE 24: Production Orders with Auto-Scheduling**
  - Create orders from templates
  - Manager approval workflow
  - Area availability verification
  - Auto-schedule all activities based on start date
  - Phase progression tracking
  - Real-time progress monitoring
  - Overdue activity alerts

- **MODULE 25: Activity Execution with AI Detection**
  - Activity preview and start workflow
  - Multi-tab execution interface:
    - General data collection
    - Quality check form (dynamic rendering)
    - Photo upload with AI analysis
    - Finalization with signature
  - **AI Pest/Disease Detection**:
    - Upload photos during activity
    - AI analyzes for pests/diseases
    - Match against internal database
    - User confirms detections
    - Auto-create MIPE/MIRFE remediation activities
  - Progress tracking with auto-save
  - Completion with PDF report generation

**Key Features**:
- Complete activity lifecycle management
- AI-powered plant health monitoring
- Automatic remediation activity creation
- Photo evidence and documentation
- Digital signatures
- Real-time status updates

**AI Integration**:
- Computer vision for pest/disease detection
- Custom trained ML model or GPT-4 Vision
- Internal pest/disease database matching
- Severity assessment and urgency calculation

**Estimated Pages**: ~18 screens

---

## Phase 5: Advanced Features

**File**: [PHASE-5-ADVANCED.md](PHASE-5-ADVANCED.md)

**Focus**: Analytics, compliance, reporting, and integrations

**Modules**:
- MODULE 14: Compliance & Reporting
- MODULE 26: Analytics Dashboard
- MODULE 27: Mobile App Interface
- MODULE 28: Third-Party Integrations

**Key Features**:
- Advanced analytics and insights
- Regulatory compliance reports
- Business intelligence dashboards
- Mobile-optimized interfaces
- Integration with external systems

**Estimated Pages**: ~18 screens

---

## Supporting Documentation

### Activity Scheduling

**File**: [../../ACTIVITY-SCHEDULING-LOGIC.md](../../ACTIVITY-SCHEDULING-LOGIC.md)

Detailed specification of the auto-scheduling algorithm including:
- Scheduling types (one-time, recurring, dependent)
- Recurring patterns (daily, weekly, every N days, specific days of week)
- Phase dependency logic
- Complete scheduling algorithm
- Rescheduling and cascading updates
- Edge cases and validation
- API endpoints
- Testing scenarios

### AI Integration

**File**: [../../AI-QUALITY-CHECKS.md](../../AI-QUALITY-CHECKS.md)

Comprehensive guide to AI features:

**Part 1: Quality Check Template Extraction**
- Document upload and processing
- OCR text extraction
- AI structure analysis
- Field type detection
- User review and editing
- Template storage and rendering

**Part 2: Pest & Disease Detection**
- Photo upload during activities
- Image preprocessing
- AI analysis (custom ML model or GPT-4 Vision)
- Database matching
- User confirmation workflow
- Auto-remediation activity creation
- Pest/disease database schema
- ML model training guide

---

## Module Numbering

The system uses sequential module numbering across all phases:

| Module | Name | Phase | Status |
|--------|------|-------|--------|
| 1 | Authentication | 1 | Defined |
| 2 | Company Creation | 1 | Defined |
| 3 | Facility Creation | 1 | Defined |
| 4 | User Role Assignment | 1 | Defined |
| 5 | Dashboard Home | 1 | Defined |
| 6-7 | _(Reserved)_ | - | - |
| 8 | Area Management | 2 | Defined |
| 9-14 | _(Reserved)_ | - | - |
| 15 | Cultivar Management | 2 | Defined |
| 16 | Supplier Management | 2 | Defined |
| 17 | Other Crops | 2 | Defined |
| 18 | Compliance Templates | 2 | Defined |
| 19 | Inventory Management | 2 | **NEW** |
| 20 | Facility Settings | 2 | **NEW** |
| 21 | Account Settings | 2 | **NEW** |
| 22 | Production Templates | 3 | **NEW** |
| 23 | AI Quality Check Templates | 3 | **NEW** |
| 24 | Production Orders | 4 | **NEW** |
| 25 | Activity Execution | 4 | **NEW** |
| 26 | Analytics Dashboard | 5 | Planned |
| 27 | Mobile Interface | 5 | Planned |
| 28 | Integrations | 5 | Planned |

---

## Implementation Workflow

### Phase 1: Foundation (Weeks 1-2)
1. Set up Bubble application
2. Implement authentication system
3. Create company and facility setup flows
4. Configure user roles
5. Build basic dashboard

### Phase 2: Master Data (Weeks 3-4)
1. Implement CRUD pattern (use as template)
2. Build Areas, Cultivars, Suppliers modules
3. Complete Inventory Management (full CRUD)
4. Add Facility and Account Settings
5. Set up data relationships

### Phase 3: Templates (Weeks 5-7)
1. Build Production Template management
2. Implement activity scheduling configuration
3. Set up AI document upload flow
4. Integrate OCR and NLP services
5. Create Quality Check Template builder
6. Test AI extraction accuracy

### Phase 4: Production (Weeks 8-11)
1. Build Production Order creation
2. Implement auto-scheduling algorithm
3. Create activity list and calendar views
4. Build activity execution interface
5. Integrate AI pest/disease detection
6. Implement remediation auto-creation
7. Add photo upload and analysis
8. Create completion reports

### Phase 5: Advanced (Weeks 12-14)
1. Build analytics dashboard
2. Implement compliance reporting
3. Create mobile-optimized views
4. Set up third-party integrations
5. Add advanced insights

---

## API Integration

All UI pages interact with the Convex backend through API endpoints. See the corresponding API documentation:

- [Phase 1 Endpoints](../../api/PHASE-1-ENDPOINTS.md)
- [Phase 2 Endpoints](../../api/PHASE-2-ENDPOINTS.md)
- [Phase 3 Endpoints](../../api/PHASE-3-ENDPOINTS.md) _(update to PHASE-5-ENDPOINTS.md)_

---

## Design Patterns

### Standard CRUD Pattern

All master data modules follow the 4-component CRUD pattern:

1. **List Page**: Repeating group with search, filters, pagination
2. **Create Popup**: Form with validation, submit to API
3. **Detail Page**: Read-only view with tabs, edit button
4. **Edit Page/Popup**: Editable form, update API call

See [CRUD-PATTERN.md](CRUD-PATTERN.md) for detailed implementation guide.

### Common UI Elements

- **Breadcrumb Navigation**: `🏠 Home > Section > Page`
- **Action Buttons**: Primary action (blue), Secondary (gray), Danger (red)
- **Status Indicators**: Colors and icons (🟢✅ success, 🟡⏳ pending, 🔴❌ error)
- **Data Tables**: Sortable, filterable, with row actions
- **Forms**: Two-column layout for create/edit
- **Tabs**: Horizontal tabs for detail views

### Internationalization

All UI text supports **Spanish** (default) and **English**.

- See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for i18n approach
- See [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md) for Bubble-specific implementation

Translation tables are included at the end of each phase document.

---

## Bubble.io Specific Implementation

### Element Naming Conventions

- **Repeating Groups**: `rg_[entity]_list` (e.g., `rg_area_list`)
- **Inputs**: `input_[field_name]` (e.g., `input_area_name`)
- **Dropdowns**: `dropdown_[field_name]` (e.g., `dropdown_cultivar`)
- **Buttons**: `btn_[action]_[entity]` (e.g., `btn_create_area`)
- **Text Elements**: `text_[field_name]` (e.g., `text_area_name`)
- **Groups**: `group_[purpose]` (e.g., `group_activity_summary`)
- **Popups**: `popup_[action]_[entity]` (e.g., `popup_create_area`)

### Workflow Patterns

**Standard Create Workflow**:
```
1. User clicks "Create" button
2. Show popup with form
3. User fills form
4. Validate required fields
5. API call: call_create[Entity]
6. On success: hide popup, refresh list, show success message
7. On error: show error message
```

**Standard Edit Workflow**:
```
1. User clicks "Edit" button
2. Navigate to edit page OR show edit popup
3. Pre-populate form with current values
4. User modifies fields
5. Validate changes
6. API call: call_update[Entity]
7. On success: navigate back OR hide popup, refresh, show success
8. On error: show error message
```

### Data Sources

- **API Connector**: All Convex endpoints configured as API calls
- **Option Sets**: Used for enums (roles, statuses, categories)
- **Custom States**: Temporary data storage within pages

### Responsive Design

- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Collapsible sidebar, adjusted spacing
- **Mobile**: Bottom navigation, stacked layout

---

## Testing Checklist

### Phase 1
- [ ] User can sign up and log in
- [ ] User can create company and facility
- [ ] User roles are correctly assigned
- [ ] Dashboard loads with correct data

### Phase 2
- [ ] All master data CRUD operations work
- [ ] Inventory categories are correctly managed
- [ ] Stock tracking functions properly
- [ ] Settings pages save correctly

### Phase 3
- [ ] Production templates can be created
- [ ] Activities can be added with all scheduling types
- [ ] AI document upload and extraction works
- [ ] Quality check templates are generated correctly
- [ ] Templates can be duplicated

### Phase 4
- [ ] Production orders are created with auto-scheduling
- [ ] Manager approval workflow functions
- [ ] Activities display correctly in calendar
- [ ] Activity execution captures all data
- [ ] AI pest detection analyzes photos
- [ ] Remediation activities are auto-created
- [ ] Completion reports generate properly

### Phase 5
- [ ] Analytics display accurate data
- [ ] Compliance reports generate
- [ ] Mobile interface is responsive
- [ ] Integrations connect successfully

---

## Performance Considerations

### Optimization Strategies

1. **Pagination**: Limit repeating groups to 20-50 items, use pagination for larger lists
2. **Lazy Loading**: Load data only when needed (e.g., detail pages)
3. **Caching**: Cache frequently accessed data (user info, facility settings)
4. **Image Optimization**: Compress uploaded images, use thumbnails in lists
5. **Background Jobs**: Run AI analysis and auto-scheduling as async operations
6. **Debouncing**: Add delays to search inputs to reduce API calls

### Bubble.io Limits

- **API Workflow**: Max 10 concurrent workflows on free tier
- **Database**: Optimize searches with proper indexes
- **File Storage**: Compress images before upload
- **Workflow Units**: Monitor usage to avoid overages

---

## Security Best Practices

1. **Authentication**: Enforce secure password requirements
2. **Authorization**: Verify user roles before allowing actions
3. **Data Privacy**: Filter data by `currentFacilityId` to ensure multi-tenancy
4. **API Security**: Use API keys for Convex endpoints
5. **File Upload**: Validate file types and sizes
6. **XSS Prevention**: Sanitize user inputs, especially in rich text fields

---

## Related Documentation

### Core Documentation
- [Product Requirements](../../core/Product-Requirements.md)
- [Technical Specification](../../core/Technical-Specification.md)
- [Database Schema](../../database/SCHEMA.md)
- [API Integration](../../core/API-Integration.md)

### Implementation Guides
- [Bubble Implementation Guide](../../BUBBLE-IMPLEMENTATION-GUIDE.md)
- [Authentication Guide](../../foundation/Authentication-Guide.md)
- [Implementation Status](../../foundation/Implementation-Status.md)

### Development
- [Tech Stack](../../dev/Tech-Stack-Standard.md)
- [Agentic Dev Framework](../../dev/Agentic-Dev-Framework.md)

---

## Changelog

### November 2025 - Phase Reorganization
- **Reorganized from 3 phases to 5 phases**
- **Created PHASE-2-BASIC-SETUP.md**: Consolidated basic configuration
  - Added MODULE 19: Inventory Management (full CRUD)
  - Added MODULE 20: Facility Settings
  - Added MODULE 21: Account Settings
- **Created PHASE-3-TEMPLATES.md**: Production and QC templates
  - Added MODULE 22: Production Templates with Activity Scheduling
  - Added MODULE 23: AI Quality Check Templates
- **Created PHASE-4-PRODUCTION.md**: Production execution
  - Added MODULE 24: Production Orders with Auto-Scheduling
  - Added MODULE 25: Activity Execution with AI Detection
- **Renamed PHASE-3-ADVANCED.md to PHASE-5-ADVANCED.md**
- **Created supporting documentation**:
  - ACTIVITY-SCHEDULING-LOGIC.md
  - AI-QUALITY-CHECKS.md

---

## Quick Navigation

**Get Started**: [PHASE-1-ONBOARDING.md](PHASE-1-ONBOARDING.md)

**Core Patterns**: [CRUD-PATTERN.md](CRUD-PATTERN.md)

**Current Phase**: [PHASE-2-BASIC-SETUP.md](PHASE-2-BASIC-SETUP.md)

**Advanced Features**: [PHASE-5-ADVANCED.md](PHASE-5-ADVANCED.md)

---

For questions or clarifications, refer to the main project documentation or consult the development team.
