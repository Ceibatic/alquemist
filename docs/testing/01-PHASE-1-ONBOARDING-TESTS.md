# PHASE 1: ONBOARDING & AUTHENTICATION - TESTS

## Descripción de la Fase

Phase 1 cubre el flujo completo de onboarding de una nueva empresa al sistema Alquemist:
- Registro de usuario y verificación de email
- Creación de empresa
- Configuración del primer facility
- Login y gestión de sesiones
- Invitación y aceptación de usuarios

## Módulos Cubiertos

- **Module 1**: User Registration & Email Verification
- **Module 1B**: Invited User Acceptance Flow
- **Module 2**: Login & Session Management
- **Module 3**: Company Creation & Configuration
- **Module 4**: Facility Setup
- **Module 5**: Role Management
- **Module 6**: Context Data Persistence (Bubble state)
- **Module 7**: Reference Data (crop types, geographic locations)

## Datos de Prueba

Ver [00-TESTING-OVERVIEW.md](00-TESTING-OVERVIEW.md) para datos completos.

**Usuario Principal**: admin@ceibatic.com
**Empresa**: Test Farm SA
**Facility**: North Greenhouse

---

## Test 1.1: Registro de Nuevo Usuario (Company Owner)

**Objetivo**: Validar el flujo de registro para un usuario que creará una nueva empresa.

**Precondiciones**:
- Ninguna (punto de inicio del sistema)
- Email admin@ceibatic.com no existe en el sistema

**Pasos**:
1. Navegar a la página de registro
2. Completar el formulario de registro:
   - Email: admin@ceibatic.com
   - Password: [password seguro]
   - First Name: Admin
   - Last Name: Ceibatic
   - Confirm Password: [mismo password]
3. Hacer clic en "Register" o "Create Account"
4. Verificar que aparece mensaje de "Check your email"

**Resultados Esperados**:
- ✅ Usuario creado en la tabla `users` con status "pending_verification"
- ✅ Se genera verification code de 6 dígitos
- ✅ Email de verificación enviado a admin@ceibatic.com
- ✅ Redirect a página de "Verify Email" o mensaje visible
- ✅ Email recibido en menos de 2 minutos

**Notas**:
- El email puede llegar a carpeta de spam
- El código de verificación expira en 24 horas
- Password debe cumplir requisitos mínimos de seguridad

---

## Test 1.2: Verificación de Email

**Objetivo**: Validar que el usuario puede verificar su email correctamente.

**Preconditions**:
- Test 1.1 completado exitosamente
- Email de verificación recibido

**Pasos**:
1. Abrir email de verificación en la bandeja de entrada
2. Copiar el código de verificación de 6 dígitos
3. Ingresar código en la página de verificación
4. Hacer clic en "Verify" o "Confirm"

**Resultados Esperados**:
- ✅ Usuario actualizado con `email_verified: true`
- ✅ `email_verified_at` timestamp registrado
- ✅ Status del usuario cambia a "active"
- ✅ Redirect automático a página de creación de empresa
- ✅ Sesión iniciada automáticamente (session token generado)

**Notas**:
- Alternativamente, puede haber un link directo en el email que verifique automáticamente
- Si el código es incorrecto, mostrar error claro

---

## Test 1.3: Creación de Empresa

**Objetivo**: Validar la creación de una nueva empresa en el sistema.

**Precondiciones**:
- Test 1.2 completado exitosamente
- Usuario verificado y loggeado
- En página de "Create Company"

**Pasos**:
1. Completar formulario de empresa:
   - Company Name: Test Farm SA
   - Legal Name: Test Farm Sociedad por Acciones Simplificada
   - NIT: 900.123.456-7
   - Country: Colombia
   - Department: Antioquia
   - Municipality: Medellín
   - Address: Calle 50 #45-30
   - Phone: +57 304 123 4567
   - Contact Email: admin@ceibatic.com
2. Hacer clic en "Create Company" o "Next"

**Resultados Esperados**:
- ✅ Empresa creada en tabla `companies` con status "active"
- ✅ Usuario asignado rol "COMPANY_OWNER" automáticamente
- ✅ Relación user-company creada correctamente
- ✅ Subscription plan "basic" asignado (1 facility, 10 users)
- ✅ Redirect a página "Setup Your First Facility"

**Notas**:
- NIT debe ser único en el sistema
- Department y Municipality deben seleccionarse de lista de `geographic_locations`
- Company name no necesita ser único (puede haber varias "Test Farm SA")

---

## Test 1.4: Configuración del Primer Facility

**Objetivo**: Validar la creación del facility inicial de la empresa.

**Precondiciones**:
- Test 1.3 completado exitosamente
- En página de "Create Facility"

**Pasos**:
1. Completar formulario de facility:
   - Facility Name: North Greenhouse
   - License Number: COL-CNB-2024-001
   - License Type: Commercial Growing
   - Primary Crop Type: Cannabis (seleccionar de dropdown)
   - Total Area: 500
   - Area Unit: m²
   - Facility Type: Indoor
   - Climate Controlled: Yes
   - Climate Zone: Tropical
   - Municipality: Medellín (seleccionar de dropdown)
2. Hacer clic en "Create Facility" o "Complete Setup"

**Resultados Esperados**:
- ✅ Facility creado en tabla `facilities` con status "active"
- ✅ `primary_crop_type_id` apunta a Cannabis en `crop_types`
- ✅ Usuario actualizado con `primary_facility_id` apuntando al nuevo facility
- ✅ Relación con company establecida correctamente
- ✅ Redirect a Dashboard principal
- ✅ Dashboard muestra facility seleccionado: "North Greenhouse"

**Notas**:
- License number debe ser único por facility
- El dropdown de Crop Types debe cargar desde endpoint `/api/getCropTypes`
- Municipality debe filtrar por Department seleccionado previamente (Antioquia)

---

## Test 1.5: Verificar Dashboard Inicial

**Objetivo**: Validar que el dashboard muestra correctamente el estado inicial.

**Precondiciones**:
- Test 1.4 completado exitosamente
- Usuario en dashboard principal

**Pasos**:
1. Observar el dashboard principal
2. Verificar widgets y contadores
3. Verificar menú de navegación

**Resultados Esperados**:
- ✅ Header muestra: "North Greenhouse" (facility actual)
- ✅ Widget de Active Orders: 0
- ✅ Widget de Areas: 0
- ✅ Widget de Active Templates: 0
- ✅ Widget de Team Members: 1 (solo admin)
- ✅ Menú de navegación muestra todas las opciones de Phase 2:
  - Areas
  - Cultivars
  - Suppliers
  - Inventory
  - Team
  - Settings
- ✅ Usuario puede navegar a cualquier sección sin errores

**Notas**:
- Los contadores deben estar en 0 o valores iniciales lógicos
- El facility switcher debe mostrar solo "North Greenhouse" (único facility)

---

## Test 1.6: Logout y Login

**Objetivo**: Validar que el usuario puede cerrar sesión y volver a iniciar sesión.

**Precondiciones**:
- Test 1.5 completado exitosamente
- Usuario loggeado en dashboard

**Pasos**:
1. Hacer clic en usuario/avatar en esquina superior
2. Seleccionar "Logout" o "Sign Out"
3. Verificar redirect a página de login
4. Ingresar credenciales:
   - Email: admin@ceibatic.com
   - Password: [password del Test 1.1]
5. Hacer clic en "Login" o "Sign In"

**Resultados Esperados**:
- ✅ Al hacer logout:
  - Session token invalidado en backend
  - Redirect a página de login
  - No se puede acceder a rutas protegidas sin re-autenticar
- ✅ Al hacer login:
  - Nuevo session token generado
  - `last_login_at` actualizado en user
  - Redirect a dashboard
  - Facility "North Greenhouse" sigue seleccionado

**Notas**:
- Session tokens deben expirar después de X horas de inactividad
- Si las credenciales son incorrectas, mostrar error claro

---

## Test 1.7: Obtener Datos de Referencia (Crop Types)

**Objetivo**: Validar que el endpoint de crop types devuelve datos correctos.

**Precondiciones**:
- Usuario loggeado

**Pasos**:
1. Navegar a página de creación de nuevo facility (o cualquier página que use crop types)
2. Observar dropdown de "Crop Type"
3. Verificar opciones disponibles

**Resultados Esperados**:
- ✅ Dropdown carga sin errores
- ✅ Muestra al menos estos crop types:
  - Cannabis
  - Hemp
  - Vegetables
  - Flowers
  - Other
- ✅ Cada opción tiene `id` y `name`
- ✅ Cannabis debe estar disponible para selección

**Notas**:
- Este endpoint (`getCropTypes`) es público o requiere autenticación mínima
- Los crop types son datos maestros del sistema

---

## Test 1.8: Obtener Datos Geográficos (Departments y Municipalities)

**Objetivo**: Validar que los endpoints de ubicaciones geográficas funcionan correctamente.

**Precondiciones**:
- Usuario loggeado
- En cualquier formulario que requiera ubicación (company o facility)

**Pasos**:
1. Observar dropdown de "Department"
2. Seleccionar "Antioquia"
3. Observar dropdown de "Municipality"
4. Verificar que Medellín está disponible

**Resultados Esperados**:
- ✅ Dropdown de Departments carga todos los departamentos de Colombia
- ✅ "Antioquia" tiene código "05"
- ✅ Al seleccionar Antioquia, dropdown de Municipalities se filtra
- ✅ "Medellín" aparece con código "05001"
- ✅ Municipalities de otros departments no aparecen

**Notas**:
- Datos geográficos vienen de tabla `geographic_locations`
- Debe haber cascading: Department → Municipality
- Validation: no se puede seleccionar municipality sin department

---

## Test 1.9: Invitar Usuario al Equipo (Preview de Phase 2)

**Objetivo**: Validar el flujo de invitación de un nuevo usuario (se completará en Phase 2).

**Precondiciones**:
- Tests 1.1-1.8 completados
- Usuario admin loggeado
- Facility "North Greenhouse" configurado

**Pasos**:
1. Navegar a "Team" o "Users"
2. Hacer clic en "Invite User"
3. Completar formulario:
   - Email: maria.garcia@testfarm.com
   - First Name: María
   - Last Name: García
   - Role: Facility Manager
   - Facility: North Greenhouse
4. Hacer clic en "Send Invitation"

**Resultados Esperados**:
- ✅ Invitación creada en sistema
- ✅ Email de invitación enviado a maria.garcia@testfarm.com
- ✅ Mensaje de confirmación: "Invitation sent successfully"
- ✅ Usuario invitado aparece en lista de Team con status "pending"

**Notas**:
- El flujo completo de aceptación se testea en Test 1.10
- La invitación debe expirar después de X días (ej: 7 días)

---

## Test 1.10: Aceptar Invitación de Usuario (Module 1B)

**Objetivo**: Validar que un usuario invitado puede aceptar la invitación y unirse al equipo.

**Precondiciones**:
- Test 1.9 completado
- Email de invitación recibido en maria.garcia@testfarm.com

**Pasos**:
1. Abrir email de invitación
2. Hacer clic en link de aceptación
3. Completar formulario de aceptación:
   - First Name: María (pre-llenado)
   - Last Name: García (pre-llenado)
   - Email: maria.garcia@testfarm.com (pre-llenado, readonly)
   - Password: [password seguro]
   - Confirm Password: [mismo password]
4. Hacer clic en "Accept Invitation"
5. Verificar email (código de 6 dígitos)
6. Login con nuevas credenciales

**Resultados Esperados**:
- ✅ Usuario creado con email verificado automáticamente
- ✅ Usuario asignado a "Test Farm SA" company
- ✅ Usuario asignado a "North Greenhouse" facility
- ✅ Rol "Facility Manager" asignado correctamente
- ✅ Redirect a dashboard después de verificación
- ✅ Dashboard muestra "North Greenhouse" como facility activo
- ✅ Usuario puede ver módulos según sus permisos

**Notas**:
- El link de invitación debe ser de un solo uso
- Si la invitación expiró, mostrar mensaje claro
- El usuario invitado no crea empresa (se une a una existente)

---

## Test 1.11: Persistencia de Contexto (Bubble State)

**Objetivo**: Validar que el sistema guarda y recupera el contexto de usuario (facility seleccionado, filtros, etc.).

**Precondiciones**:
- Usuario loggeado
- Facility "North Greenhouse" activo

**Pasos**:
1. Verificar que facility actual es "North Greenhouse"
2. Hacer logout
3. Hacer login nuevamente
4. Verificar facility seleccionado

**Resultados Esperados**:
- ✅ Después de re-login, "North Greenhouse" sigue seleccionado
- ✅ El contexto se recupera desde `primary_facility_id` del usuario
- ✅ Si hay endpoint `getContextData`, devuelve facility correcto

**Notas**:
- Este flujo es importante para Bubble que mantiene estado en frontend
- El endpoint `saveContextData` y `getContextData` permiten sincronización

---

## Resumen de Phase 1

### Flujo Completo Esperado

```
1. Register (admin@ceibatic.com)
   ↓
2. Verify Email (código 6 dígitos)
   ↓
3. Create Company (Test Farm SA)
   ↓
4. Create Facility (North Greenhouse)
   ↓
5. Dashboard (estado inicial)
   ↓
6. Invite Team Member (opcional)
   ↓
7. Ready for Phase 2
```

### Estado del Sistema al Finalizar Phase 1

**Base de Datos**:
- 1 company: "Test Farm SA"
- 1 facility: "North Greenhouse"
- 1-3 users:
  - admin@ceibatic.com (Company Owner)
  - maria.garcia@testfarm.com (Facility Manager) - opcional
  - juan.lopez@testfarm.com (Production Operator) - opcional
- 1+ sessions activas

**UI/Frontend**:
- Usuario puede navegar todo el sistema
- Dashboard muestra estado inicial (contadores en 0)
- Facility switcher funcional (si hay múltiples facilities)
- Menú de navegación completo visible

### Criterios de Éxito

- ✅ Usuario registrado y verificado
- ✅ Empresa creada y configurada
- ✅ Facility configurado y activo
- ✅ Login/logout funcionando
- ✅ Referencias de datos (crop types, geo) cargando correctamente
- ✅ (Opcional) Team members invitados y aceptados

### Troubleshooting

**Problema: Email de verificación no llega**
- Verificar carpeta de spam
- Esperar hasta 5 minutos
- Usar función "Resend verification code"

**Problema: No puedo crear company después de verificar email**
- Verificar que `email_verified: true` en base de datos
- Verificar que sesión está activa
- Revisar logs de backend para errores

**Problema: Dropdown de Crop Types vacío**
- Verificar que tabla `crop_types` tiene datos seed
- Verificar que endpoint `/api/getCropTypes` funciona
- Verificar permisos de API

**Problema: No puedo crear facility (límite alcanzado)**
- Plan "basic" permite solo 1 facility
- Si ya existe un facility, eliminar o cambiar de plan

**Problema: Usuario invitado no recibe email**
- Verificar que email es válido
- Verificar configuración de email service
- Verificar que invitación existe en base de datos

---

**Siguiente fase**: [02-PHASE-2-MASTER-DATA-TESTS.md](02-PHASE-2-MASTER-DATA-TESTS.md)
