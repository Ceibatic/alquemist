# Guia de Skills para Claude Code - Alquemist

## Que es un Skill?

Un skill es un paquete modular que extiende las capacidades de Claude Code con workflows especializados, integraciones de herramientas, conocimiento de dominio y recursos agrupados. Se define mediante un archivo `SKILL.md` dentro de `.claude/skills/`.

## Estructura de Archivos

```
.claude/skills/
└── mi-skill/
    ├── SKILL.md          # (requerido) Instrucciones y metadatos
    ├── scripts/           # Scripts ejecutables (Python/Bash)
    ├── references/        # Documentacion cargada en contexto
    └── assets/            # Templates, imagenes, boilerplate
```

> Tambien funciona colocar archivos `.md` en `.claude/commands/` (formato legacy), pero `.claude/skills/` es el estandar actual.

## Formato de SKILL.md

```yaml
---
name: nombre-del-skill
description: >
  Descripcion clara de que hace el skill y CUANDO usarlo.
  Incluir triggers y contextos especificos aqui, NO en el body.
---

# Instrucciones

Contenido markdown con las instrucciones que Claude seguira al invocar el skill.
```

### Campos del Frontmatter

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| `name` | Recomendado | Identificador y nombre del `/slash-command` |
| `description` | Recomendado | Que hace + cuando usarlo. Es el mecanismo principal de activacion |
| `disable-model-invocation` | No | `true` = solo el usuario puede invocar (ej: `/deploy`, `/commit`) |
| `user-invocable` | No | `false` = solo Claude lo invoca automaticamente (background knowledge) |
| `allowed-tools` | No | Restringe que herramientas puede usar el skill (ej: `Read, Grep, Bash`) |

## Principios Clave

### 1. Conciso es mejor

- El context window es un recurso compartido
- Claude ya es muy inteligente - solo agrega contexto que NO tiene
- Preferir ejemplos concisos sobre explicaciones verbosas
- Mantener SKILL.md bajo 500 lineas

### 2. Progressive Disclosure (3 niveles)

| Nivel | Contenido | Cuando se carga |
|-------|-----------|-----------------|
| 1. Metadata | `name` + `description` (~100 palabras) | Siempre en contexto |
| 2. Body | Instrucciones del SKILL.md (<5k palabras) | Cuando el skill se activa |
| 3. Recursos | Archivos en `references/`, `scripts/`, `assets/` | Cuando Claude los necesita |

### 3. Description es el trigger

Todo el contexto de "cuando usar este skill" debe ir en el `description` del frontmatter, NO en el body. El body solo se carga DESPUES de que Claude decide usar el skill.

**Mal:**
```yaml
description: Maneja documentos PDF
```

**Bien:**
```yaml
description: >
  Procesamiento de documentos PDF: extraccion de texto, analisis de contenido
  y conversion de formatos. Usar cuando el usuario pida leer, procesar o
  analizar archivos PDF.
```

### 4. Grados de Libertad Apropiados

- **Alta libertad** (texto/guias): Multiples enfoques validos, dependiente de contexto
- **Media libertad** (pseudocodigo con parametros): Existe un patron preferido
- **Baja libertad** (scripts especificos): Operaciones fragiles donde la consistencia es critica

## Recursos Agrupados

### `scripts/` - Codigo ejecutable
- Usar cuando: codigo que se reescribiria repetidamente o necesita ser deterministico
- Ejemplo: `scripts/validate_schema.py`, `scripts/generate_migration.sh`

### `references/` - Documentacion de referencia
- Usar cuando: schemas de DB, docs de API, conocimiento de dominio, politicas
- Si el archivo supera 10k palabras, incluir patrones de busqueda grep en SKILL.md
- Evitar duplicacion: solo instrucciones procedimentales esenciales en SKILL.md

### `assets/` - Archivos para output
- Usar cuando: templates, imagenes, boilerplate, archivos de ejemplo
- NO se cargan en contexto, se usan en la salida

### Que NO incluir
- README.md, CHANGELOG.md, guias de instalacion
- Solo archivos que el agente necesita para hacer su trabajo

## Patrones de Organizacion

### Patron 1: Guia con referencias
```markdown
# Mi Skill

## Quick start
Instrucciones basicas aqui.

## Funcionalidades avanzadas
- **Feature A**: Ver [FEATURE-A.md](references/FEATURE-A.md)
- **API Reference**: Ver [API.md](references/API.md)
```

### Patron 2: Organizacion por dominio
```
mi-skill/
├── SKILL.md
└── references/
    ├── produccion.md
    ├── calidad.md
    └── trazabilidad.md
```

### Patron 3: Detalles condicionales
Contenido basico en SKILL.md, detalles avanzados enlazados a archivos separados.

## Errores Comunes

1. **Description multi-linea wrapeada por prettier** - Si un formatter como prettier rompe la linea del description, el skill deja de ser descubierto. Cuidado con `proseWrap: true`.

2. **Poner "cuando usarlo" en el body** - El body se carga DESPUES del trigger. La info de activacion debe ir en `description`.

3. **SKILL.md demasiado largo** - Maximo 500 lineas. Mover material detallado a `references/`.

4. **Referencias profundamente anidadas** - Maximo un nivel de profundidad desde SKILL.md.

5. **Incluir archivos innecesarios** - No agregar docs que no son para el agente.

## Invocacion

- **Manual**: El usuario escribe `/nombre-del-skill` en Claude Code
- **Automatica**: Claude detecta que el skill es relevante basandose en el `description`
- **Solo usuario**: Agregar `disable-model-invocation: true`
- **Solo Claude**: Agregar `user-invocable: false`
- **Con argumentos**: Usar `$ARGUMENTS` en el body para recibir parametros

## Ejemplo Completo

```
.claude/skills/generate-convex-function/
├── SKILL.md
└── references/
    └── convex-patterns.md
```

```yaml
---
name: generate-convex-function
description: >
  Genera funciones de backend Convex (queries, mutations, actions) siguiendo
  los patrones del proyecto Alquemist. Usar cuando el usuario pida crear
  endpoints, funciones de backend, o logica de servidor en Convex.
allowed-tools: Read, Write, Grep, Glob, Bash
---

# Generar Funcion Convex

1. Leer el schema en `convex/schema.ts` para entender las tablas disponibles
2. Revisar patrones existentes en `convex/` para mantener consistencia
3. Consultar [convex-patterns.md](references/convex-patterns.md) para patrones especificos
4. Crear la funcion siguiendo las convenciones del proyecto
5. Incluir validacion con Zod cuando aplique
```

## Referencias

- [Extend Claude with skills - Anthropic Docs](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
- [Introducing Agent Skills](https://www.anthropic.com/news/skills)
- [Repositorio oficial de skills](https://github.com/anthropics/skills)
- [Skill Creator oficial](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
- [Deep Dive tecnico](https://mikhail.io/2025/10/claude-code-skills/)
- [Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
