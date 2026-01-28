---
name: review-module
description: >
  Auditoria profunda de modulos del proyecto Alquemist. Compara la documentacion
  de un modulo (docs/modules/) contra su implementacion real en codigo frontend
  (app/, components/) y backend (convex/), identifica gaps, analiza user stories
  en busca de aspectos esenciales faltantes de UI/UX e ingenieria, y propone un
  plan de implementacion. Usar cuando el usuario pida revisar, auditar o analizar
  un modulo, o cuando mencione un archivo de docs/modules/.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task
---

# Review Module

Auditar un modulo de Alquemist comparando su documentacion contra la implementacion real.

## Proceso

### Fase 1: Parsear el documento del modulo

1. Leer el archivo de documentacion del modulo proporcionado por el usuario
2. Extraer y catalogar:
   - **User Stories** con sus criterios de aceptacion (cada checkbox `- [ ]`)
   - **Componentes referenciados** (paths a archivos en `app/`, `components/`)
   - **Funciones backend** (mutations, queries en `convex/`)
   - **Schema/campos** de base de datos
   - **Validaciones** descritas
   - **Flujo de pantallas**
   - **Mensajes de error** e **integraciones** con otros modulos

### Fase 2: Auditar implementacion frontend

Para cada componente y pagina referenciada en el doc:

1. Leer el archivo fuente completo
2. Verificar contra cada criterio de aceptacion:
   - Campos de formulario presentes y con validacion correcta
   - Estados de UI (loading, error, disabled, success)
   - Navegacion y redirects
   - Responsive design (clases Tailwind mobile/desktop)
   - Accesibilidad basica (labels, aria, focus management)
   - Manejo de edge cases (campos opcionales, limites)
3. Buscar componentes relacionados no listados en el doc usando `Grep` y `Glob`

### Fase 3: Auditar implementacion backend

Para cada funcion de Convex referenciada:

1. Leer el archivo fuente en `convex/`
2. Verificar:
   - La funcion existe con los parametros documentados
   - Validaciones backend descritas estan implementadas
   - Schema en `convex/schema.ts` coincide con los campos documentados
   - Manejo de errores con codigos correctos
   - Rate limiting si esta documentado
   - Integracion con otros modulos (imports, llamadas cruzadas)

### Fase 4: Analisis de User Stories

Evaluar cada user story buscando aspectos ESENCIALES faltantes. Enfocarse solo en:

**UI/UX esencial:**
- Feedback visual al usuario en operaciones (loading, success, error)
- Estados vacios (empty states) cuando aplique
- Mensajes de error claros y accionables
- Flujo logico sin callejones sin salida
- Mobile-first si no esta especificado

**Ingenieria esencial:**
- Validacion tanto en frontend como backend (no solo en uno)
- Manejo de errores de red/servidor
- Proteccion de rutas (auth guards)
- Consistencia de datos (race conditions obvias)
- Seguridad basica (sanitizacion de inputs, CSRF si aplica)

**NO recomendar** (se considera sobreingenieria):
- Tests unitarios o e2e a menos que ya exista infraestructura de testing
- Internacionalizacion si no esta en el roadmap
- Analytics o telemetria
- Logging avanzado
- Abstracciones o utilidades para casos unicos
- Feature flags
- Backwards compatibility innecesaria
- Optimizaciones de performance sin evidencia de problemas
- Documentacion adicional

### Fase 5: Generar reporte

Producir un reporte estructurado en este formato:

```markdown
# Auditoria: [Nombre del Modulo]

## Resumen Ejecutivo
Parrafo breve del estado general: que porcentaje esta implementado,
cuales son los gaps criticos, y valoracion general.

## Implementacion Frontend

### Implementado correctamente
- [lista de criterios cumplidos con referencia al archivo:linea]

### Faltante o incompleto
- [criterio] - [que falta] - Archivo: [path esperado]

## Implementacion Backend

### Implementado correctamente
- [lista de funciones implementadas con referencia al archivo:linea]

### Faltante o incompleto
- [funcion/validacion] - [que falta] - Archivo: [path esperado]

## Gaps en User Stories
Aspectos esenciales no cubiertos por las user stories actuales:
- [gap identificado] - [por que es esencial] - [sugerencia concreta]

## Plan de Implementacion

Ordenado por prioridad (critico > importante > menor):

### Critico (bloquea funcionalidad core)
1. [tarea] - Archivos: [paths] - Descripcion breve

### Importante (afecta experiencia de usuario)
1. [tarea] - Archivos: [paths] - Descripcion breve

### Menor (mejora incremental)
1. [tarea] - Archivos: [paths] - Descripcion breve
```

## Reglas

- Siempre leer los archivos fuente completos, nunca asumir basandose solo en nombres
- Reportar con referencia exacta a `archivo:linea` cuando sea posible
- Ser especifico: "falta validacion de email en signup-form.tsx:45" no "falta validacion"
- No proponer soluciones que requieran cambios arquitecturales mayores
- Si un archivo referenciado en el doc no existe, reportarlo como gap critico
- Si hay implementacion que NO esta en el doc, mencionarlo como "implementacion extra"
- Usar $ARGUMENTS como la ruta al archivo de documentacion del modulo a revisar

## Reglas de Implementación

- **SIEMPRE implementar TODAS las tareas del plan** (Crítico + Importante + Menor) a menos que el usuario diga lo contrario
- **SIEMPRE actualizar el log diario** al finalizar - esto NO es opcional
- Usar agents especializados vía Task tool para implementación
- Hacer commit después de cada tarea completa (no acumular)
- Incluir `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` en cada commit
- Crear branch ANTES de cualquier implementación
- NO hacer merge sin confirmación explícita del usuario
- Verificar build (`npm run build`) antes de crear PR
- Seguir convenciones de commits: `feat(module):`, `fix(module):`, `docs(module):`

## Fase 6: Implementación con Subagents

⚠️ **PREREQUISITO**: Usuario debe haber aprobado explícitamente el plan de implementación.

### Paso 1: Crear Branch de Git

PRIMER PASO obligatorio antes de cualquier implementación:

```bash
git checkout -b fix/[modulo]-audit-[YYYY-MM-DD] main
```

**Convenciones de nombres de branch:**
- Audit fixes: `fix/{modulo}-audit-{YYYY-MM-DD}`
- Module completion: `feat/{modulo}-completion`
- New module: `feat/{modulo}-implementation`
- Hotfixes: `hotfix/{issue-description}`

**Ejemplos de branches exitosos previos:**
- `fix/registration-audit-2026-01-27`
- `fix/area-management-audit-2026-01-27`
- `feat/batches-completion`
- `feat/quality-checks-implementation`

**IMPORTANTE:** Verificar que estás en main y actualizado antes de crear branch:
```bash
git checkout main
git pull
git checkout -b fix/[modulo]-audit-[YYYY-MM-DD]
```

### Paso 2: Implementar TODAS las Tareas del Plan

Implementar en orden de prioridad pero **SIN OMITIR ninguna categoría**:
1. Tareas Críticas (bloquean funcionalidad core)
2. Tareas Importantes (afectan experiencia de usuario)
3. Tareas Menores (mejoras incrementales)

**Método de implementación:**

Para cada tarea del plan:

1. **Determinar el agent apropiado**:
   - Cambios en `convex/` → usar Task con subagent `backend-dev`
   - Cambios en `app/`, `components/` → usar Task con subagent `frontend-dev`
   - Cambios que afectan ambos → dividir en 2 tasks separadas

2. **Lanzar Task con instrucciones específicas**:
   ```
   Usar Task tool con:
   - subagent_type: "backend-dev" o "frontend-dev"
   - description: "Implementar [nombre de tarea]"
   - prompt: Instrucciones detalladas incluyendo:
     * Archivos a modificar (paths específicos)
     * Qué cambio hacer exactamente
     * Commit message esperado: "fix([modulo]): [descripción]"
     * Recordar incluir Co-Authored-By
   ```

3. **Esperar a que el task complete** antes de lanzar el siguiente

4. **NO omitir tareas menores** a menos que el usuario explícitamente diga "solo implementa crítico e importante"

**Commits de calidad:**
- Un cambio lógico por commit (no acumular múltiples features)
- Mensajes descriptivos en formato convencional:
  - `feat(module): add feature description`
  - `fix(module): fix bug description`
  - `refactor(module): refactor description`
  - `docs(module): update documentation`
- Siempre incluir Co-Authored-By en cada commit
- Commits frecuentes = mejor trazabilidad

**Ejemplo de uso de Task:**

```
Task para backend-dev:
- Archivo: convex/areas.ts
- Cambio: Agregar auth guard getAuthUserId(ctx) al inicio de createArea mutation
- Validar que ctx esté tipado correctamente
- Commit: "fix(areas): add auth guard to createArea mutation"
```

### Paso 3: Actualizar Log Diario (MANDATORIO)

**Este paso NO es opcional. SIEMPRE debe ejecutarse al finalizar la implementación.**

1. Crear o actualizar `docs/dev/logs/[YYYY-MM-DD].md`
2. Si el archivo no existe, crearlo con heading `# YYYY-MM-DD`
3. Agregar entrada con formato:

```markdown
## [HH:MM] [nombre-modulo] — [resumen breve de la auditoría]
- **Files:** `path/file1.ts`, `path/file2.ts`, `path/file3.tsx`
- **Why:** Audit de [MXX] reveló: [lista concisa de gaps encontrados y corregidos]
- **Commit:** `hash1`, `hash2`, `hash3`
```

4. Hacer commit del log:
```bash
git add docs/dev/logs/
git commit -m "docs: add implementation log for [modulo] audit"
```

**Ejemplo real:**
```markdown
## [14:30] areas — M08 audit implementation
- **Files:** `convex/areas.ts`, `components/areas/area-form.tsx`, `app/(dashboard)/areas/page.tsx`
- **Why:** Audit de M08 reveló: auth guards faltantes en mutations, validación única de nombre por facility, campos dimension y toggles de iluminación/riego faltantes
- **Commit:** `a170d75`, `9b2afc6`, `5774067`, `57a510f`
```

### Paso 4: Verificar Build y Push

**ANTES de push, verificar build:**
```bash
npm run build
```

Si el build falla:
- Corregir errores TypeScript inmediatamente
- Hacer commit del fix
- Re-verificar build

**Después de build exitoso, push:**
```bash
git push -u origin fix/[modulo]-audit-[fecha]
```

### Paso 5: Crear Pull Request

1. **Preguntar al usuario** si desea crear un PR

2. **Si acepta, crear PR:**
```bash
gh pr create --title "fix([modulo]): audit implementation - [resumen]" --body "$(cat <<'EOF'
## Summary
[Resumen ejecutivo del audit report]

## Changes Implemented

### Critical
- [lista de fixes críticos con archivos modificados]

### Important
- [lista de fixes importantes con archivos modificados]

### Minor
- [lista de fixes menores con archivos modificados]

## Module Status
- **Before:** {percentage}% complete
- **After:** {percentage}% complete
- **Coverage:** Backend {%}, Frontend {%}, Security {%}

## Build Verification
- ✅ TypeScript compilation successful
- ✅ Build passes (`npm run build`)
- ✅ No linting errors

## Test Plan
- [Cómo verificar que funciona]
- [User flows probados]
- [Edge cases verificados]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

3. **Preguntar al usuario** si desea hacer merge

4. **Si acepta, verificar antes de merge:**
   - Build pasó en local
   - No hay conflictos con main
   - Commits están limpios y bien formateados
   - Dev log está actualizado

5. **Merge:**
```bash
# Merge normal (mantiene historial de commits)
gh pr merge [numero] --merge

# O squash merge (condensa múltiples commits en uno)
gh pr merge [numero] --squash
```

**Uso de squash merge:**
- Si hay muchos commits pequeños/incrementales: usar `--squash`
- Si commits son lógicos y bien organizados: usar `--merge`
- En duda, preguntar al usuario

6. **Post-merge cleanup:**
```bash
git checkout main
git pull
git branch -d fix/[modulo]-audit-[fecha]
```

⚠️ **NUNCA hacer merge sin confirmación explícita del usuario**

### Paso 6: Documentación Post-Merge

Después del merge exitoso:
1. Verificar que el módulo actualice su estado en `docs/modules/` si cambió el porcentaje
2. Cerrar issues relacionados si los hay
3. Si el módulo alcanzó 100%, considerar mencionarlo en changelog o release notes

---

## Best Practices del Workflow

### Branch Hygiene
- **Una branch = un módulo o feature**: No mezclar múltiples módulos en una branch
- **Branches cortas**: Intentar merge en < 1 semana para evitar conflictos
- **Rebase antes de PR**: Si main avanzó, hacer `git rebase main` antes de crear PR
- **Limpieza post-merge**: Siempre eliminar branches locales después de merge

### Calidad de Commits
**Buenos commits:**
```
feat(batches): add split wizard with quantity validation
fix(batches): correct area_id field name in filter logic
docs(batches): update M25 status to 100% complete
```

**Malos commits (EVITAR):**
```
updates
fix bug
wip
changes
quick fix
```

### Code Review Checklist
Al revisar cambios antes de PR:
- ✅ TypeScript types correctos (no `any` innecesarios)
- ✅ Auth guards presentes en todas las mutations
- ✅ Validación dual (frontend Zod + backend Convex)
- ✅ Estados de loading/error en UI
- ✅ Responsive design (mobile + desktop)
- ✅ Sin over-engineering (mantener simplicidad)
- ✅ Sigue patrones existentes del proyecto

### Manejo de Errores Durante Implementación

**Si el build falla:**
1. Leer el error completo en consola
2. Identificar archivo y línea exacta
3. Corregir el problema
4. Commit del fix con mensaje descriptivo
5. Re-verificar build

**Si una task falla:**
1. Revisar output del agent
2. Determinar si es un problema de prompt o de código
3. Corregir y re-lanzar task
4. No continuar con siguiente task hasta resolver

**Si hay conflictos con main:**
1. `git fetch origin main`
2. `git rebase origin/main`
3. Resolver conflictos manualmente
4. `git rebase --continue`
5. Force push si es necesario: `git push --force-with-lease`

### Emergency Hotfixes

Para bugs críticos en producción:
1. Crear branch desde main: `git checkout -b hotfix/[descripcion-bug]`
2. Fix mínimo y específico (no agregar features)
3. Build verification obligatoria
4. PR con prefijo "hotfix:" en título
5. Review inmediato
6. Merge prioritario

### Tips de Productividad
- **Draft PRs**: Crear PR en modo draft para feedback temprano
- **Commits atómicos**: Cada commit debe ser compilable por sí solo
- **Build local siempre**: Nunca confiar en que "debería funcionar" sin verificar
- **PRs pequeños**: Ideal < 500 líneas cambiadas (más fácil de revisar)
- **Comunicación**: Si hay dudas arquitecturales, preguntar antes de implementar

### Referencias Rápidas
- Convenciones de proyecto: `CLAUDE.md`
- Documentación de módulos: `docs/modules/phase-{1,2,3,4}/`
- Patrones de código: `docs/patterns/`
- Logs de desarrollo: `docs/dev/logs/`
