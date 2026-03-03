import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

// ---------------------------------------------------------------------------
// Overdue activity alerter — runs every hour
// ---------------------------------------------------------------------------

export const checkOverdueActivities = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Find pending scheduled activities past their date by more than 1 hour
    const overdueActivities = await ctx.db
      .query("scheduled_activities")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.lt(q.field("scheduled_date"), oneHourAgo)
        )
      )
      .take(100);

    let alertsCreated = 0;

    for (const sa of overdueActivities) {
      if (!sa.company_id) continue;

      const dedupKey = `overdue:${sa._id}`;

      // Check if alert already exists (dedup)
      const existing = await ctx.db
        .query("alerts")
        .withIndex("by_dedup", (q) =>
          q.eq("company_id", sa.company_id!).eq("dedup_key", dedupKey)
        )
        .filter((q) => q.eq(q.field("status"), "pending"))
        .first();

      if (existing) continue;

      // Calculate how overdue
      const hoursOverdue = Math.round((now - sa.scheduled_date) / (60 * 60 * 1000));

      await ctx.db.insert("alerts", {
        company_id: sa.company_id,
        type: "overdue_activity",
        severity: hoursOverdue > 24 ? "critical" : "warning",
        title: `Actividad vencida: ${sa.activity_type}`,
        message: `La actividad programada para ${new Date(sa.scheduled_date).toLocaleDateString("es")} tiene ${hoursOverdue}h de retraso`,
        source_type: "scheduled_activity",
        source_id: sa._id,
        facility_id: undefined,
        status: "pending",
        dedup_key: dedupKey,
        created_at: now,
      });
      alertsCreated++;
    }

    return { checked: overdueActivities.length, alertsCreated };
  },
});

// ---------------------------------------------------------------------------
// Cron schedule
// ---------------------------------------------------------------------------

const crons = cronJobs();

crons.hourly(
  "check-overdue-activities",
  { minuteUTC: 0 },
  internal.crons.checkOverdueActivities
);

export default crons;
