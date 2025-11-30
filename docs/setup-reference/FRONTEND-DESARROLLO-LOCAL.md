# Desarrollo Local - Alquemist Frontend

**Alquemist PWA - Aplicación de Trazabilidad Agrícola**
**Última actualización**: Noviembre 2025

---

## Requisitos Previos

- **Node.js**: v20+ (recomendado v22.18.0)
- **npm**: v10+ (recomendado v10.9.3)
- **Git**: Para control de versiones
- **Sistema Operativo**: Linux, macOS, o Windows (con WSL2)
- **Editor**: VS Code recomendado

---

## Configuración Inicial

### 1. Instalar Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- Next.js 15 (con Turbopack)
- React 19
- Convex (cliente)
- Tailwind CSS v4
- shadcn/ui components
- Lucide React (iconos)
- next-pwa (PWA)
- use-intl (i18n)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Convex Backend (Production)
NEXT_PUBLIC_CONVEX_URL=https://handsome-jay-388.convex.site

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Alquemist
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

**Nota**: No cambies `NODE_ENV` manualmente en `.env.local` - Next.js lo gestiona automáticamente.

---

## Comandos de Desarrollo

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar con puerto específico
PORT=3001 npm run dev
```

Esto iniciará:
- Next.js 15 en modo desarrollo con Turbopack
- Hot reload automático
- Servidor en http://localhost:3000 (o el puerto especificado)

### Build para Producción

```bash
# Build optimizado
npm run build

# Iniciar versión de producción
npm run start

# Preview del build
npm run build && npm run start
```

### Otros Comandos Útiles

```bash
# Linting
npm run lint

# Linting con auto-fix
npm run lint:fix

# Type checking
npm run type-check

# Limpiar caché de Next.js
rm -rf .next

# Reinstalar dependencias limpias
rm -rf node_modules package-lock.json
npm install
```

---

## Estructura del Proyecto

```
/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Route group: Autenticación
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── verify-email/
│   │   │   └── accept-invitation/
│   │   ├── (dashboard)/  # Route group: Dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── areas/
│   │   │   ├── inventory/
│   │   │   └── production/
│   │   ├── (onboarding)/ # Route group: Onboarding
│   │   │   ├── company-setup/
│   │   │   └── facility-setup/
│   │   ├── layout.tsx    # Layout principal
│   │   ├── page.tsx      # Landing page
│   │   └── globals.css   # Estilos globales
│   ├── components/       # Componentes React
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/        # Componentes de autenticación
│   │   └── shared/      # Componentes compartidos
│   ├── providers/        # Context providers
│   │   ├── ConvexClientProvider.tsx
│   │   └── IntlProvider.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCurrentFacility.ts
│   │   └── useToast.ts
│   ├── lib/             # Utilidades y helpers
│   │   ├── utils.ts     # Funciones de utilidad
│   │   ├── constants.ts # Constantes
│   │   └── validations.ts # Schemas de validación
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── i18n/            # Internacionalización
│       ├── es.json
│       └── en.json
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── icon.svg         # Icono base
│   ├── icons/           # Iconos PWA generados
│   └── sw.js            # Service worker (generado)
├── convex/              # Backend Convex (NO MODIFICAR desde frontend)
├── docs/                # Documentación
├── next.config.ts       # Configuración Next.js + PWA
├── tailwind.config.ts   # Configuración Tailwind
├── tsconfig.json        # Configuración TypeScript
├── components.json      # Configuración shadcn/ui
└── package.json         # Dependencias del proyecto
```

---

## Características Implementadas

### ✅ Configurado e Implementado

- **Next.js 15**: App Router, Server Components, Turbopack
- **React 19**: Última versión con mejoras de rendimiento
- **Convex Integration**: Cliente configurado para backend en tiempo real
- **Tailwind CSS v4**: Sistema de diseño configurado
- **shadcn/ui**: Componentes base instalados
- **Iconografía**: Lucide React (NO emojis)
- **i18n**: Sistema de internacionalización (Español/Inglés)
- **PWA**: next-pwa configurado
- **TypeScript**: Configuración estricta

### 🔜 Pendiente de Implementar (Por Fases)

#### PHASE 1: Onboarding & Foundation
- [ ] Páginas de autenticación (Login, Signup, Email Verification)
- [ ] Onboarding flow (Company Setup, Facility Setup)
- [ ] User invitation acceptance flow
- [ ] Session management

#### PHASE 2: Basic Operations Setup
- [ ] Dashboard principal
- [ ] Gestión de Áreas de Cultivo
- [ ] Gestión de Cultivares
- [ ] Gestión de Proveedores
- [ ] User management & roles

#### PHASE 3: Production & Inventory
- [ ] Gestión de Lotes
- [ ] Inventario de productos
- [ ] Sistema de actividades
- [ ] Trazabilidad de lotes

---

## Desarrollo de Funcionalidades

### Agregar Nueva Página

```bash
# Crear archivo en src/app/
src/app/nueva-pagina/page.tsx
```

```tsx
export default function NuevaPagina() {
  return (
    <div>
      <h1>Nueva Página</h1>
    </div>
  );
}
```

Accesible en: http://localhost:3000/nueva-pagina

### Agregar Nuevo Componente

```bash
# Crear en src/components/
src/components/MiComponente.tsx
```

```tsx
"use client";

export function MiComponente() {
  return <div>Mi Componente</div>;
}
```

### Usar Convex (Queries/Mutations)

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MiComponente() {
  // Query data
  const data = useQuery(api.myModule.myQuery);

  // Mutation
  const mutate = useMutation(api.myModule.myMutation);

  const handleAction = async () => {
    try {
      await mutate({ param: "value" });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={handleAction}>
        Ejecutar Mutación
      </button>
    </div>
  );
}
```

### Usar shadcn/ui Components

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Formulario</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Nombre" />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  );
}
```

### Usar Internacionalización (i18n)

```tsx
"use client";

import { useTranslations } from 'use-intl';

export function Welcome() {
  const t = useTranslations('auth');

  return (
    <div>
      <h1>{t('welcome_title')}</h1>
      <p>{t('welcome_message')}</p>
    </div>
  );
}
```

---

## Problemas Comunes y Soluciones

### 1. Error: Module not found ❌

**Síntoma**: `Module not found: Can't resolve '@/components/...'`

**Causa**: Alias de TypeScript no configurado correctamente

**Solución**:
```bash
# Verificar tsconfig.json
cat tsconfig.json | grep paths

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

### 2. Error: Hydration mismatch ❌

**Síntoma**: `Warning: Text content did not match. Server: "X" Client: "Y"`

**Causa**: Diferencia entre renderizado del servidor y cliente

**Solución**:
```tsx
// ❌ NO usar Date.now() directamente en JSX
<div>{Date.now()}</div>

// ✅ USAR useEffect para datos del cliente
const [time, setTime] = useState<number | null>(null);

useEffect(() => {
  setTime(Date.now());
}, []);

return <div>{time ?? 'Loading...'}</div>;
```

---

### 3. Error: Convex "You don't have access" ❌

**Causa**: URL de Convex incorrecta o no configurada

**Solución**:
```bash
# Verificar .env.local
cat .env.local | grep CONVEX

# Debe ser:
NEXT_PUBLIC_CONVEX_URL=https://handsome-jay-388.convex.site
```

---

### 4. Puerto 3000 en uso ❌

**Síntoma**: "Port 3000 is already in use"

**Solución Rápida**:
```bash
# Usar puerto diferente
PORT=3001 npm run dev
```

**Solución Permanente**:
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto por defecto en package.json
"dev": "next dev -p 3001"
```

---

### 5. Error de compilación TypeScript ❌

**Síntoma**: Errores de tipos o compilación extraños

**Solución**:
```bash
# Limpiar caché de Next.js
rm -rf .next

# Verificar tipos
npm run type-check

# Reiniciar servidor
npm run dev
```

---

### 6. Hot Reload no funciona ⚠️

**Síntoma**: Cambios en código no se reflejan automáticamente

**Solución**:
```bash
# Reiniciar servidor
# Ctrl+C para detener
npm run dev

# Si persiste, limpiar caché
rm -rf .next node_modules/.cache
npm run dev
```

---

### 7. Tailwind CSS no aplica estilos ❌

**Síntoma**: Clases de Tailwind no tienen efecto

**Solución**:
```bash
# Verificar que globals.css está importado en layout.tsx
# Verificar tailwind.config.ts content paths

# Reiniciar servidor
npm run dev
```

---

## Testing en Dispositivos

### Probar en Dispositivo Móvil (misma red)

1. **Obtener IP local**:
```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows (WSL)
hostname -I
```

2. **Iniciar servidor con host 0.0.0.0**:
```bash
npm run dev -- -H 0.0.0.0
```

3. **Acceder desde móvil**:
```
http://TU_IP_LOCAL:3000
```

Ejemplo: `http://192.168.1.100:3000`

4. **Asegurar firewall permite conexiones**:
```bash
# Linux (UFW)
sudo ufw allow 3000/tcp
```

### Probar PWA

1. Build para producción (requerido para PWA):
```bash
npm run build
npm run start
```

2. Abre Chrome/Edge en modo incógnito

3. Navega a `http://localhost:3000`

4. Abre DevTools > Application > Manifest

5. Verifica que el manifest esté cargado

6. Prueba "Install App" desde el menú del navegador

### Probar Service Worker

1. Build de producción
```bash
npm run build
npm run start
```

2. DevTools > Application > Service Workers

3. Verifica que `sw.js` esté registrado

**Nota**: En desarrollo (`npm run dev`), el service worker está deshabilitado para evitar problemas con hot reload.

---

## Debugging

### Estrategia de Debugging

1. **Leer el mensaje de error completo**
   - No solo la primera línea
   - Buscar "at line X" para ubicar el problema

2. **Verificar estructura de archivos**
   ```bash
   tree src/ -L 3
   ```

3. **Limpiar caché y reconstruir**
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Verificar versiones**
   ```bash
   node --version   # Debe ser v20+
   npm --version    # Debe ser v10+
   next --version   # Debe ser 15+
   ```

5. **Revisar documentación oficial**
   - [Next.js 15 Docs](https://nextjs.org/docs)
   - [Convex Docs](https://docs.convex.dev/)
   - [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## Recursos Útiles

### Documentación

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [Convex Docs](https://docs.convex.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [PWA Guide](https://web.dev/progressive-web-apps/)

### Herramientas de Desarrollo

- **React DevTools**: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Lighthouse**: Auditoría PWA (Chrome DevTools)
- **Convex Dashboard**: https://dashboard.convex.dev/

### Archivos de Configuración

- [next.config.ts](../../next.config.ts) - Configuración Next.js y PWA
- [tailwind.config.ts](../../tailwind.config.ts) - Configuración Tailwind
- [tsconfig.json](../../tsconfig.json) - Configuración TypeScript
- [public/manifest.json](../../public/manifest.json) - PWA manifest

---

## Próximos Pasos

### PHASE 1: Onboarding & Foundation

1. **Configuración Inicial del Proyecto**
   - ✅ Eliminar código anterior
   - ✅ Crear documentación de desarrollo
   - [ ] Instalar dependencias base
   - [ ] Configurar estructura de carpetas
   - [ ] Setup de shadcn/ui
   - [ ] Configurar Convex client

2. **Autenticación (Module 1)**
   - [ ] Página de signup
   - [ ] Página de login
   - [ ] Verificación de email
   - [ ] Manejo de sesiones

3. **Onboarding Flow (Modules 2-3)**
   - [ ] Company setup page
   - [ ] Facility setup pages
   - [ ] Onboarding completion

4. **Invited User Flow (Module 5)**
   - [ ] Accept invitation page
   - [ ] Set password page
   - [ ] Welcome page

---

## Soporte

Para reportar problemas o solicitar funcionalidades:

1. Revisar [docs/api/PHASE-1-ONBOARDING-ENDPOINTS.md](../api/PHASE-1-ONBOARDING-ENDPOINTS.md)
2. Revisar [docs/ui/bubble/PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md)
3. Revisar [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
4. Contactar al equipo de desarrollo

---

**¡Feliz desarrollo! 🌱**
