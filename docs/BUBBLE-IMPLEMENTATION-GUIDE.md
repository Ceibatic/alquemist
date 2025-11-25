# Bubble.io Implementation Guidelines

**Instructions for implementing Convex backend features in Bubble.io frontend**

---

## Core Principles

### 1. **Don't Assume Functionality**
- Only document features that actually exist in the backend
- Test API endpoints before documenting them
- Verify response structure matches documentation
- Don't add custom states or workflows "just in case"

### 2. **Keep It Simple**
- Use URL parameters to pass data between pages (not custom states)
- Let Bubble's built-in features work automatically (dropdowns, data sources)
- Only add workflows when absolutely necessary
- Don't create state management when Bubble handles it natively

### 3. **Clear and Concise**
- Show actual Bubble syntax (e.g., "dropdown_department's value")
- Use real API responses in examples
- Step-by-step instructions, not conceptual explanations
- Tables for element lists, code blocks for API calls

---

## Implementation Pattern

### Step 1: Verify Backend First
```bash
# Test the API endpoint exists and works
curl -X POST https://your-api.convex.site/endpoint \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'

# Verify response structure
# Document actual response, not assumed response
```

### Step 2: API Connector Setup

**Always:**
- Name API calls clearly (e.g., `RegisterUser`, not `API Call 1`)
- Set "Use as": `Action` for mutations, `Data` for queries
- Mark static parameters as "Private" (checked)
- Leave dynamic parameters unchecked
- Initialize each call with test data

**Example:**
```
Name: GetDepartments
Use as: Data
Method: POST
URL: https://your-api.convex.site/geographic/departments

Body:
{
  "countryCode": "CO"
}

Parameters:
- countryCode: ✅ Private (always "CO")
```

### Step 3: Page Structure

**Element Naming Convention:**
- Inputs: `input_fieldName` (e.g., `input_email`, `input_companyName`)
- Buttons: `btn_action` (e.g., `btn_register`, `btn_verify`)
- Dropdowns: `dropdown_fieldName` (e.g., `dropdown_department`)
- Text (error): `text_error`
- Text (success): `text_success`
- Text (static): `title`, `subtitle`

**Custom States - Only When Needed:**
```
❌ DON'T: Create states for API response data
   (Use URL parameters to pass between pages)

❌ DON'T: Create states for dropdown values
   (Use dropdown_name's value directly)

✅ DO: Create states for UI-only behavior
   (e.g., isLoading, showModal)

✅ DO: Create states when data needs transformation
   (e.g., calculated fields not from API)
```

### Step 4: Workflows

**Validation Pattern:**
```
Step 1: Validate inputs
  Condition: input_field is empty
  Action: Show text_error, set text, stop workflow

Step 2: Call API
  Action: Plugins → YourAPI - ActionName
  Parameters: input_field's value

Step 3: Handle Success
  Only when: APICall's success is "yes"
  Action 1: Show text_success
  Action 2: Navigate to next page
    Send parameters: data from API response

Step 4: Handle Error
  Only when: APICall's success is "no"
  Action: Show text_error, set text from APICall's error
```

**Data Passing Pattern:**
```
Page 1 (Create data):
  Navigate to Page 2
    Send parameters:
      userId = RegisterUser's userId
      email = RegisterUser's email

Page 2 (Use data):
  Get data from page URL parameter 'userId'
  Get data from page URL parameter 'email'
```

**Dropdown Pattern:**
```
Dropdown Configuration:
  - Choices style: Dynamic choices
  - Type: Get data from external API
  - Data source: YourAPICall
  - Option caption: field_name (display text)
  - Option value: field_code (value to use)

Dependent Dropdown:
  - Same as above, plus:
  - Parameters: parentDropdown's value

No workflow needed - Bubble handles automatically!
```

---

## Common Patterns

### Pattern 1: Registration Flow
```
Page 1: Collect Data → Call API → Navigate with response data
Page 2: Use URL params → Call API → Navigate with response data
Page 3: Use URL params → Call API → Show success
```

### Pattern 2: Form with Dropdowns
```
Page Load: Dropdowns auto-load from API (configured in element)
User selects: Dependent dropdowns auto-reload
Submit: Use dropdown_name's value directly in API call
```

### Pattern 3: Multi-Step Form
```
Navigation:
  Navigate to page next_page
    Send parameters:
      field1 = APIResponse's field1
      field2 = input_field's value

Receiving page:
  Use: Get field1 from page URL
  Use: Get field2 from page URL
```

---

## Checklist for New Feature Implementation

### Before Writing Guide:
- [ ] Test all API endpoints with curl/Postman
- [ ] Document actual request/response (copy real JSON)
- [ ] Verify all validations and error messages
- [ ] Check which data needs to persist across pages
- [ ] Identify which dropdowns depend on others

### While Writing Guide:
- [ ] API Reference section with real examples
- [ ] Clear element naming conventions
- [ ] Minimal custom states (justify each one)
- [ ] Workflows show exact Bubble syntax
- [ ] Parameter passing clearly documented

### After Writing Guide:
- [ ] Review: Can someone follow without confusion?
- [ ] Remove assumptions (is everything tested?)
- [ ] Remove redundancy (is anything repeated?)
- [ ] Add troubleshooting for common errors
- [ ] Include API test commands

---

## What NOT to Do

### ❌ Bad Practices:

**1. Excessive Custom States**
```
❌ Page state: userId (text)
❌ Page state: userEmail (text)
❌ Page state: userPassword (text)

✅ Just pass via URL parameters
```

**2. Unnecessary Workflows**
```
❌ Workflow: When dropdown loads, set state
    (Dropdown automatically loads!)

✅ Only add workflow if you need to transform data
```

**3. Assumed Features**
```
❌ "The API will return sessionToken"
    (When it doesn't exist yet)

✅ "The API returns: { success, userId, email }"
    (Based on actual testing)
```

**4. Complex State Management**
```
❌ Store everything in states, sync between pages

✅ Pass data forward via URL parameters
```

**5. Vague Instructions**
```
❌ "Configure the dropdown to load departments"

✅ "Dropdown configuration:
    - Data source: GetDepartments
    - Option caption: division_1_name
    - Option value: division_1_code"
```

---

## Testing Pattern

### For Every Feature:

**1. Test Backend First**
```bash
# Test happy path
curl -X POST endpoint -d '{"valid": "data"}'

# Test error cases
curl -X POST endpoint -d '{"invalid": "data"}'
curl -X POST endpoint -d '{}'
```

**2. Document Both Paths**
```json
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": "El correo ya está registrado"
}
```

**3. Test in Bubble**
```
1. Initialize API call with test data
2. Check response structure in debugger
3. Test workflow with real inputs
4. Test error scenarios (empty fields, invalid data)
5. Test navigation and parameter passing
```

---

## Documentation Structure

### For Each Module:

```markdown
## What You'll Build
- Brief overview (2-3 sentences)
- List of pages/features

## Prerequisites
- Checklist with exact commands
- API base URL

## API Reference
- All endpoints upfront
- Real request/response examples
- Validations listed

## Part 1: API Connector Setup
- Install plugin
- Configure base API
- Create each API call

## Part 2: Build Pages
- Element tables
- Custom states (only if needed)
- Dropdown configuration

## Part 3: Build Workflows
- Step-by-step with exact Bubble syntax
- Show conditions clearly
- Parameter passing explained

## Part 4: Testing
- Test each step
- Expected outcomes
- Common errors

## Troubleshooting
- Specific error messages
- How to fix each one
```

---

## Real-World Example

### ✅ Good Documentation:

```markdown
### Workflow: Register User

Event: When btn_register is clicked

Step 1: Call API
  Action: Plugins → Convex - RegisterUser
  Parameters:
    email = input_email's value
    password = input_password's value

Step 2: Handle Success
  Only when: RegisterUser's success is "yes"
  Action: Navigate to signup-step-2
    Send parameters:
      userId = RegisterUser's userId
      email = RegisterUser's email
```

### ❌ Bad Documentation:

```markdown
### Workflow: Register User

1. Add a workflow when the button is clicked
2. Call the register API
3. Save the user information in custom states
4. Navigate to the next page passing all the data
5. Make sure to handle errors appropriately
```

---

## Key Takeaways

1. **Test First, Document Second** - Never assume API behavior
2. **URL Parameters > Custom States** - Pass data forward, not store everywhere
3. **Let Bubble Work** - Don't add workflows for built-in features
4. **Real Syntax** - Show exact Bubble expressions and conditions
5. **Justify Everything** - If adding a state/workflow, explain why it's needed

---

**Last Updated:** Updated for native email sending (Nov 2025)
**Applies To:** All future Bubble.io guides for this project

---

## Email Sending Architecture (Native Bubble)

### Migration from Resend to Bubble Native (Nov 2025)

**Background**: Previously, the Convex backend made HTTP calls to Resend API to send emails. This created an external dependency and complexity. Now, Bubble's native "Send Email" action handles all email delivery.

### How It Works Now

```
1. User Registration
   └─> Convex creates token + generates HTML
       └─> Returns emailHtml, emailText, emailSubject
           └─> Bubble receives response
               └─> Sends email (Native Bubble Action)
                   └─> User receives email with verification link
```

### Implementing Email in Bubble

#### 1. Registration Workflow (After API Call Success)

**Step: Send Email (Native Bubble Action)**
```
Native Action: Send Email
├─ To: Result of [API_Step]'s email
├─ Subject: Result of [API_Step]'s emailSubject
├─ Body: Result of [API_Step]'s emailHtml
└─ Reply-to: support@ceibatic.com
```

#### 2. Email Configuration (Bubble Settings)

**Option A: Shared SendGrid (Free)**
- Already configured in Bubble
- Default sender: app@bubbleapps.io
- Max 50 recipients per email
- Shared IP reputation

**Option B: Custom SendGrid (Recommended for Production)**
1. Create SendGrid account
2. Verify your domain
3. In Bubble → Settings → Email:
   - Configure SendGrid API key
   - Set custom sender: noreply@yourdomain.com

#### 3. Email Customization

The backend generates HTML with inline CSS and Tailwind classes. To customize:
1. Modify `convex/email.ts` → `generateVerificationEmailHTML()`
2. Redeploy Convex
3. Bubble automatically uses new template on next registration

#### 4. Testing Email Sending

**In Bubble Preview:**
1. Go through registration flow
2. Check API response for `emailHtml`
3. Verify "Send Email" action shows "Email sent"
4. Check actual inbox for email delivery

**Common Issues:**
- Email not received: Check spam folder, verify domain reputation
- Wrong sender: Verify SendGrid configuration in Bubble Settings
- Malformed HTML: Check `emailHtml` in API response
- Subject not showing: Ensure `emailSubject` is in response

#### 5. Error Handling

Add error handling for email send failures:

```
Workflow Step: Send Email
├─ Success path: Show "Email sent" message
└─ Error path:
    ├─ Show error alert
    ├─ Offer "Resend Email" button
    └─ Call resendVerificationEmail endpoint
```

### Environment Setup

**No Additional Configuration Needed:**
- ❌ Don't need RESEND_API_KEY anymore
- ✅ Use Bubble's native email (free or with custom SendGrid)
- ✅ All email content comes from Convex API response

### Security Notes

- Email tokens are 32-character alphanumeric (secure)
- Tokens expire after 24 hours
- Tokens are one-time use
- Verification links include token + email as URL parameters
- HTTPS required for production (prevents token interception)
