'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Image,
  FileText,
  Video,
  Award,
  FlaskConical,
  File,
  X,
  Loader2,
  GripVertical,
  Pencil,
  Trash2,
  Camera,
} from 'lucide-react';
import { FileUploadZone } from './file-upload-zone';

// ── Constants ────────────────────────────────────────────────────────────────

const ATTACHMENT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  photo: { label: 'Foto', icon: Image },
  document: { label: 'Documento', icon: FileText },
  video: { label: 'Video', icon: Video },
  certificate: { label: 'Certificado', icon: Award },
  lab_result: { label: 'Resultado de lab', icon: FlaskConical },
  other: { label: 'Otro', icon: File },
};

// ── Component ────────────────────────────────────────────────────────────────

interface ActivityPhotoGalleryProps {
  activityId: Id<'activities'>;
  required?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  preview?: string;
}

export function ActivityPhotoGallery({
  activityId,
  required = false,
}: ActivityPhotoGalleryProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string>('');
  const [editingId, setEditingId] = useState<Id<'activity_attachments'> | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editType, setEditType] = useState('photo');

  const attachments = useQuery(api.activityAttachments.listByActivity, {
    activityId,
  });
  const generateUploadUrl = useMutation(api.activityAttachments.generateUploadUrl);
  const createAttachment = useMutation(api.activityAttachments.create);
  const updateAttachment = useMutation(api.activityAttachments.update);
  const removeAttachment = useMutation(api.activityAttachments.remove);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const newUploading: UploadingFile[] = files.map((file) => ({
        file,
        progress: 0,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
      }));

      setUploading((prev) => [...prev, ...newUploading]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // 1. Get upload URL
          const uploadUrl = await generateUploadUrl();

          // 2. Upload file
          const result = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!result.ok) throw new Error('Upload failed');

          const { storageId } = await result.json();

          // 3. Create attachment record
          const isPhoto = file.type.startsWith('image/');
          await createAttachment({
            activityId,
            type: isPhoto ? 'photo' : 'document',
            storageId,
            fileName: file.name,
            fileSizeBytes: file.size,
            mimeType: file.type,
          });

          // Remove from uploading
          setUploading((prev) =>
            prev.filter((u) => u.file !== file)
          );
        } catch (error) {
          toast.error(`Error subiendo ${file.name}`);
          setUploading((prev) =>
            prev.filter((u) => u.file !== file)
          );
        }
      }
    },
    [activityId, generateUploadUrl, createAttachment]
  );

  const handleDelete = async (attachmentId: Id<'activity_attachments'>) => {
    try {
      await removeAttachment({ attachmentId });
      toast.success('Archivo eliminado');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar'
      );
    }
  };

  const handleStartEdit = (att: Doc<'activity_attachments'>) => {
    setEditingId(att._id);
    setEditCaption(att.caption ?? '');
    setEditType(att.type);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateAttachment({
        attachmentId: editingId,
        caption: editCaption || undefined,
        type: editType,
      });
      setEditingId(null);
      toast.success('Actualizado');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar'
      );
    }
  };

  const isUploading = uploading.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Camera className="h-4 w-4 text-amber-500" />
          Fotos y Archivos
          {required && <span className="text-red-500 text-xs">*</span>}
          {attachments && attachments.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {attachments.length}
            </span>
          )}
        </h4>
      </div>

      {/* Upload zone */}
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        uploading={isUploading}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      />

      {/* Uploading files */}
      {uploading.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {uploading.map((u, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center"
            >
              {u.preview ? (
                <img
                  src={u.preview}
                  alt=""
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <FileText className="h-6 w-6 text-gray-400" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing attachments */}
      {attachments && attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {attachments.map((att) => {
            const TypeIcon =
              ATTACHMENT_TYPE_CONFIG[att.type]?.icon ?? File;
            const isImage = att.mime_type?.startsWith('image/');
            const isEditing = editingId === att._id;

            return (
              <div
                key={att._id}
                className="relative group border rounded-lg overflow-hidden bg-white"
              >
                {/* Preview */}
                {isImage ? (
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => {
                      setLightboxUrl(att.file_url);
                      setLightboxCaption(att.caption ?? att.file_name);
                    }}
                  >
                    <img
                      src={att.file_url}
                      alt={att.caption ?? att.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    <TypeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end p-1 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                      onClick={() => handleStartEdit(att)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white/80 hover:bg-red-50 text-red-600"
                      onClick={() => handleDelete(att._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Caption / edit */}
                <div className="p-1.5">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Caption..."
                        className="h-6 text-xs"
                      />
                      <Select
                        value={editType}
                        onValueChange={setEditType}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ATTACHMENT_TYPE_CONFIG).map(
                            ([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          className="h-5 text-[10px] bg-amber-500 hover:bg-amber-600 flex-1"
                          onClick={handleSaveEdit}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] flex-1"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 truncate">
                      {att.caption ?? att.file_name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <Dialog
        open={!!lightboxUrl}
        onOpenChange={() => setLightboxUrl(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {lightboxUrl && (
            <div>
              <img
                src={lightboxUrl}
                alt={lightboxCaption}
                className="w-full max-h-[80vh] object-contain"
              />
              {lightboxCaption && (
                <div className="p-3 bg-gray-50 border-t">
                  <p className="text-sm text-gray-700">{lightboxCaption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
