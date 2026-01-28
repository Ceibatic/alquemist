---
name: review-module
description: >
  Auditoria profunda de modulos del proyecto Alquemist. Compara la documentacion
  de un modulo (docs/modules/) contra su implementacion real en codigo frontend
  (app/, components/) y backend (convex/), identifica gaps, analiza user stories
  en busca de aspectos esenciales faltantes de UI/UX e ingenieria, y propone un
  plan de implementacion. Usar cuando el usuario pida revisar, auditar o analizar
  un modulo, o cuando mencione un archivo de docs/modules/.
allowed-tools: Read, Glob, Grep, Bash, Task
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

## Fase 6: Flujo Git y CI/CD

Cuando el usuario apruebe el plan y se proceda a implementar:

### Al iniciar implementacion

1. Crear branch desde main:
   ```
   git checkout -b fix/[modulo]-audit-[fecha] main
   ```
   Ejemplo: `fix/registration-audit-2026-01-27`

### Durante implementacion

2. Hacer commit por cada tarea del plan completada (no acumular todo en un solo commit):
   ```
   git add [archivos relevantes]
   git commit -m "fix([modulo]): descripcion corta de la tarea"
   ```
   Usar prefijos convencionales: `fix()`, `feat()`, `refactor()`, `docs()`

### Al finalizar implementacion

3. Agregar entrada al log diario (`docs/dev/logs/YYYY-MM-DD.md`) siguiendo el formato de `CLAUDE.md`
4. Commit del log:
   ```
   git add docs/dev/logs/
   git commit -m "docs: add implementation log for [modulo] audit"
   ```
5. Push de la branch:
   ```
   git push -u origin fix/[modulo]-audit-[fecha]
   ```
6. **Preguntar al usuario** si desea crear un PR y merge a main:
   - Si acepta, crear PR via `gh pr create` con:
     - Titulo: `fix([modulo]): audit implementation - [resumen]`
     - Body: resumen ejecutivo de la auditoria + lista de commits realizados
   - Esperar confirmacion del usuario para merge
   - Si acepta merge: `gh pr merge [numero] --merge`
   - No hacer merge sin confirmacion explicita del usuario
