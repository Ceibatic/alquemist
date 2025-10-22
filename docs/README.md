# Alquemist Documentation

**Version 1.0 - Documentación Organizada por Módulos**

---

## 📁 Estructura de Documentación

La documentación está organizada en carpetas por propósito y módulo:

```
docs/
├── README.md                 # Este archivo (índice general)
├── Resumen-Ejecutivo.md     # Executive summary
│
├── core/                    # Documentos principales del proyecto
│   ├── Product-Requirements.md
│   ├── Technical-Specification.md
│   ├── Database-Schema.md
│   └── API-Integration.md
│
├── foundation/              # Configuración inicial y setup
│   ├── Authentication-Guide.md
│   ├── Browser-API-Testing.md
│   ├── Clerk-Organization-Setup.md
│   └── Implementation-Status.md
│
├── module-1/                # Módulo 1: Company & Facility Setup
│   ├── README.md
│   ├── Module-1-Planning.md
│   ├── Module-1-Quick-Start.md
│   ├── Module-1-Task-Board.md
│   └── bubble/              # Implementación Bubble
│       ├── Module-1-Bubble-Guide.md
│       ├── API-Bubble-Reference.md
│       ├── Module-1-Bubble-Quick-Start.md
│       └── Bubble-UI-Wireframes.md
│
├── dev/                     # Frameworks y estándares
│   ├── Agentic-Dev-Framework.md
│   ├── Agentic-Dev-System-Simple.md
│   └── Tech-Stack-Standard.md
│
└── sessions/                # Resúmenes de sesiones
    └── Session-Summary-2025-10-10.md
```

---

## 🚀 Quick Start

Para una nueva implementación de Alquemist, comienza con estos **documentos core**:

### 1. [core/Product-Requirements.md](core/Product-Requirements.md)
**Qué construir** - Especificaciones completas de features

- 17 módulos en 3 fases
- Requisitos regionales (default: Colombia)
- Historias de usuario y métricas de éxito
- Mapa de dependencias entre módulos
- Referencia cruzada de cumplimiento normativo

**Tamaño**: 27KB | **Tiempo de lectura**: 30 minutos

---

### 2. [core/Technical-Specification.md](core/Technical-Specification.md)
**Cómo construir** - Arquitectura y guía de implementación

- Stack tecnológico recomendado (Next.js + Serverless)
- Patrones de arquitectura del sistema
- Autenticación y autorización
- Patrones clave de implementación
- Estrategia de despliegue
- Implementación de cumplimiento regional

**Tamaño**: 21KB | **Tiempo de lectura**: 20 minutos

---

### 3. [core/Database-Schema.md](core/Database-Schema.md)
**Estructura de datos** - Schema completo de base de datos (agnóstico de tecnología)

- 26 tablas organizadas en 8 grupos funcionales
- Todos los campos con tipos y descripciones
- Relaciones e índices
- Campos regionales documentados (default: Colombia)
- Filosofía de rastreo batch-first
- Notas de implementación

**Tamaño**: 54KB | **Tiempo de lectura**: 45 minutos

---

### 4. [core/API-Integration.md](core/API-Integration.md)
**Integración API** - Referencia REST API para frontends agnósticos

- Endpoints REST API v1
- Ejemplos de integración Bubble
- Autenticación y headers
- Manejo de errores
- Ejemplos de requests/responses

**Tamaño**: 14KB | **Tiempo de lectura**: 15 minutos

---

## 📦 Documentación por Módulo

### Module 1: Company & Facility Setup
📁 **[module-1/](module-1/)** - Documentación completa del Módulo 1

**Documentos principales:**
- [module-1/README.md](module-1/README.md) - Índice del módulo
- [module-1/Module-1-Planning.md](module-1/Module-1-Planning.md) - Plan completo
- [module-1/Module-1-Quick-Start.md](module-1/Module-1-Quick-Start.md) - Guía rápida Next.js

**Implementación Bubble (100% español):**
- [module-1/bubble/Module-1-Bubble-Guide.md](module-1/bubble/Module-1-Bubble-Guide.md) - Guía completa (170+ páginas)
- [module-1/bubble/API-Bubble-Reference.md](module-1/bubble/API-Bubble-Reference.md) - Referencia API
- [module-1/bubble/Module-1-Bubble-Quick-Start.md](module-1/bubble/Module-1-Bubble-Quick-Start.md) - Checklist 6-8h
- [module-1/bubble/Bubble-UI-Wireframes.md](module-1/bubble/Bubble-UI-Wireframes.md) - Wireframes visuales

---

## 🏗️ Foundation Documentation

Documentación de configuración inicial y setup:

- [foundation/Authentication-Guide.md](foundation/Authentication-Guide.md) - Guía de autenticación y troubleshooting
- [foundation/Browser-API-Testing.md](foundation/Browser-API-Testing.md) - Cómo probar API en el navegador
- [foundation/Clerk-Organization-Setup.md](foundation/Clerk-Organization-Setup.md) - Configuración de organizaciones
- [foundation/Implementation-Status.md](foundation/Implementation-Status.md) - Estado de implementación

---

## 🛠️ Development Standards

Frameworks y estándares de desarrollo:

- [dev/Agentic-Dev-Framework.md](dev/Agentic-Dev-Framework.md) - Framework completo de desarrollo agéntico
- [dev/Agentic-Dev-System-Simple.md](dev/Agentic-Dev-System-Simple.md) - Sistema simplificado de desarrollo
- [dev/Tech-Stack-Standard.md](dev/Tech-Stack-Standard.md) - Estándares del stack tecnológico

---

## 💡 Filosofía de Documentación

Estos documentos v1.0 representan la **especificación definitiva y completa** para Alquemist:

- **Single source of truth** - No se necesita versionado, son finales
- **Agnóstico de tecnología** - Se puede implementar con cualquier stack moderno
- **Diseño regional** - Configuración default para Colombia, extensible a otras regiones
- **Production-ready** - Suficientemente completo para empezar a construir inmediatamente
- **Organizado por módulos** - Cada módulo tiene su propia carpeta con documentación completa

---

## 🌍 Internacionalización

**UI Language:** 100% español - todos los textos visibles al usuario
**Database Values:** Inglés técnico (indoor, active, greenhouse) para compatibilidad API
**User Display:** Traducciones automáticas desde `messages/es.json`
**Example:** BD guarda "indoor", usuario ve "Interior"

---

## 🎯 Technology Stack

**Complete Stack:**
- Frontend: Dual-mode (Bubble + Next.js 14)
- Database: Convex (serverless, real-time)
- Auth: Clerk (Organizations = Companies)
- API: RESTful API (v1) for frontend-agnostic access
- Deployment: Vercel + Convex Cloud
- i18n: UI 100% español, datos técnicos en inglés

**Dual-Frontend Architecture:**
- **Bubble Frontend:** Rapid prototyping, 80% of standard UI
- **Next.js Frontend:** Complex features, custom workflows
- **Shared Backend:** Single Convex database + REST API

**Regional Configuration (Colombia Default):**
- Multilingual (default locale: "es")
- Configurable timezone (default: America/Bogota)
- Multi-currency support (default: COP with formatting $290.000)
- Regional administrative codes (e.g., DANE in Colombia)
- Configurable coordinate systems (e.g., MAGNA-SIRGAS in Colombia)

---

## 🔄 Development Workflow

### Agentic Development System

**Quick Start with CLAUDE.MD:**
```bash
@state current           # Check current project state
@implement module-1      # Load context and implement MODULE 1
@review                  # Review implementation against requirements
@pr create module-1      # Generate comprehensive PR
```

**3-Step Workflow:**
1. **Plan** - User specifies module, Claude loads context from core docs
2. **Implement** - Claude implements with incremental git commits
3. **PR** - Claude generates comprehensive PR description (archives all decisions)

**Key Documents:**
- [CLAUDE.MD](../CLAUDE.MD) - Context engineering agent with commands (~1500 tokens)
- [dev/Agentic-Dev-System-Simple.md](dev/Agentic-Dev-System-Simple.md) - Complete workflow guide

---

## 📝 Implementation Order

**Phase 1: Onboarding (Modules 1-8)**
1. Authentication & Account Creation
2. Email Verification
3. Subscription & Payments
4. Company Profile Completion
5. Facility Creation
6. Crop Type Selection
7. Area Setup with Sample Data
8. Cultivars & Suppliers Setup

**Phase 2: Core Operations (Modules 9-13)**
9. Inventory Management
10. Production Templates
11. Quality Check Templates + AI
12. Production Orders & Operations
13. AI Engine & Intelligent Services

**Phase 3: Advanced Features (Modules 14-17)**
14. Compliance & Reporting
15. Analytics & Business Intelligence
16. Mobile Experience & Media Management
17. Integrations & APIs

---

## 📚 Finding Documentation

**¿Buscas información sobre...?**

- **Features y requisitos:** → [core/Product-Requirements.md](core/Product-Requirements.md)
- **Arquitectura técnica:** → [core/Technical-Specification.md](core/Technical-Specification.md)
- **Estructura de base de datos:** → [core/Database-Schema.md](core/Database-Schema.md)
- **API REST:** → [core/API-Integration.md](core/API-Integration.md)
- **Módulo específico:** → [module-X/README.md](module-1/README.md)
- **Guías Bubble:** → [module-X/bubble/](module-1/bubble/)
- **Setup inicial:** → [foundation/](foundation/)
- **Estándares de desarrollo:** → [dev/](dev/)
- **Workflow de desarrollo:** → [CLAUDE.MD](../CLAUDE.MD)

---

## 🆕 Creating New Module Documentation

Cuando crees documentación para un nuevo módulo (e.g., Module 2):

1. Create folder: `docs/module-2/`
2. Create `README.md` with module overview and links
3. Add planning documents:
   - `Module-2-Planning.md`
   - `Module-2-Quick-Start.md`
   - `Module-2-Task-Board.md`
4. If dual-frontend, create `bubble/` subfolder:
   - `Module-2-Bubble-Guide.md`
   - `Module-2-Bubble-Quick-Start.md`
   - (Reutiliza `API-Bubble-Reference.md` si no hay nuevos endpoints)
5. Update this `README.md` with links to new module
6. Update [CLAUDE.MD](../CLAUDE.MD) with new module references

---

## 🎓 Getting Help

### Questions About Features
→ See [core/Product-Requirements.md](core/Product-Requirements.md)

### Questions About Implementation
→ See [core/Technical-Specification.md](core/Technical-Specification.md)

### Questions About Data Model
→ See [core/Database-Schema.md](core/Database-Schema.md)

### Questions About API
→ See [core/API-Integration.md](core/API-Integration.md)

### Questions About Development Workflow
→ See [CLAUDE.MD](../CLAUDE.MD) for commands and [dev/Agentic-Dev-System-Simple.md](dev/Agentic-Dev-System-Simple.md) for complete workflow

### Questions About Regional Compliance
All three core documents have regional compliance sections:
- Product Requirements: Compliance cross-reference (regional examples)
- Technical Spec: Compliance implementation (configurable by region)
- Database Schema: Regional fields (default: Colombia)

---

## 🚀 Next Steps

### For New Project

1. **Read core documents** (~90 minutes total)
   - [core/Product-Requirements.md](core/Product-Requirements.md) - What to build
   - [core/Technical-Specification.md](core/Technical-Specification.md) - How to build
   - [core/Database-Schema.md](core/Database-Schema.md) - Data structure

2. **Read development workflow** (~15 minutes)
   - [CLAUDE.MD](../CLAUDE.MD) - Quick command reference
   - [dev/Agentic-Dev-System-Simple.md](dev/Agentic-Dev-System-Simple.md) - Complete workflow guide

3. **Choose frontend approach**
   - **Option A:** Start with Bubble (faster prototyping, 6-8h for Module 1)
   - **Option B:** Start with Next.js (more features, 12-14h for Module 1)
   - **Option C:** Build both in parallel

4. **For Bubble:** Read [module-1/bubble/Module-1-Bubble-Quick-Start.md](module-1/bubble/Module-1-Bubble-Quick-Start.md)

5. **For Next.js:** Use CLAUDE.MD commands
   ```bash
   @state current          # Check current state
   @implement module-1     # Implement MODULE 1
   @review                 # Review implementation
   @pr create module-1     # Create comprehensive PR
   ```

6. **Continue with modules 2-17** following the same workflow

**Ready to build Alquemist efficiently!** 🚀

---

**Version:** 1.0
**Last Updated:** 2025-10-22
**Documentation Organization:** By module and purpose
