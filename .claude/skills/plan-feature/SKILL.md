---
name: plan-feature
description: >
  Planificar una nueva feature para Alquemist. Transforma una idea o requerimiento
  en un documento estructurado con User Stories bien definidas, listo para
  implementacion. Explora el codebase, hace preguntas de clarificacion, y genera
  el documento en docs/backlog/pending/. Usar cuando el usuario quiera planificar,
  documentar, o especificar una nueva funcionalidad antes de implementarla.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, TodoWrite
---

# Plan Feature

Planificar y documentar una nueva feature con User Stories detalladas.

## Proceso

### Fase 1: Entender el Requerimiento

1. **Escuchar al usuario** — Capturar la idea/requerimiento en sus propias palabras
2. **Identificar el dominio** — Determinar que dominio(s) del proyecto estan relacionados
3. **Listar supuestos iniciales** — Antes de continuar, declarar explicitamente:
   ```
   SUPUESTOS:
   1. [supuesto sobre alcance]
   2. [supuesto sobre comportamiento]
   → Continuare con estos a menos que me corrijas.
   ```

### Fase 2: Explorar el Codebase

Usar herramientas para entender el contexto antes de planificar:

1. **Buscar codigo relacionado:**
   ```
   Glob: buscar archivos en el dominio
   Grep: buscar funciones/componentes existentes
   Read: leer implementaciones relacionadas
   ```

2. **Identificar patrones existentes:**
   - Como se estructuran componentes similares
   - Que validaciones usan
   - Que queries/mutations existen
   - Que componentes UI se pueden reusar

3. **Documentar hallazgos:**
   - Codigo reutilizable encontrado
   - Patrones a seguir
   - Gaps o inconsistencias detectadas

### Fase 3: Clarificar Requerimientos

Usar AskUserQuestion para resolver ambiguedades:

**Preguntas tipicas:**
- Alcance: Que incluye y que NO incluye?
- Roles: Quien puede usar esta funcionalidad?
- Flujo: Cual es el happy path? Que pasa si falla?
- Prioridad: Es critico, importante o menor?
- Integraciones: Se relaciona con otros modulos?

**Regla:** Si hay ambiguedad, PARAR y preguntar. No asumir.

### Fase 4: Escribir User Stories

Para cada funcionalidad identificada, crear una US con:

#### Formato Obligatorio:
```markdown
### US-XXX.N: [Titulo descriptivo]

**Como** [rol especifico]
**quiero** [accion concreta]
**para** [beneficio medible]

#### Criterios de Aceptacion
- [ ] [Criterio verificable - que se puede probar]
- [ ] [Criterio de edge case - que pasa si...]
- [ ] [Criterio de error - como se maneja fallos]
- [ ] [Criterio de UX - feedback al usuario]

#### Backend (si aplica)
- Query/Mutation: `api.modulo.accion`
- Schema changes: `tabla.campo` (tipo)
- Validaciones: [lista]

#### Frontend (si aplica)
- Componente: `components/dominio/Componente.tsx`
- Pagina: `app/(seccion)/ruta/page.tsx`
- Estados: loading, error, success, empty

#### Dependencias
- Requiere: [US previas si hay orden]
- Relacionado: [modulos M##]
```

#### Buenas Practicas para Criterios:
- **Especificos:** "El boton muestra 'Guardando...' durante la operacion" NO "Debe mostrar feedback"
- **Verificables:** "Email debe validar formato RFC 5322" NO "Email debe ser valido"
- **Con edge cases:** "Si el nombre ya existe, mostrar error 'Ya existe un area con ese nombre'"
- **Sin ambiguedad:** Evitar "deberia", "podria", "aproximadamente"

### Fase 5: Generar Documento

1. **Crear nombre de archivo:**
   ```
   FEAT-[YYYY]-[MM]-[nombre-kebab-case].md
   Ejemplo: FEAT-2026-02-dark-mode.md
   ```

2. **Ubicar en:** `docs/backlog/pending/`

3. **Usar template de:** `docs/backlog/TEMPLATE.md`

4. **Completar todas las secciones:**
   - Metadata (prioridad, tipo, modulo relacionado)
   - Descripcion (1-2 parrafos)
   - User Stories (formato completo)
   - Schema Changes (si hay cambios de BD)
   - Consideraciones Tecnicas (arquitectura, riesgos)
   - Out of Scope (que NO se incluye)

5. **Dejar vacia la seccion "Implementacion"** — Se llena con /implement-feature

### Fase 6: Validacion Final

Antes de entregar, verificar:

- [ ] Cada US tiene minimo 3 criterios de aceptacion
- [ ] Criterios son especificos y verificables (no vagos)
- [ ] Se consideraron edge cases (errores, empty states, permisos)
- [ ] Se identifico codigo reutilizable del codebase
- [ ] Out of Scope esta claramente definido
- [ ] No hay over-engineering (mantener simple)

## Reglas

### Hacer:
- Explorar codebase ANTES de planificar
- Declarar supuestos explicitamente
- Preguntar cuando hay ambiguedad
- Reusar componentes y patrones existentes
- Ser especifico en criterios de aceptacion
- Definir claramente Out of Scope

### No Hacer:
- Asumir requerimientos sin confirmar
- Crear abstracciones innecesarias
- Proponer tecnologias nuevas sin justificacion
- Escribir criterios vagos o no verificables
- Over-engineer la solucion
- Omitir edge cases y manejo de errores

## Ejemplo de Criterios Buenos vs Malos

**Malo:**
- [ ] El formulario debe validar los campos
- [ ] Debe mostrar errores apropiados
- [ ] La UI debe ser responsiva

**Bueno:**
- [ ] El campo email valida formato RFC 5322 y muestra "Email invalido" si falla
- [ ] Al enviar sin completar campos requeridos, se resaltan en rojo con mensaje bajo cada uno
- [ ] En mobile (< 768px), el formulario ocupa 100% del ancho con padding de 16px

## Integracion con Metodologia

Este skill es la **Fase 1** del flujo de desarrollo:

```
/plan-feature → docs/backlog/pending/FEAT-XXX.md
                        ↓
/implement-feature → implementacion + commits + docs/backlog/completed/
```

Despues de usar /plan-feature, el documento queda listo para:
1. Revision por el equipo
2. Priorizacion en el backlog
3. Implementacion con /implement-feature

## Archivos de Referencia

- Template: `docs/backlog/TEMPLATE.md`
- Patrones del proyecto: `CLAUDE.md`
