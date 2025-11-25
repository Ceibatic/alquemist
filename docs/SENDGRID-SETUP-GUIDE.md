# SendGrid Setup Guide for Alquemist

**Purpose**: Configure SendGrid for professional email delivery in production
**Duration**: 15-20 minutes
**Difficulty**: Easy
**Requirements**: SendGrid account, domain ownership

---

## Overview

SendGrid provides reliable email delivery with better reputation and higher rate limits than Bubble's shared SendGrid. This guide covers:

1. Creating a SendGrid account
2. Verifying your domain
3. Configuring API keys
4. Setting up in Bubble
5. Testing email delivery

---

## Step 1: Create SendGrid Account

### 1.1 Sign Up

1. Go to [SendGrid.com](https://sendgrid.com)
2. Click **"Sign Up"** (top right)
3. Fill in registration form:
   - **First Name**: Your name
   - **Last Name**: Your surname
   - **Email**: Your business email
   - **Company**: Alquemist / Ceibatic
   - **Password**: Strong password (min 8 chars)
4. Accept Terms and Conditions
5. Click **"Create Account"**

### 1.2 Email Verification

1. Check your email for SendGrid verification link
2. Click the link to verify
3. You'll be redirected to SendGrid dashboard

### 1.3 Complete Profile (Optional but Recommended)

1. In Dashboard, go to **Settings → Sender Authentication**
2. Fill in your business details
3. This improves email deliverability

---

## Step 2: Verify Your Domain

### 2.1 Add Domain

1. Go to **Settings → Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Choose DNS provider:
   - Automatic (if using Route53, Google Cloud, etc.)
   - Manual (for other providers)

### 2.2 Configure DNS Records

**For yourdomian.com** (example):

#### Option A: Automatic Setup (Recommended)

1. Select your DNS provider from the list
2. Click **"Authenticate"**
3. Follow provider-specific instructions
4. Typically takes 10-30 minutes to verify

#### Option B: Manual Setup

If your DNS provider isn't listed:

1. SendGrid will provide 3 CNAME records:
   ```
   s1._domainkey.yourdomain.com
   s2._domainkey.yourdomain.com
   email.yourdomain.com
   ```

2. Add these to your DNS provider:
   - Log into your domain registrar (GoDaddy, Namecheap, etc.)
   - Go to DNS settings
   - Add the CNAME records provided by SendGrid
   - Save changes

3. In SendGrid, click **"Verify"**
4. Wait 24 hours for DNS propagation

### 2.3 Verify Domain Status

1. After verification, SendGrid shows **"Verified"** status
2. You can now send emails from **noreply@yourdomain.com**

---

## Step 3: Create API Key

### 3.1 Generate API Key

1. In SendGrid Dashboard, go to **Settings → API Keys**
2. Click **"Create API Key"** (top right)
3. Name your key: `Alquemist-Bubble`
4. Select **"Full Access"** (or select specific permissions below)
5. Click **"Create & View"**

### 3.2 Copy API Key

1. You'll see your API key (long string starting with `SG.`)
2. **IMPORTANT**: Copy this key NOW - you won't see it again
3. Click **"Copy"** button
4. Store in safe location (password manager, .env file)

### 3.3 Keep API Key Secure

```
⚠️  NEVER share this key
⚠️  NEVER commit to GitHub
⚠️  NEVER expose in client-side code
✅ Store in Bubble environment variables
✅ Rotate key periodically (recommend yearly)
```

---

## Step 4: Configure in Bubble

### 4.1 Add SendGrid API Key to Bubble

1. Open your Bubble app
2. Go to **Settings** (top bar)
3. Click **"Email"** tab
4. Scroll to **"SendGrid Email API"**
5. Toggle: **"Send emails using SendGrid"** → ON
6. Paste your API key in the field:
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Click **"Save"**

### 4.2 Configure Sender Address

1. Still in Email settings
2. Find **"From Address"** or **"Default from address"**
3. Enter: `noreply@yourdomain.com`
4. Set **"From Name"**: `Alquemist`
5. Click **"Save"**

### 4.3 Verify Configuration

Look for confirmation message: **"Email configuration saved"** or similar

---

## Step 5: Test Email Delivery

### 5.1 Bubble Debugger Test

1. In Bubble app, create a test button
2. Add workflow: **Send Email**
   - To: `your-email@example.com`
   - Subject: `Test from Alquemist`
   - Body: `This is a test email from SendGrid`
3. Click the button in preview mode
4. Check Bubble debugger for success/error
5. Check your inbox for the test email

### 5.2 Check SendGrid Activity

1. Go to SendGrid Dashboard
2. Click **"Mail Send"** or **"Email Activity"**
3. Look for your test email
4. Check delivery status:
   - ✅ Delivered
   - ⚠️ Opened / Clicked
   - ❌ Bounce / Complaint

### 5.3 Troubleshooting Test Failures

**Email not arriving:**
1. Check spam/junk folder
2. Verify sender address is correct
3. Ensure domain is verified in SendGrid
4. Check SendGrid activity log for errors

**Wrong sender address:**
1. Verify domain is authenticated in SendGrid
2. Double-check "From Address" in Bubble settings
3. Ensure it matches verified domain

**API key error:**
1. Verify API key is copied correctly (no extra spaces)
2. Check API key hasn't been revoked in SendGrid
3. Ensure it has email sending permissions

---

## Step 6: Production Deployment

### 6.1 Pre-Launch Checklist

Before launching to production, verify:

- [ ] Domain verified in SendGrid (✅ status)
- [ ] API key configured in Bubble
- [ ] Sender address is `noreply@yourdomain.com`
- [ ] Test email sent and received successfully
- [ ] Sender reputation is good (new accounts may have restrictions)

### 6.2 SendGrid Warming

New SendGrid accounts have **sending limits** (typically 100/day initially):

1. Send a few test emails (5-10)
2. Let SendGrid track delivery metrics
3. After 3-5 days, limits increase
4. Full limits typically unlocked after 1-2 weeks

**Workaround**: If you need higher volume immediately:
- Submit support ticket to SendGrid
- Explain your use case
- They may increase limits faster

### 6.3 Monitor Deliverability

Keep an eye on SendGrid dashboard:

1. **Email Activity**: Check delivery status
2. **Bounces**: Monitor for hard/soft bounces
3. **Spam Reports**: Monitor complaints
4. **Reputation**: View sender reputation score

---

## Step 7: Advanced Configuration (Optional)

### 7.1 Unsubscribe Management

To allow users to unsubscribe from emails:

1. In SendGrid, go to **Settings → Unsubscribe Groups**
2. Create groups:
   - Marketing emails
   - Transactional emails
   - Notifications
3. In Bubble Send Email action, select the appropriate group

### 7.2 Email Templates in SendGrid

For more complex emails, use SendGrid's template editor:

1. In SendGrid, go to **Dynamic Templates**
2. Create template with HTML/design
3. In Bubble, reference template ID instead of HTML body
4. Pass dynamic data (name, link, etc.)

### 7.3 Custom Tracking

Monitor engagement:

1. In SendGrid **Settings**, enable:
   - Opens tracking
   - Click tracking
   - Bounce tracking
2. View reports in **Mail Activity**

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | Free | 100 emails/day, Limited support |
| **Pro** | $20/month | 100,000 emails/month, Email validation, Analytics |
| **Advanced** | $50-100/month | Dedicated IP, Advanced analytics, Priority support |

**For Alquemist**: Start with Pro ($20/month) - covers thousands of emails per month.

---

## Common Issues & Solutions

### Issue: "Unable to verify domain"
**Solution**:
1. Verify DNS records are added correctly
2. Wait 24 hours for propagation
3. Use `nslookup` or `dig` to check:
   ```bash
   nslookup s1._domainkey.yourdomain.com
   ```
4. Contact SendGrid support if issue persists

### Issue: "Emails going to spam"
**Solution**:
1. Verify domain authentication (DKIM/SPF)
2. Check sender reputation in SendGrid
3. Add explicit unsubscribe link in emails
4. Ask users to mark emails as "Not Spam"

### Issue: "API key rejected by Bubble"
**Solution**:
1. Verify API key starts with `SG.`
2. Ensure no extra spaces when copying
3. Check key hasn't been revoked in SendGrid
4. Regenerate new key if needed

### Issue: "Emails have wrong sender"
**Solution**:
1. Double-check Bubble **From Address** setting
2. Ensure address matches SendGrid verified domain
3. Try format: `Alquemist <noreply@yourdomain.com>`

---

## Security Best Practices

✅ **DO:**
- Store API key in Bubble environment variables (not hard-coded)
- Use strong, unique passwords for SendGrid account
- Enable 2FA on SendGrid account
- Rotate API keys annually
- Monitor SendGrid activity logs for suspicious activity

❌ **DON'T:**
- Share API key in Slack, email, or documentation
- Commit API key to GitHub
- Use the same API key across multiple projects
- Leave old API keys enabled if you're rotating

---

## Next Steps

1. ✅ Create SendGrid account
2. ✅ Verify domain
3. ✅ Generate API key
4. ✅ Configure in Bubble
5. ✅ Test email delivery
6. **→ Update Bubble workflows** to use Send Email action
7. **→ Deploy to production**

---

## Support Resources

- **SendGrid Docs**: https://docs.sendgrid.com
- **SendGrid Support**: support@sendgrid.com
- **Bubble Email Docs**: https://bubble.io/reference#action-email-client-side
- **Alquemist API**: See PHASE-1-ONBOARDING-ENDPOINTS.md

---

**Last Updated**: November 2025
**Status**: Ready for Production
