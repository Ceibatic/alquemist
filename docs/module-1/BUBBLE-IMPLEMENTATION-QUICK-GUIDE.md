# Bubble Implementation - Quick Reference Guide

**Fast-track guide to implement Modules 1 & 2 in Bubble (3-4 hours)**

---

## 5-Minute Setup

### 1. Environment Variables
Create in Convex `.env.local`:
```env
CONVEX_DEPLOYMENT=exciting-shrimp-34
CLERK_SECRET_KEY=sk_live_xxxx
RESEND_API_KEY=re_xxxx
BUBBLE_APP_URL=https://yourapp.bubbleapps.io
```

### 2. Deploy Variables
```bash
npx convex env set CLERK_SECRET_KEY sk_live_xxxx
npx convex env set RESEND_API_KEY re_xxxx
npx convex env set BUBBLE_APP_URL https://yourapp.bubbleapps.io
```

### 3. Seed Data
```bash
npx convex run seedRoles:seedSystemRoles
npx convex run seedGeographic:seedColombianGeography
```

---

## 5 API Endpoints to Create in Bubble

### In Bubble: Plugins → API Connector

#### 1. RegisterUserStep1
```
POST https://exciting-shrimp-34.convex.site/registration/register-step-1
Body: {
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>"
}
```

#### 2. VerifyEmailToken
```
POST https://exciting-shrimp-34.convex.site/registration/verify-email
Body: {
  "token": "<token>"
}
```

#### 3. RegisterCompanyStep2
```
POST https://exciting-shrimp-34.convex.site/registration/register-step-2
Body: {
  "userId": "<userId>",
  "companyName": "<companyName>",
  "businessEntityType": "<businessEntityType>",
  "companyType": "<companyType>",
  "country": "CO",
  "departmentCode": "<departmentCode>",
  "municipalityCode": "<municipalityCode>"
}
```
(Mark `country` as Private)

#### 4. GetDepartments
```
POST https://exciting-shrimp-34.convex.site/geographic/departments
Body: {
  "countryCode": "CO"
}
```
(Mark `countryCode` as Private)

#### 5. GetMunicipalities
```
POST https://exciting-shrimp-34.convex.site/geographic/municipalities
Body: {
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```
(Mark `countryCode` as Private, leave `departmentCode` dynamic)

---

## 3 Pages to Create

### Page 1: `/signup-step-1`

**Elements**:
- Text: title "Crear Cuenta"
- Input: email_input
- Input: password_input
- Input: firstName_input
- Input: lastName_input
- Input: phone_input (optional)
- Text: error_message (hidden, red)
- Text: success_message (hidden, green)
- Button: register_button

**Custom States**:
```
current_user_id (Text)
current_email (Text)
registration_token (Text)
registration_password (Text) ← IMPORTANT: Store for auto-login
registration_first_name (Text) ← IMPORTANT: Store for auto-login
registration_last_name (Text) ← IMPORTANT: Store for auto-login
```

**Workflow on register_button click**:
1. Validate: email, password (8+), firstName, lastName not empty
2. Show loading state (disable button)
3. Call: RegisterUserStep1 with form values
4. On success:
   - Set states: current_user_id, current_email, registration_token
   - Set states: registration_password, registration_first_name, registration_last_name
   - Show success message
   - Navigate to `/signup-verify-email` (after 2 sec)
5. On error:
   - Show error message

---

### Page 2: `/signup-verify-email`

**Elements**:
- Text: title "Verificación de Email"
- Text: instructions (show email: "Se envió a {email}")
- Input: verification_code_input
- Button: verify_button
- Link: resend_link
- Text: error_message (hidden)
- Text: success_message (hidden)

**Custom States**:
```
verification_code (Text)
is_verifying (Yes/No)
verification_complete (Yes/No)
resend_cooldown_seconds (Number)
```

**Workflows**:

**On verify_button click**:
1. Validate: verification_code_input not empty
2. Show loading state
3. Call: VerifyEmailToken with code
4. On success:
   - Set state: verification_complete = Yes
   - Show success message
   - Navigate to `/signup-step-2` (after 2 sec)
5. On error:
   - Show error message

**On resend_link click**:
1. Disable resend_link
2. Call: RegisterUserStep1 again (with stored email & password)
   - This generates new token and sends new email
3. On success:
   - Show "Code resent!"
   - Set resend_cooldown_seconds = 300
   - Run countdown (decrement every 1 sec)
   - Re-enable after 300 sec
4. On error:
   - Show error, re-enable

---

### Page 3: `/signup-step-2`

**Elements**:
- Text: title "Crear Empresa"
- Input: company_name_input
- Dropdown: business_type_dropdown (S.A.S, S.A., Ltda, E.U., Persona Natural)
- Dropdown: company_type_dropdown (cannabis, coffee, cocoa, flowers, mixed)
- Dropdown: department_dropdown (Dynamic: GetDepartments)
- Dropdown: municipality_dropdown (Dynamic: GetMunicipalities, filters by dept)
- Button: create_button
- Text: error_message (hidden)
- Text: success_message (hidden)

**Custom States**:
```
selected_department_code (Text)
selected_municipality_code (Text)
departments_list (List of Objects)
municipalities_list (List of Objects)
is_creating_company (Yes/No)
```

**Page Load Workflow**:
1. Call: GetDepartments
2. On success:
   - Set state: departments_list = response
   - Bind department_dropdown choices to departments_list
     - Display: item.division_1_name
     - Value: item.division_1_code

**On department_dropdown change**:
1. Set state: selected_department_code = selected value
2. Call: GetMunicipalities with departmentCode
3. On success:
   - Set state: municipalities_list = response
   - Bind municipality_dropdown choices to municipalities_list
     - Display: item.division_2_name
     - Value: item.division_2_code
   - Clear municipality_dropdown

**On municipality_dropdown change**:
1. Set state: selected_municipality_code = selected value

**On create_button click** (CRITICAL WORKFLOW):
1. Validate all fields not empty
2. Show loading state
3. Call: RegisterCompanyStep2 with:
   ```
   userId: GetPageData(signup-step-1).current_user_id
   companyName: company_name_input value
   businessEntityType: business_type_dropdown value
   companyType: company_type_dropdown value
   country: "CO"
   departmentCode: selected_department_code
   municipalityCode: selected_municipality_code
   ```
4. On success:
   - **IMMEDIATELY call: AutoLoginWithClerk** with:
     ```
     userId: GetPageData(signup-step-1).current_user_id
     email: GetPageData(signup-step-1).current_email
     password: GetPageData(signup-step-1).registration_password
     firstName: GetPageData(signup-step-1).registration_first_name
     lastName: GetPageData(signup-step-1).registration_last_name
     companyName: company_name_input value
     ```
   - Show success message
   - Navigate to `/dashboard` (after 2 sec)
5. On error:
   - Show error message

---

## Key Points

### ⚠️ Critical: Password Storage
- Must store password in custom state on Page 1
- Use GetPageData(signup-step-1).registration_password on Page 3
- This is how auto-login gets the password for Clerk

### ⚠️ Critical: Clerk Auto-Login
- Must call AutoLoginWithClerk immediately after RegisterCompanyStep2
- This creates the Clerk user and establishes session
- Without this, user is not logged in

### ⚠️ Critical: Email & Name Storage
- Store all 3 (email, firstName, lastName) on Page 1
- Pass to Page 3 for auto-login call

### ✅ Resend Integration
- Backend automatically sends verification email
- Email includes token + verification link
- 24-hour expiry, single-use token
- Rate limiting: 5 resends per 5 minutes

### ✅ Geographic Data
- 32 Colombian departments
- 156 municipalities total
- Properly filtered by department

---

## Testing Checklist

```
☐ Fill step 1, click register
☐ Success message shows, redirect to step 2
☐ Get token from email or page state
☐ Paste token, click verify
☐ Success message, redirect to step 3
☐ Fill company form
☐ Select department, verify municipalities load
☐ Select municipality
☐ Click create company
☐ Verify success, redirect to dashboard
☐ Check user is logged in (Clerk)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API 404 | Check URL: `https://exciting-shrimp-34.convex.site/...` |
| Email not sending | Check RESEND_API_KEY in Convex env |
| Clerk fails | Check CLERK_SECRET_KEY in Convex env |
| Dropdowns empty | Run `npx convex run seedGeographic:seedColombianGeography` |
| "Email already registered" | Use different email (each user must be unique) |
| "Token already used" | Token is single-use, click resend |
| Can't reach step 3 | Email must be verified first (enforced) |

---

## Time Breakdown

| Task | Time |
|------|------|
| Setup env vars + seed data | 15 min |
| Create 5 API connectors | 15 min |
| Create 3 pages + elements | 20 min |
| Add all workflows | 90 min |
| Testing | 30 min |
| **Total** | **170 min (~3 hours)** |

---

## Complete Details

For detailed workflow instructions with exact Bubble UI paths:
→ [Module-1-Bubble-Guide.md](./Module-1-Bubble-Guide.md)

For status and verification:
→ [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)

For environment setup details:
→ [Module-1-Bubble-Guide.md - Part 1](./Module-1-Bubble-Guide.md#part-1-environment-variables--configuration)

---

**Backend Status**: ✅ READY
**Documentation**: ✅ COMPLETE
**Ready to Build**: ✅ YES

Start with environment setup (Part 1 above), then follow Module-1-Bubble-Guide.md for detailed instructions.
