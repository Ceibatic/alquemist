# Módulo 1: Lista de Verificación de Inicio Rápido Bubble

**Pon en funcionamiento el Módulo 1 en Bubble en 6-8 horas**

⏱️ **Tiempo Total:** 6-8 horas
📝 **Dificultad:** Intermedio
✅ **Prerequisitos:** Cuenta Bubble, API Alquemist en ejecución, cuenta Clerk

---

## 🚀 Navegación Rápida

- **Configuración (1-1.5h):** [Fase 1](#fase-1-configuración-1-15-horas)
- **Perfil de Empresa (2h):** [Fase 2](#fase-2-perfil-de-empresa-2-horas)
- **Instalaciones (3-4h):** [Fase 3](#fase-3-lista-y-detalles-de-instalaciones-3-4-horas)
- **Pruebas (30min):** [Fase 4](#fase-4-pruebas-y-pulido-30-min)

---

## Fase 1: Configuración (1-1.5 horas)

### ✅ Lista de Verificación

#### 1. Autenticación Clerk (30 min)
- [ ] Instalar plugin Clerk en Bubble
- [ ] Agregar claves API de Clerk a la configuración del plugin
- [ ] Habilitar Organizations en el plugin Clerk
- [ ] Crear página Sign-in con componente Clerk SignIn
- [ ] Crear página Sign-up con componente Clerk SignUp
- [ ] Crear página Create-organization con componente Clerk
- [ ] Probar flujo de autenticación (registrarse → crear org → iniciar sesión)

**Prueba Rápida:**
```
1. Registrar nuevo usuario → Debería funcionar
2. Crear organización → Debería funcionar
3. Iniciar sesión → Debería redirigir al dashboard
```

#### 2. Configuración API Connector (30 min)
- [ ] Abrir Plugins → API Connector
- [ ] Agregar nueva API: "Alquemist API"
- [ ] Establecer header compartido: `Content-Type: application/json`
- [ ] Configurar llamada health_check (GET /api/v1)
- [ ] Probar health check → Debería retornar "operational"
- [ ] Configurar llamada get_company (GET /api/v1/companies)
- [ ] Configurar llamada create_company (POST /api/v1/companies)
- [ ] Inicializar ambas con datos de prueba

**Prueba Rápida:**
```
Workflow health check:
Cuando botón clickeado → Llamada API health_check → Mostrar alerta con estado
Esperado: "operational"
```

#### 3. Data Types y States (15 min)
- [ ] Crear Data Type Company con campos:
  - id (text), name (text), legal_name (text), tax_id (text), status (text)
- [ ] Crear Data Type Facility con campos:
  - id (text), name (text), facility_type (text), license_number (text), status (text)
- [ ] Crear custom state en página index:
  - session_token (text)
  - organization_id (text)

#### 4. Reusable Elements (15 min)
- [ ] Crear Reusable Element Header:
  - Logo, menú de navegación, Clerk UserButton
- [ ] Crear Reusable Element Loading Spinner
- [ ] Crear Reusable Element Empty State

---

## Fase 2: Perfil de Empresa (2 horas)

### ✅ Lista de Verificación

#### 5. Página Dashboard (45 min)
- [ ] Crear página `dashboard`
- [ ] Agregar Reusable Element Header
- [ ] Agregar sección de bienvenida con nombre de empresa (dinámico)
- [ ] Agregar workflow: On page load → Get session token
- [ ] Agregar workflow: On page load → Llamada API get_company
- [ ] Mostrar nombre de empresa en texto de bienvenida
- [ ] Agregar botón: "View Company Profile" → company-profile
- [ ] Agregar botón: "Manage Facilities" → facilities-list

**Prueba Rápida:**
```
Cargar dashboard → Debería mostrar:
- Welcome, [Nombre Empresa]
- Dos botones clickeables
```

#### 6. Página Company Profile - Modo Vista (45 min)
- [ ] Crear página `company-profile`
- [ ] Agregar Reusable Element Header
- [ ] Agregar título de página: "Company Profile"
- [ ] Agregar botón "Edit" (arriba a la derecha)
- [ ] Agregar Group: Información Básica
  - Campos de texto: Nombre empresa, Nombre legal, ID fiscal, Tipo de negocio
- [ ] Agregar Group: Información de Contacto
  - Campos de texto: Email, Teléfono
- [ ] Agregar Group: Configuración Regional
  - Campos de texto: País, Locale, Moneda, Zona horaria
- [ ] Agregar workflow: On page load → Obtener datos de empresa
- [ ] Mostrar todos los campos dinámicamente

**Prueba Rápida:**
```
Navegar a company-profile → Debería mostrar:
- Todos los datos de empresa desde API
- Botón Edit visible
```

#### 7. Página Company Profile - Modo Edición (30 min)
- [ ] Agregar custom state: is_editing (yes/no)
- [ ] Crear campos de entrada (ocultos por defecto):
  - Condicional: When is_editing = yes
- [ ] Agregar botones "Save" y "Cancel" (ocultos por defecto)
- [ ] Agregar workflow: When Edit clicked → Set is_editing = yes
- [ ] Agregar workflow: When Cancel clicked → Set is_editing = no
- [ ] Agregar workflow: When Save clicked:
  - Validar entradas
  - Llamada API: update_company
  - Mostrar mensaje de éxito
  - Set is_editing = no
  - Refrescar datos

**Prueba Rápida:**
```
1. Clic Edit → Campos de entrada aparecen
2. Cambiar nombre de empresa
3. Clic Save → Debería actualizar y mostrar nuevo nombre
4. Clic Edit → Clic Cancel → No se guardan cambios
```

---

## Fase 3: Lista y Detalles de Instalaciones (3-4 horas)

### ✅ Lista de Verificación

#### 8. Página Lista de Instalaciones (1.5 horas)
- [ ] Crear página `facilities-list`
- [ ] Agregar Reusable Element Header
- [ ] Agregar título de página: "Facilities"
- [ ] Agregar botón "Create New Facility" (arriba a la derecha)
- [ ] Agregar campo de búsqueda
- [ ] Agregar dropdown: Filtro de tipo de instalación
- [ ] Agregar Repeating Group:
  - Type: Facility
  - Data source: API - list_facilities
  - Layout: Full list (vertical)
  - Items per page: 10
- [ ] Diseñar Tarjeta de Instalación dentro del Repeating Group:
  - Nombre de instalación (grande, negrita)
  - Tipo y número de licencia
  - Ubicación (ciudad, estado)
  - Badge de expiración de licencia (codificado por color)
  - Botón "View"
- [ ] Agregar controles de paginación (anterior/siguiente)
- [ ] Agregar workflow: Filtrar cuando dropdown cambia
- [ ] Agregar workflow: Buscar cuando input cambia (retraso 500ms)
- [ ] Agregar estado vacío (condicional, cuando lista está vacía)

**Prueba Rápida:**
```
1. Cargar página → Debería mostrar instalación de prueba
2. Buscar por nombre → Debería filtrar
3. Filtrar por tipo → Debería filtrar
4. Clic View → Debería ir a detalles de instalación
```

#### 9. Página Detalles de Instalación (1 hora)
- [ ] Crear página `facility-details`
- [ ] Agregar parámetro URL: facility_id
- [ ] Agregar Reusable Element Header
- [ ] Agregar título de página: Nombre de instalación (dinámico desde API)
- [ ] Agregar subtítulo de ubicación
- [ ] Agregar botón "Edit" (arriba a la derecha)
- [ ] Crear navegación por pestañas:
  - Overview (por defecto)
  - License
  - Areas (placeholder)
  - Team (placeholder)
- [ ] Agregar custom state: active_tab (text)
- [ ] Crear contenido pestaña Overview:
  - Tipo de instalación, estado
  - Área total, área de canopy
  - Dirección completa
  - Coordenadas, altitud
- [ ] Crear contenido pestaña License:
  - Número de licencia, tipo, autoridad
  - Fecha de emisión, fecha de expiración
  - Badge de estado (verde/amarillo/rojo)
  - Días restantes
- [ ] Agregar workflow: On page load → Obtener instalación por ID
- [ ] Agregar workflow: Tab clicked → Cambiar active_tab
- [ ] Agregar visibilidad condicional para contenido de pestañas

**Prueba Rápida:**
```
1. Clic View desde lista → Debería cargar instalación
2. Pestaña Overview → Muestra info de instalación
3. Pestaña License → Muestra info de licencia con estado
4. Color de badge de estado coincide con fecha de expiración
```

#### 10. Asistente Crear Instalación (1.5-2 horas)
- [ ] Crear página `create-facility`
- [ ] Agregar Reusable Element Header
- [ ] Agregar custom state: wizard_step (number, default: 1)
- [ ] Agregar custom state: draft_facility (Facility type)
- [ ] Agregar indicador de progreso: "Paso X de 3"
- [ ] Agregar barra de progreso visual (●━━○━━○)

**Paso 1: Información Básica**
- [ ] Crear Group: Paso 1 (condicional: wizard_step = 1)
- [ ] Agregar input: Nombre de instalación (requerido)
- [ ] Agregar dropdown: Tipo de instalación (requerido)
- [ ] Agregar textarea: Descripción (opcional)
- [ ] Agregar botones: Cancel, Next
- [ ] Agregar workflow: Next clicked
  - Validar: nombre y tipo no vacíos
  - Si válido: Guardar en draft, set wizard_step = 2
  - Si inválido: Mostrar error

**Paso 2: Ubicación**
- [ ] Crear Group: Paso 2 (condicional: wizard_step = 2)
- [ ] Agregar inputs: Dirección, Ciudad, Estado (requeridos)
- [ ] Agregar inputs: Latitud, Longitud, Altitud (opcionales)
- [ ] Agregar inputs: Área total, Área de canopy
- [ ] Agregar botones: Back, Next
- [ ] Agregar workflow: Back clicked → wizard_step = 1
- [ ] Agregar workflow: Next clicked
  - Validar campos requeridos
  - Si válido: Guardar en draft, set wizard_step = 3

**Paso 3: Licencia**
- [ ] Crear Group: Paso 3 (condicional: wizard_step = 3)
- [ ] Agregar input: Número de licencia (requerido)
- [ ] Agregar dropdown: Tipo de licencia (requerido)
- [ ] Agregar dropdown: Autoridad de licencia (requerido)
- [ ] Agregar date picker: Fecha de expiración (requerido)
- [ ] Agregar botones: Back, Create Facility
- [ ] Agregar workflow: Back clicked → wizard_step = 2
- [ ] Agregar workflow: Create Facility clicked
  - Validar campos de licencia
  - Mostrar loading spinner
  - Llamada API: create_facility (todos los datos draft)
  - Si éxito: Navegar a facility-details
  - Si error: Mostrar mensaje de error

**Prueba Rápida:**
```
1. Completar Paso 1 → Clic Next → Paso 2 aparece
2. Clic Back → Paso 1 aparece con datos guardados
3. Completar todos los pasos → Clic Create → Instalación creada
4. Cancel en Paso 2 → Diálogo de confirmación → Volver a lista
```

---

## Fase 4: Pruebas y Pulido (30 min)

### ✅ Lista de Verificación

#### 11. Pruebas de Flujo Completo (20 min)
- [ ] Probar flujo completo de autenticación:
  - Registrarse → Crear org → Dashboard
- [ ] Probar perfil de empresa:
  - Ver → Editar → Guardar → Cambios reflejados
- [ ] Probar lista de instalaciones:
  - Estado vacío (si es primera vez)
  - Crear primera instalación
  - Ver en lista
  - Búsqueda funciona
  - Filtro funciona
- [ ] Probar asistente de instalación:
  - Completar los 3 pasos
  - Navegación Back/Next
  - Confirmación de cancelar
  - Creación exitosa
- [ ] Probar detalles de instalación:
  - Todos los datos se muestran correctamente
  - Las pestañas cambian apropiadamente
  - Color de badge de licencia correcto

#### 12. Prueba Multi-Tenencia (10 min)
- [ ] Crear segunda organización en Clerk
- [ ] Iniciar sesión con segunda org
- [ ] Verificar que lista de instalaciones está vacía (aislada)
- [ ] Crear instalación en segunda org
- [ ] Cambiar de vuelta a primera org
- [ ] Verificar que las instalaciones son diferentes (sin filtración)

---

## 🎯 Criterios de Éxito

### Has terminado cuando:
- [x] La autenticación funciona (registrarse, iniciar sesión, creación de org)
- [x] El perfil de empresa se muestra y edita
- [x] La lista de instalaciones muestra datos con búsqueda/filtro
- [x] El asistente de crear instalación completa los 3 pasos
- [x] La página de detalles de instalación muestra toda la info con pestañas
- [x] Los colores de estado de licencia son correctos
- [x] El aislamiento multi-tenant está verificado
- [x] No hay errores de consola en el navegador

---

## 🐛 Solución Rápida de Problemas

### Problema: "Authorization failed"
**Solución:** Verificar que el token de sesión se está pasando en las llamadas API
```
Workflow: Obtener token de sesión en page load
Llamada API: Usar parámetro token con session_token
```

### Problema: "Company not found"
**Solución:** Crear empresa primero vía API
```
Después de creación de org → Llamada API: create_company
Usar organization_id desde sesión Clerk
```

### Problema: Lista de instalaciones vacía (pero debería tener datos)
**Solución:** Verificar configuración de llamada API
```
API Connector → list_facilities
Use as: Data (no Action)
Initialize call para capturar estructura
```

### Problema: Badge de licencia todo de un color
**Solución:** Agregar formato condicional
```
Badge background color (condicional):
When Current cell's expiration_date < Current date + days: 30 → Rojo
When Current cell's expiration_date < Current date + days: 60 → Amarillo
Else → Verde
```

### Problema: El asistente no avanza
**Solución:** Verificar workflow de validación
```
When Next clicked:
Only when: Input name is not empty AND Dropdown type is not empty
Then: Set wizard_step = wizard_step + 1
```

---

## 📊 Desglose de Tiempo

| Fase | Tarea | Tiempo | Acumulado |
|-------|------|------|------------|
| 1 | Configuración Clerk | 30m | 0:30 |
| 1 | API Connector | 30m | 1:00 |
| 1 | Data types | 15m | 1:15 |
| 1 | Reusable elements | 15m | 1:30 |
| 2 | Dashboard | 45m | 2:15 |
| 2 | Vista de empresa | 45m | 3:00 |
| 2 | Edición de empresa | 30m | 3:30 |
| 3 | Lista de instalaciones | 1:30 | 5:00 |
| 3 | Detalles de instalación | 1:00 | 6:00 |
| 3 | Asistente de creación | 2:00 | 8:00 |
| 4 | Pruebas | 30m | 8:30 |

**Total:** 6-8.5 horas (dependiendo de experiencia)

---

## 📚 Documentos de Referencia

- **Guía Completa:** [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md) - Instrucciones completas de configuración
- **Referencia API:** [API-Bubble-Reference.md](API-Bubble-Reference.md) - Todos los endpoints con ejemplos
- **Wireframes UI:** [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md) - Diseños visuales de páginas

---

## 💡 Consejos Pro

1. **Guarda frecuentemente:** Bubble auto-guarda, pero guarda manualmente antes de grandes cambios
2. **Prueba mientras avanzas:** No esperes hasta el final para probar
3. **Usa copiar-pegar:** Copia workflows que funcionan y adáptalos
4. **Depura con alertas:** Mostrar Result of step X en alerta para ver respuestas API
5. **Revisa la consola:** La consola del navegador muestra mensajes de error útiles

---

## ✅ Lista de Verificación Final

Antes de considerar el Módulo 1 completo:

- [ ] Todas las páginas creadas y funcionando
- [ ] Todos los workflows probados
- [ ] Todas las llamadas API configuradas correctamente
- [ ] Aislamiento multi-tenant verificado
- [ ] Sin errores de consola
- [ ] Responsivo en móvil (previsualizar en Bubble)
- [ ] Listo para mostrar a usuarios para feedback

---

**Estado:** Listo para implementar
**Tiempo Estimado:** 6-8 horas
**Próximo Módulo:** Módulo 2 - Gestión de Lotes

**¿Preguntas?** Revisa la [guía completa](Module-1-Bubble-Guide.md) o [referencia API](API-Bubble-Reference.md).
