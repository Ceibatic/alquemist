---
name: review-module
description: >
  Auditoria profunda de modulos del proyecto Alquemist. Compara la documentacion
  de un modulo (docs/modules/) contra su implementacion real en codigo frontend
  (app/, components/) y backend (convex/), identifica gaps, analiza user stories
  en busca de aspectos esenciales faltantes de UI/UX e ingenieria, y propone un
  plan de implementacion. Usar cuando el usuario pida revisar, auditar o analizar
  un modulo, o cuando mencione un archivo de docs/modules/.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, TodoWrite
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

## Reglas de Auditoria

- Siempre leer los archivos fuente completos, nunca asumir basandose solo en nombres
- Reportar con referencia exacta a `archivo:linea` cuando sea posible
- Ser especifico: "falta validacion de email en signup-form.tsx:45" no "falta validacion"
- No proponer soluciones que requieran cambios arquitecturales mayores
- Si un archivo referenciado en el doc no existe, reportarlo como gap critico
- Si hay implementacion que NO esta en el doc, mencionarlo como "implementacion extra"
- Usar $ARGUMENTS como la ruta al archivo de documentacion del modulo a revisar

---

## Fase 6: Implementacion

⚠️ **PREREQUISITO**: Usuario debe haber aprobado explicitamente el plan de implementacion.

### Paso 1: Crear Branch de Git

PRIMER PASO obligatorio antes de cualquier implementacion:

```bash
git checkout main
git pull
git checkout -b fix/[modulo]-audit-[YYYY-MM-DD]
```

**Convenciones de nombres de branch:**
- Audit fixes: `fix/{modulo}-audit-{YYYY-MM-DD}`
- Module completion: `feat/{modulo}-completion`
- New module: `feat/{modulo}-implementation`
- Hotfixes: `hotfix/{issue-description}`

### Paso 2: Implementar Tareas del Plan

Implementar en orden de prioridad:
1. Tareas Criticas (bloquean funcionalidad core)
2. Tareas Importantes (afectan experiencia de usuario)
3. Tareas Menores (mejoras incrementales)

**Flujo para cada tarea:**

1. **Explorar codigo relacionado:**
   ```
   Glob: buscar archivos afectados
   Grep: buscar funciones/componentes existentes
   Read: leer implementaciones a modificar
   ```

2. **Implementar cambios:**
   - Usar Edit para modificar archivos existentes
   - Usar Write solo si se necesita crear archivo nuevo
   - Seguir patrones existentes del proyecto

3. **Validar build:**
   ```bash
   npm run build
   ```
   Si falla, corregir antes de continuar.

4. **Commit de la tarea:**
   ```bash
   git add [archivos especificos]
   git commit -m "fix(modulo): descripcion breve

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **Continuar con siguiente tarea**

**Commits de calidad:**
- Un cambio logico por commit (no acumular multiples features)
- Mensajes descriptivos en formato convencional:
  - `feat(module): add feature description`
  - `fix(module): fix bug description`
  - `refactor(module): refactor description`
  - `docs(module): update documentation`
- Siempre incluir Co-Authored-By en cada commit

### Paso 3: Actualizar Log Diario (MANDATORIO)

**Este paso NO es opcional. SIEMPRE debe ejecutarse al finalizar la implementacion.**

1. Crear o actualizar `docs/dev/logs/[YYYY-MM-DD].md`
2. Si el archivo no existe, crearlo con heading `# YYYY-MM-DD`
3. Agregar entrada con formato:

```markdown
## [HH:MM] [nombre-modulo] — [resumen breve de la auditoria]
- **Files:** `path/file1.ts`, `path/file2.ts`, `path/file3.tsx`
- **Why:** Audit de [MXX] revelo: [lista concisa de gaps encontrados y corregidos]
- **Commit:** `hash1`, `hash2`, `hash3`
```

4. Hacer commit del log:
```bash
git add docs/dev/logs/
git commit -m "docs: add implementation log for [modulo] audit"
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

**Despues de build exitoso, push:**
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
- [lista de fixes criticos con archivos modificados]

### Important
- [lista de fixes importantes con archivos modificados]

### Minor
- [lista de fixes menores con archivos modificados]

## Build Verification
- TypeScript compilation successful
- Build passes (`npm run build`)

## Test Plan
- [Como verificar que funciona]
- [User flows probados]

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

3. **Preguntar al usuario** si desea hacer merge

4. **Si acepta, merge:**
```bash
gh pr merge [numero] --merge
```

5. **Post-merge cleanup:**
```bash
git checkout main
git pull
git branch -d fix/[modulo]-audit-[fecha]
```

⚠️ **NUNCA hacer merge sin confirmacion explicita del usuario**

---

## Best Practices

### Branch Hygiene
- **Una branch = un modulo o feature**: No mezclar multiples modulos en una branch
- **Branches cortas**: Intentar merge en < 1 semana para evitar conflictos
- **Rebase antes de PR**: Si main avanzo, hacer `git rebase main` antes de crear PR
- **Limpieza post-merge**: Siempre eliminar branches locales despues de merge

### Code Review Checklist
Al revisar cambios antes de PR:
- TypeScript types correctos (no `any` innecesarios)
- Auth guards presentes en todas las mutations
- Validacion dual (frontend Zod + backend Convex)
- Estados de loading/error en UI
- Responsive design (mobile + desktop)
- Sin over-engineering (mantener simplicidad)
- Sigue patrones existentes del proyecto

### Manejo de Errores

**Si el build falla:**
1. Leer el error completo en consola
2. Identificar archivo y linea exacta
3. Corregir el problema
4. Commit del fix con mensaje descriptivo
5. Re-verificar build

**Si hay conflictos con main:**
1. `git fetch origin main`
2. `git rebase origin/main`
3. Resolver conflictos manualmente
4. `git rebase --continue`
5. Force push si es necesario: `git push --force-with-lease`

### Emergency Hotfixes

Para bugs criticos en produccion:
1. Crear branch desde main: `git checkout -b hotfix/[descripcion-bug]`
2. Fix minimo y especifico (no agregar features)
3. Build verification obligatoria
4. PR con prefijo "hotfix:" en titulo
5. Review inmediato
6. Merge prioritario

### Referencias Rapidas
- Convenciones de proyecto: `CLAUDE.md`
- Documentacion de modulos: `docs/modules/phase-{1,2,3,4}/`
- Patrones de codigo: `docs/patterns/`
- Logs de desarrollo: `docs/dev/logs/`
