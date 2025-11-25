# Email Setup Roadmap

**Complete guide to getting email working in Alquemist**

---

## Overview

This document guides you through setting up email for your Alquemist app. The process involves three main steps:

1. **Backend**: Already done ✅ (Convex migrated to Bubble native)
2. **Infrastructure**: Set up SendGrid account
3. **Frontend**: Configure Bubble workflows

**Total Time**: ~45 minutes
**Difficulty**: Easy (no coding required)

---

## Architecture Diagram

```
User Registration (Bubble)
    ↓
Convex API: registerUserStep1
    ├─ Creates user
    ├─ Creates token
    ├─ Generates HTML
    └─ Returns: emailHtml, emailText, emailSubject
    ↓
Bubble Workflow
    ├─ Receives API response
    ├─ Sends Email (Native Bubble + SendGrid)
    │  ├─ To: response.email
    │  ├─ Subject: response.emailSubject
    │  └─ Body: response.emailHtml
    └─ Shows success message
    ↓
User Receives Email
    ├─ With verification link containing token
    ├─ Clicks link
    └─ Email gets verified
```

---

## Reading Order

### Phase 1: Understand the New Architecture (5 minutes)
**Start here**: Read these files in order

1. **[BUBBLE-IMPLEMENTATION-GUIDE.md](BUBBLE-IMPLEMENTATION-GUIDE.md)**
   - Section: "Email Sending Architecture (Native Bubble)"
   - Understand: How email flow changed from Resend to Bubble native
   - Know by end: Why we switched and what the benefits are

2. **[PHASE-1-ONBOARDING-ENDPOINTS.md](api/PHASE-1-ONBOARDING-ENDPOINTS.md)**
   - Section: "Register User (Step 1)" - "Complete Response"
   - Understand: What the API returns
   - Know by end: Fields include emailHtml, emailText, emailSubject

### Phase 2: Set Up SendGrid Infrastructure (20 minutes)
**Time to get hands-on**: Follow [SENDGRID-SETUP-GUIDE.md](SENDGRID-SETUP-GUIDE.md)

**Steps**:
1. Create SendGrid account
2. Verify your domain (DKIM/SPF)
3. Generate API key
4. Configure in Bubble settings
5. Test with sample email

**By end**: You'll have SendGrid configured and tested

**Checkpoint**:
- [ ] SendGrid account created
- [ ] Domain verified (✅ status in SendGrid)
- [ ] API key generated and copied
- [ ] API key configured in Bubble
- [ ] Test email sent and received

### Phase 3: Implement Email Workflows in Bubble (15 minutes)
**Time to configure Bubble**: Follow [BUBBLE-EMAIL-WORKFLOW-SETUP.md](BUBBLE-EMAIL-WORKFLOW-SETUP.md)

**Steps**:
1. Open registration workflow
2. Add "Send Email" action after API call
3. Map fields from API response to Send Email
4. Add verification page workflow
5. Test complete flow

**By end**: Registration emails are sending

**Checkpoint**:
- [ ] Workflow includes Send Email action
- [ ] Fields mapped correctly (To, Subject, Body)
- [ ] Test registration sends email
- [ ] Email contains verification link
- [ ] Verification page recognizes token

### Phase 4: Troubleshooting (Ongoing)
**Reference doc**: [EMAIL-TROUBLESHOOTING.md](EMAIL-TROUBLESHOOTING.md)

When something doesn't work:
1. Identify the symptom (email not received, token error, etc.)
2. Go to troubleshooting guide
3. Follow diagnosis steps
4. Apply solution

---

## Quick Start Checklist

### ✅ Pre-requisites (Should Already Be Done)
- [ ] Convex backend migrated to Bubble native email
- [ ] You have a Bubble app running
- [ ] You have access to domain DNS settings
- [ ] You have access to Bubble settings

### ✅ Phase 1: SendGrid Account (15 minutes)

```
Task: Create SendGrid Account
Time: 5 minutes
Doc: SENDGRID-SETUP-GUIDE.md → Step 1

Do:
1. Go to sendgrid.com
2. Click Sign Up
3. Fill registration form
4. Verify email
5. ✅ Done
```

```
Task: Verify Domain
Time: 5 minutes
Doc: SENDGRID-SETUP-GUIDE.md → Step 2

Do:
1. In SendGrid, go to Sender Authentication
2. Choose domain verification method
3. Add DNS records (or use automatic)
4. Click Verify
5. Wait for status to show ✅ Verified
```

```
Task: Create API Key
Time: 3 minutes
Doc: SENDGRID-SETUP-GUIDE.md → Step 3

Do:
1. In SendGrid, go to API Keys
2. Click Create API Key
3. Copy the key (starts with SG.)
4. Store in safe place
5. ✅ Ready for next step
```

### ✅ Phase 2: Bubble Configuration (10 minutes)

```
Task: Add SendGrid API Key to Bubble
Time: 2 minutes
Doc: SENDGRID-SETUP-GUIDE.md → Step 4

Do:
1. Open Bubble Settings
2. Go to Email tab
3. Paste API key
4. Set From Address: noreply@yourdomain.com
5. Save
6. ✅ Configured
```

```
Task: Test Email Sending
Time: 5 minutes
Doc: SENDGRID-SETUP-GUIDE.md → Step 5

Do:
1. Create test workflow in Bubble
2. Send Email to your address
3. Check inbox for test email
4. Verify it came from noreply@yourdomain.com
5. ✅ Working
```

### ✅ Phase 3: Registration Workflow (15 minutes)

```
Task: Add Send Email to Registration Workflow
Time: 10 minutes
Doc: BUBBLE-EMAIL-WORKFLOW-SETUP.md → Part 1

Do:
1. Open registration page
2. Find registration button workflow
3. After API call step, add "Send Email"
4. Map fields:
   - To: response email
   - Subject: response emailSubject
   - Body: response emailHtml
5. Save workflow
6. ✅ Email action added
```

```
Task: Test Complete Registration Flow
Time: 5 minutes
Doc: BUBBLE-EMAIL-WORKFLOW-SETUP.md → Part 4

Do:
1. Go to Bubble preview
2. Complete registration with test email
3. Check inbox for verification email
4. Click verification link
5. Verify email shows success
6. ✅ Complete flow working
```

---

## Documentation Map

### Architecture & Design
- **BUBBLE-IMPLEMENTATION-GUIDE.md** - Email sending architecture section
  - Why Bubble native instead of Resend
  - How the flow works
  - Architecture benefits

### Setup & Configuration
- **SENDGRID-SETUP-GUIDE.md** - Complete SendGrid setup (20 minutes)
  - Account creation
  - Domain verification (DNS setup)
  - API key generation
  - Bubble integration
  - Testing

- **BUBBLE-EMAIL-WORKFLOW-SETUP.md** - Bubble workflow setup (15 minutes)
  - Exact workflow configuration steps
  - Field mapping from API
  - Testing procedures
  - Customization options

### API Reference
- **PHASE-1-ONBOARDING-ENDPOINTS.md** - API endpoint details
  - Request/response structure
  - Available response fields
  - Example curl commands

### Troubleshooting & Support
- **EMAIL-TROUBLESHOOTING.md** - Problem solving guide
  - Email not received
  - API errors
  - Content issues
  - Token verification
  - SendGrid problems

### Guides & How-Tos
- **Authentication-Guide.md** - Authentication flow
  - Registration flow with email verification
  - Login and sessions
  - Company setup

---

## Timeline

### Week 1: Setup (45 minutes)

| Task | Time | Status |
|------|------|--------|
| Create SendGrid account | 5 min | ⏳ To do |
| Verify domain | 10 min | ⏳ To do |
| Generate API key | 3 min | ⏳ To do |
| Configure Bubble | 2 min | ⏳ To do |
| Test email sending | 5 min | ⏳ To do |
| Add workflow to registration | 10 min | ⏳ To do |
| Test complete flow | 5 min | ⏳ To do |
| **Total** | **40 min** | ⏳ To do |

### Week 2: Monitoring & Optimization (Ongoing)
- Monitor SendGrid metrics
- Check delivery rates
- Optimize email templates
- Scale testing to more users

### Week 3+: Production
- Go live with email verification
- Monitor in production
- Watch for issues
- Optimize based on metrics

---

## Key Decisions Made for You

✅ **Email Provider**: SendGrid (via Bubble native)
- Reason: Better integration than Resend, free or low-cost, better deliverability

✅ **Sending Location**: Bubble (not Convex)
- Reason: Better UX (show loading state), more control, simpler backend

✅ **Template Format**: HTML with inline CSS
- Reason: Works in all email clients, no external dependencies

✅ **Token Security**: 32-char alphanumeric, 24-hour expiry, one-time use
- Reason: Balances security with user experience

---

## Success Criteria

After completing all steps, you should have:

✅ **Backend (Already Done)**
- [x] Convex generates email HTML
- [x] API returns emailHtml, emailText, emailSubject
- [x] No external email service calls from backend

✅ **Infrastructure**
- [ ] SendGrid account created
- [ ] Domain verified and authenticated
- [ ] API key generated
- [ ] Bubble configured with API key

✅ **Frontend**
- [ ] Registration workflow includes Send Email action
- [ ] Emails send on successful registration
- [ ] Verification links work
- [ ] Token validation succeeds

✅ **Testing**
- [ ] Manual test email sends successfully
- [ ] Registration test email received
- [ ] Verification link clicks through
- [ ] Email shows in user's inbox (not spam)

---

## Common Questions

### Q: Do I need to pay for SendGrid?
**A**: No, starting is free (100 emails/day). At scale, Pro plan is $20/month.

### Q: Can I test without a real domain?
**A**: Yes, use Bubble's shared SendGrid for testing. Switch to custom SendGrid for production.

### Q: How long does domain verification take?
**A**: Usually instant with automatic setup, or up to 24 hours for manual DNS.

### Q: What if emails go to spam?
**A**: Domain verification solves this 99% of the time. See troubleshooting guide.

### Q: Can I customize the email template?
**A**: Yes, edit `convex/email.ts` → `generateVerificationEmailHTML()`

### Q: How do I handle email delivery failures?
**A**: Check troubleshooting guide. Most issues are DNS, API key, or spam folder.

---

## Getting Help

If you get stuck:

1. **Check the docs** in this order:
   - Related guide (Setup, Workflow, or Troubleshooting)
   - Relevant endpoint documentation
   - Architecture overview

2. **Debug systematically**:
   - Use Bubble debugger to check API response
   - Check SendGrid activity log for delivery status
   - Check spam/junk folders
   - Follow troubleshooting checklist

3. **Contact support**:
   - SendGrid: support@sendgrid.com
   - Bubble: bubble.io support
   - Alquemist team: your contacts

---

## Next Steps

1. **Right now**: Read SENDGRID-SETUP-GUIDE.md (15 minutes)
2. **Next hour**: Create SendGrid account and verify domain (20 minutes)
3. **Next step**: Read BUBBLE-EMAIL-WORKFLOW-SETUP.md (5 minutes)
4. **Then**: Configure Bubble workflows (10 minutes)
5. **Finally**: Test and verify everything works (5 minutes)

**Total Time Investment**: ~1 hour for complete setup

---

**Last Updated**: November 2025
**Status**: Ready for Production
**Maintained By**: Alquemist Development Team
