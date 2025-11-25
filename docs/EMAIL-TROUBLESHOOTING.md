# Email Troubleshooting Guide

**Quick reference for common email issues and solutions**

---

## Problem: Email Not Received

### Symptoms
- User completes registration successfully
- No email arrives in inbox
- Bubble shows "Send Email" completed in debugger

### Diagnosis

**Step 1: Check Bubble Debugger**
```
In Bubble Preview:
1. Open Inspector (F12) → Bubble tab
2. Look for "Send Email" action
3. Should show: ✅ Success
```

If showing ❌ Error:
- → Go to "API Error" section below

If showing ✅ Success:
- → Continue to Step 2

**Step 2: Check SendGrid Activity**
```
In SendGrid Dashboard:
1. Go to "Mail Activity" or "Email Activity"
2. Search for user's email address
3. Look at delivery status:
   - Delivered ✅
   - Bounced ❌
   - Deferred ⏳
   - Dropped ❌
```

| Status | Meaning | Solution |
|--------|---------|----------|
| **Delivered** | Email reached inbox | Check spam folder |
| **Bounce** | Email address invalid | Verify email format |
| **Deferred** | Temporary issue | Wait, will retry |
| **Dropped** | SendGrid blocked it | Check bounce reason |
| **Not in list** | Never sent | Check Bubble step 1 |

**Step 3: Check Spam Folder**
- Gmail: Check "All Mail" and "Spam"
- Outlook: Check "Junk" folder
- Yahoo: Check "Spam" folder

**Step 4: Check Email Format**
```
In Bubble Debugger:
1. Find API response (Step 1)
2. Check result data's email
3. Should be: user@example.com (no extra spaces)
```

### Solutions

#### Solution 1: Email in Spam
**Issue**: Email delivered but marked as spam

**Fix**:
1. Mark email as "Not Spam" in email client
2. Add noreply@yourdomain.com to contacts
3. Verify SendGrid domain authentication:
   ```
   In SendGrid Dashboard:
   Settings → Sender Authentication → Verify domain status
   Should show: ✅ Verified
   ```

#### Solution 2: Wrong Sender Address
**Issue**: Email shows wrong "From" address

**Fix in Bubble**:
1. Go to Settings → Email
2. Check "From Address": should be `noreply@yourdomain.com`
3. Check "From Name": should be `Alquemist`
4. Verify domain is authenticated in SendGrid

#### Solution 3: Email Never Sent
**Issue**: SendGrid shows email is not in activity log

**Fix**:
1. Check Bubble Send Email action completed
2. Verify SendGrid API key is correct:
   ```
   Settings → Email → Check API key in field
   Should start with: SG.
   ```
3. Check API key has email sending permissions
4. Re-generate new API key if needed

---

## Problem: API Error on Registration

### Symptoms
- Registration fails
- Error message displayed
- Email never sent

### Diagnosis

**Check Bubble Debugger**:
```
Step 1 shows: ❌ Error
Error message: [specific error]
```

### Common API Errors

#### Error: "Email already exists"
**Solution**:
- Use different email address
- Or contact support to delete old account

#### Error: "Password too weak"
**Solution**:
- Password must have:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

#### Error: "Email format invalid"
**Solution**:
- Check email has @domain
- No spaces or special characters before @
- Example: user@example.com ✅

#### Error: "Server Error" or "500"
**Solution**:
1. Verify Convex backend is running
2. Check Convex logs for errors
3. Retry registration
4. Contact support if persists

---

## Problem: Email Content Issues

### Symptoms
- Email received but looks broken
- HTML not rendering
- Links don't work
- Text is unreadable

### Diagnosis

**Check Email HTML**:
```
In Bubble Debugger:
1. Find API response
2. Copy result data's emailHtml
3. Paste in text editor
4. Check for HTML errors
```

### Solutions

#### Solution 1: HTML Rendering Issues
**Issue**: Email displays raw HTML instead of formatted

**Fix**:
1. Check email client supports HTML
2. Try different email provider
3. Check SendGrid configuration

#### Solution 2: Links Not Working
**Issue**: Verification link doesn't work

**Check URL**:
```
Email should contain:
https://yourapp.bubbleapps.io/signup-verify-email?token=abc123&email=user@example.com

Verify:
✅ Token is 32 characters
✅ Email is URL-encoded
✅ Domain matches Bubble app URL
```

**Fix**:
1. Verify `BUBBLE_APP_URL` environment variable
2. In Convex settings, check:
   ```
   process.env.BUBBLE_APP_URL = "https://yourapp.bubbleapps.io"
   ```
3. Redeploy Convex if changed

#### Solution 3: Missing Images
**Issue**: Images in email don't load

**Fix**:
1. Images must be hosted on HTTPS
2. Use absolute URLs (not relative)
3. Check CDN/hosting is accessible from email client

#### Solution 4: Font/Color Issues
**Issue**: Email looks different in different clients

**Solution**:
- CSS support varies by email client
- Email uses inline styles (should work)
- Test in multiple email clients:
  - Gmail
  - Outlook
  - Apple Mail
  - Mobile email apps

---

## Problem: Token Verification Fails

### Symptoms
- Email received successfully
- Click verification link
- Error: "Token invalid" or "Token expired"

### Diagnosis

**Check Token in URL**:
```
Link should be:
https://yourapp.bubbleapps.io/signup-verify-email?token=abc123&email=user@example.com

Verify:
✅ Token exists in URL
✅ Email matches registration email
✅ Page load workflow triggered
```

### Solutions

#### Solution 1: Token Expired
**Issue**: Token older than 24 hours

**Fix**:
- Tokens expire after 24 hours
- User should request new verification email
- Click "Resend Email" button

#### Solution 2: Token Already Used
**Issue**: Same token clicked twice

**Fix**:
- Token can only be used once
- User should request new email
- Click "Resend Email" button

#### Solution 3: Wrong Email in URL
**Issue**: Email in URL doesn't match registered email

**Fix**:
- Verify email in URL is correct
- Check for URL encoding issues
- Re-send verification email

#### Solution 4: Page Not Reading Token from URL
**Issue**: Token in URL but not being sent to API

**Check Bubble Page Load**:
```
Page load workflow should:
1. Get token from URL: Get data from page URL 'token'
2. Pass to API call: verifyEmailToken
   Parameter: token = [from URL]
```

**Fix**:
1. Verify page load workflow exists
2. Check condition: "Get data from page URL 'token' is not empty"
3. Verify API call receives token parameter

---

## Problem: SendGrid Configuration Issues

### Symptoms
- Send Email action fails
- "Authentication failed" error
- Emails not sending

### Diagnosis

### Solutions

#### Solution 1: Invalid API Key
**Fix**:
1. Go to SendGrid Dashboard
2. Create NEW API key
3. Copy full key (starts with SG.)
4. In Bubble Settings → Email:
   - Clear old key
   - Paste new key
   - Save

#### Solution 2: Domain Not Verified
**Fix**:
1. Go to SendGrid → Settings → Sender Authentication
2. Verify domain status shows: ✅ Verified
3. If not verified:
   - Add DNS records
   - Wait 24 hours for propagation
   - Click "Verify"

#### Solution 3: Wrong From Address
**Fix**:
1. In Bubble Settings → Email
2. Set "From Address": `noreply@yourdomain.com`
3. Must match SendGrid verified domain
4. Save and test

#### Solution 4: API Key Revoked or Expired
**Fix**:
1. In SendGrid → Settings → API Keys
2. Check if key shows status "Revoked" or warning
3. Create new API key
4. Update Bubble settings

---

## Problem: High Bounce Rate

### Symptoms
- Many emails marked as "Bounced" in SendGrid
- Low delivery rate
- Users not receiving emails

### Diagnosis

**Check SendGrid Activity**:
```
SendGrid Dashboard → Mail Activity:
1. Filter by "Status: Bounce"
2. Check bounce type:
   - Soft bounce (temporary)
   - Hard bounce (permanent)
```

### Solutions

#### Solution 1: Invalid Email Addresses
**Fix**:
1. Verify email validation in Convex
2. Add email validation in Bubble (frontend)
3. Check for typos in test emails

#### Solution 2: Low Reputation
**Issue**: New SendGrid account with low reputation

**Fix**:
1. Send emails to real users only
2. Maintain list of engaged users
3. Monitor bounce rate (should stay <5%)
4. After 1-2 weeks, reputation improves

#### Solution 3: High Complaint Rate
**Fix**:
1. Add unsubscribe link in emails
2. Respect user preferences
3. Only send relevant emails
4. Monitor complaint rate in SendGrid

---

## Debugging Checklist

When something goes wrong, check in order:

- [ ] **Bubble Debugger**: API call success/error?
- [ ] **SendGrid Activity**: Email delivered/bounced/dropped?
- [ ] **Spam Folder**: Check all folders
- [ ] **Email Format**: Valid email address?
- [ ] **Token URL**: Contains token and email?
- [ ] **SendGrid API Key**: Valid and not revoked?
- [ ] **Domain Verified**: ✅ Status in SendGrid?
- [ ] **From Address**: Matches verified domain?
- [ ] **Email Client**: Try different providers

---

## Emergency: Email Not Sending at All

If emails completely stopped working:

### Step 1: Test Immediately
1. In Bubble Preview
2. Complete registration
3. Check Bubble Debugger for errors

### Step 2: Check Services
1. Is SendGrid service up?
   - Check sendgrid.com status page
2. Is Bubble working?
   - Check bubble.io status
3. Is Convex working?
   - Check Convex logs

### Step 3: Manual Testing
1. Go to SendGrid Dashboard
2. Click "Send Test Email"
3. Check if test email received

### Step 4: Contact Support
If still broken:
- **SendGrid Support**: support@sendgrid.com
- **Bubble Support**: contact bubble.io support
- **Alquemist Support**: contact your developer

---

## Performance Monitoring

Monitor these metrics:

| Metric | Target | Action if Low |
|--------|--------|-----------------|
| **Delivery Rate** | >95% | Check invalid emails, authentication |
| **Open Rate** | 15-25% | Email content, subject line |
| **Click Rate** | 5-10% | Link relevance, CTA text |
| **Bounce Rate** | <5% | Email validation, list quality |
| **Complaint Rate** | <0.1% | Unsubscribe handling, relevance |

---

## Quick Links

- **SendGrid Docs**: https://docs.sendgrid.com
- **Bubble Email Reference**: https://bubble.io/reference#action-email-client-side
- **Email Verification API**: See PHASE-1-ONBOARDING-ENDPOINTS.md
- **SendGrid Setup**: See SENDGRID-SETUP-GUIDE.md
- **Bubble Workflow Setup**: See BUBBLE-EMAIL-WORKFLOW-SETUP.md

---

**Last Updated**: November 2025
**Status**: Live
