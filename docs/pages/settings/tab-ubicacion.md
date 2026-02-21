# Tab Ubicacion

Tab 2 de `/settings/facility?tab=ubicacion`. Informacion de ubicacion fisica de la instalacion.

## Campos del Formulario

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Direccion | Text input | No | Min 5, max 200 caracteres |
| Departamento | CascadingSelect | Si | Departamentos colombianos |
| Municipio | CascadingSelect (dependiente) | Si | Municipios del departamento seleccionado |
| Codigo Postal | Text input | No | Max 20 caracteres |
| Latitud | Number input | No | -90 a 90, step 0.000001 |
| Longitud | Number input | No | -180 a 180, step 0.000001 |
| Altitud (msnm) | Number input | No | -500 a 9000, step 0.1 |

## GPS

Boton `GeolocationButton` permite capturar latitud y longitud desde el navegador. Si hay coordenadas, se muestra un placeholder de mapa ("Disponible en versiones futuras").

## Al Guardar

1. Valida via Zod (`locationSchema` local)
2. Llama `api.facilities.update` con los campos del formulario
3. Toast de exito o error

## Componentes

- `components/settings/location-form.tsx` — formulario completo
- `components/shared/cascading-select.tsx` — selector departamento/municipio
- `components/shared/geolocation-button.tsx` — captura GPS del navegador
- Mutation: `api.facilities.update`
