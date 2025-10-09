# Product Requirements - Alquemist

**Multi-Crop Agriculture Platform**

**Version**: 1.0
**Date**: January 2025

---

## Document Overview

This document defines **what** we're building and **why** it matters to users. Each module provides:
- Clear feature descriptions
- User stories from cultivator perspective
- Success metrics
- Dependencies

**For technical implementation**, see [Technical-Specification.md]
**For data models**, see [Database-Schema.md]

---

## Product Vision

Alquemist is a multi-crop agriculture platform providing **batch-first tracking**, **AI-powered features**, and **automated compliance** to achieve 400%+ ROI for cultivators.

### Core Differentiators

- **Batch-first design** - Scalable, not plant-by-plant overhead
- **Regional regulatory compliance** - Configurable for different markets
- **AI features** - Pest detection and form digitization
- **Multilingual** - Default Spanish, extensible to other languages

### User Onboarding Flow

```
1. Sign Up → 2. Email Verification → 3. Plan Selection & Payment →
4. First Facility Setup → 5. Crop Type Selection →
6. Sample Data Generation → 7. Dashboard Ready
```

**Time to value:** <15 minutes from signup to working dashboard

---

# PHASE 1: Onboarding Modules

## MODULE 1: Authentication & Account Creation

### Overview
User registration with regional business entity support. Creates company account with owner user in single flow.

### Key Features
- Sign up with minimal fields: name, email, password, company name, business type, region, locality
- Regional business entity types (configurable, e.g., S.A.S, S.A., Ltda, E.U., Persona Natural for Colombia)
- Automatic company workspace creation
- Owner role assignment
- Regional geographic data integration (administrative divisions)

### User Stories

**As a Cultivator:**
- I want to sign up quickly with minimal information
- I want to select my business entity type from relevant options
- I want to use my region and locality from a list
- I want my account created immediately without complex forms

### Regional Requirements (Colombia Default)
- Business entity types: S.A.S, S.A., Ltda, E.U., Persona Natural (extensible)
- Region and locality dropdowns with administrative codes (DANE for Colombia)
- Spanish as default language (multilingual support)
- Phone number format validation (configurable by region)
- Default currency configurable (COP for Colombia)

### Success Metrics
- Registration completion rate: >85%
- Average signup time: <3 minutes
- Form abandonment rate: <15%

### Dependencies
- Requires: PostgreSQL/Database, regional geographic data
- Integrates with: Email service

---

## MODULE 2: Email Verification

### Overview
Email confirmation system to verify user accounts before platform access.

### Key Features
- Verification email sent immediately after registration
- Temporary holding page with resend option
- Email verification link with token
- Automatic account activation on confirmation
- Link expiration (24 hours)

### User Stories

**As a New User:**
- I want to receive verification email immediately
- I want to resend email if not received
- I want clear instructions in my language
- I want to be directed to next step after confirmation

### Regional Requirements
- Multilingual email templates (default: Spanish)
- Time zone configurable for expiration display
- SMS backup option (future enhancement)

### Success Metrics
- Email delivery rate: >98%
- Verification completion rate: >80%
- Average verification time: <5 minutes

### Dependencies
- Requires: Module 1 (Authentication)
- Integrates with: Email service provider

---

## MODULE 3: Subscription & Payments

### Overview
Payment system with regional payment method support. Users select plan, pay monthly in advance via local payment methods.

### Key Features
- 4 plans: Trial (free 30 days), Starter, Professional, Enterprise
- Payment integration (regional payment methods configurable)
- Manual monthly renewal with automated reminders (7-day and 1-day)
- Usage tracking against plan limits
- Regional invoice generation (tax compliant)
- Payment history and receipts
- Plan upgrade/downgrade
- Grace period handling (3 days past due)

### User Stories

**As a Company Owner:**
- I want to start with free trial without credit card
- I want to pay monthly using local payment methods
- I want to receive reminders before subscription expires
- I want to upgrade plan when my business grows
- I want to download invoices for accounting

### Regional Requirements (Colombia Example)
- Payment methods: PSE, credit/debit cards, Nequi, Bancolombia, Daviplata (extensible)
- Currency: Multi-currency support (COP default: $290.000)
- Tax: Configurable tax calculation (IVA 19% in Colombia)
- Invoices: Electronic format compliant with regional regulations (DIAN in Colombia)
- Tax ID requirement for enterprise invoices (RUT in Colombia)

### Plan Details

| Plan | Price/Month | Facilities | Users | Crop Types | AI Features | Activities/Month |
|------|------------|------------|-------|------------|-------------|------------------|
| Trial | Free | 1 | 3 | 1 | ❌ | 100 |
| Starter | $290.000 COP | 1 | 5 | 2 | Pest Detection | 500 |
| Professional | $890.000 COP | 3 | 15 | Unlimited | Full AI Suite | Unlimited |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Custom + API | Unlimited |

### Success Metrics
- Trial to paid conversion: >25%
- Payment success rate: >90%
- Monthly renewal rate: >80%
- Average time to first payment: <5 minutes

### Dependencies
- Requires: Module 1 (Authentication), Module 2 (Email Verification)
- Integrates with: Payment provider API, Email service

---

## MODULE 4: Company Profile Completion

### Overview
Post-onboarding company profile configuration. Users complete legal, contact, and compliance information from settings page.

### Key Features
- Legal business information (Tax ID, legal name, registration)
- Contact information (phone, address details)
- License information (INVIMA, ICA, local permits)
- Compliance certifications upload
- Multi-factor authentication setup
- Billing information for invoices
- Team member invitation

### User Stories

**As a Company Owner:**
- I want to complete my profile when ready, not during signup
- I want to upload my licenses for compliance tracking
- I want to add billing information for proper invoices
- I want to invite team members with specific roles

### Regional Requirements (Colombia Example)
- Tax ID validation and format (NIT in Colombia)
- Business registration fields (Cámara de Comercio in Colombia)
- Regional address format (nomenclature in Colombia)
- License types: Cannabis (INVIMA), Agricultural (ICA), municipal
- RUT upload for invoicing

### Success Metrics
- Profile completion rate within 7 days: >70%
- License upload rate: >60%
- Average time to complete: <15 minutes

### Dependencies
- Requires: Module 1 (Authentication), Module 3 (Subscription)
- Integrates with: File storage

---

## MODULE 5: Facility Creation

### Overview
First facility setup during onboarding. User provides basic facility information and receives sample data to explore platform immediately.

### Key Features
- Facility creation with minimal required fields
- License number assignment
- Regional geographic location
- Facility type selection (indoor, outdoor, greenhouse, mixed)
- Area calculations (total, canopy, cultivation)
- Climate monitoring enablement
- Sample areas auto-generated based on crop type

### User Stories

**As a Company Owner:**
- I want to create my first facility quickly
- I want to specify my location accurately from regional data
- I want sample areas created automatically
- I want to start using the platform immediately

### Regional Requirements (Colombia Example)
- Administrative divisions (departments and municipalities in Colombia)
- Regional administrative codes (e.g., DANE in Colombia)
- Altitude in MSNM (meters above sea level)
- Regional license format validation (configurable)
- Weather station integration (e.g., IDEAM in Colombia)

### Success Metrics
- Facility creation completion: >95%
- Average creation time: <5 minutes
- Sample data satisfaction: >80%

### Dependencies
- Requires: Module 3 (Subscription), Module 4 (Company Profile)
- Integrates with: Regional geographic database, Weather data API (e.g., IDEAM in Colombia)

---

## MODULE 6: Crop Type Selection

### Overview
User selects primary crop type(s) for their facility during onboarding. System loads crop-specific configurations, compliance profiles, and sample data.

### Key Features
- Pre-configured crop types (Cannabis, Coffee, Cocoa, Flowers)
- Crop-specific compliance profiles
- Default production phases per crop
- Environmental requirements configuration
- Multi-crop facility support
- Batch-first tracking as default (individual optional)

### User Stories

**As a Company Owner:**
- I want to select cannabis and coffee for my facility
- I want compliance automatically configured for my crops
- I want production phases pre-loaded
- I want to add more crop types later as I expand

### Regional Requirements (Colombia Example)
- Cannabis: Regulatory compliance (e.g., INVIMA in Colombia), individual tracking optional
- Coffee: Quality standards (e.g., FNC in Colombia), batch tracking default
- Cocoa: Export quality standards
- Flowers: Export certification requirements
- Regional terminology configurable (default: Spanish)

### Success Metrics
- Crop type selection: 100% (required step)
- Multi-crop selection rate: >30%
- Compliance profile accuracy: 100%

### Dependencies
- Requires: Module 5 (Facility Creation)
- Integrates with: Crop configuration database

---

## MODULE 7: Area Setup with Sample Data

### Overview
Automatic generation of sample cultivation areas based on selected crop type(s). Provides realistic working environment for immediate platform exploration.

### Key Features
- Auto-generated areas for selected crop types
- Pre-configured capacity calculations
- Sample environmental specifications
- Equipment lists per area type
- Area compatibility matrix for multi-crop
- Mobile-friendly area management

### User Stories

**As a New User:**
- I want to see realistic sample areas for my crops
- I want to understand how areas are structured
- I want to customize areas later when ready
- I want to see capacity calculations working

**Example Sample Areas Generated:**
- **Cannabis**: Propagation room, Vegetative room, Flowering room, Drying room, Curing room
- **Coffee**: Nursery, Field section 1, Processing area, Drying patio, Storage

### Regional Requirements (Colombia Example)
- Regional area naming conventions (customizable)
- Metric system (m², MSNM)
- Regional equipment brands in sample data (configurable)
- Local construction standards reference

### Success Metrics
- Sample area satisfaction: >85%
- Area customization rate: >50% within 30 days
- Zero configuration errors

### Dependencies
- Requires: Module 6 (Crop Type Selection)
- Integrates with: Area configuration engine

---

## MODULE 8: Cultivars & Suppliers Setup

### Overview
Sample cultivars and suppliers pre-loaded for selected crop types. Users can immediately create production orders or customize later.

### Key Features
- Pre-configured regional cultivars per crop type
- Sample suppliers with local addresses
- Product catalog with local currency pricing
- Initial inventory items for demonstrations
- Regional genetic sources
- Supplier performance tracking setup

### User Stories

**As a New User:**
- I want to see realistic cultivar options for my crops
- I want sample suppliers with local addresses in my region
- I want to understand product categorization
- I want to start production planning immediately

**Example Sample Data (Colombia Default):**
- **Cannabis Cultivars**: White Widow, OG Kush (with regional genetics info)
- **Coffee Cultivars**: Castillo, Cenicafé 1, Tabi
- **Sample Suppliers**: Regional nutrients companies, local equipment distributors

### Regional Requirements (Colombia Example)
- Regional supplier business entity types (configurable)
- Regional addresses with administrative codes (e.g., DANE in Colombia)
- Local currency pricing (e.g., COP in Colombia)
- Agricultural chemical registration (e.g., ICA in Colombia)
- Regional cultivar naming conventions

### Success Metrics
- Sample data satisfaction: >80%
- Custom cultivar addition rate: >40% within 30 days
- Custom supplier addition rate: >50% within 30 days

### Dependencies
- Requires: Module 6 (Crop Type Selection), Module 7 (Area Setup)
- Integrates with: Product catalog, Supplier database

---

# PHASE 2: Core Operations Modules

## MODULE 9: Inventory Management

### Overview
Unified inventory system across multiple crop types with automated consumption tracking.

### Key Features
- Multi-crop unified inventory
- Real-time quantity tracking (available, reserved, committed)
- Automatic consumption from recipe execution
- Batch and lot tracking
- Regional supplier management
- Agricultural chemical registration tracking (configurable)
- Expiration date monitoring
- Reorder point alerts
- Local currency cost tracking

### User Stories

**As a Facility Manager:**
- I want to see all inventory across crops in one place
- I want automatic deductions when activities are performed
- I want alerts when inventory runs low
- I want to track costs in local currency for accounting

### Regional Requirements (Colombia Example)
- Chemical registration validation (e.g., ICA in Colombia)
- Regional supplier data with tax ID (e.g., NIT in Colombia)
- Local currency for all pricing (e.g., COP in Colombia)
- Regional product categories (configurable)
- Weight/volume in metric units

### Success Metrics
- Inventory accuracy: >98%
- Automated consumption accuracy: >95%
- Stockout prevention: >90%
- Average time to record inventory: <2 minutes

### Dependencies
- Requires: Module 8 (Suppliers), Module 5 (Facility/Areas)
- Integrates with: Production operations, Recipe system

---

## MODULE 10: Production Templates

### Overview
Template-based production workflow system. Pre-configured templates for regional crops with automatic activity scheduling.

### Key Features
- Visual template builder with phases and activities
- Pre-loaded regional crop templates
- Automatic activity scheduling with dependencies
- Resource requirement specification
- Batch-first design (50-1000+ plant batches)
- Template versioning and cloning
- Performance analytics per template
- Recipe integration for nutrients
- Regional best practices built-in (configurable)

### User Stories

**As a Production Manager:**
- I want to use proven templates for regional cannabis cultivation
- I want activities automatically scheduled when I create production order
- I want to customize templates for my specific operation
- I want to see which templates perform best

### Regional Requirements (Colombia Example)
- Templates for regional climate conditions (configurable)
- Multilingual activity names and instructions (default: Spanish)
- Regional growing cycles and timing
- Integration with regional compliance requirements
- Regulatory-compliant workflows (e.g., INVIMA for cannabis in Colombia)

### Success Metrics
- Template usage rate: >80% of production orders
- Activity completion rate from templates: >95%
- Average time to create production order with template: <5 minutes
- Template optimization (user modifications): <10%

### Dependencies
- Requires: Module 6 (Crop Types), Module 9 (Inventory)
- Integrates with: Module 11 (Quality Templates), Module 12 (Production Orders)

---

## MODULE 11: Quality Check Templates + AI

### Overview
AI-powered quality control system with template generation from multilingual documents. Regional pest/disease detection.

### Key Features
- AI template generation from photos/PDFs of regional forms
- Dynamic quality check forms with conditional logic
- Photo-based pest/disease detection (40+ regional species)
- Batch-level health assessment with confidence scoring
- Automated quality grading and distribution
- Export to Excel/PDF for compliance
- Regional compliance documentation
- Performance tracking against quality standards

### User Stories

**As a Quality Manager:**
- I want to upload my existing quality forms and have them digitized automatically
- I want AI to help detect pests early before they spread
- I want to assess batch health with photo analysis
- I want automated compliance documentation for regulatory agencies

**As a Field Technician:**
- I want to complete quality checks on mobile
- I want AI to tell me if there are pests in my photos
- I want simple yes/no questions, not complex forms

### Regional Requirements (Colombia Example)
- Multilingual OCR and form recognition (default: Spanish)
- Regional pest database (e.g., Araña roja, Broca del café in Colombia)
- Regional disease identification
- Treatment recommendations with local products
- Compliance export formats for regulatory agencies (e.g., INVIMA/ICA in Colombia)

### Success Metrics
- Template generation accuracy: >90%
- Pest detection accuracy: >90%
- Quality check completion time reduction: >50%
- Early pest detection rate: >80%

### Dependencies
- Requires: Module 10 (Production Templates), Module 12 (Operations)
- Integrates with: AI Engine, File storage

---

## MODULE 12: Production Orders & Operations

### Overview
Core operations management with batch-first tracking. Template-based production orders with mobile execution and real-time progress tracking.

### Key Features
- Template-based production order creation
- Batch lifecycle management (default tracking)
- Optional individual plant tracking (compliance)
- Automated activity scheduling from templates
- Mobile-optimized execution interface
- QR code entity identification
- Real-time inventory consumption
- Environmental data logging
- Photo documentation per activity
- Progress tracking and variance reporting

### User Stories

**As a Production Manager:**
- I want to create production order from template in minutes
- I want to track batches of 50-100 plants, not individual plants
- I want to see real-time progress across all orders
- I want inventory automatically deducted when activities complete

**As a Field Technician:**
- I want to scan QR codes to start activities
- I want simple mobile interface for logging work
- I want to take photos as documentation
- I want to complete work offline if internet drops

### Regional Requirements (Colombia Example)
- Batch-first default (scalable for regional operations)
- Individual plant tracking when regulations require (e.g., INVIMA in Colombia)
- Regional timezone for all timestamps (configurable)
- Multilingual mobile interface (default: Spanish)
- Offline capability for rural areas

### Success Metrics
- Order creation time with template: <5 minutes
- Activity completion accuracy: >98%
- Mobile adoption rate: >90%
- Offline functionality success: >95%
- Inventory accuracy after automation: >98%

### Dependencies
- Requires: Module 10 (Templates), Module 9 (Inventory), Module 11 (Quality)
- Integrates with: Module 13 (AI), Mobile/Media features

---

## MODULE 13: AI Engine & Intelligent Services

### Overview
Computer vision and NLP services trained on regional agricultural data.

### Key Features
- Pest/disease detection (40+ regional species trained)
- Plant health scoring (1-10 scale with confidence)
- Multilingual OCR for form digitization (default: Spanish)
- Photo analysis and automatic tagging
- Harvest timing prediction
- Treatment recommendations with local products
- Performance optimization suggestions
- Regional seasonal pattern analysis

### User Stories

**As a Cultivator:**
- I want AI to detect pests before I see them with naked eye
- I want to know if my batch is healthy by taking photos
- I want harvest timing predictions to maximize quality
- I want treatment recommendations with products I can buy locally

### Regional Requirements (Colombia Example)
- Training data from regional operations (extensible)
- Regional pest/disease species (e.g., Colombia database)
- Multilingual text processing (default: Spanish)
- Regional product database for recommendations
- Altitude and climate zone considerations
- Regional seasonal patterns

### Success Metrics
- Pest detection accuracy: >90%
- Plant health assessment correlation with expert: >85%
- OCR accuracy for regional forms: >90%
- Harvest prediction accuracy (±3 days): >85%
- Treatment recommendation adoption rate: >70%

### Dependencies
- Requires: Module 11 (Quality Templates), Module 12 (Operations)
- Integrates with: File storage, External AI APIs

---

# PHASE 3: Advanced Features Modules

## MODULE 14: Compliance & Reporting

### Overview
Automated regional regulatory compliance monitoring with real-time tracking and report generation.

### Key Features
- Cannabis regulatory compliance automation (configurable)
- Agricultural chemical tracking
- Quality standards monitoring (configurable)
- Municipal permit monitoring
- Automatic violation detection
- Preventive action recommendations
- Compliance report generation
- Immutable audit trails
- License expiration alerts
- Waste tracking and documentation

### User Stories

**As a Compliance Officer:**
- I want automatic tracking of all regulatory requirements
- I want alerts before violations occur
- I want one-click report generation for regulatory inspections
- I want complete audit trail for all operations

### Regional Requirements (Colombia Example)
- Cannabis seed-to-sale tracking (e.g., INVIMA when required)
- Agricultural chemical application documentation (e.g., ICA in Colombia)
- Quality certification standards (e.g., FNC coffee in Colombia)
- Municipal waste disposal compliance
- Transport manifest generation
- Laboratory test result tracking
- Electronic reporting to regulatory agencies

### Success Metrics
- Compliance coverage: 100% of regional requirements
- Violation prevention rate: >95%
- Report generation time: <5 minutes
- Audit readiness: 100% at any time

### Dependencies
- Requires: Module 12 (Operations), Module 4 (Company Profile)
- Integrates with: Regional regulatory APIs (future), File storage

---

## MODULE 15: Analytics & Business Intelligence

### Overview
Real-time operational dashboards and predictive analytics for regional agricultural operations.

### Key Features
- Customizable dashboards by role
- Operational KPIs (yield, efficiency, cost per unit)
- Financial analytics in local currency
- Predictive harvest timing
- Resource utilization tracking
- Regional industry benchmarking
- Multi-facility comparison
- Export to Excel/PDF
- Regional seasonal pattern analysis
- Weather correlation with regional data

### User Stories

**As a Company Owner:**
- I want to see profitability across all facilities
- I want to compare my yields to regional industry averages
- I want to predict harvest timing for market planning
- I want cost analysis in local currency for accounting

**As a Facility Manager:**
- I want to see real-time operational metrics
- I want to identify bottlenecks in production
- I want to optimize resource allocation

### Regional Requirements (Colombia Example)
- Local currency formatting (e.g., COP in Colombia)
- Regional timezone for all date displays (configurable)
- Multilingual terminology for all metrics (default: Spanish)
- Regional industry benchmarks (configurable)
- Weather data integration (e.g., IDEAM in Colombia)
- Market data when available (e.g., FNC coffee in Colombia)

### Success Metrics
- Dashboard daily active usage: >70%
- Report generation frequency: >10 per month per facility
- Decision-making time reduction: >30%
- Predictive accuracy for harvest: >85%

### Dependencies
- Requires: Module 12 (Operations), Module 9 (Inventory)
- Integrates with: Regional weather API (e.g., IDEAM in Colombia), Regional market data sources

---

## MODULE 16: Mobile Experience & Media Management

### Overview
Progressive Web App optimized for regional rural connectivity with offline capability.

### Key Features
- Native app-like PWA experience
- Offline capability with background sync
- High-quality photo capture and compression
- AI-powered photo analysis and tagging
- QR code scanning for entities
- GPS tagging with regional coordinates
- Touch-optimized multilingual interface
- Rural connectivity optimization
- Batch photo upload
- Organized media library

### User Stories

**As a Field Technician:**
- I want to work offline when internet is poor
- I want to take photos that automatically sync later
- I want QR code scanning to be fast and reliable
- I want AI to tell me about problems in photos

### Regional Requirements (Colombia Example)
- Optimization for regional rural networks (3G)
- Regional GPS coordinate systems (e.g., MAGNA-SIRGAS in Colombia)
- Regional timezone for all timestamps (configurable)
- Multilingual voice commands (future, default: Spanish)
- Messaging integration for notifications (future, e.g., WhatsApp)

### Success Metrics
- PWA installation rate: >60%
- Offline usage rate: >40%
- Photo upload success rate: >95%
- QR scan success rate: >98%

### Dependencies
- Requires: Module 12 (Operations), Module 13 (AI)
- Integrates with: File storage, Regional GPS services

---

## MODULE 17: Integrations & APIs

### Overview
REST API and integrations for regional agricultural equipment, laboratories, and market data.

### Key Features
- RESTful API with multilingual documentation
- OAuth 2.0 authentication
- Webhook support for real-time notifications
- Regional equipment IoT integration (MQTT/HTTP)
- Laboratory test result automation
- Regional market data integration
- Rate limiting adapted to regional infrastructure
- Comprehensive API documentation
- Sandbox environment for testing

### User Stories

**As a Developer/Integrator:**
- I want to integrate our equipment with Alquemist
- I want to automatically import lab results
- I want to build custom reports with API data
- I want documentation in my language

**As a Laboratory:**
- I want to send test results automatically to customer accounts
- I want secure API authentication
- I want to support regional regulatory formats

### Regional Requirements (Colombia Example)
- Multilingual API documentation (default: Spanish/English)
- Regional equipment brand compatibility
- Regional laboratory formats (e.g., INVIMA, ICA in Colombia)
- Regional market data sources
- Local currency in all API responses (e.g., COP in Colombia)
- Regional timezone handling (configurable)

### Success Metrics
- API uptime: >99.5%
- Integration setup time: <4 hours
- API adoption rate: >20% of professional+ customers
- Laboratory integration success rate: >90%

### Dependencies
- Requires: Module 1 (Authentication), Module 12 (Operations)
- Integrates with: External equipment, labs, market data providers

---

## Module Dependency Map

```
Authentication (1) → Email Verification (2) → Subscription (3) →
Company Profile (4) → Facility (5) → Crop Types (6) →
Areas (7) → Cultivars/Suppliers (8) →
[Inventory (9), Templates (10), Quality (11)] →
Operations (12) + AI (13) →
[Compliance (14), Analytics (15), Mobile (16), APIs (17)]
```

---

## Regional Compliance Cross-Reference (Colombia Example)

### Cannabis Regulatory Agency (e.g., INVIMA in Colombia)
- **Modules**: 6 (Crop Config), 12 (Operations), 14 (Compliance)
- **Requirements**: Individual tracking (optional), seed-to-sale, waste docs, transport manifests

### Agricultural Regulatory Agency (e.g., ICA in Colombia)
- **Modules**: 9 (Inventory), 12 (Operations), 14 (Compliance)
- **Requirements**: Chemical registration, application records, pest monitoring

### Quality Standards Organization (e.g., FNC Coffee in Colombia)
- **Modules**: 6 (Crop Config), 11 (Quality), 14 (Compliance)
- **Requirements**: Quality scoring, organic certification, export docs

### Municipal Regulations
- **Modules**: 4 (Company), 5 (Facility), 14 (Compliance)
- **Requirements**: Local permits, waste disposal, water usage

---

## Success Metrics Summary

### Business Goals
- Monthly recurring revenue: Target $100M COP (Colombia) by month 12
- Customer retention: >85% after 6 months
- Net promoter score: >50

### Product Goals
- User activation (complete onboarding): >80%
- Weekly active users: >70% of paid subscribers
- Support ticket volume: <2 per customer per month
- Feature adoption (AI): >60% within 3 months

### Regional Market Goals (Colombia Initial Target)
- Market share in regional cannabis: >25% by year 2
- Regional supplier partnerships: >50 by year 1
- Government API integrations: Regional agencies (e.g., INVIMA + ICA in Colombia) by year 2
