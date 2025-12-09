# Module 06: Subscription Management

## Overview

El modulo de Suscripciones maneja la seleccion y gestion de planes de pago. En el MVP, todos los usuarios comienzan con un plan Trial gratuito de 30 dias. La seleccion de plan y pagos se implementaran en fases futuras.

**Estado**: Placeholder (MVP usa Trial automatico)

---

## User Stories

### US-06.1: Asignar plan Trial automatico
**Como** sistema
**Quiero** asignar automaticamente el plan Trial a nuevas empresas
**Para** que puedan comenzar a usar la plataforma inmediatamente

**Criterios de Aceptacion:**
- [ ] Al crear empresa (M03), se asigna plan "trial"
- [ ] Duracion: 30 dias desde creacion
- [ ] Limites: 1 facility, 3 usuarios
- [ ] No requiere metodo de pago
- [ ] Acceso a todas las funcionalidades basicas

**Escribe:** Automatico en `companies.create`

---

### US-06.2: Ver pagina de seleccion de plan (Futuro)
**Como** usuario en trial o sin plan
**Quiero** ver las opciones de planes disponibles
**Para** elegir el mas adecuado para mi empresa

**Criterios de Aceptacion:**
- [ ] Pagina `/subscription/plans`
- [ ] Cards comparativas de planes:
  - Trial (gratis, 30 dias)
  - Starter ($X/mes)
  - Pro ($Y/mes)
  - Enterprise (contactar)
- [ ] Cada card muestra: precio, facilities, usuarios, features
- [ ] Toggle Mensual/Anual con descuento 15%
- [ ] Boton "Seleccionar" en cada plan
- [ ] Plan actual marcado

**Estado:** No implementado

---

### US-06.3: Ver dias restantes de Trial
**Como** usuario en plan Trial
**Quiero** ver cuantos dias me quedan
**Para** planear mi upgrade

**Criterios de Aceptacion:**
- [ ] Banner o badge en dashboard mostrando dias restantes
- [ ] Alerta cuando quedan 7 dias
- [ ] Alerta urgente cuando quedan 3 dias
- [ ] Link a pagina de planes

**Estado:** Parcialmente implementado (calculo disponible)

---

### US-06.4: Procesar pago (Futuro)
**Como** usuario
**Quiero** pagar por un plan
**Para** desbloquear mas capacidades

**Criterios de Aceptacion:**
- [ ] Formulario de pago con Stripe
- [ ] Tarjeta de credito/debito
- [ ] Facturacion automatica
- [ ] Recibos por email
- [ ] Cancelacion en cualquier momento

**Estado:** No implementado

---

### US-06.5: Actualizar plan (Futuro)
**Como** usuario de plan pagado
**Quiero** cambiar mi plan
**Para** ajustar capacidades segun necesidad

**Criterios de Aceptacion:**
- [ ] Upgrade inmediato con prorrateo
- [ ] Downgrade al final del periodo
- [ ] Validacion de limites antes de downgrade
- [ ] Confirmacion de cambios

**Estado:** No implementado

---

### US-06.6: Manejar expiracion de Trial
**Como** sistema
**Quiero** manejar cuando expira el Trial
**Para** incentivar upgrade o limitar acceso

**Criterios de Aceptacion:**
- [ ] Notificacion 7 dias antes de expiracion
- [ ] Notificacion 3 dias antes
- [ ] Notificacion dia de expiracion
- [ ] Despues de expirar:
  - Dashboard muestra banner de upgrade
  - No se pueden crear nuevos registros
  - Datos existentes siguen visibles
  - Login sigue funcionando

**Estado:** Parcialmente implementado

---

## Schema

### Campos de `companies` relacionados

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `subscription_plan` | `string` | trial/starter/pro/enterprise |
| `subscription_tier` | `string` | monthly/yearly |
| `subscription_start_date` | `number?` | Inicio del periodo actual |
| `subscription_end_date` | `number?` | Fin del periodo (Trial: 30 dias) |
| `max_facilities` | `number` | Limite de instalaciones |
| `max_users` | `number` | Limite de usuarios |

---

## Planes Disponibles

| Plan | Precio | Facilities | Users | Features |
|------|--------|------------|-------|----------|
| Trial | Gratis | 1 | 3 | Basico, 30 dias |
| Starter | $X/mes | 5 | 10 | Completo |
| Pro | $Y/mes | 20 | 50 | Completo + Reportes |
| Enterprise | Contactar | Ilimitado | Ilimitado | Todo + Soporte |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M03-Company | Setup | Plan asignado al crear empresa |
| M17-Team | Validacion | Limite de usuarios |
| M18-Facility | Validacion | Limite de facilities |
| Stripe | Externo | Procesamiento de pagos (futuro) |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getPlans` | - | Lista de planes disponibles |
| `getCurrentPlan` | `companyId` | Plan actual con detalles |
| `getTrialDaysRemaining` | `companyId` | Dias restantes de trial |

### Mutations (Futuro)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `selectPlan` | `companyId, planId, tier` | `{ success }` |
| `processPayment` | `companyId, paymentMethodId` | `{ success, invoiceId }` |
| `cancelSubscription` | `companyId` | `{ success, endsAt }` |

---

## Notas de Implementacion

### MVP (Actual)
- Todas las empresas inician en Trial
- No hay UI de seleccion de planes
- No hay integracion de pagos
- Trial no bloquea acceso al expirar (solo warning)

### Fase 2+
- Implementar seleccion de planes
- Integrar Stripe
- Bloqueo suave post-Trial
- Notificaciones de expiracion

### Fase 3+
- Facturacion automatica
- Portal de cliente Stripe
- Downgrade automatico
- Analytics de suscripciones
