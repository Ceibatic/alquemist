# Signup Step 2 - Email Verification Implementation Checklist
## Build the Email Verification Page in Bubble (15 minutes)

---

## Page Setup
- [ ] Create new page named: `signup-verify-email`
- [ ] Set page type: `Standard`
- [ ] Set page layout: `Column container`

---

## Step 1: Create Custom States (4 states)

### State 1: verification_code
```
Name: verification_code
Type: Text
Expose: No
```

### State 2: verification_error
```
Name: verification_error
Type: Text
Expose: No
```

### State 3: verification_complete
```
Name: verification_complete
Type: Yes/No
Expose: No
Initial: No
```

### State 4: can_resend
```
Name: can_resend
Type: Yes/No
Expose: No
Initial: Yes
```

**Checklist**:
- [ ] Go to **Page settings** → **App data**
- [ ] Create state: `verification_code` (Type: Text)
- [ ] Create state: `verification_error` (Type: Text)
- [ ] Create state: `verification_complete` (Type: Yes/No, Initial: No)
- [ ] Create state: `can_resend` (Type: Yes/No, Initial: Yes)

---

## Step 2: Create Text Elements (5 elements)

### Element 1: page_title
```
Element Type: Text
Text: "Verificar Correo Electrónico"
Font size: 32px
Font weight: Bold
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `page_title`
- [ ] Set text: `Verificar Correo Electrónico`
- [ ] Set font size: 32px
- [ ] Set font weight: Bold

### Element 2: instructions_text
```
Element Type: Text
Text: "Hemos enviado un código de verificación a: [email]"
Font size: 16px
Color: Gray
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `instructions_text`
- [ ] Set text: "Hemos enviado un código de verificación a: " + GetPageData(signup-step-1).current_email
- [ ] Set font size: 16px
- [ ] Set color: Gray

### Element 3: error_message
```
Element Type: Text
Text: "Error message will appear here"
Font size: 14px
Text color: Red (#FF0000)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `error_message`
- [ ] Set initial text: "Error"
- [ ] Set text color: Red
- [ ] Set visibility to: Hidden

### Element 4: success_message
```
Element Type: Text
Text: "¡Email verificado correctamente!"
Font size: 14px
Text color: Green (#00AA00)
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `success_message`
- [ ] Set initial text: "Success"
- [ ] Set text color: Green
- [ ] Set visibility to: Hidden

### Element 5: resend_status
```
Element Type: Text
Text: "Puedes reenviar el código en X segundos"
Font size: 12px
Color: Orange
Visible: Unchecked (hidden by default)
```
**Checklist**:
- [ ] Drag **Text** element to canvas
- [ ] Name it: `resend_status`
- [ ] Set initial text: "Resend available"
- [ ] Set color: Orange
- [ ] Set visibility to: Hidden

---

## Step 3: Create Input Elements (1 input)

### Input 1: verification_code_input
```
Element Type: Input
Placeholder: "Ingresa el código de 32 caracteres"
Input type: Text
Max length: 32
```
**Checklist**:
- [ ] Drag **Input** element to canvas
- [ ] Name it: `verification_code_input`
- [ ] Set Placeholder: `Ingresa el código de 32 caracteres`
- [ ] Set Max length: `32`

---

## Step 4: Create Buttons (3 buttons)

### Button 1: verify_button
```
Element Type: Button
Text: "Verificar Código"
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `verify_button`
- [ ] Set button text: `Verificar Código`

### Button 2: resend_button
```
Element Type: Button
Text: "Reenviar Código"
Enabled: Unchecked initially (will enable after cooldown)
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `resend_button`
- [ ] Set button text: `Reenviar Código`
- [ ] Set initial state to: Disabled

### Button 3: back_button
```
Element Type: Button
Text: "Volver Atrás"
```
**Checklist**:
- [ ] Drag **Button** element to canvas
- [ ] Name it: `back_button`
- [ ] Set button text: `Volver Atrás`

---

## Step 5: Create Page Loading (On Page Load)

### Workflow: Initialize Page

**Trigger**: Page loads

#### Action 1: Set resend_button to Enabled
```
Action Type: Element → Enable
Element: resend_button
```

#### Action 2: Log current email for debugging
```
Action Type: JavaScript/Console Log
Log: "Verification page loaded for: " + GetPageData(signup-step-1).current_email
```

**Checklist**:
- [ ] Go to **Page settings** → Workflows
- [ ] Add workflow: **On page load**
- [ ] Add action: Element → Enable → resend_button
- [ ] Test: Page loads without errors

---

## Step 6: Create Main Verification Workflow

### Workflow: verify_email_token

**Trigger**: Click on `verify_button`

#### Action 1: Validate Input
```
Condition: verification_code_input value is empty

If true:
  Action: Element → Show
  Element: error_message

  Action: Set text
  Element: error_message
  Text: "Por favor ingresa el código de verificación"

  STOP workflow (don't continue)
```

#### Action 2: Show Loading
```
Action Type: Element → Disable
Element: verify_button

Action Type: Element → Show
Element: loading_spinner (if you have one, else skip)
```

#### Action 3: Make API Call
```
Action Type: Plugin → API Connector
Call: VerifyEmailToken

Parameters:
  token: verification_code_input value
```

#### Action 4: On Success
```
Trigger: When VerifyEmailToken completes successfully

Actions:
  1. Set custom state
     State: verification_complete
     Value: Yes

  2. Show success message
     Action: Element → Show
     Element: success_message

  3. Clear input
     Action: Element → Clear
     Element: verification_code_input

  4. Disable verify button
     Action: Element → Disable
     Element: verify_button

  5. Hide error message
     Action: Element → Hide
     Element: error_message

  6. Navigate after 2 seconds
     Action: Wait 2 seconds
     Action: Navigate to page: signup-step-2
```

#### Action 5: On Error
```
Trigger: When VerifyEmailToken returns error

Actions:
  1. Show error message
     Action: Element → Show
     Element: error_message

  2. Set error text
     Action: Element → Set text
     Element: error_message
     Text: VerifyEmailToken.data.body.error

  3. Enable verify button
     Action: Element → Enable
     Element: verify_button

  4. Hide success message
     Action: Element → Hide
     Element: success_message
```

**Workflow Checklist**:
- [ ] Right-click on `verify_button`
- [ ] Select **Start/Edit workflow**
- [ ] Add validation step (check if input is not empty)
- [ ] Add action: Element → Disable → verify_button
- [ ] Add action: Plugin → API Connector → VerifyEmailToken
- [ ] Add success handler:
  - [ ] Set state: verification_complete = Yes
  - [ ] Show success_message
  - [ ] Clear verification_code_input
  - [ ] Disable verify_button
  - [ ] Hide error_message
  - [ ] Wait 2 seconds
  - [ ] Navigate to signup-step-2
- [ ] Add error handler:
  - [ ] Show error_message
  - [ ] Set error text
  - [ ] Enable verify_button
  - [ ] Hide success_message

---

## Step 7: Create Resend Email Workflow

### Workflow: resend_email_token

**Trigger**: Click on `resend_button`

#### Action 1: Disable Resend Button & Start Cooldown
```
Action Type: Element → Disable
Element: resend_button

Action Type: Element → Show
Element: resend_status

Action Type: Element → Set text
Element: resend_status
Text: "Esperando 5 minutos para reenviar... (300 segundos)"
```

#### Action 2: Get Current Email from Previous Page State
```
Note: Use the email stored in signup-step-1 page state
Get value: GetPageData(signup-step-1).current_email
```

#### Action 3: Make API Call
```
Action Type: Plugin → API Connector
Call: ResendVerificationEmail

Parameters:
  email: GetPageData(signup-step-1).current_email
```

#### Action 4: On Success
```
Trigger: When ResendVerificationEmail completes successfully

Actions:
  1. Update resend_status
     Text: "Nuevo código enviado. Revisa tu correo."

  2. Show success message (briefly)
     Action: Element → Show
     Element: success_message
     Text: "¡Código reenviado! Revisa tu correo."

  3. Hide success message after 3 seconds
     Action: Wait 3 seconds
     Action: Element → Hide
     Element: success_message
```

#### Action 5: Start 5-Minute Countdown Timer
```
Action Type: Set custom state
State: resend_cooldown_seconds
Value: 300 (5 minutes in seconds)

Then create a repeating workflow that:
  - Decrements resend_cooldown_seconds every 1 second
  - Updates resend_status text: "Puedes reenviar en X segundos"
  - When resend_cooldown_seconds reaches 0:
    - Enable resend_button
    - Hide resend_status
    - Stop countdown
```

#### Action 6: On Error
```
Trigger: When ResendVerificationEmail returns error

Actions:
  1. Show error message
     Element: error_message
     Text: ResendVerificationEmail.data.body.error

  2. Enable resend_button (try again)
     Action: Element → Enable
     Element: resend_button

  3. Hide resend_status
     Action: Element → Hide
     Element: resend_status
```

**Workflow Checklist**:
- [ ] Right-click on `resend_button`
- [ ] Select **Start/Edit workflow**
- [ ] Add action: Element → Disable → resend_button
- [ ] Add action: Element → Show → resend_status
- [ ] Add action: Plugin → API Connector → ResendVerificationEmail
- [ ] Add success handler:
  - [ ] Update resend_status text
  - [ ] Show success_message briefly
  - [ ] Start 5-minute cooldown
- [ ] Add error handler:
  - [ ] Show error_message
  - [ ] Enable resend_button

---

## Step 8: Create Back Button Workflow

### Workflow: go_back

**Trigger**: Click on `back_button`

#### Action 1: Navigate Back
```
Action Type: Navigate
Destination: Page `signup-step-1`
```

**Workflow Checklist**:
- [ ] Right-click on `back_button`
- [ ] Select **Start/Edit workflow**
- [ ] Add action: Navigate → signup-step-1

---

## Step 9: Configure Resend Button Cooldown (Advanced)

**Option 1: Simple (Disabled for 5 minutes)**
- [ ] Create a workflow that runs when ResendVerificationEmail succeeds
- [ ] Disable the resend_button
- [ ] Wait 300 seconds (5 minutes)
- [ ] Enable the resend_button

**Option 2: Visual Countdown (Shows seconds remaining)**
- [ ] Create custom state: `resend_cooldown_seconds` (Type: Number)
- [ ] When ResendVerificationEmail succeeds:
  - [ ] Set resend_cooldown_seconds = 300
  - [ ] Start repeating workflow every 1 second:
    - [ ] If resend_cooldown_seconds > 0:
      - [ ] Update resend_status text: "Reenviar en " + resend_cooldown_seconds + " segundos"
      - [ ] Decrement resend_cooldown_seconds by 1
    - [ ] Else (resend_cooldown_seconds = 0):
      - [ ] Enable resend_button
      - [ ] Hide resend_status
      - [ ] Stop repeating

**Recommended**: Option 2 (better UX)

**Checklist**:
- [ ] Create custom state: `resend_cooldown_seconds` (Type: Number)
- [ ] Add workflow for cooldown countdown
- [ ] Update resend_status text dynamically
- [ ] Enable button when countdown reaches 0

---

## Step 10: Create API Call (If Not Already Done)

### API Call: ResendVerificationEmail
**Verify it exists in API Connector**:

- [ ] Go to **Plugins** → **API Connector**
- [ ] Create or verify: `ResendVerificationEmail`
- [ ] Set URL: `https://[your-deployment].convex.site/registration/resend-email`
- [ ] Set Method: `POST`
- [ ] Set Body:
  ```json
  {
    "email": "<email>"
  }
  ```
- [ ] Click **Test** to verify it works

---

## Step 11: Testing

**Test Case 1: Valid Code Verification**
- [ ] On signup-step-1: Register with email `test-verify@example.com`
- [ ] Redirects to signup-verify-email page
- [ ] Page shows: "Hemos enviado un código de verificación a: test-verify@example.com"
- [ ] In Convex dashboard, find the verification token for that email
- [ ] Enter the token in `verification_code_input`
- [ ] Click **Verificar Código**
- [ ] Verify: Success message appears: "¡Email verificado correctamente!"
- [ ] Verify: Page redirects to signup-step-2 after 2 seconds

**Test Case 2: Invalid Code**
- [ ] Enter an invalid code: `InvalidCode123456789`
- [ ] Click **Verificar Código**
- [ ] Verify: Error message appears: "Token no válido o expirado"
- [ ] Verify: Does NOT navigate away
- [ ] Verify: Verify button is enabled for retry

**Test Case 3: Empty Input**
- [ ] Leave `verification_code_input` empty
- [ ] Click **Verificar Código**
- [ ] Verify: Error message appears: "Por favor ingresa el código de verificación"
- [ ] Verify: Does NOT make API call

**Test Case 4: Resend Code**
- [ ] On email verification page
- [ ] Click **Reenviar Código**
- [ ] Verify: Success message: "¡Código reenviado! Revisa tu correo."
- [ ] Verify: Resend button is disabled
- [ ] Verify: Countdown shows: "Reenviar en 300 segundos"
- [ ] Verify: Countdown decrements (observe for a few seconds)
- [ ] Verify: After 5 minutes, button is enabled again
- [ ] (For testing: you can set cooldown to 10 seconds instead of 300)

**Test Case 5: Back Button**
- [ ] On email verification page
- [ ] Click **Volver Atrás**
- [ ] Verify: Navigates back to signup-step-1 page
- [ ] Verify: Page state is preserved

**Test Case 6: Expired Token**
- [ ] Wait for token to expire (24 hours, or artificially set to 1 second for testing)
- [ ] Try to verify
- [ ] Verify: Error message: "Token expirado. Solicita uno nuevo."
- [ ] Verify: Suggest user to click resend

---

## Final Checklist

- [ ] Page created: `signup-verify-email`
- [ ] All 4 custom states created
- [ ] All 5 text elements created
- [ ] Input element created: verification_code_input
- [ ] All 3 buttons created
- [ ] Page initialization workflow created
- [ ] Main verification workflow created with success/error handlers
- [ ] Resend email workflow created
- [ ] Back button workflow created
- [ ] API calls created: VerifyEmailToken, ResendVerificationEmail
- [ ] Resend button cooldown implemented
- [ ] All 6 test cases passed
- [ ] Page is ready for signup-step-2 page

---

## Expected Result

### After Valid Verification:
1. ✅ User enters correct token
2. ✅ API call succeeds
3. ✅ Success message displays
4. ✅ Page redirects to `signup-step-2` after 2 seconds
5. ✅ Previous page state (userId, email, token) is accessible to next page

### Resend Functionality:
1. ✅ User clicks "Reenviar Código"
2. ✅ New token is sent to email
3. ✅ Button shows countdown: "Reenviar en 300 segundos"
4. ✅ After 5 minutes, button is enabled again
5. ✅ User can attempt verification again with new token

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API call fails with "Token not found" | Verify token is copied correctly from email/console |
| API returns "Token already used" | Use a newly generated token, or click Resend |
| Resend button doesn't countdown | Verify `resend_cooldown_seconds` state is created |
| Can't navigate to previous page | Verify `signup-step-1` page exists and name matches |
| Instructions don't show email | Verify GetPageData(signup-step-1).current_email syntax is correct |
| Page loads with errors | Check page state references to previous page |

---

**Next Step**: Follow [IMPLEMENTATION-CHECKLIST-STEP-3.md](./IMPLEMENTATION-CHECKLIST-STEP-3.md) to build the company registration page.
