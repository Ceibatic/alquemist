# Module 1: Bubble Quick Start Checklist

**Get Module 1 running in Bubble in 6-8 hours**

⏱️ **Total Time:** 6-8 hours
📝 **Difficulty:** Intermediate
✅ **Prerequisites:** Bubble account, Alquemist API running, Clerk account

---

## 🚀 Quick Navigation

- **Setup (1-1.5h):** [Phase 1](#phase-1-setup-1-15-hours)
- **Company Profile (2h):** [Phase 2](#phase-2-company-profile-2-hours)
- **Facilities (3-4h):** [Phase 3](#phase-3-facilities-list--details-3-4-hours)
- **Testing (30min):** [Phase 4](#phase-4-testing--polish-30-min)

---

## Phase 1: Setup (1-1.5 hours)

### ✅ Checklist

#### 1. Clerk Authentication (30 min)
- [ ] Install Clerk plugin in Bubble
- [ ] Add Clerk API keys to plugin settings
- [ ] Enable Organizations in Clerk plugin
- [ ] Create Sign-in page with Clerk SignIn component
- [ ] Create Sign-up page with Clerk SignUp component
- [ ] Create Create-organization page with Clerk component
- [ ] Test authentication flow (sign up → create org → sign in)

**Quick Test:**
```
1. Sign up new user → Should work
2. Create organization → Should work
3. Sign in → Should redirect to dashboard
```

#### 2. API Connector Setup (30 min)
- [ ] Open Plugins → API Connector
- [ ] Add new API: "Alquemist API"
- [ ] Set shared header: `Content-Type: application/json`
- [ ] Configure health_check call (GET /api/v1)
- [ ] Test health check → Should return "operational"
- [ ] Configure get_company call (GET /api/v1/companies)
- [ ] Configure create_company call (POST /api/v1/companies)
- [ ] Initialize both with test data

**Quick Test:**
```
Health check workflow:
When button clicked → API call health_check → Show alert with status
Expected: "operational"
```

#### 3. Data Types & States (15 min)
- [ ] Create Company data type with fields:
  - id (text), name (text), legal_name (text), tax_id (text), status (text)
- [ ] Create Facility data type with fields:
  - id (text), name (text), facility_type (text), license_number (text), status (text)
- [ ] Create custom state on index page:
  - session_token (text)
  - organization_id (text)

#### 4. Reusable Elements (15 min)
- [ ] Create Header reusable element:
  - Logo, Navigation menu, Clerk UserButton
- [ ] Create Loading Spinner reusable element
- [ ] Create Empty State reusable element

---

## Phase 2: Company Profile (2 hours)

### ✅ Checklist

#### 5. Dashboard Page (45 min)
- [ ] Create `dashboard` page
- [ ] Add Header reusable element
- [ ] Add welcome section with company name (dynamic)
- [ ] Add workflow: On page load → Get session token
- [ ] Add workflow: On page load → API call get_company
- [ ] Display company name in welcome text
- [ ] Add button: "View Company Profile" → company-profile
- [ ] Add button: "Manage Facilities" → facilities-list

**Quick Test:**
```
Load dashboard → Should show:
- Welcome, [Company Name]
- Two clickable buttons
```

#### 6. Company Profile Page - View Mode (45 min)
- [ ] Create `company-profile` page
- [ ] Add Header reusable element
- [ ] Add page title: "Company Profile"
- [ ] Add "Edit" button (top right)
- [ ] Add Group: Basic Information
  - Text fields: Company name, Legal name, Tax ID, Business type
- [ ] Add Group: Contact Information
  - Text fields: Email, Phone
- [ ] Add Group: Regional Settings
  - Text fields: Country, Locale, Currency, Timezone
- [ ] Add workflow: On page load → Get company data
- [ ] Display all fields dynamically

**Quick Test:**
```
Navigate to company-profile → Should show:
- All company data from API
- Edit button visible
```

#### 7. Company Profile Page - Edit Mode (30 min)
- [ ] Add custom state: is_editing (yes/no)
- [ ] Create input fields (hidden by default):
  - Conditional: When is_editing = yes
- [ ] Add "Save" and "Cancel" buttons (hidden by default)
- [ ] Add workflow: When Edit clicked → Set is_editing = yes
- [ ] Add workflow: When Cancel clicked → Set is_editing = no
- [ ] Add workflow: When Save clicked:
  - Validate inputs
  - API call: update_company
  - Show success message
  - Set is_editing = no
  - Refresh data

**Quick Test:**
```
1. Click Edit → Input fields appear
2. Change company name
3. Click Save → Should update and show new name
4. Click Edit → Click Cancel → No changes saved
```

---

## Phase 3: Facilities List & Details (3-4 hours)

### ✅ Checklist

#### 8. Facilities List Page (1.5 hours)
- [ ] Create `facilities-list` page
- [ ] Add Header reusable element
- [ ] Add page title: "Facilities"
- [ ] Add "Create New Facility" button (top right)
- [ ] Add search input
- [ ] Add dropdown: Facility type filter
- [ ] Add repeating group:
  - Type: Facility
  - Data source: API - list_facilities
  - Layout: Full list (vertical)
  - Items per page: 10
- [ ] Design Facility Card inside repeating group:
  - Facility name (large, bold)
  - Type and License number
  - Location (city, state)
  - License expiration badge (color-coded)
  - "View" button
- [ ] Add pagination controls (previous/next)
- [ ] Add workflow: Filter when dropdown changes
- [ ] Add workflow: Search when input changes (500ms delay)
- [ ] Add empty state (conditional, when list is empty)

**Quick Test:**
```
1. Load page → Should show test facility
2. Search by name → Should filter
3. Filter by type → Should filter
4. Click View → Should go to facility details
```

#### 9. Facility Details Page (1 hour)
- [ ] Create `facility-details` page
- [ ] Add URL parameter: facility_id
- [ ] Add Header reusable element
- [ ] Add page title: Facility name (dynamic from API)
- [ ] Add location subtitle
- [ ] Add "Edit" button (top right)
- [ ] Create tab navigation:
  - Overview (default)
  - License
  - Areas (placeholder)
  - Team (placeholder)
- [ ] Add custom state: active_tab (text)
- [ ] Create Overview tab content:
  - Facility type, status
  - Total area, canopy area
  - Full address
  - Coordinates, altitude
- [ ] Create License tab content:
  - License number, type, authority
  - Issue date, expiration date
  - Status badge (green/yellow/red)
  - Days remaining
- [ ] Add workflow: On page load → Get facility by ID
- [ ] Add workflow: Tab clicked → Change active_tab
- [ ] Add conditional visibility for tab content

**Quick Test:**
```
1. Click View from list → Should load facility
2. Overview tab → Shows facility info
3. License tab → Shows license info with status
4. Status badge color matches expiration date
```

#### 10. Create Facility Wizard (1.5-2 hours)
- [ ] Create `create-facility` page
- [ ] Add Header reusable element
- [ ] Add custom state: wizard_step (number, default: 1)
- [ ] Add custom state: draft_facility (Facility type)
- [ ] Add progress indicator: "Step X of 3"
- [ ] Add progress bar visual (●━━○━━○)

**Step 1: Basic Info**
- [ ] Create Group: Step 1 (conditional: wizard_step = 1)
- [ ] Add input: Facility name (required)
- [ ] Add dropdown: Facility type (required)
- [ ] Add textarea: Description (optional)
- [ ] Add buttons: Cancel, Next
- [ ] Add workflow: Next clicked
  - Validate: name and type not empty
  - If valid: Save to draft, set wizard_step = 2
  - If invalid: Show error

**Step 2: Location**
- [ ] Create Group: Step 2 (conditional: wizard_step = 2)
- [ ] Add inputs: Address, City, State (required)
- [ ] Add inputs: Latitude, Longitude, Altitude (optional)
- [ ] Add inputs: Total area, Canopy area
- [ ] Add buttons: Back, Next
- [ ] Add workflow: Back clicked → wizard_step = 1
- [ ] Add workflow: Next clicked
  - Validate required fields
  - If valid: Save to draft, set wizard_step = 3

**Step 3: License**
- [ ] Create Group: Step 3 (conditional: wizard_step = 3)
- [ ] Add input: License number (required)
- [ ] Add dropdown: License type (required)
- [ ] Add dropdown: License authority (required)
- [ ] Add date picker: Expiration date (required)
- [ ] Add buttons: Back, Create Facility
- [ ] Add workflow: Back clicked → wizard_step = 2
- [ ] Add workflow: Create Facility clicked
  - Validate license fields
  - Show loading spinner
  - API call: create_facility (all draft data)
  - If success: Navigate to facility-details
  - If error: Show error message

**Quick Test:**
```
1. Fill Step 1 → Click Next → Step 2 appears
2. Click Back → Step 1 appears with saved data
3. Fill all steps → Click Create → Facility created
4. Cancel at Step 2 → Confirmation dialog → Back to list
```

---

## Phase 4: Testing & Polish (30 min)

### ✅ Checklist

#### 11. Full Flow Testing (20 min)
- [ ] Test complete auth flow:
  - Sign up → Create org → Dashboard
- [ ] Test company profile:
  - View → Edit → Save → Changes reflected
- [ ] Test facilities list:
  - Empty state (if first time)
  - Create first facility
  - View in list
  - Search works
  - Filter works
- [ ] Test facility wizard:
  - Complete all 3 steps
  - Back/Next navigation
  - Cancel confirmation
  - Success creation
- [ ] Test facility details:
  - All data displays correctly
  - Tabs switch properly
  - License badge color correct

#### 12. Multi-Tenancy Test (10 min)
- [ ] Create second organization in Clerk
- [ ] Sign in with second org
- [ ] Verify facilities list is empty (isolated)
- [ ] Create facility in second org
- [ ] Switch back to first org
- [ ] Verify facilities are different (no leakage)

---

## 🎯 Success Criteria

### You're done when:
- [x] Authentication works (sign up, sign in, org creation)
- [x] Company profile displays and edits
- [x] Facilities list shows data with search/filter
- [x] Create facility wizard completes all 3 steps
- [x] Facility details page shows all info with tabs
- [x] License status colors are correct
- [x] Multi-tenant isolation verified
- [x] No console errors in browser

---

## 🐛 Quick Troubleshooting

### Issue: "Authorization failed"
**Fix:** Check session token is being passed in API calls
```
Workflow: Get session token on page load
API call: Use token parameter with session_token
```

### Issue: "Company not found"
**Fix:** Create company first via API
```
After org creation → API call: create_company
Use organization_id from Clerk session
```

### Issue: Facilities list empty (but should have data)
**Fix:** Check API call configuration
```
API Connector → list_facilities
Use as: Data (not Action)
Initialize call to capture structure
```

### Issue: License badge all one color
**Fix:** Add conditional formatting
```
Badge background color (conditional):
When Current cell's expiration_date < Current date + days: 30 → Red
When Current cell's expiration_date < Current date + days: 60 → Yellow
Else → Green
```

### Issue: Wizard doesn't advance
**Fix:** Check validation workflow
```
When Next clicked:
Only when: Input name is not empty AND Dropdown type is not empty
Then: Set wizard_step = wizard_step + 1
```

---

## 📊 Time Breakdown

| Phase | Task | Time | Cumulative |
|-------|------|------|------------|
| 1 | Clerk setup | 30m | 0:30 |
| 1 | API Connector | 30m | 1:00 |
| 1 | Data types | 15m | 1:15 |
| 1 | Reusable elements | 15m | 1:30 |
| 2 | Dashboard | 45m | 2:15 |
| 2 | Company view | 45m | 3:00 |
| 2 | Company edit | 30m | 3:30 |
| 3 | Facilities list | 1:30 | 5:00 |
| 3 | Facility details | 1:00 | 6:00 |
| 3 | Create wizard | 2:00 | 8:00 |
| 4 | Testing | 30m | 8:30 |

**Total:** 6-8.5 hours (depending on experience)

---

## 📚 Reference Docs

- **Full Guide:** [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md) - Complete setup instructions
- **API Reference:** [API-Bubble-Reference.md](API-Bubble-Reference.md) - All endpoints with examples
- **UI Wireframes:** [Bubble-UI-Wireframes.md](Bubble-UI-Wireframes.md) - Visual page designs

---

## 💡 Pro Tips

1. **Save frequently:** Bubble auto-saves, but manually save before big changes
2. **Test as you go:** Don't wait until the end to test
3. **Use copy-paste:** Copy working workflows and adapt them
4. **Debug with alerts:** Show Result of step X in alert to see API responses
5. **Check console:** Browser console shows helpful error messages

---

## ✅ Final Checklist

Before considering Module 1 complete:

- [ ] All pages created and working
- [ ] All workflows tested
- [ ] All API calls configured correctly
- [ ] Multi-tenant isolation verified
- [ ] No console errors
- [ ] Responsive on mobile (preview in Bubble)
- [ ] Ready to show to users for feedback

---

**Status:** Ready to implement
**Estimated Time:** 6-8 hours
**Next Module:** Module 2 - Batch Management

**Questions?** Check the [full guide](Module-1-Bubble-Guide.md) or [API reference](API-Bubble-Reference.md).
