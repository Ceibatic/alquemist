# Lessons Learned

Patrones y reglas capturadas tras correcciones para evitar repetir errores.

<!-- Formato:
## [Fecha] - Descripcion breve
- **Error**: que paso
- **Causa raiz**: por que paso
- **Regla**: que hacer diferente
-->

## 2026-02-26 - replace_all con funciones legacy y modernas

- **Error**: Al usar `Edit` con `replace_all: true` para agregar audit trail de inventory_transactions en `activities.ts`, el reemplazo tambien modifico la funcion legacy `logActivity` que usa variable names en snake_case (`args.batch_id`, `args.performed_by`) vs camelCase (`opts.batchId`, `args.performedBy`) en `createSingleActivity`.
- **Causa raiz**: `replace_all: true` reemplaza TODAS las ocurrencias sin distincion. El patron de consumo FIFO era identico en ambas funciones pero las variables del contexto eran diferentes.
- **Regla**: Nunca usar `replace_all: true` cuando el archivo tiene funciones legacy y modernas con patrones similares. Siempre hacer ediciones individuales con contexto suficiente para que el match sea unico.

## 2026-02-26 - Verificar indexes antes de queries en Convex

- **Error**: Al escribir queries de trazabilidad, se asumio que `activities` tenia index `by_batch` pero en realidad ese index pertenecia a `batch_movements`. El index correcto es `by_batch_id`.
- **Causa raiz**: Nombres de indexes similares entre tablas. Schema.ts tiene 45+ tablas con muchos indexes.
- **Regla**: Siempre verificar el index name exacto en `schema.ts` antes de escribir queries. Usar Grep para buscar el index en la tabla especifica: `grep -A2 "by_batch" convex/schema.ts`.

## 2026-02-26 - Schema fields no siempre existen en todas las tablas

- **Error**: En la query de trazabilidad se intento usar `item.quantity_initial` y `r.unit` que no existen en el schema. Los campos correctos son `quantity_available` y `quantity_unit`.
- **Causa raiz**: Asumir nombres de campos por convencion sin verificar contra el schema real.
- **Regla**: Antes de acceder a campos de una tabla, leer la definicion exacta en `schema.ts`. No asumir que un campo existe solo porque "tiene sentido".

## 2026-02-26 - Documentacion como paso final obligatorio

- **Error**: (Preventivo) La implementacion de 18 sprints de schema+backend+UI iba a quedar sin documentacion si el usuario no lo pedia explicitamente.
- **Causa raiz**: El workflow de CLAUDE.md pide documentar pero es facil olvidarlo tras implementacion larga.
- **Regla**: Despues de cualquier implementacion que agregue pages, tabs, modales o wizards, actualizar `docs/pages/` como paso final. Checklist: INDEX.md, seccion README.md, subpaginas.md, y crear doc de seccion nueva si aplica.
