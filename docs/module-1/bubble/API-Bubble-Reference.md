# Referencia de API para Integración con Bubble

**Referencia rápida para configurar llamadas a Convex HTTP API y Clerk API desde Bubble**

**Versión:** 2.0 - Arquitectura Simplificada (Bubble → Convex + Clerk directo)

---

## 📍 URLs Base

⚠️ **Importante:** NO existen plugins de Clerk ni Convex para Bubble - toda la integración es manual.

### Convex HTTP API (Base de datos)
```
https://[your-deployment].convex.cloud/api
```

Encontrar en `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
```

### Clerk API (Autenticación)
```
https://[your-frontend-api].clerk.accounts.dev
```

Encontrar en Clerk Dashboard → API Keys → Frontend API

---

## 🔐 Autenticación con Clerk (Manual)

### Paso 1: Configurar Sign In en Bubble

**Llamada de API:** `clerk_sign_in`

- **Name:** `clerk_sign_in`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://[your-frontend-api].clerk.accounts.dev/v1/client/sign_ins`
- **Body type:** JSON

**Body:**
```json
{
  "identifier": "<email>",
  "password": "<password>"
}
```

**Parámetros:**
- `email` (text, no privado)
- `password` (text, **privado**)

**Respuesta exitosa:**
```json
{
  "client": {
    "sessions": [{
      "id": "sess_xxx",
      "last_active_token": {
        "jwt": "eyJhbGciOiJ..." ← ESTE ES TU JWT TOKEN
      }
    }]
  }
}
```

### Paso 2: Extraer y Guardar JWT Token

En el workflow de login en Bubble:

```
Paso 1: API Call - clerk_sign_in
  - email: Input Email's value
  - password: Input Password's value

Paso 2: Set state session_jwt =
  Result of Step 1's client's sessions:first item's last_active_token's jwt

Paso 3: Navigate to dashboard
```

**Custom State necesario:**
- Name: `session_jwt`
- Type: text
- Scope: Page (o App si quieres compartir entre páginas)

### Paso 3: Usar JWT en todas las llamadas a Convex

Todas las llamadas a Convex HTTP API deben incluir:

**Header:**
```
Authorization: Bearer <session_jwt>
```

Donde `<session_jwt>` es el Custom State que guardaste en Paso 2.

---

## 📍 Endpoints de Convex HTTP API

### Patrón de Endpoints

**Queries (GET - obtener datos):**
```
GET https://[deployment].convex.cloud/api/query/[module]:[function]
```

**Mutations (POST - crear/actualizar/eliminar):**
```
POST https://[deployment].convex.cloud/api/mutation/[module]:[function]
```

**Headers siempre requeridos:**
```
Authorization: Bearer <session_jwt>
Content-Type: application/json
```

---

### 1. List Companies (Query)

**Propósito:** Obtener lista de empresas de la organización actual

#### Configuración en Bubble
- **Name:** `convex_list_companies`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `https://[deployment].convex.cloud/api/query/companies:list`

#### Headers
```
Authorization: Bearer <session_jwt>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `session_jwt` | text | ✅ Sí | ✅ Sí | JWT token de Clerk |

#### Respuesta
```json
[
  {
    "_id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "_creationTime": 1704902400000,
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Empresa de Prueba Alquemist",
    "company_type": "agricultural",
    "status": "active",
    "legal_name": "Empresa de Prueba Alquemist SAS",
    "tax_id": "900123456-7",
    "business_entity_type": "S.A.S",
    "country": "CO",
    "default_locale": "es",
    "default_currency": "COP",
    "default_timezone": "America/Bogota"
  }
]
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `convex_list_companies`
3. Use as: **Data**
4. Method: **GET**
5. URL: `https://[your-deployment].convex.cloud/api/query/companies:list`
6. Headers:
   - Key: `Authorization`
   - Value: `Bearer <session_jwt>` (hacer parámetro)
   - Key: `Content-Type`
   - Value: `application/json`
7. Parámetro:
   - Name: `session_jwt`
   - Type: text
   - Private: ✅ Sí
8. Click **Initialize call** con JWT de prueba
9. Bubble capturará la estructura del array

#### Uso en Bubble
**En Repeating Group:**
```
Data source: Get data from external API > convex_list_companies
  - session_jwt: Custom State session_jwt
```

**Acceder a campos:**
```
Current cell's Company's name
Current cell's Company's tax_id
```

---

### 2. Create Company (Mutation)

**Propósito:** Crear un nuevo perfil de empresa

#### Configuración en Bubble
- **Name:** `convex_create_company`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://[deployment].convex.cloud/api/mutation/companies:create`

#### Headers
```
Authorization: Bearer <session_jwt>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `session_jwt` | text | ✅ Sí | ✅ Sí | JWT token de Clerk |
| `name` | text | ❌ No | ✅ Sí | Nombre de la empresa |
| `company_type` | text | ❌ No | ✅ Sí | "agricultural", "processing", etc. |
| `legal_name` | text | ❌ No | ❌ No | Razón social de la empresa |
| `tax_id` | text | ❌ No | ❌ No | NIT (en Colombia) |
| `business_entity_type` | text | ❌ No | ❌ No | "S.A.S", "S.A.", "Ltda", "E.U.", etc. |
| `country` | text | ❌ No | ❌ No | Código de país (defecto: "CO") |
| `default_locale` | text | ❌ No | ❌ No | Idioma (defecto: "es") |
| `default_currency` | text | ❌ No | ❌ No | Moneda (defecto: "COP") |
| `default_timezone` | text | ❌ No | ❌ No | Zona horaria (defecto: "America/Bogota") |

#### Cuerpo de Solicitud (JSON)
```json
{
  "name": "<name>",
  "company_type": "<company_type>",
  "legal_name": "<legal_name>",
  "tax_id": "<tax_id>",
  "business_entity_type": "<business_entity_type>",
  "country": "<country>",
  "default_locale": "<default_locale>",
  "default_currency": "<default_currency>",
  "default_timezone": "<default_timezone>"
}
```

#### Respuesta
```json
"jn7cx3afzv7zs555nrkp0pq9rx7s7c6d"
```
(Retorna el ID de la nueva empresa creada)

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `convex_create_company`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://[deployment].convex.cloud/api/mutation/companies:create`
6. Headers:
   - `Authorization: Bearer <session_jwt>` (parámetro)
   - `Content-Type: application/json`
7. Body type: **JSON**
8. Body: (ver JSON arriba con placeholders)
9. Agregar todos los parámetros de la tabla
10. Click **Initialize call** con datos de prueba

#### Uso en Workflow de Bubble
```
Paso 1: Show loading spinner

Paso 2: API Call - convex_create_company
  - session_jwt: Custom State session_jwt
  - name: Input Company Name's value
  - company_type: "agricultural"
  - legal_name: Input Legal Name's value
  - tax_id: Input Tax ID's value
  - business_entity_type: Dropdown Business Type's value
  - country: "CO"
  - default_locale: "es"
  - default_currency: "COP"
  - default_timezone: "America/Bogota"

Paso 3: Hide loading spinner
Paso 4: Show alert: "¡Empresa creada exitosamente!"
Paso 5: Navigate to: dashboard

Paso 6 (Only when Step 2 failed):
  - Hide spinner
  - Show alert: Result of Step 2's error's message
```

---

### 4. Update Company

**Propósito:** Actualizar perfil de empresa existente

#### Configuración en Bubble
- **Name:** `update_company`
- **Use as:** Action
- **Method:** PATCH
- **URL:** `[BASE_URL]/companies`

#### Configuración
Igual que **Create Company** pero usando el método **PATCH**.

Todos los campos son opcionales (solo enviar los campos que se desean actualizar).

---

### 3. List Facilities (Query)

**Propósito:** Obtener todas las instalaciones de la empresa actual

#### Configuración en Bubble
- **Name:** `convex_list_facilities`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `https://[deployment].convex.cloud/api/query/facilities:list`

#### Headers
```
Authorization: Bearer <session_jwt>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `session_jwt` | text | ✅ Sí | ✅ Sí | JWT token de Clerk |

**Nota:** Convex filtra automáticamente por organización usando el JWT token.

#### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": "facility_id_123",
      "company_id": "company_id_456",
      "name": "Instalación Invernadero #1",
      "facility_type": "greenhouse",
      "license_number": "LIC-2025-001",
      "license_type": "cannabis_cultivation",
      "license_authority": "INVIMA",
      "license_issued_date": "2025-01-01",
      "license_expiration_date": "2026-12-31",
      "status": "active",
      "address": "Km 5 Vía La Calera",
      "city": "Bogotá",
      "administrative_division_1": "Cundinamarca",
      "country": "CO",
      "latitude": 4.7110,
      "longitude": -74.0721,
      "altitude_meters": 2600,
      "total_area_m2": 5000,
      "canopy_area_m2": 3500,
      "_creationTime": 1704902400000
    }
  ],
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `list_facilities`
3. Use as: **Data** ← ¡Importante!
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/facilities?page=<page>&limit=<limit>`
6. Agregar header: `Authorization: Bearer <token>` (parámetro)
7. Agregar parámetros: `token`, `page`, `limit`, `status`
8. Click **Initialize call**
9. Bubble capturará la estructura del array

#### Uso en Bubble
**En un Repeating Group:**
- **Type of content:** Facility (crear tipo de datos personalizado)
- **Data source:** Get data from external API > Alquemist API - list_facilities
- **Set parameters:**
  - token: Resultado del workflow de obtener token de sesión
  - page: 1 (o estado personalizado para paginación)
  - limit: 10

**Acceder a campos en repeating group:**
```
Current cell's Facility's name
Current cell's Facility's license_number
Current cell's Facility's license_expiration_date
```

---

### 6. Get Facility

**Propósito:** Obtener detalles de una instalación específica

#### Configuración en Bubble
- **Name:** `get_facility`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | Token de sesión de Clerk |
| `facility_id` | text | ✅ Sí | ✅ Sí | ID de la instalación desde parámetro de URL |

#### URL de Solicitud en Bubble
```
https://your-domain.com/api/v1/facilities/<facility_id>
```

#### Respuesta
Igual que el objeto de instalación individual en list_facilities.

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `get_facility`
3. Use as: **Data**
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/facilities/<facility_id>`
6. Agregar header: `Authorization: Bearer <token>` (parámetro)
7. Agregar parámetros: `token`, `facility_id` (ambos privados)
8. Inicializar con IDs de prueba

#### Uso en Bubble
**En página de detalles de instalación:**
```
Get data from external API > Alquemist API - get_facility
  - token: session_token
  - facility_id: Get data from page URL (parámetro)
```

---

### 4. Create Facility (Mutation)

**Propósito:** Crear una nueva instalación

#### Configuración en Bubble
- **Name:** `convex_create_facility`
- **Use as:** Action
- **Method:** POST
- **URL:** `https://[deployment].convex.cloud/api/mutation/facilities:create`

#### Headers
```
Authorization: Bearer <session_jwt>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `session_jwt` | text | ✅ Sí | ✅ Sí | JWT token de Clerk |
| `name` | text | ❌ No | ✅ Sí | Nombre de la instalación |
| `facility_type` | text | ❌ No | ✅ Sí | "greenhouse", "indoor", "outdoor", "mixed" |
| `license_number` | text | ❌ No | ✅ Sí | Número de licencia |
| `license_type` | text | ❌ No | ✅ Sí | Tipo de licencia |
| `license_authority` | text | ❌ No | ✅ Sí | "INVIMA", "ICA", etc. |
| `address` | text | ❌ No | ✅ Sí | Dirección |
| `city` | text | ❌ No | ✅ Sí | Ciudad |
| `administrative_division_1` | text | ❌ No | ✅ Sí | Departamento |
| `total_area_m2` | number | ❌ No | ✅ Sí | Área total en m² |
| `status` | text | ❌ No | ❌ No | "active" (por defecto) |

**Campos opcionales:**
- `latitude`, `longitude`, `altitude_meters`
- `canopy_area_m2`
- `license_expiration_date` (ISO string)

#### Cuerpo de Solicitud (JSON)
```json
{
  "name": "<name>",
  "facility_type": "<facility_type>",
  "license_number": "<license_number>",
  "license_type": "<license_type>",
  "license_authority": "<license_authority>",
  "address": "<address>",
  "city": "<city>",
  "administrative_division_1": "<administrative_division_1>",
  "total_area_m2": <total_area_m2>,
  "status": "active"
}
```

#### Respuesta
```json
"jn7cx3afzv7zs555nrkp0pq9rx7s7c6d"
```
(Retorna el ID de la nueva instalación)

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `convex_create_facility`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://[deployment].convex.cloud/api/mutation/facilities:create`
6. Headers:
   - `Authorization: Bearer <session_jwt>` (parámetro)
   - `Content-Type: application/json`
7. Body type: **JSON**
8. Body: (ver JSON arriba con placeholders)
9. Agregar todos los parámetros de la tabla
10. Click **Initialize call** con datos de prueba

#### Uso en Workflow de Bubble
```
Paso 1: Show loading spinner

Paso 2: API Call - convex_create_facility
  - session_jwt: Custom State session_jwt
  - name: Input Facility Name's value
  - facility_type: Dropdown Type's value
  - license_number: Input License's value
  - license_type: Dropdown License Type's value
  - license_authority: Dropdown Authority's value
  - address: Input Address's value
  - city: Input City's value
  - administrative_division_1: Dropdown State's value
  - total_area_m2: Input Total Area's value:rounded to 0
  - status: "active"

Paso 3: Hide loading spinner
Paso 4: Show alert: "¡Instalación creada exitosamente!"
Paso 5: Navigate to: facilities page

Paso 6 (Only when Step 2 failed):
  - Hide spinner
  - Show alert: Result of Step 2's error's message
```

---

### 8. Update Facility

**Propósito:** Actualizar instalación existente

#### Configuración en Bubble
- **Name:** `update_facility`
- **Use as:** Action
- **Method:** PATCH
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Configuración
Igual que **Create Facility** pero:
- Method: **PATCH**
- URL incluye parámetro `<facility_id>`
- Todos los campos del cuerpo son opcionales

---

### 9. Delete Facility (Soft Delete)

**Propósito:** Archivar/desactivar una instalación

#### Configuración en Bubble
- **Name:** `delete_facility`
- **Use as:** Action
- **Method:** DELETE
- **URL:** `[BASE_URL]/facilities/<facility_id>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | Token de sesión de Clerk |
| `facility_id` | text | ✅ Sí | ✅ Sí | ID de la instalación a eliminar |

#### Respuesta
```json
{
  "success": true,
  "data": {
    "message": "Instalación archivada exitosamente",
    "facility_id": "facility_id_123"
  }
}
```

---

## 🔄 Manejo de Respuestas

### Patrón de Respuesta Exitosa
Todas las respuestas exitosas siguen esta estructura:
```json
{
  "success": true,
  "data": { /* datos de respuesta */ },
  "meta": {
    "timestamp": "cadena de fecha ISO"
  }
}
```

### Patrón de Respuesta de Error
Todas las respuestas de error siguen esta estructura:
```json
{
  "success": false,
  "error": {
    "code": "CODIGO_ERROR",
    "message": "Mensaje de error legible",
    "details": { /* opcional */ }
  },
  "meta": {
    "timestamp": "cadena de fecha ISO"
  }
}
```

### Manejo de Errores en Bubble

**En workflows, agregar manejo de errores:**

```
Paso X: API Call - [cualquier llamada API]
  - Only when: [condiciones]

Paso X+1 (Ejecutar solo cuando Paso X falla):
  - Show alert: Resultado del mensaje de error del paso X
  - Log to console: Resultado del paso X
```

---

## 📊 Códigos de Error Comunes

| Código | Estado HTTP | Significado | Solución |
|------|-------------|---------|----------|
| `UNAUTHORIZED` | 401 | Token de autenticación inválido o ausente | Obtener token de sesión nuevo de Clerk |
| `FORBIDDEN` | 403 | Usuario carece de permisos | Verificar rol de usuario y organización |
| `NOT_FOUND` | 404 | El recurso no existe | Verificar que el ID sea correcto |
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos | Verificar campos requeridos y formatos |
| `COMPANY_NOT_FOUND` | 404 | No hay empresa para la org | Crear empresa primero |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas solicitudes | Esperar y reintentar |
| `INTERNAL_ERROR` | 500 | Error del servidor | Contactar soporte |

---

## 🧪 Pruebas en Bubble

### Secuencia de Pruebas

1. **Health Check**
   ```
   Workflow: When button is clicked
   Action: API Call - health_check
   Show alert: Resultado del status del data del paso 1
   Esperado: "operational"
   ```

2. **Get Company**
   ```
   Workflow: When page is loaded
   Paso 1: Clerk - Get session
   Paso 2: API Call - get_company (token = resultado del paso 1)
   Display: Resultado del name del data del paso 2
   Esperado: Nombre de tu empresa
   ```

3. **List Facilities**
   ```
   Fuente de datos de Repeating Group:
   Get data from external API > list_facilities
   Parámetros: token (de sesión), page: 1, limit: 10
   Esperado: Lista de instalaciones (o vacío si no hay ninguna)
   ```

4. **Create Facility**
   ```
   Workflow: When Create button is clicked
   Action: API Call - create_facility (todos los parámetros del formulario)
   Show alert: "¡Éxito!"
   Navigate to: facility-details (con ID del resultado)
   Esperado: Nueva instalación creada y mostrada
   ```

---

## 💡 Consejos

### 1. JWT Token Reutilizable
Crear un **Custom State** a nivel de **app** (para compartir entre páginas):
- Name: `session_jwt`
- Type: text
- Scope: **App** (no page)

**Workflow de Login:**
```
When Login button is clicked:
  Paso 1: API Call - clerk_sign_in
    - email: Input Email's value
    - password: Input Password's value
  Paso 2: Set state session_jwt = Result's client's sessions:first item's last_active_token's jwt
  Paso 3: Navigate to dashboard
```

**Workflow de Page Load (en páginas protegidas):**
```
When page is loaded:
  Paso 1 (Only when session_jwt is empty):
    - Navigate to login page
```

**Usar en todas las llamadas a Convex:**
```
session_jwt = Custom State session_jwt (app-wide)
```

### 2. Plantilla de Manejo de Errores
Crear un **Custom Event** para manejo consistente de errores:
```
Custom Event: handle_api_error
Parámetros: error_message (text)

Acciones:
  - Show alert: error_message (color rojo)
  - Log to console: error_message
  - (Opcional) Enviar a analytics
```

Usar en workflows:
```
Paso X: API Call
Paso X+1 (Solo cuando paso X falla):
  Trigger event: handle_api_error
  error_message: Resultado del mensaje de error del paso X
```

### 3. Estados de Carga
Siempre mostrar retroalimentación durante llamadas API:
```
Paso 1: Set state: is_loading = yes (muestra spinner)
Paso 2: API Call
Paso 3: Set state: is_loading = no (oculta spinner)
Paso 4: (manejar resultado)
```

### 4. Caché de Datos
Cachear datos de empresa para evitar llamadas repetidas:
```
Solo obtener empresa en primera carga de página
Almacenar en Custom State: current_company
Reutilizar a través de la página sin volver a obtener
```

---

---

## 📝 Notas Importantes

### Arquitectura Simplificada

Este documento refleja la **nueva arquitectura simplificada** de Alquemist:

```
Bubble → Clerk API (autenticación)
      → Convex HTTP API (base de datos)
```

**Benefits:**
- ✅ Más rápido (1 menos salto de red)
- ✅ Más económico (sin costos de Vercel para CRUD)
- ✅ Más simple (menos código que mantener)

### ¿Cuándo usar Next.js API?

La capa de Next.js API (`/api/v1/*`) está **disponible pero NO usada en Módulos 1-10**.

**Usar Next.js API solo cuando:**
- Business logic compleja multi-step
- Rate limiting necesario
- Caching custom requerido
- Transformaciones de data complejas

Para Módulo 1 (Company & Facility Setup), **usar siempre Convex directo**.

### Multi-Tenant Isolation

Convex aplica automáticamente aislamiento multi-tenant:
- El JWT de Clerk contiene `organization_id`
- Todas las queries filtran por `organization_id`
- No es posible acceder datos de otras organizaciones
- No necesitas pasar `organization_id` manualmente

### Funciones Disponibles

Ver código fuente en `convex/` para todas las funciones:
- `convex/companies.ts` - Companies queries & mutations
- `convex/facilities.ts` - Facilities queries & mutations
- `convex/batches.ts` - Batches queries & mutations
- `convex/activities.ts` - Activities queries & mutations

Patrón de llamada:
```
GET  /api/query/[filename]:[functionName]
POST /api/mutation/[filename]:[functionName]
```

---

## 📚 Recursos Adicionales

- **Guía de Configuración Completa:** [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md)
- **Wireframes de UI:** [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md)
- **Inicio Rápido:** [Module-1-Bubble-Quick-Start.md](Module-1-Bubble-Quick-Start.md)
- **Documentación de Clerk API:** https://clerk.com/docs/reference/frontend-api
- **Documentación de Convex HTTP API:** https://docs.convex.dev/http-api

---

**Versión del Documento:** 2.0 (Arquitectura Simplificada)
**Última Actualización:** 2025-10-22
**Arquitectura:** Bubble → Convex + Clerk directo
**Convex Deployment:** Ver `NEXT_PUBLIC_CONVEX_URL` en `.env.local`
**Clerk Frontend API:** Ver Clerk Dashboard → API Keys
