'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompactStat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'default' | 'yellow' | 'red' | 'green' | 'blue' | 'gray';
}

interface CompactStatsProps {
  stats: CompactStat[];
  className?: string;
}

const colorStyles = {
  default: {
    icon: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  yellow: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-red-100',
  },
  green: {
    icon: 'text-green-600',
    bg: 'bg-green-100',
  },
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  gray: {
    icon: 'text-gray-500',
    bg: 'bg-gray-100',
  },
};

export function CompactStats({ stats, className }: CompactStatsProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorStyles[stat.color || 'default'];

        return (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
          >
            <div className={cn('rounded-full p-2', colors.bg)}>
              <Icon className={cn('h-4 w-4', colors.icon)} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-600 truncate">{stat.label}</span>
              <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
