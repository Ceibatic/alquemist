# Referencia de API para Integración con Bubble

**Referencia rápida para configurar llamadas a la API de Alquemist en el API Connector de Bubble**

**Versión:** 1.0
**URL Base:** `https://your-domain.com/api/v1` o `http://localhost:3000/api/v1`

---

## 🔐 Autenticación

Todos los endpoints (excepto el health check) requieren autenticación de Clerk.

**Header Requerido:**
```
Authorization: Bearer <token>
```

El `<token>` se obtiene de la acción "Get session" del plugin de Clerk y debe pasarse como **parámetro privado** en Bubble.

---

## 📍 Endpoints

### 1. Health Check

**Propósito:** Probar conexión de API

#### Configuración en Bubble
- **Name:** `health_check`
- **Use as:** Action
- **Method:** GET
- **URL:** `[BASE_URL]`

#### Parámetros
Ninguno

#### Respuesta
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "version": "1.0.0",
    "timestamp": "2025-01-10T12:00:00Z",
    "endpoints": [...]
  }
}
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `health_check`
3. Use as: **Action**
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1`
6. Click **Initialize call**
7. Verificar que la respuesta muestre `"status": "operational"`

---

### 2. Get Company

**Propósito:** Obtener el perfil de empresa del usuario actual

#### Configuración en Bubble
- **Name:** `get_company`
- **Use as:** **Data** (para usar en repeating groups/elementos de texto)
- **Method:** GET
- **URL:** `[BASE_URL]/companies`

#### Headers
```
Authorization: Bearer <token>
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | Token de sesión de Clerk |

#### URL de Solicitud en Bubble
```
https://your-domain.com/api/v1/companies
```

#### Respuesta
```json
{
  "success": true,
  "data": {
    "id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Empresa de Prueba Alquemist",
    "company_type": "Agriculture",
    "status": "active",
    "subscription_plan": "trial",
    "max_facilities": 1,
    "max_users": 3,
    "legal_name": "Empresa de Prueba Alquemist SAS",
    "tax_id": "900123456-7",
    "business_entity_type": "S.A.S",
    "country": "CO",
    "default_locale": "es",
    "default_currency": "COP",
    "default_timezone": "America/Bogota",
    "primary_contact_email": "contact@company.com",
    "primary_contact_phone": "+57 300 123 4567"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `get_company`
3. Use as: **Data** ← ¡Importante!
4. Method: **GET**
5. URL: `https://your-domain.com/api/v1/companies`
6. Agregar header:
   - Key: `Authorization`
   - Value: `Bearer <token>` (hacer `<token>` un parámetro)
7. Agregar parámetro:
   - Name: `token`
   - Type: text
   - Private: ✅ Sí
8. Click **Initialize call** con token de prueba
9. Bubble capturará la estructura de respuesta

#### Uso en Bubble
**En un elemento de texto:**
```
Get data from external API > Alquemist API - get_company
```

**Expresión dinámica:**
```
Get data from external API > Alquemist API - get_company's name
Get data from external API > Alquemist API - get_company's tax_id
```

---

### 3. Create Company

**Propósito:** Crear un nuevo perfil de empresa

#### Configuración en Bubble
- **Name:** `create_company`
- **Use as:** Action
- **Method:** POST
- **URL:** `[BASE_URL]/companies`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | Token de sesión de Clerk |
| `name` | text | ❌ No | ✅ Sí | Nombre de la empresa |
| `company_type` | text | ❌ No | ✅ Sí | "Agriculture", "Processing", etc. |
| `legal_name` | text | ❌ No | ❌ No | Razón social de la empresa |
| `tax_id` | text | ❌ No | ❌ No | NIT (en Colombia) |
| `business_entity_type` | text | ❌ No | ❌ No | "S.A.S", "S.A.", "Ltda", "E.U.", etc. |
| `country` | text | ❌ No | ❌ No | Código de país (por defecto: "CO") |
| `locale` | text | ❌ No | ❌ No | Idioma (por defecto: "es") |
| `currency` | text | ❌ No | ❌ No | Código de moneda (por defecto: "COP") |
| `timezone` | text | ❌ No | ❌ No | Zona horaria (por defecto: "America/Bogota") |
| `email` | text | ❌ No | ❌ No | Email de contacto principal |
| `phone` | text | ❌ No | ❌ No | Teléfono de contacto principal |

#### Cuerpo de Solicitud (JSON)
```json
{
  "name": "Empresa de Prueba Alquemist",
  "company_type": "Agriculture",
  "legal_name": "Empresa de Prueba Alquemist SAS",
  "tax_id": "900123456-7",
  "business_entity_type": "S.A.S",
  "country": "CO",
  "default_locale": "es",
  "default_currency": "COP",
  "default_timezone": "America/Bogota",
  "primary_contact_email": "contact@company.com",
  "primary_contact_phone": "+57 300 123 4567"
}
```

#### Respuesta
```json
{
  "success": true,
  "data": {
    "id": "jn7cx3afzv7zs555nrkp0pq9rx7s7c6d",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Empresa de Prueba Alquemist",
    "company_type": "Agriculture",
    "status": "active",
    "created_at": "2025-01-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `create_company`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://your-domain.com/api/v1/companies`
6. Agregar header:
   - Key: `Authorization`
   - Value: `Bearer <token>` (parámetro)
7. Body type: **JSON**
8. Body:
```json
{
  "name": "<name>",
  "company_type": "<company_type>",
  "legal_name": "<legal_name>",
  "tax_id": "<tax_id>",
  "business_entity_type": "<business_entity_type>",
  "country": "<country>",
  "default_locale": "<locale>",
  "default_currency": "<currency>",
  "default_timezone": "<timezone>",
  "primary_contact_email": "<email>",
  "primary_contact_phone": "<phone>"
}
```
9. Agregar todos los parámetros como se muestra en la tabla anterior
10. Click **Initialize call** con datos de prueba
11. Verificar que la respuesta devuelva el ID de la empresa

#### Uso en Workflow de Bubble
```
Paso 1: Plugin Action - Clerk: Get session
Paso 2: API Call - create_company
  - token: Resultado del token del paso 1
  - name: Valor de Input Company Name
  - company_type: "Agriculture"
  - legal_name: Valor de Input Legal Name
  - tax_id: Valor de Input Tax ID
  - business_entity_type: Valor de Dropdown Business Type
  - country: "CO"
  - locale: "es"
  - currency: "COP"
  - timezone: "America/Bogota"
  - email: Valor de Input Email
  - phone: Valor de Input Phone
Paso 3: Show alert: "¡Empresa creada exitosamente!"
Paso 4: Navigate to: dashboard
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

### 5. List Facilities

**Propósito:** Obtener todas las instalaciones de la empresa actual

#### Configuración en Bubble
- **Name:** `list_facilities`
- **Use as:** **Data**
- **Method:** GET
- **URL:** `[BASE_URL]/facilities?page=<page>&limit=<limit>`

#### Headers
```
Authorization: Bearer <token>
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Por Defecto | Descripción |
|-----------|------|---------|----------|-------------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | - | Token de sesión de Clerk |
| `page` | number | ❌ No | ❌ No | 1 | Número de página para paginación |
| `limit` | number | ❌ No | ❌ No | 50 | Elementos por página |
| `status` | text | ❌ No | ❌ No | - | Filtrar por estado: "active", "inactive", "archived" |

#### URL de Solicitud en Bubble
```
https://your-domain.com/api/v1/facilities?page=<page>&limit=<limit>&status=<status>
```

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

### 7. Create Facility

**Propósito:** Crear una nueva instalación

#### Configuración en Bubble
- **Name:** `create_facility`
- **Use as:** Action
- **Method:** POST
- **URL:** `[BASE_URL]/facilities`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Parámetros
| Parámetro | Tipo | Privado | Requerido | Descripción |
|-----------|------|---------|----------|-------------|
| `token` | text | ✅ Sí | ✅ Sí | Token de sesión de Clerk |
| `name` | text | ❌ No | ✅ Sí | Nombre de la instalación |
| `facility_type` | text | ❌ No | ✅ Sí | "greenhouse", "indoor", "outdoor", "mixed" |
| `license_number` | text | ❌ No | ✅ Sí | Número de licencia |
| `license_type` | text | ❌ No | ✅ Sí | Tipo de licencia |
| `license_authority` | text | ❌ No | ✅ Sí | "INVIMA", "ICA", etc. |
| `license_expiration_date` | text | ❌ No | ❌ No | Fecha ISO: "2026-12-31" |
| `address` | text | ❌ No | ✅ Sí | Dirección |
| `city` | text | ❌ No | ✅ Sí | Ciudad |
| `state` | text | ❌ No | ✅ Sí | Departamento |
| `latitude` | number | ❌ No | ❌ No | Coordenada de latitud |
| `longitude` | number | ❌ No | ❌ No | Coordenada de longitud |
| `altitude` | number | ❌ No | ❌ No | Altitud en metros |
| `total_area` | number | ❌ No | ✅ Sí | Área total en m² |
| `canopy_area` | number | ❌ No | ❌ No | Área de cultivo en m² |
| `status` | text | ❌ No | ❌ No | "active" (por defecto) |

#### Cuerpo de Solicitud (JSON)
```json
{
  "name": "Instalación Invernadero #1",
  "facility_type": "greenhouse",
  "license_number": "LIC-2025-001",
  "license_type": "cannabis_cultivation",
  "license_authority": "INVIMA",
  "license_expiration_date": "2026-12-31",
  "address": "Km 5 Vía La Calera",
  "city": "Bogotá",
  "administrative_division_1": "Cundinamarca",
  "latitude": 4.7110,
  "longitude": -74.0721,
  "altitude_meters": 2600,
  "total_area_m2": 5000,
  "canopy_area_m2": 3500,
  "status": "active"
}
```

#### Respuesta
```json
{
  "success": true,
  "data": {
    "id": "new_facility_id",
    "name": "Instalación Invernadero #1",
    "license_number": "LIC-2025-001",
    "status": "active",
    "created_at": "2025-01-10T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

#### Pasos de Configuración en Bubble
1. API Connector → Add another call
2. Name: `create_facility`
3. Use as: **Action**
4. Method: **POST**
5. URL: `https://your-domain.com/api/v1/facilities`
6. Agregar header: `Authorization: Bearer <token>` (parámetro)
7. Body type: **JSON**
8. Body: (ver JSON arriba con placeholders `<parámetro>`)
9. Agregar todos los parámetros de la tabla
10. Inicializar con datos de prueba

#### Uso en Workflow de Bubble
```
Paso 1: Mostrar spinner de carga
Paso 2: API Call - create_facility
  - token: session_token (desde estado de página)
  - name: Valor de Input Facility Name
  - facility_type: Valor de Dropdown Type
  - license_number: Valor de Input License
  - license_type: Valor de Dropdown License Type
  - license_authority: Valor de Dropdown Authority
  - license_expiration_date: Valor de DatePicker (formateado como ISO)
  - address: Valor de Input Address
  - city: Valor de Input City
  - state: Valor de Dropdown State
  - latitude: Valor de Input Lat (si no está vacío)
  - longitude: Valor de Input Lng (si no está vacío)
  - altitude: Valor de Input Altitude (si no está vacío)
  - total_area: Valor de Input Total Area
  - canopy_area: Valor de Input Canopy (si no está vacío)
  - status: "active"
Paso 3: Ocultar spinner de carga
Paso 4: Show alert: "¡Instalación creada exitosamente!"
Paso 5: Navigate to: facility-details
  - Send parameter: facility_id = Resultado del id del paso 2
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

### 1. Token de Sesión Reutilizable
Crear un **Custom State** a nivel de página:
- Name: `session_token`
- Type: text

Configurarlo una vez al cargar la página:
```
When page is loaded:
  Paso 1: Clerk - Get session
  Paso 2: Set state: session_token = Token del resultado
```

Usarlo en todas las llamadas API:
```
token = session_token
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

## 📚 Recursos Adicionales

- **Guía de Configuración Completa:** [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md)
- **Wireframes de UI:** [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md)
- **Inicio Rápido:** [Module-1-Bubble-Quick-Start.md](Module-1-Bubble-Quick-Start.md)

---

**Versión del Documento:** 1.0
**Última Actualización:** 2025-10-10
**Versión de API:** v1
