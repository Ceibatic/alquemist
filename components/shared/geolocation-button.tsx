'use client';

import * as React from 'react';
import { MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationButtonProps {
  onLocationCapture?: (coords: GeolocationCoordinates) => void;
  coordinates?: GeolocationCoordinates;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function GeolocationButton({
  onLocationCapture,
  coordinates,
  disabled = false,
  className,
  variant = 'outline',
}: GeolocationButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const coords: GeolocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      onLocationCapture?.(coords);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permiso denegado. Por favor habilita la ubicación.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible. Intenta de nuevo.');
            break;
          case err.TIMEOUT:
            setError('Tiempo de espera agotado. Intenta de nuevo.');
            break;
          default:
            setError('Error al obtener ubicación.');
        }
      } else {
        setError('Error desconocido al obtener ubicación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasCoordinates = coordinates && coordinates.latitude && coordinates.longitude;

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        type="button"
        variant={variant}
        onClick={captureLocation}
        disabled={disabled || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Obteniendo ubicación...
          </>
        ) : hasCoordinates ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar Ubicación
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Obtener Ubicación GPS
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {hasCoordinates && (
        <div className="bg-muted/50 p-3 rounded-md space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Coordenadas GPS Capturadas:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Latitud:</span>
              <p className="font-mono text-xs mt-0.5">
                {coordinates.latitude.toFixed(6)}°
              </p>
            </div>
            <div>
              <span className="font-medium">Longitud:</span>
              <p className="font-mono text-xs mt-0.5">
                {coordinates.longitude.toFixed(6)}°
              </p>
            </div>
          </div>
          {coordinates.accuracy && (
            <p className="text-xs text-muted-foreground pt-1">
              Precisión: ±{Math.round(coordinates.accuracy)}m
            </p>
          )}
        </div>
      )}
    </div>
  );
}
