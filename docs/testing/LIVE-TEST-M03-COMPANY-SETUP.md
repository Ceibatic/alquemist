# Live Test: M03 Company Setup

**Fecha**: Enero 2026
**Objetivo**: Verificar que el flujo de creacion de empresa funciona correctamente tras la auditoria M03.

---

## Pre-requisitos

- [ ] `npx convex dev` corriendo sin errores
- [ ] `npm run dev` corriendo sin errores
- [ ] Usuario verificado existente (completar signup + verify-email primero)
- [ ] Roles seeded en DB (`COMPANY_OWNER` debe existir en tabla `roles`)

---

## Group A: Acceso y UI

### T1: Acceso al formulario
1. Login con usuario verificado SIN empresa
2. Navegar a `/company-setup`
- [ ] Pagina carga correctamente
- [ ] Logo Alquemist visible en header
- [ ] Titulo dice "Crea tu Empresa"
- [ ] Indicador de progreso muestra "Paso 1 de 2"
- [ ] Formulario centrado con ancho maximo

### T2: Redirect si ya tiene empresa
1. Login con usuario que YA tiene empresa
2. Navegar manualmente a `/company-setup`
- [ ] Redirige a `/dashboard` (o no permite acceder al form)

### T3: Acceso sin sesion
1. Cerrar sesion
2. Navegar directamente a `/company-setup`
- [ ] Redirige a `/login` o `/signup`

---

## Group B: Formulario y Validacion

### T4: Campos del formulario
1. En `/company-setup`, verificar que existen:
- [ ] Nombre de la Empresa (input text, requerido)
- [ ] Tipo de Negocio (select con: SAS, SA, LTDA, EU, Persona Natural)
- [ ] Industria Principal (select con: Cannabis, Cafe, Cacao, Flores, Mixto)
- [ ] Departamento (select dinamico)
- [ ] Municipio (select filtrado por departamento)
- [ ] Boton "Crear Empresa" color amber/amarillo

### T5: Validacion nombre empresa
1. Dejar nombre vacio, click "Crear Empresa"
- [ ] Muestra error de campo requerido
2. Escribir 1 caracter, intentar submit
- [ ] Muestra "Nombre de empresa muy corto"
3. Escribir 2+ caracteres
- [ ] Validacion pasa

### T6: Validacion selects requeridos
1. Dejar Tipo de Negocio sin seleccionar, submit
- [ ] Muestra error de seleccion requerida
2. Dejar Industria sin seleccionar, submit
- [ ] Muestra error de seleccion requerida
3. Dejar Departamento sin seleccionar, submit
- [ ] Muestra error de departamento requerido
4. Dejar Municipio sin seleccionar, submit
- [ ] Muestra error de municipio requerido

---

## Group C: Seleccion Geografica

### T7: Cascada departamento-municipio
1. Verificar que Municipio esta deshabilitado inicialmente
- [ ] Select de Municipio deshabilitado
- [ ] Placeholder indica seleccionar departamento primero
2. Seleccionar un departamento (ej: Antioquia)
- [ ] Municipio se habilita
- [ ] Loading indicator aparece brevemente
- [ ] Lista de municipios del departamento seleccionado se carga
3. Cambiar departamento a otro (ej: Cundinamarca)
- [ ] Municipio se resetea
- [ ] Nuevos municipios se cargan
- [ ] Municipios ordenados alfabeticamente

---

## Group D: Creacion Exitosa

### T8: Crear empresa completa
1. Llenar todos los campos:
   - Nombre: "Empresa Test M03"
   - Tipo: SAS
   - Industria: Cannabis
   - Departamento: (cualquiera)
   - Municipio: (cualquiera)
2. Click "Crear Empresa"
- [ ] Boton muestra estado de carga ("Creando empresa...")
- [ ] Toast de exito: "Empresa creada correctamente"
- [ ] Redirige a `/facility-basic`

### T9: Verificar datos en DB
1. Despues de crear, verificar en Convex dashboard:
- [ ] Registro en tabla `companies` con nombre, tipo, industria correctos
- [ ] `subscription_plan` = "trial"
- [ ] `max_facilities` = 1
- [ ] `max_users` = 3
- [ ] `status` = "active"
- [ ] Usuario tiene `company_id` apuntando a la empresa creada
- [ ] Usuario tiene `role_id` apuntando al rol `COMPANY_OWNER`

---

## Group E: Manejo de Errores

### T10: Error de red/servidor
1. Detener `npx convex dev`
2. Intentar crear empresa
- [ ] Muestra error generico al usuario
- [ ] Formulario NO se limpia (datos persisten)
- [ ] Boton vuelve a estado normal (no queda en loading)

### T11: Usuario ya tiene empresa (backend)
1. Intentar llamar la mutation `registerCompanyStep2` con un userId que ya tiene empresa
- [ ] Backend retorna error "Este usuario ya tiene una empresa asociada"

---

## Group F: Seguridad Backend

### T12: Auth guards en companies
1. Desde consola de Convex o API directa, intentar llamar:
   - `companies.getById` sin auth
   - `companies.list` sin auth
   - `companies.create` sin auth
   - `companies.update` sin auth
- [ ] Todos retornan error "No autenticado"

### T13: getByUser query
1. Con usuario autenticado que tiene empresa, llamar `companies.getByUser`
- [ ] Retorna la empresa del usuario
2. Con usuario sin empresa
- [ ] Retorna null

---

## Notas

- Si un test falla, revisar consola del browser y logs de Convex (`npx convex logs`)
- Para verificar datos en DB: Convex dashboard > Data > tabla relevante
- El rol COMPANY_OWNER debe existir previamente (seed de roles)
- Si el rol no existe, la empresa se crea pero el usuario queda sin rol asignado
