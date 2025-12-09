# Module 16: Supplier Management

## Overview

El modulo de Proveedores permite gestionar los proveedores de insumos, semillas, equipos y servicios de la empresa. Cada proveedor tiene informacion de contacto, categorias de productos que ofrece, y puede vincularse a items de inventario y cultivares. Los proveedores requieren aprobacion manual antes de poder usarse en compras.

**Estado**: Implementado

---

## User Stories

### US-16.1: Ver lista de proveedores
**Como** administrador de compras
**Quiero** ver todos los proveedores de mi empresa
**Para** gestionar relaciones comerciales

**Criterios de Aceptacion:**
- [ ] Grid de cards o tabla con todos los proveedores de la empresa
- [ ] Cada entrada muestra: nombre, categorias de producto (badges), contacto principal, ciudad, estado (activo/inactivo)
- [ ] Cards/filas clickeables navegan a `/suppliers/[id]`
- [ ] Menu kebab con opciones: Ver, Editar, Activar/Desactivar
- [ ] Stats: total proveedores, activos, inactivos, por categoria
- [ ] Estado vacio: mensaje + CTA "Agregar Primer Proveedor"

**Consulta:** `suppliers.list({ companyId, isActive?, productCategory? })`

**Componentes:** [suppliers/page.tsx](app/(dashboard)/suppliers/page.tsx), [supplier-list.tsx](components/suppliers/supplier-list.tsx)

---

### US-16.2: Filtrar proveedores
**Como** administrador de compras
**Quiero** filtrar proveedores por categoria o estado
**Para** encontrar proveedores especificos

**Criterios de Aceptacion:**
- [ ] Dropdown de categoria de producto: Todas, Nutrientes, Sustratos, Semillas, Equipos, Servicios, etc.
- [ ] Filtro de estado: Todos / Activos / Inactivos
- [ ] Busqueda por nombre o contacto
- [ ] Contador de filtros activos
- [ ] Boton limpiar filtros

**Consulta:** Filtros aplicados en `suppliers.list` o cliente

**Componentes:** [supplier-list.tsx](components/suppliers/supplier-list.tsx)

---

### US-16.3: Crear nuevo proveedor
**Como** administrador de compras
**Quiero** registrar un nuevo proveedor
**Para** poder comprarle insumos

**Criterios de Aceptacion:**
- [ ] Boton "Agregar Proveedor" abre modal/pagina
- [ ] **Seccion Informacion Basica:**
  - Nombre comercial*
  - Razon social
  - NIT (tax_id)
  - Tipo de empresa (S.A.S, S.A., Ltda, etc.)
  - Numero de registro
- [ ] **Seccion Contacto:**
  - Nombre contacto principal
  - Email (validacion formato)
  - Telefono (formato colombiano)
- [ ] **Seccion Ubicacion:**
  - Direccion
  - Ciudad
  - Departamento
  - Pais (default: CO)
- [ ] **Seccion Productos:**
  - Categorias de producto* (multi-select, min 1)
  - Especializacion por cultivo (multi-select opcional)
- [ ] **Seccion Financiera:**
  - Terminos de pago
  - Moneda (default: COP)
- [ ] Campo de notas
- [ ] Proveedor se crea como `is_active: true`, `is_approved: false`
- [ ] Toast de exito

**Escribe:** `suppliers.create({ companyId, name, productCategories, ... })`

**Validaciones backend:**
- productCategories min 1
- email formato valido (si se proporciona)
- telefono formateado a colombiano

**Componentes:** [supplier-create-modal.tsx](components/suppliers/supplier-create-modal.tsx), [supplier-form.tsx](components/suppliers/supplier-form.tsx)

---

### US-16.4: Ver detalle de proveedor
**Como** administrador de compras
**Quiero** ver toda la informacion de un proveedor
**Para** evaluar y gestionar la relacion

**Criterios de Aceptacion:**
- [ ] Pagina `/suppliers/[id]` con informacion completa
- [ ] Header con nombre + badges de estado (activo/inactivo, aprobado/pendiente)
- [ ] Boton Editar
- [ ] **Card Informacion Comercial:**
  - Razon social, NIT, tipo empresa, registro
- [ ] **Card Contacto:**
  - Nombre, email (link mailto), telefono (link tel)
- [ ] **Card Ubicacion:**
  - Direccion completa, ciudad, departamento, pais
- [ ] **Card Productos y Servicios:**
  - Categorias como badges
  - Especializacion por cultivo
- [ ] **Card Financiero:**
  - Terminos de pago, moneda
- [ ] **Card Desempeno** (si hay datos):
  - Rating, confiabilidad entrega, score calidad
- [ ] Notas
- [ ] Fechas creacion/actualizacion

**Consulta:** `suppliers.get({ id, companyId })`

**Componentes:** [suppliers/[id]/page.tsx](app/(dashboard)/suppliers/[id]/page.tsx)

---

### US-16.5: Editar proveedor
**Como** administrador de compras
**Quiero** actualizar informacion de un proveedor
**Para** mantener datos actualizados

**Criterios de Aceptacion:**
- [ ] Pagina `/suppliers/[id]/edit` con formulario pre-poblado
- [ ] Mismos campos que creacion
- [ ] Campos adicionales para edicion:
  - Rating (0-5 estrellas)
  - Confiabilidad de entrega (0-100%)
  - Score de calidad (0-100%)
  - Estado aprobado (toggle)
- [ ] Botones: Cancelar + Guardar Cambios
- [ ] Toast de exito
- [ ] Redirige a detalle

**Consulta:** `suppliers.get({ id, companyId })` para pre-poblar
**Escribe:** `suppliers.update({ id, companyId, ... })`

**Componentes:** [suppliers/[id]/edit/page.tsx](app/(dashboard)/suppliers/[id]/edit/page.tsx), [supplier-form.tsx](components/suppliers/supplier-form.tsx)

---

### US-16.6: Activar/Desactivar proveedor
**Como** administrador de compras
**Quiero** activar o desactivar un proveedor
**Para** controlar con quien puedo hacer negocios

**Criterios de Aceptacion:**
- [ ] Toggle o boton en detalle/lista
- [ ] Confirmacion antes de desactivar
- [ ] Toast con mensaje segun accion
- [ ] Proveedor inactivo no aparece en selectores de otros modulos

**Escribe:** `suppliers.toggleStatus({ supplierId, companyId })`

---

### US-16.7: Eliminar proveedor (soft delete)
**Como** administrador de compras
**Quiero** eliminar un proveedor
**Para** limpiar proveedores que ya no uso

**Criterios de Aceptacion:**
- [ ] Confirmacion antes de eliminar
- [ ] Soft delete: cambia `is_active` a false
- [ ] Proveedor permanece en historial de inventario/compras
- [ ] No aparece en listas activas

**Escribe:** `suppliers.remove({ id, companyId })`

---

## Schema

### Tabla: `suppliers`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa propietaria |
| `name` | `string` | Nombre comercial |
| `legal_name` | `string?` | Razon social |
| `tax_id` | `string?` | NIT |
| `business_type` | `string?` | S.A.S/S.A./Ltda |
| `registration_number` | `string?` | Numero registro |
| `primary_contact_name` | `string?` | Nombre contacto |
| `primary_contact_email` | `string?` | Email contacto |
| `primary_contact_phone` | `string?` | Telefono contacto |
| `address` | `string?` | Direccion |
| `city` | `string?` | Ciudad |
| `administrative_division_1` | `string?` | Departamento |
| `country` | `string` | Pais (default: CO) |
| `product_categories` | `array<string>` | Categorias de producto |
| `crop_specialization` | `array<string>` | Cultivos especializados |
| `rating` | `number?` | 0-5 estrellas |
| `delivery_reliability` | `number?` | 0-100% |
| `quality_score` | `number?` | 0-100% |
| `certifications` | `array?` | Certificaciones |
| `licenses` | `array?` | Licencias |
| `payment_terms` | `string?` | Terminos de pago |
| `currency` | `string` | Moneda (default: COP) |
| `is_approved` | `boolean` | Aprobado para compras |
| `is_active` | `boolean` | Activo |
| `notes` | `string?` | Notas |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

---

## Categorias de Producto

| Valor | Label |
|-------|-------|
| `nutrients` | Nutrientes |
| `substrates` | Sustratos |
| `seeds` | Semillas |
| `clones` | Esquejes |
| `equipment` | Equipos |
| `packaging` | Empaques |
| `services` | Servicios |
| `chemicals` | Quimicos |
| `other` | Otros |

---

## Estados

| Campo | Valores | Uso |
|-------|---------|-----|
| `is_active` | true/false | Activo para operaciones |
| `is_approved` | true/false | Aprobado para compras |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M15-Cultivars | Referencia | Cultivars pueden tener supplier_id |
| M19-Inventory | Referencia | inventory_items tienen supplier_id |
| Compras (futuro) | Padre | Ordenes de compra refieren supplier |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, isActive?, productCategory?` | Supplier[] |
| `get` | `id, companyId` | Supplier (verifica ownership) |
| `getByCompany` | `companyId, isActive?, isApproved?, productCategory?` | Supplier[] |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `companyId, name, productCategories, ...` | min 1 categoria, email valido |
| `update` | `id, companyId, ...campos` | ownership, email valido |
| `toggleStatus` | `supplierId, companyId` | ownership |
| `remove` | `id, companyId` | ownership → soft delete |
