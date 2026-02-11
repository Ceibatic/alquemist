---
name: implement-feature
description: >
  Implementar una feature del backlog de Alquemist. Toma un documento de
  docs/backlog/pending/, lo mueve a in-progress/, crea un branch, implementa
  cada User Story con commits individuales, actualiza el documento con progreso,
  y al finalizar mueve a completed/. Usar cuando el usuario quiera implementar
  una feature planificada, o mencione un archivo FEAT-*.md del backlog.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, TodoWrite
---

# Implement Feature

Implementar una feature del backlog de forma sistematica.

## Prerequisitos

1. **Documento de feature existe** en `docs/backlog/pending/FEAT-*.md`
2. **User Stories estan completas** con criterios de aceptacion
3. **Usuario confirma** que quiere iniciar la implementacion

Si el documento no existe o esta incompleto, sugerir usar `/plan-feature` primero.

## Proceso

### Fase 1: Preparacion

#### 1.1 Leer y Validar Documento

```bash
# Leer el documento de feature
Read: docs/backlog/pending/FEAT-YYYY-MM-nombre.md
```

Verificar que contiene:
- [ ] Metadata completa (prioridad, tipo)
- [ ] Al menos 1 User Story
- [ ] Criterios de aceptacion en cada US
- [ ] Secciones de Backend/Frontend cuando aplica

Si falta algo critico, informar al usuario y preguntar si continuar.

#### 1.2 Mover a In-Progress

```bash
mv docs/backlog/pending/FEAT-YYYY-MM-nombre.md docs/backlog/in-progress/
```

#### 1.3 Crear Branch de Git

```bash
# Primero, asegurar que main esta actualizado
git checkout main
git pull

# Crear branch para la feature
git checkout -b feat/FEAT-YYYY-MM-nombre
```

**Convencion de nombres:**
- Features: `feat/FEAT-YYYY-MM-nombre`
- Ejemplo: `feat/FEAT-2026-02-dark-mode`

#### 1.4 Crear TodoList

Usar TodoWrite para trackear cada US:

```
- [ ] US-XXX.1: [titulo]
- [ ] US-XXX.2: [titulo]
- [ ] US-XXX.3: [titulo]
...
```

### Fase 2: Implementacion por US

Para CADA User Story, seguir este ciclo:

#### 2.1 Explorar Codigo Relacionado

Antes de escribir codigo, entender el contexto:

```
Glob: buscar archivos en el dominio afectado
Grep: buscar funciones/componentes existentes
Read: leer implementaciones que se van a modificar
```

**Preguntas a responder:**
- Que archivos necesito modificar?
- Hay codigo similar que pueda reusar?
- Que patrones sigue el proyecto?
- Hay dependencias con otras partes del codigo?

#### 2.2 Implementar Cambios

**Orden de implementacion recomendado:**

1. **Schema** (si hay cambios en BD)
   - Archivo: `convex/schema.ts`
   - Agregar campos/tablas necesarias

2. **Backend** (queries y mutations)
   - Archivos: `convex/[dominio].ts`
   - Implementar logica de negocio
   - Agregar validaciones

3. **Frontend** (componentes y paginas)
   - Archivos: `components/`, `app/`
   - Implementar UI
   - Conectar con backend

**Decisiones proactivas:**
- Que archivos modificar segun la US
- Orden de implementacion (backend-first si hay schema changes)
- Que validaciones agregar
- Que estados de UI implementar (loading, error, empty)

#### 2.3 Validar Build

Despues de cada cambio significativo:

```bash
npm run build
```

Si falla:
1. Leer el error completo
2. Corregir el problema
3. Re-validar build
4. NO continuar hasta que pase

#### 2.4 Commit de la US

```bash
# Agregar archivos modificados
git add [archivos especificos]

# Commit con mensaje descriptivo
git commit -m "$(cat <<'EOF'
feat(modulo): US-XXX.N descripcion breve

[Descripcion mas detallada si es necesario]

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Convencion de commits:**
- `feat(modulo):` — nueva funcionalidad
- `fix(modulo):` — correccion de bug
- `refactor(modulo):` — refactorizacion sin cambio de comportamiento
- `docs(modulo):` — solo documentacion

**Regla:** Un commit por US completada.

#### 2.5 Actualizar Documento

Marcar criterios completados en el documento:

```markdown
#### Criterios de Aceptacion
- [x] Criterio completado
- [x] Otro criterio completado
- [ ] Criterio pendiente (si queda alguno)
```

#### 2.6 Registrar en Daily Log

Crear o actualizar `docs/dev/logs/YYYY-MM-DD.md`:

```markdown
## [HH:MM] [nombre-feature] — US-XXX.N implementada
- **Files:** `path/file1.ts`, `path/file2.tsx`
- **Why:** [Breve descripcion de lo implementado]
- **Commit:** `[hash]`
```

#### 2.7 Actualizar TodoList

Marcar la US como completada y pasar a la siguiente.

### Fase 3: Finalizacion

#### 3.1 Verificar Build Final

```bash
npm run build
```

Debe pasar sin errores.

#### 3.2 Revisar Cambios

```bash
git diff main...HEAD --stat
git log main..HEAD --oneline
```

Verificar:
- Todos los commits estan bien formateados
- No hay archivos innecesarios
- Los cambios corresponden a las US

#### 3.3 Completar Seccion de Implementacion

Actualizar el documento de feature con la seccion final:

```markdown
## Implementacion

### Commits
- `abc1234` — feat(modulo): US-XXX.1 descripcion
- `def5678` — feat(modulo): US-XXX.2 descripcion

### Archivos Modificados
- `convex/modulo.ts` — queries y mutations
- `components/dominio/Componente.tsx` — componente UI
- `app/(seccion)/ruta/page.tsx` — pagina principal

### Fecha de Completado
YYYY-MM-DD
```

#### 3.4 Mover a Completed

```bash
mv docs/backlog/in-progress/FEAT-YYYY-MM-nombre.md docs/backlog/completed/
git add docs/backlog/
git commit -m "docs(backlog): mark FEAT-YYYY-MM-nombre as completed"
```

#### 3.5 Push y Resumen

```bash
git push -u origin feat/FEAT-YYYY-MM-nombre
```

Mostrar resumen al usuario:
```
FEATURE COMPLETADA: FEAT-YYYY-MM-nombre

Branch: feat/FEAT-YYYY-MM-nombre
Commits: N
Archivos modificados: M

User Stories implementadas:
- US-XXX.1: [titulo]
- US-XXX.2: [titulo]

Siguiente paso: Crear PR con `gh pr create` o revisar cambios
```

### Fase 4: Pull Request (Opcional)

Si el usuario quiere crear PR:

```bash
gh pr create --title "feat: [nombre de feature]" --body "$(cat <<'EOF'
## Summary
[Descripcion de la feature implementada]

## User Stories Implemented
- US-XXX.1: [titulo]
- US-XXX.2: [titulo]

## Changes
[Lista de cambios principales]

## Test Plan
- [ ] [Como verificar que funciona]
- [ ] [Casos edge probados]

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Reglas Criticas

### Siempre:
- Leer codigo ANTES de modificar
- Validar build despues de cada US
- Un commit por US (no acumular)
- Actualizar documento con progreso
- Registrar en daily log

### Nunca:
- Modificar codigo sin leerlo primero
- Continuar si el build falla
- Omitir el Co-Authored-By en commits
- Hacer commit de archivos no relacionados
- Dejar criterios sin marcar al completar US

### Si hay problemas:
- Build falla → corregir antes de continuar
- Codigo no claro → leer mas contexto
- Requerimiento ambiguo → preguntar al usuario
- Dependencia bloqueante → informar y proponer alternativa

## Herramientas por Fase

| Fase | Herramientas | Proposito |
|------|--------------|-----------|
| Preparacion | Read, Bash | Leer documento, crear branch |
| Exploracion | Glob, Grep, Read | Entender codigo existente |
| Implementacion | Edit, Write | Modificar/crear archivos |
| Validacion | Bash | npm run build |
| Git | Bash | add, commit, push |
| Documentacion | Edit | Actualizar feature doc, daily log |
| Tracking | TodoWrite | Progreso de US |

## Integracion con Metodologia

Este skill es la **Fase 2** del flujo de desarrollo:

```
docs/backlog/pending/FEAT-XXX.md (creado por /plan-feature)
        ↓
/implement-feature
        ↓
docs/backlog/in-progress/FEAT-XXX.md (durante implementacion)
        ↓
docs/backlog/completed/FEAT-XXX.md (al finalizar)
```

## Manejo de Errores

### Build falla
1. Leer error completo
2. Identificar archivo y linea
3. Corregir problema
4. Commit del fix: `fix(modulo): corregir error de [descripcion]`
5. Re-validar build

### Conflictos con main
```bash
git fetch origin main
git rebase origin/main
# Resolver conflictos
git rebase --continue
git push --force-with-lease
```

### US bloqueada por otra
1. Documentar la dependencia
2. Implementar prerequisito primero
3. O preguntar al usuario como proceder

## Archivos de Referencia

- Documento a implementar: `$ARGUMENTS` o `docs/backlog/pending/FEAT-*.md`
- Daily logs: `docs/dev/logs/YYYY-MM-DD.md`
- Convenciones: `CLAUDE.md`
