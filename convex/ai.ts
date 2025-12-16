/**
 * AI-Powered Features using Google Gemini API
 *
 * Features:
 * 1. Quality Check Template Extraction - Convert PDF/images to structured form JSON
 * 2. Pest & Disease Detection - Analyze plant photos for health issues
 *
 * Note: Requires GEMINI_API_KEY environment variable
 */

import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ============================================================================
// TEMPLATE STRUCTURE TYPES
// ============================================================================

/**
 * Universal Form Field Structure
 * Designed for maximum flexibility while maintaining programmatic renderability
 */
export const fieldTypeSchema = v.union(
  v.literal("text"),
  v.literal("number"),
  v.literal("date"),
  v.literal("time"),
  v.literal("datetime"),
  v.literal("select"),
  v.literal("multiselect"),
  v.literal("checkbox"),
  v.literal("checkbox_group"),
  v.literal("radio"),
  v.literal("textarea"),
  v.literal("scale"),      // 1-5, 1-10 ratings
  v.literal("photo"),      // Photo upload
  v.literal("signature"),  // Digital signature
  v.literal("measurement"), // Number with unit
  v.literal("location"),   // GPS coordinates
  v.literal("qr_scan"),    // QR code scan
  v.literal("heading"),    // Section header (not a field)
  v.literal("paragraph")   // Info text (not a field)
);

export const formFieldSchema = v.object({
  id: v.string(),                    // Unique ID for data extraction
  type: fieldTypeSchema,
  label: v.string(),
  required: v.optional(v.boolean()),
  placeholder: v.optional(v.string()),
  helpText: v.optional(v.string()),
  defaultValue: v.optional(v.any()),

  // Type-specific properties
  options: v.optional(v.array(v.object({
    value: v.string(),
    label: v.string(),
  }))),

  // Number/measurement fields
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  step: v.optional(v.number()),
  unit: v.optional(v.string()),

  // Scale fields
  scaleMin: v.optional(v.number()),
  scaleMax: v.optional(v.number()),
  scaleLabels: v.optional(v.object({
    min: v.string(),
    max: v.string(),
  })),

  // Validation
  validation: v.optional(v.object({
    pattern: v.optional(v.string()),
    message: v.optional(v.string()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
  })),

  // Conditional display
  showIf: v.optional(v.object({
    field: v.string(),
    operator: v.union(
      v.literal("equals"),
      v.literal("not_equals"),
      v.literal("contains"),
      v.literal("greater_than"),
      v.literal("less_than")
    ),
    value: v.any(),
  })),

  // Layout
  width: v.optional(v.union(
    v.literal("full"),
    v.literal("half"),
    v.literal("third")
  )),
});

export const formSectionSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  collapsible: v.optional(v.boolean()),
  defaultCollapsed: v.optional(v.boolean()),
  fields: v.array(formFieldSchema),
});

export const templateStructureSchema = v.object({
  version: v.string(),
  generatedBy: v.union(v.literal("ai"), v.literal("manual")),
  sections: v.array(formSectionSchema),
  metadata: v.optional(v.object({
    originalDocumentUrl: v.optional(v.string()),
    generatedAt: v.optional(v.number()),
    confidence: v.optional(v.number()),
    notes: v.optional(v.string()),
  })),
});

// ============================================================================
// GEMINI API HELPERS
// ============================================================================

const GEMINI_TEMPLATE_PROMPT = `You are an expert at converting quality control forms and inspection documents into structured JSON form definitions.

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

const GEMINI_PEST_PROMPT = `You are an expert agricultural pathologist and entomologist specializing in plant health diagnostics.

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

/**
 * Call Gemini API with image and prompt
 */
async function callGeminiVision(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\n" + userPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini API");
  }

  return text;
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 */
function parseGeminiJson(text: string): any {
  // Remove markdown code blocks if present
  let cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(start, end + 1);

  return JSON.parse(cleaned);
}

// ============================================================================
// QUALITY CHECK TEMPLATE GENERATION
// ============================================================================

/**
 * Internal mutation to save generated template
 */
export const saveGeneratedTemplate = internalMutation({
  args: {
    companyId: v.id("companies"),
    cropTypeId: v.id("crop_types"),
    name: v.string(),
    category: v.string(),
    templateStructure: v.any(),
    originalDocumentUrl: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const templateId = await ctx.db.insert("quality_check_templates", {
      company_id: args.companyId,
      name: args.name,
      crop_type_id: args.cropTypeId,
      procedure_type: "visual", // Default for AI-generated
      inspection_level: "batch",
      regulatory_requirement: false,
      compliance_standard: undefined,
      template_structure: args.templateStructure,
      ai_assisted: true,
      ai_analysis_types: ["form_extraction"],
      applicable_stages: [args.category],
      frequency_recommendation: undefined,
      usage_count: 0,
      average_completion_time_minutes: undefined,
      created_by: args.createdBy,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return templateId;
  },
});

/**
 * Generate QC template from uploaded document using Gemini Vision
 *
 * Usage:
 * 1. Upload document to storage and get URL
 * 2. Call this action with document URL and metadata
 * 3. Returns generated template ID and structure
 */
export const generateQCTemplateFromDocument = action({
  args: {
    documentUrl: v.string(),
    companyId: v.id("companies"),
    cropTypeId: v.id("crop_types"),
    templateName: v.string(),
    category: v.string(), // propagation, vegetative, flowering, harvest, pest_control
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    templateId?: Id<"quality_check_templates">;
    templateStructure?: any;
    error?: string;
  }> => {
    try {
      // 1. Fetch document and convert to base64
      const response = await fetch(args.documentUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // 2. Call Gemini API
      const userPrompt = `Analyze this quality control form for agricultural inspection.
Template Name: ${args.templateName}
Category: ${args.category}
Generate the complete form structure in JSON format.`;

      const geminiResponse = await callGeminiVision(
        base64,
        contentType,
        GEMINI_TEMPLATE_PROMPT,
        userPrompt
      );

      // 3. Parse response
      const templateStructure = parseGeminiJson(geminiResponse);

      // 4. Add metadata
      templateStructure.metadata = {
        ...templateStructure.metadata,
        originalDocumentUrl: args.documentUrl,
        generatedAt: Date.now(),
      };

      // 5. Save to database
      const templateId = await ctx.runMutation(internal.ai.saveGeneratedTemplate, {
        companyId: args.companyId,
        cropTypeId: args.cropTypeId,
        name: args.templateName,
        category: args.category,
        templateStructure,
        originalDocumentUrl: args.documentUrl,
        createdBy: args.createdBy,
      });

      return {
        success: true,
        templateId,
        templateStructure,
      };
    } catch (error: any) {
      console.error("[AI] Template generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate template",
      };
    }
  },
});

// ============================================================================
// PEST & DISEASE DETECTION
// ============================================================================

/**
 * Internal mutation to save detection results
 */
export const savePestDetection = internalMutation({
  args: {
    facilityId: v.id("facilities"),
    areaId: v.optional(v.id("areas")),
    entityType: v.string(),
    entityId: v.string(),
    photoUrl: v.string(),
    detections: v.array(v.object({
      commonName: v.string(),
      scientificName: v.optional(v.string()),
      category: v.string(),
      severity: v.string(),
      confidence: v.number(),
      affectedArea: v.optional(v.string()),
      recommendations: v.optional(v.array(v.string())),
    })),
    overallHealth: v.string(),
    notes: v.optional(v.string()),
    detectedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results: Id<"pest_disease_records">[] = [];

    // For each detection, try to match with pest_diseases catalog and create record
    for (const detection of args.detections) {
      // Try to find matching pest/disease in catalog
      let pestDiseaseId: Id<"pest_diseases"> | undefined;

      if (detection.scientificName) {
        const match = await ctx.db
          .query("pest_diseases")
          .filter((q) =>
            q.eq(q.field("scientific_name"), detection.scientificName)
          )
          .first();
        if (match) {
          pestDiseaseId = match._id;
        }
      }

      if (!pestDiseaseId) {
        // Try by common name
        const match = await ctx.db
          .query("pest_diseases")
          .filter((q) => q.eq(q.field("name"), detection.commonName))
          .first();
        if (match) {
          pestDiseaseId = match._id;
        }
      }

      // If no match found, create a new pest_disease entry
      if (!pestDiseaseId) {
        // Get default crop type
        const cropTypes = await ctx.db.query("crop_types").take(1);
        const defaultCropTypeId = cropTypes[0]?._id;

        if (defaultCropTypeId) {
          pestDiseaseId = await ctx.db.insert("pest_diseases", {
            name: detection.commonName,
            scientific_name: detection.scientificName || "Unknown",
            type: detection.category === "pest" ? "pest" : "disease",
            category: detection.category,
            affected_crop_types: [defaultCropTypeId],
            regional_prevalence: [],
            seasonal_pattern: undefined,
            identification_guide: undefined,
            symptoms: {},
            similar_conditions: [],
            ai_model_trained: false,
            ai_detection_accuracy: undefined,
            prevention_methods: [],
            treatment_options: detection.recommendations?.map((r) => ({
              name: r,
              type: "recommended",
              effectiveness: "medium",
            })) || [],
            economic_impact: undefined,
            spread_rate: undefined,
            is_quarantinable: false,
            regulatory_status: undefined,
            status: "active",
            created_at: now,
            updated_at: now,
          });
        }
      }

      // Create pest_disease_record if we have a valid pestDiseaseId
      if (pestDiseaseId && args.areaId) {
        const recordId = await ctx.db.insert("pest_disease_records", {
          facility_id: args.facilityId,
          area_id: args.areaId,
          entity_type: args.entityType,
          entity_id: args.entityId,
          pest_disease_id: pestDiseaseId,
          detection_method: "ai",
          confidence_level: detection.confidence >= 80 ? "high" : detection.confidence >= 50 ? "medium" : "low",
          severity_level: detection.severity,
          affected_percentage: undefined,
          affected_plant_count: undefined,
          progression_stage: undefined,
          detected_by: args.detectedBy,
          detection_date: now,
          ai_detection_data: {
            confidence: detection.confidence,
            affectedArea: detection.affectedArea,
            recommendations: detection.recommendations,
          },
          environmental_conditions: {},
          likely_causes: [],
          photos: [args.photoUrl],
          description: args.notes,
          immediate_action_taken: false,
          immediate_actions: [],
          treatment_plan_id: undefined,
          followup_required: detection.severity !== "low",
          scheduled_followup_date: detection.severity !== "low"
            ? now + 7 * 24 * 60 * 60 * 1000 // 7 days later
            : undefined,
          resolution_status: "active",
          resolution_date: undefined,
          resolution_notes: undefined,
          notes: args.notes,
          created_at: now,
          updated_at: now,
        });
        results.push(recordId);
      }
    }

    return results;
  },
});

/**
 * Analyze photos for pest and disease detection using Gemini Vision
 *
 * Usage:
 * 1. Upload photo(s) to storage
 * 2. Call this action with photo URL(s) and context
 * 3. Returns detected issues with database matches
 */
export const analyzePestDisease = action({
  args: {
    photoUrls: v.array(v.string()),
    facilityId: v.id("facilities"),
    areaId: v.optional(v.id("areas")),
    entityType: v.string(), // 'batch' | 'plant' | 'area'
    entityId: v.string(),
    cropType: v.string(),
    detectedBy: v.id("users"),
    saveResults: v.optional(v.boolean()), // Default true
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    results: Array<{
      photoUrl: string;
      detections: any[];
      overallHealth: string;
      notes?: string;
      recordIds?: Id<"pest_disease_records">[];
    }>;
    error?: string;
  }> => {
    const allResults: Array<{
      photoUrl: string;
      detections: any[];
      overallHealth: string;
      notes?: string;
      recordIds?: Id<"pest_disease_records">[];
    }> = [];

    try {
      // Process each photo
      for (const photoUrl of args.photoUrls) {
        try {
          // 1. Fetch photo and convert to base64
          const response = await fetch(photoUrl);
          if (!response.ok) {
            allResults.push({
              photoUrl,
              detections: [],
              overallHealth: "unknown",
              notes: `Failed to fetch photo: ${response.status}`,
            });
            continue;
          }

          const contentType = response.headers.get("content-type") || "image/jpeg";
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");

          // 2. Call Gemini API
          const userPrompt = `Analyze this photo of a ${args.cropType} plant for pests, diseases, nutrient deficiencies, and environmental stress.
Be specific with scientific names where possible.`;

          const geminiResponse = await callGeminiVision(
            base64,
            contentType,
            GEMINI_PEST_PROMPT,
            userPrompt
          );

          // 3. Parse response
          const analysisResult = parseGeminiJson(geminiResponse);

          // 4. Save results if requested
          let recordIds: Id<"pest_disease_records">[] | undefined;
          if (args.saveResults !== false && analysisResult.detections?.length > 0) {
            recordIds = await ctx.runMutation(internal.ai.savePestDetection, {
              facilityId: args.facilityId,
              areaId: args.areaId,
              entityType: args.entityType,
              entityId: args.entityId,
              photoUrl,
              detections: analysisResult.detections,
              overallHealth: analysisResult.overallHealth,
              notes: analysisResult.notes,
              detectedBy: args.detectedBy,
            });
          }

          allResults.push({
            photoUrl,
            detections: analysisResult.detections || [],
            overallHealth: analysisResult.overallHealth || "unknown",
            notes: analysisResult.notes,
            recordIds,
          });
        } catch (photoError: any) {
          allResults.push({
            photoUrl,
            detections: [],
            overallHealth: "error",
            notes: photoError.message,
          });
        }
      }

      return {
        success: true,
        results: allResults,
      };
    } catch (error: any) {
      console.error("[AI] Pest detection error:", error);
      return {
        success: false,
        results: allResults,
        error: error.message || "Failed to analyze photos",
      };
    }
  },
});

// ============================================================================
// UTILITY QUERIES
// ============================================================================

/**
 * Get AI-generated templates for a company
 */
export const listAITemplates = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("quality_check_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("ai_assisted"), true))
      .collect();

    return templates;
  },
});

/**
 * Get AI detection records for an entity
 */
export const getDetectionsByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("pest_disease_records")
      .filter((q) =>
        q.and(
          q.eq(q.field("entity_type"), args.entityType),
          q.eq(q.field("entity_id"), args.entityId),
          q.eq(q.field("detection_method"), "ai")
        )
      )
      .collect();

    // Enrich with pest/disease info
    const enriched = await Promise.all(
      records.map(async (record) => {
        const pestDisease = await ctx.db.get(record.pest_disease_id);
        return {
          ...record,
          pestDiseaseName: pestDisease?.name || "Unknown",
          pestDiseaseScientificName: pestDisease?.scientific_name,
          treatmentOptions: pestDisease?.treatment_options,
        };
      })
    );

    return enriched;
  },
});
