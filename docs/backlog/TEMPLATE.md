# FEAT-YYYY-MM-nombre

## Metadata
- **Creado:** YYYY-MM-DD
- **Prioridad:** high | medium | low
- **Modulo relacionado:** M[XX]-nombre (opcional, si aplica a modulo existente)
- **Tipo:** feature | enhancement | technical

## Descripcion

[1-2 parrafos describiendo el objetivo de la feature, el problema que resuelve y el valor que aporta al usuario]

## User Stories

### US-XXX.1: [Titulo descriptivo]

**Como** [rol de usuario]
**quiero** [accion que desea realizar]
**para** [beneficio o valor que obtiene]

#### Criterios de Aceptacion
- [ ] Criterio especifico y verificable
- [ ] Criterio con edge cases considerados
- [ ] Criterio de validacion/error handling
- [ ] Criterio de UX (loading states, feedback)

#### Backend (si aplica)
- Query/Mutation: `api.modulo.accion`
- Schema changes: `tabla.campo` (tipo, descripcion)
- Validaciones: [lista de validaciones requeridas]

#### Frontend (si aplica)
- Componente: `components/dominio/Componente.tsx`
- Pagina: `app/(seccion)/ruta/page.tsx`
- Estados UI: loading, error, success, empty

#### Dependencias
- Requiere: US-XXX.0 (si hay orden de implementacion)
- Relacionado: M[XX]-modulo (modulos relacionados)

---

### US-XXX.2: [Titulo descriptivo]

[Repetir formato para cada US adicional]

---

## Schema Changes (si aplica)

| Tabla | Campo | Tipo | Descripcion |
|-------|-------|------|-------------|
| `tabla` | `campo` | `v.string()` | Descripcion del campo |

## Consideraciones Tecnicas

- **Arquitectura:** [Decisiones de diseno relevantes]
- **Integraciones:** [APIs, servicios externos, modulos relacionados]
- **Riesgos:** [Posibles problemas o complejidades identificadas]
- **Performance:** [Consideraciones de rendimiento si aplica]

## Out of Scope

- [Funcionalidad que NO se incluye en esta feature]
- [Mejoras futuras que se dejan para despues]
- [Casos edge que se manejan en otra iteracion]

---

## Implementacion (llenado por /implement-feature)

_Esta seccion se completa automaticamente al implementar la feature._

### Commits
- `hash1` — feat(modulo): US-XXX.1 descripcion
- `hash2` — feat(modulo): US-XXX.2 descripcion

### Archivos Modificados
- `convex/modulo.ts` — queries y mutations
- `app/(seccion)/ruta/page.tsx` — pagina principal
- `components/dominio/Componente.tsx` — componente UI

### Fecha de Completado
YYYY-MM-DD
