# Tab Seguridad

Tab 3 de `/settings/account?tab=security`. Cambio de contrasena del usuario.

## Campos del Formulario

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Contrasena Actual | PasswordInput (toggle visibilidad) | Si | Min 1 caracter |
| Nueva Contrasena | PasswordInput (toggle visibilidad) | Si | Min 8, 1 mayuscula, 1 numero, 1 especial |
| Confirmar Nueva Contrasena | PasswordInput (toggle visibilidad) | Si | Debe coincidir con nueva contrasena |

## Indicador de Fortaleza

Se muestra debajo de "Nueva Contrasena" cuando el campo tiene contenido. Barra de progreso con 5 criterios:

| Nivel | Score | Color |
|-------|-------|-------|
| Debil | 1-2 | red-500 |
| Media | 3 | yellow-500 |
| Buena | 4 | blue-500 |
| Fuerte | 5 | green-500 |

Criterios evaluados: longitud >= 8, longitud >= 12, mayusculas + minusculas, numeros, caracteres especiales.

## Requisitos de Contrasena

Alert informativo con los requisitos:
- Minimo 8 caracteres
- Al menos 1 letra mayuscula
- Al menos 1 numero
- Al menos 1 caracter especial (!@#$%^&*)

## Validacion adicional

- La nueva contrasena debe ser diferente a la actual (validado en Zod refine)
- Errores de Clerk mapeados: `form_password_incorrect` (contrasena actual incorrecta), `form_password_pwned` (contrasena comprometida)

## Al Guardar

1. Valida via `changePasswordSchema` (Zod)
2. Llama Clerk `clerkUser.updatePassword()` — no es mutation de Convex
3. Toast de exito, reset del formulario
4. Errores de Clerk se muestran como toast y se asignan al campo correspondiente

## Componentes

- `components/settings/security-form.tsx` — formulario completo
- `components/shared/password-input.tsx` — input con toggle de visibilidad
- Schema: `lib/validations/settings.ts` → `changePasswordSchema`
