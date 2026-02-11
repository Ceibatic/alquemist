'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ────────────────────────────────────────────────────────────────────

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  uploading?: boolean;
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function FileUploadZone({
  onFilesSelected,
  accept = 'image/*,.pdf,.doc,.docx',
  multiple = true,
  maxSizeMb = 10,
  uploading = false,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size <= maxSizeMb * 1024 * 1024
      );
      if (files.length > 0) onFilesSelected(files);
    },
    [disabled, maxSizeMb, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      const validFiles = files.filter(
        (f) => f.size <= maxSizeMb * 1024 * 1024
      );
      if (validFiles.length > 0) onFilesSelected(validFiles);
      // Reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = '';
    },
    [maxSizeMb, onFilesSelected]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        isDragOver
          ? 'border-amber-400 bg-amber-50'
          : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-gray-600">Subiendo archivos...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Arrastra archivos aquí o{' '}
            <span className="text-amber-600 font-medium">selecciona</span>
          </p>
          <p className="text-xs text-gray-400">
            Máximo {maxSizeMb}MB por archivo
          </p>
        </div>
      )}
    </div>
  );
}
