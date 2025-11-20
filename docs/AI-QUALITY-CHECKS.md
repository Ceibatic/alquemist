# AI Quality Check & Pest Detection System (Simplified)

## Overview

This document details the simplified AI-powered features for quality check template creation and pest/disease detection in production activities using **Google Gemini API**.

## Purpose

The AI system provides two main capabilities:
1. **Quality Check Template Extraction**: Transform PDF/image documents into renderable HTML forms (single API call)
2. **Pest & Disease Detection**: Analyze photos to identify plant health issues and return search parameters (single API call)

**Design Philosophy**: Keep it simple for fast initial development. Both features use a single Gemini API call with a well-crafted prompt.

---

## PART 1: Quality Check Template Extraction (Simplified)

### Overview

Users upload a PDF or image of an existing quality check form. One call to Gemini API returns ready-to-use HTML code that Bubble can store and render directly.

### Use Cases

1. **Digitizing Paper Forms**: Convert existing paper forms into digital HTML templates
2. **Migrating from Other Systems**: Import quality check formats from spreadsheets or PDFs
3. **Quick Setup**: Get started with quality checks without manual form building

### Technology Stack

**AI Service**: Google Gemini API (Gemini 1.5 Pro with Vision)
- Multimodal: Accepts images and text
- Generates HTML output
- No additional OCR needed (Gemini handles it internally)

**Backend**: Convex
- Receives file from Bubble
- Calls Gemini API (keeps API key secure)
- Returns generated HTML to Bubble

**Frontend**: Bubble.io
- Upload interface
- HTML storage in database
- HTML rendering in `<embed>` or iframe

---

### Simplified Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS DOCUMENT (Bubble)                          │
│    • User selects PDF/image file                            │
│    • User enters template name and category                 │
│    • File uploaded to Bubble/Convex storage                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CALL CONVEX API ENDPOINT                                 │
│    • Bubble calls: call_generateQCTemplateFromDocument      │
│    • Sends: fileUrl, templateName, category, cropType       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CONVEX CALLS GEMINI API (Backend)                        │
│    • Sends image + detailed prompt to Gemini                │
│    • Gemini analyzes document structure                     │
│    • Gemini generates clean, renderable HTML form           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. STORE & DISPLAY (Bubble)                                 │
│    • Save HTML code in database (qualityCheckTemplates)     │
│    • Render HTML in Bubble using HTML element               │
│    • User can preview and confirm                           │
│    • If not satisfied: regenerate (repeat process)          │
└─────────────────────────────────────────────────────────────┘
```

**Total Steps**: 2 (Upload → Get HTML)
**User Interaction**: Upload file, preview, confirm or regenerate
**No Editing**: If result isn't perfect, user regenerates instead of editing fields

---

### Gemini Prompt for Template Extraction

**System Instructions**:
```
You are an expert at converting quality control forms and documents into clean, functional HTML forms. Your task is to analyze the uploaded document (PDF or image) and generate a complete HTML form that captures all the fields, sections, and structure of the original document.

The HTML must be:
- Clean and semantic
- Mobile-responsive (use simple CSS)
- Ready to render in an iframe
- Include all form elements (inputs, selects, checkboxes, textareas, etc.)
- Preserve the original document's logical structure and sections
- Include labels and placeholders where appropriate
- Self-contained (all styles inline or in <style> tag)

Do not be overly rigid about the format - adapt to whatever structure the document has. Some forms have sections, others don't. Some have tables, others use simple lists. Be flexible.

Return ONLY the HTML code, starting with <!DOCTYPE html> and ending with </html>. No explanations, no markdown code blocks, just the raw HTML.
```

**User Prompt Template**:
```
Analyze this quality control form for {cropType} cultivation.

Template Name: {templateName}
Category: {category} (e.g., Propagation, Vegetative, Flowering, Pest Control)

Convert this document into a complete HTML form that:
1. Captures all fields, labels, and sections from the original
2. Uses appropriate input types (text, number, date, checkbox, radio, select, textarea)
3. Maintains the original layout as much as possible
4. Includes clear section headers if the original has them
5. Is responsive and clean

Generate the HTML now.
```

**Example Gemini API Call** (Convex backend):
```typescript
// Convex server function
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateQCTemplateFromDocument = mutation({
  args: {
    fileUrl: v.string(),
    templateName: v.string(),
    category: v.string(),
    cropType: v.string(),
    facilityId: v.id("facilities")
  },
  handler: async (ctx, args) => {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

    // Fetch image from storage
    const imageData = await fetch(args.fileUrl);
    const imageBuffer = await imageData.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    // Build prompt
    const systemInstructions = `You are an expert at converting quality control forms...`; // (full text from above)

    const userPrompt = `Analyze this quality control form for ${args.cropType} cultivation.

Template Name: ${args.templateName}
Category: ${args.category}

Convert this document into a complete HTML form that:
1. Captures all fields, labels, and sections from the original
2. Uses appropriate input types (text, number, date, checkbox, radio, select, textarea)
3. Maintains the original layout as much as possible
4. Includes clear section headers if the original has them
5. Is responsive and clean

Generate the HTML now.`;

    // Call Gemini
    const result = await model.generateContent([
      { text: systemInstructions + "\n\n" + userPrompt },
      {
        inlineData: {
          mimeType: "image/jpeg", // or image/png, application/pdf
          data: imageBase64
        }
      }
    ]);

    const htmlCode = result.response.text();

    // Save to database
    const templateId = await ctx.db.insert("qualityCheckTemplates", {
      facilityId: args.facilityId,
      name: args.templateName,
      cropType: args.cropType,
      category: args.category,
      type: "custom",
      createdWithAI: true,
      originalDocumentUrl: args.fileUrl,
      htmlTemplate: htmlCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0
    });

    return {
      templateId,
      htmlCode
    };
  }
});
```

---

### Database Schema (Simplified)

```typescript
{
  _id: Id<"qualityCheckTemplates">,
  facilityId: Id<"facilities">,
  name: string,  // e.g., "Control de Calidad - Propagación"
  cropType: "cannabis" | "vegetables" | "ornamentals" | "other",
  category: "propagation" | "vegetative" | "flowering" | "harvest" | "pest_control" | "environmental" | "other",
  type: "predefined" | "custom",
  createdWithAI: boolean,
  originalDocumentUrl?: string,  // Reference to uploaded PDF/image
  htmlTemplate: string,  // Full HTML code generated by Gemini
  createdAt: number,
  updatedAt: number,
  usageCount: number
}
```

**Removed**: `fields` array, `templateStructure` object (no longer needed since we store complete HTML)

---

### Bubble Implementation

#### Upload & Generate Flow

**Page: Create QC Template with AI**

1. **Upload Section**:
   - File uploader: `uploader_qc_document` (accepts PDF, JPG, PNG)
   - Input: `input_template_name`
   - Dropdown: `dropdown_crop_type`
   - Dropdown: `dropdown_category`
   - Button: `btn_generate_template` ("Generar Template con IA")

2. **Loading State**:
   - Show spinner with text: "Analizando documento... (~30 segundos)"
   - Disable form during processing

3. **Preview Section**:
   - HTML Element: `html_template_preview`
   - Data source: Result from API call
   - Button: `btn_confirm_template` ("Confirmar y Guardar")
   - Button: `btn_regenerate` ("Regenerar")

**Workflow: Generate Template**
```
Trigger: btn_generate_template is clicked

Step 1: Validate inputs (file, name, category)

Step 2: Upload file to storage (if not already uploaded)

Step 3: API Call to Convex: call_generateQCTemplateFromDocument
  Parameters:
    - fileUrl: uploader_qc_document's value
    - templateName: input_template_name's value
    - category: dropdown_category's value
    - cropType: dropdown_crop_type's value
    - facilityId: Current User > currentFacilityId

Step 4: Display result
  - Set html_template_preview's HTML = API response > htmlCode
  - Show preview section

Step 5 (Error): Show error message
```

**Workflow: Confirm Template**
```
Trigger: btn_confirm_template is clicked

Step 1: Navigate to template list or detail page
  - Template is already saved in database by backend
```

**Workflow: Regenerate**
```
Trigger: btn_regenerate is clicked

Step 1: Repeat "Generate Template" workflow
  - Same file, same parameters
  - Gemini may produce slightly different HTML (non-deterministic)
```

#### Using Template in Activity Execution

**When filling a quality check during activity**:

1. Activity has `qualityCheckTemplateId` reference
2. Load template: `GET /api/qualityCheckTemplates/{templateId}`
3. Get `htmlTemplate` field
4. Render in HTML element
5. User fills form
6. On submit: Extract form data using JavaScript
7. Save filled data as HTML or JSON in activity record

**Example JavaScript to extract form data**:
```javascript
// In Bubble HTML element with ID "qc-form"
const form = document.getElementById('qc-form');
const formData = new FormData(form);
const data = {};
formData.forEach((value, key) => {
  data[key] = value;
});

// Send to Bubble workflow via custom event
bubble_fn_saveFormData(JSON.stringify(data));
```

---

### Regenerate Instead of Edit

**Why no editing?**
- Simpler development (no field editor UI needed)
- Faster initial implementation
- Gemini is good enough that regeneration usually works
- Can add editing capability later if really needed

**How regeneration works**:
- User clicks "Regenerate" button
- Same API call, same parameters
- Gemini's non-deterministic nature means slightly different results
- User can regenerate multiple times until satisfied

**Future enhancement** (Phase 2 of this feature):
- Add manual field editor
- Parse HTML to extract field structure
- Allow adding/removing/modifying fields
- Re-generate HTML from edited structure

---

## PART 2: Pest & Disease Detection (Simplified)

### Overview

Users upload photos of plants during activity execution. One call to Gemini Vision API returns search parameters (pest/disease names) to query the internal database.

### Use Cases

1. **Early Detection**: Identify pest/disease problems from photos
2. **Accurate Identification**: Get scientific and common names
3. **Database Lookup**: Find control methods from internal catalog

### Technology Stack

**AI Service**: Google Gemini API (Gemini 1.5 Pro with Vision)
- Multimodal: Accepts images
- Identifies pests, diseases, deficiencies
- Returns structured search parameters

**Backend**: Convex
- Receives photos from Bubble
- Calls Gemini API
- Searches internal pest/disease database
- Returns matches with control methods

**Frontend**: Bubble
- Photo upload during activity execution
- Display detection results
- User confirms matches
- Auto-create remediation activities

---

### Simplified Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS PHOTOS (During Activity Execution)         │
│    • Worker uploads 1-5 photos of plants                    │
│    • Photos stored in cloud storage                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CALL CONVEX API ENDPOINT                                 │
│    • Bubble calls: call_analyzePestDisease                  │
│    • Sends: photoUrls[], activityId, facilityId             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. GEMINI ANALYZES PHOTOS (Backend)                         │
│    • For each photo: send to Gemini with detection prompt   │
│    • Gemini identifies issues (pests, diseases, deficiencies)│
│    • Returns: commonName, scientificName, category, severity│
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SEARCH INTERNAL DATABASE (Backend)                       │
│    • For each detection: search pestsAndDiseases table      │
│    • Match by scientific name (exact) or common name (fuzzy)│
│    • Return top matches with control methods                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER CONFIRMS & AUTO-CREATE (Bubble)                     │
│    • Display detections with database matches               │
│    • User confirms or rejects each detection                │
│    • For confirmed: auto-create MIPE/MIRFE activity         │
└─────────────────────────────────────────────────────────────┘
```

**Total Steps**: 2-3 (Upload → Analyze → Confirm)
**User Interaction**: Upload photos, review detections, confirm matches
**Auto-Remediation**: System suggests MIPE/MIRFE activities based on matches

---

### Gemini Prompt for Pest/Disease Detection

**System Instructions**:
```
You are an expert agricultural pathologist and entomologist specializing in plant health diagnostics. Your task is to analyze photos of plants and identify any pests, diseases, nutrient deficiencies, or environmental stress issues.

When analyzing a photo, look for:
- **Pests**: Insects, mites, larvae, eggs (aphids, spider mites, thrips, whiteflies, caterpillars, etc.)
- **Diseases**: Fungal, bacterial, viral infections (powdery mildew, botrytis, fusarium, root rot, etc.)
- **Nutrient Deficiencies**: N, P, K, Mg, Ca, Fe deficiencies
- **Environmental Stress**: Heat stress, light burn, overwatering, underwatering

For each issue detected, return ONLY the following information in JSON format:
{
  "detections": [
    {
      "commonName": "Common name in English",
      "scientificName": "Scientific name (genus species)",
      "category": "pest" | "disease" | "deficiency" | "environmental",
      "severity": "low" | "medium" | "high",
      "confidence": 0-100 (percentage)
    }
  ]
}

Return ONLY the JSON object. No explanations, no markdown, just the JSON.

If no issues are detected, return:
{
  "detections": []
}
```

**User Prompt Template**:
```
Analyze this photo of a {cropType} plant for any pests, diseases, nutrient deficiencies, or environmental stress.

Be specific with scientific names where possible. Return your analysis in the JSON format specified.
```

**Example Gemini API Call** (Convex backend):
```typescript
// Convex server function
import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzePestDisease = mutation({
  args: {
    photoUrls: v.array(v.string()),
    activityId: v.id("activities"),
    facilityId: v.id("facilities"),
    cropType: v.string()
  },
  handler: async (ctx, args) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

    const systemInstructions = `You are an expert agricultural pathologist...`; // (full text from above)

    const allDetections = [];

    // Analyze each photo
    for (const photoUrl of args.photoUrls) {
      // Fetch image
      const imageData = await fetch(photoUrl);
      const imageBuffer = await imageData.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      const userPrompt = `Analyze this photo of a ${args.cropType} plant for any pests, diseases, nutrient deficiencies, or environmental stress.

Be specific with scientific names where possible. Return your analysis in the JSON format specified.`;

      // Call Gemini
      const result = await model.generateContent([
        { text: systemInstructions + "\n\n" + userPrompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        }
      ]);

      const responseText = result.response.text();

      // Parse JSON response
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const detectionResult = JSON.parse(cleanJson);

      // Add photo reference to each detection
      if (detectionResult.detections && detectionResult.detections.length > 0) {
        detectionResult.detections.forEach(det => {
          det.photoUrl = photoUrl;
        });
        allDetections.push(...detectionResult.detections);
      }
    }

    // Search internal database for each detection
    const enrichedDetections = [];

    for (const detection of allDetections) {
      // Search by scientific name (exact match preferred)
      let dbMatches = await ctx.db
        .query("pestsAndDiseases")
        .filter(q => q.eq(q.field("scientificName"), detection.scientificName))
        .collect();

      // If no exact match, try common name (partial match)
      if (dbMatches.length === 0) {
        dbMatches = await ctx.db
          .query("pestsAndDiseases")
          .filter(q =>
            q.or(
              q.eq(q.field("commonName"), detection.commonName),
              // Could add fuzzy matching here
            )
          )
          .collect();
      }

      enrichedDetections.push({
        ...detection,
        databaseMatches: dbMatches.map(match => ({
          pestDiseaseId: match._id,
          commonName: match.commonName,
          scientificName: match.scientificName,
          category: match.category,
          controlMethods: match.controlMethods,
          // Include MIPE or MIRFE methods
          recommendedMethod: match.category === "pest"
            ? match.controlMethods?.MIPE?.methods[0]
            : match.controlMethods?.MIRFE?.methods[0]
        }))
      });
    }

    return {
      activityId: args.activityId,
      totalDetections: enrichedDetections.length,
      detections: enrichedDetections
    };
  }
});
```

---

### Database Schema

**Pests & Diseases Catalog** (simplified):
```typescript
{
  _id: Id<"pestsAndDiseases">,
  category: "pest" | "disease" | "deficiency" | "environmental",
  commonName: string,
  scientificName: string,
  affectedCrops: string[],

  // Control methods
  controlMethods: {
    MIPE?: {  // For pests
      methods: Array<{
        name: string,
        type: "biological" | "chemical" | "cultural" | "mechanical",
        effectiveness: "low" | "medium" | "high",
        inventoryRequired: Array<{itemName: string, quantity: number, unit: string}>
      }>
    },
    MIRFE?: {  // For diseases
      methods: Array<{
        name: string,
        type: "biological" | "chemical" | "cultural",
        effectiveness: "low" | "medium" | "high",
        inventoryRequired: Array<{itemName: string, quantity: number, unit: string}>
      }>
    }
  },

  preventionTips: string[],
  createdAt: number,
  updatedAt: number
}
```

**Detection Results** (stored in activity):
```typescript
{
  _id: Id<"activities">,
  // ... other activity fields

  // AI detection results
  aiDetections: Array<{
    photoUrl: string,
    commonName: string,
    scientificName: string,
    category: "pest" | "disease" | "deficiency" | "environmental",
    severity: "low" | "medium" | "high",
    confidence: number,
    confirmedByUser: boolean,
    selectedMatchId?: Id<"pestsAndDiseases">,  // User-selected match from DB
    timestamp: number
  }>
}
```

---

### Bubble Implementation

#### Photo Upload & Analysis

**During Activity Execution (Tab: Photos & AI Detection)**

1. **Upload Section**:
   - Multi-file uploader: `uploader_activity_photos`
   - Button: `btn_analyze_photos` ("Analizar con IA")
   - Progress indicator during analysis

2. **Results Display**:
   - Repeating group: `rg_ai_detections`
   - Each detection shows:
     - Photo thumbnail
     - Detected issue name
     - Confidence %
     - Severity level
     - Database matches (top 3)
     - Confirm/Reject buttons

3. **Confirmation**:
   - User selects best match from database results
   - Checkbox: `checkbox_confirm_detection`
   - System prepares remediation activity suggestion

**Workflow: Analyze Photos**
```
Trigger: btn_analyze_photos is clicked

Step 1: Show loading spinner ("Analizando fotos... esto puede tardar 30-60 segundos")

Step 2: API Call to Convex: call_analyzePestDisease
  Parameters:
    - photoUrls: uploader_activity_photos's uploaded file URLs
    - activityId: Current Activity > _id
    - facilityId: Current User > currentFacilityId
    - cropType: Current Activity > productionOrder > template > cropType

Step 3: Display results
  - Populate rg_ai_detections with response > detections
  - For each detection, show database matches

Step 4 (Error): Show error message
```

**Workflow: Confirm Detection & Create Remediation**
```
Trigger: User confirms detection (checkbox_confirm_detection)

Step 1: Mark detection as confirmed

Step 2: Determine remediation activity type
  - If category = "pest" → Create MIPE activity
  - If category = "disease" → Create MIRFE activity
  - If category = "deficiency" or "environmental" → No auto-activity

Step 3: Prepare remediation activity details
  - Name: "MIPE - [Common Name]" or "MIRFE - [Common Name]"
  - Control method: From database match > recommendedMethod
  - Urgency: Based on severity (low/medium/high)
  - Schedule: Tomorrow (high severity) or +2 days (medium) or +5 days (low)

Step 4: Add to pending remediation activities list
  - Will be created when activity is completed
```

---

### Auto-Remediation Logic (Simplified)

**When activity is completed with confirmed detections**:

```typescript
// In activity completion workflow (Convex)
export const completeActivity = mutation({
  args: {
    activityId: v.id("activities"),
    // ... other completion data
    confirmedDetections: v.array(v.object({
      aiDetectionId: v.string(),
      selectedMatchId: v.id("pestsAndDiseases")
    }))
  },
  handler: async (ctx, args) => {
    // ... mark activity as complete

    // Create remediation activities
    for (const detection of args.confirmedDetections) {
      const pestDisease = await ctx.db.get(detection.selectedMatchId);

      if (!pestDisease) continue;

      // Determine activity type
      const activityType = pestDisease.category === "pest" ? "MIPE" : "MIRFE";

      // Get recommended method
      const methods = pestDisease.category === "pest"
        ? pestDisease.controlMethods?.MIPE?.methods
        : pestDisease.controlMethods?.MIRFE?.methods;

      const recommendedMethod = methods?.[0]; // First method (highest effectiveness usually)

      if (!recommendedMethod) continue;

      // Calculate schedule based on severity
      const activity = await ctx.db.get(args.activityId);
      const completedDate = new Date(activity.completedAt);
      const daysToAdd = detection.severity === "high" ? 1 : detection.severity === "medium" ? 2 : 5;
      const scheduledDate = new Date(completedDate);
      scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

      // Create remediation activity
      await ctx.db.insert("activities", {
        productionOrderId: activity.productionOrderId,
        phaseId: activity.phaseId,
        name: `${activityType} - ${pestDisease.commonName}`,
        activityType: activityType,
        triggeredByActivityId: args.activityId,
        pestDiseaseId: pestDisease._id,
        controlMethod: recommendedMethod.name,
        scheduledDate: scheduledDate.getTime(),
        assignedUserId: activity.assignedUserId, // Same user or supervisor
        urgency: detection.severity,
        estimatedDurationHours: 1.5,
        projectedInventory: recommendedMethod.inventoryRequired || [],
        description: `Control ${pestDisease.commonName} detected during ${activity.name}. Apply ${recommendedMethod.name}.`,
        autoCreated: true,
        status: "scheduled",
        createdAt: Date.now()
      });
    }

    return { remediationActivitiesCreated: args.confirmedDetections.length };
  }
});
```

---

## Implementation Summary

### Quality Check Templates

✅ **Simple**: One Gemini API call
✅ **Fast**: ~30 seconds to generate
✅ **Flexible**: Prompt adapts to any document structure
✅ **No Editing**: Regenerate if not satisfied
✅ **Bubble-Friendly**: Store HTML, render directly

**API Endpoint**: `call_generateQCTemplateFromDocument`
**Gemini Model**: `gemini-1.5-pro-vision`
**Output**: Ready-to-use HTML form

### Pest/Disease Detection

✅ **Simple**: One Gemini API call per photo
✅ **Fast**: ~10 seconds per photo
✅ **Accurate**: Scientific + common names for reliable DB lookup
✅ **Auto-Remediation**: Creates MIPE/MIRFE activities automatically

**API Endpoint**: `call_analyzePestDisease`
**Gemini Model**: `gemini-1.5-pro-vision`
**Output**: Search parameters + DB matches

---

## Cost Estimation

### Gemini API Pricing (as of 2024)

**Gemini 1.5 Pro**:
- Input: $0.00125 / 1K characters
- Output: $0.005 / 1K characters
- Images: $0.00025 / image

### Quality Check Template Generation
- Input: ~1,500 tokens (prompt + system instructions) = $0.0019
- Image: 1 image = $0.00025
- Output: ~3,000 tokens (HTML code) = $0.015
- **Total per template**: ~$0.017 (1.7 cents)

### Pest/Disease Detection
- Input: ~800 tokens (prompt) = $0.001
- Image: 1 image = $0.00025
- Output: ~200 tokens (JSON) = $0.001
- **Total per photo**: ~$0.0023 (0.23 cents)

**Monthly estimate** (100 templates + 1,000 photo analyses):
- Templates: 100 × $0.017 = $1.70
- Photos: 1,000 × $0.0023 = $2.30
- **Total**: ~$4/month

Very affordable for initial development and testing.

---

## Future Enhancements (Not for Initial Development)

### Quality Check Templates
- [ ] Add manual field editor for fine-tuning
- [ ] Template versioning
- [ ] Import from URL (not just file upload)
- [ ] Multi-page document support

### Pest/Disease Detection
- [ ] Batch analysis (multiple photos in one call)
- [ ] Severity quantification (% of plant affected)
- [ ] Track pest progression over time
- [ ] Predictive analytics (outbreak prediction)

---

## Testing Checklist

### Template Extraction
- [ ] Upload PDF form → generates valid HTML
- [ ] Upload image (JPG) form → generates valid HTML
- [ ] Generated HTML renders correctly in Bubble
- [ ] Regeneration produces different (improved) result
- [ ] Error handling for unsupported formats

### Pest Detection
- [ ] Upload photo with aphids → correctly identified
- [ ] Upload photo with healthy plant → no detections
- [ ] Database lookup finds correct matches
- [ ] Remediation activity auto-created with correct details
- [ ] Multiple detections in one photo handled properly

---

This simplified approach prioritizes **speed of development** and **ease of implementation** while maintaining the core AI-powered functionality. The system can be enhanced incrementally based on user feedback.
