'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface MetricsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  subtitle: string;
  variant?: 'default' | 'warning' | 'success';
  href?: string;
}

const variantStyles = {
  default: {
    card: 'hover:border-green-200 transition-colors',
    icon: 'text-green-700 bg-green-50',
    value: 'text-gray-900',
  },
  warning: {
    card: 'border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors',
    icon: 'text-orange-700 bg-orange-100',
    value: 'text-orange-900',
  },
  success: {
    card: 'border-green-200 bg-green-50 hover:bg-green-100 transition-colors',
    icon: 'text-green-700 bg-green-100',
    value: 'text-green-900',
  },
};

export function MetricsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  variant = 'default',
  href,
}: MetricsCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <Card className={cn(styles.card, href && 'cursor-pointer')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={cn('rounded-lg p-2', styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', styles.value)}>{value}</div>
        <p className="mt-1 text-xs text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href as any} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
