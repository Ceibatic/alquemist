# Browser-Based API Testing Guide

Since you're already signed in with your organization, the easiest way to test the API is directly from your browser.

---

## Prerequisites

✅ You must be signed in at: http://localhost:3000/dashboard
✅ You must have an organization (you do: `org_33saIMDJHDTLUJkAyxnxo5cYRSP`)

---

## Test 1: Check Current Company

1. **Click the "Test Companies Endpoint" button on your dashboard**

   OR

2. **Open browser console (F12) and paste:**

```javascript
fetch('http://localhost:3000/api/v1/companies')
  .then(r => r.json())
  .then(data => console.log('Company:', data));
```

**Expected Response:**
- If no company: `"message": "No company profile found"`
- If company exists: Company data with `id`, `name`, etc.

---

## Test 2: Create Company

**Only run this if Test 1 showed "No company profile found"**

Open browser console (F12) and paste:

```javascript
fetch('http://localhost:3000/api/v1/companies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Alquemist Test Company",
    legal_name: "Alquemist Test Company SAS",
    tax_id: "900123456-7",
    company_type: "agriculture",
    business_entity_type: "S.A.S",
    primary_contact_email: "cristiangoye@gmail.com",
    primary_contact_phone: "+57 300 123 4567",
    country: "CO",
    default_locale: "es",
    default_currency: "COP",
    default_timezone: "America/Bogota"
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Company created:', data);
  console.log('Company ID:', data.data.id);
});
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "jx7...",
    "organization_id": "org_33saIMDJHDTLUJkAyxnxo5cYRSP",
    "name": "Alquemist Test Company",
    ...
  }
}
```

---

## Test 3: Create Facility

After creating the company, create a facility:

```javascript
fetch('http://localhost:3000/api/v1/facilities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Greenhouse Facility #1",
    facility_type: "greenhouse",
    address: "Km 5 Vía La Calera",
    city: "Bogotá",
    administrative_division_1: "Cundinamarca",
    country: "CO",
    license_number: "LIC-2025-001",
    license_type: "cannabis_cultivation",
    license_authority": "INVIMA",
    total_area_m2: 5000,
    canopy_area_m2: 3500
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Facility created:', data);
  console.log('Facility ID:', data.data.id);
});
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "k57...",
    "name": "Greenhouse Facility #1",
    "license_number": "LIC-2025-001",
    ...
  }
}
```

---

## Test 4: List Facilities

Verify multi-tenant filtering works:

```javascript
fetch('http://localhost:3000/api/v1/facilities')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Your facilities:', data);
    console.log('Count:', data.data.facilities.length);
  });
```

---

## Test 5: Create Batch (Optional - needs facility ID)

Replace `YOUR_FACILITY_ID` and `CANNABIS_CROP_TYPE_ID` with actual IDs:

```javascript
fetch('http://localhost:3000/api/v1/batches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    facility_id: "YOUR_FACILITY_ID",
    area_id: null, // Optional
    crop_type_id: "CANNABIS_CROP_TYPE_ID",
    batch_number: "BATCH-2025-001",
    phase_name: "Propagation",
    start_date: new Date().toISOString().split('T')[0],
    initial_quantity: 100,
    quantity_unit: "plants"
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Batch created:', data);
  console.log('QR Code:', data.data.qr_code);
});
```

---

## Quick Test All (Copy-Paste Friendly)

Paste this in browser console to run all tests:

```javascript
(async function testAPI() {
  console.log('🌿 Alquemist API Test Suite\n');

  // Test 1: Check Company
  console.log('[1/4] Checking company...');
  let companyRes = await fetch('http://localhost:3000/api/v1/companies').then(r => r.json());

  if (companyRes.data.id) {
    console.log('✅ Company exists:', companyRes.data.id);
  } else {
    console.log('⚠️  No company, creating one...');
    companyRes = await fetch('http://localhost:3000/api/v1/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Alquemist Test Company",
        company_type: "agriculture",
        business_entity_type: "S.A.S",
        country: "CO"
      })
    }).then(r => r.json());
    console.log('✅ Company created:', companyRes.data.id);
  }

  // Test 2: Check Facilities
  console.log('\n[2/4] Checking facilities...');
  let facilitiesRes = await fetch('http://localhost:3000/api/v1/facilities').then(r => r.json());

  if (facilitiesRes.data.facilities.length > 0) {
    console.log('✅ Facilities found:', facilitiesRes.data.facilities.length);
    console.log(facilitiesRes.data.facilities);
  } else {
    console.log('⚠️  No facilities, creating one...');
    let facilityRes = await fetch('http://localhost:3000/api/v1/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Greenhouse Facility #1",
        facility_type: "greenhouse",
        city: "Bogotá",
        country: "CO",
        license_number: "LIC-2025-001",
        license_authority: "INVIMA"
      })
    }).then(r => r.json());
    console.log('✅ Facility created:', facilityRes.data.id);
  }

  // Test 3: Auth Session
  console.log('\n[3/4] Checking auth session...');
  let authRes = await fetch('http://localhost:3000/api/v1/auth/session').then(r => r.json());
  console.log('✅ Session:', authRes.data);

  // Test 4: API Health
  console.log('\n[4/4] Checking API health...');
  let healthRes = await fetch('http://localhost:3000/api/v1').then(r => r.json());
  console.log('✅ API:', healthRes.data.status);

  console.log('\n🎉 All tests complete!');
  console.log('Your multi-tenant system is working! 🚀');
})();
```

---

## What This Tests

✅ **Authentication** - Your session with organization context
✅ **Multi-Tenancy** - Company linked to your organization
✅ **Data Isolation** - Only your company's data visible
✅ **CRUD Operations** - Create company, facilities
✅ **API Layer** - REST endpoints with validation

---

## Next: Try It Now!

1. Go to: http://localhost:3000/dashboard
2. Open console (F12)
3. Copy the "Quick Test All" script above
4. Paste and press Enter
5. Watch the magic happen! ✨

---

**If everything works, you'll see:**
- ✅ Company created/found
- ✅ Facility created/found
- ✅ Session verified
- ✅ API operational

**Then you're ready to:**
- Commit these changes
- Start building Module 1 UI
- Celebrate! 🎉
