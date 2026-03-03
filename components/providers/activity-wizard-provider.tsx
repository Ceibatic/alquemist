'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { GlobalScheduleWizardDialog } from '@/components/production/global-schedule-wizard-dialog';
import { GlobalReportWizardDialog } from '@/components/production/global-report-wizard-dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScheduleOptions {
  batchIds?: string[];
  areaId?: string;
  facilityId?: string;
  initialTemplateId?: string;
}

interface ReportOptions {
  scheduledActivityId?: string;
  adhocTemplateId?: string;
  batchIds?: string[];
  areaId?: string;
  facilityId?: string;
}

interface ActivityWizardContextType {
  openScheduleWizard: (options?: ScheduleOptions) => void;
  openReportWizard: (options: ReportOptions) => void;
  closeScheduleWizard: () => void;
  closeReportWizard: () => void;
}

const ActivityWizardContext = createContext<ActivityWizardContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ActivityWizardProvider({ children }: { children: React.ReactNode }) {
  // Schedule Wizard State
  const [scheduleState, setScheduleState] = useState<{
    isOpen: boolean;
    options: ScheduleOptions;
  }>({
    isOpen: false,
    options: {},
  });

  // Report Wizard State
  const [reportState, setReportState] = useState<{
    isOpen: boolean;
    options: ReportOptions;
  }>({
    isOpen: false,
    options: {},
  });

  const openScheduleWizard = useCallback((options: ScheduleOptions = {}) => {
    setScheduleState({ isOpen: true, options });
  }, []);

  const closeScheduleWizard = useCallback(() => {
    setScheduleState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openReportWizard = useCallback((options: ReportOptions) => {
    setReportState({ isOpen: true, options });
  }, []);

  const closeReportWizard = useCallback(() => {
    setReportState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ActivityWizardContext.Provider
      value={{
        openScheduleWizard,
        openReportWizard,
        closeScheduleWizard,
        closeReportWizard,
      }}
    >
      {children}

      {/* Global Dialogs */}
      <GlobalScheduleWizardDialog
        isOpen={scheduleState.isOpen}
        onClose={closeScheduleWizard}
        {...scheduleState.options}
      />

      <GlobalReportWizardDialog
        isOpen={reportState.isOpen}
        onClose={closeReportWizard}
        {...reportState.options}
      />
    </ActivityWizardContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useActivityWizards() {
  const context = useContext(ActivityWizardContext);
  if (context === undefined) {
    throw new Error('useActivityWizards must be used within an ActivityWizardProvider');
  }
  return context;
}
