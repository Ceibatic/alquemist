# PHASE 2: BASIC SETUP & MASTER DATA - TESTS

## Descripción de la Fase

Phase 2 cubre la configuración de todos los datos maestros necesarios para operar el sistema:
- Creación y gestión de áreas de producción
- Configuración de cultivares (variedades de cultivo)
- Gestión de proveedores
- Invitación y gestión de equipo
- Configuración de inventario
- Ajustes de facility y cuenta

## Módulos Cubiertos

- **Module 8**: Area Management
- **Module 15**: Cultivar Management
- **Module 16**: Supplier Management
- **Module 17**: User Invitations & Team Management
- **Module 18**: Facility Management & Switcher
- **Module 19**: Inventory Management
- **Module 20**: Facility Settings
- **Module 21**: Account Settings

## Datos de Prueba

Ver [00-TESTING-OVERVIEW.md](00-TESTING-OVERVIEW.md) para datos completos.

**Facility**: North Greenhouse
**Usuario**: admin@ceibatic.com

---

## Test 2.1: Crear Área de Producción - Propagation

**Objetivo**: Validar la creación de un área de propagación.

**Precondiciones**:
- Phase 1 completada exitosamente
- Usuario loggeado como admin@ceibatic.com
- Facility "North Greenhouse" seleccionado
- No existen áreas creadas (contador en 0)

**Pasos**:
1. Navegar a módulo "Areas"
2. Hacer clic en "Create New Area" o "Add Area"
3. Completar formulario:
   - Area Name: Propagation Room
   - Area Type: Propagation
   - Total Area: 50
   - Area Unit: m²
   - Capacity: 500
   - Capacity Unit: clones
   - Temperature Range: 24-26°C
   - Humidity Range: 70-80%
   - Compatible Crop Types: Cannabis (seleccionar)
4. Hacer clic en "Create Area"

**Resultados Esperados**:
- ✅ Área creada en tabla `areas`
- ✅ `facility_id` apunta a "North Greenhouse"
- ✅ Status: "active"
- ✅ Occupancy: 0/500 (sin plantas asignadas)
- ✅ Mensaje: "Area created successfully"
- ✅ Área aparece en lista de áreas
- ✅ Contador de dashboard actualizado a "1 Area"

**Notas**:
- El nombre del área debe ser único dentro del facility
- Compatible Crop Types debe incluir al menos Cannabis (crop type del facility)

---

## Test 2.2: Crear Área de Producción - Vegetative

**Objetivo**: Validar la creación de un área vegetativa.

**Precondiciones**:
- Test 2.1 completado
- Área "Propagation Room" existe

**Pasos**:
1. En módulo "Areas", hacer clic en "Create New Area"
2. Completar formulario:
   - Area Name: Vegetative Room
   - Area Type: Vegetative
   - Total Area: 150
   - Area Unit: m²
   - Capacity: 200
   - Capacity Unit: plants
   - Temperature Range: 22-26°C
   - Humidity Range: 60-70%
   - Compatible Crop Types: Cannabis
3. Hacer clic en "Create Area"

**Resultados Esperados**:
- ✅ Área creada exitosamente
- ✅ Lista muestra 2 áreas: Propagation Room, Vegetative Room
- ✅ Contador de dashboard: "2 Areas"
- ✅ Cada área muestra su capacidad correctamente

**Notas**:
- Las áreas son independientes entre sí
- No hay límite de áreas en plan básico

---

## Test 2.3: Crear Área de Producción - Flowering

**Objetivo**: Validar la creación de un área de floración.

**Precondiciones**:
- Test 2.2 completado
- 2 áreas existen

**Pasos**:
1. En módulo "Areas", hacer clic en "Create New Area"
2. Completar formulario:
   - Area Name: Flowering Room
   - Area Type: Flowering
   - Total Area: 250
   - Area Unit: m²
   - Capacity: 100
   - Capacity Unit: plants
   - Temperature Range: 20-24°C
   - Humidity Range: 40-50%
   - Compatible Crop Types: Cannabis
3. Hacer clic en "Create Area"

**Resultados Esperados**:
- ✅ Área creada exitosamente
- ✅ Lista muestra 3 áreas ordenadas (puede ser por fecha de creación o nombre)
- ✅ Contador de dashboard: "3 Areas"
- ✅ Total capacity del facility: 500 clones + 300 plants

**Notas**:
- Esta es la última área del setup básico
- Las 3 áreas representan el ciclo completo de cannabis

---

## Test 2.4: Ver y Editar Área Existente

**Objetivo**: Validar que se puede ver detalles y editar un área.

**Precondiciones**:
- Test 2.3 completado
- 3 áreas existen

**Pasos**:
1. En lista de áreas, hacer clic en "Propagation Room"
2. Verificar que se muestran todos los detalles
3. Hacer clic en "Edit" o botón de edición
4. Cambiar:
   - Capacity: 600 (aumentar de 500 a 600)
5. Guardar cambios

**Resultados Esperados**:
- ✅ Vista de detalles muestra toda la información del área
- ✅ Formulario de edición se pre-llena con datos actuales
- ✅ Cambio guardado exitosamente
- ✅ Capacity actualizado a 600 en lista y detalles
- ✅ Mensaje: "Area updated successfully"

**Notas**:
- No se debe permitir cambiar el facility_id
- Cambiar capacity no afecta plantas existentes (si las hubiera)

---

## Test 2.5: Listar Cultivares del Sistema

**Objetivo**: Validar que se pueden ver los cultivares disponibles en el sistema.

**Precondiciones**:
- Phase 1 completada
- Usuario loggeado

**Pasos**:
1. Navegar a módulo "Cultivars"
2. Ver pestaña "System Cultivars" o lista de cultivares del sistema
3. Buscar cultivares compatibles con Cannabis

**Resultados Esperados**:
- ✅ Lista muestra cultivares del sistema (tabla `cultivars` con `is_system: true`)
- ✅ Al menos estos cultivares disponibles:
  - Cherry AK
  - OG Kush
  - Northern Lights
- ✅ Cada cultivar muestra:
  - Name
  - Type (Indica/Sativa/Hybrid)
  - Flowering time
  - Crop type compatibility
- ✅ Se puede filtrar por crop type "Cannabis"

**Notas**:
- Los cultivares del sistema son read-only (no se pueden editar)
- Son compartidos entre todas las empresas

---

## Test 2.6: Vincular Cultivar del Sistema al Facility

**Objetivo**: Validar que se puede agregar un cultivar del sistema al facility.

**Precondiciones**:
- Test 2.5 completado
- Cultivares del sistema visibles

**Pasos**:
1. En módulo "Cultivars", buscar "Cherry AK"
2. Hacer clic en "Add to Facility" o "Link to Facility"
3. Confirmar acción
4. Repetir para "OG Kush" y "Northern Lights"

**Resultados Esperados**:
- ✅ Relación creada en tabla de facility-cultivars (o similar)
- ✅ Los 3 cultivares aparecen en pestaña "My Cultivars" o "Facility Cultivars"
- ✅ Mensaje: "Cultivar added to facility"
- ✅ Cultivares disponibles para usar en templates y orders

**Notas**:
- No se duplica el cultivar, solo se vincula
- Si ya está vinculado, mostrar "Already in facility" o botón deshabilitado

---

## Test 2.7: Crear Cultivar Personalizado

**Objetivo**: Validar que se puede crear un cultivar custom para el facility.

**Precondiciones**:
- Test 2.6 completado
- 3 cultivares del sistema vinculados

**Pasos**:
1. En módulo "Cultivars", hacer clic en "Create Custom Cultivar"
2. Completar formulario:
   - Name: Test Strain 1
   - Type: Hybrid
   - Genetics: Unknown
   - Flowering Time: 9 weeks
   - Crop Type: Cannabis
   - THC Range: 18-22%
   - CBD Range: <1%
   - Description: Custom hybrid for testing
3. Hacer clic en "Create Cultivar"

**Resultados Esperados**:
- ✅ Cultivar creado en tabla `cultivars` con `is_system: false`
- ✅ Automáticamente vinculado al facility actual
- ✅ Aparece en "My Cultivars"
- ✅ Marcado como "Custom" o tiene badge diferenciador
- ✅ Total cultivars en facility: 4 (3 system + 1 custom)

**Notas**:
- Los cultivares custom solo son visibles para el facility que los creó
- Se pueden editar y eliminar (a diferencia de los del sistema)

---

## Test 2.8: Crear Segundo Cultivar Personalizado

**Objetivo**: Validar que se pueden crear múltiples cultivares custom.

**Precondiciones**:
- Test 2.7 completado

**Pasos**:
1. Crear otro cultivar custom:
   - Name: Test Strain 2
   - Type: Sativa
   - Flowering Time: 10 weeks
   - Crop Type: Cannabis
2. Guardar

**Resultados Esperados**:
- ✅ Segundo cultivar custom creado exitosamente
- ✅ Total cultivars en facility: 5 (3 system + 2 custom)
- ✅ Ambos cultivars custom aparecen en lista

**Notas**:
- No hay límite de cultivares custom en plan básico

---

## Test 2.9: Crear Proveedor de Insumos Químicos

**Objetivo**: Validar la creación de un proveedor.

**Precondiciones**:
- Usuario loggeado
- Facility seleccionado

**Pasos**:
1. Navegar a módulo "Suppliers"
2. Hacer clic en "Add Supplier"
3. Completar formulario:
   - Supplier Name: FarmChem Inc
   - Contact Name: Carlos Rodríguez
   - Email: sales@farmchem.com
   - Phone: +57 301 234 5678
   - Address: Carrera 10 #20-30, Bogotá
   - Type: Chemicals / Nutrients
   - Rating: 4.5
   - Notes: Proveedor principal de nutrientes
4. Hacer clic en "Create Supplier"

**Resultados Esperados**:
- ✅ Proveedor creado en tabla `suppliers`
- ✅ Vinculado a facility "North Greenhouse"
- ✅ Status: "active"
- ✅ Aparece en lista de suppliers
- ✅ Mensaje: "Supplier created successfully"

**Notas**:
- Email y phone son opcionales pero recomendados
- Type puede ser free text o selección de categorías

---

## Test 2.10: Crear Proveedor de Equipamiento

**Objetivo**: Validar la creación de un segundo proveedor.

**Precondiciones**:
- Test 2.9 completado

**Pasos**:
1. En módulo "Suppliers", hacer clic en "Add Supplier"
2. Completar formulario:
   - Supplier Name: GrowSupply Colombia
   - Contact Name: Ana Martínez
   - Email: ventas@growsupply.co
   - Phone: +57 302 345 6789
   - Type: Equipment / Supplies
   - Notes: Sustratos y herramientas
3. Crear

**Resultados Esperados**:
- ✅ Segundo proveedor creado exitosamente
- ✅ Lista muestra 2 suppliers
- ✅ Se pueden filtrar por tipo

**Notas**:
- Los suppliers son independientes
- Luego se vincularán a inventory items

---

## Test 2.11: Crear Item de Inventario - Nutriente Base Vegetativa

**Objetivo**: Validar la creación de un item de inventario.

**Precondiciones**:
- Test 2.10 completado
- 2 suppliers existen

**Pasos**:
1. Navegar a módulo "Inventory"
2. Hacer clic en "Add Inventory Item"
3. Completar formulario:
   - Item Name: Base Vegetativa A+B
   - Category: Nutrients
   - Supplier: FarmChem Inc (seleccionar)
   - Unit of Measure: Liters
   - Current Stock: 500
   - Reorder Point: 100
   - Reorder Quantity: 500
   - Unit Cost: 25000 (COP por litro)
   - Notes: Fertilizante base para etapa vegetativa
4. Hacer clic en "Create Item"

**Resultados Esperados**:
- ✅ Item creado en tabla `inventory_items`
- ✅ Vinculado a facility y supplier
- ✅ Stock actual: 500 L
- ✅ Status: "in_stock" (porque stock > reorder point)
- ✅ Aparece en lista de inventario
- ✅ Mensaje: "Inventory item created successfully"

**Notas**:
- Si stock < reorder point, status debería ser "low_stock"
- Unit cost es opcional pero recomendado para tracking

---

## Test 2.12: Crear Múltiples Items de Inventario

**Objetivo**: Validar la creación de varios items de inventario.

**Precondiciones**:
- Test 2.11 completado

**Pasos**:
1. Crear los siguientes items (usar formulario repetidamente):

**Item 2: Base Floración A+B**
- Category: Nutrients
- Supplier: FarmChem Inc
- Unit: Liters
- Stock: 500
- Reorder Point: 100

**Item 3: Cal-Mag**
- Category: Supplements
- Supplier: FarmChem Inc
- Unit: Liters
- Stock: 100
- Reorder Point: 20

**Item 4: pH Down**
- Category: pH Control
- Supplier: FarmChem Inc
- Unit: Liters
- Stock: 50
- Reorder Point: 10

**Item 5: Coco Coir Premium**
- Category: Growing Media
- Supplier: GrowSupply Colombia
- Unit: Bags (50L)
- Stock: 200
- Reorder Point: 50

**Item 6: Perlita**
- Category: Growing Media
- Supplier: GrowSupply Colombia
- Unit: Bags (50L)
- Stock: 50
- Reorder Point: 20

**Resultados Esperados**:
- ✅ 6 items creados en total
- ✅ Cada item vinculado al supplier correcto
- ✅ Lista de inventario muestra todos los items
- ✅ Se pueden filtrar por:
  - Category
  - Supplier
  - Stock status (in stock / low stock)
- ✅ Dashboard muestra "6 Inventory Items" (o contador similar)

**Notas**:
- Esto simula el inventario inicial básico
- Más items se pueden agregar según necesidad

---

## Test 2.13: Ajustar Stock de Inventario

**Objetivo**: Validar que se puede ajustar el stock de un item.

**Precondiciones**:
- Test 2.12 completado
- Item "Cal-Mag" con stock 100

**Pasos**:
1. En lista de inventario, seleccionar "Cal-Mag"
2. Hacer clic en "Adjust Stock" o botón de ajuste
3. Seleccionar tipo: "Manual Adjustment"
4. Cantidad: -30 (reducir 30 litros)
5. Reason: "Damaged bottles"
6. Confirmar

**Resultados Esperados**:
- ✅ Stock actualizado a 70 L (100 - 30)
- ✅ Registro de ajuste guardado (tabla de inventory_transactions o similar)
- ✅ Mensaje: "Stock adjusted successfully"
- ✅ Nuevo stock se refleja en lista inmediatamente

**Notas**:
- Ajustes pueden ser positivos (entrada) o negativos (salida)
- El consumo por actividades se hace automáticamente (Phase 4)

---

## Test 2.14: Item con Low Stock Alert

**Objetivo**: Validar que el sistema alerta cuando un item está bajo en stock.

**Precondiciones**:
- Test 2.13 completado
- Item "Cal-Mag" ahora tiene stock 70

**Pasos**:
1. Ajustar stock de "Cal-Mag" a 15 L (por debajo de reorder point 20)
2. Ver lista de inventario

**Resultados Esperados**:
- ✅ Status del item cambia a "low_stock"
- ✅ Item aparece con badge o color de alerta (rojo/amarillo)
- ✅ (Opcional) Notificación o dashboard widget muestra "1 item low stock"
- ✅ Reorder quantity sugiere pedir 100 L

**Notas**:
- El reorder es manual, no automático
- En producción, podría generar notificación por email

---

## Test 2.15: Invitar Facility Manager al Equipo

**Objetivo**: Validar la invitación de un manager (si no se hizo en Phase 1).

**Precondiciones**:
- Usuario admin loggeado
- Email maria.garcia@testfarm.com no existe en sistema

**Pasos**:
1. Navegar a módulo "Team" o "Users"
2. Hacer clic en "Invite User"
3. Completar formulario:
   - Email: maria.garcia@testfarm.com
   - First Name: María
   - Last Name: García
   - Role: Facility Manager
   - Facility: North Greenhouse
   - Permissions: (seleccionar permisos según rol)
4. Enviar invitación

**Resultados Esperados**:
- ✅ Invitación creada en sistema
- ✅ Email enviado a maria.garcia@testfarm.com
- ✅ Usuario aparece en Team con status "pending"
- ✅ Mensaje: "Invitation sent to maria.garcia@testfarm.com"

**Notas**:
- El proceso de aceptación es igual al Test 1.10 de Phase 1
- No ejecutar aceptación aquí (es el mismo flujo)

---

## Test 2.16: Invitar Production Operator al Equipo

**Objetivo**: Validar la invitación de un operador.

**Precondiciones**:
- Test 2.15 completado

**Pasos**:
1. En módulo "Team", hacer clic en "Invite User"
2. Completar:
   - Email: juan.lopez@testfarm.com
   - First Name: Juan
   - Last Name: López
   - Role: Production Operator
   - Facility: North Greenhouse
3. Enviar invitación

**Resultados Esperados**:
- ✅ Segunda invitación enviada
- ✅ Lista de Team muestra:
  - admin@ceibatic.com (active, Company Owner)
  - maria.garcia@testfarm.com (pending, Facility Manager)
  - juan.lopez@testfarm.com (pending, Production Operator)

**Notas**:
- Total team members: 3 (1 active + 2 pending)
- Plan básico permite hasta 10 usuarios

---

## Test 2.17: Ver Lista de Team Members

**Objetivo**: Validar que se puede ver y gestionar el equipo.

**Precondiciones**:
- Test 2.16 completado
- 3 usuarios en el sistema

**Pasos**:
1. Navegar a módulo "Team"
2. Ver lista completa de miembros
3. Verificar filtros disponibles

**Resultados Esperados**:
- ✅ Lista muestra 3 usuarios con:
  - Name
  - Email
  - Role
  - Status (active/pending)
  - Facility
  - Actions (edit, resend invitation, delete)
- ✅ Se puede filtrar por:
  - Status
  - Role
  - Facility
- ✅ Admin puede editar roles de otros usuarios
- ✅ Admin NO puede editar su propio rol de Company Owner

**Notas**:
- Solo Company Owner y Facility Manager pueden gestionar equipo
- No se puede eliminar el último Company Owner

---

## Test 2.18: Ver Facility Settings

**Objetivo**: Validar que se pueden ver y editar configuraciones del facility.

**Preconditions**:
- Usuario admin loggeado
- Facility "North Greenhouse" seleccionado

**Pasos**:
1. Navegar a "Settings" > "Facility Settings"
2. Ver configuraciones actuales
3. Editar:
   - Total Area: 550 m² (aumentar de 500)
   - Climate Zone: Tropical
4. Guardar cambios

**Resultados Esperados**:
- ✅ Configuraciones actuales del facility visibles
- ✅ Campos editables:
  - Facility name
  - Total area
  - Climate zone
  - License info (renovaciones)
- ✅ Campos NO editables:
  - Facility ID
  - Primary crop type (requiere proceso especial)
  - Creation date
- ✅ Cambios guardados exitosamente
- ✅ Mensaje: "Facility settings updated"

**Notas**:
- Cambiar primary crop type puede afectar áreas y templates
- Se requiere confirmación para cambios críticos

---

## Test 2.19: Ver Account Settings

**Objetivo**: Validar que el usuario puede editar su perfil.

**Preconditions**:
- Usuario admin loggeado

**Pasos**:
1. Navegar a "Settings" > "Account Settings" o perfil de usuario
2. Ver información actual
3. Editar:
   - Phone: +57 304 999 8888
   - Preferred Language: Spanish
4. Guardar

**Resultados Esperados**:
- ✅ Información del usuario visible
- ✅ Campos editables:
  - First name / Last name
  - Phone
  - Language preference
  - Notification settings
- ✅ Password se cambia en sección separada (por seguridad)
- ✅ Email NO se puede cambiar (o requiere re-verificación)
- ✅ Cambios guardados exitosamente

**Notas**:
- Cambiar email requiere flujo especial de re-verificación
- Cambiar password requiere password actual para confirmar

---

## Test 2.20: Facility Switcher (Si hay múltiples facilities)

**Objetivo**: Validar el cambio entre facilities (si aplica).

**Preconditions**:
- Usuario tiene acceso a múltiples facilities (crear uno adicional si es necesario)

**Pasos**:
1. Observar facility actual en header: "North Greenhouse"
2. Hacer clic en facility switcher dropdown
3. Seleccionar otro facility (o crear uno nuevo para este test)
4. Verificar cambio de contexto

**Resultados Esperados**:
- ✅ Dropdown muestra todos los facilities del usuario
- ✅ Facility actual marcado/highlighted
- ✅ Al cambiar facility:
  - Header actualiza nombre
  - Dashboard recarga con datos del nuevo facility
  - Áreas, cultivares, inventario filtrados por nuevo facility
  - `primary_facility_id` del usuario actualizado

**Notas**:
- Este test es opcional si solo hay 1 facility
- El switcher es crítico para usuarios multi-facility

---

## Resumen de Phase 2

### Flujo Completo Esperado

```
1. Create 3 Areas (Propagation, Vegetative, Flowering)
   ↓
2. Link 3 System Cultivars + Create 2 Custom
   ↓
3. Add 2 Suppliers
   ↓
4. Create 6+ Inventory Items
   ↓
5. Invite 2 Team Members
   ↓
6. Configure Settings
   ↓
7. Ready for Phase 3
```

### Estado del Sistema al Finalizar Phase 2

**Áreas**:
- 3 areas: Propagation Room (50 m²), Vegetative Room (150 m²), Flowering Room (250 m²)
- Total capacity: 500 clones + 300 plants

**Cultivares**:
- 5 cultivares disponibles (3 system + 2 custom)
- Todos compatibles con Cannabis

**Suppliers**:
- 2 suppliers: FarmChem Inc, GrowSupply Colombia

**Inventario**:
- 6+ items creados
- Stock levels monitored
- Reorder points configurados

**Team**:
- 3 usuarios: 1 admin + 2 invitados (pending o active)

**Settings**:
- Facility configurado completamente
- Account preferences establecidas

### Criterios de Éxito

- ✅ Al menos 3 áreas creadas y activas
- ✅ Al menos 3 cultivares disponibles
- ✅ Al menos 2 suppliers registrados
- ✅ Al menos 5 inventory items creados
- ✅ Team configurado (invitaciones enviadas)
- ✅ Settings configurados correctamente

### Troubleshooting

**Problema: No puedo crear área (nombre duplicado)**
- Nombres de área deben ser únicos dentro del facility
- Usar nombre diferente o agregar sufijo (ej: "Room A", "Room B")

**Problema: Cultivar del sistema no aparece**
- Verificar filtro de crop type
- Verificar que crop type del facility sea compatible

**Problema: No se puede vincular supplier a inventory item**
- Verificar que supplier existe y está activo
- Verificar que supplier pertenece al mismo facility

**Problema: Stock adjustment no se refleja**
- Verificar permisos del usuario
- Refrescar página
- Verificar que cantidad es válida (no negativo final)

**Problema: Invitación no se puede enviar**
- Verificar que email no existe ya en el sistema
- Verificar límite de plan (10 usuarios en básico)
- Verificar configuración de email service

---

**Fase anterior**: [01-PHASE-1-ONBOARDING-TESTS.md](01-PHASE-1-ONBOARDING-TESTS.md)
**Siguiente fase**: [03-PHASE-3-TEMPLATES-TESTS.md](03-PHASE-3-TEMPLATES-TESTS.md)
