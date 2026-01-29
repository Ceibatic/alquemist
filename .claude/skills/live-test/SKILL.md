---
name: live-test
description: >
  Testing manual guiado de módulos de Alquemist. Lee la documentación de un módulo,
  extrae user stories y criterios de aceptación, guía al usuario paso a paso para
  probar cada funcionalidad en la app, y cuando algo falla, explora el código
  (frontend, backend, schema) y lo arregla con buenas prácticas.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Task, AskUserQuestion
---

# Live Test

Testing manual guiado de módulos de Alquemist. Esta skill coordina sesiones interactivas de testing donde el usuario prueba funcionalidades en la app mientras la skill diagnostica y corrige problemas en tiempo real.

## Propósito

A diferencia de `review-module` (que audita código estático), `live-test` es **interactiva y conversacional**:
- El usuario prueba la app en vivo
- Reporta qué funciona y qué falla
- La skill explora el código exhaustivamente
- Aplica fixes automáticos (simples) o con aprobación (complejos)
- Genera reporte conciso al final

## Input

`$ARGUMENTS` = ruta al archivo de documentación del módulo (ej: `docs/modules/phase-2/M08-area-management.md`)

## Entorno de Testing

**IMPORTANTE**: Las pruebas se realizan en el **entorno de producción**:
- **URL base**: `https://app.alquemist.co`
- **Backend**: Convex production deployment
- **Datos**: Datos reales de producción

Todas las instrucciones de rutas deben usar el dominio completo: `https://app.alquemist.co/ruta`

---

## Fase 1: Parsear Documentación del Módulo

### Objetivo
Extraer toda la información estructurada del módulo para guiar el testing.

### Acciones

1. **Leer el archivo de documentación** usando Read tool
   - Path: `$ARGUMENTS`
   - Leer completo para obtener todo el contexto

2. **Extraer información clave**:
   - **Código y nombre del módulo**: De la primera línea (ej: `# Module 08: Area Management`)
   - **Estado del módulo**: Línea con `**Estado**: [...]`
   - **User Stories**: Todas las secciones `### US-XX.Y: [Título]`

3. **Para cada User Story, extraer**:
   - ID (ej: `US-08.1`)
   - Título (ej: `Ver lista de areas`)
   - Descripción Como/Quiero/Para
   - **Criterios de Aceptación**: Todos los items `- [ ]`
   - **Consultas**: Línea `**Consulta:**` o `**Query:**`
   - **Escribe**: Línea `**Escribe:**` o `**Mutation:**`
   - **Componentes**: Línea `**Componentes:**` con links a archivos
   - **Validaciones**: Sección `**Validaciones backend:**`
   - **Ruta a probar**: Si hay links a `/ruta` en los criterios

4. **Contar totales**:
   - Total de user stories
   - Total de criterios de aceptación
   - Componentes únicos mencionados
   - Queries y mutations únicas

### Output de esta fase

Una estructura mental o lista con:
```
Módulo: M08 - Area Management
Estado: Implementado
User Stories: 5
Criterios totales: 42
Componentes: 8 archivos
Backend: 6 queries, 4 mutations
```

---

## Fase 2: Presentar Plan de Pruebas

### Objetivo
Informar al usuario qué se va a probar y confirmar inicio.

### Acciones

1. **Mostrar resumen del módulo**:
   ```
   📋 Módulo a probar: M[XX] - [Nombre]
   📝 User Stories: [N]
   ✓ Criterios de aceptación: [N]
   🎯 Componentes: [N]
   🔧 Backend: [N] queries, [N] mutations
   ```

2. **Listar todas las user stories** con formato:
   ```
   User Stories a probar:
   1. US-XX.1: [Título] ([N] criterios)
   2. US-XX.2: [Título] ([N] criterios)
   ...
   ```

3. **Confirmar inicio**:
   ```
   Vamos a probar todas las user stories en orden.

   👉 ¿Listo para empezar?
   ```

   Usar texto simple, NO usar AskUserQuestion aquí (es solo confirmación).

---

## Fase 3: Ciclo de Testing Iterativo

Esta es la fase principal. Para cada user story, seguir el ciclo:

### 3.1. Presentar User Story

**Formato de presentación**:

```markdown
---
## 🧪 Probando: US-XX.Y - [Título]

**Como** [actor]
**Quiero** [acción]
**Para** [objetivo]

**Criterios de Aceptación** ([N]):
1. [ ] [Criterio 1]
2. [ ] [Criterio 2]
...

**Ruta a probar**: `https://app.alquemist.co/ruta` (si aplica)

**Componentes involucrados**:
- [archivo1.tsx]
- [archivo2.tsx]

**Backend**:
- Query: [nombre]({ params })
- Mutation: [nombre]({ params })
---

👉 **Acción**: [Instrucción específica de qué probar en la app usando https://app.alquemist.co]

¿Cómo fue la prueba?
```

**Luego**, esperar respuesta del usuario. NO usar AskUserQuestion, solo texto.

### 3.2. Recopilar Resultados del Usuario

El usuario responderá en texto libre. Analizar su respuesta:

- Si dice "todo bien", "todo funciona", "pasó", etc. → Marcar US como ✅ y continuar
- Si menciona problemas, errores, o criterios específicos → Ir a 3.3

### 3.3. Debugging y Fix Interactivo

**IMPORTANTE**: Debugging exhaustivo - leer TODOS los archivos relacionados antes de diagnosticar.

#### Paso 1: Recopilar detalles del problema

Preguntar al usuario (texto, no AskUserQuestion):
```
Para diagnosticar mejor el problema, necesito saber:
- ¿Qué criterios específicamente fallaron? (números de la lista)
- ¿Qué comportamiento observaste?
- ¿Hubo errores en la consola del navegador?
- ¿Hubo errores en el Convex dashboard?
```

#### Paso 2: Explorar código exhaustivamente

**Orden de exploración**:

1. **Componentes frontend mencionados en la US**
   - Leer archivos completos con Read tool
   - Buscar imports, props, estados, handlers

2. **Funciones backend mencionadas**
   - Leer archivos completos en `convex/`
   - Verificar auth guards, validaciones, parámetros

3. **Schema si es relevante**
   - Leer `convex/schema.ts`
   - Verificar que las tablas y campos existen

4. **Archivos relacionados** (si es necesario)
   - Usar Grep para buscar referencias cruzadas
   - Usar Glob para encontrar archivos relacionados

**Regla**: NUNCA proponer un fix sin haber leído el código completo primero.

#### Paso 3: Identificar el problema

Comparar código vs criterios de aceptación. Verificar:

**Seguridad crítica**:
- ✓ Auth guards en todas las mutations (`getAuthUserId(ctx)`)
- ✓ Validación de ownership (usuario solo accede a sus recursos)

**Validaciones**:
- ✓ Validación dual: frontend (Zod) + backend (Convex validators)
- ✓ Campos requeridos marcados correctamente
- ✓ Unicidad donde aplique (ej: nombres únicos por facility)

**Estados de UI**:
- ✓ Loading states durante operaciones async
- ✓ Error states con mensajes claros
- ✓ Success feedback (toasts, redirects)
- ✓ Disabled states durante submit

**Navegación**:
- ✓ Rutas correctas en links y redirects
- ✓ Parámetros de ruta correctos

**Edge cases**:
- ✓ Estados vacíos (empty states)
- ✓ Manejo de errores de red
- ✓ Validación de permisos

#### Paso 4: Clasificar complejidad del fix

**Fix simple** (aplicar automáticamente sin preguntar):
- Import faltante (1 línea)
- Typo en string o variable (1-2 líneas)
- Prop faltante en componente (1 línea)
- Estado loading/disabled obvio (1-2 líneas)
- Ajuste de styling (1-3 líneas)

**Fix complejo** (requiere aprobación):
- Auth guards en backend
- Validaciones de lógica de negocio
- Cambios en múltiples archivos (3+)
- Modificaciones a schema de DB
- Lógica de navegación o routing
- Error handling con múltiples casos

#### Paso 5a: Aplicar fix simple automáticamente

Si el fix es simple:

1. **Aplicar el fix** con Edit tool
2. **Hacer commit inmediatamente**:
   ```bash
   git add [archivo]
   git commit -m "$(cat <<'EOF'
   fix([modulo]): [descripción corta]

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

3. **Notificar al usuario**:
   ```
   🔧 Fix automático aplicado:
   - Archivo: [path]:[línea]
   - Cambio: [descripción breve]
   - Commit: [hash]

   👉 Por favor, recarga la app y prueba de nuevo.
   ```

4. **Esperar re-test del usuario**

#### Paso 5b: Proponer fix complejo y pedir aprobación

Si el fix es complejo:

1. **Explicar el problema claramente**:
   ```
   📍 Problema identificado:
   - Archivo(s): [paths]
   - Issue: [descripción del problema]
   - Impacto: [qué no funciona por esto]
   ```

2. **Proponer solución**:
   ```
   🔧 Fix propuesto:
   1. [Paso 1 del fix]
   2. [Paso 2 del fix]
   ...

   Archivos a modificar:
   - [archivo1]: [qué cambiar]
   - [archivo2]: [qué cambiar]
   ```

3. **Pedir decisión al usuario** (texto, no AskUserQuestion):
   ```
   ¿Cómo quieres proceder?
   A) Aplica el fix propuesto
   B) Muéstrame el código exacto que cambiarás
   C) Propón otra solución
   ```

4. **Según respuesta**:
   - **Opción A**: Aplicar fix y hacer commit
   - **Opción B**: Mostrar diff del código y luego preguntar si aplicar
   - **Opción C**: Re-analizar y proponer alternativa

5. **Después de aplicar**:
   - Hacer commit con formato correcto
   - Notificar al usuario
   - Pedir re-test

#### Paso 6: Iterar hasta resolver

Si el usuario reporta que sigue sin funcionar:
1. Re-explorar código más profundamente
2. Buscar causas secundarias
3. Proponer nuevo fix
4. Repetir ciclo

Si después de 3 intentos no se resuelve:
```
⚠️ Este problema requiere investigación más profunda.

Opciones:
- Pausar esta US y marcarla como "Bloqueada" para revisión posterior
- Continuar con las siguientes user stories
- Detener el testing aquí

¿Qué prefieres?
```

### 3.4. Marcar User Story y Continuar

Una vez que la user story pasa (o se decide pausarla):

1. **Actualizar estado**:
   - ✅ Pasó: Todos los criterios funcionan
   - ⚠️ Parcial: Algunos criterios funcionan, otros pendientes
   - ❌ Bloqueada: No se pudo resolver, requiere investigación

2. **Mostrar progreso**:
   ```
   ✅ US-XX.Y completada ([N] fixes aplicados)

   Progreso: [N]/[Total] user stories probadas
   ```

3. **Continuar** con la siguiente user story (volver a 3.1)

---

## Fase 4: Reporte Final

Al terminar todas las user stories (o cuando el usuario decida parar), generar reporte conciso.

### Formato del Reporte

```markdown
# 📊 Testing: M[XX] - [Nombre del Módulo] (YYYY-MM-DD)

## Resultados

| ID | User Story | Status |
|----|-----------|--------|
| US-XX.1 | [Título] | ✅ Pasó |
| US-XX.2 | [Título] | ✅ Pasó (1 fix) |
| US-XX.3 | [Título] | ⚠️ Parcial |
| US-XX.4 | [Título] | ❌ Bloqueada |

**Cobertura**: [N]/[Total] criterios probados ([%]%)

## Fixes Aplicados ([N] total)

1. **[Título del fix]** - `[archivo]:[línea]` - Commit: [hash]
2. **[Título del fix]** - `[archivo]:[línea]` - Commit: [hash]
...

## Pendientes

- [Descripción de problema pendiente 1]
- [Descripción de problema pendiente 2]

---

🤖 Testing guiado por Claude Code
```

### Guardar el Reporte

1. **Crear directorio si no existe**:
   ```bash
   mkdir -p docs/testing/results
   ```

2. **Guardar reporte**:
   - Path: `docs/testing/results/live-test-M[XX]-YYYY-MM-DD.md`
   - Contenido: El reporte generado arriba

3. **Actualizar log diario**:
   - Path: `docs/dev/logs/YYYY-MM-DD.md`
   - Agregar entrada:
     ```markdown
     ## [HH:MM] [modulo] — live testing session
     - **Files:** `[archivos modificados por fixes]`
     - **Why:** Testing manual de M[XX] reveló y corrigió: [resumen breve]
     - **Commit:** `[hashes]`
     ```

4. **Hacer commit del log**:
   ```bash
   git add docs/
   git commit -m "docs: add live testing results for M[XX]"
   ```

---

## Reglas y Mejores Prácticas

### Reglas de Interacción

1. **Tono conversacional**: Guía amigable, no robótico
2. **Instrucciones claras**: Decir exactamente qué hacer en la app
3. **Opciones explícitas**: Cuando hay decisión, dar opciones A/B/C
4. **Feedback continuo**: Mantener al usuario informado del progreso
5. **NO usar AskUserQuestion**: Mantener conversación en texto libre (más natural)

### Reglas de Debugging

1. **SIEMPRE leer archivos completos** antes de proponer fixes
2. **Exploración exhaustiva**: Frontend + Backend + Schema si es relevante
3. **Comparar vs documentación**: El criterio de aceptación es la fuente de verdad
4. **Verificar patrones del proyecto**: Consultar `CLAUDE.md` para convenciones
5. **Priorizar seguridad**: Auth guards y validaciones son críticos
6. **No over-engineer**: Fix mínimo necesario, sin abstracciones innecesarias

### Reglas de Commits

1. **Formato**: `fix([modulo]): [descripción corta del fix]`
2. **Co-authored**: SIEMPRE incluir `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
3. **Un fix = un commit**: No acumular múltiples fixes
4. **Commit inmediato**: Hacer commit apenas se aplica el fix
5. **Mensaje claro**: Describir QUÉ se arregló, no cómo

### Autonomía de Fixes

**Fixes simples (aplicar automáticamente)**:
- Imports faltantes
- Typos
- Props faltantes (1 línea)
- Estados loading/disabled obvios
- Styling básico

**Notificar después**, no pedir permiso antes.

**Fixes complejos (pedir aprobación)**:
- Auth guards
- Validaciones de negocio
- Múltiples archivos (3+)
- Schema changes
- Lógica de navegación
- Error handling complejo

**Explicar y pedir** permiso antes de aplicar.

### NO Hacer (Over-engineering)

- ❌ Tests unitarios o e2e (sin infraestructura de testing)
- ❌ Logging avanzado o telemetría
- ❌ Abstracciones para casos únicos
- ❌ Feature flags o A/B testing
- ❌ Backwards compatibility innecesaria
- ❌ Optimizaciones sin evidencia de problemas
- ❌ Documentación adicional (código debe ser autoexplicativo)

### Herramientas por Tipo de Problema

| Problema | Herramienta | Subagent |
|----------|------------|----------|
| Frontend: prop faltante | Edit | N/A |
| Frontend: estado UI | Edit | N/A |
| Frontend: complejo (múltiples componentes) | Task | frontend-dev |
| Backend: auth guard | Edit | N/A |
| Backend: validación simple | Edit | N/A |
| Backend: lógica compleja | Task | backend-dev |
| Schema: campo faltante | Edit + revisar migrations | N/A |
| TypeScript: errores de tipos | Edit o Task | typescript-expert |
| Múltiples archivos + lógica | Task | apropiado según área |

### Formato de Comunicación

**Emojis útiles** (usar con moderación):
- 🧪 Testing en curso
- ✅ Pasó / Completado
- ⚠️ Advertencia / Parcial
- ❌ Falló / Bloqueado
- 🔧 Fix aplicado
- 📍 Problema identificado
- 👉 Acción para el usuario
- 📊 Reporte / Resultados

**Estructura de mensajes**:
1. Contexto breve (qué estamos haciendo)
2. Acción clara (qué debe hacer el usuario)
3. Opciones si aplica (A/B/C)
4. Siguiente paso obvio

---

## Ejemplo de Sesión Completa

```
[Skill invocada con: docs/modules/phase-2/M08-area-management.md]

📋 Módulo a probar: M08 - Area Management
📝 User Stories: 5
✓ Criterios de aceptación: 42
🎯 Componentes: 8
🔧 Backend: 6 queries, 4 mutations

User Stories a probar:
1. US-08.1: Ver lista de areas (8 criterios)
2. US-08.2: Filtrar y buscar areas (7 criterios)
3. US-08.3: Crear nueva area (15 criterios)
4. US-08.4: Editar area existente (10 criterios)
5. US-08.5: Eliminar area (2 criterios)

Vamos a probar todas las user stories en orden. ¿Listo para empezar?

[Usuario: sí]

---
## 🧪 Probando: US-08.1 - Ver lista de areas

**Como** operador de producción
**Quiero** ver todas las áreas de mi instalación
**Para** conocer la organización espacial y disponibilidad

**Criterios de Aceptación** (8):
1. [ ] Muestra grid de cards con todas las áreas
2. [ ] Cada card muestra: código, nombre, tipo, área m²
3. [ ] Cards son clickeables y navegan a /areas/[id]
4. [ ] Menu kebab con opción "Editar"
5. [ ] Si tiene control climático, muestra specs
6. [ ] Muestra timestamp de última actualización
7. [ ] Stats arriba: total, activas, en mantenimiento
8. [ ] Estado vacío: mensaje + CTA "Crear Primera Area"

**Ruta a probar**: `https://app.alquemist.co/areas`

---

👉 **Acción**: Ve a https://app.alquemist.co/areas en tu navegador y verifica cada criterio de la lista.

¿Cómo fue la prueba?

[Usuario: "todo bien excepto el criterio 3, los cards no son clickeables"]

Para diagnosticar mejor el problema, necesito saber:
- ¿Los cards se ven bien pero no hacen nada al hacer click?
- ¿Hubo algún error en la consola del navegador?

[Usuario: "los cards se ven bien pero no pasa nada al hacer click, no hay errores"]

Voy a explorar el código del componente de cards...

[Skill lee: components/areas/area-card.tsx]
[Skill lee: components/areas/area-list.tsx]

📍 Problema identificado:
- Archivo: components/areas/area-card.tsx:45
- Issue: El card no tiene onClick handler para navegación

🔧 Fix automático aplicado:
- Agregado onClick con useRouter().push(`/areas/${area._id}`)
- Commit: abc1234

👉 Por favor, recarga la app y prueba de nuevo.

[Usuario: "ahora sí funciona!"]

✅ US-08.1 completada (1 fix aplicado)

Progreso: 1/5 user stories probadas

---
[... continúa con US-08.2, etc ...]
---

[Al final]

# 📊 Testing: M08 - Area Management (2026-01-29)

## Resultados

| ID | User Story | Status |
|----|-----------|--------|
| US-08.1 | Ver lista de areas | ✅ Pasó (1 fix) |
| US-08.2 | Filtrar y buscar | ✅ Pasó |
| US-08.3 | Crear nueva area | ✅ Pasó (3 fixes) |
| US-08.4 | Editar area | ✅ Pasó (2 fixes) |
| US-08.5 | Eliminar area | ✅ Pasó |

**Cobertura**: 42/42 criterios probados (100%)

## Fixes Aplicados (6 total)

1. **Navegación en area card** - `components/areas/area-card.tsx:45` - Commit: abc1234
2. **Auth guard en createArea** - `convex/areas.ts:78` - Commit: def5678
3. **Validación nombre único** - `convex/areas.ts:92` - Commit: ghi9012
4. **Loading state en form** - `components/areas/area-form.tsx:120` - Commit: jkl3456
5. **Error handling en mutations** - `convex/areas.ts:105` - Commit: mno7890
6. **Confirmación de eliminación** - `components/areas/area-card.tsx:78` - Commit: pqr1234

---

🤖 Testing guiado por Claude Code
```

---

## Referencias

Ver carpeta `references/` para:
- `project-structure.md`: Estructura del proyecto Alquemist
- `fix-patterns.md`: Patrones comunes de bugs y fixes
