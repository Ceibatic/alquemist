# Understanding "Private" Parameters in Bubble API Connector

**Quick Answer**: The "Private" checkbox determines if a parameter value is **hardcoded** or **dynamic**.

---

## Visual Guide

### The API Body (Same for All Calls)

When you create an API call in Bubble's API Connector, you provide a body:

```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

The `<departmentCode>` is a **placeholder** that tells Bubble "this value will change".

---

## How Bubble Detects Parameters

### Step 1: You Enter the Body

```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

### Step 2: Bubble Detects the Placeholder

Bubble scans for `<anything>` and automatically creates parameters:

```
Parameters:
├─ countryCode (value: "CO") ← No placeholder, stays as is
└─ departmentCode (detected from <departmentCode>)
```

### Step 3: You See a Parameters Section

```
┌─────────────────────────────────┐
│ Parameters                       │
│                                 │
│ countryCode         Private ✓   │ ← Checked = Hardcoded
│ departmentCode      Private ✓   │ ← Checked = Hardcoded
└─────────────────────────────────┘
```

### Step 4: You Uncheck "Private" for departmentCode

```
┌─────────────────────────────────┐
│ Parameters                       │
│                                 │
│ countryCode         Private ✓   │ ← Still checked (always CO)
│ departmentCode      Private ☐   │ ← Unchecked (now dynamic!)
└─────────────────────────────────┘
```

---

## Private vs Not Private: What's the Difference?

### Private (Checked) ✓

```
Meaning: This value is FIXED/HARDCODED

Example:
{
  "countryCode": "CO"    ← Always "CO", never changes
}

Use Case:
- Country is always Colombia in this app
- No need to let users change it
- Keep it private to simplify the workflow
```

### Not Private (Unchecked) ☐

```
Meaning: This value is DYNAMIC/CHANGEABLE

Example:
{
  "departmentCode": "<departmentCode>"    ← Changes based on user selection
}

The value comes from somewhere else in your Bubble app:
- From a form input
- From a dropdown selection
- From a button click parameter
- From custom state

Use Case:
- Different users select different departments
- Value changes based on user interaction
- Must be dynamic to be useful
```

---

## Real-World Example: Get Municipalities

### The Goal

User selects a department from dropdown → Load municipalities for that department

### Step 1: Create the API Call

**URL**: `POST https://[deployment].convex.site/geographic/municipalities`

**Body**:
```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

### Step 2: Configure Parameters in Bubble

After entering the body, you see:

```
Parameters:
├─ countryCode         Private ✓     (No placeholder = auto private)
└─ departmentCode      Private ✓     (Has placeholder = auto private)
```

### Step 3: Decide Which Are Dynamic

Think about your workflow:

- **countryCode**: Always "CO" → Keep Private ✓
- **departmentCode**: Changes when user selects department → **Uncheck** ☐

After unchecking:

```
Parameters:
├─ countryCode         Private ✓
└─ departmentCode      Private ☐     ← Now it's dynamic!
```

### Step 4: Test It

Click **Initialize call** and enter test values:

```
countryCode: CO
departmentCode: 05    (Antioquia)
```

Click Initialize → Should return departments for Antioquia ✓

### Step 5: Use It in Your Workflow

Later, when you build your form, you'll tell Bubble:

```
When "Dropdown Department" changes:
  ├─ Call "Get Municipalities" API
  │  ├─ Set departmentCode = Dropdown Department's value's division_1_code
  │  └─ Set countryCode = "CO"
  └─ Load response into "Dropdown Municipality"
```

The **Private** parameters don't appear in workflows (already hardcoded).
The **Not Private** parameters appear and you map them to form elements.

---

## Registration Form Example

### The API Body

```json
{
  "email": "<email>",
  "password": "<password>",
  "firstName": "<firstName>",
  "lastName": "<lastName>",
  "phone": "<phone>",
  "companyName": "<companyName>",
  "businessEntityType": "<businessEntityType>",
  "companyType": "<companyType>",
  "country": "CO",
  "departmentCode": "<departmentCode>",
  "municipalityCode": "<municipalityCode>"
}
```

### Parameters Configuration

**Keep Private (Checked) ✓:**
- `country` = Always "CO"

**Make Dynamic (Uncheck ☐):**
- `email` ← From: Input Email field
- `password` ← From: Input Password field
- `firstName` ← From: Input First Name field
- `lastName` ← From: Input Last Name field
- `phone` ← From: Input Phone field
- `companyName` ← From: Input Company Name field
- `businessEntityType` ← From: Dropdown Business Type
- `companyType` ← From: Dropdown Company Type
- `departmentCode` ← From: Dropdown Department
- `municipalityCode` ← From: Dropdown Municipality

### Workflow Mapping

When user clicks "Register":

```
Collect data from all form inputs:
  Email → From Input Email
  Password → From Input Password
  FirstName → From Input First Name
  ... (and so on for all fields)

Call "Register User" API with all the collected values

If successful:
  Show success message
  Navigate to next page

If error:
  Show error message
```

---

## Summary

| Aspect | Private ✓ | Not Private ☐ |
|--------|-----------|----------------|
| **Value** | Hardcoded in API call | Changes from workflow |
| **Example** | `"country": "CO"` | `"departmentCode": "<departmentCode>"` |
| **When to Use** | Fixed values that never change | Values that change based on user input |
| **In Workflows** | Not visible (auto-filled) | Must be mapped to form elements |
| **How to Set** | Leave checkbox **checked** | **Uncheck** the checkbox |

---

## Checklist for Your Registration Form

- [ ] **Get Departments API**
  - [ ] Body: `{"countryCode": "CO"}`
  - [ ] countryCode parameter: Private ✓
  - [ ] Initialize with: `"CO"`

- [ ] **Get Municipalities API**
  - [ ] Body: `{"countryCode": "CO", "departmentCode": "<departmentCode>"}`
  - [ ] countryCode parameter: Private ✓
  - [ ] departmentCode parameter: **Uncheck** ☐
  - [ ] Initialize with: departmentCode = `"05"`

- [ ] **Check Email API**
  - [ ] Body: `{"email": "<email>"}`
  - [ ] email parameter: **Uncheck** ☐
  - [ ] Initialize with: email = `"test@example.com"`

- [ ] **Register User API**
  - [ ] Body: All 10 parameters
  - [ ] country parameter: Private ✓
  - [ ] All others: **Uncheck** ☐
  - [ ] Initialize with test data

---

## Still Confused?

The key insight: **Private = Hardcoded, Not Private = From Your Form**

That's it! Everything else follows from that one concept.
