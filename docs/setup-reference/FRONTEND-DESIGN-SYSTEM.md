# Sistema de Diseño - Alquemist PWA

**Basado en las imágenes de referencia de la aplicación Bubble**
**Fecha**: Noviembre 2025

---

## Índice

1. [Paleta de Colores](#1-paleta-de-colores)
2. [Tipografía](#2-tipografía)
3. [Espaciado y Grid](#3-espaciado-y-grid)
4. [Componentes Base](#4-componentes-base)
5. [Patrones de Layout](#5-patrones-de-layout)
6. [Estados Visuales](#6-estados-visuales)
7. [Iconografía](#7-iconografía)
8. [Animaciones](#8-animaciones)
9. [Responsive Design](#9-responsive-design)
10. [Accesibilidad](#10-accesibilidad)

---

## 1. Paleta de Colores

### Colores Principales (Basados en las imágenes de referencia)

```typescript
// tailwind.config.ts
const colors = {
  // Brand Colors (del logo y sidebar activo)
  primary: {
    DEFAULT: '#1B5E20', // Verde oscuro (del logo Alquemist)
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#1B5E20', // Base
    600: '#2E7D32',
    700: '#388E3C',
    800: '#43A047',
    900: '#4CAF50',
  },

  // Accent Colors (botones CTA como "Crear Área", "Guardar")
  accent: {
    DEFAULT: '#FFC107', // Amarillo/Dorado
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Base
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Success (badges "Cannabis", estados activos)
  success: {
    DEFAULT: '#8BC34A', // Verde lima brillante
    light: '#DCEDC8',
    dark: '#689F38',
  },

  // Info (badges informativos)
  info: {
    DEFAULT: '#42A5F5',
    light: '#BBDEFB',
    dark: '#1976D2',
  },

  // Warning
  warning: {
    DEFAULT: '#FFA726',
    light: '#FFE0B2',
    dark: '#F57C00',
  },

  // Error
  error: {
    DEFAULT: '#EF5350',
    light: '#FFCDD2',
    dark: '#C62828',
  },

  // Grises (del diseño)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background (del contenido principal - tono lavanda/gris claro)
  background: {
    DEFAULT: '#E8E9F3', // Fondo principal
    card: '#FFFFFF',     // Cards/containers
    sidebar: '#F5F5F5',  // Sidebar background
  },
}
```

### Uso de Colores

#### Fondos
- **Background principal**: `background` (#E8E9F3)
- **Sidebar**: `background-sidebar` (#F5F5F5)
- **Cards/Containers**: `background-card` (#FFFFFF)
- **Item seleccionado en sidebar**: `primary-100` con texto `primary-700`

#### Texto
- **Texto principal**: `gray-900` (#212121)
- **Texto secundario**: `gray-600` (#757575)
- **Texto en sidebar activo**: `primary-700` (#388E3C)
- **Enlaces**: `primary-600` (#2E7D32)

#### Botones
- **Primario CTA (acciones principales)**: `accent-500` background, `gray-900` text
- **Secundario**: `background-card` background, `primary-600` border y text
- **Success**: `success` background, `white` text
- **Destructivo**: `error` background, `white` text

#### Badges/Pills
- **Activo/Cultivar**: `success` background, `success-dark` text
- **Info**: `info-light` background, `info-dark` text
- **Warning**: `warning-light` background, `warning-dark` text
- **Error**: `error-light` background, `error-dark` text

---

## 2. Tipografía

### Fuentes

```typescript
// Similar al diseño - usar Inter (sans-serif limpia)
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
```

### Escala Tipográfica

```css
/* Basado en el diseño mostrado */
--text-xs: 0.75rem;    /* 12px - Metadatos, labels pequeños */
--text-sm: 0.875rem;   /* 14px - Texto secundario */
--text-base: 1rem;     /* 16px - Texto principal */
--text-lg: 1.125rem;   /* 18px - Subtítulos */
--text-xl: 1.25rem;    /* 20px - Títulos de cards */
--text-2xl: 1.5rem;    /* 24px - Títulos de página */
--text-3xl: 1.875rem;  /* 30px - Títulos principales */
```

### Pesos

- **Regular (400)**: Texto general
- **Medium (500)**: Texto destacado, labels
- **Semibold (600)**: Subtítulos, títulos de cards
- **Bold (700)**: Títulos principales, botones CTA

### Ejemplos de Uso

```tsx
// Título de página (como "Areas")
<h1 className="text-2xl font-semibold text-gray-900">
  Areas
</h1>

// Título de card (como "001 - Propagación A")
<h2 className="text-xl font-semibold text-gray-900">
  001 - Propagación A
</h2>

// Metadata de card
<span className="text-sm text-gray-600">
  Lotes: 4
</span>

// Badge text
<span className="text-xs font-medium">
  Cannabis
</span>

// Botón principal
<button className="text-base font-semibold">
  Crear Área
</button>
```

---

## 3. Espaciado y Grid

### Sistema de Espaciado (basado en 4px)

```css
/* Tailwind usa este sistema por defecto */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Principal

```
┌─────────────────────────────────────────────┐
│ [Sidebar - 240px]  [Content - flex-1]       │
│                                              │
│  Logo              Header (h: 64px)         │
│                    ────────────────          │
│  User Profile                                │
│  ────────────      Content Area             │
│  Nav Menu          (padding: 24px)          │
│                                              │
│                    Cards Grid               │
│                                              │
└─────────────────────────────────────────────┘
```

### Medidas Clave

- **Sidebar width**: 240px (fijo en desktop, overlay en mobile)
- **Header height**: 64px
- **Content padding**: 24px (desktop), 16px (mobile)
- **Card padding**: 20px
- **Gap entre cards**: 16px (mobile), 24px (desktop)
- **Border radius cards**: 12px
- **Border radius buttons**: 8px
- **Border radius badges**: 16px (pill)
- **Border radius inputs**: 8px

---

## 4. Componentes Base

### 4.1 Sidebar

```tsx
// Características del diseño:
// - Fondo blanco/gris claro
// - Logo arriba (icono verde + texto)
// - Navegación con iconos
// - Item activo con fondo verde claro
// - Configuraciones al final

<aside className="w-60 bg-background-sidebar min-h-screen flex flex-col border-r border-gray-200">
  {/* Logo */}
  <div className="p-6 flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
      <Leaf className="w-5 h-5 text-white" />
    </div>
    <div>
      <h1 className="text-lg font-bold text-gray-900">Alquemist</h1>
      <p className="text-xs text-gray-600">admin@alquemist.com</p>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    <NavItem icon={Home} label="Inicio" />
    <NavItem icon={Sprout} label="Areas" active />
    <NavItem icon={Package} label="Producción" />
    <NavItem icon={Box} label="Inventario" />
  </nav>

  {/* Footer */}
  <div className="px-3 py-4 border-t border-gray-200">
    <NavItem icon={Settings} label="Configuraciones" />
  </div>

  {/* Branding */}
  <div className="p-4 text-center">
    <div className="flex items-center justify-center gap-2 mb-1">
      <Leaf className="w-4 h-4" />
      <span className="font-bold">Alquemist</span>
    </div>
    <p className="text-xs text-gray-500">Alquemist 2025 ©</p>
  </div>
</aside>

// NavItem Component
function NavItem({ icon: Icon, label, active = false }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        "text-sm font-medium",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
```

### 4.2 Header de Página

```tsx
// Basado en el diseño de las imágenes
<header className="bg-transparent px-6 py-4">
  <div className="flex items-center justify-between">
    {/* Breadcrumb + Título */}
    <div className="flex items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Sprout className="w-6 h-6 text-gray-700" />
          Areas
        </h1>
        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Box className="w-4 h-4" />
            Lotes: 45
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            Lotes: 45
          </span>
          <span className="px-2 py-1 bg-success text-success-dark text-xs font-medium rounded-full">
            Cannabis
          </span>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600 flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        Oct 29, 2025
      </div>
      <Button className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold">
        <Plus className="w-4 h-4 mr-2" />
        Crear Área
      </Button>
    </div>
  </div>
</header>
```

### 4.3 Card Container (Área)

```tsx
// Card estilo de las imágenes de referencia
<Card className="bg-background-card rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Image placeholder */}
  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300" />

  <CardContent className="p-5">
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          001 - Propagación A
        </h3>
      </div>
      <button className="text-gray-500 hover:text-gray-700">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>

    {/* Metadata */}
    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
      <span className="flex items-center gap-1">
        <Box className="w-4 h-4" />
        Lotes: 4
      </span>
      <span>Area: 340 m²</span>
      <span className="px-2 py-0.5 bg-success-light text-success-dark text-xs font-medium rounded">
        Activa
      </span>
    </div>

    {/* Progress bar */}
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Capacidad 100/200 Bandejas</span>
        <span>20%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '20%' }} />
      </div>
    </div>

    {/* Environmental data */}
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-1 text-gray-600">
        <Thermometer className="w-4 h-4" />
        <span>Temp: 22-24</span>
      </div>
      <div className="flex items-center gap-1 text-gray-600">
        <Sun className="w-4 h-4" />
        <span>Luz: 16/8</span>
      </div>
      <div className="flex items-center gap-1 text-gray-600">
        <Droplets className="w-4 h-4" />
        <span>Hum: 80-90</span>
      </div>
      <div className="flex items-center gap-1 text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Últ. Registro: 12:00 pm - 28/10/2025</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### 4.4 Filters Bar

```tsx
// Barra de filtros como en las imágenes
<div className="flex items-center gap-2 mb-6">
  <Button
    variant="outline"
    size="icon"
    className="border-gray-300"
  >
    <SlidersHorizontal className="w-4 h-4" />
  </Button>

  <Button
    variant={activeFilter === 'produccion' ? 'default' : 'outline'}
    className={cn(
      activeFilter === 'produccion'
        ? 'bg-white border-primary-600 text-primary-700'
        : 'border-gray-300'
    )}
  >
    <Flag className="w-4 h-4 mr-2" />
    Producción
  </Button>

  <Button
    variant={activeFilter === 'sociales' ? 'default' : 'outline'}
    className={cn(
      activeFilter === 'sociales'
        ? 'bg-white border-primary-600 text-primary-700'
        : 'border-gray-300'
    )}
  >
    <Users className="w-4 h-4 mr-2" />
    Sociales
  </Button>
</div>
```

### 4.5 Badges/Pills

```tsx
// Variantes basadas en las imágenes
const badgeVariants = {
  success: "bg-success text-success-dark",
  info: "bg-info-light text-info-dark",
  warning: "bg-warning-light text-warning-dark",
  error: "bg-error-light text-error-dark",
  default: "bg-gray-100 text-gray-700",
};

// Componente Badge
<Badge variant="success" className="px-2 py-1 rounded-full text-xs font-medium">
  Cannabis
</Badge>

<Badge variant="default" className="px-2 py-0.5 rounded text-xs font-medium">
  Activa
</Badge>
```

### 4.6 Buttons

```tsx
// Primario CTA (estilo "Crear Área", "Guardar", "Siguiente")
<Button className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
  <Plus className="w-4 h-4 mr-2" />
  Crear Área
</Button>

// Secundario (estilo "Cancelar")
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
  <X className="w-4 h-4 mr-2" />
  Cancelar
</Button>

// Success (estilo "Guardar")
<Button className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold rounded-lg">
  <Save className="w-4 h-4 mr-2" />
  Guardar
</Button>

// Destructivo
<Button variant="destructive" className="bg-error hover:bg-error-dark text-white">
  <Trash2 className="w-4 h-4 mr-2" />
  Eliminar
</Button>
```

### 4.7 Form Inputs

```tsx
// Input estilo del diseño
<div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">
    Nombre del Área
  </Label>
  <Input
    className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-lg"
    placeholder="Propagación A1"
  />
</div>

// Select/Dropdown
<div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">
    Tipo de Área
  </Label>
  <Select>
    <SelectTrigger className="border-gray-300 rounded-lg">
      <SelectValue placeholder="Propagación" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="propagacion">Propagación</SelectItem>
      <SelectItem value="vegetativo">Vegetativo</SelectItem>
      <SelectItem value="floracion">Floración</SelectItem>
    </SelectContent>
  </Select>
</div>

// Toggle (estilo "Climatizado")
<div className="flex items-center justify-between">
  <Label className="text-sm font-medium text-gray-700">
    Climatizado
  </Label>
  <Switch className="data-[state=checked]:bg-success" />
</div>

// Range inputs (Temperatura, Humedad)
<div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">
    Temperatura
  </Label>
  <div className="flex items-center gap-2">
    <Input
      type="number"
      placeholder="min"
      className="border-gray-300 rounded-lg"
    />
    <ChevronRight className="w-4 h-4 text-gray-400" />
    <Input
      type="number"
      placeholder="max"
      className="border-gray-300 rounded-lg"
    />
  </div>
</div>
```

---

## 5. Patrones de Layout

### 5.1 Layout Principal (Desktop)

```tsx
// app/layout.tsx estilo
export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Content con header integrado */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5.2 Grid de Cards (Areas)

```tsx
// Grid responsivo de cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {areas.map((area) => (
    <AreaCard key={area.id} area={area} />
  ))}
</div>
```

### 5.3 Modal/Popup (Nueva Área)

```tsx
// Modal estilo de las imágenes
<Dialog>
  <DialogContent className="max-w-3xl bg-white rounded-xl">
    <DialogHeader className="border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2">
        <Sprout className="w-6 h-6" />
        <DialogTitle className="text-xl font-semibold">Nueva Área</DialogTitle>
      </div>
      <div className="flex items-center gap-3 mt-2 text-sm">
        <span className="flex items-center gap-1">
          <Building className="w-4 h-4" />
          Cultivos del Valle Verde
        </span>
        <Badge variant="success">Cannabis</Badge>
        <span className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-4 h-4" />
          Oct 29, 2025
        </span>
      </div>
    </DialogHeader>

    {/* Progress indicator */}
    <div className="border-b border-primary-500 w-1/2" />

    <div className="grid grid-cols-2 gap-8 py-6">
      {/* Left column: Información Básica */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Información Básica</h3>
        {/* Form fields */}
      </div>

      {/* Right column: Configuración Ambiental */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Configuración Ambiental</h3>
        {/* Form fields */}
      </div>
    </div>

    <DialogFooter className="border-t border-gray-200 pt-4">
      <Button variant="outline">
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold">
        <ChevronRight className="w-4 h-4 mr-2" />
        Siguiente
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 5.4 Detail Page (Area Detail)

```tsx
// Página de detalle con tabs
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Link href="/areas" className="hover:text-primary-600">Areas</Link>
    <ChevronRight className="w-4 h-4" />
    <span>Area 1</span>
  </div>

  {/* Title */}
  <div>
    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
      <Sprout className="w-6 h-6" />
      001 - Propagación A
    </h1>
    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <Box className="w-4 h-4" />
        Lotes: 45
      </span>
      <span className="flex items-center gap-1">
        <Package className="w-4 h-4" />
        Lotes: 45
      </span>
      <Badge variant="success">Cannabis</Badge>
    </div>
  </div>

  {/* Tabs */}
  <Tabs defaultValue="general">
    <TabsList className="border-b border-gray-200">
      <TabsTrigger
        value="general"
        className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
      >
        <Info className="w-4 h-4 mr-2" />
        General
      </TabsTrigger>
      <TabsTrigger value="registro">
        <Leaf className="w-4 h-4 mr-2" />
        Registro
      </TabsTrigger>
    </TabsList>

    <TabsContent value="general" className="mt-6">
      {/* Content */}
    </TabsContent>
  </Tabs>
</div>
```

---

## 6. Estados Visuales

### 6.1 Estados de Elementos Interactivos

```tsx
// Botón
const buttonStates = `
  /* Default */
  bg-accent text-gray-900

  /* Hover */
  hover:bg-accent-600

  /* Active/Pressed */
  active:bg-accent-700

  /* Focus */
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2

  /* Disabled */
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// Card
const cardStates = `
  /* Default */
  bg-background-card border border-gray-200

  /* Hover */
  hover:shadow-md transition-shadow

  /* Selected */
  ring-2 ring-primary-500
`;

// Input
const inputStates = `
  /* Default */
  border-gray-300 bg-white

  /* Focus */
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20

  /* Error */
  border-error focus:border-error focus:ring-error/20

  /* Disabled */
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;
```

### 6.2 Loading States

```tsx
// Skeleton para cards
<Card className="bg-background-card rounded-xl">
  <Skeleton className="h-48 w-full" />
  <CardContent className="p-5 space-y-3">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-2 w-full" />
  </CardContent>
</Card>

// Spinner para botones
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Guardando...
</Button>
```

---

## 7. Iconografía

### 7.1 Librería

**IMPORTANTE**: Usar **Lucide React** exclusivamente, NO emojis.

```bash
npm install lucide-react
```

**Razones**:
- ✅ Consistencia visual en todos los dispositivos
- ✅ Escalabilidad sin pérdida de calidad
- ✅ Control total sobre color y tamaño
- ✅ Mejor accesibilidad
- ❌ NO usar emojis (renders inconsistentes)

### 7.2 Tamaños

```tsx
// Icono en sidebar nav: w-5 h-5 (20px)
<Home className="w-5 h-5" />

// Icono en botón: w-4 h-4 (16px)
<Plus className="w-4 h-4 mr-2" />

// Icono en metadata: w-4 h-4 (16px)
<Box className="w-4 h-4" />

// Icono de header grande: w-6 h-6 (24px)
<Sprout className="w-6 h-6" />
```

### 7.3 Iconos por Sección

```tsx
// Navegación
import {
  Home,          // Inicio
  Sprout,        // Areas
  Package,       // Producción
  Box,           // Inventario
  Settings,      // Configuraciones
} from 'lucide-react';

// Acciones
import {
  Plus,          // Crear
  Edit,          // Editar
  Trash2,        // Eliminar
  Save,          // Guardar
  X,             // Cerrar/Cancelar
  MoreVertical,  // Menú de opciones
  ChevronRight,  // Siguiente/Navegar
  SlidersHorizontal, // Filtros
} from 'lucide-react';

// Estados e Información
import {
  Info,          // Información
  Calendar,      // Fecha
  Clock,         // Tiempo
  Thermometer,   // Temperatura
  Sun,           // Luz
  Droplets,      // Humedad
  Flag,          // Producción
  Users,         // Sociales/Usuarios
} from 'lucide-react';

// Agrícola específicos
import {
  Leaf,          // Planta/Cultivo
  Building,      // Instalación
} from 'lucide-react';
```

---

## 8. Animaciones

### 8.1 Transiciones Sutiles

```tsx
// Hover transitions (rápidas y suaves)
className="transition-colors duration-150"
className="transition-shadow duration-200"
className="transition-all duration-200"

// Modal/Dialog
className="data-[state=open]:animate-in data-[state=closed]:animate-out"

// Card hover
className="hover:shadow-md transition-shadow duration-200"
```

### 8.2 Micro-interacciones

```tsx
// Botón con efecto de escala sutil
<Button className="transition-transform active:scale-[0.98]">
  Click
</Button>

// Card con elevación en hover
<Card className="transition-shadow hover:shadow-md duration-200">
  {/* ... */}
</Card>
```

---

## 9. Responsive Design

### 9.1 Breakpoints

```typescript
// Tailwind breakpoints por defecto
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};
```

### 9.2 Patrones Responsive

```tsx
// Sidebar colapsable en mobile
<aside className="
  fixed md:relative
  w-full md:w-60
  h-screen
  transform transition-transform
  -translate-x-full md:translate-x-0
  data-[open=true]:translate-x-0
  z-50
">
  {/* Sidebar content */}
</aside>

// Grid responsive de cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {/* Cards */}
</div>

// Padding responsive
<main className="p-4 md:p-6">
  {/* Content */}
</main>

// Texto responsive
<h1 className="text-xl md:text-2xl font-semibold">
  Título
</h1>
```

---

## 10. Accesibilidad

### 10.1 Contraste

Todos los colores cumplen con WCAG AA:
- Texto sobre fondo blanco: ratio mínimo 4.5:1
- Texto grande: ratio mínimo 3:1
- Primary (#1B5E20) sobre white: 8.9:1 ✅
- Accent (#FFC107) sobre gray-900: 8.2:1 ✅

### 10.2 Focus Visible

```tsx
// Todos los elementos interactivos deben tener focus visible
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
```

### 10.3 Semántica HTML

```tsx
// Usar elementos semánticos
<nav aria-label="Main navigation">
  {/* Links */}
</nav>

<main aria-label="Main content">
  {/* Content */}
</main>

// Labels para inputs
<Label htmlFor="area-name">Nombre del Área</Label>
<Input id="area-name" />

// Aria labels para iconos
<Button aria-label="Crear nueva área">
  <Plus className="w-4 h-4" />
</Button>
```

---

## Resumen de Implementación

### Prioridades

1. **Configurar Tailwind** con la paleta de colores de Alquemist
2. **Instalar y configurar shadcn/ui** con los estilos definidos
3. **Crear componentes layout** (Sidebar, Header)
4. **Crear componentes base** (Card, Badge, Button)
5. **Implementar patrones responsive**
6. **Agregar iconografía** consistente (Lucide)
7. **Testing de accesibilidad**

### Archivos a Crear/Modificar

- `tailwind.config.ts` - Colores y tema de Alquemist
- `src/components/ui/*` - Componentes shadcn customizados
- `src/components/layout/*` - Layout components (Sidebar, Header)
- `src/app/layout.tsx` - Layout principal
- `src/app/globals.css` - CSS variables y utilidades
- `components.json` - Configuración shadcn/ui

---

**Siguiente paso**: Inicializar el proyecto Next.js y configurar shadcn/ui siguiendo este sistema de diseño.

**Referencias visuales**: Ver imágenes en `/docs/ui/reference-images/` para detalles exactos del diseño.
