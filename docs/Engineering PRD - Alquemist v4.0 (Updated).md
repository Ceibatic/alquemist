# Engineering PRD - Alquemist v4.0 (Enhanced)
**Technical Implementation Specifications & Architecture**

**Version**: 4.0  
**Date**: January 2025  
**Purpose**: Complete technical architecture and implementation strategy

*📋 For feature specifications, see [Product PRD]*  
*🗄️ For data models, see [Database Schema]*  
*🚀 For setup instructions, see [Development Setup Guide]*

---

## 📋 **EXECUTIVE SUMMARY**

This Enhanced Engineering PRD provides:

### **🏗️ Complete Technical Architecture**
- **Production-ready stack** (Next.js 14, Fastify, PostgreSQL, Redis)
- **Multi-tenant architecture** with row-level security
- **Batch-first tracking** optimized for scalability
- **AI integration** for pest detection and quality assessment

### **🇨🇴 Colombian Market Optimization**
- **Localization** (Spanish/English, COP currency, Bogota timezone)
- **Regulatory compliance** (INVIMA, ICA, FNC frameworks)
- **Colombian infrastructure** (GCP regions, CDN optimization)
- **Agricultural patterns** (seasonal crops, rural connectivity)

### **☁️ Cloud-Native Deployment**
- **Google Cloud Platform** (Cloud Run, Cloud SQL, Storage)
- **CI/CD pipeline** (GitHub Actions, Cloud Build)
- **Auto-scaling** and load balancing
- **Monitoring & alerting** (Cloud Monitoring, Logging)

### **🔒 Security & Performance**
- **Enterprise-grade security** (Lucia Auth, MFA, RBAC)
- **Performance targets** (<1s API, <3s mobile on 3G)
- **Data protection** (encryption at rest/transit, audit trails)
- **Colombian compliance** (data residency, GDPR-like requirements)

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js PWA          Mobile Apps         Admin Dashboard   │
│  (React 18+)          (PWA Offline)       (React 18+)        │
└─────────────────┬───────────────────┬─────────────────────┬─┘
                  │                   │                     │
                  ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Caddy Reverse Proxy (HTTPS, Load Balancing, Rate Limiting) │
└─────────────────┬───────────────────┬─────────────────────┬─┘
                  │                   │                     │
                  ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Fastify API          Background Jobs      AI Services      │
│  (REST + WebSocket)   (BullMQ + Redis)    (Python/Node)     │
└─────────────────┬───────────────────┬─────────────────────┬─┘
                  │                   │                     │
                  ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+       Redis 7+           MinIO/GCS          │
│  (Primary DB)         (Cache/Queue)      (File Storage)     │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

#### **Frontend Stack**
```typescript
Framework: Next.js 14 (App Router)
Language: TypeScript 5+
UI Library: Tailwind CSS 3+ + Headless UI
State Management: Zustand (lightweight, performant)
Forms: React Hook Form + Zod validation
Internationalization: next-intl (Spanish/English)
PWA: next-pwa (offline support)
Icons: Lucide React
Charts: Recharts
Maps: Leaflet (Colombian maps)
```

#### **Backend Stack**
```typescript
Runtime: Node.js 20+ LTS
Framework: Fastify 4+ (performance over Express)
Language: TypeScript 5+
ORM: Prisma (type-safe, excellent DX)
Validation: Zod (shared with frontend)
Auth: Lucia v3 (simple, secure, modern)
Jobs: BullMQ + Redis
File Upload: Multer + Sharp (image processing)
API Docs: FastifySwagger (OpenAPI 3.0)
```

#### **Database & Storage**
```sql
Primary Database: PostgreSQL 15+ (Cloud SQL in production)
  - Extensions: uuid-ossp, pg_trgm, btree_gin, pgcrypto
  - Collation: es_CO.UTF-8
  - Timezone: America/Bogota

Cache: Redis 7+ (Memorystore in production)
  - Session storage
  - Job queues (BullMQ)
  - Rate limiting
  - Pub/Sub for real-time features

Search: PostgreSQL Full Text Search (Spanish config)
  - Avoid ElasticSearch complexity
  - Native Spanish stemming
  - GIN indexes for performance

File Storage: 
  - Development: MinIO (S3-compatible)
  - Production: Google Cloud Storage
  - CDN: Cloud CDN (Colombian edge locations)

Time Series (Optional): TimescaleDB extension
  - Environmental sensor data
  - Performance metrics
  - Growth tracking
```

#### **Infrastructure & DevOps**
```yaml
Containerization: Docker + Docker Compose
  - Multi-stage builds
  - Alpine base images
  - Non-root users

Cloud Platform: Google Cloud Platform
  - Compute: Cloud Run (auto-scaling containers)
  - Database: Cloud SQL (PostgreSQL 15)
  - Storage: Cloud Storage (multi-region)
  - Cache: Memorystore (Redis)
  - CDN: Cloud CDN (Colombian edge)
  - DNS: Cloud DNS
  - Secrets: Secret Manager

CI/CD: 
  - GitHub Actions (testing, linting)
  - Cloud Build (container building)
  - Automated deployments (main branch)

Monitoring: 
  - Cloud Monitoring (metrics, uptime)
  - Cloud Logging (centralized logs)
  - Error Reporting (crash analytics)
  - Alerting (PagerDuty/Email)

Load Balancing: Cloud Load Balancing
  - HTTPS termination
  - SSL certificates (auto-renewal)
  - Health checks
  - Session affinity
```

### **Architecture Patterns**

#### **Domain-Driven Design (Simplified)**
```
apps/
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static assets
│
├── api/                    # Fastify backend
│   ├── src/
│   │   ├── domains/       # Domain modules
│   │   │   ├── auth/      # Authentication & Authorization
│   │   │   ├── cultivation/ # Core cultivation operations
│   │   │   ├── inventory/  # Inventory management
│   │   │   ├── compliance/ # Regulatory compliance
│   │   │   └── analytics/  # Analytics & reporting
│   │   ├── shared/        # Shared utilities
│   │   ├── middleware/    # Auth, validation, etc.
│   │   └── plugins/       # Fastify plugins
│   └── test/              # API tests
│
packages/
├── database/              # Prisma schema & migrations
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Colombian seed data
│   └── src/
│       ├── utils.ts       # DB utilities
│       └── test-utils.ts  # Testing helpers
│
├── types/                 # Shared TypeScript types
│   └── src/
│       └── index.ts       # Type definitions
│
└── ui/                    # Shared UI components
    └── src/
        └── components/    # Reusable components
```

#### **Multi-Tenant Architecture**
```typescript
// Row-Level Security (RLS) Pattern
interface TenantContext {
  companyId: string;
  userId: string;
  roles: string[];
  permissions: Permission[];
}

// Middleware to inject tenant context
export const tenantMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { user } = request;
  
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // Inject tenant context into request
  request.tenant = {
    companyId: user.companyId,
    userId: user.id,
    roles: await getUserRoles(user.id),
    permissions: await getUserPermissions(user.id)
  };
};

// Prisma query with tenant isolation
export const findBatches = async (
  prisma: PrismaClient,
  tenantContext: TenantContext,
  filters: BatchFilters
) => {
  return prisma.batch.findMany({
    where: {
      facility: {
        companyId: tenantContext.companyId, // Auto-inject tenant filter
      },
      ...filters,
    },
  });
};
```

---

## 🔐 **SECURITY IMPLEMENTATION**

### **Authentication Strategy**

#### **Lucia Auth Configuration**
```typescript
// lib/auth.ts
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from '@alquemist/database';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'alquemist_session',
    expires: false, // Session cookies
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      companyId: attributes.companyId,
      roleId: attributes.roleId,
      locale: attributes.locale,
    };
  },
});

// MFA Configuration
export const mfaConfig = {
  enabled: true,
  methods: ['totp', 'email'],
  totpIssuer: 'Alquemist',
  totpAlgorithm: 'SHA1',
  totpDigits: 6,
  totpPeriod: 30,
};

// Rate limiting configuration
export const authRateLimits = {
  login: {
    points: 5,
    duration: 15 * 60, // 15 minutes
    blockDuration: 15 * 60, // 15 minutes
  },
  registration: {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
  },
  passwordReset: {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60, // 1 hour
  },
};
```

### **Authorization Pattern (RBAC)**

#### **Permission System**
```typescript
// types/permissions.ts
interface Permission {
  resource: string; // 'batch', 'template', 'user', 'facility'
  action: string;   // 'read', 'write', 'delete', 'approve'
  scope: 'system' | 'company' | 'facility' | 'area' | 'personal';
  conditions?: Record<string, any>; // Optional conditions
}

interface Role {
  id: string;
  name: string;
  displayNameEs: string;
  displayNameEn: string;
  level: number; // 1=highest, 6=lowest
  scopeLevel: 'system' | 'company' | 'facility' | 'area' | 'personal';
  permissions: Permission[];
  inheritsFrom?: string[]; // Role inheritance
}

// Predefined Colombian roles
export const ROLES: Record<string, Role> = {
  SYSTEM_ADMIN: {
    id: 'system_administrator',
    name: 'system_administrator',
    displayNameEs: 'Administrador del Sistema',
    displayNameEn: 'System Administrator',
    level: 1,
    scopeLevel: 'system',
    permissions: [
      { resource: '*', action: '*', scope: 'system' }
    ],
  },
  COMPANY_OWNER: {
    id: 'company_owner',
    name: 'company_owner',
    displayNameEs: 'Propietario de Empresa',
    displayNameEn: 'Company Owner',
    level: 2,
    scopeLevel: 'company',
    permissions: [
      { resource: 'company', action: 'read', scope: 'company' },
      { resource: 'company', action: 'update', scope: 'company' },
      { resource: 'facility', action: '*', scope: 'company' },
      { resource: 'user', action: '*', scope: 'company' },
      { resource: 'template', action: '*', scope: 'company' },
      { resource: 'compliance', action: '*', scope: 'company' },
    ],
  },
  FACILITY_MANAGER: {
    id: 'facility_manager',
    name: 'facility_manager',
    displayNameEs: 'Gerente de Instalación',
    displayNameEn: 'Facility Manager',
    level: 3,
    scopeLevel: 'facility',
    permissions: [
      { resource: 'facility', action: 'read', scope: 'facility' },
      { resource: 'facility', action: 'update', scope: 'facility' },
      { resource: 'area', action: '*', scope: 'facility' },
      { resource: 'production_order', action: '*', scope: 'facility' },
      { resource: 'batch', action: '*', scope: 'facility' },
      { resource: 'inventory', action: '*', scope: 'facility' },
      { resource: 'quality', action: '*', scope: 'facility' },
    ],
  },
  // ... more roles
};

// Middleware for permission checking
export const requirePermission = (
  resource: string,
  action: string,
  scope?: string
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenant } = request;
    
    if (!tenant) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const hasPermission = await checkUserPermission(
      tenant,
      resource,
      action,
      scope
    );
    
    if (!hasPermission) {
      return reply.code(403).send({ 
        error: 'Insufficient permissions',
        required: { resource, action, scope },
      });
    }
  };
};

// Permission checking logic
async function checkUserPermission(
  tenant: TenantContext,
  resource: string,
  action: string,
  scope?: string
): Promise<boolean> {
  // Check role permissions
  for (const permission of tenant.permissions) {
    if (
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.action === '*' || permission.action === action) &&
      (!scope || permission.scope === scope)
    ) {
      return true;
    }
  }
  
  return false;
}
```

### **Data Protection**

#### **Encryption Strategy**
```typescript
// lib/encryption.ts
import crypto from 'crypto';

export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 64,
};

// Encrypt sensitive data
export const encryptData = (plaintext: string, key: Buffer): string => {
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_CONFIG.algorithm,
    key,
    iv
  );

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return: iv + encrypted + tag (all hex encoded)
  return iv.toString('hex') + encrypted + tag.toString('hex');
};

// Decrypt sensitive data
export const decryptData = (ciphertext: string, key: Buffer): string => {
  const ivLength = ENCRYPTION_CONFIG.ivLength * 2; // hex encoded
  const tagLength = ENCRYPTION_CONFIG.tagLength * 2; // hex encoded
  
  const iv = Buffer.from(ciphertext.slice(0, ivLength), 'hex');
  const tag = Buffer.from(ciphertext.slice(-tagLength), 'hex');
  const encrypted = ciphertext.slice(ivLength, -tagLength);
  
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_CONFIG.algorithm,
    key,
    iv
  );
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Password hashing
export const HASH_CONFIG = {
  passwords: 'argon2id' as const,
  apiKeys: 'sha256' as const,
  checksums: 'blake3' as const,
};

// Argon2id configuration
export const argonConfig = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
};
```

#### **Transport Security**
```typescript
// TLS Configuration
export const tlsConfig = {
  minVersion: 'TLSv1.3' as const,
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ].join(':'),
  honorCipherOrder: true,
};

// HSTS Configuration
export const hstsConfig = {
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true,
};

// Security headers
export const securityHeaders = {
  'Strict-Transport-Security': `max-age=${hstsConfig.maxAge}; includeSubDomains; preload`,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.alquemist.com.co",
  ].join('; '),
};
```

---

## 📊 **DATABASE STRATEGY**

### **Prisma Configuration**

#### **Schema Pattern**
```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [uuid_ossp, pg_trgm, btree_gin]
}

// Colombian-specific database configuration
// Timezone: America/Bogota
// Collation: es_CO.UTF-8
// Full-text search: Spanish configuration
```

#### **Connection Pooling**
```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Connection pool configuration (for production)
export const CONNECTION_POOL = {
  maxConnections: 10, // Cloud SQL proxy recommendation
  connectionTimeout: 10000, // 10 seconds
  idleTimeout: 30000, // 30 seconds
  maxLifetime: 1800000, // 30 minutes
};
```

### **Migration Strategy**

```typescript
// Migration approach by environment
export const MIGRATION_STRATEGY = {
  development: {
    method: 'prisma db push',
    purpose: 'Schema prototyping',
    validation: 'optional',
  },
  staging: {
    method: 'prisma migrate dev',
    purpose: 'Named migrations with history',
    validation: 'required',
    review: 'peer review required',
  },
  production: {
    method: 'prisma migrate deploy',
    purpose: 'Apply migrations only',
    validation: 'required',
    rollback: 'prisma migrate resolve --rolled-back',
    backup: 'automatic before deployment',
  },
};

// Zero-downtime deployment pattern
export const DEPLOYMENT_PATTERN = {
  step1: 'Deploy backward-compatible schema changes',
  step2: 'Deploy application code that works with both schemas',
  step3: 'Migrate data in background job',
  step4: 'Deploy application code that uses new schema',
  step5: 'Remove old schema (after validation period)',
};
```

### **Performance Optimizations**

#### **Critical Indexes**
```sql
-- QR code scanning (high frequency in Colombian operations)
CREATE UNIQUE INDEX CONCURRENTLY idx_batches_qr_code 
  ON batches(qr_code);

CREATE UNIQUE INDEX CONCURRENTLY idx_plants_qr_code 
  ON plants(qr_code) WHERE qr_code IS NOT NULL;

-- Multi-tenant security (automatic tenant filtering)
CREATE INDEX CONCURRENTLY idx_users_company_email 
  ON users(company_id, email);

CREATE INDEX CONCURRENTLY idx_facilities_company 
  ON facilities(company_id) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_batches_company_facility 
  ON batches(facility_id, crop_type_id, created_date DESC)
  INCLUDE (status, current_quantity);

-- Batch operations (default tracking level)
CREATE INDEX CONCURRENTLY idx_batches_facility_crop_date 
  ON batches(facility_id, crop_type_id, created_date DESC)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_batches_status_area 
  ON batches(status, area_id) 
  WHERE status IN ('active', 'in_progress');

-- Activity tracking (high write volume)
CREATE INDEX CONCURRENTLY idx_activities_entity_date 
  ON activities(entity_type, entity_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_activities_batch_type_date 
  ON activities(entity_id, activity_type, timestamp DESC)
  WHERE entity_type = 'batch';

-- Scheduled activities (task management)
CREATE INDEX CONCURRENTLY idx_scheduled_activities_date_status 
  ON scheduled_activities(scheduled_date, status)
  WHERE status IN ('pending', 'in_progress');

CREATE INDEX CONCURRENTLY idx_scheduled_activities_assigned 
  ON scheduled_activities(assigned_to, scheduled_date)
  WHERE status = 'pending';

-- Inventory management
CREATE INDEX CONCURRENTLY idx_inventory_area_product 
  ON inventory_items(area_id, product_id) 
  WHERE quantity_truly_available > 0;

CREATE INDEX CONCURRENTLY idx_inventory_reorder 
  ON inventory_items(product_id)
  WHERE quantity_truly_available <= reorder_point;

-- Full-text search for Spanish agricultural content
CREATE INDEX CONCURRENTLY idx_products_search_spanish 
  ON products USING gin(
    to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
  );

CREATE INDEX CONCURRENTLY idx_cultivars_search_spanish 
  ON cultivars USING gin(
    to_tsvector('spanish', name || ' ' || COALESCE(notes, ''))
  );

-- Compliance and regulatory queries
CREATE INDEX CONCURRENTLY idx_compliance_events_company_date 
  ON compliance_events(company_id, status, detection_date DESC);

CREATE INDEX CONCURRENTLY idx_certificates_company_expiry 
  ON certificates(company_id, expiry_date)
  WHERE status = 'valid' AND expiry_date IS NOT NULL;

-- Pest and disease tracking
CREATE INDEX CONCURRENTLY idx_pest_records_facility_date 
  ON pest_disease_records(facility_id, detection_date DESC)
  WHERE resolution_status = 'active';

-- Colombian geographic queries
CREATE INDEX CONCURRENTLY idx_facilities_location 
  ON facilities(department, municipality)
  WHERE status = 'active';
```

#### **Query Optimization Patterns**
```typescript
// Efficient batch retrieval with tenant isolation
export const findActiveBatches = async (
  companyId: string,
  facilityId: string,
  filters: BatchFilters
) => {
  return prisma.batch.findMany({
    where: {
      facility: {
        companyId, // Tenant isolation
        id: facilityId,
        status: 'active',
      },
      status: 'active',
      ...filters,
    },
    include: {
      cropType: {
        select: {
          displayNameEs: true,
          displayNameEn: true,
        },
      },
      cultivar: {
        select: {
          name: true,
        },
      },
      area: {
        select: {
          name: true,
          areaType: true,
        },
      },
    },
    orderBy: {
      createdDate: 'desc',
    },
    take: 50, // Pagination
  });
};

// Efficient activity logging with minimal overhead
export const logActivity = async (
  data: ActivityCreateInput,
  options?: { skipAudit?: boolean }
) => {
  // Use createMany for bulk inserts (no select back)
  if (Array.isArray(data)) {
    return prisma.activity.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Single insert with select for audit trail
  return prisma.activity.create({
    data,
    select: {
      id: true,
      timestamp: true,
    },
  });
};

// Efficient inventory updates with optimistic locking
export const updateInventory = async (
  itemId: string,
  quantityChange: number,
  type: 'consume' | 'add' | 'reserve'
) => {
  return prisma.$transaction(async (tx) => {
    // Lock row for update
    const item = await tx.inventoryItem.findUniqueOrThrow({
      where: { id: itemId },
      select: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityCommitted: true,
      },
    });

    // Calculate new quantities
    const updates: any = {};
    if (type === 'consume') {
      updates.quantityAvailable = item.quantityAvailable - quantityChange;
    } else if (type === 'add') {
      updates.quantityAvailable = item.quantityAvailable + quantityChange;
    } else if (type === 'reserve') {
      updates.quantityReserved = item.quantityReserved + quantityChange;
    }

    // Validate before update
    if (updates.quantityAvailable < 0) {
      throw new Error('Insufficient inventory');
    }

    // Update with optimistic locking
    return tx.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...updates,
        lastMovementDate: new Date(),
        updatedAt: new Date(),
      },
    });
  });
};
```

---

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **AI Services Stack**

```typescript
// AI services configuration
export const AI_SERVICES = {
  pestDetection: {
    model: 'YOLO v8 + Colombian pest training',
    accuracy: {
      target: 0.90,
      current: 0.89,
      validated: true,
    },
    latency: {
      target: 3000, // 3 seconds
      p95: 2800,
    },
    fallback: 'manual inspection workflow',
    deployment: 'Cloud Run (GPU instances)',
  },
  
  ocrProcessing: {
    engine: 'Tesseract.js v4 + Spanish language pack',
    preprocessing: 'Sharp image enhancement',
    postprocessing: 'Colombian terminology validation',
    accuracy: {
      target: 0.90,
      current: 0.92,
      validated: true,
    },
    languages: ['es', 'en'],
    deployment: 'Cloud Run (CPU instances)',
  },
  
  nlpProcessing: {
    library: 'compromise + Spanish extensions',
    tasks: [
      'template generation',
      'terminology extraction',
      'entity recognition',
    ],
    trainingData: 'Colombian agricultural corpus',
    deployment: 'Cloud Run (CPU instances)',
  },

  plantHealth: {
    model: 'Custom CNN + transfer learning',
    features: [
      'leaf_color_analysis',
      'growth_pattern_detection',
      'stress_indicators',
    ],
    accuracy: {
      target: 0.85,
      current: 0.87,
    },
    deployment: 'Cloud Run (GPU instances)',
  },
};
```

### **Image Analysis Pipeline**

```typescript
// services/ai/image-analysis.service.ts
import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';

export class ImageAnalysisService {
  private storage: Storage;
  private modelEndpoint: string;

  constructor() {
    this.storage = new Storage();
    this.modelEndpoint = process.env.AI_MODEL_ENDPOINT!;
  }

  async analyzePlantHealth(
    imageBuffer: Buffer,
    metadata: ImageMetadata
  ): Promise<AnalysisResult> {
    // 1. Image preprocessing
    const processedImage = await this.preprocessImage(imageBuffer);
    
    // 2. Upload to temporary storage for model access
    const tempUrl = await this.uploadTemp(processedImage);
    
    // 3. Call AI model endpoint
    const predictions = await this.runInference(tempUrl, metadata);
    
    // 4. Post-processing and validation
    const results = await this.validatePredictions(predictions);
    
    // 5. Enrich with Colombian agricultural context
    const enriched = await this.enrichWithColombianContext(results);
    
    // 6. Clean up temporary files
    await this.cleanup(tempUrl);
    
    return enriched;
  }

  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(640, 640, {
        fit: 'cover',
        position: 'center',
      })
      .normalize() // Lighting normalization for Colombian conditions
      .toColorspace('srgb')
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  private async runInference(
    imageUrl: string,
    metadata: ImageMetadata
  ): Promise<ModelPredictions> {
    const response = await fetch(this.modelEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        model: 'plant_health_v2',
        metadata: {
          crop_type: metadata.cropType,
          growth_stage: metadata.growthStage,
          location: metadata.location,
        },
        config: {
          confidence_threshold: 0.75,
          max_detections: 10,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI model inference failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async validatePredictions(
    predictions: ModelPredictions
  ): Promise<ValidatedResults> {
    // Filter by confidence threshold
    const validated = predictions.detections.filter(
      (d) => d.confidence >= AI_SERVICES.pestDetection.accuracy.target
    );

    // Group by detection type
    const grouped = this.groupDetections(validated);

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(grouped);

    return {
      detections: validated,
      grouped,
      healthScore,
      confidence: this.calculateOverallConfidence(validated),
    };
  }

  private async enrichWithColombianContext(
    results: ValidatedResults
  ): Promise<AnalysisResult> {
    // Add Colombian pest database information
    for (const detection of results.detections) {
      if (detection.type === 'pest') {
        const pestInfo = await this.getColombianPestInfo(detection.class);
        detection.colombianContext = pestInfo;
      }
    }

    // Add regional treatment recommendations
    const treatments = await this.getRegionalTreatments(
      results.detections,
      'Colombia'
    );

    return {
      ...results,
      treatments,
      timestamp: new Date().toISOString(),
      location: 'Colombia',
    };
  }

  private calculateHealthScore(
    grouped: Record<string, Detection[]>
  ): number {
    let score = 100;

    // Deduct points based on detected issues
    const pestCount = grouped.pest?.length || 0;
    const diseaseCount = grouped.disease?.length || 0;
    const stressCount = grouped.stress?.length || 0;

    score -= pestCount * 10;
    score -= diseaseCount * 15;
    score -= stressCount * 5;

    return Math.max(0, Math.min(100, score));
  }
}
```

### **Model Management**

```typescript
// Model versioning and deployment strategy
export const MODEL_MANAGEMENT = {
  storage: {
    provider: 'Google Cloud Storage',
    bucket: 'alquemist-ai-models',
    versioning: true,
    lifecycle: {
      deleteAfterDays: 90, // Keep last 3 months of models
      transitionToArchive: 30,
    },
  },

  deployment: {
    strategy: 'blue-green',
    rollback: 'automatic on error rate > 5%',
    canaryPercent: 10, // Route 10% traffic to new model
    canaryDuration: '24 hours',
  },

  monitoring: {
    metrics: [
      'accuracy',
      'latency',
      'error_rate',
      'confidence_distribution',
    ],
    alerting: {
      accuracy_drop: {
        threshold: 0.05, // 5% drop
        action: 'automatic rollback',
      },
      latency_increase: {
        threshold: 1.5, // 50% increase
        action: 'alert team',
      },
    },
  },

  training: {
    schedule: 'quarterly',
    dataSource: 'Colombian agricultural operations',
    validation: {
      method: 'expert review',
      requiredSamples: 100,
      requiredAccuracy: 0.90,
    },
  },

  colombianOptimization: {
    trainingData: {
      source: 'Alquemist Colombian operations',
      varieties: 'Colombian crop varieties',
      conditions: 'Colombian altitude/climate',
      pests: 'Colombian pest species database',
    },
    validation: {
      experts: 'Colombian agricultural experts',
      regions: ['Putumayo', 'Antioquia', 'Valle', 'Huila'],
    },
    updates: {
      frequency: 'quarterly',
      retraining: 'with new Colombian data',
    },
  },
};
```

---

## 🌐 **INTERNATIONALIZATION IMPLEMENTATION**

### **i18n Architecture**

```typescript
// i18n/config.ts
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/Bogota',
  now: new Date(),
}));

// Colombian-specific formatters
export const colombianFormatters = {
  currency: new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),

  date: new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'short',
  }),

  dateTime: new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  }),

  number: new Intl.NumberFormat('es-CO'),

  list: new Intl.ListFormat('es-CO', {
    style: 'long',
    type: 'conjunction',
  }),
};

// Shared navigation helpers
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
```

### **Content Management Strategy**

```typescript
// Database-driven translations for dynamic content
interface TranslatableContent {
  key: string;
  es: string;
  en: string;
  context?: 'agricultural' | 'regulatory' | 'general';
  region?: 'colombia' | 'global';
  category?: string;
  metadata?: Record<string, any>;
}

// API-based translation management
export const translationAPI = {
  // Get translations by locale and namespace
  get: '/api/translations/{locale}/{namespace}',
  
  // Update translations (admin only)
  update: '/api/translations/{key}',
  
  // Validate translation coverage
  validate: '/api/translations/validate/{locale}',
  
  // Export translations for offline use
  export: '/api/translations/export/{locale}',
};

// Translation service
export class TranslationService {
  async getTranslations(
    locale: Locale,
    namespace: string
  ): Promise<Record<string, string>> {
    // Try cache first
    const cached = await this.getFromCache(locale, namespace);
    if (cached) return cached;

    // Fetch from database
    const translations = await prisma.translation.findMany({
      where: {
        locale,
        namespace,
        status: 'active',
      },
      select: {
        key: true,
        value: true,
      },
    });

    // Convert to key-value object
    const result = Object.fromEntries(
      translations.map((t) => [t.key, t.value])
    );

    // Cache for 1 hour
    await this.setCache(locale, namespace, result, 3600);

    return result;
  }

  async validateCoverage(locale: Locale): Promise<CoverageReport> {
    // Get all translation keys
    const allKeys = await prisma.translation.findMany({
      where: { locale: defaultLocale },
      select: { key: true },
      distinct: ['key'],
    });

    // Get translations for target locale
    const targetTranslations = await prisma.translation.findMany({
      where: { locale },
      select: { key: true },
    });

    const targetKeys = new Set(targetTranslations.map((t) => t.key));
    const missingKeys = allKeys
      .map((t) => t.key)
      .filter((key) => !targetKeys.has(key));

    return {
      locale,
      total: allKeys.length,
      translated: targetTranslations.length,
      missing: missingKeys.length,
      coverage: (targetTranslations.length / allKeys.length) * 100,
      missingKeys,
    };
  }
}
```

---

## 🚀 **PERFORMANCE REQUIREMENTS**

### **Response Time Targets**

```typescript
// Performance SLOs (Service Level Objectives)
export const PERFORMANCE_TARGETS = {
  // Colombian internet infrastructure considerations
  api: {
    auth: {
      p50: 200, // 200ms
      p95: 500, // 500ms
      p99: 1000, // 1s
    },
    crud: {
      p50: 300,
      p95: 1000,
      p99: 2000,
    },
    search: {
      p50: 500,
      p95: 2000,
      p99: 3000,
    },
    reports: {
      p50: 2000,
      p95: 5000,
      p99: 10000,
    },
    ai_analysis: {
      p50: 2000,
      p95: 3000,
      p99: 5000,
    },
  },

  frontend: {
    page_load: {
      initial: 2000, // First page load
      subsequent: 1000, // Cached pages
    },
    interaction: {
      p95: 100, // Button clicks, form inputs
    },
    form_submission: {
      p95: 1000,
    },
  },

  mobile: {
    // Colombian 3G network conditions
    pwa_load: {
      '3g': 3000,
      '4g': 2000,
      'wifi': 1000,
    },
    offline_ready: {
      target: 1000, // Time to show cached content
    },
    sync_time: {
      typical_batch: 30000, // 30s for typical batch of activities
    },
  },

  database: {
    query: {
      p50: 10,
      p95: 50,
      p99: 100,
    },
    transaction: {
      p50: 50,
      p95: 200,
      p99: 500,
    },
  },
};
```

### **Caching Strategy**

```typescript
// Multi-layer caching architecture
export const CACHING_LAYERS = {
  browser: {
    strategy: 'Service Worker with stale-while-revalidate',
    assets: {
      strategy: 'cache-first',
      maxAge: 31536000, // 1 year for versioned assets
      maxEntries: 100,
    },
    api: {
      strategy: 'network-first',
      timeout: 5000, // 5s timeout, then fallback to cache
      maxAge: 300, // 5 minutes
      maxEntries: 50,
    },
    images: {
      strategy: 'cache-first',
      maxAge: 86400, // 24 hours
      maxEntries: 100,
      maxSize: 52428800, // 50MB
    },
  },

  application: {
    redis: {
      sessions: {
        ttl: 86400, // 24 hours
        prefix: 'session:',
      },
      rateLimit: {
        ttl: 3600, // 1 hour
        prefix: 'ratelimit:',
      },
      jobs: {
        // BullMQ queue configuration
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 1000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      cache: {
        translations: {
          ttl: 3600, // 1 hour
          prefix: 'i18n:',
        },
        userPermissions: {
          ttl: 300, // 5 minutes
          prefix: 'perms:',
        },
        templates: {
          ttl: 3600, // 1 hour
          prefix: 'tpl:',
        },
      },
    },

    memory: {
      // In-memory LRU cache for hot data
      config: {
        max: 1000,
        ttl: 60000, // 1 minute
      },
      translations: {
        max: 100,
        ttl: 3600000, // 1 hour
      },
    },

    database: {
      // Prisma connection pooling
      pool: {
        min: 2,
        max: 10,
      },
      // Prepared statements cache
      preparedStatements: true,
    },
  },

  cdn: {
    static: {
      maxAge: 31536000, // 1 year for static assets
      sMaxAge: 31536000,
      staleWhileRevalidate: 86400,
    },
    api: {
      maxAge: 0, // No caching for personalized content
      sMaxAge: 0,
      private: true,
    },
    regions: {
      primary: 'us-central1', // GCP Colombian region
      fallback: 'us-east1',
    },
  },
};
```

### **Performance Monitoring**

```typescript
// Performance monitoring and alerting
export const PERFORMANCE_MONITORING = {
  realUserMonitoring: {
    provider: 'Cloud Monitoring',
    metrics: [
      'first_contentful_paint',
      'largest_contentful_paint',
      'first_input_delay',
      'cumulative_layout_shift',
      'time_to_interactive',
    ],
    sampling: 1.0, // 100% sampling in production
  },

  syntheticMonitoring: {
    provider: 'Cloud Monitoring Uptime Checks',
    checks: [
      {
        name: 'api_health',
        endpoint: '/api/health',
        interval: 60, // 1 minute
        timeout: 10,
        regions: ['us-central1', 'us-east1', 'southamerica-east1'],
      },
      {
        name: 'web_homepage',
        endpoint: '/',
        interval: 300, // 5 minutes
        timeout: 15,
      },
    ],
  },

  alerts: {
    latency: {
      p95: {
        threshold: 2000, // 2s
        duration: 300, // 5 minutes
        action: 'page_team',
      },
      p99: {
        threshold: 5000, // 5s
        duration: 300,
        action: 'page_team',
      },
    },
    errorRate: {
      threshold: 0.05, // 5%
      duration: 300,
      action: 'page_team',
    },
    availability: {
      threshold: 0.99, // 99%
      duration: 300,
      action: 'page_team',
    },
  },
};
```

---

## 📱 **MOBILE & OFFLINE STRATEGY**

### **Progressive Web App Implementation**

```typescript
// next.config.js - PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.alquemist\.com\.co\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 5, // Fallback to cache after 5s
      },
    },
    {
      urlPattern: /^https:\/\/storage\.googleapis\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});

// Service Worker configuration for Colombian rural connectivity
export const PWA_CONFIG = {
  // Colombian rural connectivity optimization
  caching: 'network-first with offline fallback',
  
  storage: {
    engine: 'IndexedDB',
    quota: 52428800, // 50MB per user
    persistence: true,
  },

  sync: {
    strategy: 'background sync when connectivity restored',
    batchSize: 50, // Sync 50 activities at a time
    retryStrategy: 'exponential backoff',
  },

  offlinePages: [
    '/',
    '/dashboard',
    '/activities',
    '/batches',
    '/inventory',
    '/quality-checks',
  ],

  conflictResolution: {
    strategy: 'last-write-wins',
    manualReview: 'flag conflicts for manual review',
    preserveBoth: 'keep both versions with timestamp',
  },

  maxOfflineStorage: '50MB per user',
  
  syncFrequency: {
    online: 'real-time',
    offline: 'every 5 minutes when connectivity detected',
  },
};
```

### **Offline Data Management**

```typescript
// lib/offline/sync.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AlquemistDB extends DBSchema {
  activities: {
    key: string;
    value: OfflineActivity;
    indexes: { 'by-date': Date; 'by-entity': string };
  };
  batches: {
    key: string;
    value: OfflineBatch;
    indexes: { 'by-date': Date };
  };
  queue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-priority': number; 'by-timestamp': Date };
  };
}

export class OfflineSyncService {
  private db: IDBPDatabase<AlquemistDB> | null = null;

  async init() {
    this.db = await openDB<AlquemistDB>('alquemist-offline', 1, {
      upgrade(db) {
        // Activities store
        const activityStore = db.createObjectStore('activities', {
          keyPath: 'id',
        });
        activityStore.createIndex('by-date', 'timestamp');
        activityStore.createIndex('by-entity', 'entityId');

        // Batches store
        const batchStore = db.createObjectStore('batches', {
          keyPath: 'id',
        });
        batchStore.createIndex('by-date', 'createdDate');

        // Sync queue store
        const queueStore = db.createObjectStore('queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('by-priority', 'priority');
        queueStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  // Queue activity for sync
  async queueActivity(activity: OfflineActivity) {
    if (!this.db) await this.init();

    // Store activity locally
    await this.db!.put('activities', activity);

    // Add to sync queue
    await this.db!.put('queue', {
      type: 'activity',
      data: activity,
      priority: activity.priority || 5,
      timestamp: new Date(),
      retries: 0,
    });

    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  // Process sync queue
  async processSyncQueue() {
    if (!this.db) await this.init();

    const queue = await this.db!.getAllFromIndex(
      'queue',
      'by-priority'
    );

    for (const item of queue) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          // Remove from queue on success
          await this.db!.delete('queue', item.id!);
        } else if (response.status >= 400 && response.status < 500) {
          // Client error - remove from queue (won't succeed)
          await this.db!.delete('queue', item.id!);
          console.error('Sync failed with client error:', item);
        } else {
          // Server error - retry later
          await this.db!.put('queue', {
            ...item,
            retries: item.retries + 1,
            lastAttempt: new Date(),
          });
        }
      } catch (error) {
        // Network error - will retry on next sync
        console.error('Sync error:', error);
      }
    }
  }

  // Handle conflicts
  async resolveConflict(
    local: OfflineActivity,
    server: Activity
  ): Promise<Activity> {
    // Last-write-wins strategy
    const localTime = new Date(local.timestamp).getTime();
    const serverTime = new Date(server.timestamp).getTime();

    if (localTime > serverTime) {
      // Local is newer - use local
      return {
        ...server,
        ...local,
        conflictResolved: true,
        conflictStrategy: 'last-write-wins',
      };
    }

    // Server is newer or same - use server
    return server;
  }
}

// Mobile optimization
export const MOBILE_OPTIMIZATIONS = {
  ui: {
    touchTargets: '44px minimum', // Apple guidelines
    gestures: {
      swipe: 'navigation',
      pinch: 'zoom',
      longPress: 'context menu',
    },
    keyboard: {
      type: 'Spanish input optimized',
      autocomplete: true,
      suggestions: 'agricultural terms',
    },
  },

  performance: {
    bundleSize: {
      target: 200, // 200KB initial JavaScript
      current: 180,
    },
    images: {
      format: 'WebP with JPEG fallback',
      loading: 'lazy',
      sizes: 'responsive',
    },
    fonts: {
      strategy: 'system fonts + preloaded custom',
      subset: 'Spanish + English characters only',
    },
  },

  connectivity: {
    offlineIndicator: {
      visible: true,
      style: 'toast notification',
    },
    gracefulDegradation: {
      poor: 'disable non-essential features',
      offline: 'full offline mode',
    },
    compression: {
      text: 'gzip/brotli',
      images: 'optimized WebP',
    },
  },
};
```

---

## 🔧 **API DESIGN PATTERNS**

### **RESTful API Structure**

```typescript
// API endpoint patterns
export const API_PATTERNS = {
  // Resource-based URLs (RESTful)
  companies: '/api/companies',
  facilities: '/api/companies/{companyId}/facilities',
  batches: '/api/facilities/{facilityId}/batches',
  activities: '/api/batches/{batchId}/activities',

  // Standard HTTP methods
  operations: {
    GET: 'Read operations (list, detail)',
    POST: 'Create operations',
    PUT: 'Update operations (full replacement)',
    PATCH: 'Partial updates',
    DELETE: 'Soft delete (status = inactive)',
  },

  // Consistent response format
  response: {
    success: {
      data: '/* resource data */',
      meta: {
        pagination: 'cursor or offset-based',
        timing: 'request timing',
      },
    },
    error: {
      error: {
        code: 'MACHINE_READABLE_CODE',
        message: 'Human-readable message',
        messageKey: 'i18n key for translation',
        details: '/* additional context */',
        timestamp: 'ISO timestamp',
        traceId: 'request trace ID',
      },
    },
  },
};

// API versioning strategy
export const API_VERSIONING = {
  strategy: 'URL path versioning',
  pattern: '/api/v{version}',
  current: 'v1',
  deprecation: {
    notice: '6 months before removal',
    support: '12 months minimum',
    header: 'X-API-Deprecation-Notice',
  },
};
```

### **Error Handling Strategy**

```typescript
// Centralized error handling
export interface APIError {
  code: string; // Machine-readable error code
  message: string; // Human-readable message (English)
  messageKey: string; // i18n key for translation
  details?: any; // Additional error context
  timestamp: string; // ISO timestamp
  traceId: string; // Request tracing ID
  path?: string; // API path where error occurred
}

// Error codes
export enum ErrorCode {
  // Authentication errors (1xxx)
  UNAUTHORIZED = 'AUTH_1001',
  INVALID_CREDENTIALS = 'AUTH_1002',
  SESSION_EXPIRED = 'AUTH_1003',
  MFA_REQUIRED = 'AUTH_1004',

  // Authorization errors (2xxx)
  FORBIDDEN = 'AUTHZ_2001',
  INSUFFICIENT_PERMISSIONS = 'AUTHZ_2002',
  RESOURCE_ACCESS_DENIED = 'AUTHZ_2003',

  // Validation errors (3xxx)
  VALIDATION_ERROR = 'VAL_3001',
  INVALID_INPUT = 'VAL_3002',
  MISSING_REQUIRED_FIELD = 'VAL_3003',

  // Resource errors (4xxx)
  NOT_FOUND = 'RES_4001',
  ALREADY_EXISTS = 'RES_4002',
  CONFLICT = 'RES_4003',

  // Business logic errors (5xxx)
  INSUFFICIENT_INVENTORY = 'BIZ_5001',
  INVALID_STATE_TRANSITION = 'BIZ_5002',
  BATCH_CAPACITY_EXCEEDED = 'BIZ_5003',

  // External service errors (6xxx)
  EXTERNAL_SERVICE_ERROR = 'EXT_6001',
  AI_SERVICE_UNAVAILABLE = 'EXT_6002',
  STORAGE_ERROR = 'EXT_6003',

  // System errors (9xxx)
  INTERNAL_SERVER_ERROR = 'SYS_9001',
  DATABASE_ERROR = 'SYS_9002',
  TIMEOUT = 'SYS_9003',
}

// Error handler middleware
export const errorHandler = async (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Generate trace ID
  const traceId = request.id || generateTraceId();

  // Log error with context
  request.log.error({
    err: error,
    traceId,
    path: request.url,
    method: request.method,
    user: request.user?.id,
    tenant: request.tenant?.companyId,
  });

  // Determine error code and status
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = 'An internal server error occurred';
  let messageKey = 'errors.system.internal_server_error';

  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = error.message;
    messageKey = 'errors.validation.invalid_input';
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorCode = ErrorCode.UNAUTHORIZED;
    message = 'Authentication required';
    messageKey = 'errors.auth.unauthorized';
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
    message = 'Insufficient permissions';
    messageKey = 'errors.authz.insufficient_permissions';
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    errorCode = ErrorCode.NOT_FOUND;
    message = error.message;
    messageKey = 'errors.resource.not_found';
  }

  // Build error response
  const errorResponse: APIError = {
    code: errorCode,
    message,
    messageKey,
    timestamp: new Date().toISOString(),
    traceId,
    path: request.url,
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: error.stack,
      ...error,
    };
  }

  return reply.status(statusCode).send({ error: errorResponse });
};
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Pyramid**

```typescript
export const TESTING_STRATEGY = {
  // Unit Tests (70% of tests)
  unit: {
    framework: 'Vitest (fast, TypeScript native)',
    coverage: {
      target: 80, // 80% minimum for business logic
      current: 85,
    },
    focus: [
      'Domain logic',
      'Utilities',
      'Pure functions',
      'Validators',
      'Formatters',
    ],
    patterns: [
      'Arrange-Act-Assert',
      'Given-When-Then',
      'Test doubles (mocks, stubs)',
    ],
  },

  // Integration Tests (20% of tests)
  integration: {
    framework: 'Vitest + Testcontainers',
    database: 'PostgreSQL test containers',
    apis: 'Supertest for endpoint testing',
    focus: [
      'API routes',
      'Database operations',
      'External service integration',
      'Auth flows',
    ],
    patterns: [
      'Test database per test suite',
      'Cleanup between tests',
      'Real database queries',
    ],
  },

  // E2E Tests (10% of tests)
  e2e: {
    framework: 'Playwright (cross-browser)',
    browsers: ['chromium', 'firefox', 'webkit'],
    focus: [
      'Critical user journeys',
      'Colombian compliance workflows',
      'Batch-first operations',
      'Mobile PWA functionality',
    ],
    frequency: 'Pre-deployment and scheduled daily',
    patterns: [
      'Page Object Model',
      'Test data factories',
      'Visual regression testing',
    ],
  },

  // Performance Tests
  performance: {
    framework: 'k6 (load testing)',
    scenarios: [
      {
        name: 'Normal load',
        vus: 50,
        duration: '5m',
      },
      {
        name: 'Peak load',
        vus: 200,
        duration: '2m',
      },
      {
        name: 'Stress test',
        vus: 500,
        duration: '1m',
      },
    ],
    targets: PERFORMANCE_TARGETS,
  },
};
```

### **Colombian-Specific Testing**

```typescript
// Colombian localization and compliance testing
export const COLOMBIAN_TESTING = {
  localization: {
    spanish: {
      textRendering: 'All Spanish characters (ñ, tildes)',
      formatting: 'Colombian date/number formats',
      currency: 'COP currency formatting',
      timezone: 'America/Bogota timezone handling',
    },
    currencies: {
      cop: 'Colombian peso calculations',
      precision: 'No decimal places for COP',
      formatting: 'Thousands separators',
    },
    dates: {
      format: 'DD/MM/YYYY (Colombian standard)',
      timezone: 'America/Bogota conversion',
      display: 'Spanish month/day names',
    },
    addresses: {
      format: 'Colombian address validation',
      departments: 'All 32 Colombian departments',
      municipalities: 'DANE codes validation',
    },
  },

  compliance: {
    invima: {
      tracking: 'Cannabis tracking workflows',
      reporting: 'Regulatory report generation',
      validation: 'Compliance rule enforcement',
    },
    ica: {
      chemicals: 'Agricultural chemical registration',
      validation: 'ICA approval verification',
      documentation: 'Required documentation checks',
    },
    taxation: {
      iva: 'IVA calculation (19%)',
      withholding: 'Withholding tax calculations',
      reporting: 'Colombian tax report formats',
    },
  },

  performance: {
    rural: {
      network: 'Slow 3G network simulation',
      latency: 'High latency conditions (300-1000ms)',
      packetLoss: 'Packet loss scenarios',
    },
    mobile: {
      devices: 'Colombian popular devices',
      android: 'Android 9+ testing',
      ios: 'iOS 13+ testing',
    },
    offline: {
      functionality: 'Complete offline flow testing',
      sync: 'Data synchronization validation',
      conflicts: 'Conflict resolution testing',
    },
  },

  agricultural: {
    batches: {
      operations: 'Batch-first workflow testing',
      tracking: 'QR code scanning flows',
      quality: 'Sample-based quality checks',
    },
    pests: {
      detection: 'Colombian pest detection',
      accuracy: 'AI model validation',
      treatments: 'Local treatment recommendations',
    },
    crops: {
      cannabis: 'Cannabis compliance workflows',
      coffee: 'Coffee production cycles',
      multiCrop: 'Multi-crop facility operations',
    },
  },
};
```

---

## 🚀 **DEPLOYMENT & DEVOPS**

### **Google Cloud Platform Architecture**

```typescript
// GCP production architecture
export const GCP_ARCHITECTURE = {
  compute: {
    webApp: {
      service: 'Cloud Run',
      region: 'us-central1', // Closest to Colombia
      scaling: {
        minInstances: 1,
        maxInstances: 100,
        concurrency: 80,
        cpu: '2',
        memory: '4Gi',
      },
      deployment: {
        strategy: 'rolling',
        maxSurge: 2,
        maxUnavailable: 0,
      },
    },
    apiServer: {
      service: 'Cloud Run',
      region: 'us-central1',
      scaling: {
        minInstances: 2,
        maxInstances: 50,
        concurrency: 100,
        cpu: '2',
        memory: '2Gi',
      },
    },
    workers: {
      service: 'Cloud Run Jobs',
      schedule: 'Cloud Scheduler',
      jobs: [
        {
          name: 'daily-reports',
          schedule: '0 6 * * *', // 6 AM Bogota time
          timezone: 'America/Bogota',
        },
        {
          name: 'sync-weather-data',
          schedule: '0 * * * *', // Every hour
        },
      ],
    },
  },

  database: {
    primary: {
      service: 'Cloud SQL',
      version: 'PostgreSQL 15',
      tier: 'db-custom-4-16384', // 4 vCPU, 16GB RAM
      region: 'us-central1',
      backup: {
        automated: true,
        retentionDays: 30,
        pointInTimeRecovery: true,
      },
      highAvailability: {
        enabled: true,
        failoverReplica: 'us-east1',
      },
      flags: {
        timezone: 'America/Bogota',
        'max_connections': 100,
        'shared_buffers': '4GB',
        'effective_cache_size': '12GB',
      },
    },
    read_replicas: [
      {
        region: 'us-east1',
        purpose: 'Analytics and reporting',
      },
    ],
  },

  cache: {
    service: 'Memorystore for Redis',
    tier: 'Standard', // HA with auto-failover
    version: 'Redis 7.0',
    memorySizeGb: 5,
    region: 'us-central1',
    replicaCount: 1,
  },

  storage: {
    media: {
      service: 'Cloud Storage',
      bucket: 'alquemist-prod-media',
      location: 'us',
      storageClass: 'STANDARD',
      lifecycle: {
        coldStorage: 90, // Move to Nearline after 90 days
        deletion: 365, // Delete after 1 year
      },
    },
    backups: {
      service: 'Cloud Storage',
      bucket: 'alquemist-prod-backups',
      location: 'us',
      storageClass: 'NEARLINE',
      versioning: true,
    },
  },

  cdn: {
    service: 'Cloud CDN',
    backend: 'Load Balancer',
    caching: {
      mode: 'CACHE_ALL_STATIC',
      defaultTtl: 3600,
      maxTtl: 86400,
    },
  },

  monitoring: {
    service: 'Cloud Monitoring',
    metrics: [
      'request_count',
      'request_latencies',
      'error_rate',
      'cpu_utilization',
      'memory_utilization',
      'database_connections',
    ],
    logging: {
      service: 'Cloud Logging',
      retention: 30, // 30 days
      exports: [
        {
          destination: 'BigQuery',
          dataset: 'alquemist_logs',
        },
      ],
    },
  },
};
```

### **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GCP

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: us-central1

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: alquemist_test
          TZ: America/Bogota
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/alquemist_test
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/alquemist_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy-staging:
    name: Deploy to Staging
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Build and deploy
        run: |
          gcloud builds submit \
            --config cloudbuild.staging.yaml \
            --substitutions COMMIT_SHA=${{ github.sha }}

  deploy-production:
    name: Deploy to Production
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Build and deploy
        run: |
          gcloud builds submit \
            --config cloudbuild.yaml \
            --substitutions COMMIT_SHA=${{ github.sha }}
      
      - name: Run database migrations
        run: |
          gcloud sql connect alquemist-db --user=alquemist-user < migrations.sql
      
      - name: Verify deployment
        run: |
          curl -f https://api.alquemist.com.co/health || exit 1
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### **Environment Configuration**

```typescript
// Environment-specific configurations
export const ENVIRONMENTS = {
  development: {
    database: {
      provider: 'PostgreSQL local',
      seedData: true,
      logging: 'all queries',
    },
    storage: {
      provider: 'Local filesystem',
      path: './uploads',
    },
    ai: {
      mode: 'mock',
      latency: 100, // Simulated latency
    },
    auth: {
      security: 'relaxed',
      tokens: 'long-lived for development',
    },
  },

  staging: {
    database: {
      provider: 'Cloud SQL replica',
      seedData: false,
      logging: 'errors only',
    },
    storage: {
      provider: 'Google Cloud Storage',
      bucket: 'alquemist-staging-media',
    },
    ai: {
      mode: 'full',
      models: 'test models',
    },
    auth: {
      security: 'production-like',
      tokens: 'short-lived',
    },
  },

  production: {
    database: {
      provider: 'Cloud SQL cluster',
      backup: {
        automated: true,
        retention: 30,
      },
      logging: 'errors only',
    },
    storage: {
      provider: 'Google Cloud Storage',
      bucket: 'alquemist-prod-media',
      cdn: 'Cloud CDN enabled',
    },
    ai: {
      mode: 'full',
      models: 'production models',
      monitoring: 'full instrumentation',
    },
    auth: {
      security: 'maximum',
      tokens: 'short-lived',
      mfa: 'required for admin',
      rateLimit: 'strict',
    },
  },
};
```

### **Monitoring & Observability**

```typescript
// Application monitoring setup
export const MONITORING = {
  metrics: {
    application: {
      provider: 'Cloud Monitoring',
      custom: [
        'batches_created_per_hour',
        'activities_logged_per_hour',
        'ai_predictions_per_hour',
        'inventory_updates_per_hour',
      ],
    },
    infrastructure: {
      provider: 'Cloud Monitoring',
      metrics: [
        'cpu_utilization',
        'memory_utilization',
        'disk_utilization',
        'network_throughput',
      ],
    },
    business: {
      provider: 'Custom dashboards',
      kpis: [
        'active_batches',
        'daily_activities',
        'compliance_events',
        'pest_detections',
      ],
    },
  },

  logging: {
    structured: {
      format: 'JSON',
      fields: [
        'timestamp',
        'level',
        'message',
        'traceId',
        'userId',
        'companyId',
        'service',
      ],
    },
    levels: {
      production: ['error', 'warn', 'info'],
      development: ['error', 'warn', 'info', 'debug'],
    },
    aggregation: {
      provider: 'Cloud Logging',
      retention: 30,
      export: 'BigQuery for analysis',
    },
  },

  alerting: {
    critical: [
      {
        name: 'database_down',
        condition: 'availability < 99%',
        notification: 'page team immediately',
      },
      {
        name: 'auth_failures',
        condition: 'rate > 100/min',
        notification: 'page security team',
      },
      {
        name: 'data_corruption',
        condition: 'consistency checks fail',
        notification: 'page tech lead',
      },
    ],
    warning: [
      {
        name: 'high_response_times',
        condition: 'p95 > 2s for 5 minutes',
        notification: 'email team',
      },
      {
        name: 'low_disk_space',
        condition: 'free space < 20%',
        notification: 'email ops',
      },
    ],
    colombian: [
      {
        name: 'compliance_violations',
        condition: 'any violation detected',
        notification: 'email compliance team',
      },
      {
        name: 'regulatory_deadline',
        condition: '7 days before deadline',
        notification: 'email facility managers',
      },
    ],
  },

  tracing: {
    provider: 'Cloud Trace',
    distributed: {
      enabled: true,
      sampling: 1.0, // 100% in production
    },
    performance: {
      slowQueryThreshold: 1000, // 1 second
      optimization: 'automatic suggestions',
    },
    errors: {
      tracking: 'Cloud Error Reporting',
      context: 'full stack traces',
      grouping: 'automatic',
    },
  },
};
```

---

## 📊 **TECHNICAL SUCCESS METRICS**

### **Performance KPIs**

```typescript
export const TECHNICAL_KPIS = {
  performance: {
    api: {
      p50: { target: 300, unit: 'ms' },
      p95: { target: 1000, unit: 'ms' },
      p99: { target: 2000, unit: 'ms' },
    },
    database: {
      queryTime: { target: 50, unit: 'ms', percentile: 95 },
      connectionPool: { target: 80, unit: '%', type: 'utilization' },
    },
    frontend: {
      fcp: { target: 1500, unit: 'ms' },
      lcp: { target: 2500, unit: 'ms' },
      fid: { target: 100, unit: 'ms' },
      cls: { target: 0.1, unit: 'score' },
    },
  },

  reliability: {
    uptime: { target: 99.9, unit: '%' }, // 43.8 minutes downtime/month
    errorRate: { target: 0.1, unit: '%' },
    mttr: { target: 30, unit: 'minutes' }, // Mean time to recovery
    mttd: { target: 5, unit: 'minutes' }, // Mean time to detection
  },

  security: {
    vulnerabilities: {
      critical: { target: 0 },
      high: { target: 0 },
      medium: { target: 5, unit: 'max' },
    },
    patchTime: {
      critical: { target: 24, unit: 'hours' },
      high: { target: 7, unit: 'days' },
    },
  },

  development: {
    coverage: {
      unit: { target: 80, unit: '%' },
      integration: { target: 60, unit: '%' },
      e2e: { target: 40, unit: '%' },
    },
    deploymentFrequency: {
      target: 'multiple per day',
      current: '5-10 per day',
    },
    leadTime: {
      target: 48, // hours from commit to production
      unit: 'hours',
    },
    changeFailureRate: {
      target: 5, // 5% of deployments cause issues
      unit: '%',
    },
  },

  colombian: {
    localization: {
      coverage: { target: 100, unit: '%' },
      accuracy: { target: 99, unit: '%' },
    },
    compliance: {
      automation: { target: 100, unit: '%' },
      violations: { target: 0, unit: 'per month' },
    },
    ruralPerformance: {
      '3g_load_time': { target: 3000, unit: 'ms' },
      offline_success: { target: 95, unit: '%' },
    },
    mobile: {
      adoption: { target: 90, unit: '%' },
      satisfaction: { target: 4.5, unit: 'out of 5' },
    },
  },
};
```

---


---

**Last Updated**: January 2025  
**Version**: 4.0 (Enhanced)