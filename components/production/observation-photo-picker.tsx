'use client';

import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ObservationPhotoPickerProps {
  /** Current list of storage IDs already attached */
  attachmentIds: string[];
  /** Called when attachments change */
  onAttachmentsChange: (ids: string[]) => void;
}

interface UploadedPhoto {
  storageId: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ObservationPhotoPicker({
  attachmentIds,
  onAttachmentsChange,
}: ObservationPhotoPickerProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.activityAttachments.generateUploadUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotos: UploadedPhoto[] = [];
      const newIds: string[] = [];

      for (const file of Array.from(files)) {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Create a local preview URL
        const url = URL.createObjectURL(file);
        newPhotos.push({ storageId, url });
        newIds.push(storageId);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      const updatedIds = [...attachmentIds, ...newIds];
      setPhotos(updatedPhotos);
      onAttachmentsChange(updatedIds);
    } catch (err) {
      console.error('Error uploading photo:', err);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedIds = attachmentIds.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onAttachmentsChange(updatedIds);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Camera className="h-3 w-3 mr-1" />
          )}
          {isUploading ? 'Subiendo...' : 'Agregar foto'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        {photos.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {photos.length} foto{photos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, idx) => (
            <div key={photo.storageId} className="relative group">
              <Image
                src={photo.url}
                alt={`Foto ${idx + 1}`}
                width={80}
                height={80}
                className="rounded-md object-cover h-20 w-20 border"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
