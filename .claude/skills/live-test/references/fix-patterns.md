# Fix Patterns - Live Testing

Patrones comunes de bugs encontrados durante testing manual y sus fixes, clasificados por complejidad.

---

## Fixes Simples (Aplicación Automática)

Estos fixes se aplican automáticamente sin pedir aprobación al usuario. Son cambios de 1-3 líneas, obvios, y sin riesgo.

### 1. Import Faltante

**Síntoma**:
- Error en consola: `X is not defined`
- TypeScript error: `Cannot find name 'X'`
- Componente o utilidad referenciada pero no importada

**Cómo identificar**:
- Leer el archivo y buscar el símbolo no definido
- Verificar que existe en el proyecto (usar Grep)
- Confirmar la ruta correcta del import

**Fix**:
```typescript
// Agregar al inicio del archivo
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
```

**Commit**:
```
fix([modulo]): add missing import for [ComponentName]
```

---

### 2. Prop Faltante en Componente

**Síntoma**:
- Componente se renderiza pero falta funcionalidad (ej: botón no hace nada)
- No hay errores en consola (prop opcional)
- Criterio de aceptación menciona comportamiento que no ocurre

**Cómo identificar**:
- Leer el componente hijo y ver qué props acepta
- Verificar en el componente padre que no se está pasando la prop

**Fix**:
```typescript
// En el componente padre
<Button
  onClick={handleClick}
  isLoading={isLoading}  // ← Prop faltante agregada
>
  Submit
</Button>
```

**Commit**:
```
fix([modulo]): pass [propName] prop to [ComponentName]
```

---

### 3. Typo en String o Variable

**Síntoma**:
- Texto incorrecto en UI
- Variable referenciada con nombre incorrecto
- Path incorrecto en navegación

**Cómo identificar**:
- Usuario reporta texto o comportamiento incorrecto
- Comparar con el criterio de aceptación o documentación

**Fix**:
```typescript
// Antes
const navigateTo = "/area/" + id  // Typo: singular

// Después
const navigateTo = "/areas/" + id  // Correcto: plural
```

**Commit**:
```
fix([modulo]): correct typo in [context]
```

---

### 4. Estado Loading/Disabled Obvio

**Síntoma**:
- Botón no se deshabilita durante submit
- No hay indicador de loading durante operación async
- Usuario puede hacer double-submit

**Cómo identificar**:
- Verificar que existe un estado `isLoading` o `isPending` (de Convex)
- Verificar que NO se está usando en el botón

**Fix**:
```typescript
<Button
  onClick={handleSubmit}
  disabled={isLoading}  // ← Agregado
>
  {isLoading ? "Guardando..." : "Guardar"}  // ← Agregado feedback
</Button>
```

**Commit**:
```
fix([modulo]): add loading state to [ComponentName]
```

---

### 5. Ajuste de Styling Básico (1-3 líneas)

**Síntoma**:
- Elemento no visible o mal alineado
- Clase Tailwind faltante u incorrecta
- Espaciado incorrecto

**Cómo identificar**:
- Usuario reporta que algo no se ve bien
- Comparar con criterios de diseño

**Fix**:
```typescript
// Antes
<div className="flex">

// Después
<div className="flex items-center gap-2">  // ← Agregado alineamiento y gap
```

**Commit**:
```
fix([modulo]): adjust styling in [ComponentName]
```

---

## Fixes Complejos (Requieren Aprobación)

Estos fixes requieren explicación y aprobación del usuario antes de aplicar. Afectan lógica de negocio, seguridad, o múltiples archivos.

### 1. Auth Guard Faltante

**Síntoma**:
- Mutation ejecutable sin estar autenticado
- Usuario no autenticado puede acceder a datos protegidos
- Criterio de seguridad implícito no cumplido

**Cómo identificar**:
- Leer la mutation en `convex/[archivo].ts`
- Verificar que NO tiene `getAuthUserId(ctx)` al inicio
- Verificar que la mutation modifica datos de usuario

**Riesgo**: Vulnerabilidad de seguridad crítica

**Fix propuesto**:
```typescript
// convex/areas.ts
export const createArea = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // ← AGREGAR ESTO
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError({ message: "Not authenticated", code: "UNAUTHORIZED" })
    }

    // Resto del código...
  }
})
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivo: convex/areas.ts:45
- Issue: La mutation createArea no verifica autenticación
- Riesgo: Cualquier usuario (incluso no autenticado) podría crear áreas

🔧 Fix propuesto:
1. Agregar getAuthUserId(ctx) al inicio de la mutation
2. Lanzar error si userId es null
3. Usar userId para verificar ownership del facility

¿Aplicar este fix?
A) Sí, aplicar ahora (recomendado)
B) Muéstrame el código exacto
C) Propón otra solución
```

**Commit**:
```
fix([modulo]): add auth guard to [mutationName]
```

---

### 2. Validación de Lógica de Negocio

**Síntoma**:
- Se pueden crear duplicados cuando no debería
- No se valida restricción de negocio (ej: nombres únicos)
- Criterio de aceptación menciona validación que no existe

**Cómo identificar**:
- Leer mutation en backend
- Verificar que no hay check de unicidad/restricción
- Comparar con criterios de aceptación

**Riesgo**: Inconsistencia de datos, UX confusa

**Fix propuesto**:
```typescript
// convex/areas.ts
export const createArea = mutation({
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    // ← AGREGAR ESTO
    // Verificar que no existe área con mismo nombre en facility
    const existing = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first()

    if (existing) {
      throw new ConvexError({
        message: "Ya existe un área con este nombre en esta instalación",
        code: "DUPLICATE_NAME"
      })
    }

    // Resto del código...
  }
})
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivos: convex/areas.ts
- Issue: No valida que el nombre del área sea único por facility
- Impacto: Se pueden crear múltiples áreas con el mismo nombre

🔧 Fix propuesto:
1. Antes de crear, buscar áreas existentes con mismo nombre en la facility
2. Si existe, lanzar error con mensaje claro
3. Frontend ya tiene validación Zod, pero backend debe validar también (validación dual)

¿Aplicar este fix?
```

**Commit**:
```
fix([modulo]): validate unique [field] in [context]
```

---

### 3. Error Handling Completo

**Síntoma**:
- Errores de backend no se muestran al usuario
- Mensajes de error genéricos o confusos
- App se rompe silenciosamente

**Cómo identificar**:
- Usuario reporta que algo no funciona pero no ve error
- Leer código y ver que hay try-catch pero sin manejo apropiado
- O no hay try-catch y los errores se propagan sin control

**Riesgo**: UX pobre, debugging difícil

**Fix propuesto**:
```typescript
// Frontend: components/areas/area-form.tsx
const onSubmit = async (data: FormData) => {
  try {
    setIsLoading(true)
    await createArea(data)
    toast.success("Área creada exitosamente")
    router.push("/areas")
  } catch (error) {
    // ← MEJORAR ESTO
    const message = error instanceof ConvexError
      ? error.data.message
      : "Error al crear el área. Intenta de nuevo."
    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}

// Backend: convex/areas.ts
export const createArea = mutation({
  handler: async (ctx, args) => {
    try {
      // ... lógica de creación
    } catch (error) {
      // ← AGREGAR ESTO
      console.error("Error creating area:", error)
      throw new ConvexError({
        message: "No se pudo crear el área. Verifica los datos e intenta de nuevo.",
        code: "CREATE_FAILED"
      })
    }
  }
})
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivos: components/areas/area-form.tsx, convex/areas.ts
- Issue: Errores no se manejan apropiadamente
- Impacto: Usuario no sabe qué salió mal cuando algo falla

🔧 Fix propuesto:
1. Frontend: Mejorar try-catch para mostrar mensaje específico en toast
2. Backend: Envolver lógica en try-catch y lanzar ConvexError con mensaje claro
3. Diferenciar tipos de error (validación, red, servidor)

¿Aplicar este fix?
```

**Commit**:
```
fix([modulo]): improve error handling in [context]
```

---

### 4. Navegación o Routing

**Síntoma**:
- Link no navega a la ruta correcta
- Redirect falla o va a ruta incorrecta
- Parámetros de ruta no se pasan correctamente

**Cómo identificar**:
- Usuario reporta que click no hace nada o va a lugar incorrecto
- Leer código y verificar rutas
- Comparar con estructura de carpetas en `app/`

**Riesgo**: Funcionalidad bloqueada

**Fix propuesto**:
```typescript
// Antes
<Link href={`/area/${area._id}`}>  // Ruta incorrecta

// Después
<Link href={`/areas/${area._id}`}>  // Ruta correcta (plural)

// O con router
const router = useRouter()
const handleClick = () => {
  router.push(`/areas/${area._id}`)
}
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivo: components/areas/area-card.tsx:67
- Issue: Link usa ruta `/area/` (singular) pero debería ser `/areas/` (plural)
- Impacto: Click en card da 404

🔧 Fix propuesto:
Cambiar href de `/area/${id}` a `/areas/${id}` para que coincida con estructura de rutas

¿Aplicar este fix?
```

**Commit**:
```
fix([modulo]): correct navigation path in [ComponentName]
```

---

### 5. Cambios en Schema de DB

**Síntoma**:
- Campo referenciado no existe en tabla
- Tipo de campo incorrecto
- Índice faltante causa queries lentas

**Cómo identificar**:
- Leer `convex/schema.ts`
- Comparar con campos usados en mutations/queries
- Usuario reporta que datos no se guardan o no se encuentran

**Riesgo**: Alto - requiere migration de datos

**Fix propuesto**:
```typescript
// convex/schema.ts
export default defineSchema({
  areas: defineTable({
    name: v.string(),
    facility_id: v.id("facilities"),
    area_type: v.string(),

    // ← AGREGAR ESTOS CAMPOS
    max_capacity: v.optional(v.number()),
    has_climate_control: v.boolean(),
    has_irrigation: v.boolean(),

    // ... resto de campos
  })
    .index("by_facility", ["facility_id"])
    .index("by_facility_and_type", ["facility_id", "area_type"]),  // ← NUEVO ÍNDICE
})
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivo: convex/schema.ts
- Issue: Faltan campos `has_climate_control` y `has_irrigation` en tabla areas
- Impacto: Frontend intenta guardar estos campos pero se pierden

🔧 Fix propuesto:
1. Agregar campos al schema con tipos apropiados
2. Marcar como opcionales si datos antiguos no los tienen
3. Re-deployar backend (Convex hará migration automática)

⚠️ Nota: Este cambio requiere re-deploy de Convex

¿Aplicar este fix?
```

**Commit**:
```
fix([modulo]): add missing fields to [tableName] schema
```

---

### 6. Múltiples Archivos Relacionados

**Síntoma**:
- Problema requiere cambios coordinados en frontend + backend
- Refactor necesario en varios componentes
- Cambio en estructura de datos afecta múltiples queries

**Cómo identificar**:
- Fix simple no resuelve el problema
- Requiere cambios en 3+ archivos
- Requiere refactor de lógica compartida

**Riesgo**: Alto - puede introducir regresiones

**Fix propuesto** (ejemplo):
```
Archivos a modificar:
1. convex/areas.ts - Agregar validación de capacity
2. convex/schema.ts - Agregar campo capacity_unit
3. components/areas/area-form.tsx - Agregar campo capacity_unit al form
4. components/areas/area-card.tsx - Mostrar capacity con unidad
```

**Explicación al usuario**:
```
📍 Problema identificado:
- Archivos: convex/areas.ts, convex/schema.ts, components/areas/area-form.tsx, components/areas/area-card.tsx
- Issue: El campo capacity no tiene unidad, asume "plantas" pero debería ser configurable
- Impacto: No se puede expresar capacidad en m², bandejas, etc.

🔧 Fix propuesto:
1. Schema: Agregar campo capacity_unit (enum: "plants", "sqm", "trays")
2. Backend: Validar que capacity_unit sea válido
3. Form: Agregar select de unidad junto al input de capacity
4. Card: Mostrar capacity con su unidad (ej: "200 plantas" o "50 m²")

Este cambio afecta 4 archivos y requiere coordinación.

¿Aplicar este fix?
A) Sí, usar subagent (recomendado para cambios multi-archivo)
B) Muéstrame un plan paso a paso
C) Déjame pensarlo
```

**Estrategia**:
- Usar Task tool con subagent apropiado (frontend-dev o backend-dev)
- Dividir en commits lógicos (schema → backend → frontend)
- Hacer commits incrementales

**Commits** (múltiples):
```
fix([modulo]): add capacity_unit field to schema
fix([modulo]): validate capacity_unit in backend
fix([modulo]): add capacity unit selector to form
fix([modulo]): display capacity with unit in card
```

---

## Patrones de Decisión

### ¿Es fix simple o complejo?

**Preguntas para decidir**:
1. ¿Afecta solo 1-2 líneas? → Probablemente simple
2. ¿Es un cambio obvio sin alternativas? → Probablemente simple
3. ¿Afecta seguridad o lógica de negocio? → Complejo
4. ¿Requiere cambios en 3+ archivos? → Complejo
5. ¿Requiere modificar schema? → Complejo
6. ¿Hay múltiples formas de resolverlo? → Complejo

**Cuando en duda**: Tratar como complejo (pedir aprobación)

### ¿Cuándo usar Task tool con subagent?

**Usar subagent cuando**:
- Fix afecta 4+ archivos
- Requiere refactor significativo
- Involucra lógica de negocio compleja
- Necesitas expertise específico (TypeScript, backend, frontend)

**NO usar subagent cuando**:
- Fix es 1-3 archivos con cambios claros
- Es un fix directo sin decisiones arquitecturales
- Ya sabes exactamente qué cambiar

---

## Checklist de Calidad del Fix

Antes de aplicar cualquier fix, verificar:

- [ ] ✅ Leí el código completo relevante (no asumí)
- [ ] ✅ El fix resuelve el problema raíz, no solo el síntoma
- [ ] ✅ Sigue los patrones existentes del proyecto (CLAUDE.md)
- [ ] ✅ No introduce over-engineering
- [ ] ✅ Tiene mensaje de commit claro y descriptivo
- [ ] ✅ Incluye Co-Authored-By
- [ ] ✅ Si es complejo, pedí aprobación al usuario
- [ ] ✅ Si afecta seguridad, verifiqué bien antes de aplicar

---

## Errores Comunes a Evitar

### ❌ NO hacer

1. **Proponer fix sin leer código completo**
   - Siempre leer archivos relacionados primero

2. **Asumir que el criterio está mal**
   - El criterio de aceptación es la fuente de verdad
   - Si hay contradicción, preguntar al usuario

3. **Aplicar fix complejo sin aprobación**
   - Siempre explicar y pedir permiso para fixes que afecten lógica de negocio

4. **Acumular múltiples fixes en un commit**
   - Un fix lógico = un commit
   - Facilita rollback y debugging

5. **Olvidar Co-Authored-By**
   - SIEMPRE incluir en todos los commits

6. **Hacer over-engineering**
   - Fix mínimo necesario
   - No agregar features no pedidas

### ✅ Hacer siempre

1. **Leer código exhaustivamente** antes de proponer solución
2. **Comparar con criterios** de aceptación
3. **Verificar patrones del proyecto** (convenciones en CLAUDE.md)
4. **Explicar claramente** el problema y la solución
5. **Commit inmediato** después de aplicar fix
6. **Pedir re-test** al usuario después del fix
