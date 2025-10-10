# Clerk Organization Setup Guide

**Objective:** Enable and configure Organizations in Clerk to support multi-tenant architecture

---

## Step 1: Enable Organizations Feature

### Access Clerk Dashboard

1. **Open Clerk Dashboard:**
   - URL: https://dashboard.clerk.com
   - Sign in with your account

2. **Select Your Application:**
   - Look for: **fluent-gecko-72** (or your app name)
   - Click to open the application settings

### Enable Organizations

3. **Navigate to Organizations:**
   - In the left sidebar, click **"Organizations"**
   - Or go directly to: Dashboard → Organizations

4. **Enable the Feature:**
   - Toggle **"Enable organizations"** to ON
   - Click **"Save"** if prompted

5. **Configure Organization Settings:**

   **Basic Settings:**
   - ✅ **Allow users to create organizations** - ON
   - ✅ **Show organization profile** - ON
   - ✅ **Allow organization members to leave** - ON

   **Permissions (Optional):**
   - You can configure roles and permissions
   - Default roles: `admin`, `basic_member`
   - We'll use our own roles from the database for now

6. **Save Changes**

---

## Step 2: Create a Test Organization

You have **two options** for creating an organization:

### Option A: Via Clerk Dashboard (Quick Testing)

1. **Go to Organizations Tab:**
   - Dashboard → Organizations
   - Click **"Create organization"** button

2. **Fill in Details:**
   - **Name:** `Test Company`
   - **Slug:** `test-company` (auto-generated, can customize)
   - Click **"Create"**

3. **Add Your User as Member:**
   - Click on the organization you just created
   - Go to **"Members"** tab
   - Click **"Add member"**
   - Select your user: `cristiangoye@gmail.com`
   - Role: `admin`
   - Click **"Add member"**

### Option B: Via User Interface (Production-like Flow)

We need to add an organization creation UI to your app. Let me create that for you.

---

## Step 3: Verify Organization in Your App

1. **Sign out and sign in again:**
   - Go to http://localhost:3000/dashboard
   - Click your profile picture → Sign Out
   - Sign in again

2. **Check Dashboard:**
   - After signing in, your dashboard should show:
   - **Organization ID:** `org_xxxxx` (instead of "No organization")

3. **If you still see "No organization":**
   - You may need to select the organization
   - Clerk should prompt you to select/create one
   - If not, we'll add an organization switcher component

---

## Verification Checklist

After completing the setup, verify:

- [ ] Organizations feature is enabled in Clerk Dashboard
- [ ] At least one test organization exists
- [ ] Your user is a member of the organization
- [ ] Dashboard shows organization ID (not "No organization")
- [ ] Organization ID format: `org_xxxxxxxxxxxxx`

---

## Next: Test with API

Once you have an organization ID showing in the dashboard, we can:

1. **Create a Company** via POST `/api/v1/companies`
2. **Create a Facility** via POST `/api/v1/facilities`
3. **Create a Batch** via POST `/api/v1/batches`

The organization ID from Clerk will automatically map to a company in our Convex database.

---

## Troubleshooting

### "Organizations" menu not visible

**Solution:**
- Make sure you're in the correct Clerk application
- Check if you have the correct permissions
- Try refreshing the Clerk Dashboard

### Organization created but not showing in app

**Solution:**
- Sign out and sign in again
- Clear browser cache/cookies
- Check browser console for errors
- Verify middleware.ts is not blocking organization context

### User not automatically added to organization

**Solution:**
- Manually add via Clerk Dashboard (Organizations → [Your Org] → Members → Add Member)
- Configure automatic assignment in Organization settings

---

## What's Next?

After you complete this setup and see an organization ID in your dashboard, let me know and we'll proceed to:

1. **Create a Company** - POST request to link Clerk org to Convex company
2. **Create a Facility** - Set up your first cultivation facility
3. **Create a Batch** - Start tracking your first batch with QR code

You're about to test the complete multi-tenant flow! 🚀
