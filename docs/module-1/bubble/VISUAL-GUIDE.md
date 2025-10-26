# Visual Guide: Private Parameters in Bubble

**See what "Private" really means with visual examples**

---

## The Core Concept

```
┌──────────────────────────────────────────────────────────────┐
│                    YOUR BUBBLE FORM                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Email Input:      [juan@example.com]                       │
│                             ↓                                │
│  API Call Body:    { "email": "<email>" }                   │
│                             ↓                                │
│  Question: Is <email> private or not?                       │
│                             ↓                                │
│  ✓ YES! Uncheck "Private" ☐                                │
│  Because the value comes from the Input field              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Example 1: Static Value (KEEP PRIVATE ✓)

```
SCENARIO: Country is always Colombia

┌─ Body ──────────────────────────┐
│ {                               │
│   "country": "CO"  ← NO PLACEHOLDER
│ }                               │
└─────────────────────────────────┘
     ↓
     Bubble creates NO parameter
     (because there's no <placeholder>)

     OR if you manually write: "country": "<country>"

     ↓
┌─ Parameters ─────────────────────┐
│ country        Private ✓          │ ← KEEP CHECKED
│                                  │
│ Why? It's always "CO"           │
│ No need for it to change         │
└──────────────────────────────────┘
     ↓
┌─ API Call ───────────────────────┐
│ { "country": "CO" }             │
│ Always sends "CO"                │
│ Never changes                    │
└──────────────────────────────────┘
```

---

## Example 2: Dynamic Value (UNCHECK PRIVATE ☐)

```
SCENARIO: Department changes based on user selection

┌─ Dropdown ───────────────────────┐
│ Which Department?               │
│ [Antioquia ▼]                  │
│                                 │
│ User can change this            │
└─────────────────────────────────┘
     ↓
┌─ Body ──────────────────────────┐
│ {                               │
│   "departmentCode": "<departmentCode>"  ← PLACEHOLDER!
│ }                               │
└─────────────────────────────────┘
     ↓
     Bubble detects <departmentCode>
     Creates a parameter

     ↓
┌─ Parameters ─────────────────────┐
│ departmentCode  Private ✓         │ ← UNCHECK THIS ☐
│                                  │
│ Why? Value comes from dropdown   │
│ Changes when user selects        │
└──────────────────────────────────┘
     ↓
┌─ Workflow ───────────────────────┐
│ When Department Dropdown changes:│
│   Call API: Get Municipalities  │
│   Param: departmentCode = ┌──────┴──────────────┐
│                           │ Dropdown's value    │
│                           │ (changes dynamically)
│                           └─────────────────────┘
└─────────────────────────────────┘
     ↓
┌─ API Call (Dynamic) ─────────────┐
│ If user selects "Antioquia":     │
│ { "departmentCode": "05" }       │
│                                  │
│ If user selects "Bogotá":        │
│ { "departmentCode": "11" }       │
│                                  │
│ Value CHANGES based on dropdown  │
└──────────────────────────────────┘
```

---

## Side-by-Side Comparison

### Private ✓ (Hardcoded)

```
Body:
{ "country": "CO" }
        ↓
Private ✓ (CHECKED)
        ↓
Result:
Always sends "CO"
Never changes
```

### Not Private ☐ (Dynamic)

```
Body:
{ "departmentCode": "<departmentCode>" }
        ↓
Private ☐ (UNCHECKED)
        ↓
Result:
Sends value from dropdown
Changes with user input
```

---

## Complete Registration Form Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BUBBLE FORM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Email Input]           ← email = "<email>"              │
│ [Password Input]        ← password = "<password>"        │
│ [First Name Input]      ← firstName = "<firstName>"      │
│ [Last Name Input]       ← lastName = "<lastName>"        │
│ [Phone Input]           ← phone = "<phone>"              │
│ [Company Name Input]    ← companyName = "<companyName>"  │
│ [Business Type DD]      ← businessEntityType = "..."     │
│ [Company Type DD]       ← companyType = "..."            │
│ [Department DD]         ← departmentCode = "..."         │
│ [Municipality DD]       ← municipalityCode = "..."        │
│                                                             │
│                  [Register Button]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              API CALL: Register User                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Body:                                                      │
│ {                                                         │
│   "email":                 "<email>"      ☐ NOT Private  │
│   "password":              "<password>"   ☐ NOT Private  │
│   "firstName":             "<firstName>"  ☐ NOT Private  │
│   "lastName":              "<lastName>"   ☐ NOT Private  │
│   "phone":                 "<phone>"      ☐ NOT Private  │
│   "companyName":           "<companyName>" ☐ NOT Private │
│   "businessEntityType":    "<businessEntityType>" ☐       │
│   "companyType":           "<companyType>" ☐ NOT Private  │
│   "country":               "CO"           ✓ IS Private   │
│   "departmentCode":        "<departmentCode>" ☐           │
│   "municipalityCode":      "<municipalityCode>" ☐         │
│ }                                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONVEX API                                 │
├─────────────────────────────────────────────────────────────┤
│ Creates user and company                                   │
│ Returns: { success: true, userId: "..." }                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUCCESS                                  │
│ Navigate to email verification page                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Parameter Decision Tree

```
                    START: Create API Call
                            ↓
                 Does the body have "<parameter>"?
                    ↙                    ↘
                  YES                    NO
                   ↓                      ↓
         Bubble detects parameter   No parameter created
                   ↓                 (stays hardcoded)
         Question: Will this value
         CHANGE based on user input?
                   ↙                    ↘
                  YES                    NO
                   ↓                      ↓
         UNCHECK Private ☐         KEEP Private ✓
         (Dynamic parameter)       (Hardcoded value)
                   ↓                      ↓
         Value comes from:        Value is fixed:
         - Input field            - "CO" (country)
         - Dropdown               - "cannabis" (hardcoded type)
         - Text variable          - User ID (if known)
                   ↓                      ↓
         Later in workflow:        Not visible in workflow
         Map to form element       (auto-filled always)
```

---

## Real Workflow Example

### Step 1: User Fills Form

```
Email Field:              juan.perez@example.com
Password Field:           SecurePass123
First Name:               Juan
Last Name:                Pérez
Phone:                    3001234567
Company Name:             Cultivos San José S.A.S
Business Type Dropdown:   S.A.S
Company Type Dropdown:    Cannabis
Department Dropdown:      Antioquia (Code: 05)
Municipality Dropdown:    Medellín (Code: 05001)
```

### Step 2: Bubble Collects Values

```
Collected:
{
  email: "juan.perez@example.com",
  password: "SecurePass123",
  firstName: "Juan",
  lastName: "Pérez",
  phone: "3001234567",
  companyName: "Cultivos San José S.A.S",
  businessEntityType: "S.A.S",
  companyType: "Cannabis",
  departmentCode: "05",
  municipalityCode: "05001"
}
```

### Step 3: API Call is Made

```
Convex API receives:
{
  email: "juan.perez@example.com",        ← From form
  password: "SecurePass123",              ← From form
  firstName: "Juan",                      ← From form
  lastName: "Pérez",                      ← From form
  phone: "3001234567",                    ← From form
  companyName: "Cultivos San José S.A.S", ← From form
  businessEntityType: "S.A.S",            ← From form
  companyType: "Cannabis",                ← From form
  country: "CO",                          ← HARDCODED (Private)
  departmentCode: "05",                   ← From form
  municipalityCode: "05001"               ← From form
}
```

### Step 4: Success!

```
Response:
{
  success: true,
  userId: "n979dmyw6zpsnj6z53qjq54d617t69y7",
  companyId: "jn79432h62ykanqj0w7gfjhn157t6mt8",
  message: "Registro exitoso..."
}

Next: Navigate to email verification
```

---

## The Bottom Line

| Situation | Example | Action |
|-----------|---------|--------|
| Value in body is `"CO"` | `"country": "CO"` | ✓ Keep Private |
| Value in body is `"<parameter>"` but never changes | `"country": "<country>"` but always CO | ✓ Keep Private |
| Value in body is `"<parameter>"` and DOES change | `"departmentCode": "<departmentCode>"` | ☐ Uncheck Private |
| Value comes from form input | `"email": "<email>"` from Email Input | ☐ Uncheck Private |
| Value is selected from dropdown | `"companyType": "<companyType>"` from DD | ☐ Uncheck Private |

---

## Checklist: Get It Right

When configuring ANY API parameter:

- [ ] Does it have a placeholder `<parameterName>`?
  - **NO** → It's already hardcoded, don't worry
  - **YES** → Continue...

- [ ] Will this value ever need to be different?
  - **NO** (always same value) → Keep Private ✓
  - **YES** (changes with user input) → Uncheck Private ☐

- [ ] Test with Initialize button
  - [ ] Got data back? Good!
  - [ ] Error? Check the parameter configuration

---

## Remember

```
┌─────────────────────────────────┐
│  PRIVATE = HARDCODED            │
│  NOT PRIVATE = FROM YOUR FORM   │
└─────────────────────────────────┘

THAT'S IT! Everything else follows.
```
