# Alquemist — Instrucciones de Proyecto

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript strict
- **UI:** Radix UI + shadcn/ui + Tailwind CSS + Lucide React (iconos)
- **Backend:** Convex (real-time serverless)
- **Auth:** Clerk (`@clerk/nextjs` + `@clerk/localizations` esES) + Convex integration (JWT template `convex`)
- **Forms:** React Hook Form + Zod
- **Tablas:** @tanstack/react-table
- **Graficas:** Recharts
- **Fechas:** date-fns
- **Drag & Drop:** @dnd-kit (core + sortable)
- **Temas:** next-themes (dark/light)
- **Notificaciones:** Sonner toasts
- **Email:** Resend (invitaciones, reportes) + Clerk (verificacion, password reset)
- **Webhooks:** Svix (verificacion de webhooks Clerk)
- **AI:** @google/generative-ai (Gemini)
- **Reportes:** pptxgenjs (generacion PowerPoint)

## Autenticacion (Clerk + Convex)

El proyecto usa **Clerk** para autenticacion con integracion oficial a Convex via JWT template. Las paginas de auth son **custom UI** (no Clerk pre-built components).

- **Middleware:** `clerkMiddleware` en `middleware.ts` con `createRouteMatcher` para rutas publicas/protegidas
- **Provider:** `ConvexProviderWithClerk` + `useAuth` en `components/providers/convex-client-provider.tsx`
- **JWT:** `convex/auth.config.ts` define provider con `applicationID: "convex"`
- **Auth helper:** `convex/authHelpers.ts` → `getAuthenticatedUserId()` resuelve identity.subject → users.clerkId
- **Webhook sync:** `POST /clerk-webhook` en `convex/http.ts` verifica firma via Svix, maneja `user.created/updated/deleted` via `convex/clerkSync.ts`
- **Race condition:** `ensureUserExists` mutation cubre el gap entre navegacion post-signup y llegada del webhook
- **Localizacion:** espanol (esES) aplicado al ClerkProvider

## Documentacion de Paginas (UI)

La carpeta `docs/pages/` es la **fuente de verdad** para entender que esta implementado en la interfaz. Cada subcarpeta documenta una seccion de la app con sus paginas, tabs, modales y wizards. **Consultar `docs/pages/INDEX.md` primero** para localizar rapidamente el archivo de documentacion necesario.

### Mapa de secciones

| Seccion | Ruta app | Contenido |
|---------|----------|-----------|
| `docs/pages/dashboard/` | `/` | Vistas admin/operativo, widgets, onboarding checklist |
| `docs/pages/facilities/` | `/facilities` | Listado, detalle, modal crear, utilities |
| `docs/pages/areas/` | `/areas` | Listado, tabs (produccion, inventario, cronograma, historial, detalle), estructuras, modal crear |
| `docs/pages/cultivars/` | `/cultivars` | Listado, modal crear, subpaginas |
| `docs/pages/production/` | `/production` | Tabs ordenes y actividades |
| `docs/pages/resources/` | `/resources` | Tabs productos/proveedores, wizard inventario, detalle producto |
| `docs/pages/templates/` | `/templates` | Tabs produccion/actividades/calidad, wizard actividades |
| `docs/pages/users/` | `/users` | Tabs usuarios/invitaciones, modales invitar/editar rol |
| `docs/pages/settings/` | `/settings` | Tabs general/perfil/seguridad/preferencias/ubicacion/licencias, suscripcion |

### Convenciones de archivos

- `README.md` — Vista general de la seccion (rutas, layout, archivos clave)
- `listado.md` — Pagina principal de listado (grid/tabla)
- `tab-*.md` — Documentacion de un tab especifico
- `modal-*.md` — Documentacion de un modal
- `wizard-*.md` — Wizard multi-paso
- `subpaginas.md` — Mapa de rutas hijas
- `vista-*.md` — Variantes de vista (ej: por rol)

### Mantenimiento

Al implementar una nueva pagina, tab, modal o wizard:
1. Crear o actualizar el archivo correspondiente en `docs/pages/<seccion>/`
2. Si es una seccion nueva, crear la subcarpeta con su `README.md`
3. Cada doc debe incluir: componentes usados, queries/mutations de Convex, interacciones, y estados

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
