# UI Patterns - Alquemist

Patrones estandar de UI/UX para todas las paginas del sistema.
Basado en la implementacion del modulo de Areas.

---

## 1. Sistema de Colores

### Botones de Accion (CTA)
```tsx
// Crear / Guardar / Confirmar
<Button className="bg-amber-500 hover:bg-amber-600 text-white">
  <Plus className="h-4 w-4 mr-2" />
  Crear Area
</Button>

// Cancelar / Secundario
<Button variant="outline">Cancelar</Button>

// Eliminar / Destructivo
<Button variant="destructive">Eliminar</Button>
```

### Estados (StatusBadge)
```tsx
// Activo
<StatusBadge status="active" />   // Verde: bg-green-50 text-green-700

// Mantenimiento
<StatusBadge status="maintenance" />  // Amarillo: bg-yellow-50 text-yellow-700

// Inactivo
<StatusBadge status="inactive" />  // Rojo: bg-red-50 text-red-700
```

### Filtros y Seleccion
```tsx
// Boton/Tab seleccionado en filtros
className="bg-green-700 hover:bg-green-800 text-white"

// Boton/Tab no seleccionado
className="bg-white border border-gray-200 hover:bg-gray-50"
```

---

## 2. Pagina Principal (Lista)

### Estructura General
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: Titulo + Breadcrumb]                           │
├─────────────────────────────────────────────────────────────┤
│ [Stats Cards: 4 metricas principales]                       │
├─────────────────────────────────────────────────────────────┤
│ [Filtros] [Dropdown ▼] [🔍 Buscar...________] [+ Crear]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │  Card   │ │  Card   │ │  Card   │   Grid de Cards        │
│ │   1     │ │   2     │ │   3     │   lg:grid-cols-3       │
│ └─────────┘ └─────────┘ └─────────┘   md:grid-cols-2       │
└─────────────────────────────────────────────────────────────┘
```

### Barra de Filtros (Compacta - Una Linea)
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  {/* Izquierda: Filtros + Dropdown */}
  <div className="flex items-center gap-2">
    {/* Popover de filtros avanzados */}
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-600 text-[10px]">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {/* Checkboxes de estado, etc */}
      </PopoverContent>
    </Popover>

    {/* Dropdown de tipo/categoria */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedLabel}</span>
            <span className="sm:hidden">Tipo</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(opt => (
          <DropdownMenuItem key={opt.value}>
            <opt.icon className="mr-2 h-4 w-4" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Centro: Buscador */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <Input placeholder="Buscar..." className="pl-9 pr-9" />
    {query && (
      <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2">
        <X className="h-4 w-4" />
      </button>
    )}
  </div>

  {/* Derecha: Boton Crear */}
  <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
    <Plus className="h-4 w-4 sm:mr-2" />
    <span className="hidden sm:inline">Crear Area</span>
  </Button>
</div>
```

### Card de Item (Clickeable)
```tsx
<Card
  className="hover:shadow-lg transition-shadow cursor-pointer"
  onClick={() => router.push(`/areas/${id}`)}
>
  {/* Header visual / imagen placeholder */}
  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg" />

  <CardContent className="pt-4 space-y-3">
    {/* Titulo + Menu Kebab */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="font-bold">{code}</span>
        <span className="text-gray-400">|</span>
        <span className="font-semibold">{type}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={e => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" /> Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Nombre */}
    <p className="text-sm text-gray-600">{name}</p>

    {/* Stats */}
    <div className="flex items-center gap-3 text-sm">
      <span>Lotes: {batches}</span>
      <span>Area: {area} m²</span>
      <StatusBadge status={status} size="sm" />
    </div>

    {/* Barra de ocupacion */}
    <OccupancyBar current={occupancy} max={capacity} />

    {/* Timestamp */}
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <Clock className="h-3 w-3" />
      <span>Ult. Registro: {lastUpdate}</span>
    </div>
  </CardContent>
</Card>
```

---

## 3. Pagina de Detalle

### Estructura General
```
┌─────────────────────────────────────────────────────────────┐
│ [Breadcrumb: Home > Areas > Area Name]                      │
│ [Titulo: Area Name]                      [Editar]          │
├─────────────────────────────────────────────────────────────┤
│ [Tab: Detalle] [Tab: Lotes] [Tab: Actividades] [Tab: Inv]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Contenido del Tab Activo                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sistema de Tabs
```tsx
<Tabs defaultValue="detail" className="w-full">
  <ScrollArea className="w-full">
    <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
      <TabsTrigger
        value="detail"
        className="inline-flex items-center gap-2 px-4 py-2
                   data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
      >
        <Info className="h-4 w-4" />
        Detalle
      </TabsTrigger>
      <TabsTrigger value="batches">
        <Layers className="h-4 w-4" />
        Lotes
      </TabsTrigger>
      <TabsTrigger value="activities">
        <Activity className="h-4 w-4" />
        Actividades
      </TabsTrigger>
      <TabsTrigger value="inventory">
        <Box className="h-4 w-4" />
        Inventario
      </TabsTrigger>
    </TabsList>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>

  <TabsContent value="detail" className="mt-6">
    {/* Cards con informacion */}
  </TabsContent>

  <TabsContent value="batches" className="mt-6">
    {/* Tabla de lotes */}
  </TabsContent>
</Tabs>
```

### Cards de Informacion
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Informacion General</CardTitle>
      <StatusBadge status={status} />
    </div>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-sm font-medium text-gray-600">Campo</p>
        <p className="text-lg font-semibold">Valor</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 4. Formularios

### Modal de Creacion
```tsx
<Dialog>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100">
          <LayoutGrid className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <DialogTitle>Crear Nueva Area</DialogTitle>
          <DialogDescription>
            Complete los campos para crear una nueva area
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>

    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
          Crear Area
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

### Campos de Formulario
```tsx
{/* Input basico */}
<div className="space-y-2">
  <Label htmlFor="name">Nombre *</Label>
  <Input id="name" {...register('name')} />
  {errors.name && (
    <p className="text-sm text-red-500">{errors.name.message}</p>
  )}
</div>

{/* Select */}
<div className="space-y-2">
  <Label>Tipo de Area *</Label>
  <Select onValueChange={field.onChange} value={field.value}>
    <SelectTrigger>
      <SelectValue placeholder="Seleccionar tipo" />
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

---

## 5. Estados Vacios

```tsx
<Card>
  <CardContent className="flex flex-col items-center justify-center py-12">
    <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No hay areas configuradas
    </h3>
    <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
      Comienza creando tu primera area de cultivo.
    </p>
    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
      <Plus className="mr-2 h-4 w-4" />
      Crear Primera Area
    </Button>
  </CardContent>
</Card>
```

---

## 6. Loading States

```tsx
{/* Skeleton para lista de cards */}
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {[1, 2, 3, 4, 5, 6].map((i) => (
    <Skeleton key={i} className="h-64" />
  ))}
</div>

{/* Skeleton para pagina de detalle */}
<div className="space-y-6">
  <Skeleton className="h-32" />
  <Skeleton className="h-96" />
</div>

{/* Boton con loading */}
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
  ) : (
    <Plus className="h-4 w-4 mr-2" />
  )}
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>
```

---

## 7. Responsive Patterns

### Breakpoints
- Mobile: < 640px (default)
- Tablet: >= 640px (`sm:`)
- Desktop: >= 768px (`md:`)
- Large: >= 1024px (`lg:`)

### Patrones Comunes
```tsx
// Grid responsive
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"

// Ocultar en mobile
className="hidden sm:inline"

// Stack en mobile, row en desktop
className="flex flex-col gap-3 sm:flex-row sm:items-center"

// Boton solo icono en mobile
<Button>
  <Plus className="h-4 w-4 sm:mr-2" />
  <span className="hidden sm:inline">Crear</span>
</Button>
```

---

## 8. Componentes Reutilizables

### Ubicacion
```
components/
├── ui/                    # shadcn/ui base
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── popover.tsx
│   ├── scroll-area.tsx
│   ├── skeleton.tsx
│   ├── status-badge.tsx   # Custom
│   ├── occupancy-bar.tsx  # Custom
│   ├── table.tsx
│   └── tabs.tsx
├── layout/
│   └── page-header.tsx    # Breadcrumb + titulo + accion
└── [module]/
    ├── [module]-list.tsx      # Lista con filtros
    ├── [module]-card.tsx      # Card individual
    └── [module]-create-modal.tsx
```

---

## Referencias

- **Codigo de referencia**: `components/areas/`
- **Imagenes de referencia**: `docs/ui/reference-images/`
