# ALQUEMIST - TESTING OVERVIEW

## Propósito

Este conjunto de documentos proporciona guías de testing end-to-end para validar todas las funcionalidades de Alquemist, asumiendo que tanto la UI (Bubble) como el backend (Convex) están completamente implementados.

Los tests simulan un caso real de producción de cannabis medicinal en Colombia, siguiendo el flujo completo desde el registro de una empresa hasta la ejecución de órdenes de producción.

## Filosofía de Testing

- **Flujos completos**: Simular el ciclo completo de uso del sistema
- **Datos realistas**: Usar datos basados en regulaciones colombianas y prácticas reales
- **Conciso pero completo**: Describir el flujo y resultados esperados sin excesivo detalle
- **Secuencial**: Las fases deben ejecutarse en orden (1→2→3→4)

## Estructura de Documentos

- **00-TESTING-OVERVIEW.md** (este documento): Configuración general y datos de prueba
- **01-PHASE-1-ONBOARDING-TESTS.md**: Registro, verificación, creación de empresa y facility
- **02-PHASE-2-MASTER-DATA-TESTS.md**: Configuración de áreas, cultivares, proveedores, equipo e inventario
- **03-PHASE-3-TEMPLATES-TESTS.md**: Creación de templates de producción y QC forms con AI
- **04-PHASE-4-PRODUCTION-TESTS.md**: Creación y ejecución de órdenes de producción

## Entorno de Testing

### URLs
- **Convex Backend**: https://handsome-jay-388.convex.site
- **Bubble Frontend**: [URL de la app en Bubble]

### Cuenta Principal
- **Email**: admin@ceibatic.com
- **Rol**: Company Owner (creador de la empresa)
- **Password**: [Definir durante primer registro]

## Datos de Prueba Comunes

### Información de la Empresa

```
Nombre Comercial: Test Farm SA
Razón Social: Test Farm Sociedad por Acciones Simplificada
NIT: 900.123.456-7
País: Colombia
Departamento: Antioquia (código: 05)
Municipio: Medellín (código: 05001)
Dirección: Calle 50 #45-30, Medellín
Teléfono: +57 304 123 4567
Email de Contacto: admin@ceibatic.com
```

### Información del Facility Principal

```
Nombre: North Greenhouse
Número de Licencia: COL-CNB-2024-001
Tipo de Licencia: Cultivo Comercial (Commercial Growing)
Crop Type Principal: Cannabis
Área Total: 500 m²
Tipo de Instalación: Indoor
Control de Clima: Sí
Sistema de Iluminación: LED Full Spectrum
Zona Climática: Tropical
Municipio: Medellín (05001)
```

### Áreas de Producción

Se crearán 3 áreas principales:

1. **Sala de Propagación**
   - Nombre: Propagation Room
   - Área: 50 m²
   - Capacidad: 500 esquejes
   - Temperatura: 24-26°C
   - Humedad: 70-80%

2. **Sala Vegetativa**
   - Nombre: Vegetative Room
   - Área: 150 m²
   - Capacidad: 200 plantas
   - Temperatura: 22-26°C
   - Humedad: 60-70%

3. **Sala de Floración**
   - Nombre: Flowering Room
   - Área: 250 m²
   - Capacidad: 100 plantas
   - Temperatura: 20-24°C
   - Humedad: 40-50%

### Cultivares (Variedades)

**Cultivares del Sistema** (se vincularán al facility):
1. Cherry AK (Indica dominante, 8 semanas de floración)
2. OG Kush (Híbrido, 9 semanas de floración)
3. Northern Lights (Indica, 8 semanas de floración)

**Cultivares Personalizados** (se crearán):
1. Test Strain 1 (Custom Hybrid)
2. Test Strain 2 (Custom Sativa)

### Proveedores

1. **FarmChem Inc**
   - Tipo: Insumos químicos
   - Productos: Nutrientes, pH regulators, pesticidas
   - Email: sales@farmchem.com
   - Teléfono: +57 301 234 5678

2. **GrowSupply Colombia**
   - Tipo: Equipamiento y sustratos
   - Productos: Macetas, sustratos, herramientas
   - Email: ventas@growsupply.co
   - Teléfono: +57 302 345 6789

### Equipo de Trabajo

Se invitarán 2 usuarios adicionales:

1. **María García** (Facility Manager)
   - Email: maria.garcia@testfarm.com
   - Rol: Facility Manager
   - Permisos: Aprobar órdenes, gestionar equipo, ver reportes

2. **Juan López** (Production Operator)
   - Email: juan.lopez@testfarm.com
   - Rol: Production Operator
   - Permisos: Ejecutar actividades, reportar datos

### Items de Inventario

**Nutrientes:**
1. Base Vegetativa A+B (500 L)
2. Base Floración A+B (500 L)
3. Cal-Mag (100 L)

**Control de pH:**
4. pH Down (50 L)
5. pH Up (50 L)

**Sustrato:**
6. Coco Coir Premium (200 sacos de 50L)
7. Perlita (50 sacos de 50L)

**Control de Plagas:**
8. Aceite de Neem (20 L)
9. Jabón Potásico (20 L)

### Template de Producción

**Nombre**: Cannabis 8-Week Flowering Cycle

**Fases**:
1. Early Flower (Semanas 1-3)
2. Mid Flower (Semanas 4-6)
3. Late Flower (Semanas 7-8)

**Actividades Ejemplo**:
- Riego diario (recurring daily)
- Fertilización (recurring weekly)
- Defoliación (one-time, día 21)
- Flush final (dependent: 7 días antes de cosecha)
- Inspección de plagas (recurring, cada 3 días)

## Orden de Ejecución de Tests

Los tests deben ejecutarse en el siguiente orden estricto:

```
Phase 1 (Onboarding)
    ↓
Phase 2 (Master Data Setup)
    ↓
Phase 3 (Template Creation)
    ↓
Phase 4 (Production Execution)
```

Cada fase depende de que la anterior esté completada exitosamente.

## Formato de Casos de Prueba

Cada caso de prueba en los documentos de fase sigue este formato:

```markdown
### Test X.Y: [Nombre del Test]

**Objetivo**: [Breve descripción del objetivo]

**Precondiciones**:
- [Requisito 1]
- [Requisito 2]

**Pasos**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultados Esperados**:
- ✅ [Resultado esperado 1]
- ✅ [Resultado esperado 2]
- ✅ [Resultado esperado 3]

**Notas**:
- [Información adicional relevante]
- [Consideraciones especiales]
```

## Métricas de Éxito

Al completar todos los tests, deberías tener:

**Phase 1:**
- 1 empresa creada
- 1 facility activo
- 1 usuario verificado y con sesión activa

**Phase 2:**
- 3 áreas creadas
- 5 cultivares vinculados
- 2 proveedores registrados
- 2 usuarios invitados
- 9+ items de inventario

**Phase 3:**
- 1 template de producción
- 3 fases en el template
- 15+ actividades configuradas
- 1 QC template generado por AI

**Phase 4:**
- 1 orden de producción creada
- Orden aprobada por manager
- 5+ actividades completadas
- Consumo de inventario registrado
- Progreso trackeado (>30% completado)

## Troubleshooting General

### Email de verificación no llega
- Verificar carpeta de spam
- Esperar hasta 5 minutos
- Reenviar código de verificación

### No se puede crear facility
- Verificar límite del plan (Basic = 1 facility)
- Verificar que la empresa esté activa

### Errores de permisos
- Verificar que el usuario tenga el rol correcto
- Verificar que el usuario esté asignado al facility correcto

### AI no analiza fotos
- Verificar formato de imagen (JPG/PNG, max 10MB)
- Verificar configuración de Gemini API key
- Reintentar análisis

## Recursos Adicionales

- **Documentación de API**: `/docs/api/PHASE-X-*.md`
- **Documentación de UI**: `/docs/ui/bubble/PHASE-X-*.md`
- **Schema de Base de Datos**: `/docs/database/SCHEMA.md`
- **Lógica de Scheduling**: `/docs/ACTIVITY-SCHEDULING-LOGIC.md`
- **AI Quality Checks**: `/docs/AI-QUALITY-CHECKS.md`

## Notas Importantes

- Estos tests asumen funcionalidad completa de UI y backend
- Los datos son de ejemplo y pueden ajustarse según necesidades
- Las regulaciones colombianas pueden cambiar - actualizar datos según corresponda
- Para tests de AI, se requieren imágenes reales de plantas (no incluidas en esta documentación)

---

**Última actualización**: 2025-11-21
**Versión**: 1.0
