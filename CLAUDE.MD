# CLAUDE.MD - Alquemist Development Guide

**Version**: 3.0 | **Last Updated**: 2025-12-02

---

## Project Identity

**Alquemist** - Multi-region agricultural traceability SaaS for Cannabis, Coffee, Cocoa, and Flowers.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Convex (serverless) |
| Auth | Custom session tokens (30-day) |
| Email | Resend |

### Core Requirements
- Multi-tenant (company isolation)
- Batch-first tracking (50-1000 plants/batch)
- Mobile-first responsive
- Real-time updates (Convex subscriptions)

---

## Documentation Context

### Para planear/implementar un modulo:

| Documento | Proposito |
|-----------|-----------|
| `docs/testing/0X-PHASE-X-*.md` | Funcionalidades y casos de prueba |
| `docs/UI-PATTERNS.md` | Patrones de layout y UX |
| `convex/schema.ts` | Estructura de datos |
| `docs/ui/reference-images/` | Imagenes de referencia visual |

### Archivos de Testing por Fase:
- `docs/testing/01-PHASE-1-ONBOARDING-TESTS.md`
- `docs/testing/02-PHASE-2-MASTER-DATA-TESTS.md`
- `docs/testing/03-PHASE-3-TEMPLATES-TESTS.md`
- `docs/testing/04-PHASE-4-PRODUCTION-TESTS.md`

---

## Phase Status

| Phase | Descripcion | Status |
|-------|-------------|--------|
| 1 | Onboarding & Auth | ✅ Completada |
| 2 | Master Data (Areas, Cultivars, Suppliers, Users, Inventory) | 🟡 En progreso |
| 3 | Templates Management | ⚪ Pendiente |
| 4 | Production Workflows | ⚪ Pendiente |

### Phase 2 Modules:
- Module 8: Areas ✅
- Module 15: Cultivars ✅
- Module 16: Suppliers ✅
- Module 17: Users ✅
- Module 18: Facilities ✅
- Module 19: Inventory ✅
- Module 20: Facility Settings
- Module 21: Account Settings

---

## UI/UX Principles

Ver `docs/UI-PATTERNS.md` para patrones detallados.

### Colores
- **CTAs (Crear/Guardar)**: `bg-amber-500 hover:bg-amber-600`
- **Estados activos**: `bg-green-700 hover:bg-green-800`
- **Status badges**: green/yellow/red segun estado

### Patrones de Pagina
- **Lista**: Dropdown filtro + Search + Boton crear (una linea)
- **Detalle**: Tabs con iconos (Detalle, Lotes, Actividades, Inventario)
- **Cards**: Clickeables → navegan a detalle
- **Formularios**: Modal max-w-4xl con validacion Zod

### Responsive
- Mobile-first
- Grid: `lg:grid-cols-3 md:grid-cols-2`
- Botones: solo icono en mobile, texto en desktop

---

## Convex Backend

### Deployments
| Environment | URL | Usage |
|-------------|-----|-------|
| **Development** | https://exciting-shrimp-34.convex.cloud | Local development |
| **Production** | https://handsome-jay-388.convex.cloud | Vercel deployment |

**Current**: Development (exciting-shrimp-34)

### Auth Flow
1. Register → Email verification → Company setup → Facility setup
2. Login → Session token (30 days)
3. All requests: `Authorization: Bearer {token}`

### Multi-Tenant
- Cada registro tiene `company_id`
- Queries filtrados por company
- Session incluye company context

---

## Development Workflow

### Iniciar desarrollo de un modulo:

1. **Revisar funcionalidades**: Leer `docs/testing/0X-PHASE-X-*.md`
2. **Revisar patrones**: Leer `docs/UI-PATTERNS.md`
3. **Revisar schema**: Leer `convex/schema.ts` (tabla relevante)
4. **Implementar**: Seguir patrones establecidos
5. **Probar**: Ejecutar casos de prueba del documento

### Estructura de archivos por modulo:
```
app/(dashboard)/[module]/
├── page.tsx              # Lista principal
└── [id]/
    ├── page.tsx          # Detalle con tabs
    └── edit/page.tsx     # Formulario edicion

components/[module]/
├── [module]-list.tsx     # Componente de lista
├── [module]-card.tsx     # Card individual
├── [module]-create-modal.tsx
└── [module]-*-tab.tsx    # Tabs de detalle
```

---

## Setup Instructions

### Development
```bash
npm install
npm run dev          # Next.js en http://localhost:3000
npx convex dev       # Solo si modificas backend
```

### Build & Deploy
```bash
npm run build
npm run start
```

### Code Quality
```bash
npm run lint
npx tsc --noEmit     # Type check
```

---

## Work Rules

### Principios
- **Simplicidad**: Cambios minimos necesarios
- **No scope creep**: Solo lo pedido
- **Root cause**: Arreglar el problema real
- **Production-ready**: Cada cambio debe ser deployable

### Antes de implementar
1. Leer codigo existente
2. Entender patrones establecidos
3. Planificar cambios minimos

### Despues de implementar
- Verificar TypeScript: `npx tsc --noEmit`
- Probar funcionalidad manualmente
- Seguir casos de prueba del doc de testing
