/**
 * AI Configuration Management
 * Dynamic AI provider and prompt configuration for platform admins
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// DEFAULT PROMPTS (migrated from hardcoded values in ai.ts)
// ============================================================================

const DEFAULT_TEMPLATE_EXTRACTION_PROMPT = `You are an expert at converting quality control forms and inspection documents into structured JSON form definitions.

Your task is to analyze the uploaded document (PDF or image) and generate a complete JSON form structure that captures all the fields, sections, and layout of the original document.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "version": "1.0",
  "generatedBy": "ai",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "description": "Optional description",
      "fields": [
        {
          "id": "unique_field_id",
          "type": "text|number|date|select|checkbox|radio|textarea|scale|measurement|photo",
          "label": "Field Label",
          "required": true,
          "placeholder": "Enter value...",
          "helpText": "Additional guidance",
          "options": [{"value": "opt1", "label": "Option 1"}],
          "min": 0,
          "max": 100,
          "unit": "kg",
          "width": "full|half|third"
        }
      ]
    }
  ],
  "metadata": {
    "confidence": 0.95,
    "notes": "Any extraction notes"
  }
}

FIELD TYPES:
- "text": Free text input
- "number": Numeric input (use min/max/step)
- "date": Date picker
- "time": Time picker
- "datetime": Date and time
- "select": Dropdown (single selection, use options array)
- "multiselect": Dropdown (multiple selection)
- "checkbox": Single yes/no checkbox
- "checkbox_group": Multiple checkboxes (use options array)
- "radio": Radio buttons (use options array)
- "textarea": Multi-line text
- "scale": Rating scale (use scaleMin/scaleMax, e.g., 1-5)
- "measurement": Number with unit (use unit field)
- "photo": Photo upload field
- "heading": Section header (display only)
- "paragraph": Info text (display only)

RULES:
1. Preserve the original document's logical structure
2. Use meaningful field IDs (snake_case)
3. Mark fields as required based on document indicators (asterisks, "required" labels)
4. For tables with repeated rows, create fields for one row with clear naming
5. Include unit labels where visible (kg, %, °C, etc.)
6. For rating scales, use "scale" type with appropriate min/max
7. For yes/no or pass/fail fields, use "select" or "radio" with options
8. Group related fields into sections
9. Return ONLY the JSON object, no explanations or markdown

Now analyze the document and generate the form structure.`;

const DEFAULT_PEST_DETECTION_PROMPT = `You are an expert agricultural pathologist and entomologist specializing in plant health diagnostics.

Analyze the uploaded photo of a plant and identify any:
- Pests: Insects, mites, larvae, eggs
- Diseases: Fungal, bacterial, viral infections
- Nutrient Deficiencies: N, P, K, Mg, Ca, Fe deficiencies
- Environmental Stress: Heat stress, light burn, water issues

OUTPUT FORMAT (strict JSON, no markdown):
{
  "detections": [
    {
      "commonName": "Common name",
      "scientificName": "Genus species",
      "category": "pest|disease|deficiency|environmental",
      "severity": "low|medium|high",
      "confidence": 85,
      "affectedArea": "Description of affected plant parts",
      "recommendations": ["Immediate action 1", "Action 2"]
    }
  ],
  "overallHealth": "healthy|minor_issues|moderate_issues|severe_issues",
  "notes": "Additional observations"
}

If no issues are detected:
{
  "detections": [],
  "overallHealth": "healthy",
  "notes": "Plant appears healthy with no visible pest, disease, or deficiency indicators"
}

Return ONLY the JSON object, no explanations or markdown.`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function requirePlatformAdmin(
  ctx: { db: any },
  userId: Id<"users">
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const role = await ctx.db.get(user.role_id);
  if (!role || role.name !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized: Platform admin access required");
  }
}

async function logAuditAction(
  ctx: { db: any },
  params: {
    userId: Id<"users">;
    actionType: string;
    entityType: string;
    entityId?: string;
    previousValue?: any;
    newValue?: any;
    description: string;
  }
) {
  await ctx.db.insert("audit_logs", {
    action_type: params.actionType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    performed_by: params.userId,
    previous_value: params.previousValue,
    new_value: params.newValue,
    description: params.description,
    created_at: Date.now(),
  });
}

// ============================================================================
// AI PROVIDER QUERIES
// ============================================================================

/**
 * Get all AI providers
 */
export const getAIProviders = query({
  args: {},
  handler: async (ctx) => {
    const providers = await ctx.db.query("ai_providers").collect();
    return providers;
  },
});

/**
 * Get the active (default) AI provider
 */
export const getActiveProvider = query({
  args: {},
  handler: async (ctx) => {
    const provider = await ctx.db
      .query("ai_providers")
      .withIndex("by_is_default", (q) => q.eq("is_default", true))
      .first();

    if (!provider) {
      // Return fallback config if no provider configured
      return {
        provider_name: "gemini",
        display_name: "Google Gemini",
        default_model: "gemini-1.5-pro",
        default_temperature: 0.2,
        default_top_k: 40,
        default_top_p: 0.95,
        default_max_tokens: 8192,
        is_fallback: true,
      };
    }

    return provider;
  },
});

/**
 * Get AI configuration for use in AI actions
 * Returns the active provider's settings
 */
export const getAIConfig = query({
  args: {},
  handler: async (ctx) => {
    const provider = await ctx.db
      .query("ai_providers")
      .withIndex("by_is_default", (q) => q.eq("is_default", true))
      .first();

    // Get prompts
    const templatePrompt = await ctx.db
      .query("ai_prompts")
      .withIndex("by_key", (q) => q.eq("prompt_key", "template_extraction"))
      .first();

    const pestPrompt = await ctx.db
      .query("ai_prompts")
      .withIndex("by_key", (q) => q.eq("prompt_key", "pest_detection"))
      .first();

    return {
      provider: provider
        ? {
            name: provider.provider_name,
            model: provider.default_model,
            temperature: provider.default_temperature,
            topK: provider.default_top_k,
            topP: provider.default_top_p,
            maxTokens: provider.default_max_tokens,
          }
        : {
            name: "gemini",
            model: "gemini-1.5-pro",
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxTokens: 8192,
          },
      prompts: {
        templateExtraction:
          templatePrompt?.system_prompt || DEFAULT_TEMPLATE_EXTRACTION_PROMPT,
        pestDetection:
          pestPrompt?.system_prompt || DEFAULT_PEST_DETECTION_PROMPT,
      },
    };
  },
});

// ============================================================================
// AI PROVIDER MUTATIONS
// ============================================================================

/**
 * Update an AI provider's configuration
 */
export const updateAIProvider = mutation({
  args: {
    userId: v.id("users"),
    providerId: v.id("ai_providers"),
    defaultModel: v.optional(v.string()),
    defaultTemperature: v.optional(v.number()),
    defaultTopK: v.optional(v.number()),
    defaultTopP: v.optional(v.number()),
    defaultMaxTokens: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const provider = await ctx.db.get(args.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    const updates: any = { updated_at: Date.now() };
    if (args.defaultModel !== undefined) updates.default_model = args.defaultModel;
    if (args.defaultTemperature !== undefined)
      updates.default_temperature = args.defaultTemperature;
    if (args.defaultTopK !== undefined) updates.default_top_k = args.defaultTopK;
    if (args.defaultTopP !== undefined) updates.default_top_p = args.defaultTopP;
    if (args.defaultMaxTokens !== undefined)
      updates.default_max_tokens = args.defaultMaxTokens;
    if (args.isActive !== undefined) updates.is_active = args.isActive;

    await ctx.db.patch(args.providerId, updates);

    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "ai_provider_update",
      entityType: "ai_provider",
      entityId: args.providerId,
      previousValue: {
        model: provider.default_model,
        temperature: provider.default_temperature,
      },
      newValue: updates,
      description: `Updated ${provider.provider_name} configuration`,
    });

    return { success: true, message: "Provider updated" };
  },
});

/**
 * Set the default AI provider
 */
export const setDefaultProvider = mutation({
  args: {
    userId: v.id("users"),
    providerId: v.id("ai_providers"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const newDefault = await ctx.db.get(args.providerId);
    if (!newDefault) {
      throw new Error("Provider not found");
    }

    // Unset current default
    const currentDefault = await ctx.db
      .query("ai_providers")
      .withIndex("by_is_default", (q) => q.eq("is_default", true))
      .first();

    if (currentDefault && currentDefault._id !== args.providerId) {
      await ctx.db.patch(currentDefault._id, {
        is_default: false,
        updated_at: Date.now(),
      });
    }

    // Set new default
    await ctx.db.patch(args.providerId, {
      is_default: true,
      updated_at: Date.now(),
    });

    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "ai_default_provider_change",
      entityType: "ai_provider",
      entityId: args.providerId,
      previousValue: { provider: currentDefault?.provider_name || "none" },
      newValue: { provider: newDefault.provider_name },
      description: `Changed default AI provider to ${newDefault.provider_name}`,
    });

    return { success: true, message: `${newDefault.provider_name} is now the default` };
  },
});

// ============================================================================
// AI PROMPT QUERIES
// ============================================================================

/**
 * Get all AI prompts
 */
export const getAIPrompts = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("ai_prompts").collect();
    return prompts;
  },
});

/**
 * Get a specific prompt by key
 */
export const getPromptByKey = query({
  args: {
    promptKey: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.db
      .query("ai_prompts")
      .withIndex("by_key", (q) => q.eq("prompt_key", args.promptKey))
      .first();

    if (!prompt) {
      // Return default prompts if not in database
      const defaults: Record<string, string> = {
        template_extraction: DEFAULT_TEMPLATE_EXTRACTION_PROMPT,
        pest_detection: DEFAULT_PEST_DETECTION_PROMPT,
      };
      return {
        prompt_key: args.promptKey,
        system_prompt: defaults[args.promptKey] || "",
        is_default: true,
      };
    }

    return prompt;
  },
});

// ============================================================================
// AI PROMPT MUTATIONS
// ============================================================================

/**
 * Update an AI prompt
 */
export const updatePrompt = mutation({
  args: {
    userId: v.id("users"),
    promptKey: v.string(),
    systemPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const existing = await ctx.db
      .query("ai_prompts")
      .withIndex("by_key", (q) => q.eq("prompt_key", args.promptKey))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        system_prompt: args.systemPrompt,
        version: existing.version + 1,
        updated_by: args.userId,
        updated_at: now,
      });

      await logAuditAction(ctx, {
        userId: args.userId,
        actionType: "ai_prompt_update",
        entityType: "ai_prompt",
        entityId: existing._id,
        previousValue: { version: existing.version },
        newValue: { version: existing.version + 1 },
        description: `Updated ${args.promptKey} prompt to version ${existing.version + 1}`,
      });

      return { success: true, message: "Prompt updated", version: existing.version + 1 };
    } else {
      throw new Error("Prompt not found. Run seedAIPrompts first.");
    }
  },
});

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Seed AI providers with default configuration
 */
export const seedAIProviders = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if providers already exist
    const existing = await ctx.db.query("ai_providers").collect();
    if (existing.length > 0) {
      return {
        success: true,
        message: `AI providers already exist (${existing.length} found)`,
        providers: existing.map((p) => ({
          _id: p._id,
          name: p.provider_name,
        })),
      };
    }

    const now = Date.now();

    // Check which API keys are configured
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const claudeConfigured = !!process.env.CLAUDE_API_KEY;
    const openaiConfigured = !!process.env.OPENAI_API_KEY;

    const providers = [
      {
        provider_name: "gemini",
        display_name: "Google Gemini",
        is_active: true,
        is_default: true, // Gemini is default since it's currently used
        api_key_configured: geminiConfigured,
        default_model: "gemini-1.5-pro",
        available_models: [
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-2.0-flash-exp",
        ],
        default_temperature: 0.2,
        default_top_k: 40,
        default_top_p: 0.95,
        default_max_tokens: 8192,
        supports_vision: true,
        supports_function_calling: true,
        created_at: now,
        updated_at: now,
      },
      {
        provider_name: "claude",
        display_name: "Anthropic Claude",
        is_active: false,
        is_default: false,
        api_key_configured: claudeConfigured,
        default_model: "claude-sonnet-4-20250514",
        available_models: [
          "claude-sonnet-4-20250514",
          "claude-3-5-sonnet-20241022",
          "claude-3-haiku-20240307",
        ],
        default_temperature: 0.3,
        default_top_p: 0.9,
        default_max_tokens: 4096,
        supports_vision: true,
        supports_function_calling: true,
        created_at: now,
        updated_at: now,
      },
      {
        provider_name: "openai",
        display_name: "OpenAI GPT",
        is_active: false,
        is_default: false,
        api_key_configured: openaiConfigured,
        default_model: "gpt-4o",
        available_models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
        default_temperature: 0.2,
        default_top_p: 0.95,
        default_max_tokens: 4096,
        supports_vision: true,
        supports_function_calling: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const providerIds: Array<any> = [];
    for (const provider of providers) {
      const id = await ctx.db.insert("ai_providers", provider);
      providerIds.push({ _id: id, name: provider.provider_name });
    }

    return {
      success: true,
      message: `Created ${providerIds.length} AI providers`,
      providers: providerIds,
    };
  },
});

/**
 * Seed AI prompts with default values
 */
export const seedAIPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if prompts already exist
    const existing = await ctx.db.query("ai_prompts").collect();
    if (existing.length > 0) {
      return {
        success: true,
        message: `AI prompts already exist (${existing.length} found)`,
        prompts: existing.map((p) => ({
          _id: p._id,
          key: p.prompt_key,
        })),
      };
    }

    const now = Date.now();

    const prompts = [
      {
        prompt_key: "template_extraction",
        display_name: "Extracción de Plantillas QC",
        description:
          "Convierte documentos PDF/imágenes de formularios de control de calidad en estructuras JSON de formularios",
        system_prompt: DEFAULT_TEMPLATE_EXTRACTION_PROMPT,
        feature_type: "template_extraction",
        is_active: true,
        version: 1,
        created_at: now,
        updated_at: now,
      },
      {
        prompt_key: "pest_detection",
        display_name: "Detección de Plagas y Enfermedades",
        description:
          "Analiza fotos de plantas para identificar plagas, enfermedades y deficiencias",
        system_prompt: DEFAULT_PEST_DETECTION_PROMPT,
        feature_type: "pest_detection",
        is_active: true,
        version: 1,
        created_at: now,
        updated_at: now,
      },
    ];

    const promptIds: Array<any> = [];
    for (const prompt of prompts) {
      const id = await ctx.db.insert("ai_prompts", prompt);
      promptIds.push({ _id: id, key: prompt.prompt_key });
    }

    return {
      success: true,
      message: `Created ${promptIds.length} AI prompts`,
      prompts: promptIds,
    };
  },
});

/**
 * Refresh API key configuration status
 * Called to update the api_key_configured field based on current env vars
 */
export const refreshAPIKeyStatus = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const providers = await ctx.db.query("ai_providers").collect();

    const envKeyMap: Record<string, boolean> = {
      gemini: !!process.env.GEMINI_API_KEY,
      claude: !!process.env.CLAUDE_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    };

    for (const provider of providers) {
      const keyConfigured = envKeyMap[provider.provider_name] || false;
      if (provider.api_key_configured !== keyConfigured) {
        await ctx.db.patch(provider._id, {
          api_key_configured: keyConfigured,
          updated_at: Date.now(),
        });
      }
    }

    return {
      success: true,
      message: "API key status refreshed",
      status: envKeyMap,
    };
  },
});
