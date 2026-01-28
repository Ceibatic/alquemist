'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Types for the home dashboard data
 */
export interface AdminDashboardData {
  roleType: 'administrative';
  overview: {
    activeOrders: number;
    totalPlants: number;
    activeBatches: number;
    areasInUse: number;
    totalAreas: number;
  };
  production: {
    ordersInProgress: number;
    ordersCompleted: number;
    ordersPending: number;
    averageCompletion: number;
  };
  quality: {
    mortalityRate: number;
    healthyBatches: number;
    warningBatches: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    actionUrl: string | null;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    cultivarName: string | null;
    progress: number;
    createdAt: number;
  }>;
}

export interface OperativeDashboardData {
  roleType: 'operative';
  todaysTasks: {
    pending: number;
    completed: number;
    overdue: number;
  };
  myBatches: Array<{
    id: string;
    batchCode: string;
    cultivarName: string | null;
    areaName: string | null;
    plantsActive: number;
    daysInProduction: number;
    status: string;
  }>;
  upcomingActivities: Array<{
    id: string;
    activityType: string;
    batchCode: string | null;
    scheduledDate: number;
    status: string;
    priority: string;
  }>;
  recentCompletedActivities: Array<{
    id: string;
    activityType: string;
    completedAt: number;
    batchCode: string | null;
  }>;
  quickStats: {
    activeBatchesAssigned: number;
    tasksCompletedToday: number;
    pendingQualityChecks: number;
  };
}

export type HomeDashboardData = AdminDashboardData | OperativeDashboardData;

export interface UseHomeDashboardOptions {
  facilityId?: Id<'facilities'>;
}

export interface UseHomeDashboardResult {
  data: HomeDashboardData | null;
  roleInfo: {
    roleType: 'administrative' | 'operative';
    roleName: string;
    roleDisplayName: string;
  } | null;
  isLoading: boolean;
  isAdmin: boolean;
  isOperative: boolean;
}

/**
 * Hook for fetching home dashboard data based on user role
 *
 * Optimization features:
 * - Single consolidated query for all dashboard data
 * - Automatic role detection
 * - Conditional data fetching based on role type
 * - Skip pattern for uninitialized states
 */
export function useHomeDashboard(
  options: UseHomeDashboardOptions | 'skip'
): UseHomeDashboardResult {
  // Fetch role info first (lightweight query, uses auth internally)
  const roleInfo = useQuery(
    api.home.getUserRoleType,
    options !== 'skip' ? {} : 'skip'
  );

  // Fetch consolidated dashboard data (uses auth internally)
  const dashboardData = useQuery(
    api.home.getDashboard,
    options !== 'skip'
      ? { facilityId: options.facilityId }
      : 'skip'
  );

  const isLoading = roleInfo === undefined || dashboardData === undefined;
  const isAdmin = roleInfo?.roleType === 'administrative';
  const isOperative = roleInfo?.roleType === 'operative';

  return {
    data: dashboardData as HomeDashboardData | null,
    roleInfo: roleInfo ?? null,
    isLoading,
    isAdmin,
    isOperative,
  };
}

/**
 * Hook for fetching only alert count (for header badge)
 * Lightweight query that doesn't load full dashboard data
 */
export function useAlertCount(facilityId: Id<'facilities'> | 'skip') {
  const alertCount = useQuery(
    api.home.getAlertCount,
    facilityId !== 'skip' ? { facilityId } : 'skip'
  );

  return {
    total: alertCount?.total ?? 0,
    critical: alertCount?.critical ?? 0,
    isLoading: alertCount === undefined,
  };
}

/**
 * Type guard to check if dashboard data is for admin role
 */
export function isAdminDashboard(
  data: HomeDashboardData | null
): data is AdminDashboardData {
  return data?.roleType === 'administrative';
}

/**
 * Type guard to check if dashboard data is for operative role
 */
export function isOperativeDashboard(
  data: HomeDashboardData | null
): data is OperativeDashboardData {
  return data?.roleType === 'operative';
}
