# Bubble Developer Guide: Module 1 & 2 Implementation

**Status**: ✅ Backend Ready | 📚 Complete Documentation | 🚀 Ready to Build
**Date**: October 27, 2025
**Estimated Build Time**: 3-4 hours

---

## Quick Start: What You Need to Know

### The System
We're building a **3-step registration flow** in Bubble that connects to a Convex backend:

```
User Registration (Step 1)
    ↓ (Email Verification Code)
Email Verification (Step 2)
    ↓ (Confirmed)
Company Creation (Step 3)
    ↓ (Auto-login)
Dashboard (Logged In)
```

### Backend Is Ready
✅ All API endpoints are deployed and working
✅ Email service is configured (Resend)
✅ Authentication service is configured (Clerk)
✅ Geographic data is seeded (156 Colombian municipalities)

### Your Job
Build 3 Bubble pages + 5 API connectors + add workflows

---

## Step-by-Step Implementation

### Phase 1: Setup (15 minutes)

**Task 1.1: Add Environment Variables**
```bash
npx convex env set CLERK_SECRET_KEY sk_live_xxxxxxxxxxxx
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx
npx convex env set BUBBLE_APP_URL https://yourapp.bubbleapps.io
```

**Task 1.2: Verify Backend is Running**
- Visit: `https://exciting-shrimp-34.convex.site/health`
- Should see: `{"status":"ok","service":"Alquemist API"}`

**Task 1.3: Test Geographic Data**
- The database should have 32 Colombian departments + 156 municipalities
- If not, run: `npx convex run seedGeographic:seedColombianGeography`

---

### Phase 2: Build Bubble Pages (20 minutes)

**Create 3 Pages:**
1. `/signup-step-1` - User registration
2. `/signup-verify-email` - Email verification
3. `/signup-step-2` - Company creation

**For Each Page, Add:**
- Input fields
- Buttons
- Error/success message displays
- Custom states (see detailed guide)

> Full details: [bubble/Module-1-Bubble-Guide.md Part 5](./bubble/Module-1-Bubble-Guide.md#part-5-bubble-page-structure--elements)

---

### Phase 3: Setup API Connectors (15 minutes)

**Create 5 API Connectors in Bubble:**

1. **RegisterUserStep1** → `POST /registration/register-step-1`
2. **VerifyEmailToken** → `POST /registration/verify-email`
3. **RegisterCompanyStep2** → `POST /registration/register-step-2`
4. **GetDepartments** → `POST /geographic/departments`
5. **GetMunicipalities** → `POST /geographic/municipalities`

> Full details: [bubble/Module-1-Bubble-Guide.md Part 4](./bubble/Module-1-Bubble-Guide.md#part-4-create-5-api-connectors)

---

### Phase 4: Add Workflows (120 minutes)

**This is the main work.** You'll add workflows to handle user interactions.

**Key Workflows:**
1. Click register button → Validate → Call API → Handle response
2. Click verify button → Validate → Call API → Navigate
3. Select department → Fetch municipalities
4. Click create company → Call API → **Auto-login** → Navigate

> Full details: [bubble/Module-1-Bubble-Guide.md Part 7](./bubble/Module-1-Bubble-Guide.md#part-7-detailed-workflow-setup-in-bubble)

---

### Phase 5: Test Complete Flow (30 minutes)

**Happy Path Test:**
1. Go to `/signup-step-1`
2. Fill form → Click register
3. Verify success message + redirect
4. Get token from email (or page state)
5. Paste token on step 2 → Verify
6. Fill company form on step 3 → Create
7. Verify redirect to dashboard + logged in

---

## Critical Points You Must Understand

### ⚠️ Password Storage (CRITICAL)

**Problem**: Clerk needs the password on Step 3, but Step 1 form clears after submission.

**Solution**: Store password in a custom state on Step 1:
```javascript
registration_password (Text)
registration_first_name (Text)
registration_last_name (Text)
```

When RegisterUserStep1 succeeds, immediately set these states.
On Step 3, retrieve them using: `GetPageData(signup-step-1).registration_password`

> Why? Because AutoLoginWithClerk needs these values to create the Clerk user.

---

### ⚠️ Auto-Login Must Happen Immediately

**After RegisterCompanyStep2 succeeds:**
1. Immediately call AutoLoginWithClerk
2. Pass the stored password from Step 1
3. User is now logged in to Clerk
4. Session persists

> If you forget this, user won't be logged in after signup.

---

### ✅ Email Verification Is Automatic

When user registers (Step 1):
- Backend generates a 32-character token
- Email is sent with verification link + plain token
- Token expires in 24 hours
- Single-use (can resend for new token)

---

### ✅ Geographic Data Is Pre-Seeded

Colombian departments and municipalities:
- 32 departments (Antioquia, Bogotá, etc.)
- 156 municipalities total
- Properly linked by DANE codes

When department is selected, municipalities filter automatically.

---

## API Endpoints Reference

All endpoints are at: `https://exciting-shrimp-34.convex.site`

### 1. Register User (Step 1)
```
POST /registration/register-step-1
Body: {
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "3001234567" // optional
}

Response: {
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr",
  "email": "user@example.com"
}
```

### 2. Verify Email (Step 2)
```
POST /registration/verify-email
Body: {
  "token": "zrVnimDMsARC6OgfAElb6QH9DsA3hNUr"
}

Response: {
  "success": true,
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx"
}
```

### 3. Create Company (Step 3)
```
POST /registration/register-step-2
Body: {
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "companyName": "Cultivos San José",
  "businessEntityType": "S.A.S",
  "companyType": "cannabis",
  "country": "CO",
  "departmentCode": "05",
  "municipalityCode": "05001"
}

Response: {
  "success": true,
  "companyId": "jn7a2dyzskxa97mjthe4endts7t6gvx",
  "organizationId": "org_..."
}
```

### 4. Auto-Login (Step 3 - Right After Company Create)
```
POST /registration/auto-login
Body: {
  "userId": "nd7a2dyzskxa97mjthe4endts7t6gvx",
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Cultivos San José"
}

Response: {
  "success": true,
  "clerkUserId": "user_...",
  "sessionId": "sess_...",
  "redirectUrl": "/dashboard"
}
```

### 5. Get Departments
```
POST /geographic/departments
Body: {
  "countryCode": "CO"
}

Response: [
  {
    "division_1_code": "05",
    "division_1_name": "Antioquia",
    "timezone": "America/Bogota"
  },
  ...
]
```

### 6. Get Municipalities
```
POST /geographic/municipalities
Body: {
  "countryCode": "CO",
  "departmentCode": "05"
}

Response: [
  {
    "division_2_code": "05001",
    "division_2_name": "Medellín",
    "parent_division_1_code": "05"
  },
  ...
]
```

---

## Validation Rules

### Email
- Format: `user@example.com`
- Must be unique (backend checks)
- Case-insensitive

### Password
- Minimum 8 characters
- Must contain letter + number
- Example: `SecurePass123` ✅, `password123` ❌

### Names
- First Name + Last Name: Required
- 1-50 characters each

### Company Name
- Required, 2-100 characters

### Business Type
Options: `S.A.S`, `S.A.`, `Ltda`, `E.U.`, `Persona Natural`

### Company Type
Options: `cannabis`, `coffee`, `cocoa`, `flowers`, `mixed`

---

## Documentation Hierarchy

### For Quick Answers
- **[BUBBLE-IMPLEMENTATION-QUICK-GUIDE.md](./BUBBLE-IMPLEMENTATION-QUICK-GUIDE.md)** - 5-minute overview

### For Step-by-Step Building
- **[bubble/Module-1-Bubble-Guide.md](./bubble/Module-1-Bubble-Guide.md)** - Complete technical guide with exact steps

### For Architecture Understanding
- **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** - Backend verification & architecture
- **[README.md](./README.md)** - Module overview & database schema

---

## Common Issues & Solutions

### Issue: API returns 404
**Solution**: Check URL: `https://exciting-shrimp-34.convex.site/...`

### Issue: Email not sending
**Solution**: Verify RESEND_API_KEY is set: `npx convex env list`

### Issue: Departments dropdown empty
**Solution**: Run `npx convex run seedGeographic:seedColombianGeography`

### Issue: User not logged in after signup
**Solution**: Make sure you're calling AutoLoginWithClerk immediately after RegisterCompanyStep2, and passing the stored password from Step 1

### Issue: "Email already registered"
**Solution**: Each user needs a unique email. Check if testing with same email twice.

### Issue: Token "already used"
**Solution**: Token is single-use. Click "Reenviar" to get new token.

---

## Testing Checklist

### Step 1: Registration
- [ ] Fill all fields
- [ ] Click "Crear Cuenta"
- [ ] See success message
- [ ] Redirect to email verification page
- [ ] Token appears in page state or email

### Step 2: Email Verification
- [ ] Get token from email or page state
- [ ] Paste token
- [ ] Click "Verificar"
- [ ] See success message
- [ ] Redirect to company creation page

### Step 3: Company Creation
- [ ] Departments dropdown loads (32 items)
- [ ] Select a department
- [ ] Municipalities dropdown loads (filtered)
- [ ] Select a municipality
- [ ] Fill company details
- [ ] Click "Crear Empresa"
- [ ] See success message
- [ ] Redirect to dashboard

### Auto-Login Verification
- [ ] Check that user is logged in to Clerk
- [ ] Check that Clerk session persists after page refresh
- [ ] Verify welcome email was received

---

## Timeline Breakdown

| Task | Time | Status |
|------|------|--------|
| Environment setup | 15 min | 📋 Todo |
| Create 3 pages + elements | 20 min | 📋 Todo |
| Create 5 API connectors | 15 min | 📋 Todo |
| Add all workflows | 120 min | 📋 Todo |
| Testing | 30 min | 📋 Todo |
| **Total** | **200 min** | **~3.5 hours** |

---

## Next Steps

1. **Read** the detailed guide: [bubble/Module-1-Bubble-Guide.md](./bubble/Module-1-Bubble-Guide.md)
2. **Start** with Phase 1 setup (15 min)
3. **Build** pages (20 min)
4. **Connect** APIs (15 min)
5. **Add** workflows (120 min)
6. **Test** complete flow (30 min)

---

## Support Resources

- **API Reference**: [bubble/Module-1-Bubble-Guide.md Part 2](./bubble/Module-1-Bubble-Guide.md#part-2-api-endpoints-documentation)
- **Workflow Details**: [bubble/Module-1-Bubble-Guide.md Part 7](./bubble/Module-1-Bubble-Guide.md#part-7-detailed-workflow-setup-in-bubble)
- **Troubleshooting**: [bubble/Module-1-Bubble-Guide.md Part 12](./bubble/Module-1-Bubble-Guide.md#part-12-troubleshooting)

---

**Backend Status**: ✅ 100% Ready
**Documentation**: ✅ Complete
**Ready to Build**: ✅ Yes

**Good luck! You've got all the tools and documentation. Build it! 🚀**
