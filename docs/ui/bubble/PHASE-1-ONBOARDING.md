# PHASE 1: ONBOARDING - UI REQUIREMENTS

**Focus**: Bubble pages, workflows, and visual elements
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md) for complete schema
**API Endpoints**: See [../../api/PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md) for backend calls

---

## Overview

Phase 1 is a guided onboarding wizard that takes users from signup → fully configured company. Users complete 8 modules in sequence to set up their agricultural operation.

**Total Pages**: 17 screens
**User Flow**: Linear progression with back navigation
**Entry**: Public landing page
**Exit**: Dashboard (ready for operations)

---

## Internationalization (i18n)

**Languages Supported**: Spanish (default), English

All UI texts in this document must be implemented using the i18n system. See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for complete implementation strategy.

**Implementation Approach**:
- All UI texts stored in Bubble Option Set `UI_Texts` with both Spanish and English translations
- Enum values (license types, business types, etc.) stored in dedicated Option Sets
- Backend sends technical codes only, frontend handles translation
- Language switcher available in all pages

**Translation Tables**: Each module below includes a translation table with:
- **Elemento**: Description of UI element
- **Español**: Spanish text
- **English**: English text
- **Key**: Unique identifier for Option Set lookup

For implementation details, see [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md).

---

## MODULE 1: Authentication & Account Creation

### Page 1: Signup Form
```
┌─────────────────────────────────┐
│     🌱 ALQUEMIST SIGNUP         │
├─────────────────────────────────┤
│                                 │
│  First Name:  [____________]    │
│  Last Name:   [____________]    │
│  Email:       [____________]    │
│  Password:    [____________]    │
│  Confirm:     [____________]    │
│  Phone:       [____________]    │  (optional)
│                                 │
│  [ ] I agree to Terms of Service│
│                                 │
│  [        Create Account       ]│
│                                 │
│  Already have account? [Log In] │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input fields: firstName, lastName, email, password, confirmPassword, phone
- Checkbox: termsAccepted
- Button: "Create Account" → triggers signup workflow
- Link: "Log In" → redirects to login page

**Workflow**:
1. Validate inputs (password strength, email format, terms checked)
2. Call API: Register user
3. Show success message
4. Navigate to Email Verification page

**Database Context**:
- **Writes to**: `users` table
  - Stores: email, password_hash, firstName, lastName, phone
  - Sets: email_verified = false
- **Writes to**: `emailVerificationTokens` table
  - Generates token for email verification

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | REGISTRO EN ALQUEMIST | ALQUEMIST SIGNUP | auth_signup_header |
| First Name Label | Nombre | First Name | auth_signup_first_name_label |
| Last Name Label | Apellido | Last Name | auth_signup_last_name_label |
| Email Label | Correo Electrónico | Email | auth_signup_email_label |
| Password Label | Contraseña | Password | auth_signup_password_label |
| Confirm Password Label | Confirmar Contraseña | Confirm Password | auth_signup_confirm_label |
| Phone Label | Teléfono | Phone | auth_signup_phone_label |
| Phone Helper Text | (opcional) | (optional) | auth_signup_phone_helper |
| Terms Checkbox | Acepto los Términos de Servicio | I agree to Terms of Service | auth_signup_terms_checkbox |
| Create Account Button | Crear Cuenta | Create Account | auth_signup_create_btn |
| Already Have Account Text | ¿Ya tienes cuenta? | Already have account? | auth_signup_already_have_account |
| Login Link | Iniciar Sesión | Log In | auth_signup_login_link |

**Validation Messages**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Password Strength | Contraseña debe tener mín. 8 caracteres, 1 mayúscula, 1 número, 1 especial | Password must have min. 8 chars, 1 uppercase, 1 number, 1 special | validation_password_strength |
| Email Format | Formato de email inválido | Invalid email format | validation_email_format |
| Terms Required | Debes aceptar los términos de servicio | You must accept the terms of service | validation_terms_required |
| Email Already Exists | Este email ya está registrado | This email is already registered | validation_email_exists |

---

### Page 2: Email Verification
```
┌─────────────────────────────────┐
│    ✉️  VERIFY YOUR EMAIL        │
├─────────────────────────────────┤
│                                 │
│  We sent a verification link to:│
│  user@example.com               │
│                                 │
│  Click the link in your email   │
│  or enter the code below:       │
│                                 │
│  [___] [___] [___] [___]       │
│                                 │
│  Expires in: 23:45              │
│                                 │
│  [      Verify      ]           │
│  [  Resend Email   ]            │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Text: Display user's email
- Input fields: 4 code boxes (single digit each)
- Countdown timer: Shows remaining time
- Button: "Verify" → triggers verification workflow
- Button: "Resend Email" → triggers resend workflow

**Workflow**:
1. User enters 4-digit code OR clicks email link (auto-fills code)
2. Call API: Verify email token
3. On success → Navigate to Company Setup page
4. On fail → Show error, allow retry

**Database Context**:
- **Reads from**: `emailVerificationTokens` table
  - Checks: token validity, expiration
- **Updates**: `users` table
  - Sets: email_verified = true, email_verified_at = timestamp
- **Updates**: `emailVerificationTokens` table
  - Sets: used = true, verified_at = timestamp

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | VERIFICA TU CORREO | VERIFY YOUR EMAIL | auth_email_verify_header |
| Sent Message | Enviamos un enlace de verificación a: | We sent a verification link to: | auth_email_verify_sent |
| Instructions | Haz clic en el enlace de tu correo o ingresa el código a continuación: | Click the link in your email or enter the code below: | auth_email_verify_instructions |
| Expires Label | Expira en: | Expires in: | auth_email_verify_expires |
| Verify Button | Verificar | Verify | auth_email_verify_btn |
| Resend Button | Reenviar Correo | Resend Email | auth_email_resend_btn |
| Success Message | ¡Email verificado exitosamente! | Email verified successfully! | auth_email_verify_success |
| Resent Message | Email de verificación reenviado | Verification email resent | auth_email_resent_success |
| Invalid Code | Código inválido | Invalid code | auth_email_verify_invalid |
| Expired Code | Código expirado | Code expired | auth_email_verify_expired |

---

### Page 3: Company Setup
```
┌─────────────────────────────────┐
│    🏢 CREATE YOUR COMPANY       │
├─────────────────────────────────┤
│                                 │
│  Company Name: [____________]   │
│                                 │
│  Business Type:                 │
│  [v S.A.S ▼]                    │
│  Options: S.A.S, S.A., Ltda,    │
│          E.U., Persona Natural  │
│                                 │
│  Industry:                      │
│  [v Cannabis ▼]                 │
│  Options: Cannabis, Coffee,     │
│          Cocoa, Flowers, Mixed  │
│                                 │
│  Department:                    │
│  [v Antioquia ▼]                │
│                                 │
│  Municipality:                  │
│  [v Medellín ▼]                 │
│  (filtered by department)       │
│                                 │
│  [     Create Company     ]     │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input: Company name
- Dropdown: Business entity type
- Dropdown: Company type (industry)
- Dropdown: Department (loads from geographic data)
- Dropdown: Municipality (dynamic, filtered by selected department)
- Button: "Create Company" → triggers company creation

**Workflows**:
1. On page load → Call API: Get departments
2. When department selected → Call API: Get municipalities for that department
3. On "Create Company" click → Call API: Create company with all data
4. On success → Navigate to Dashboard or next module

**Database Context**:
- **Reads from**: `geographic_locations` table
  - Gets: departments (administrative_level = 1)
  - Gets: municipalities (filtered by department code)
- **Writes to**: `companies` table
  - Stores: name, business_entity_type, company_type, country, department_code, municipality_code
  - Sets: subscription_plan = "trial", max_facilities = 1, max_users = 3
- **Updates**: `users` table
  - Links: user to company via company_id
  - Sets: timezone from municipality

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | CREA TU EMPRESA | CREATE YOUR COMPANY | company_setup_header |
| Company Name Label | Nombre de la Empresa | Company Name | company_setup_name_label |
| Business Type Label | Tipo de Negocio | Business Type | company_setup_business_type_label |
| Industry Label | Industria | Industry | company_setup_industry_label |
| Department Label | Departamento | Department | company_setup_department_label |
| Municipality Label | Municipio | Municipality | company_setup_municipality_label |
| Municipality Helper | (filtrado por departamento) | (filtered by department) | company_setup_municipality_helper |
| Create Button | Crear Empresa | Create Company | company_setup_create_btn |
| Success Message | ¡Bienvenido! Tu empresa ha sido creada exitosamente. | Welcome! Your company has been created successfully. | company_setup_success |

**Enum Translations (Business Entity Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| S.A.S | S.A.S | Corporation (Simplified) |
| S.A. | S.A. | Corporation |
| Ltda | Ltda | Limited Liability |
| E.U. | E.U. | Sole Proprietorship |
| Persona Natural | Persona Natural | Individual |

**Enum Translations (Company Types / Industries)**:

| value | display_es | display_en |
|-------|------------|------------|
| cannabis | Cannabis | Cannabis |
| coffee | Café | Coffee |
| cocoa | Cacao | Cocoa |
| flowers | Flores | Flowers |
| mixed | Mixto | Mixed |

---

## MODULE 2: Subscription Selection (Optional for MVP)

### Page 4: Choose Plan
```
┌──────────────────────────────────────────────┐
│          💳 SELECT YOUR PLAN                 │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────┐│
│  │ TRIAL  │  │STARTER │  │  PRO   │  │ENTER│
│  │ Free   │  │ $X/mo  │  │ $Y/mo  │  │PRISE│
│  ├────────┤  ├────────┤  ├────────┤  ├────┤│
│  │1 facil.│  │5 facil.│  │20facil.│  │Custom│
│  │3 users │  │10 users│  │50 users│  │Quote││
│  │30 days │  │Full    │  │Full    │  │Call ││
│  │[Select]│  │[Select]│  │[Select]│  │ Us  ││
│  └────────┘  └────────┘  └────────┘  └────┘│
│                                              │
│  Monthly ○  Yearly ○ (save 15%)             │
│                                              │
└──────────────────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Plan cards (Trial, Starter, Pro, Enterprise)
  - Each card shows: name, price, facility limit, user limit, features
- Radio buttons: Billing cycle (monthly/yearly)
- Buttons: "Select" on each plan card

**Workflow**:
1. User selects plan
2. If NOT Trial → Navigate to payment page
3. If Trial → Skip payment, update company subscription, navigate to next module

**Database Context**:
- **Updates**: `companies` table
  - Sets: subscription_plan, max_facilities, max_users, subscription_tier
  - Sets: subscription_start_date, subscription_end_date

**Note**: For MVP, skip this module and default everyone to Trial plan (set during company creation)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | SELECCIONA TU PLAN | SELECT YOUR PLAN | subscription_header |
| Trial Plan Name | PRUEBA | TRIAL | subscription_trial_name |
| Starter Plan Name | INICIAL | STARTER | subscription_starter_name |
| Pro Plan Name | PROFESIONAL | PRO | subscription_pro_name |
| Enterprise Plan Name | EMPRESARIAL | ENTERPRISE | subscription_enterprise_name |
| Free | Gratis | Free | subscription_free |
| Per Month | /mes | /mo | subscription_per_month |
| Facility Label | instalación | facility | subscription_facility |
| Facilities Label | instalaciones | facilities | subscription_facilities |
| User Label | usuario | user | subscription_user |
| Users Label | usuarios | users | subscription_users |
| Days | días | days | subscription_days |
| Full Features | Completo | Full | subscription_full |
| Custom | Personalizado | Custom | subscription_custom |
| Quote | Cotización | Quote | subscription_quote |
| Call Us | Contáctanos | Call Us | subscription_call_us |
| Select Button | Seleccionar | Select | subscription_select_btn |
| Monthly | Mensual | Monthly | subscription_monthly |
| Yearly | Anual | Yearly | subscription_yearly |
| Save Discount | (ahorra 15%) | (save 15%) | subscription_save_discount |

**Enum Translations (Subscription Plans)**:

| value | display_es | display_en |
|-------|------------|------------|
| trial | Prueba | Trial |
| starter | Inicial | Starter |
| pro | Profesional | Pro |
| enterprise | Empresarial | Enterprise |

---

## MODULE 3: Facility Creation

### Page 5: Add Facility - Basic Info
```
┌─────────────────────────────────┐
│    🏭 ADD FACILITY              │
├─────────────────────────────────┤
│                                 │
│  Facility Name:                 │
│  [_______________________]      │
│  (e.g., "North Farm")           │
│                                 │
│  License Number:                │
│  [_______________________]      │
│                                 │
│  License Type:                  │
│  ○ Commercial Growing           │
│  ○ Research                     │
│  ○ Processing                   │
│  ○ Other                        │
│                                 │
│  Licensed Area (m²):            │
│  [________]                     │
│                                 │
│  Primary Crops:                 │
│  ☐ Cannabis                     │
│  ☐ Coffee                       │
│  ☐ Cocoa                        │
│  ☐ Flowers                      │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Input: Facility name
- Input: License number
- Radio buttons: License type
- Input: Total area (numeric)
- Checkboxes: Primary crops (multiple selection allowed)
- Button: "Continue" → navigate to location page

**Database Context**:
- **Reads from**: `crop_types` table
  - Gets: available crop types for checkboxes
- **Stores data temporarily**: Save form data to Bubble's state/custom state
  - Will write to database on final submit (next page)

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | AGREGAR INSTALACIÓN | ADD FACILITY | facilities_add_header |
| Facility Name Label | Nombre de la Instalación | Facility Name | facilities_name_label |
| Facility Name Placeholder | ej., "Finca Norte" | e.g., "North Farm" | facilities_name_placeholder |
| License Number Label | Número de Licencia | License Number | facilities_license_number_label |
| License Type Label | Tipo de Licencia | License Type | facilities_license_type_label |
| Licensed Area Label | Área Licenciada (m²) | Licensed Area (m²) | facilities_licensed_area_label |
| Primary Crops Label | Cultivos Principales | Primary Crops | facilities_primary_crops_label |
| Continue Button | Continuar | Continue | facilities_continue_btn |

**Enum Translations (License Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| commercial_growing | Cultivo Comercial | Commercial Growing |
| research | Investigación | Research |
| processing | Procesamiento | Processing |
| other | Otro | Other |

**Enum Translations (Crop Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| cannabis | Cannabis | Cannabis |
| coffee | Café | Coffee |
| cocoa | Cacao | Cocoa |
| flowers | Flores | Flowers |

---

### Page 6: Add Facility - Location
```
┌─────────────────────────────────┐
│    📍 FACILITY LOCATION         │
├─────────────────────────────────┤
│                                 │
│  Department:                    │
│  [v Pre-filled from company ▼]  │
│                                 │
│  Municipality:                  │
│  [v ___________________ ▼]      │
│                                 │
│  Street Address:                │
│  [_______________________]      │
│                                 │
│  GPS Coordinates:               │
│  Latitude:  [_________]         │
│  Longitude: [_________]         │
│                                 │
│  [Get My Location] (GPS button) │
│                                 │
│  Climate Zone:                  │
│  ○ Tropical                     │
│  ○ Subtropical                  │
│  ○ Temperate                    │
│                                 │
│  [Back]  [Create Facility]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Department (pre-filled from company)
- Dropdown: Municipality
- Input: Street address
- Input: Latitude (numeric)
- Input: Longitude (numeric)
- Button: "Get My Location" → uses Bubble's geolocation plugin
- Radio buttons: Climate zone
- Button: "Back" → return to previous page
- Button: "Create Facility" → submit form

**Workflow**:
1. Pre-fill department from company data
2. Load municipalities for that department
3. On "Get My Location" → Capture GPS coordinates
4. On "Create Facility" → Call API: Create facility with all data from both pages
5. On success → Show confirmation, navigate to next module

**Database Context**:
- **Reads from**: `geographic_locations` table
  - Gets: municipalities for dropdown
- **Reads from**: `companies` table
  - Gets: company department for pre-fill
  - Validates: facility count against max_facilities limit
- **Writes to**: `facilities` table
  - Stores: name, license_number, license_type, primary_crop_type_ids, address, municipality_code, department_code, latitude, longitude, total_area_m2, climate_zone
  - Sets: status = "active"

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | UBICACIÓN DE LA INSTALACIÓN | FACILITY LOCATION | facilities_location_header |
| Department Label | Departamento | Department | facilities_department_label |
| Department Helper | (prellenado desde empresa) | (pre-filled from company) | facilities_department_helper |
| Municipality Label | Municipio | Municipality | facilities_municipality_label |
| Street Address Label | Dirección | Street Address | facilities_address_label |
| GPS Coordinates Label | Coordenadas GPS | GPS Coordinates | facilities_gps_label |
| Latitude Label | Latitud | Latitude | facilities_latitude_label |
| Longitude Label | Longitud | Longitude | facilities_longitude_label |
| Get Location Button | Obtener Mi Ubicación | Get My Location | facilities_get_location_btn |
| Climate Zone Label | Zona Climática | Climate Zone | facilities_climate_zone_label |
| Back Button | Atrás | Back | facilities_back_btn |
| Create Facility Button | Crear Instalación | Create Facility | facilities_create_btn |
| Success Message | Instalación creada exitosamente | Facility created successfully | facilities_create_success |

**Enum Translations (Climate Zones)**:

| value | display_es | display_en |
|-------|------------|------------|
| tropical | Tropical | Tropical |
| subtropical | Subtropical | Subtropical |
| temperate | Templado | Temperate |

**Enum Translations (Facility Status)**:

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| inactive | Inactivo | Inactive |
| suspended | Suspendido | Suspended |

---

## MODULE 4: Area Setup

### Page 7: Define Cultivation Areas
```
┌─────────────────────────────────┐
│   🌿 CULTIVATION AREAS          │
│   at North Farm                 │
├─────────────────────────────────┤
│                                 │
│  [+ Add New Area]               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 1: Propagation     │   │
│  │ Type: Propagation       │   │
│  │ Size: 50 m²             │   │
│  │ Capacity: 500 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 2: Vegetative Rm   │   │
│  │ Type: Vegetative        │   │
│  │ Size: 100 m²            │   │
│  │ Capacity: 300 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Area 3: Flowering Rm    │   │
│  │ Type: Flowering         │   │
│  │ Size: 150 m²            │   │
│  │ Capacity: 200 plants    │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add New Area" → opens popup/modal
- Repeating Group: List of created areas
  - Shows: area name, type, size, capacity
  - Buttons: "Edit", "Delete" for each area
- Button: "Continue" → navigate to next module

**Database Context**:
- **Reads from**: `areas` table
  - Gets: all areas for current facility
- **Writes to**: `areas` table (via popup workflow)
  - Stores: name, area_type, total_area_m2, capacity, compatible_crop_type_ids

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | ÁREAS DE CULTIVO | CULTIVATION AREAS | areas_header |
| At Facility Text | en | at | areas_at_facility |
| Add New Button | + Agregar Nueva Área | + Add New Area | areas_add_new_btn |
| Area Label | Área | Area | areas_area_label |
| Type Label | Tipo | Type | areas_type_label |
| Size Label | Tamaño | Size | areas_size_label |
| Capacity Label | Capacidad | Capacity | areas_capacity_label |
| Plants Unit | plantas | plants | areas_plants_unit |
| Edit Button | Editar | Edit | areas_edit_btn |
| Delete Button | Eliminar | Delete | areas_delete_btn |
| Continue Button | Continuar | Continue | areas_continue_btn |

---

### Popup: Add/Edit Area
```
┌─────────────────────────────────┐
│    ADD CULTIVATION AREA         │
├─────────────────────────────────┤
│                                 │
│  Area Name:                     │
│  [_______________________]      │
│                                 │
│  Area Type:                     │
│  [v Propagation ▼]              │
│  Options: Propagation,          │
│          Vegetative,            │
│          Flowering,             │
│          Drying/Curing,         │
│          Storage                │
│                                 │
│  Size (m²):                     │
│  [________]                     │
│                                 │
│  Capacity (plants/batches):     │
│  [________]                     │
│                                 │
│  Climate Controlled:            │
│  ☐ Yes                          │
│                                 │
│  Environmental Settings:        │
│  Temperature: [20] - [25] °C    │
│  Humidity: [60] - [70] %        │
│                                 │
│  [Cancel]  [Save Area]          │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements** (in popup):
- Input: Area name
- Dropdown: Area type
- Input: Size (numeric)
- Input: Capacity (numeric)
- Checkbox: Climate controlled
- Input: Temp min/max (numeric)
- Input: Humidity min/max (numeric)
- Button: "Cancel" → close popup
- Button: "Save Area" → create/update area, refresh list, close popup

**Workflow**:
1. User fills form
2. On "Save Area" → Call API: Create area
3. Refresh areas list on main page
4. Close popup

**Database Context**:
- **Writes to**: `areas` table
  - Stores: facility_id, name, area_type, total_area_m2, capacity, climate_controlled, environmental_specs
  - Sets: status = "active"

**UI Translations (Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header (Add) | AGREGAR ÁREA DE CULTIVO | ADD CULTIVATION AREA | areas_popup_add_header |
| Popup Header (Edit) | EDITAR ÁREA DE CULTIVO | EDIT CULTIVATION AREA | areas_popup_edit_header |
| Area Name Label | Nombre del Área | Area Name | areas_popup_name_label |
| Area Type Label | Tipo de Área | Area Type | areas_popup_type_label |
| Size Label | Tamaño (m²) | Size (m²) | areas_popup_size_label |
| Capacity Label | Capacidad (plantas/lotes) | Capacity (plants/batches) | areas_popup_capacity_label |
| Climate Controlled Label | Climatizado | Climate Controlled | areas_popup_climate_controlled_label |
| Yes Option | Sí | Yes | areas_popup_yes |
| Environmental Settings | Configuración Ambiental | Environmental Settings | areas_popup_environmental_label |
| Temperature Label | Temperatura | Temperature | areas_popup_temperature_label |
| Humidity Label | Humedad | Humidity | areas_popup_humidity_label |
| Cancel Button | Cancelar | Cancel | areas_popup_cancel_btn |
| Save Button | Guardar Área | Save Area | areas_popup_save_btn |
| Success Message | Área creada exitosamente | Area created successfully | areas_popup_create_success |
| Update Success Message | Área actualizada exitosamente | Area updated successfully | areas_popup_update_success |

**Enum Translations (Area Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| propagation | Propagación | Propagation |
| vegetative | Vegetativo | Vegetative |
| flowering | Floración | Flowering |
| drying | Secado/Curado | Drying/Curing |
| processing | Procesamiento | Processing |
| storage | Almacenamiento | Storage |

**Enum Translations (Area Status)**:

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| maintenance | Mantenimiento | Maintenance |
| inactive | Inactivo | Inactive |

---

## MODULE 5: Cultivar Selection

### Page 8: Select Cultivars
```
┌─────────────────────────────────┐
│   🌾 SELECT CULTIVARS           │
│   (Crop Varieties)              │
├─────────────────────────────────┤
│                                 │
│  For Crop: [Cannabis ▼]         │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☑ Cherry AK             │   │
│  │   Type: Indica          │   │
│  │   Flowering: 8 weeks    │   │
│  │   Yield: Medium-High    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ White Widow           │   │
│  │   Type: Hybrid          │   │
│  │   Flowering: 9 weeks    │   │
│  │   Yield: High           │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ Green Crack           │   │
│  │   Type: Sativa          │   │
│  │   Flowering: 10 weeks   │   │
│  │   Yield: Very High      │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ Add Custom Cultivar]        │
│                                 │
│  [     Continue     ]           │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Crop type filter
- Repeating Group: Available cultivars for selected crop
  - Shows: name, variety type, flowering weeks, yield level
  - Checkboxes: Select cultivar (multiple allowed)
- Button: "+ Add Custom Cultivar" → opens popup
- Button: "Continue" → save selections, navigate to next module

**Workflow**:
1. On page load → Call API: Get cultivars for facility's primary crops
2. User selects cultivars
3. On "Continue" → Call API: Link cultivars to facility
4. Navigate to next module

**Database Context**:
- **Reads from**: `cultivars` table
  - Gets: cultivars filtered by crop_type_id
- **Reads from**: `facilities` table
  - Gets: primary_crop_type_ids to filter cultivars
- **Updates**: `facilities` table
  - Links: selected cultivar IDs to facility

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | SELECCIONAR CULTIVARES | SELECT CULTIVARS | cultivars_header |
| Subtitle | (Variedades de Cultivo) | (Crop Varieties) | cultivars_subtitle |
| For Crop Label | Para Cultivo | For Crop | cultivars_for_crop_label |
| Type Label | Tipo | Type | cultivars_type_label |
| Flowering Label | Floración | Flowering | cultivars_flowering_label |
| Weeks | semanas | weeks | cultivars_weeks_unit |
| Yield Label | Rendimiento | Yield | cultivars_yield_label |
| Add Custom Button | + Agregar Cultivar Personalizado | + Add Custom Cultivar | cultivars_add_custom_btn |
| Continue Button | Continuar | Continue | cultivars_continue_btn |
| Success Message | Cultivares vinculados exitosamente | Cultivars linked successfully | cultivars_link_success |

**Enum Translations (Variety Types)**:

| value | display_es | display_en |
|-------|------------|------------|
| Indica | Indica | Indica |
| Sativa | Sativa | Sativa |
| Hybrid | Híbrido | Hybrid |
| Arabica | Arábica | Arabica |
| Robusta | Robusta | Robusta |

**Enum Translations (Yield Levels)**:

| value | display_es | display_en |
|-------|------------|------------|
| low | Bajo | Low |
| medium | Medio | Medium |
| medium-high | Medio-Alto | Medium-High |
| high | Alto | High |
| very-high | Muy Alto | Very High |

---

## MODULE 6: Supplier Setup

### Page 9: Add Suppliers
```
┌─────────────────────────────────┐
│   🚚 INPUT SUPPLIERS            │
├─────────────────────────────────┤
│                                 │
│  Suppliers provide:             │
│  • Seeds/Cuttings               │
│  • Nutrients                    │
│  • Pesticides                   │
│  • Equipment                    │
│                                 │
│  [+ Add Supplier]               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ FarmChem Inc            │   │
│  │ Tax ID: 900123456-7     │   │
│  │ Products: Nutrients     │   │
│  │ Contact: Juan Pérez     │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Seed Supply Co.         │   │
│  │ Tax ID: 800987654-3     │   │
│  │ Products: Seeds         │   │
│  │ Contact: María García   │   │
│  │ [Edit] [Delete]         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Skip for Now] [Continue]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add Supplier" → opens popup
- Repeating Group: List of added suppliers
  - Shows: name, tax ID, product categories, contact
  - Buttons: "Edit", "Delete" for each
- Button: "Skip for Now" → navigate to dashboard
- Button: "Continue" → navigate to dashboard

**Database Context**:
- **Reads from**: `suppliers` table
  - Gets: all suppliers for current company
- **Writes to**: `suppliers` table (via popup)
  - Stores: name, tax_id, product_categories, contact info

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | PROVEEDORES DE INSUMOS | INPUT SUPPLIERS | suppliers_header |
| Description Line 1 | Los proveedores proporcionan: | Suppliers provide: | suppliers_description |
| Seeds Item | • Semillas/Esquejes | • Seeds/Cuttings | suppliers_item_seeds |
| Nutrients Item | • Nutrientes | • Nutrients | suppliers_item_nutrients |
| Pesticides Item | • Pesticidas | • Pesticides | suppliers_item_pesticides |
| Equipment Item | • Equipamiento | • Equipment | suppliers_item_equipment |
| Add Supplier Button | + Agregar Proveedor | + Add Supplier | suppliers_add_btn |
| Tax ID Label | NIT | Tax ID | suppliers_tax_id_label |
| Products Label | Productos | Products | suppliers_products_label |
| Contact Label | Contacto | Contact | suppliers_contact_label |
| Edit Button | Editar | Edit | suppliers_edit_btn |
| Delete Button | Eliminar | Delete | suppliers_delete_btn |
| Skip Button | Omitir por Ahora | Skip for Now | suppliers_skip_btn |
| Continue Button | Continuar | Continue | suppliers_continue_btn |

---

### Popup: Add/Edit Supplier
```
┌─────────────────────────────────┐
│    ADD SUPPLIER                 │
├─────────────────────────────────┤
│                                 │
│  Supplier Name:                 │
│  [_______________________]      │
│                                 │
│  Tax ID (NIT):                  │
│  [_______________________]      │
│                                 │
│  Product Categories:            │
│  ☐ Seeds/Cuttings               │
│  ☐ Nutrients                    │
│  ☐ Pesticides                   │
│  ☐ Equipment                    │
│  ☐ Other                        │
│                                 │
│  Contact Person:                │
│  [_______________________]      │
│                                 │
│  Contact Email:                 │
│  [_______________________]      │
│                                 │
│  Contact Phone:                 │
│  [_______________________]      │
│                                 │
│  [Cancel]  [Save Supplier]      │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements** (in popup):
- Input: Supplier name
- Input: Tax ID
- Checkboxes: Product categories (multiple)
- Input: Contact name
- Input: Contact email
- Input: Contact phone
- Button: "Cancel" → close popup
- Button: "Save Supplier" → create supplier, refresh list, close popup

**Workflow**:
1. User fills form
2. On "Save Supplier" → Call API: Create supplier
3. Refresh suppliers list on main page
4. Close popup

**Database Context**:
- **Writes to**: `suppliers` table
  - Stores: company_id, name, tax_id, product_categories, contact_name, contact_email, contact_phone
  - Sets: status = "active"

**UI Translations (Popup)**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Popup Header (Add) | AGREGAR PROVEEDOR | ADD SUPPLIER | suppliers_popup_add_header |
| Popup Header (Edit) | EDITAR PROVEEDOR | EDIT SUPPLIER | suppliers_popup_edit_header |
| Supplier Name Label | Nombre del Proveedor | Supplier Name | suppliers_popup_name_label |
| Tax ID Label | NIT | Tax ID (NIT) | suppliers_popup_tax_id_label |
| Product Categories Label | Categorías de Productos | Product Categories | suppliers_popup_categories_label |
| Seeds Checkbox | Semillas/Esquejes | Seeds/Cuttings | suppliers_popup_category_seeds |
| Nutrients Checkbox | Nutrientes | Nutrients | suppliers_popup_category_nutrients |
| Pesticides Checkbox | Pesticidas | Pesticides | suppliers_popup_category_pesticides |
| Equipment Checkbox | Equipamiento | Equipment | suppliers_popup_category_equipment |
| Other Checkbox | Otro | Other | suppliers_popup_category_other |
| Contact Person Label | Persona de Contacto | Contact Person | suppliers_popup_contact_person_label |
| Contact Email Label | Correo de Contacto | Contact Email | suppliers_popup_contact_email_label |
| Contact Phone Label | Teléfono de Contacto | Contact Phone | suppliers_popup_contact_phone_label |
| Cancel Button | Cancelar | Cancel | suppliers_popup_cancel_btn |
| Save Button | Guardar Proveedor | Save Supplier | suppliers_popup_save_btn |
| Success Message | Proveedor creado exitosamente | Supplier created successfully | suppliers_popup_create_success |
| Update Success Message | Proveedor actualizado exitosamente | Supplier updated successfully | suppliers_popup_update_success |

**Enum Translations (Product Categories)**:

| value | display_es | display_en |
|-------|------------|------------|
| seeds | Semillas/Esquejes | Seeds/Cuttings |
| nutrients | Nutrientes | Nutrients |
| pesticides | Pesticidas | Pesticides |
| equipment | Equipamiento | Equipment |
| other | Otro | Other |

**Enum Translations (Supplier Status)**:

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| inactive | Inactivo | Inactive |

---

## MODULE 7: Onboarding Complete

### Page 10: Welcome to Dashboard
```
┌─────────────────────────────────┐
│   ✅ SETUP COMPLETE!            │
├─────────────────────────────────┤
│                                 │
│  Congratulations!               │
│  Your facility is ready.        │
│                                 │
│  Summary:                       │
│  ✓ Company: Cultivos San José  │
│  ✓ Facility: North Farm         │
│  ✓ Areas: 4 defined             │
│  ✓ Cultivars: 2 selected        │
│  ✓ Suppliers: 2 added           │
│                                 │
│  Next Steps:                    │
│  1. Create production templates │
│  2. Set up inventory            │
│  3. Start your first batch      │
│                                 │
│  [  Go to Dashboard  ]          │
│                                 │
└─────────────────────────────────┘
```

**Bubble Elements**:
- Text: Summary of completed setup
- List: Checkmarks showing what was configured
- Text: Next steps guidance
- Button: "Go to Dashboard" → navigate to main dashboard

**Workflow**:
1. Display summary of onboarding
2. On button click → Navigate to Dashboard (start of Phase 2)

**Database Context**:
- **No writes**: Just displays data already saved
- **Reads from**: `companies`, `facilities`, `areas`, `cultivars`, `suppliers`
  - Gets: counts and names for summary display

**UI Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Page Header | ¡CONFIGURACIÓN COMPLETA! | SETUP COMPLETE! | onboarding_complete_header |
| Congratulations | ¡Felicitaciones! | Congratulations! | onboarding_complete_congrats |
| Ready Message | Tu instalación está lista. | Your facility is ready. | onboarding_complete_ready |
| Summary Label | Resumen: | Summary: | onboarding_complete_summary_label |
| Company Checkmark | ✓ Empresa: | ✓ Company: | onboarding_complete_company |
| Facility Checkmark | ✓ Instalación: | ✓ Facility: | onboarding_complete_facility |
| Areas Checkmark | ✓ Áreas: | ✓ Areas: | onboarding_complete_areas |
| Areas Count | [X] definidas | [X] defined | onboarding_complete_areas_count |
| Cultivars Checkmark | ✓ Cultivares: | ✓ Cultivars: | onboarding_complete_cultivars |
| Cultivars Count | [X] seleccionados | [X] selected | onboarding_complete_cultivars_count |
| Suppliers Checkmark | ✓ Proveedores: | ✓ Suppliers: | onboarding_complete_suppliers |
| Suppliers Count | [X] agregados | [X] added | onboarding_complete_suppliers_count |
| Next Steps Label | Próximos Pasos: | Next Steps: | onboarding_complete_next_steps_label |
| Step 1 | 1. Crear plantillas de producción | 1. Create production templates | onboarding_complete_step_1 |
| Step 2 | 2. Configurar inventario | 2. Set up inventory | onboarding_complete_step_2 |
| Step 3 | 3. Iniciar tu primer lote | 3. Start your first batch | onboarding_complete_step_3 |
| Go to Dashboard Button | Ir al Panel de Control | Go to Dashboard | onboarding_complete_dashboard_btn |

---

## BUBBLE COMPONENTS SUMMARY

### Reusable Components

**Navigation Bar** (used on all pages after login):
```
┌─────────────────────────────────┐
│ 🌱 ALQUEMIST    [≡ Menu] [User]│
└─────────────────────────────────┘
```
- Logo
- Hamburger menu (mobile)
- User profile dropdown

**Progress Indicator** (onboarding wizard):
```
1○─2○─3○─4○─5○─6○─7●
Step 7 of 7: Add Suppliers
```
- Shows current step
- Total steps
- Progress visualization

**Reusable Components Translations**:

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Menu Button | Menú | Menu | nav_menu_btn |
| User Profile | Usuario | User | nav_user_profile |
| Progress Step Text | Paso [X] de [Y]: | Step [X] of [Y]: | progress_step_text |

### Form Validation Rules

**Email**:
- Valid email format
- Unique (not already registered)

**Password**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

**Facility License**:
- Alphanumeric
- Unique across system

**Phone**:
- Colombian format: 10 digits
- Optional field

---

## DATABASE FLOW SUMMARY

### Module 1: Authentication
```
Signup → users table (email_verified=false)
       → emailVerificationTokens table

Verify → users table (email_verified=true)
       → emailVerificationTokens (used=true)

Company → companies table
        → users table (add company_id)
```

### Module 3: Facility Setup
```
Facility → facilities table
         → Check companies.max_facilities limit

Areas → areas table (linked to facility_id)

Cultivars → Link to facilities (update facility record)

Suppliers → suppliers table (linked to company_id)
```

---

## RESPONSIVE DESIGN NOTES

### Desktop (1200px+)
- Full width forms
- Side-by-side layout for multi-step forms
- Progress bar at top

### Tablet (768px - 1199px)
- Single column forms
- Larger touch targets
- Progress bar at top

### Mobile (< 768px)
- Single column, full width
- Bottom navigation
- Simplified progress indicator
- Larger buttons (min 44px height)

---

**Status**: UI requirements complete for Phase 1
**Next Steps**:
1. Implement API endpoints (see [PHASE-1-ENDPOINTS.md](../../api/PHASE-1-ENDPOINTS.md))
2. Build Bubble pages following these wireframes
3. Connect Bubble workflows to API endpoints
4. Test full onboarding flow
