'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface MetadataItem {
  icon: LucideIcon;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  description?: string;
  metadata?: MetadataItem[];
}

export function PageHeader({
  title,
  icon: Icon,
  breadcrumbs,
  action,
  description,
  metadata,
}: PageHeaderProps) {
  return (
    <div className="space-y-2 pb-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItemUI>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </BreadcrumbItemUI>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title and Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {/* Title with optional icon */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Icon className="h-5 w-5 text-green-700" />
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p className={cn('text-sm text-gray-600', Icon && 'ml-13')}>
              {description}
            </p>
          )}

          {/* Metadata row */}
          {metadata && metadata.length > 0 && (
            <div className={cn('flex flex-wrap items-center gap-4 pt-1', Icon && 'ml-13')}>
              {metadata.map((item, index) => {
                const MetaIcon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 text-sm text-gray-500"
                  >
                    <MetaIcon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
