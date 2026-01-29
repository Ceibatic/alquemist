'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Camera,
  MapPin,
  QrCode,
  Star,
  Info,
  AlertCircle,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface FormFieldOption {
  value: string;
  label: string;
}

interface FormFieldValidation {
  pattern?: string;
  message?: string;
  minLength?: number;
  maxLength?: number;
}

interface FormFieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface FormField {
  id: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'checkbox_group'
    | 'radio'
    | 'textarea'
    | 'scale'
    | 'photo'
    | 'signature'
    | 'measurement'
    | 'location'
    | 'qr_scan'
    | 'heading'
    | 'paragraph';
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: {
    min: string;
    max: string;
  };
  validation?: FormFieldValidation;
  showIf?: FormFieldCondition;
  width?: 'full' | 'half' | 'third';
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: FormField[];
}

interface TemplateStructure {
  version: string;
  generatedBy: 'ai' | 'manual';
  sections: FormSection[];
  metadata?: {
    originalDocumentUrl?: string;
    generatedAt?: number;
    confidence?: number;
    notes?: string;
  };
}

interface DynamicFormRendererProps {
  template: TemplateStructure;
  initialValues?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  onSubmit?: (values: Record<string, any>) => void;
  readOnly?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function evaluateCondition(
  condition: FormFieldCondition,
  values: Record<string, any>
): boolean {
  const fieldValue = values[condition.field];

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    case 'greater_than':
      return Number(fieldValue) > Number(condition.value);
    case 'less_than':
      return Number(fieldValue) < Number(condition.value);
    default:
      return true;
  }
}

function getWidthClass(width?: string): string {
  switch (width) {
    case 'half':
      return 'md:col-span-1';
    case 'third':
      return 'md:col-span-1 lg:col-span-1';
    default:
      return 'md:col-span-2';
  }
}

// ============================================================================
// FIELD COMPONENTS
// ============================================================================

interface FieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  error?: string;
}

function TextField({ field, value, onChange, readOnly, error }: FieldProps) {
  return (
    <Input
      id={field.id}
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={readOnly}
      className={cn(error && 'border-red-500')}
    />
  );
}

function NumberField({ field, value, onChange, readOnly, error }: FieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        id={field.id}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        disabled={readOnly}
        className={cn('flex-1', error && 'border-red-500')}
      />
      {field.unit && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {field.unit}
        </span>
      )}
    </div>
  );
}

function DateTimeField({ field, value, onChange, readOnly, error }: FieldProps) {
  const inputType =
    field.type === 'datetime'
      ? 'datetime-local'
      : field.type === 'time'
      ? 'time'
      : 'date';

  return (
    <Input
      id={field.id}
      type={inputType}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      className={cn(error && 'border-red-500')}
    />
  );
}

function SelectField({ field, value, onChange, readOnly, error }: FieldProps) {
  return (
    <Select value={value || ''} onValueChange={onChange} disabled={readOnly}>
      <SelectTrigger className={cn(error && 'border-red-500')}>
        <SelectValue placeholder={field.placeholder || 'Seleccionar...'} />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectField({ field, value, onChange, readOnly }: FieldProps) {
  const selected: string[] = value || [];

  const toggleOption = (optionValue: string) => {
    if (readOnly) return;
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      {field.options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${field.id}-${option.value}`}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggleOption(option.value)}
            disabled={readOnly}
          />
          <Label
            htmlFor={`${field.id}-${option.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

function CheckboxField({ field, value, onChange, readOnly }: FieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.id}
        checked={!!value}
        onCheckedChange={onChange}
        disabled={readOnly}
      />
      <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
        {field.label}
      </Label>
    </div>
  );
}

function RadioField({ field, value, onChange, readOnly }: FieldProps) {
  return (
    <RadioGroup
      value={value || ''}
      onValueChange={onChange}
      disabled={readOnly}
      className="space-y-2"
    >
      {field.options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
          <Label
            htmlFor={`${field.id}-${option.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function TextareaField({ field, value, onChange, readOnly, error }: FieldProps) {
  return (
    <Textarea
      id={field.id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      disabled={readOnly}
      rows={4}
      className={cn(error && 'border-red-500')}
    />
  );
}

function ScaleField({ field, value, onChange, readOnly }: FieldProps) {
  const min = field.scaleMin ?? 1;
  const max = field.scaleMax ?? 5;
  const scales = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{field.scaleLabels?.min || 'Bajo'}</span>
        <span>{field.scaleLabels?.max || 'Alto'}</span>
      </div>
      <div className="flex gap-2">
        {scales.map((scale) => (
          <button
            key={scale}
            type="button"
            onClick={() => !readOnly && onChange(scale)}
            disabled={readOnly}
            className={cn(
              'flex-1 h-10 rounded-md border text-sm font-medium transition-colors',
              value === scale
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-input',
              readOnly && 'opacity-50 cursor-not-allowed'
            )}
          >
            {scale}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoField({ field, value, onChange, readOnly }: FieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Support for multiple photos if field.max is set
  const isMultiple = field.max !== undefined && field.max > 1;
  const photos = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we're at max capacity for multiple photos
    if (isMultiple && field.max && photos.length >= field.max) {
      toast.error(`Maximo ${field.max} fotos permitidas`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos: Array<{ storageId: string; url: string }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} es muy grande. Maximo 10MB`);
          continue;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen valida`);
          continue;
        }

        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }

        const { storageId } = await result.json();

        // Get public URL - construct it from storage ID
        // Convex storage URLs are available directly after upload
        const url = uploadUrl.split('/upload')[0] + '/api/storage/' + storageId;

        uploadedPhotos.push({ storageId, url });

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      if (uploadedPhotos.length > 0) {
        if (isMultiple) {
          // Add to existing photos array
          const newPhotos = [...photos, ...uploadedPhotos];
          // Limit to max if set
          const limitedPhotos = field.max ? newPhotos.slice(0, field.max) : newPhotos;
          onChange(limitedPhotos);
        } else {
          // Single photo mode - replace
          onChange(uploadedPhotos[0]);
        }

        toast.success(
          uploadedPhotos.length === 1
            ? 'Foto subida exitosamente'
            : `${uploadedPhotos.length} fotos subidas`
        );
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error al subir foto');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (isMultiple) {
      const newPhotos = photos.filter((_: any, i: number) => i !== index);
      onChange(newPhotos.length > 0 ? newPhotos : undefined);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={isMultiple}
          onChange={handleFileSelect}
          disabled={readOnly || isUploading}
          className="hidden"
          id={`photo-input-${field.id}`}
        />
        <label
          htmlFor={`photo-input-${field.id}`}
          className={cn(
            'block border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            readOnly || isUploading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-muted/50 hover:border-primary/50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground mb-2">Subiendo foto...</p>
              {uploadProgress !== null && (
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              )}
            </>
          ) : (
            <>
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                {photos.length > 0
                  ? isMultiple
                    ? 'Agregar otra foto'
                    : 'Cambiar foto'
                  : 'Tomar o subir foto'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isMultiple && field.max
                  ? `Maximo ${field.max} fotos (${photos.length}/${field.max})`
                  : 'Maximo 10MB por foto'}
              </p>
            </>
          )}
        </label>
      </div>

      {/* Photo Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo: any, index: number) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border bg-muted aspect-square"
            >
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E';
                }}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <p className="text-xs text-white flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Foto {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationField({ field, value, onChange, readOnly }: FieldProps) {
  const getLocation = () => {
    if (readOnly) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
              className="ml-auto"
              type="button"
            >
              Limpiar
            </Button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={getLocation}
          disabled={readOnly}
          className="w-full"
          type="button"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Capturar Ubicacion
        </Button>
      )}
    </div>
  );
}

function QRScanField({ field, value, onChange, readOnly }: FieldProps) {
  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <QrCode className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">{value}</span>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
              className="ml-auto"
              type="button"
            >
              Limpiar
            </Button>
          )}
        </div>
      ) : (
        <Button variant="outline" disabled={readOnly} className="w-full" type="button">
          <QrCode className="h-4 w-4 mr-2" />
          Escanear QR
        </Button>
      )}
    </div>
  );
}

function HeadingField({ field }: { field: FormField }) {
  return (
    <div className="pt-4 pb-2">
      <h4 className="font-semibold text-base">{field.label}</h4>
      {field.helpText && (
        <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
      )}
    </div>
  );
}

function ParagraphField({ field }: { field: FormField }) {
  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">{field.label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DynamicFormRenderer({
  template,
  initialValues = {},
  onChange,
  onSubmit,
  readOnly = false,
  showSubmitButton = true,
  submitButtonText = 'Guardar',
  className,
}: DynamicFormRendererProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      template.sections.forEach((section) => {
        if (section.defaultCollapsed) {
          initial[section.id] = true;
        }
      });
      return initial;
    }
  );

  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      const newValues = { ...values, [fieldId]: value };
      setValues(newValues);
      onChange?.(newValues);

      // Clear error when field is modified
      if (errors[fieldId]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    },
    [values, onChange, errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        // Skip non-input fields
        if (field.type === 'heading' || field.type === 'paragraph') return;

        // Skip hidden fields
        if (field.showIf && !evaluateCondition(field.showIf, values)) return;

        const value = values[field.id];

        // Required validation
        if (field.required && (value === undefined || value === '' || value === null)) {
          newErrors[field.id] = 'Este campo es requerido';
          return;
        }

        // Pattern validation
        if (field.validation?.pattern && value) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(String(value))) {
            newErrors[field.id] = field.validation.message || 'Formato invalido';
          }
        }

        // Min/Max length validation for text
        if (field.validation?.minLength && String(value).length < field.validation.minLength) {
          newErrors[field.id] = `Minimo ${field.validation.minLength} caracteres`;
        }
        if (field.validation?.maxLength && String(value).length > field.validation.maxLength) {
          newErrors[field.id] = `Maximo ${field.validation.maxLength} caracteres`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, values]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit?.(values);
      }
    },
    [validateForm, onSubmit, values]
  );

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderField = (field: FormField) => {
    // Check conditional display
    if (field.showIf && !evaluateCondition(field.showIf, values)) {
      return null;
    }

    const value = values[field.id];
    const error = errors[field.id];
    const fieldProps: FieldProps = {
      field,
      value,
      onChange: (v) => handleFieldChange(field.id, v),
      readOnly,
      error,
    };

    // Non-input display fields
    if (field.type === 'heading') {
      return <HeadingField field={field} />;
    }
    if (field.type === 'paragraph') {
      return <ParagraphField field={field} />;
    }
    if (field.type === 'checkbox') {
      return <CheckboxField {...fieldProps} />;
    }

    // Input fields with label
    const FieldComponent = {
      text: TextField,
      number: NumberField,
      measurement: NumberField,
      date: DateTimeField,
      time: DateTimeField,
      datetime: DateTimeField,
      select: SelectField,
      multiselect: MultiSelectField,
      checkbox_group: MultiSelectField,
      radio: RadioField,
      textarea: TextareaField,
      scale: ScaleField,
      photo: PhotoField,
      signature: PhotoField, // Reuse photo UI for now
      location: LocationField,
      qr_scan: QRScanField,
    }[field.type];

    if (!FieldComponent) {
      console.warn(`Unknown field type: ${field.type}`);
      return null;
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        <FieldComponent {...fieldProps} />
        {field.helpText && !error && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {template.sections.map((section) => {
        const isCollapsed = collapsedSections[section.id];

        const content = (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.id} className={getWidthClass(field.width)}>
                {renderField(field)}
              </div>
            ))}
          </div>
        );

        if (section.collapsible) {
          return (
            <Card key={section.id}>
              <Collapsible open={!isCollapsed} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>{content}</CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        }

        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        );
      })}

      {/* Metadata Display */}
      {template.generatedBy === 'ai' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3" />
          <span>
            Formulario generado por IA
            {template.metadata?.confidence && (
              <> - Confianza: {Math.round(template.metadata.confidence * 100)}%</>
            )}
          </span>
        </div>
      )}

      {/* Submit Button */}
      {showSubmitButton && !readOnly && (
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            {submitButtonText}
          </Button>
        </div>
      )}
    </form>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  FormField,
  FormSection,
  TemplateStructure,
  DynamicFormRendererProps,
};
