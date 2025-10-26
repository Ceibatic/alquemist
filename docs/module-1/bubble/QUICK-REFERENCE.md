# Quick Reference: Private Parameters

**TL;DR Version**

---

## The Confusing Part

When you set up an API call in Bubble, you see:

```
Body: {"departmentCode": "<departmentCode>"}

Parameters:
☐ departmentCode    Private [checkbox]
```

**What does "Private" mean?**

---

## Answer

| Status | Means | Example | When |
|--------|-------|---------|------|
| **✓ Checked** (Private) | **Hardcoded** - Never changes | `"country": "CO"` | Same for all users |
| **☐ Unchecked** (Not Private) | **Dynamic** - Changes from form | `"departmentCode"` | User selects it |

---

## For Your Registration Form

### API: Get Departments

```json
{"countryCode": "CO"}
```

- `countryCode` → **Keep Private ✓** (always CO)

---

### API: Get Municipalities

```json
{"countryCode": "CO", "departmentCode": "<departmentCode>"}
```

- `countryCode` → **Keep Private ✓** (always CO)
- `departmentCode` → **Uncheck ☐** (user selects)

---

### API: Register User

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

- `country` → **Keep Private ✓**
- **EVERYTHING ELSE** → **Uncheck ☐**

---

## In One Sentence

**Private = Fixed, Not Private = From User Input**

---

## Visual

```
┌─────────────────────────────────────────┐
│ Your Bubble Form                        │
├─────────────────────────────────────────┤
│ Email: [user@example.com]               │
│ Password: [••••••••]                    │
│ First Name: [Juan]                      │
│ Department: [Antioquia ▼]               │
│ Municipality: [Medellín ▼]              │
│                                         │
│ [Register Button]                       │
└─────────────────────────────────────────┘
              ↓
     (Collect all values)
              ↓
┌─────────────────────────────────────────┐
│ API Call: Register User                 │
├─────────────────────────────────────────┤
│ {                                       │
│   "email": "user@example.com",         │ ← NOT Private
│   "password": "••••••••",              │ ← NOT Private
│   "firstName": "Juan",                 │ ← NOT Private
│   "departmentCode": "05",              │ ← NOT Private
│   "country": "CO"                      │ ← IS Private
│ }                                       │
└─────────────────────────────────────────┘
              ↓
        Convex API
              ↓
        User Created! ✓
```

---

## 3-Step Process

### 1. **Create API Call** (Set the Body)

Example for Get Municipalities:

```json
{
  "countryCode": "CO",
  "departmentCode": "<departmentCode>"
}
```

### 2. **Bubble Detects Parameters Automatically**

Bubble sees `<departmentCode>` and creates a parameter for it.

### 3. **Configure Each Parameter**

For each parameter, ask: **"Will this change based on user input?"**

- YES → **Uncheck Private ☐**
- NO → **Keep Private ✓**

---

## Checklist

When setting up any API call:

- [ ] Is there a body with `<parameters>`?
- [ ] For each `<parameter>`, uncheck "Private" ☐
- [ ] For static values like `"country": "CO"`, keep "Private" ✓
- [ ] Test the call with Initialize button
- [ ] Later in workflows, map parameters to form inputs

---

## Real Examples

### ✓ Should be Private

```json
{
  "country": "CO"           ← Private (never changes)
}
```

### ☐ Should NOT be Private

```json
{
  "email": "<email>",       ← Not Private (user enters)
  "departmentCode": "<departmentCode>"  ← Not Private (user selects)
}
```

---

## Still Confused?

Read the full guide: [PARAMETER-GUIDE.md](PARAMETER-GUIDE.md)

Or TL;DR: **Private = Fixed, Not Private = From Form**
