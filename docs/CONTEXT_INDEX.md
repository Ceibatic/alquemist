# Alquemist Context Index

*Lightweight references for just-in-time loading - Updated: January 2025*

## 📊 Module Status

### Completed
- **FOUNDATION** [COMPLETE] → Foundation phase complete

### Active
- **MODULE 1** [PLANNING] → Authentication & Company Setup

### Planned
- MODULE 2: Crop Types & Facilities → PRD: TBD
- MODULE 3: Inventory & Suppliers → PRD: TBD
- MODULE 4: Production Templates → PRD: TBD
- MODULE 5: Operations Registry → PRD: TBD
- MODULE 6: Quality Templates + AI → PRD: TBD
- MODULE 7: Compliance & Reporting → PRD: TBD
- MODULE 8: Mobile PWA & Offline → PRD: TBD
- MODULE 9: Analytics & BI → PRD: TBD
- MODULE 10: Integrations & APIs → PRD: TBD

## 🧩 Component Catalog (0 components)

*Components will be indexed here as they are built*

### UI Components (0)
*No components yet*

### Feature Components (0)
*No components yet*

### Layout Components (0)
*No components yet*

## 🔌 API Endpoints (0 endpoints)

*Endpoints will be indexed here as they are built*

### Authentication (0)
*No endpoints yet*

### Company Management (0)
*No endpoints yet*

## 🗄️ Database Models (26 models)

From [packages/database/prisma/schema.prisma](../packages/database/prisma/schema.prisma):

### Core System
- Company → Lines 16-78
- Role → Lines 80-103
- User → Lines 105-167

### Crop Configuration
- CropType → Lines 173-209
- Cultivar → Lines 211-247

### Facilities & Operations
- Facility → Lines 253-309
- Area → Lines 311-359

### Supply Chain
- Supplier → Lines 365-422
- Product → Lines 424-477
- InventoryItem → Lines 479-544

### Production & Templates
- Recipe → Lines 550-601
- ProductionTemplate → Lines 603-660
- TemplatePhase → Lines 662-691
- TemplateActivity → Lines 693-727
- QualityCheckTemplate → Lines 729-771

### Production Operations (Batch-First)
- ProductionOrder → Lines 777-851
- ScheduledActivity → Lines 853-914
- MotherPlant → Lines 916-967
- Batch → Lines 969-1041
- Plant → Lines 1043-1096

### Activity & Quality
- Activity → Lines 1102-1163
- PestDiseaseRecord → Lines 1165-1221
- PestDisease → Lines 1223-1266

### Media & Compliance
- MediaFile → Lines 1272-1342
- ComplianceEvent → Lines 1344-1420
- Certificate → Lines 1422-1491

## 📁 Files Created (0 files)

*Implementation log will track files as they are created*

## 🔍 JIT Retrieval Commands

Use these commands to load details on demand:

### Component Retrieval
```bash
@component get [name]        # Load full component spec
@component list [category]   # List components by category
@component search [keyword]  # Find components matching keyword
```

### Module Retrieval
```bash
@module current              # Current module full details
@module recall [X]           # Load archived module X summary
@module history              # List all modules (lightweight)
```

### File Retrieval
```bash
@file show [path]            # Load specific file contents
@file recent [N]             # Show last N created files
@file search [pattern]       # Find files matching pattern
```

### State Management
```bash
@state current               # Full current state
@compact [target]            # Trigger compaction
@update state                # Update PROJECT_STATE.md
```

## 📦 Archived Modules (0 archived)

*Completed modules will be archived here after integration*

---

**Context Size**: ~1,500 tokens
**Update Frequency**: After each module integration
**Compaction Status**: No compaction needed yet
