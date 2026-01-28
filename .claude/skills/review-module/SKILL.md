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

## Fase 6: Implementación con Subagents

⚠️ **PREREQUISITO**: Usuario debe haber aprobado explícitamente el plan de implementación.

### Paso 1: Crear Branch de Git

PRIMER PASO obligatorio antes de cualquier implementación:

```bash
git checkout -b fix/[modulo]-audit-[YYYY-MM-DD] main
```

**Ejemplos de branches exitosos previos:**
- `fix/registration-audit-2026-01-27`
- `fix/area-management-audit-2026-01-27`
- `fix/user-invitation-audit-2026-01-27`
- `fix/facility-creation-audit-2026-01-27`

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

### Paso 4: Push y PR

1. **Push de la branch:**
```bash
git push -u origin fix/[modulo]-audit-[fecha]
```

2. **Preguntar al usuario** si desea crear un PR

3. **Si acepta, crear PR:**
```bash
gh pr create --title "fix([modulo]): audit implementation - [resumen]" --body "$(cat <<'EOF'
## Summary
[Resumen ejecutivo del audit report]

## Changes Implemented
### Critical
- [lista de fixes críticos]

### Important
- [lista de fixes importantes]

### Minor
- [lista de fixes menores]

## Test Plan
- [Cómo verificar que funciona]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

4. **Preguntar al usuario** si desea hacer merge

5. **Si acepta:** `gh pr merge [numero] --merge`

⚠️ **NUNCA hacer merge sin confirmación explícita del usuario**
