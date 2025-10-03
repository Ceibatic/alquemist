# Product PRD - Alquemist v4.0

**Development-Focused Specifications**

**Version**: 4.0

**Date**: January 2025

**Purpose**: Feature specifications and compliance requirements for development

---

## 📋 **FEATURE SPECIFICATIONS**

### **MODULE 1: AUTHENTICATION & ROLE MANAGEMENT**

### Core Requirements

- Multi-tenant authentication with company isolation
- Hierarchical role-based access control (6 predefined roles)
- Multi-factor authentication support
- Session management with configurable timeouts
- Bilingual support (Spanish/English) with locale persistence

### Business Rules

```
Roles Hierarchy (Spanish/English):
1. Administrador del Sistema / System Administrator
2. Propietario de Empresa / Company Owner
3. Gerente de Instalación / Facility Manager
4. Supervisor de Departamento / Department Supervisor
5. Técnico Líder / Lead Technician
6. Técnico / Technician

Scope Levels: sistema/system → empresa/company → instalación/facility → área/area

```

### Acceptance Criteria

- User registration with language preference selection
- Role assignment with scope-based permissions
- Automatic permission inheritance with override capability
- Account lockout after failed attempts with audit logging

---

### **MODULE 2: COMPANY SETUP & ONBOARDING**

### Core Requirements

- Colombian company registration with business entity support (S.A.S, S.A., Ltda., E.U.)
- 8-step guided setup wizard in Spanish/English
- Automatic workspace creation with intelligent defaults
- Setup progress persistence with resume capability

### Business Rules

```
Colombian Business Fields:
- NIT (Colombian Tax ID) with validation
- Razón Social (Legal business name)
- Cámara de Comercio registration
- Business classification (Agricultor, Transformador, Comercializador)
- Colombian address format (Departamento, Municipio)
- License verification and document upload

```

### Acceptance Criteria

- Complete company setup in 90 minutes average
- Automatic regulatory configuration based on business type
- Document upload with Colombian format validation
- Setup completion scoring with regulatory compliance weighting

---

### **MODULE 3: CROP TYPES & BASE CONFIGURATION**

### Core Requirements

- Extensible crop type system supporting cannabis, coffee, cocoa, flowers
- Regulatory compliance profiles per crop type
- Default production phases and area types per crop
- Environmental requirement specifications

### Business Rules

```
Supported Colombian Crops:
- Cannabis: Individual plant tracking (optional), INVIMA compliance
- Café: Batch tracking (default), FNC standards
- Cacao: Batch tracking, export quality standards
- Flores: Batch tracking, export certification requirements

Default Tracking Level: BATCH (not individual plant)
Individual tracking: OPTIONAL configuration per crop type

```

### Acceptance Criteria

- Pre-configured Colombian crop types with Spanish terminology
- Crop-specific compliance rule enforcement
- Multi-crop facility support with area compatibility
- Easy addition of new crop types without system changes

---

### **MODULE 4: FACILITIES & AREAS MANAGEMENT**

### Core Requirements

- Multi-crop facility management with Colombian geographic integration
- Area configuration with capacity calculations
- Real-time occupancy tracking and projections
- Environmental monitoring integration

### Business Rules

```
Colombian Integration:
- DANE municipality codes and geographic data
- IDEAM weather service integration
- Colombian coordinate system (MAGNA-SIRGAS)
- Altitude and climate zone classification

Area Types per Crop:
- Cannabis: propagacion, vegetativo, floracion, secado, curado
- Café: vivero, campo, beneficio, patio_secado, bodega
- Multi-crop area compatibility matrix

```

### Acceptance Criteria

- Facility registration with license verification
- Area capacity calculation with practical vs theoretical limits
- Real-time capacity monitoring with alerts
- Environmental data correlation with operations

---

### **MODULE 5: INVENTORY & SUPPLIER MANAGEMENT**

### Core Requirements

- Unified inventory across multiple crop types
- Automated consumption tracking from recipe execution
- Supplier management with Colombian business integration
- Multi-unit measurement support with Colombian standards

### Business Rules

```
Inventory States:
- quantity_available: Physical stock
- quantity_reserved: Reserved for scheduled activities
- quantity_committed: Committed to production orders
- quantity_truly_available: available - reserved - committed

Colombian Integration:
- COP currency as default
- ICA registration for agricultural chemicals
- INVIMA approval for cannabis inputs
- Colombian tax calculation (IVA)

```

### Acceptance Criteria

- Real-time inventory tracking with automatic consumption
- Supplier performance scoring and lead time tracking
- Recipe-based automatic material consumption
- Colombian regulatory compliance for agricultural inputs

---

### **MODULE 6: PRODUCTION TEMPLATES**

### Core Requirements

- Template-based production workflow system
- Drag-and-drop template builder with phases and activities
- Automated activity scheduling with dependency management
- Template versioning and performance analytics

### Business Rules

```
Template Structure:
- Template → Phases → Activities
- Timing: Absolute (specific dates) or Relative (days after)
- Dependencies: Sequential or parallel activity execution
- Resource Requirements: Materials, equipment, personnel

Colombian Templates:
- Cannabis Interior Colombia - Estándar (119 días)
- Café Colombiano Lavado Tradicional (1365 días)
- Pre-loaded with Colombian best practices

```

### Acceptance Criteria

- Visual template creation with Spanish interface
- Automatic activity generation from templates
- Resource availability validation during scheduling
- Template optimization recommendations based on performance

---

### **MODULE 7: QUALITY CHECK TEMPLATES + AI**

### Core Requirements

- AI-powered template generation from Spanish documents
- Dynamic quality forms with conditional logic
- Automated photo analysis for pest/disease detection
- Exportable compliance documentation (Excel, PDF)

### Business Rules

```
AI Features:
- Spanish OCR for form recognition (90% accuracy target)
- Pest detection for Colombian species (40+ trained species)
- Plant health assessment with confidence scoring
- Photo analysis with metadata extraction

Colombian Pest Database:
- Cannabis: Araña roja, Oidio, Trips, Mosca blanca
- Café: Broca del café, Roya del café, Cochinilla
- Treatment recommendations with local product availability

```

### Acceptance Criteria

- Photo/PDF upload with automatic template generation
- Dynamic forms that adapt based on responses
- AI confidence scoring with manual override capability
- Automated export in regulatory-compliant formats

---

### **MODULE 8: OPERATIONS REGISTRY (CORE)**

### Core Requirements

- Production order management with template integration
- Real-time activity execution tracking
- Batch lifecycle management (default tracking level)
- Mobile-optimized execution interface

### Business Rules

```
Tracking Levels:
- Default: BATCH TRACKING for all crops
- Optional: Individual plant tracking (cannabis compliance)
- Sample-based quality monitoring for batch operations

Production Flow:
1. Order Creation → Template Selection
2. Automatic Activity Scheduling
3. Mobile Execution with QR codes
4. Real-time Progress Tracking
5. Completion with Quality Verification

```

### Acceptance Criteria

- Template-based order creation with resource validation
- Mobile-first activity execution with offline capability
- QR code scanning for entity identification
- Real-time progress updates with batch status tracking

---

### **MODULE 9: AI ENGINE & INTELLIGENT SERVICES**

### Core Requirements

- Computer vision for pest/disease detection
- Spanish NLP for template generation
- Predictive analytics for harvest timing
- Performance optimization recommendations

### Business Rules

```
AI Models:
- Pest Detection: 90%+ accuracy for Colombian species
- Plant Health: 1-10 scoring with confidence intervals
- Harvest Prediction: 95% accuracy for timing
- Template Generation: 90% accuracy from Spanish forms

Colombian Training Data:
- Environmental conditions (altitude, climate)
- Crop varieties (local genetics)
- Pest/disease patterns (seasonal)
- Market timing (harvest windows)

```

### Acceptance Criteria

- Real-time photo analysis with <3 second response
- Spanish text processing with Colombian terminology
- Predictive models with accuracy tracking
- Treatment recommendations with local product integration

---

### **MODULE 10: COMPLIANCE & REPORTING**

### Core Requirements

- Automated Colombian regulatory compliance monitoring
- Real-time compliance status tracking
- Automatic report generation for regulatory submission
- Immutable audit trails for all operations

### Business Rules

```
Colombian Regulatory Framework:
- INVIMA: Cannabis regulations and individual tracking (when required)
- ICA: Agricultural chemical regulations
- Municipal: Local cultivation permits
- Environmental: Waste disposal regulations

Compliance Monitoring:
- Real-time violation detection
- Preventive action recommendations
- Automatic regulatory report generation
- Audit-ready documentation export

```

### Acceptance Criteria

- 100% regulatory requirement coverage for Colombian operations
- Real-time compliance dashboard with violation alerts
- Automated report generation in regulatory formats
- Complete audit trail preservation with legal compliance

---

### **MODULE 11: ANALYTICS & BUSINESS INTELLIGENCE**

### Core Requirements

- Real-time operational dashboards in Spanish/English
- Performance analytics across facilities and crop types
- Predictive analytics for planning and forecasting
- Industry benchmarking with Colombian data

### Business Rules

```
Analytics Scope:
- Operational: Yield, efficiency, resource utilization
- Financial: COP cost analysis, profitability tracking
- Predictive: Harvest timing, market demand, resource planning
- Benchmarking: Colombian industry averages per crop type

Colombian Integration:
- IDEAM weather data correlation
- FNC coffee market data
- Colombian seasonal pattern analysis
- COP currency formatting and calculations

```

### Acceptance Criteria

- Customizable dashboards with role-based access
- Real-time data updates with Colombian timezone
- Performance comparison across time periods and facilities
- Predictive recommendations with accuracy tracking

---

### **MODULE 12: MOBILE EXPERIENCE & MEDIA MANAGEMENT**

### Core Requirements

- Progressive Web App optimized for Colombian rural connectivity
- Offline capability with background synchronization
- Advanced media management with AI analysis
- QR code scanning for entity identification

### Business Rules

```
Mobile Optimization:
- Colombian rural internet patterns
- Touch-friendly Spanish interface
- Background sync when connectivity restored
- GPS tagging with Colombian coordinates

Media Management:
- High-quality photo capture and compression
- AI-powered photo analysis and tagging
- Batch upload with connectivity optimization
- Organized storage by activity type and date

```

### Acceptance Criteria

- Native app-like experience with offline functionality
- Photo capture with automatic analysis and tagging
- QR code scanning with offline validation
- Seamless synchronization upon connectivity restoration

---

### **MODULE 13: INTEGRATIONS & APIs**

### Core Requirements

- Comprehensive REST API with Spanish documentation
- Colombian agricultural equipment and IoT integration
- Laboratory testing integration for automated results
- Market data integration for business intelligence

### Business Rules

```
Integration Scope:
- APIs: Complete CRUD operations with Spanish documentation
- Equipment: MQTT/HTTP support for Colombian equipment brands
- Laboratories: Colombian testing lab result automation
- Market Data: Colombian commodity pricing and trends

API Standards:
- RESTful design with versioning
- OAuth 2.0 authentication
- Rate limiting adapted to Colombian infrastructure
- Webhook support for real-time notifications

```

### Acceptance Criteria

- Complete API coverage with bilingual documentation
- Real-time equipment data ingestion and monitoring
- Automatic lab result import with validation
- Colombian market data integration with alerts

---

## 🇨🇴 **COLOMBIAN COMPLIANCE REQUIREMENTS**

### **INVIMA Cannabis Regulations**

```
Mandatory Requirements:
- Individual plant tracking (when required by facility type)
- Seed-to-sale traceability with QR codes
- Waste documentation with destruction certificates
- Transport manifests for all cannabis movement
- Laboratory testing for potency and contaminants
- Real-time inventory reporting to authorities (future)

System Implementation:
- Optional individual plant tracking (default: batch)
- Automatic compliance data capture
- Real-time violation detection and alerts
- Audit-ready documentation export

```

### **ICA Agricultural Standards**

```
Mandatory Requirements:
- Agricultural chemical registration verification
- Application record keeping with dosage tracking
- Pest and disease monitoring documentation
- Organic certification compliance (when applicable)
- Export documentation for international sales

System Implementation:
- Automatic chemical registration validation
- Recipe-based application tracking
- Integrated pest monitoring with AI detection
- Organic compliance workflow support

```

### **Colombian Business Law Compliance**

```
Mandatory Requirements:
- NIT validation and business entity verification
- IVA calculation and tax compliance
- Colombian peso (COP) financial reporting
- Labor law compliance for agricultural workers
- Environmental regulation compliance

System Implementation:
- Automatic NIT validation during registration
- Built-in IVA calculation for all transactions
- COP currency support throughout platform
- Colombian business report formats

```

### **Municipal and Environmental Regulations**

```
Mandatory Requirements:
- Local cultivation permit verification
- Waste disposal documentation and tracking
- Water usage reporting (where applicable)
- Environmental impact monitoring
- Community compliance requirements

System Implementation:
- Municipal permit tracking and renewal alerts
- Comprehensive waste documentation system
- Environmental data correlation with operations
- Community impact reporting capabilities

```

---

## 🔄 **CROSS-MODULE DEPENDENCIES**

### **Data Flow Requirements**

```
Authentication → All modules (user context)
Company Setup → Facilities → Areas → Inventory
Crop Types → Templates → Orders → Operations
Quality Templates → Operations Registry → Compliance
AI Services → Quality Templates + Operations Registry
Mobile → Operations Registry + Media Management

```

### **Integration Requirements**

```
Real-time Synchronization:
- Inventory consumption from operations
- Compliance monitoring from all activities
- Analytics data from all operational modules
- Mobile synchronization with main platform

Batch Processing:
- Report generation from compliance module
- Analytics calculations from operational data
- AI model training from quality and operations data

```

### **Colombian Localization Requirements**

```
All Modules Must Support:
- Spanish/English language switching
- Colombian timezone (COT-5)
- Colombian peso (COP) currency
- Colombian date format (DD/MM/YYYY)
- Colombian phone number format
- DANE geographic data integration

```

---

## 📋 **TECHNICAL SPECIFICATIONS REFERENCE**

*For detailed technical implementation, see [Engineering PRD]*

*For complete data model, see [Database Schema]*