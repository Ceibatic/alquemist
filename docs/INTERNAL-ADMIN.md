# Panel Interno de Administración - Ceibatic

## Descripción General

El panel interno de administración es una interfaz exclusiva para el equipo de Ceibatic que permite:

1. **Monitoreo de empresas y suscripciones** - Ver estado de todas las empresas cliente
2. **Configuración dinámica de IA** - Cambiar proveedores y modelos sin modificar código
3. **Gestión de trials y suscripciones** - Extender trials, suspender/activar empresas
4. **Auditoría** - Registro de todas las acciones administrativas

---

## Acceso

### URL
```
/internal/dashboard
```

### Requisitos
- Usuario autenticado con rol `PLATFORM_ADMIN`
- El rol tiene `level: 9999` (máximo) y `scope_level: "platform"`

### Crear Usuario Admin
```bash
# Desde la consola de Convex
npx convex run internalAdmin:createPlatformAdmin \
  '{"email": "admin@ceibatic.com", "passwordHash": "<hash>", "firstName": "Admin", "lastName": "Ceibatic"}'
```

---

## Arquitectura

### Tablas de Base de Datos

#### `ai_providers`
Configuración de proveedores de IA (Gemini, Claude, OpenAI).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| provider_name | string | "gemini" \| "claude" \| "openai" |
| display_name | string | Nombre para mostrar |
| is_active | boolean | Si el proveedor está disponible |
| is_default | boolean | Proveedor por defecto |
| api_key_configured | boolean | Si tiene API key configurada |
| default_model | string | Modelo por defecto |
| available_models | string[] | Lista de modelos disponibles |
| default_temperature | number | Temperature (0-2) |
| default_top_k | number? | Top K para sampling |
| default_top_p | number | Top P (nucleus sampling) |
| default_max_tokens | number | Máximo de tokens de salida |
| supports_vision | boolean | Si soporta análisis de imágenes |

#### `ai_prompts`
Prompts del sistema configurables.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| prompt_key | string | Identificador único |
| display_name | string | Nombre para mostrar |
| description | string? | Descripción del uso |
| system_prompt | string | Prompt del sistema |
| user_prompt_template | string? | Template del prompt de usuario |
| feature_type | string | "quality_check" \| "pest_detection" |
| is_active | boolean | Si está activo |
| version | number | Versión del prompt |

#### `audit_logs`
Registro de acciones administrativas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| action_type | string | Tipo de acción |
| entity_type | string | Tipo de entidad afectada |
| entity_id | string? | ID de la entidad |
| performed_by | Id<users> | Usuario que realizó la acción |
| previous_value | any? | Valor anterior |
| new_value | any? | Nuevo valor |
| description | string | Descripción de la acción |

---

## Funciones Backend

### `convex/internalAdmin.ts`

#### Queries

```typescript
// Verificar si un usuario es Platform Admin
isPlatformAdmin({ userId: Id<users> }) => boolean

// Obtener estado del sistema (métricas, integraciones)
getSystemStatus() => {
  integrations: { ai, email },
  metrics: { totalCompanies, activeCompanies, trialCompanies, ... },
  environment: { isProduction, appUrl },
  aiProviders: AIProvider[]
}

// Listar empresas con filtros
listAllCompanies({
  status?: "trial" | "active" | "suspended",
  subscriptionPlan?: string,
  limit?: number,
  offset?: number
}) => Company[]

// Detalles de una empresa
getCompanyDetails({ companyId: Id<companies> }) => CompanyDetails

// Obtener logs de auditoría
getAuditLogs({
  actionType?: string,
  entityType?: string,
  limit?: number,
  offset?: number
}) => AuditLog[]
```

#### Mutations

```typescript
// Extender trial de una empresa
extendTrial({
  userId: Id<users>,
  companyId: Id<companies>,
  additionalDays: number
})

// Actualizar suscripción
updateCompanySubscription({
  userId: Id<users>,
  companyId: Id<companies>,
  plan: string,
  maxFacilities?: number,
  maxUsers?: number
})

// Suspender empresa
suspendCompany({
  userId: Id<users>,
  companyId: Id<companies>,
  reason: string
})

// Activar empresa
activateCompany({
  userId: Id<users>,
  companyId: Id<companies>
})

// Crear usuario Platform Admin
createPlatformAdmin({
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
})
```

### `convex/internalAIConfig.ts`

#### Queries

```typescript
// Obtener todos los proveedores de IA
getAIProviders() => AIProvider[]

// Obtener proveedor activo (default)
getActiveProvider() => AIProvider | null

// Obtener configuración completa de IA
getAIConfig() => { provider, prompts }

// Obtener todos los prompts
getAIPrompts() => AIPrompt[]

// Obtener prompt específico
getPromptByKey({ promptKey: string }) => AIPrompt | null
```

#### Mutations

```typescript
// Actualizar configuración de proveedor
updateAIProvider({
  userId: Id<users>,
  providerId: Id<ai_providers>,
  defaultModel?: string,
  defaultTemperature?: number,
  defaultTopK?: number,
  defaultTopP?: number,
  defaultMaxTokens?: number
})

// Establecer proveedor por defecto
setDefaultProvider({
  userId: Id<users>,
  providerId: Id<ai_providers>
})

// Actualizar prompt del sistema
updatePrompt({
  userId: Id<users>,
  promptKey: string,
  systemPrompt: string
})

// Inicializar proveedores de IA
seedAIProviders()

// Inicializar prompts del sistema
seedAIPrompts()

// Refrescar estado de API keys
refreshAPIKeyStatus({ userId: Id<users> })
```

---

## Páginas Frontend

### `/internal/dashboard`
Dashboard principal con:
- Métricas de empresas (total, trials, activas, suspendidas)
- Estado de integraciones (Gemini, Claude, OpenAI, Email)
- Información del entorno (producción/desarrollo)
- Detalle de proveedores de IA configurados

### `/internal/config/ai`
Configuración de inteligencia artificial:
- Inicialización de proveedores y prompts
- Tarjetas de configuración por proveedor
- Sliders para ajustar parámetros (temperature, max tokens)
- Selección de proveedor por defecto
- Editor de prompts del sistema con versionado

### `/internal/companies`
Gestión de empresas:
- Tabla con todas las empresas
- Filtros por estado (trial, active, suspended)
- Indicadores de uso (usuarios/instalaciones vs límites)
- Días restantes de trial
- Acciones: ver detalles, extender trial, suspender, activar

---

## Configuración de API Keys

Las API keys se configuran mediante variables de entorno, **nunca se almacenan en la base de datos**.

### Variables de Entorno

```env
# AI Providers
GEMINI_API_KEY=your_gemini_api_key      # Google Gemini
CLAUDE_API_KEY=your_claude_api_key      # Anthropic Claude (futuro)
OPENAI_API_KEY=your_openai_api_key      # OpenAI (futuro)

# Email
RESEND_API_KEY=your_resend_api_key
```

### Estado de Configuración
El sistema detecta automáticamente qué API keys están configuradas y muestra el estado en el dashboard.

---

## Seeds e Inicialización

### Orden de Ejecución

1. **Crear rol PLATFORM_ADMIN** (si no existe)
```bash
npx convex run seedRoles:seedPlatformAdminRole
```

2. **Inicializar proveedores de IA**
```bash
npx convex run internalAIConfig:seedAIProviders
```

3. **Inicializar prompts del sistema**
```bash
npx convex run internalAIConfig:seedAIPrompts
```

4. **Crear usuario admin**
```bash
npx convex run internalAdmin:createPlatformAdmin \
  '{"email": "admin@ceibatic.com", "passwordHash": "<bcrypt_hash>", "firstName": "Admin", "lastName": "Ceibatic"}'
```

### Desde la UI
La página `/internal/config/ai` incluye un botón "Inicializar Proveedores y Prompts" que ejecuta los seeds automáticamente.

---

## Proveedores de IA Soportados

### Google Gemini (Activo)
- **Modelos**: gemini-1.5-pro, gemini-1.5-flash, gemini-pro-vision
- **Soporta**: Vision, Function Calling
- **Uso**: Extracción de templates, detección de plagas

### Anthropic Claude (Futuro)
- **Modelos**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Soporta**: Vision
- **Estado**: Preparado, pendiente integración

### OpenAI (Futuro)
- **Modelos**: gpt-4-turbo, gpt-4-vision-preview, gpt-3.5-turbo
- **Soporta**: Vision, Function Calling
- **Estado**: Preparado, pendiente integración

---

## Prompts del Sistema

### `template_extraction`
Extrae información estructurada de documentos de calidad (PDFs/imágenes).

**Características**:
- Detecta tipo de documento y cultivo
- Extrae secciones y campos del formulario
- Genera estructura JSON para crear templates digitales

### `pest_detection`
Analiza imágenes de plantas para detectar problemas.

**Características**:
- Detecta plagas, enfermedades, deficiencias
- Proporciona diagnóstico con nivel de confianza
- Sugiere tratamientos y acciones correctivas

---

## Seguridad

### Verificación de Rol
Todas las mutations verifican que el usuario tenga rol `PLATFORM_ADMIN`:

```typescript
const isPlatformAdmin = await ctx.runQuery(
  internal.internalAdmin.isPlatformAdmin,
  { userId }
);
if (!isPlatformAdmin) {
  throw new Error("Unauthorized: Platform admin required");
}
```

### Auditoría
Todas las acciones administrativas se registran en `audit_logs`:
- Quién realizó la acción
- Qué cambió (valor anterior/nuevo)
- Cuándo ocurrió

### API Keys
- Solo se almacena el estado (configurada/no configurada)
- Los valores reales están en variables de entorno
- Nunca se exponen en el frontend

---

## Flujo de Trabajo Típico

### 1. Monitoreo Diario
1. Ir a `/internal/dashboard`
2. Revisar métricas de empresas y trials activos
3. Verificar estado de integraciones

### 2. Gestionar Trial
1. Ir a `/internal/companies`
2. Filtrar por "Trial"
3. Click en empresa → "Extender Trial" o "Convertir a Plan"

### 3. Cambiar Configuración de IA
1. Ir a `/internal/config/ai`
2. Ajustar parámetros del proveedor (temperature, tokens)
3. O cambiar proveedor por defecto
4. Editar prompts si es necesario

### 4. Investigar Problema
1. Ir a `/internal/companies`
2. Buscar empresa afectada
3. Ver detalles y uso
4. Revisar logs de auditoría si es necesario

---

## Estructura de Archivos

```
convex/
  internalAdmin.ts       # Queries y mutations de admin
  internalAIConfig.ts    # Configuración de IA
  seedRoles.ts           # Seeds de roles (incluye PLATFORM_ADMIN)
  schema.ts              # Tablas: ai_providers, ai_prompts, audit_logs

app/(internal)/
  layout.tsx             # Layout con verificación de rol
  page.tsx               # Redirect a dashboard
  dashboard/
    page.tsx             # Dashboard principal
  config/
    ai/
      page.tsx           # Configuración de IA
  companies/
    page.tsx             # Gestión de empresas
```

---

## Troubleshooting

### "No hay proveedores de IA configurados"
Ejecutar seeds desde la UI o consola:
```bash
npx convex run internalAIConfig:seedAIProviders
npx convex run internalAIConfig:seedAIPrompts
```

### "Unauthorized: Platform admin required"
1. Verificar que el usuario existe y está activo
2. Verificar que tiene asignado el rol PLATFORM_ADMIN
3. El rol debe tener `name: "PLATFORM_ADMIN"` y `level: 9999`

### API key no detectada
1. Verificar que la variable de entorno está definida en Convex
2. Ejecutar `refreshAPIKeyStatus` para actualizar el estado
3. Las variables deben estar en el dashboard de Convex, no solo en `.env.local`

### Trial no se puede extender
1. Verificar que la empresa existe
2. Verificar que está en estado "trial" o "active"
3. Revisar logs de auditoría para ver errores previos
