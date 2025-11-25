# Bubble Email Workflow Setup Guide

**Purpose**: Step-by-step guide to implement email sending in Bubble registration flow
**Duration**: 10-15 minutes
**Difficulty**: Easy
**Prerequisite**: SendGrid configured (see SENDGRID-SETUP-GUIDE.md)

---

## Overview

This guide shows exactly how to add the "Send Email" native action to your Bubble registration workflow after calling the Convex API.

---

## Part 1: Registration Workflow Setup

### Step 1: Open Your Registration Workflow

1. In Bubble Editor, open your registration page
2. Select the button that triggers registration (e.g., `btn_register`)
3. In the right panel, click **"Show Workflow"** or go to **Workflow** tab
4. Find your existing registration workflow

### Step 2: Current Workflow Structure

Your workflow should look like this:

```
Trigger: btn_register is clicked

Step 1: API Call → registerUserStep1
  - email: input_email's value
  - password: input_password's value
  - firstName: input_firstName's value
  - lastName: input_lastName's value
  - phone: input_phone's value (optional)

Step 2: Only when Step 1's success is "yes"
  → Sign User Up
  → Make Changes to Current User

Step 3: Navigate to verification page
```

### Step 3: Add "Send Email" Action After API Call

1. **Click "+" after Step 1** (after the API call)
2. Select **Action** from menu
3. Search for **"Send Email"** (Bubble's native action, not plugin)
4. The action will be inserted as a new step

### Step 4: Configure "Send Email" Action

**Important**: Make sure this step has condition: **Only when Step 1's success is "yes"**

Configure these fields:

| Field | Value | Notes |
|-------|-------|-------|
| **To** | `Step 1's result data's email` | Recipient email |
| **Subject** | `Step 1's result data's emailSubject` | Email subject |
| **Body** | `Step 1's result data's emailHtml` | Email HTML content |
| **Reply-to** | `support@ceibatic.com` | Reply address |
| **From Name** | `Alquemist` | Sender display name |

**Detailed Steps:**

1. Click on the "To" field
2. Click dynamic data icon (lightning bolt)
3. Select **Step 1** (your API call)
4. Navigate to **result data** → **email**
5. Click to insert

Repeat for **Subject** and **Body**:
1. For Subject: Select **Step 1** → **result data** → **emailSubject**
2. For Body: Select **Step 1** → **result data** → **emailHtml**

### Step 5: Verify Workflow Order

Your complete workflow should be:

```
Trigger: btn_register is clicked

Step 1: API Call → registerUserStep1 ✅

Step 2 (Condition: Only when Step 1's success is "yes")
       Sign User Up ✅

Step 3 (Condition: Only when Step 1's success is "yes")
       Send Email
         To: Step 1's result data's email
         Subject: Step 1's result data's emailSubject
         Body: Step 1's result data's emailHtml
         Reply-to: support@ceibatic.com ✅

Step 4 (Condition: Only when Step 1's success is "yes")
       Make Changes to Current User
         session_token: Step 1's result data's token
         backend_user_id: Step 1's result data's userId
         email_verified: "no" ✅

Step 5 (Condition: Only when Step 1's success is "yes")
       Navigate to Page email-verification ✅

Step 6 (Condition: Only when Step 1's success is NOT "yes")
       Show Alert with Step 1's result data's error ✅
```

---

## Part 2: Email Verification Page Setup

### Step 1: Create/Update Email Verification Page

1. In Bubble, go to page: **email-verification**
2. This page should display:
   - Email address (passed from registration)
   - Instructions to verify
   - Verification code input (or just a message to check email)

### Step 2: Add Verification Workflow

When user clicks "Verify" button or code is entered:

```
Trigger: btn_verify is clicked OR code is entered

Step 1: API Call → verifyEmailToken
  - token: Get token from URL parameter
           OR from email link clicked

Step 2: Only when Step 1's success is "yes"
  → Show Alert: "¡Email verificado exitosamente!"
  → Navigate to company-setup page

Step 3: Only when Step 1's success is NOT "yes"
  → Show Alert: Step 1's result data's error
```

### Step 3: Get Token from Email Link

The email sent by Bubble contains a verification link with the token:

```
https://yourapp.bubbleapps.io/signup-verify-email?token=abc123xyz&email=user@example.com
```

In Bubble, to get the token from the URL:

1. In page load workflow (or button):
2. Create variable: `verification_token`
3. Set value to: `Get data from page URL 'token'`

---

## Part 3: "Resend Email" Button Setup (Optional)

### Step 1: Add "Resend Email" Button

1. On the email-verification page, add button: `btn_resend_email`
2. Add workflow to this button:

```
Trigger: btn_resend_email is clicked

Step 1: API Call → resendVerificationEmail
  - email: Current User's email

Step 2: Only when Step 1's success is "yes"
  → Send Email (Native Bubble Action)
      To: Current User's email
      Subject: "🌱 Verifica tu email - Alquemist (Reenvío)"
      Body: Step 1's result data's emailHtml
      Reply-to: support@ceibatic.com

Step 3: Show Alert: "Email reenviado. Revisa tu bandeja."

Step 4: Only when Step 1's success is NOT "yes"
  → Show Alert with Step 1's result data's error
```

---

## Part 4: Testing Your Setup

### 4.1 Test in Bubble Preview

1. Click **Preview** (top right)
2. Go to registration page
3. Fill in test form:
   - Email: `test-$(random)@example.com`
   - Password: `TestPass123!`
   - Name: `Test User`
4. Click "Create Account"
5. **Check Bubble Debugger** (right panel):
   - API call should show `success: true`
   - Should see `emailHtml`, `emailSubject` in response
   - Send Email should show success

### 4.2 Check Email Receipt

1. Check your test email inbox
2. Look for email with subject: "🌱 Verifica tu email - Alquemist"
3. Email should contain:
   - Your name
   - Verification link with token
   - Alternative: Enter token manually

### 4.3 Test Verification Link

1. Click the verification link in email
2. Should redirect to: `/signup-verify-email?token=xyz&email=...`
3. Bubble should automatically verify token
4. Show success message
5. Navigate to company setup

### 4.4 Troubleshooting

**Email not sent:**
- Check Bubble debugger for API error
- Verify SendGrid is configured in Bubble settings
- Ensure API key is valid

**Email not received:**
- Check spam/junk folder
- Verify sender address in Bubble settings
- Check SendGrid activity log

**Wrong email content:**
- Verify `emailHtml` in API response
- Check if HTML is rendering correctly in email client
- Test with different email providers (Gmail, Outlook, etc.)

---

## Part 5: Production Checklist

Before going live, verify:

- [ ] SendGrid account created and configured
- [ ] Domain verified in SendGrid (✅ status)
- [ ] API key added to Bubble Email settings
- [ ] Test email sent successfully
- [ ] Email verification workflow tested
- [ ] Resend email functionality tested
- [ ] Error handling implemented
- [ ] Email content looks good in multiple email clients
- [ ] Verification links work correctly
- [ ] User feedback messages are clear

---

## Part 6: Customize Email Template

### 6.1 Modify Email Design

The email is generated by Convex backend. To customize:

1. Open: `convex/email.ts`
2. Find function: `generateVerificationEmailHTML()`
3. Modify HTML/CSS as needed
4. Redeploy Convex: `npx convex deploy`
5. Bubble automatically uses new template

### 6.2 Common Customizations

**Change color scheme:**
```typescript
// In generateVerificationEmailHTML()
const html = `
  ...
  .header { background: #your-color; } /* Change primary color */
  ...
`;
```

**Add company logo:**
```typescript
<img src="https://your-domain.com/logo.png" alt="Logo" />
```

**Change button text:**
```typescript
<a href="${verificationLink}" class="cta-button">
  Tu texto aquí  <!-- Change button text -->
</a>
```

**Add footer info:**
```typescript
<p>Tu info adicional aquí</p>
```

---

## Part 7: Monitor Email Performance

### 7.1 SendGrid Analytics

1. Go to SendGrid Dashboard
2. Click **Analytics** or **Mail Send**
3. Monitor:
   - Delivery rate
   - Open rate
   - Click rate
   - Bounce rate

### 7.2 Bubble Debugger

During testing, check:
1. API response contains `emailHtml`
2. Send Email action executes successfully
3. No JavaScript errors in console

### 7.3 Check Email Headers

Some email clients show email headers:
- Verify sender is `noreply@yourdomain.com`
- Check authentication (SPF, DKIM, DMARC)
- Look for X-headers from SendGrid

---

## Quick Reference: API Response Fields

When you call the registration API, the response includes:

```json
{
  "success": true,
  "userId": "j97abc...",
  "token": "session_token_here",
  "email": "user@example.com",
  "message": "Cuenta creada...",
  "verificationToken": "abc123xyz456",

  "emailHtml": "<html>...</html>",    // ← Use in Send Email body
  "emailText": "Text version",
  "emailSubject": "🌱 Verifica tu email",  // ← Use in Send Email subject

  "error": null,
  "code": null
}
```

---

## Common Patterns

### Pattern 1: Show Loading State While Sending Email

```
Step 1: Set state showLoading = yes
Step 2: API Call → registerUserStep1
Step 3: Send Email (with state = showLoading)
Step 4: Set state showLoading = no
Step 5: Show success message
```

### Pattern 2: Track Email Send in Analytics

```
Step 1: API Call → registerUserStep1
Step 2: Send Email
Step 3: Log event to analytics:
        Event: "registration_email_sent"
        Properties: { email, timestamp }
Step 4: Navigate to verification page
```

### Pattern 3: Send Welcome Email After Company Creation

Similar pattern, but after company setup completes:

```
Step 1: API Call → registerCompanyStep2 (company creation)
Step 2: Only when success = "yes"
  → Send Email (Welcome email)
      Body: Custom welcome message with company info
Step 3: Navigate to dashboard
```

---

## Support

If you have questions:

1. Check **Bubble Documentation**: https://bubble.io/reference#action-email-client-side
2. Check **SendGrid Documentation**: https://docs.sendgrid.com
3. Review API Response in Bubble Debugger
4. Check SendGrid Activity Log for delivery status

---

**Last Updated**: November 2025
**Status**: Ready for Production
