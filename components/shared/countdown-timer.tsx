'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CountdownTimerProps {
  expiresAt: number; // Unix timestamp in milliseconds
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [percentage, setPercentage] = React.useState<number>(100);

  React.useEffect(() => {
    const totalDuration = expiresAt - Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);

      // Calculate percentage (0-100)
      const pct = totalDuration > 0 ? (remaining / totalDuration) * 100 : 0;
      setPercentage(Math.max(0, pct));

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const h = hours;
    const m = minutes % 60;
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span
          className={`font-medium ${isExpired ? 'text-destructive' : 'text-foreground'}`}
        >
          {isExpired ? 'Expirado' : `Expira en: ${formatTime(timeLeft)}`}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
