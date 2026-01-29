'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Plus,
  GripVertical,
  Eye,
  Code,
  Download,
  Upload,
  Trash2,
  Edit2,
  FileText,
  Hash,
  Calendar,
  Clock,
  List,
  CheckSquare,
  Circle,
  AlignLeft,
  Star,
  Camera,
  MapPin,
  QrCode,
  Type,
  Heading1,
  FileSignature,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import { FieldEditor } from './field-editor';
import type { FormField, FormSection, TemplateStructure } from './dynamic-form-renderer';

// ============================================================================
// TYPES
// ============================================================================

interface FormBuilderProps {
  initialStructure?: TemplateStructure;
  onChange?: (structure: TemplateStructure) => void;
  onSave?: (structure: TemplateStructure) => void;
  readOnly?: boolean;
  className?: string;
}

interface FieldPaletteItem {
  type: FormField['type'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD_PALETTE: FieldPaletteItem[] = [
  { type: 'text', label: 'Texto', icon: Type, description: 'Campo de texto simple' },
  { type: 'number', label: 'Número', icon: Hash, description: 'Campo numérico' },
  { type: 'date', label: 'Fecha', icon: Calendar, description: 'Selector de fecha' },
  { type: 'time', label: 'Hora', icon: Clock, description: 'Selector de hora' },
  { type: 'datetime', label: 'Fecha/Hora', icon: Calendar, description: 'Fecha y hora' },
  { type: 'select', label: 'Selección', icon: List, description: 'Lista desplegable' },
  { type: 'multiselect', label: 'Multi-Selección', icon: CheckSquare, description: 'Selección múltiple' },
  { type: 'radio', label: 'Radio', icon: Circle, description: 'Botones de radio' },
  { type: 'checkbox', label: 'Casilla', icon: CheckSquare, description: 'Casilla de verificación' },
  { type: 'checkbox_group', label: 'Grupo Casillas', icon: CheckSquare, description: 'Grupo de casillas' },
  { type: 'textarea', label: 'Área Texto', icon: AlignLeft, description: 'Texto multilínea' },
  { type: 'scale', label: 'Escala', icon: Star, description: 'Escala numérica' },
  { type: 'photo', label: 'Foto', icon: Camera, description: 'Captura de foto' },
  { type: 'signature', label: 'Firma', icon: FileSignature, description: 'Captura de firma' },
  { type: 'measurement', label: 'Medición', icon: Ruler, description: 'Medición con unidad' },
  { type: 'location', label: 'Ubicación', icon: MapPin, description: 'Coordenadas GPS' },
  { type: 'qr_scan', label: 'QR', icon: QrCode, description: 'Escaneo de código QR' },
  { type: 'heading', label: 'Encabezado', icon: Heading1, description: 'Título de sección' },
  { type: 'paragraph', label: 'Párrafo', icon: FileText, description: 'Texto informativo' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultField(type: FormField['type']): FormField {
  const base = {
    id: generateId(),
    type,
    label: FIELD_PALETTE.find((f) => f.type === type)?.label || 'Campo',
    width: 'full' as const,
  };

  // Add default options for option-based fields
  if (['select', 'multiselect', 'radio', 'checkbox_group'].includes(type)) {
    return {
      ...base,
      options: [
        { value: 'option1', label: 'Opción 1' },
        { value: 'option2', label: 'Opción 2' },
      ],
    };
  }

  // Add default scale properties
  if (type === 'scale') {
    return {
      ...base,
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Bajo', max: 'Alto' },
    };
  }

  return base;
}

// ============================================================================
// SORTABLE COMPONENTS
// ============================================================================

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableField({ field, isSelected, onSelect, onDelete }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FIELD_PALETTE.find((f) => f.type === field.type)?.icon || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 p-3 bg-background border rounded-lg cursor-pointer hover:border-primary/50 transition-colors',
        isSelected && 'border-primary bg-primary/5',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{field.label}</p>
        <p className="text-xs text-muted-foreground">
          {FIELD_PALETTE.find((f) => f.type === field.type)?.label}
        </p>
      </div>
      {field.required && <Badge variant="secondary" className="text-xs">Requerido</Badge>}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormBuilder({
  initialStructure,
  onChange,
  onSave,
  readOnly = false,
  className,
}: FormBuilderProps) {
  const [structure, setStructure] = useState<TemplateStructure>(
    initialStructure || {
      version: '1.0',
      generatedBy: 'manual',
      sections: [
        {
          id: generateId(),
          title: 'Sección 1',
          fields: [],
        },
      ],
    }
  );

  const [activeSection, setActiveSection] = useState<string>(structure.sections[0]?.id || '');
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [viewMode, setViewMode] = useState<'builder' | 'preview' | 'json'>('builder');
  const [draggedFieldType, setDraggedFieldType] = useState<FormField['type'] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentSection = useMemo(
    () => structure.sections.find((s) => s.id === activeSection),
    [structure.sections, activeSection]
  );

  const updateStructure = (newStructure: TemplateStructure) => {
    setStructure(newStructure);
    onChange?.(newStructure);
  };

  // Section Management
  const addSection = () => {
    const newSection: FormSection = {
      id: generateId(),
      title: `Sección ${structure.sections.length + 1}`,
      fields: [],
    };
    const newStructure = {
      ...structure,
      sections: [...structure.sections, newSection],
    };
    updateStructure(newStructure);
    setActiveSection(newSection.id);
    toast.success('Sección agregada');
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    const newStructure = {
      ...structure,
      sections: structure.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    };
    updateStructure(newStructure);
  };

  const deleteSection = (sectionId: string) => {
    if (structure.sections.length <= 1) {
      toast.error('Debe haber al menos una sección');
      return;
    }
    const newSections = structure.sections.filter((s) => s.id !== sectionId);
    const newStructure = { ...structure, sections: newSections };
    updateStructure(newStructure);
    setActiveSection(newSections[0]?.id || '');
    toast.success('Sección eliminada');
  };

  // Field Management
  const addField = (type: FormField['type']) => {
    if (!currentSection) return;

    const newField = createDefaultField(type);
    const newStructure = {
      ...structure,
      sections: structure.sections.map((s) =>
        s.id === activeSection
          ? { ...s, fields: [...s.fields, newField] }
          : s
      ),
    };
    updateStructure(newStructure);
    setSelectedField(newField);
    toast.success('Campo agregado');
  };

  const updateField = (field: FormField) => {
    const newStructure = {
      ...structure,
      sections: structure.sections.map((s) =>
        s.id === activeSection
          ? {
              ...s,
              fields: s.fields.map((f) => (f.id === field.id ? field : f)),
            }
          : s
      ),
    };
    updateStructure(newStructure);
    setSelectedField(field);
  };

  const deleteField = (fieldId: string) => {
    const newStructure = {
      ...structure,
      sections: structure.sections.map((s) =>
        s.id === activeSection
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      ),
    };
    updateStructure(newStructure);
    setSelectedField(null);
    toast.success('Campo eliminado');
  };

  // Drag and Drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Check if dragging from palette
    if (typeof active.id === 'string' && active.id.startsWith('palette-')) {
      const type = active.id.replace('palette-', '') as FormField['type'];
      setDraggedFieldType(type);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !currentSection) {
      setDraggedFieldType(null);
      return;
    }

    // Adding field from palette
    if (draggedFieldType) {
      addField(draggedFieldType);
      setDraggedFieldType(null);
      return;
    }

    // Reordering fields
    const oldIndex = currentSection.fields.findIndex((f) => f.id === active.id);
    const newIndex = currentSection.fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newFields = arrayMove(currentSection.fields, oldIndex, newIndex);
      updateSection(activeSection, { fields: newFields });
    }

    setDraggedFieldType(null);
  };

  // Export/Import
  const exportJSON = () => {
    const json = JSON.stringify(structure, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-structure.json';
    a.click();
    toast.success('Plantilla exportada');
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        updateStructure(imported);
        setActiveSection(imported.sections[0]?.id || '');
        setSelectedField(null);
        toast.success('Plantilla importada');
      } catch (error) {
        toast.error('Error al importar: formato inválido');
      }
    };
    reader.readAsText(file);
  };

  if (viewMode === 'preview') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vista Previa</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewMode('builder')}>
              <Edit2 className="h-4 w-4 mr-2" />
              Volver al Editor
            </Button>
          </div>
        </div>
        <DynamicFormRenderer template={structure} showSubmitButton={false} />
      </div>
    );
  }

  if (viewMode === 'json') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Código JSON</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" onClick={() => setViewMode('builder')}>
              <Edit2 className="h-4 w-4 mr-2" />
              Volver al Editor
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs overflow-auto max-h-[600px]">
              {JSON.stringify(structure, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-4', className)}>
        {/* Left Sidebar - Field Palette */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Campos Disponibles</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <CardContent className="space-y-2">
                {FIELD_PALETTE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.type}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
                      draggable
                      onDragStart={() => setDraggedFieldType(item.type)}
                      onDragEnd={() => setDraggedFieldType(null)}
                      onClick={() => addField(item.type)}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Constructor de Formulario</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('json')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  {onSave && (
                    <Button size="sm" onClick={() => onSave(structure)}>
                      <Download className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  )}
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {structure.sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveSection(section.id);
                      setSelectedField(null);
                    }}
                  >
                    {section.title}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Section Settings */}
              {currentSection && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="section-title">Título de Sección</Label>
                      <Input
                        id="section-title"
                        value={currentSection.title}
                        onChange={(e) =>
                          updateSection(activeSection, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section-description">Descripción</Label>
                      <Input
                        id="section-description"
                        value={currentSection.description || ''}
                        onChange={(e) =>
                          updateSection(activeSection, { description: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="section-collapsible"
                        checked={currentSection.collapsible || false}
                        onCheckedChange={(checked) =>
                          updateSection(activeSection, { collapsible: checked })
                        }
                      />
                      <Label htmlFor="section-collapsible">Colapsable</Label>
                    </div>
                    {structure.sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSection(activeSection)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Sección
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Fields List */}
            <ScrollArea className="h-[calc(100vh-28rem)]">
              <CardContent className="space-y-2">
                {currentSection && currentSection.fields.length > 0 ? (
                  <SortableContext
                    items={currentSection.fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {currentSection.fields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        isSelected={selectedField?.id === field.id}
                        onSelect={() => setSelectedField(field)}
                        onDelete={() => deleteField(field.id)}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No hay campos en esta sección
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Arrastra campos desde la paleta o haz clic en ellos para agregarlos
                    </p>
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Sidebar - Field Editor */}
        <div className="lg:col-span-3">
          <FieldEditor
            field={selectedField}
            onUpdate={updateField}
            onDelete={() => {
              if (selectedField) {
                deleteField(selectedField.id);
              }
            }}
            onClose={() => setSelectedField(null)}
          />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedFieldType && (
          <div className="p-3 bg-background border rounded-lg shadow-lg">
            <Badge>{FIELD_PALETTE.find((f) => f.type === draggedFieldType)?.label}</Badge>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
