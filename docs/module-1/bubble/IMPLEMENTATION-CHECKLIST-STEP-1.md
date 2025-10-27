# Signup Step 1 - Implementation Checklist
## Build the User Registration Page in Bubble (15 minutes)

---

## Page Setup
- [ ] Create new page named: `signup-step-1`
- [ ] Set page type: `Standard`
- [ ] Set page layout: `Column container`

---

## Step 1: Create Custom States (3 states)

### State 1: current_user_id
```
Name: current_user_id
Type: Text
Expose: No
```

### State 2: current_email
```
Name: current_email
Type: Text
Expose: No
```

### State 3: registration_token
```
Name: registration_token
Type: Text
Expose: No
```

**Checklist**:
- [ ] Go to **Page settings** → **App data**
- [ ] Create state: `current_user_id` (Type: Text)
- [ ] Create state: `current_email` (Type: Text)
- [ ] Create state: `registration_token` (Type: Text)

---

## Step 2: Create Form Inputs (5 inputs)

### Input 1: email_input
```
Element Type: Input
Placeholder: "Correo electrónico"
Input type: Email
Max length: 100
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `email_input`
- [ ] Set Placeholder: `Correo electrónico`
- [ ] Set Input type: `Email`
- [ ] Set Max length: `100`

### Input 2: password_input
```
Element Type: Input
Placeholder: "Contraseña (8+ caracteres, incluir número)"
Input type: Password
Max length: 128
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `password_input`
- [ ] Set Placeholder: `Contraseña (8+ caracteres, incluir número)`
- [ ] Set Input type: `Password`
- [ ] Set Max length: `128`

### Input 3: firstName_input
```
Element Type: Input
Placeholder: "Nombre"
Input type: Text
Max length: 50
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `firstName_input`
- [ ] Set Placeholder: `Nombre`

### Input 4: lastName_input
```
Element Type: Input
Placeholder: "Apellido"
Input type: Text
Max length: 50
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `lastName_input`
- [ ] Set Placeholder: `Apellido`

### Input 5: phone_input (Optional)
```
Element Type: Input
Placeholder: "Teléfono (opcional, ej: 3001234567)"
Input type: Text
Max length: 20
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `phone_input`
- [ ] Set Placeholder: `Teléfono (opcional, ej: 3001234567)`

---

## Step 3: Create UI Elements (3 elements)

### Element 1: error_message
```
Element Type: Text
Text: "Error message will appear here"
Text color: Red (#FF0000)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `error_message`
- [ ] Set initial text: "Error"
- [ ] Set text color: Red
- [ ] Set visibility to: Hidden (will show on error)

### Element 2: success_message
```
Element Type: Text
Text: "¡Cuenta creada! Verifica tu correo electrónico."
Text color: Green (#00AA00)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `success_message`
- [ ] Set initial text: "Success"
- [ ] Set text color: Green
- [ ] Set visibility to: Hidden (will show on success)

### Element 3: loading_spinner
```
Element Type: Icon
Icon: Spinner/Loading icon
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Icon** element to canvas
- [ ] Name it: `loading_spinner`
- [ ] Choose loading spinner icon
- [ ] Set visibility to: Hidden (will show during request)

---

## Step 4: Create Submit Button

### Button: register_button
```
Element Type: Button
Text: "Crear Cuenta"
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `register_button`
- [ ] Set button text: `Crear Cuenta`

---

## Step 5: Create Navigation Link

### Link: go_to_signin
```
Element Type: Text
Text: "¿Ya tienes cuenta? Inicia sesión aquí"
Color: Blue (#0000FF)
Underline: Yes
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `go_to_signin`
- [ ] Set text: `¿Ya tienes cuenta? Inicia sesión aquí`
- [ ] Add underline styling

---

## Step 6: Create and Test API Call

### API Call: RegisterUserStep1
**Already created in API Connector**, just verify it exists:

- [ ] Go to **Plugins** → **API Connector**
- [ ] Verify connector: `RegisterUserStep1` exists
- [ ] Verify URL: `https://[your-deployment].convex.site/registration/register-step-1`
- [ ] Verify Method: `POST`
- [ ] Verify Body: Contains email, password, firstName, lastName, phone
- [ ] Click **Test** to verify it works

---

## Step 7: Create Main Workflow

### Workflow: register_user_step_1

**Trigger**: Click on `register_button`

#### Action 1: Show Loading
```
Action Type: Element → Show
Element: loading_spinner
```

#### Action 2: Hide Messages
```
Action Type: Element → Hide
Element: error_message
```
```
Action Type: Element → Hide
Element: success_message
```

#### Action 3: Make API Call
```
Action Type: Plugin → API Connector
Call: RegisterUserStep1

Parameters:
  email: email_input value
  password: password_input value
  firstName: firstName_input value
  lastName: lastName_input value
  phone: phone_input value
```

#### Action 4: On Success - Store User Data
```
Trigger: When RegisterUserStep1 completes successfully

Action Type: Set custom state
  State: current_user_id
  Value: RegisterUserStep1.data.body.userId

State: current_email
  Value: RegisterUserStep1.data.body.email

State: registration_token
  Value: RegisterUserStep1.data.body.token
```

#### Action 5: On Success - Show Success Message
```
Action Type: Element → Show
Element: success_message

Element: success_message → Set text
Text: "¡Cuenta creada! Verifica tu correo electrónico: " + email_input value
```

#### Action 6: On Success - Clear Inputs
```
Action Type: Element → Clear
Elements:
  - email_input
  - password_input
  - firstName_input
  - lastName_input
  - phone_input
```

#### Action 7: On Success - Hide Loading
```
Action Type: Element → Hide
Element: loading_spinner
```

#### Action 8: On Success - Navigate (After 2 seconds)
```
Trigger: Delay 2 seconds

Action Type: Navigate
Destination: Page `signup-verify-email`
```

#### Action 9: On Error - Show Error Message
```
Trigger: When RegisterUserStep1 returns error

Action Type: Element → Show
Element: error_message

Element: error_message → Set text
Text: RegisterUserStep1.data.body.error
```

#### Action 10: On Error - Hide Loading
```
Action Type: Element → Hide
Element: loading_spinner
```

**Workflow Checklist**:
- [ ] Right-click on `register_button`
- [ ] Select **Start/Edit workflow**
- [ ] Add action: Element → Show → loading_spinner
- [ ] Add action: Element → Hide → error_message
- [ ] Add action: Element → Hide → success_message
- [ ] Add action: Plugin → API Connector → RegisterUserStep1
- [ ] Add success handler (after RegisterUserStep1 completes):
  - [ ] Set custom state: `current_user_id`
  - [ ] Set custom state: `current_email`
  - [ ] Set custom state: `registration_token`
  - [ ] Show success_message
  - [ ] Set success_message text
  - [ ] Clear all inputs
  - [ ] Hide loading_spinner
  - [ ] Navigate to signup-verify-email (with 2-second delay)
- [ ] Add error handler:
  - [ ] Show error_message
  - [ ] Set error_message text
  - [ ] Hide loading_spinner

---

## Step 8: Add Input Validation (Optional - Client-Side)

### Validation: email_input
**Add to workflow - trigger before API call**:
```
Condition: email_input value is not empty
Condition: email_input value contains "@"
Condition: email_input value contains "."

Action: Show error if validation fails
Element: error_message
Text: "Por favor ingresa un email válido"
```

### Validation: password_input
```
Condition: password_input value length >= 8
Condition: password_input value contains at least one number

Action: Show error if validation fails
Element: error_message
Text: "Contraseña debe tener 8+ caracteres y incluir un número"
```

### Validation: firstName & lastName
```
Condition: firstName_input value is not empty
Condition: lastName_input value is not empty

Action: Show error if validation fails
Element: error_message
Text: "Nombre y apellido son requeridos"
```

**Validation Checklist**:
- [ ] Before calling RegisterUserStep1, add validation step
- [ ] If email is empty → Show error
- [ ] If email doesn't contain @ → Show error
- [ ] If password length < 8 → Show error
- [ ] If firstName is empty → Show error
- [ ] If lastName is empty → Show error

---

## Step 9: Testing

**Test Case 1: Valid Registration**
- [ ] Enter email: `test1@example.com`
- [ ] Enter password: `TestPass123`
- [ ] Enter firstName: `John`
- [ ] Enter lastName: `Doe`
- [ ] Enter phone: `3001234567` (optional)
- [ ] Click **Crear Cuenta**
- [ ] Verify: Success message appears
- [ ] Verify: Redirects to `signup-verify-email` after 2 seconds
- [ ] Verify: Page state contains:
  - [ ] current_user_id (should be populated)
  - [ ] current_email = test1@example.com
  - [ ] registration_token (should be populated)

**Test Case 2: Invalid Email**
- [ ] Enter email: `invalid-email`
- [ ] Enter password: `TestPass123`
- [ ] Enter firstName: `John`
- [ ] Enter lastName: `Doe`
- [ ] Click **Crear Cuenta**
- [ ] Verify: Error message appears
- [ ] Verify: Does NOT navigate away
- [ ] Verify: Error message contains "inválido" or similar

**Test Case 3: Weak Password**
- [ ] Enter email: `test2@example.com`
- [ ] Enter password: `weak` (less than 8 chars)
- [ ] Enter firstName: `John`
- [ ] Enter lastName: `Doe`
- [ ] Click **Crear Cuenta**
- [ ] Verify: Error message appears
- [ ] Verify: Error mentions password requirements

**Test Case 4: Missing Required Fields**
- [ ] Leave firstName empty
- [ ] Fill other fields
- [ ] Click **Crear Cuenta**
- [ ] Verify: Error message appears
- [ ] Verify: Does NOT navigate away

**Test Case 5: Duplicate Email**
- [ ] Use same email as Test Case 1: `test1@example.com`
- [ ] Fill all other fields with new values
- [ ] Click **Crear Cuenta**
- [ ] Verify: Error message appears: "El correo electrónico ya está registrado"
- [ ] Verify: Does NOT navigate away

---

## Final Checklist

- [ ] All 5 input elements created and named
- [ ] All 3 custom states created
- [ ] All 3 UI message elements created
- [ ] Register button created
- [ ] Navigation link created
- [ ] API call RegisterUserStep1 tested and working
- [ ] Main workflow created with all 10 actions
- [ ] Input validation implemented
- [ ] Test Case 1 passed (valid registration)
- [ ] Test Case 2 passed (invalid email)
- [ ] Test Case 3 passed (weak password)
- [ ] Test Case 4 passed (missing fields)
- [ ] Test Case 5 passed (duplicate email)
- [ ] Page is ready for signup-verify-email page

---

## Expected Result

When user clicks **Crear Cuenta** with valid data:

1. ✅ Loading spinner appears
2. ✅ API call is made to `/registration/register-step-1`
3. ✅ Success message displays: "¡Cuenta creada! Verifica tu correo electrónico: [email]"
4. ✅ Page states are populated:
   - `current_user_id` = "nd7a2dyzskxa97mjthe4endts7t6gvx"
   - `current_email` = "user@example.com"
   - `registration_token` = "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr"
5. ✅ After 2 seconds, redirects to `signup-verify-email` page
6. ✅ next-step page has access to page states

**Time to Complete**: ~15 minutes
**Difficulty**: Easy (mostly drag-and-drop)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API call fails with "Connection refused" | Verify Convex deployment URL is correct |
| API returns "email already registered" | Use a new email address not in the system |
| Workflow doesn't trigger | Make sure `register_button` is named correctly |
| States not persisting to next page | Verify custom states are created at page level (not element level) |
| Loading spinner doesn't appear | Check if element is visible and not hidden behind other elements |
| Navigation doesn't work | Verify `signup-verify-email` page exists and name matches exactly |

---

**Next Step**: Follow [IMPLEMENTATION-CHECKLIST-STEP-2.md](./IMPLEMENTATION-CHECKLIST-STEP-2.md) to build the email verification page.
