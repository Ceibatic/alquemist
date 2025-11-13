# Bubble.io i18n Implementation Guide - Alquemist

**Last Updated:** November 11, 2025
**Difficulty:** Intermediate
**Estimated Time:** 2-3 days for complete setup

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Option Sets](#step-1-create-option-sets)
3. [Step 2: Populate UI Translations](#step-2-populate-ui-translations)
4. [Step 3: Add Custom State](#step-3-add-custom-state)
5. [Step 4: Create Language Switcher](#step-4-create-language-switcher)
6. [Step 5: Update UI Elements](#step-5-update-ui-elements)
7. [Step 6: Update Dropdowns and Enums](#step-6-update-dropdowns-and-enums)
8. [Step 7: Handle User Preferences](#step-7-handle-user-preferences)
9. [Step 8: Testing](#step-8-testing)
10. [Troubleshooting](#troubleshooting)
11. [Examples](#examples)

---

## Prerequisites

Before starting, ensure you have:

- [x] Access to Bubble.io editor with admin rights
- [x] Understanding of Option Sets in Bubble
- [x] Understanding of Custom States
- [x] Understanding of Dynamic Data expressions
- [x] Reviewed [i18n Strategy document](./STRATEGY.md)
- [x] Access to translation files in UI phase documentation

---

## Step 1: Create Option Sets

### 1.1 Create `Languages` Option Set

**Location:** Data → Option Sets → New Option Set

```
Name: Languages
Display: display

Options:
┌─────────┬──────────────┐
│ display │ Option value │
├─────────┼──────────────┤
│ Español │ es           │
│ English │ en           │
└─────────┴──────────────┘
```

**Configuration:**
- ✅ No attributes needed (uses built-in display and option value)
- ✅ Set `es` as default option

---

### 1.2 Create `UI_Texts` Option Set

**Location:** Data → Option Sets → New Option Set

```
Name: UI_Texts
Display: key
```

**Attributes:**

| Attribute Name | Type | Description |
|----------------|------|-------------|
| `key` | text | Unique identifier (e.g., "signup_header") |
| `text_es` | text | Spanish translation |
| `text_en` | text | English translation |
| `category` | text | Module grouping (e.g., "auth", "facilities") |

**Important:** We use `key` as the display field so searches are easier to read in expressions.

---

### 1.3 Create Enum Option Sets

Create the following Option Sets for database enums. Each follows the same pattern:

#### Pattern Template

```
Name: [EnumName]
Display: value

Attributes:
- value (text) - Technical value from backend
- display_es (text) - Spanish display
- display_en (text) - English display
```

#### Required Enum Option Sets

**1. `Business_Entity_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| S.A.S | S.A.S | Corporation (Simplified) |
| S.A. | S.A. | Corporation |
| Ltda | Ltda | Limited Liability |
| E.U. | E.U. | Sole Proprietorship |
| Persona Natural | Persona Natural | Individual |

**2. `Company_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| cannabis | Cannabis | Cannabis |
| coffee | Café | Coffee |
| cocoa | Cacao | Cocoa |
| flowers | Flores | Flowers |
| mixed | Mixto | Mixed |

**3. `License_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| commercial_growing | Cultivo Comercial | Commercial Growing |
| research | Investigación | Research |
| processing | Procesamiento | Processing |
| other | Otro | Other |

**4. `Climate_Zones`**

| value | display_es | display_en |
|-------|------------|------------|
| tropical | Tropical | Tropical |
| subtropical | Subtropical | Subtropical |
| temperate | Templado | Temperate |

**5. `Area_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| propagation | Propagación | Propagation |
| vegetative | Vegetativo | Vegetative |
| flowering | Floración | Flowering |
| drying | Secado | Drying |
| processing | Procesamiento | Processing |
| storage | Almacenamiento | Storage |

**6. `Activity_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| watering | Riego | Watering |
| feeding | Alimentación | Feeding |
| pruning | Poda | Pruning |
| inspection | Inspección | Inspection |
| treatment | Tratamiento | Treatment |
| harvest | Cosecha | Harvest |
| movement | Movimiento | Movement |
| quality_check | Control de Calidad | Quality Check |
| other | Otro | Other |

**7. `Batch_Status`**

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| harvested | Cosechado | Harvested |
| disposed | Desechado | Disposed |
| lost | Perdido | Lost |

**8. `Health_Status`**

| value | display_es | display_en |
|-------|------------|------------|
| healthy | Saludable | Healthy |
| at_risk | En Riesgo | At Risk |
| diseased | Enfermo | Diseased |

**9. `Quality_Grade`**

| value | display_es | display_en |
|-------|------------|------------|
| A | A (Premium) | A (Premium) |
| B | B (Estándar) | B (Standard) |
| C | C (Básico) | C (Basic) |

**10. `Scheduled_Activity_Status`**

| value | display_es | display_en |
|-------|------------|------------|
| pending | Pendiente | Pending |
| in_progress | En Progreso | In Progress |
| completed | Completado | Completed |
| skipped | Omitido | Skipped |
| overdue | Vencido | Overdue |

**11. `Facility_Status`**

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| inactive | Inactivo | Inactive |
| suspended | Suspendido | Suspended |

**12. `Subscription_Plan`**

| value | display_es | display_en |
|-------|------------|------------|
| trial | Prueba | Trial |
| starter | Inicial | Starter |
| pro | Profesional | Pro |
| enterprise | Empresarial | Enterprise |

---

## Step 2: Populate UI Translations

### 2.1 Import Translation Data

You'll populate the `UI_Texts` Option Set with ~540 translations. These are documented in:

- [PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md) - ~150 texts
- [PHASE-2-OPERATIONS.md](../ui/bubble/PHASE-2-OPERATIONS.md) - ~200 texts
- [PHASE-3-ADVANCED.md](../ui/bubble/PHASE-3-ADVANCED.md) - ~100 texts

### 2.2 Naming Convention for Keys

Follow this hierarchical pattern:

```
[module]_[page]_[element]_[type]

Examples:
- auth_signup_header
- auth_signup_first_name_label
- auth_signup_create_account_btn
- facilities_add_area_popup_title
- facilities_add_area_save_btn
- inventory_dashboard_critical_section
- compliance_report_generate_btn
```

### 2.3 Sample Entries (Authentication Module)

Add these to `UI_Texts` Option Set:

| key | text_es | text_en | category |
|-----|---------|---------|----------|
| auth_signup_header | REGISTRO EN ALQUEMIST | ALQUEMIST SIGNUP | auth |
| auth_signup_first_name_label | Nombre | First Name | auth |
| auth_signup_last_name_label | Apellido | Last Name | auth |
| auth_signup_email_label | Correo Electrónico | Email | auth |
| auth_signup_password_label | Contraseña | Password | auth |
| auth_signup_confirm_label | Confirmar Contraseña | Confirm Password | auth |
| auth_signup_phone_label | Teléfono | Phone | auth |
| auth_signup_terms_checkbox | Acepto los Términos de Servicio | I agree to Terms of Service | auth |
| auth_signup_create_btn | Crear Cuenta | Create Account | auth |
| auth_signup_already_have_account | ¿Ya tienes cuenta? | Already have account? | auth |
| auth_signup_login_link | Iniciar Sesión | Log In | auth |
| auth_email_verify_header | VERIFICA TU CORREO | VERIFY YOUR EMAIL | auth |
| auth_email_verify_sent | Enviamos un enlace de verificación a: | We sent a verification link to: | auth |
| auth_email_verify_enter_code | Ingresa el código a continuación: | Enter the code below: | auth |
| auth_email_verify_expires | Expira en: | Expires in: | auth |
| auth_email_verify_btn | Verificar | Verify | auth |
| auth_email_resend_btn | Reenviar Correo | Resend Email | auth |

**How to add in Bubble:**
1. Go to Data → Option Sets → UI_Texts
2. Click "+ New option"
3. Fill in all fields (key, text_es, text_en, category)
4. Repeat for all translations

**Pro Tip:** Use bulk import if available, or create a CSV and use Bubble's CSV import feature.

---

## Step 3: Add Custom State

### 3.1 Add to Index Page

**Location:** Page: index → Element tree → index (the page itself)

**Custom State:**
```
State name: current_language
State type: Languages (Option Set)
Default value: es
When this page is loaded: If Current User is logged in → Current User's preferred_language
                         Otherwise → es
```

**Workflow on Page Load:**

```
When: Page is loaded
Conditions: Current User is logged in AND Current User's preferred_language is not empty

Actions:
1. Element Actions → Set state
   Element: index
   Custom state: current_language
   Value: Current User's preferred_language
```

---

## Step 4: Create Language Switcher

### 4.1 Create Reusable Element

**Location:** Reusable Elements → Create new

```
Name: LanguageSwitcher
Type: Reusable element
```

**Elements:**

```
┌──────────────────────────────────────┐
│  Group: LanguageSwitcher             │
│  ├─ Icon: 🌐                        │
│  └─ Dropdown: language_dropdown      │
│     - Type of choices: Languages     │
│     - Choices source: All Languages  │
│     - Option caption: This Language's display
│     - Default value: index's current_language
└──────────────────────────────────────┘
```

**Styling:**
- Position: Fixed to top-right
- Z-index: High (always visible)
- Style: Minimal, clean design

### 4.2 Add Workflow

**Workflow:**

```
Event: When language_dropdown's value is changed

Actions:
1. Element Actions → Set state
   Element: index
   Custom state: current_language
   Value: language_dropdown's value

2. (Optional) Data Actions → Make changes to Current User
   Field: preferred_language
   Value: language_dropdown's value
   Only when: Current User is logged in
```

### 4.3 Add to Pages

Add the `LanguageSwitcher` reusable element to:
- All authenticated pages (dashboard, facilities, etc.)
- Landing page (if public)
- In header/navigation group for consistency

---

## Step 5: Update UI Elements

### 5.1 Text Elements

For every hardcoded text element, replace with dynamic expression.

**Before:**
```
Text element
Content: "Sign Up"
```

**After:**
```
Text element
Content type: Dynamic data
Insert dynamic data:
  Search for UI_Texts:first item
    Constraint: key = "auth_signup_header"
    :first item's text_[index's current_language]
```

**Breaking down the expression:**

```
Search for UI_Texts          → Search the Option Set
  :first item                → Get the first (and only) match
  Constraint: key = "xxx"    → Filter by unique key
  's text_[current_language] → Get text_es or text_en based on state
```

### 5.2 Placeholder Text

For input fields:

**Before:**
```
Input element
Placeholder: "First Name"
```

**After:**
```
Input element
Placeholder (dynamic):
  Search for UI_Texts (key = "auth_signup_first_name_label"):first item's text_[index's current_language]
```

### 5.3 Button Text

**Before:**
```
Button element
Label: "Create Account"
```

**After:**
```
Button element
Label (dynamic):
  Search for UI_Texts (key = "auth_signup_create_btn"):first item's text_[index's current_language]
```

### 5.4 Fallback Values

Always provide a fallback in case translation is missing:

```
Search for UI_Texts (key = "some_key"):first item's text_[index's current_language] :default value "Texto no disponible"
```

Or use Spanish as fallback:

```
Search for UI_Texts (key = "some_key"):first item's text_[index's current_language] :default value This UI_Text's text_es
```

---

## Step 6: Update Dropdowns and Enums

### 6.1 Dynamic Dropdown with Translation

**Before (hardcoded list):**
```
Dropdown: business_type
Type of choices: Static
Choices:
  - S.A.S
  - S.A.
  - Ltda
  - E.U.
  - Persona Natural
```

**After (translated Option Set):**
```
Dropdown: business_type
Type of choices: Dynamic
Choices source: All Business_Entity_Types
Option caption: This Business_Entity_Type's display_[index's current_language]
Option value: This Business_Entity_Type's value
```

**Why this works:**
- User sees: "S.A.S" (es) or "Corporation (Simplified)" (en)
- API receives: "S.A.S" (the technical value)
- Database stores: "S.A.S" (unchanged)

### 6.2 Display Enum Values from API

When displaying data that came from the API:

**Scenario:** Facility object has `license_type: "commercial_growing"`

**Expression to display:**
```
Text element:
  All License_Types:filtered (This License_Type's value = Parent group's Facility's license_type):first item's display_[index's current_language]
```

**Simplified with "Advanced" filter:**
```
All License_Types:filtered
  Constraint: value = Parent group's Facility's license_type
  :first item's display_[index's current_language]
```

**Even simpler (if you create a helper):**
```
Create a custom operator or backend workflow to lookup translations
```

---

## Step 7: Handle User Preferences

### 7.1 Add Field to User Data Type

**Location:** Data → Data Types → User

**New Field:**
```
Field name: preferred_language
Field type: Languages (Option Set)
Default value: es
```

### 7.2 Update on Language Switch

Already handled in Step 4.2 workflow:

```
When language_dropdown's value is changed
  → Make changes to Current User
     Field: preferred_language = language_dropdown's value
```

### 7.3 Load Preference on Login

Already handled in Step 3.1 custom state:

```
When: Page is loaded
  → Set state current_language = Current User's preferred_language
```

---

## Step 8: Testing

### 8.1 Test Checklist

**Phase 1: Basic Functionality**
- [ ] Language switcher appears on all pages
- [ ] Switching language updates all text immediately
- [ ] No hardcoded text visible to users
- [ ] Dropdowns show translated options
- [ ] Preference persists across page reloads

**Phase 2: Data Flow**
- [ ] Forms send correct technical values to API (not translations)
- [ ] API responses display correctly in both languages
- [ ] Enum values translate properly when displaying data
- [ ] No errors in browser console

**Phase 3: Edge Cases**
- [ ] Missing translation keys show fallback (not blank)
- [ ] New users default to Spanish
- [ ] Language preference saves even if page closes
- [ ] Multiple tabs sync language (if using database preference)

**Phase 4: User Experience**
- [ ] All buttons, labels, headers translated
- [ ] Error messages in correct language
- [ ] Success messages in correct language
- [ ] Validation messages in correct language
- [ ] Placeholder text in correct language

### 8.2 Testing Workflow

1. **Test Spanish (Default):**
   - Create new test account
   - Complete onboarding flow
   - Verify all text is in Spanish
   - Create facility, batch, inventory item

2. **Test English:**
   - Switch language to English
   - Verify all text updates to English
   - Complete same workflows
   - Verify forms still work correctly

3. **Test Persistence:**
   - Logout
   - Login again
   - Verify language preference was saved

4. **Test API Integration:**
   - Create facility with "Cultivo Comercial" (displays in Spanish)
   - Verify API receives "commercial_growing"
   - Switch to English
   - Verify same facility shows "Commercial Growing"

---

## Troubleshooting

### Issue 1: Text Not Updating When Language Changes

**Symptom:** Some text remains in the original language after switching.

**Possible Causes:**
1. Text is hardcoded (not using dynamic expression)
2. Expression doesn't reference `index's current_language`
3. Custom state not updating

**Solution:**
- Check expression uses `text_[index's current_language]`
- Verify custom state is being set in switcher workflow
- Check element tree to ensure correct reference to index state

---

### Issue 2: Dropdown Shows Wrong Values

**Symptom:** Dropdown displays technical codes instead of translations.

**Possible Causes:**
1. Option caption is set to `value` instead of `display_[lang]`
2. Enum Option Set not configured correctly

**Solution:**
- Update dropdown's "Option caption" to:
  ```
  This [EnumType]'s display_[index's current_language]
  ```
- Ensure Option Set has both `display_es` and `display_en` attributes

---

### Issue 3: Missing Translation (Blank Text)

**Symptom:** Some elements show nothing instead of text.

**Possible Causes:**
1. Translation key doesn't exist in UI_Texts
2. Wrong key name used
3. No fallback value

**Solution:**
- Verify key exists in UI_Texts Option Set
- Double-check spelling of key
- Add fallback:
  ```
  ...text_[index's current_language] :default value "Missing translation"
  ```

---

### Issue 4: API Receives Wrong Value

**Symptom:** Backend returns validation error for enum fields.

**Possible Causes:**
1. Dropdown's "Option value" sends translation instead of technical code
2. Not using Option Set for dropdown

**Solution:**
- Ensure dropdown uses Option Set
- Set "Option value" to:
  ```
  This [EnumType]'s value
  ```
- NOT the display_es or display_en field

---

### Issue 5: Performance Issues

**Symptom:** Page loads slowly or lags when switching language.

**Possible Causes:**
1. Too many searches in expressions
2. Not using Option Sets efficiently
3. Complex nested searches

**Solution:**
- Use Option Sets (in-memory) instead of database searches
- Cache frequently used translations in custom states
- Consider limiting translation searches to visible elements only

---

## Examples

### Example 1: Complete Signup Page

**Page Structure:**
```
index (page)
  └─ Group: SignupContainer
      ├─ Text: header (dynamic)
      ├─ Input: first_name (dynamic placeholder)
      ├─ Input: last_name (dynamic placeholder)
      ├─ Input: email (dynamic placeholder)
      ├─ Input: password (dynamic placeholder)
      ├─ Checkbox: terms_checkbox (dynamic label)
      └─ Button: create_account_btn (dynamic label)
```

**Dynamic Expressions:**

**Header Text:**
```
Search for UI_Texts (key = "auth_signup_header"):first item's text_[index's current_language]
```

**First Name Input Placeholder:**
```
Search for UI_Texts (key = "auth_signup_first_name_label"):first item's text_[index's current_language]
```

**Create Account Button Label:**
```
Search for UI_Texts (key = "auth_signup_create_btn"):first item's text_[index's current_language]
```

**Terms Checkbox Label:**
```
Search for UI_Texts (key = "auth_signup_terms_checkbox"):first item's text_[index's current_language]
```

---

### Example 2: Facility Form with Enums

**Form Structure:**
```
Group: FacilityForm
  ├─ Input: facility_name
  │  Placeholder: Search for UI_Texts (key = "facilities_name_label"):first item's text_[index's current_language]
  │
  ├─ Dropdown: license_type
  │  Choices: All License_Types
  │  Option caption: This License_Type's display_[index's current_language]
  │  Option value: This License_Type's value
  │
  └─ Dropdown: climate_zone
     Choices: All Climate_Zones
     Option caption: This Climate_Zone's display_[index's current_language]
     Option value: This Climate_Zone's value
```

**Submit Workflow:**
```
When Button "Create Facility" is clicked

Action: API Connector → POST /api/v1/facilities
Body:
{
  "name": Input facility_name's value,
  "license_type": Dropdown license_type's value,    // sends "commercial_growing"
  "climate_zone": Dropdown climate_zone's value     // sends "tropical"
}
```

**Why it works:**
- User sees: "Cultivo Comercial" (if Spanish)
- User sees: "Commercial Growing" (if English)
- API receives: "commercial_growing" (always)
- Database stores: "commercial_growing" (always)

---

### Example 3: Display Facility Details

**Scenario:** Displaying a facility that was fetched from API

**API Response:**
```json
{
  "id": "fac_123",
  "name": "Finca Norte",
  "license_type": "commercial_growing",
  "climate_zone": "tropical"
}
```

**Bubble Repeating Group:**
```
Data source: Get data from external API → GET /api/v1/facilities
Type of content: Facility (API data type)
```

**Cell Structure:**
```
Group: FacilityCard
  Data source: This Facility (from repeating group)

  ├─ Text: Facility Name
  │  Content: This Facility's name    // "Finca Norte" (always shown as-is)
  │
  ├─ Text: License Type Label
  │  Content: Search for UI_Texts (key = "facilities_license_type_label"):first item's text_[index's current_language]
  │           // Shows: "Tipo de Licencia" (es) or "License Type" (en)
  │
  ├─ Text: License Type Value
  │  Content: All License_Types:filtered (This License_Type's value = This Facility's license_type):first item's display_[index's current_language]
  │           // Shows: "Cultivo Comercial" (es) or "Commercial Growing" (en)
  │
  ├─ Text: Climate Zone Label
  │  Content: Search for UI_Texts (key = "facilities_climate_zone_label"):first item's text_[index's current_language]
  │
  └─ Text: Climate Zone Value
     Content: All Climate_Zones:filtered (This Climate_Zone's value = This Facility's climate_zone):first item's display_[index's current_language]
              // Shows: "Tropical" (both languages - same)
```

---

### Example 4: Error Message Translation

**Scenario:** Displaying API error message

**API Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "details": {
      "field": "license_number",
      "reason": "ALREADY_EXISTS"
    }
  }
}
```

**Option Set: `Error_Codes`**

| code | message_es | message_en |
|------|------------|------------|
| VALIDATION_FAILED | Validación fallida | Validation failed |
| ALREADY_EXISTS | Ya existe | Already exists |
| UNAUTHORIZED | No autorizado | Unauthorized |
| NOT_FOUND | No encontrado | Not found |

**Display in Bubble:**
```
Text: ErrorMessage
  Visible when: API call returned an error
  Content:
    All Error_Codes:filtered (This Error_Code's code = API Response's error's code):first item's message_[index's current_language]
```

**Result:**
- Spanish user sees: "Validación fallida"
- English user sees: "Validation failed"

---

### Example 5: Dynamic Text with Variables

**Scenario:** "You have [X] active batches"

**UI_Texts Entry:**
```
key: "dashboard_batch_count"
text_es: "Tienes [COUNT] lotes activos"
text_en: "You have [COUNT] active batches"
```

**Bubble Expression:**
```
Text element:
  Search for UI_Texts (key = "dashboard_batch_count"):first item's text_[index's current_language]:replace "[COUNT]" with Search for Batches:count:formatted as 1,234
```

**Result:**
- Spanish: "Tienes 15 lotes activos"
- English: "You have 15 active batches"

---

## Best Practices Summary

1. ✅ **Always use dynamic expressions** for user-facing text
2. ✅ **Always use Option Sets** for enums/dropdowns
3. ✅ **Always provide fallbacks** for missing translations
4. ✅ **Always use descriptive keys** (hierarchical naming)
5. ✅ **Always send technical values** to API (not translations)
6. ✅ **Always test both languages** thoroughly
7. ✅ **Never hardcode text** that users will see
8. ✅ **Never translate technical values** in database
9. ✅ **Never assume default language** (always reference state)

---

## Next Steps

After completing this implementation:

1. [ ] Review all pages for hardcoded text
2. [ ] Test complete user workflows in both languages
3. [ ] Gather feedback from Spanish and English speakers
4. [ ] Document any new translations needed
5. [ ] Create maintenance plan for adding new translations

---

## Related Documentation

- [i18n Strategy](./STRATEGY.md) - Overall strategy and architecture
- [Database Schema](../database/SCHEMA.md) - Backend data structure
- [UI Phase 1](../ui/bubble/PHASE-1-ONBOARDING.md) - Onboarding translations
- [UI Phase 2](../ui/bubble/PHASE-2-OPERATIONS.md) - Operations translations
- [UI Phase 3](../ui/bubble/PHASE-3-ADVANCED.md) - Advanced translations

---

## Support

For questions or issues:
1. Check [Troubleshooting section](#troubleshooting)
2. Review [Examples](#examples)
3. Consult Bubble.io documentation on Option Sets and Custom States
4. Contact tech lead

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Maintained By:** Frontend Team
