# Subpaginas — Usuarios

## `/users/[id]` — Perfil de Usuario

### Header

- Titulo: Nombre completo del usuario (o email si no tiene nombre)
- Breadcrumbs: Inicio > Usuarios > {Nombre}
- Boton "Editar Rol" (green-900): solo visible para Owners/Admins. Abre `EditUserRoleModal`

### 3 Cards Informativas

Grid responsive (md:2 cols, lg:3 cols):

#### Card 1: Informacion Personal

- Icono: User (green-900)
- Avatar grande (h-20 w-20) con iniciales en green-900
- Nombre (large font)
- Status badge: verde "Activo" / gris "Inactivo"
- Contacto:
  - Email con icono mail
  - Telefono con icono phone (si disponible)
  - Identificacion con icono ID (si disponible): tipo - numero

#### Card 2: Rol y Acceso

- Icono: UserCog (amber)
- Rol: badge con color (purple/blue/green/gray segun rol)
- Compania: nombre con icono building
- Instalaciones accesibles:
  - Lista de nombres con badges de ubicacion
  - Contador "Instalaciones (N)"
  - Si ninguna: "Sin acceso a instalaciones"

#### Card 3: Actividad

- Icono: Clock (green-900)
- Ultimo login:
  - Tiempo relativo (ej: "hace 3 dias")
  - Fecha absoluta en espanol (ej: "25 de febrero de 2026")
  - "Nunca" si no hay login
- Cuenta creada:
  - Tiempo relativo + fecha absoluta
- Verificacion de email:
  - Dot verde: "Email verificado"
  - Dot amarillo: "Email pendiente de verificacion"

### Boton Inferior

"Editar Rol" (green-900, icono UserCog): solo para Owners/Admins. Abre mismo `EditUserRoleModal`.

### Data Source

| Query | Datos |
|-------|-------|
| `users.getUserById({ userId })` | Perfil completo: nombre, email, phone, identification, roleId, roleName, status, lastLogin, createdAt, email_verified |

### Componentes

| Componente | Archivo |
|-----------|---------|
| UserDetailPage | `app/(dashboard)/users/[id]/page.tsx` |
| EditUserRoleModal | `components/users/edit-user-role-modal.tsx` |
