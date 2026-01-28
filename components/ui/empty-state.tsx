import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  } | ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-green-50 p-4">
          <Icon className="h-12 w-12 text-green-700" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>
      {action && (
        <>
          {typeof action === 'object' && 'label' in action ? (
            action.href ? (
              <Button asChild className="bg-green-900 hover:bg-green-800">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link href={action.href as any}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                onClick={action.onClick}
                className="bg-green-900 hover:bg-green-800"
              >
                {action.label}
              </Button>
            )
          ) : (
            action
          )}
        </>
      )}
    </div>
  );
}
