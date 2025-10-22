# Módulo 1: Guía de Implementación en Bubble

**Guía completa para implementar Configuración de Empresa e Instalaciones en Bubble.io**

**Versión:** 1.0
**Creado:** 2025-10-10
**Tiempo Estimado:** 6-8 horas
**Dificultad:** Intermedio

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración de Autenticación Clerk](#configuración-de-autenticación-clerk)
3. [Configuración del API Connector](#configuración-del-api-connector)
4. [Tipos de Datos y Estados Personalizados](#tipos-de-datos-y-estados-personalizados)
5. [Páginas y Diseño de UI](#páginas-y-diseño-de-ui)
6. [Workflows](#workflows)
7. [Pruebas](#pruebas)
8. [Solución de Problemas](#solución-de-problemas)

---

## Prerequisitos

### Lo que Necesitas
- ✅ Cuenta de Bubble.io (Plan gratuito o de pago)
- ✅ API REST de Alquemist en ejecución (localhost:3000 o producción)
- ✅ Cuenta de Clerk con Organizations habilitadas
- ✅ Conocimientos básicos de Bubble.io (páginas, workflows, API Connector)

### Base Completa
- ✅ API REST operacional (7 endpoints probados)
- ✅ Clerk Organizations configuradas
- ✅ Empresa e instalación de prueba creadas
- ✅ Aislamiento multi-tenant verificado

---

## Configuración de Autenticación Clerk

### Paso 1: Instalar el Plugin de Clerk en Bubble

1. Ve a la pestaña **Plugins** en el editor de Bubble
2. Haz clic en **Add plugins**
3. Busca "Clerk"
4. Instala el plugin **"Clerk - Authentication"**

### Paso 2: Configurar el Plugin de Clerk

**En el Editor de Bubble:**
1. Ve a **Plugins** → **Clerk - Authentication**
2. Agrega tus credenciales de Clerk:
   - **Publishable Key:** `pk_test_...` (desde el panel de Clerk)
   - **Frontend API:** `https://[tu-app-clerk].clerk.accounts.dev`
   - **Enable Organizations:** ✅ SÍ

**En el Panel de Clerk:**
1. Ve a **Settings** → **API Keys**
2. Copia la **Publishable Key**
3. Ve a **Organizations** → Habilita organizations
4. Agrega la URL de tu app Bubble a **Allowed origins**:
   - Desarrollo: `https://[tu-app].bubbleapps.io/version-test`
   - Producción: `https://[tu-app].bubbleapps.io`

### Paso 3: Crear Páginas de Autenticación

#### Página de Registro (`signup`)

**Elementos:**
- **Clerk SignUp Component** (del plugin)
  - Apariencia: Tema personalizado (colores de Alquemist)
  - Redirigir después del registro: `/create-organization`

**Workflows:**
```
Cuando el registro de Clerk se complete:
  - Ir a la página create-organization
```

#### Página de Inicio de Sesión (`signin`)

**Elementos:**
- **Clerk SignIn Component** (del plugin)
  - Apariencia: Tema personalizado
  - Redirigir después del inicio de sesión: `/dashboard`

**Workflows:**
```
Cuando el inicio de sesión de Clerk se complete:
  - Si el usuario tiene organización → Ir a dashboard
  - Si no → Ir a create-organization
```

#### Página de Crear Organización (`create-organization`)

**Elementos:**
- **Clerk CreateOrganization Component** (del plugin)
  - Omitir si ya tiene organización

**Workflows:**
```
Cuando se crea la Organización:
  - Crear empresa vía API (POST /api/v1/companies)
  - Ir a dashboard
```

### Paso 4: Obtener Token de Sesión

**Crear un Elemento Reutilizable: "Get Session Token"**

Este elemento se usará en cada página para obtener el token de sesión de Clerk.

**Elementos:**
- Grupo oculto: `group_session`
- Elemento de texto: `text_token` (no visible)
- Elemento de texto: `text_org_id` (no visible)

**Workflow al Cargar la Página:**
```
Cuando se carga la página:
  - Acción del Plugin: Clerk - Get session token
  - Establecer estado: texto de text_token = token del Resultado del paso 1
  - Establecer estado: texto de text_org_id = ID de organización del Resultado del paso 1
```

---

## Configuración del API Connector

### Paso 1: Inicializar API Connector

1. Ve a **Plugins** → **API Connector**
2. Haz clic en **Add another API**
3. Nombre: `Alquemist API`

### Paso 2: Configurar Ajustes de la API

**Ajustes de API:**
- **Nombre:** Alquemist API
- **Autenticación:** Self-handled
- **Agregar un encabezado compartido:**
  - Clave: `Content-Type`
  - Valor: `application/json`

### Paso 3: Configurar Endpoints

#### 1. Verificación de Salud (GET /api/v1)

**Usar como:** Action
**Nombre:** `health_check`
**Método:** GET
**URL:** `https://tu-dominio.com/api/v1` o `http://localhost:3000/api/v1`

**Encabezados:**
- Ninguno requerido (sin autenticación)

**Parámetros:**
- Ninguno

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "version": "1.0.0"
  }
}
```

#### 2. Obtener Empresa (GET /api/v1/companies)

**Usar como:** Data (para poder usarlo en Repeating Groups)
**Nombre:** `get_company`
**Método:** GET
**URL:** `https://tu-dominio.com/api/v1/companies`

**Encabezados:**
- **Authorization:** `Bearer <token>`
  - Hacer `<token>` un parámetro (privado)

**Parámetros:**
- `token` (privado, texto)

**Estructura de Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "text",
    "organization_id": "text",
    "name": "text",
    "company_type": "text",
    "status": "text",
    "legal_name": "text",
    "tax_id": "text"
  }
}
```

**Configuración en Bubble:**
- Marcar "Capture response headers"
- Marcar "Allow this API call to be used as data"
- Hacer clic en **Initialize call** para capturar la estructura

#### 3. Crear Empresa (POST /api/v1/companies)

**Usar como:** Action
**Nombre:** `create_company`
**Método:** POST
**URL:** `https://tu-dominio.com/api/v1/companies`

**Encabezados:**
- **Authorization:** `Bearer <token>` (parámetro)
- **Content-Type:** `application/json` (ya en encabezados compartidos)

**Parámetros:**
- `token` (privado, texto)

**Tipo de Body:** JSON
**Body:**
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

**Parámetros a agregar:**
- `name` (texto)
- `company_type` (texto) - "Agriculture"
- `legal_name` (texto)
- `tax_id` (texto)
- `business_entity_type` (texto) - "S.A.S", "S.A.", "Ltda", etc.
- `country` (texto) - por defecto "CO"
- `locale` (texto) - por defecto "es"
- `currency` (texto) - por defecto "COP"
- `timezone` (texto) - por defecto "America/Bogota"
- `email` (texto)
- `phone` (texto)

**Probar con datos de ejemplo e Inicializar**

#### 4. Actualizar Empresa (PATCH /api/v1/companies)

**Usar como:** Action
**Nombre:** `update_company`
**Método:** PATCH
**URL:** `https://tu-dominio.com/api/v1/companies`

**Encabezados y Body:** Igual que Crear Empresa

#### 5. Listar Instalaciones (GET /api/v1/facilities)

**Usar como:** Data
**Nombre:** `list_facilities`
**Método:** GET
**URL:** `https://tu-dominio.com/api/v1/facilities?page=<page>&limit=<limit>`

**Encabezados:**
- **Authorization:** `Bearer <token>` (parámetro)

**Parámetros:**
- `token` (privado, texto)
- `page` (número, opcional) - por defecto 1
- `limit` (número, opcional) - por defecto 50

**Estructura de Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "text",
      "company_id": "text",
      "name": "text",
      "facility_type": "text",
      "license_number": "text",
      "license_type": "text",
      "license_authority": "text",
      "license_expiration_date": "text",
      "status": "text",
      "address": "text",
      "city": "text",
      "total_area_m2": "number"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

**Importante:** Marcar como "Data" e inicializar para capturar la estructura

#### 6. Crear Instalación (POST /api/v1/facilities)

**Usar como:** Action
**Nombre:** `create_facility`
**Método:** POST
**URL:** `https://tu-dominio.com/api/v1/facilities`

**Encabezados:**
- **Authorization:** `Bearer <token>` (parámetro)

**Parámetros:**
- `token` (privado, texto)

**Tipo de Body:** JSON
**Body:**
```json
{
  "name": "<name>",
  "facility_type": "<facility_type>",
  "license_number": "<license_number>",
  "license_type": "<license_type>",
  "license_authority": "<license_authority>",
  "license_expiration_date": "<expiration_date>",
  "address": "<address>",
  "city": "<city>",
  "administrative_division_1": "<state>",
  "latitude": <latitude>,
  "longitude": <longitude>,
  "altitude_meters": <altitude>,
  "total_area_m2": <total_area>,
  "canopy_area_m2": <canopy_area>,
  "status": "<status>"
}
```

**Parámetros:**
- `name` (texto)
- `facility_type` (texto) - "greenhouse", "indoor", "outdoor", "mixed"
- `license_number` (texto)
- `license_type` (texto) - "cannabis_cultivation", "processing", etc.
- `license_authority` (texto) - "INVIMA", "ICA", etc.
- `expiration_date` (texto) - formato de fecha ISO "2025-12-31"
- `address` (texto)
- `city` (texto)
- `state` (texto)
- `latitude` (número, opcional)
- `longitude` (número, opcional)
- `altitude` (número, opcional)
- `total_area` (número)
- `canopy_area` (número, opcional)
- `status` (texto) - por defecto "active"

#### 7. Obtener Instalación (GET /api/v1/facilities/:id)

**Usar como:** Data
**Nombre:** `get_facility`
**Método:** GET
**URL:** `https://tu-dominio.com/api/v1/facilities/<facility_id>`

**Encabezados:**
- **Authorization:** `Bearer <token>` (parámetro)

**Parámetros:**
- `token` (privado, texto)
- `facility_id` (texto, privado)

**Respuesta:** Igual que el objeto de instalación en la lista

---

## Tipos de Datos y Estados Personalizados

### Tipos de Datos Personalizados

#### Company
**Campos:**
- `id` (texto)
- `organization_id` (texto)
- `name` (texto)
- `company_type` (texto)
- `legal_name` (texto)
- `tax_id` (texto)
- `business_entity_type` (texto)
- `status` (texto)
- `default_locale` (texto)
- `default_currency` (texto)
- `default_timezone` (texto)

#### Facility
**Campos:**
- `id` (texto)
- `company_id` (texto)
- `name` (texto)
- `facility_type` (texto)
- `license_number` (texto)
- `license_type` (texto)
- `license_authority` (texto)
- `license_expiration_date` (fecha)
- `status` (texto)
- `address` (texto)
- `city` (texto)
- `administrative_division_1` (texto)
- `total_area_m2` (número)
- `canopy_area_m2` (número)
- `latitude` (número)
- `longitude` (número)

### Estados Personalizados

#### Estados a Nivel de Página

**Todas las páginas deben tener:**
- `session_token` (texto)
- `organization_id` (texto)
- `user_id` (texto)

**Página de Perfil de Empresa:**
- `current_company` (Company)
- `is_editing` (sí/no)

**Página de Lista de Instalaciones:**
- `facilities_list` (lista de Facilities)
- `search_query` (texto)
- `filter_type` (texto)
- `current_page` (número)

**Página de Crear Instalación:**
- `wizard_step` (número) - 1, 2, o 3
- `draft_facility` (Facility)

---

## Páginas y Diseño de UI

### Estructura de Páginas

```
index (/)
  ↓
signin
  ↓
create-organization (si es necesario)
  ↓
dashboard
  ├─ company-profile
  └─ facilities
      ├─ facilities-list
      ├─ create-facility
      └─ facility-details
```

### 1. Página Dashboard (`dashboard`)

**Diseño:**
```
┌─────────────────────────────────────────┐
│ Header (Reutilizable)                   │
│  - Logo                                 │
│  - Menú de Navegación                   │
│  - Perfil de Usuario (Clerk UserButton)│
├─────────────────────────────────────────┤
│                                         │
│  Bienvenido, [Nombre de Empresa]        │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Perfil de│  │Instala-  │            │
│  │ Empresa  │  │ ciones 5 │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  Acciones Rápidas:                      │
│  - Ver Perfil de Empresa                │
│  - Administrar Instalaciones            │
│  - Crear Nueva Instalación              │
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**
- Header Reutilizable
- Grupo: Sección de Bienvenida
  - Texto: "Bienvenido, [Nombre de Empresa]"
  - Texto: [Correo del usuario]
- Grupo: Tarjetas de Estadísticas
  - Tarjeta: Perfil de Empresa (clicable)
  - Tarjeta: Contador de Instalaciones (clicable)
- Grupo: Acciones Rápidas
  - Botón: "Ver Perfil de Empresa" → company-profile
  - Botón: "Administrar Instalaciones" → facilities-list
  - Botón: "Crear Nueva Instalación" → create-facility

**Workflow al Cargar la Página:**
```
1. Obtener token de sesión (plugin Clerk)
2. Establecer estado: session_token, organization_id
3. Llamada API: get_company con token
4. Mostrar resultado en texto de bienvenida
5. Llamada API: list_facilities con token (límite: 1000)
6. Contar instalaciones y mostrar en tarjeta
```

### 2. Página de Perfil de Empresa (`company-profile`)

**Diseño:**
```
┌─────────────────────────────────────────┐
│ Header (Reutilizable)                   │
├─────────────────────────────────────────┤
│                                         │
│  Perfil de Empresa             [Editar] │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Información Básica                 ││
│  │                                    ││
│  │ Nombre de Empresa: [Empresa de...] ││
│  │ Razón Social:      [Empresa de...] ││
│  │ NIT:               [900123456-7]   ││
│  │ Tipo de Negocio:   [S.A.S]         ││
│  │ Tipo:              [Agriculture]   ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Información de Contacto            ││
│  │                                    ││
│  │ Correo: [contacto@empresa.com]     ││
│  │ Teléfono: [+57 300 123 4567]       ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Configuración Regional             ││
│  │                                    ││
│  │ País:     [Colombia (CO)]          ││
│  │ Idioma:   [Español (es)]           ││
│  │ Moneda:   [COP]                    ││
│  │ Zona Horaria: [America/Bogota]     ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**Elementos en Modo Vista:**
- Encabezado de página con botón "Editar"
- Grupo: Información Básica (tipo de dato Company)
  - Campos de texto mostrando datos de la empresa
- Grupo: Información de Contacto
- Grupo: Configuración Regional

**Elementos en Modo Edición:**
- Reemplazar textos con inputs
- Botones "Guardar" y "Cancelar"
- Validación de formulario

**Workflows:**

**Al Cargar la Página:**
```
1. Obtener token de sesión
2. Llamada API: get_company
3. Establecer estado: current_company = resultado
4. Mostrar datos de empresa en campos de texto
```

**Cuando se hace clic en botón Editar:**
```
1. Establecer estado: is_editing = sí
2. Mostrar campos de entrada (visibilidad condicional)
3. Pre-llenar inputs con valores actuales
```

**Cuando se hace clic en botón Guardar:**
```
1. Validar inputs (campos requeridos)
2. Llamada API: update_company con valores del formulario
3. Si tiene éxito:
   - Mostrar mensaje de éxito (alerta o toast)
   - Actualizar datos de empresa
   - Establecer estado: is_editing = no
4. Si hay error:
   - Mostrar mensaje de error
```

**Cuando se hace clic en botón Cancelar:**
```
1. Establecer estado: is_editing = no
2. Restaurar inputs a valores originales
```

### 3. Página de Lista de Instalaciones (`facilities-list`)

**Diseño:**
```
┌─────────────────────────────────────────┐
│ Header (Reutilizable)                   │
├─────────────────────────────────────────┤
│                                         │
│  Instalaciones                 [+ Nueva]│
│                                         │
│  [Buscar...]  [Tipo: Todas ▼]          │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Instalación Invernadero #1         ││
│  │ Tipo: Greenhouse | Licencia: LIC-..││
│  │ 📍 Bogotá, Cundinamarca            ││
│  │ Licencia expira: 2026-12-31 🟢     ││
│  │                          [Ver >]   ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Instalación Interior A             ││
│  │ Tipo: Indoor | Licencia: LIC-...   ││
│  │ 📍 Medellín, Antioquia             ││
│  │ Licencia expira: 2025-03-15 🟡     ││
│  │                          [Ver >]   ││
│  └────────────────────────────────────┘│
│                                         │
│  Página 1 de 1              [< 1 2 3 >]│
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**
- Encabezado de página con botón "Crear Nueva Instalación"
- Input de búsqueda
- Dropdown: Filtro de tipo de instalación
- Repeating Group: Instalaciones
  - Fuente: Llamada API - list_facilities
  - Item: tipo de dato Facility
  - Diseño: Lista completa (vertical)
  - Número de filas: 10

**Tarjeta de Instalación (dentro del Repeating Group):**
- Texto: Nombre de instalación (negrita, grande)
- Texto: Tipo y número de licencia
- Texto: Ubicación (con ícono)
- Texto: Vencimiento de licencia con insignia de estado
  - Lógica de color:
    - Verde (🟢): > 60 días
    - Amarillo (🟡): 30-60 días
    - Rojo (🔴): < 30 días
- Botón: "Ver" → ir a facility-details con parámetro

**Paginación:**
- Texto: "Página X de Y"
- Botones: Anterior / Siguiente
- Números de página (1, 2, 3...)

**Estado Vacío (condicional):**
Mostrar cuando la lista de instalaciones está vacía:
```
┌────────────────────────────────┐
│         📦                     │
│   No hay instalaciones aún     │
│                                │
│   [Crear Tu Primera Instalación]│
└────────────────────────────────┘
```

**Workflows:**

**Al Cargar la Página:**
```
1. Obtener token de sesión
2. Establecer estado: current_page = 1
3. Llamada API: list_facilities (page=1, limit=10)
4. Establecer estado: facilities_list = resultado
5. Mostrar instalaciones en Repeating Group
```

**Cuando cambia el input de Búsqueda:**
```
1. Esperar 500ms (debounce)
2. Filtrar facilities_list por search_query
3. Actualizar Repeating Group
```

**Cuando cambia el filtro de Tipo:**
```
1. Establecer estado: filter_type = valor del dropdown
2. Llamada API: list_facilities con filtro
3. Actualizar facilities_list
```

**Cuando se hace clic en botón "Ver":**
```
1. Ir a facility-details
2. Enviar parámetro: facility_id = id de Facility de la celda actual
```

**Cuando se hace clic en "Crear Nueva Instalación":**
```
1. Ir a create-facility
2. Establecer estado: wizard_step = 1
```

### 4. Asistente de Crear Instalación (`create-facility`)

**Diseño (Formulario de múltiples pasos):**
```
┌─────────────────────────────────────────┐
│ Header (Reutilizable)                   │
├─────────────────────────────────────────┤
│                                         │
│  Crear Nueva Instalación                │
│                                         │
│  Paso 1 de 3: Información Básica ━━━━━━ │
│  ●━━○━━○                                │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Nombre de Instalación *            ││
│  │ [________________]                 ││
│  │                                    ││
│  │ Tipo de Instalación *              ││
│  │ [Greenhouse ▼]                     ││
│  │                                    ││
│  │ Descripción (opcional)             ││
│  │ [____________________________]     ││
│  │ [____________________________]     ││
│  │ [____________________________]     ││
│  └────────────────────────────────────┘│
│                                         │
│            [Cancelar]      [Siguiente →]│
│                                         │
└─────────────────────────────────────────┘
```

**Paso 1: Información Básica**

Elementos:
- Indicador de progreso (paso 1 de 3)
- Input: Nombre de instalación (requerido)
- Dropdown: Tipo de instalación (requerido)
  - Opciones: greenhouse, indoor, outdoor, mixed
- Textarea: Descripción (opcional)
- Botón: Cancelar
- Botón: Siguiente

**Paso 2: Ubicación**

Elementos:
- Indicador de progreso (paso 2 de 3)
- Input: Dirección (requerido)
- Input: Ciudad (requerido)
- Dropdown: Estado/Departamento (requerido)
- Input: Latitud (opcional)
- Input: Longitud (opcional)
- Input: Altitud (metros) (opcional)
- Input: Área total (m²) (requerido)
- Input: Área de canopia (m²) (opcional)
- Botón: Atrás
- Botón: Siguiente

**Paso 3: Información de Licencia**

Elementos:
- Indicador de progreso (paso 3 de 3)
- Input: Número de licencia (requerido)
- Dropdown: Tipo de licencia (requerido)
  - Opciones: cannabis_cultivation, processing, distribution, etc.
- Dropdown: Autoridad de licencia (requerido)
  - Opciones: INVIMA, ICA, Municipal, etc.
- Selector de fecha: Fecha de vencimiento (requerido)
- Botón: Atrás
- Botón: Crear Instalación

**Workflows:**

**Al Cargar la Página:**
```
1. Obtener token de sesión
2. Establecer estado: wizard_step = 1
3. Limpiar draft_facility (resetear formulario)
```

**Cuando se hace clic en Siguiente (Paso 1):**
```
1. Validar: name y facility_type no están vacíos
2. Si es válido:
   - Guardar en estado: draft_facility
   - Establecer estado: wizard_step = 2
3. Si no es válido:
   - Mostrar mensaje de error
   - No proceder
```

**Cuando se hace clic en Siguiente (Paso 2):**
```
1. Validar: address, city, state, total_area no están vacíos
2. Si es válido:
   - Actualizar estado: draft_facility con datos de ubicación
   - Establecer estado: wizard_step = 3
3. Si no es válido:
   - Mostrar mensaje de error
```

**Cuando se hace clic en Atrás:**
```
1. Establecer estado: wizard_step = wizard_step - 1
2. Mostrar paso anterior
3. Pre-llenar formulario con datos de draft_facility
```

**Cuando se hace clic en Crear Instalación (Paso 3):**
```
1. Validar: campos de licencia no están vacíos
2. Si es válido:
   - Actualizar estado: draft_facility con datos de licencia
   - Mostrar spinner de carga
   - Llamada API: create_facility con todos los datos de draft_facility
   - Si tiene éxito:
     - Mostrar mensaje de éxito
     - Ir a facility-details con nuevo facility_id
   - Si hay error:
     - Mostrar mensaje de error
     - Permanecer en formulario
3. Si no es válido:
   - Mostrar mensaje de error
```

**Cuando se hace clic en Cancelar:**
```
1. Mostrar diálogo de confirmación: "¿Estás seguro? Se perderá el borrador"
2. Si se confirma:
   - Limpiar draft_facility
   - Ir a facilities-list
```

### 5. Página de Detalles de Instalación (`facility-details`)

**Diseño:**
```
┌─────────────────────────────────────────┐
│ Header (Reutilizable)                   │
├─────────────────────────────────────────┤
│                                         │
│  Instalación Invernadero #1   [Editar] │
│  📍 Bogotá, Cundinamarca               │
│                                         │
│  [Resumen] [Licencia] [Áreas] [Equipo] │
│  ─────────                              │
│                                         │
│  ┌────────────────────────────────────┐│
│  │ Resumen                            ││
│  │                                    ││
│  │ Tipo: Greenhouse                   ││
│  │ Estado: Activo                     ││
│  │ Área Total: 5,000 m²               ││
│  │ Área de Canopia: 3,500 m²          ││
│  │                                    ││
│  │ Ubicación:                         ││
│  │ Km 5 Vía La Calera                 ││
│  │ Bogotá, Cundinamarca               ││
│  │ Colombia                           ││
│  │                                    ││
│  │ Coordenadas: 4.7110, -74.0721      ││
│  │ Altitud: 2,600 MSNM                ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**

**Encabezado de Página:**
- Nombre de instalación (dinámico desde parámetro URL)
- Subtítulo de ubicación
- Botón Editar

**Navegación por Pestañas:**
- Pestaña 1: Resumen (por defecto)
- Pestaña 2: Licencia
- Pestaña 3: Áreas (futuro)
- Pestaña 4: Equipo (futuro)

**Pestaña Resumen:**
- Grupo: Información de Instalación
  - Tipo, Estado, Áreas
- Grupo: Ubicación
  - Dirección completa
  - Coordenadas
  - Altitud

**Pestaña Licencia:**
```
┌────────────────────────────────────┐
│ Información de Licencia            │
│                                    │
│ Número de Licencia: LIC-2025-001   │
│ Tipo de Licencia: Cannabis Cultivation │
│ Autoridad: INVIMA                  │
│ Emitida: 2025-01-01                │
│ Vence: 2026-12-31                  │
│                                    │
│ Estado: Activa 🟢                  │
│ Días restantes: 450 días           │
│                                    │
│ [Renovar Licencia]                 │
└────────────────────────────────────┘
```

**Workflows:**

**Al Cargar la Página:**
```
1. Obtener token de sesión
2. Obtener parámetro URL: facility_id
3. Llamada API: get_facility con facility_id
4. Mostrar datos de instalación en página
5. Calcular estado de vencimiento de licencia
6. Establecer color de insignia basado en días restantes
```

**Cuando se hace clic en Pestaña:**
```
1. Establecer estado: active_tab = nombre de pestaña
2. Mostrar grupo de contenido correspondiente
3. Ocultar otros grupos
```

**Cuando se hace clic en botón Editar:**
```
1. Ir a página edit-facility
2. Enviar parámetro: facility_id
```

---

## Workflows

### Workflows Reutilizables

Crear estos como **Custom Events** para reutilizar en todas las páginas:

#### 1. Obtener Token de Sesión
**Custom Event:** `get_session_token`

```
Paso 1: Plugin Clerk - Get session
Paso 2: Establecer estado - session_token = token del Resultado
Paso 3: Establecer estado - organization_id = org_id del Resultado
Paso 4: Establecer estado - user_id = user_id del Resultado
```

Usar en el evento "Page is loaded" de cada página.

#### 2. Mostrar Mensaje de Error
**Custom Event:** `show_error` (parámetro: error_message)

```
Paso 1: Mostrar alerta: error_message
Paso 2: Registrar en consola: error_message
```

#### 3. Mostrar Mensaje de Éxito
**Custom Event:** `show_success` (parámetro: success_message)

```
Paso 1: Mostrar alerta: success_message (verde)
Paso 2: Auto-ocultar después de 3 segundos
```

---

## Pruebas

### Lista de Verificación de Pruebas

#### Autenticación
- [ ] Registrar nuevo usuario
- [ ] Verificar correo (si está habilitado)
- [ ] Crear organización
- [ ] Iniciar sesión con usuario existente
- [ ] Selección de organización funciona
- [ ] Token de sesión se obtiene en todas las páginas

#### Perfil de Empresa
- [ ] Ver datos de empresa en dashboard
- [ ] Navegar a página de perfil de empresa
- [ ] Editar nombre de empresa
- [ ] Guardar cambios exitosamente
- [ ] Cancelar edición (revertir cambios)
- [ ] Manejo de errores para datos inválidos

#### Lista de Instalaciones
- [ ] Ver estado vacío (primera vez)
- [ ] Crear primera instalación (vía estado vacío)
- [ ] Ver lista de instalaciones
- [ ] Buscar instalaciones por nombre
- [ ] Filtrar por tipo de instalación
- [ ] Paginación funciona (si > 10 instalaciones)
- [ ] Clic en "Ver" abre detalles de instalación

#### Crear Instalación
- [ ] Validación del paso 1 del asistente
- [ ] Navegar al paso 2
- [ ] Navegar de regreso al paso 1 (datos preservados)
- [ ] Validación del paso 2 del asistente
- [ ] Navegar al paso 3
- [ ] Cancelar asistente (diálogo de confirmación)
- [ ] Enviar formulario (todos los pasos)
- [ ] Redirección exitosa a detalles de instalación
- [ ] Manejo de errores para fallos de API

#### Detalles de Instalación
- [ ] Ver resumen de instalación
- [ ] Ver información de licencia
- [ ] Color de insignia de estado de licencia (verde/amarillo/rojo)
- [ ] Cambiar entre pestañas
- [ ] Navegación del botón Editar
- [ ] Datos coinciden con instalación creada

#### Multi-Tenencia
- [ ] Crear segunda organización
- [ ] Cambiar organizaciones en Clerk
- [ ] Verificar que las instalaciones están aisladas
- [ ] Sin filtración de datos entre tenants

---

## Solución de Problemas

### Problemas Comunes

#### 1. Error "Authorization failed"

**Problema:** Las llamadas API devuelven 401 No Autorizado

**Solución:**
- Verificar que el token de sesión se está pasando correctamente
- Verificar que el token no ha expirado (duración de sesión de Clerk)
- Asegurar que se incluye el prefijo Bearer: `Bearer <token>`
- Verificar que el plugin Clerk está configurado correctamente

#### 2. Error "Company not found"

**Problema:** GET /api/v1/companies devuelve vacío

**Solución:**
- Verificar que la organización fue creada en Clerk
- Verificar si la empresa fue creada vía POST /api/v1/companies
- Asegurar que el organization_id coincide entre Clerk y el registro de empresa

#### 3. Llamadas API no funcionan (error CORS)

**Problema:** El navegador muestra error de política CORS

**Solución:**
- Agregar URL de app Bubble a orígenes permitidos de Next.js
- Actualizar `next.config.ts`:
  ```typescript
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: 'https://[tu-app].bubbleapps.io'
    }
  ]
  ```
- Reiniciar servidor Next.js

#### 4. Lista de instalaciones no se muestra

**Problema:** Repeating Group está vacío

**Solución:**
- Verificar que la llamada API está configurada como "Data" (no "Action")
- Verificar que la estructura de respuesta coincide con el tipo de dato
- Inicializar llamada API en API Connector
- Verificar que existen instalaciones para la empresa actual

#### 5. Insignia de vencimiento de licencia no muestra colores

**Problema:** Todas las insignias muestran el mismo color

**Solución:**
- Verificar la lógica de comparación de fechas en condicional:
  ```
  Cuando license_expiration_date de Facility de celda actual < Fecha actual + días: 30
  Este elemento es visible: sí
  Color de fondo: Rojo
  ```

#### 6. Asistente no avanza al siguiente paso

**Problema:** Botón Siguiente no hace nada

**Solución:**
- Verificar que el workflow de validación no está bloqueando
- Asegurar que el estado wizard_step se está actualizando
- Verificar visibilidad condicional en grupos de pasos
- Verificar errores de JavaScript en consola del navegador

---

## Mejores Prácticas

### Rendimiento
- Usar "Do when condition is true" en lugar de "Every X seconds"
- Limitar llamadas API al cargar página (combinar cuando sea posible)
- Guardar en caché datos de empresa y usuario en estados personalizados
- Usar paginación para listas grandes (no cargar más de 1000 elementos)

### Seguridad
- Nunca exponer tokens de API en elementos visibles
- Usar parámetros privados para datos sensibles
- Validar todos los inputs de usuario antes de llamadas API
- Manejar errores con gracia (no mostrar errores de API en crudo)

### UX
- Mostrar spinners de carga durante llamadas API
- Proporcionar retroalimentación de éxito/error para todas las acciones
- Usar actualizaciones de UI optimistas cuando sea posible
- Implementar estados vacíos apropiados
- Agregar diálogos de confirmación para acciones destructivas

### Mantenimiento
- Documentar workflows personalizados
- Usar convenciones de nombres consistentes
- Crear elementos reutilizables para componentes comunes
- Probar exhaustivamente antes del despliegue a producción

---

## Próximos Pasos

### Después de Completar el Módulo 1

1. **Módulo 2: Gestión de Lotes**
   - Crear lotes
   - Generación de códigos QR
   - Seguimiento de lotes

2. **Módulo 3: Registro de Actividades**
   - Registrar actividades
   - Asignación de tareas
   - Captura amigable para móviles

3. **Características Avanzadas**
   - Carga de archivos (logos, documentos)
   - Diseños avanzados de áreas
   - UI de gestión de equipos
   - Panel de analíticas

---

**Versión de Documentación:** 1.0
**Última Actualización:** 2025-10-10
**Próxima Revisión:** Después de completar la implementación del Módulo 1

**¿Necesitas Ayuda?**
- Consulta [API-Bubble-Reference.md](API-Bubble-Reference.md) para detalles de endpoints
- Ve [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md) para diseños visuales
- Revisa [Module-1-Bubble-Quick-Start.md](Module-1-Bubble-Quick-Start.md) para lista de verificación
