/**
 * System Configuration and Company Settings
 * Manages company-level settings and checks system integration status
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// SYSTEM STATUS QUERIES
// ============================================================================

/**
 * Check if system integrations are configured
 * Returns status of API keys (without exposing actual keys)
 */
export const getSystemStatus = query({
  args: {},
  handler: async () => {
    // Check environment variables (in server context)
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const resendConfigured = !!process.env.RESEND_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
      integrations: {
        ai: {
          configured: geminiConfigured,
          provider: "Google Gemini",
          features: geminiConfigured
            ? ["Pest Detection", "Template Extraction", "Quality Analysis"]
            : [],
        },
        email: {
          configured: resendConfigured,
          provider: "Resend",
          features: resendConfigured
            ? ["Email Verification", "Notifications", "Reports"]
            : [],
        },
      },
      environment: {
        appUrl,
        isProduction: process.env.NODE_ENV === "production",
      },
    };
  },
});

// ============================================================================
// COMPANY SETTINGS QUERIES
// ============================================================================

/**
 * Get company settings
 */
export const getCompanySettings = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .first();

    if (!settings) {
      // Return defaults if no settings exist
      return {
        exists: false,
        settings: getDefaultSettings(args.companyId),
      };
    }

    return {
      exists: true,
      settings,
    };
  },
});

/**
 * Get default settings object
 */
function getDefaultSettings(companyId: Id<"companies">) {
  const now = Date.now();
  return {
    company_id: companyId,
    // AI Features
    ai_features_enabled: true,
    gemini_api_configured: false,
    ai_pest_detection_enabled: true,
    ai_template_extraction_enabled: true,
    ai_quality_analysis_enabled: true,
    // Email
    email_notifications_enabled: true,
    email_api_configured: false,
    // Compliance
    require_quality_checks: false,
    require_batch_photos: false,
    require_activity_notes: false,
    auto_generate_reports: false,
    // Defaults
    default_tracking_level: "batch",
    default_batch_size: 50,
    // Notifications
    notify_on_phase_change: true,
    notify_on_low_inventory: true,
    notify_on_scheduled_activity: true,
    notify_on_overdue_activity: true,
    low_inventory_threshold_percentage: 20,
    // Audit
    log_all_activities: true,
    retain_logs_days: 365,
    // Metadata
    created_at: now,
    updated_at: now,
  };
}

// ============================================================================
// COMPANY SETTINGS MUTATIONS
// ============================================================================

/**
 * Initialize company settings (called on company creation or first access)
 */
export const initializeCompanySettings = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    // Check if settings already exist
    const existing = await ctx.db
      .query("company_settings")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .first();

    if (existing) {
      return { success: true, settingsId: existing._id, message: "Settings already exist" };
    }

    // Check system integrations
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const resendConfigured = !!process.env.RESEND_API_KEY;

    const now = Date.now();
    const settingsId = await ctx.db.insert("company_settings", {
      company_id: args.companyId,
      // AI Features
      ai_features_enabled: true,
      gemini_api_configured: geminiConfigured,
      ai_pest_detection_enabled: true,
      ai_template_extraction_enabled: true,
      ai_quality_analysis_enabled: true,
      // Email
      email_notifications_enabled: true,
      email_api_configured: resendConfigured,
      // Compliance
      require_quality_checks: false,
      require_batch_photos: false,
      require_activity_notes: false,
      auto_generate_reports: false,
      // Defaults
      default_tracking_level: "batch",
      default_batch_size: 50,
      // Notifications
      notify_on_phase_change: true,
      notify_on_low_inventory: true,
      notify_on_scheduled_activity: true,
      notify_on_overdue_activity: true,
      low_inventory_threshold_percentage: 20,
      // Audit
      log_all_activities: true,
      retain_logs_days: 365,
      // Metadata
      created_at: now,
      updated_at: now,
    });

    return { success: true, settingsId, message: "Settings initialized" };
  },
});

/**
 * Update company settings
 */
export const updateCompanySettings = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.id("users"),
    // AI Features
    ai_features_enabled: v.optional(v.boolean()),
    ai_pest_detection_enabled: v.optional(v.boolean()),
    ai_template_extraction_enabled: v.optional(v.boolean()),
    ai_quality_analysis_enabled: v.optional(v.boolean()),
    // Email
    email_notifications_enabled: v.optional(v.boolean()),
    // Compliance
    require_quality_checks: v.optional(v.boolean()),
    require_batch_photos: v.optional(v.boolean()),
    require_activity_notes: v.optional(v.boolean()),
    auto_generate_reports: v.optional(v.boolean()),
    // Defaults
    default_tracking_level: v.optional(v.string()),
    default_batch_size: v.optional(v.number()),
    default_quality_template_id: v.optional(v.id("quality_check_templates")),
    // Notifications
    notify_on_phase_change: v.optional(v.boolean()),
    notify_on_low_inventory: v.optional(v.boolean()),
    notify_on_scheduled_activity: v.optional(v.boolean()),
    notify_on_overdue_activity: v.optional(v.boolean()),
    low_inventory_threshold_percentage: v.optional(v.number()),
    // Audit
    log_all_activities: v.optional(v.boolean()),
    retain_logs_days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get existing settings
    let settings = await ctx.db
      .query("company_settings")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .first();

    // If no settings exist, initialize them first
    if (!settings) {
      const geminiConfigured = !!process.env.GEMINI_API_KEY;
      const resendConfigured = !!process.env.RESEND_API_KEY;

      const settingsId = await ctx.db.insert("company_settings", {
        company_id: args.companyId,
        ai_features_enabled: true,
        gemini_api_configured: geminiConfigured,
        ai_pest_detection_enabled: true,
        ai_template_extraction_enabled: true,
        ai_quality_analysis_enabled: true,
        email_notifications_enabled: true,
        email_api_configured: resendConfigured,
        require_quality_checks: false,
        require_batch_photos: false,
        require_activity_notes: false,
        auto_generate_reports: false,
        default_tracking_level: "batch",
        default_batch_size: 50,
        notify_on_phase_change: true,
        notify_on_low_inventory: true,
        notify_on_scheduled_activity: true,
        notify_on_overdue_activity: true,
        low_inventory_threshold_percentage: 20,
        log_all_activities: true,
        retain_logs_days: 365,
        created_at: now,
        updated_at: now,
      });

      settings = await ctx.db.get(settingsId);
      if (!settings) {
        throw new Error("Failed to create settings");
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_by: args.userId,
      updated_at: now,
    };

    if (args.ai_features_enabled !== undefined) updates.ai_features_enabled = args.ai_features_enabled;
    if (args.ai_pest_detection_enabled !== undefined) updates.ai_pest_detection_enabled = args.ai_pest_detection_enabled;
    if (args.ai_template_extraction_enabled !== undefined) updates.ai_template_extraction_enabled = args.ai_template_extraction_enabled;
    if (args.ai_quality_analysis_enabled !== undefined) updates.ai_quality_analysis_enabled = args.ai_quality_analysis_enabled;
    if (args.email_notifications_enabled !== undefined) updates.email_notifications_enabled = args.email_notifications_enabled;
    if (args.require_quality_checks !== undefined) updates.require_quality_checks = args.require_quality_checks;
    if (args.require_batch_photos !== undefined) updates.require_batch_photos = args.require_batch_photos;
    if (args.require_activity_notes !== undefined) updates.require_activity_notes = args.require_activity_notes;
    if (args.auto_generate_reports !== undefined) updates.auto_generate_reports = args.auto_generate_reports;
    if (args.default_tracking_level !== undefined) updates.default_tracking_level = args.default_tracking_level;
    if (args.default_batch_size !== undefined) updates.default_batch_size = args.default_batch_size;
    if (args.default_quality_template_id !== undefined) updates.default_quality_template_id = args.default_quality_template_id;
    if (args.notify_on_phase_change !== undefined) updates.notify_on_phase_change = args.notify_on_phase_change;
    if (args.notify_on_low_inventory !== undefined) updates.notify_on_low_inventory = args.notify_on_low_inventory;
    if (args.notify_on_scheduled_activity !== undefined) updates.notify_on_scheduled_activity = args.notify_on_scheduled_activity;
    if (args.notify_on_overdue_activity !== undefined) updates.notify_on_overdue_activity = args.notify_on_overdue_activity;
    if (args.low_inventory_threshold_percentage !== undefined) updates.low_inventory_threshold_percentage = args.low_inventory_threshold_percentage;
    if (args.log_all_activities !== undefined) updates.log_all_activities = args.log_all_activities;
    if (args.retain_logs_days !== undefined) updates.retain_logs_days = args.retain_logs_days;

    await ctx.db.patch(settings._id, updates);

    return { success: true, message: "Settings updated successfully" };
  },
});

/**
 * Refresh system integration status
 * Called when admin wants to recheck if API keys are configured
 */
export const refreshIntegrationStatus = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .first();

    if (!settings) {
      return { success: false, message: "Settings not found" };
    }

    // Check current integration status
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const resendConfigured = !!process.env.RESEND_API_KEY;

    await ctx.db.patch(settings._id, {
      gemini_api_configured: geminiConfigured,
      email_api_configured: resendConfigured,
      updated_at: now,
    });

    return {
      success: true,
      message: "Integration status refreshed",
      integrations: {
        gemini: geminiConfigured,
        resend: resendConfigured,
      },
    };
  },
});
