# Bubble Implementation - Module 1

**User Registration Form for Alquemist**

---

## 📚 Documentation Index

Choose your learning style:

### 🏃 Quick Start (5 minutes)
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - TL;DR version
  - 1-sentence answer
  - Parameter table
  - 3-step process
  - Copy-paste examples

### 🎯 Step-by-Step (2-3 hours)
- **[BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md)** - Complete walkthrough
  - API Connector setup
  - Create 4 API calls (with exact settings)
  - Build form (element by element)
  - Add workflows (with code)
  - Testing checklist
  - Time estimates

### 🧠 Deep Dive (Understanding)
- **[PARAMETER-GUIDE.md](PARAMETER-GUIDE.md)** - Comprehensive explanation
  - What "Private" means
  - How Bubble detects parameters
  - Real-world workflow examples
  - Decision logic
  - Checklist for form

### 🎨 Visual Learning
- **[VISUAL-GUIDE.md](VISUAL-GUIDE.md)** - Diagrams and flowcharts
  - Visual examples
  - Complete flow diagrams
  - Decision trees
  - Real workflow walkthrough
  - Memory aids

### 📖 Detailed Implementation
- **[Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md)** - Full technical guide
  - Plugin setup
  - API call configuration
  - Form element details
  - Workflow examples
  - Styling guidelines
  - Troubleshooting

---

## 🚀 Getting Started

### For First-Time Users

**Start here →** [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md)

This is the most practical guide. Follow it step-by-step:
1. API Connector setup (5 min)
2. Create API calls (15 min)
3. Build form (1-2 hours)
4. Add workflows (30 min)
5. Test (30 min)

**Estimated total: 2-3 hours**

---

### For Understanding "Private" Parameters

**Start here →** [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

Get the answer in 30 seconds. Then if you want:
- Detailed explanation: [PARAMETER-GUIDE.md](PARAMETER-GUIDE.md)
- Visual examples: [VISUAL-GUIDE.md](VISUAL-GUIDE.md)

---

### For Troubleshooting

**Check:**
1. [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md#troubleshooting) - Common issues
2. [Module-1-Bubble-Guide.md](Module-1-Bubble-Guide.md#troubleshooting) - Detailed fixes

---

## 📋 What You'll Build

A registration form that:

```
User Input
    ↓
┌──────────────────────────────┐
│ Registration Form            │
├──────────────────────────────┤
│ Email: [____________]        │
│ Password: [____________]     │
│ Name: [____________]         │
│ Company: [____________]      │
│ Department: [Antioquia ▼]   │
│ Municipality: [Medellín ▼]   │
│ [Register Button]            │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│ Convex API                   │
├──────────────────────────────┤
│ Register User + Company      │
│ Auto-assign Owner role       │
│ Multi-tenant isolation       │
└──────────────────────────────┘
    ↓
✅ User Created!
📧 Send verification email
➡️  Navigate to next step
```

---

## ✅ Features Implemented

- ✅ Email validation (format + uniqueness)
- ✅ Password validation (8+ chars, letter + number)
- ✅ Colombian departments/municipalities
- ✅ Business entity type dropdown
- ✅ Company type selection
- ✅ Automatic company creation
- ✅ Owner role assignment
- ✅ Spanish language support
- ✅ Responsive design
- ✅ Form validation workflows

---

## 🔧 Prerequisites

Before starting, make sure you have:

- ✅ Bubble account created
- ✅ API Connector plugin installed (free)
- ✅ Your Convex deployment ID
  ```bash
  cat .env.local | grep CONVEX_URL
  # Output: https://[your-deployment].convex.cloud
  # Use for Bubble: [your-deployment].convex.site
  ```

---

## 📊 API Endpoints Available

All endpoints are already created and tested:

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /geographic/departments` | Get Colombian departments | ✅ Working |
| `POST /geographic/municipalities` | Get municipalities by department | ✅ Working |
| `POST /registration/check-email` | Check email availability | ✅ Working |
| `POST /registration/register` | Register user + company | ✅ Working |
| `POST /registration/login` | Login (testing) | ✅ Working |
| `GET /health` | Health check | ✅ Working |

**Base URL**: `https://[your-deployment].convex.site`

---

## 🎓 Learning Paths

### Path 1: Just Build It (No Understanding Required)

1. Follow [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md) exactly
2. Don't worry about why things work
3. Complete in 2-3 hours
4. Works perfectly!

### Path 2: Understand Everything

1. Read [QUICK-REFERENCE.md](QUICK-REFERENCE.md) (5 min)
2. Review [VISUAL-GUIDE.md](VISUAL-GUIDE.md) (15 min)
3. Read [PARAMETER-GUIDE.md](PARAMETER-GUIDE.md) (30 min)
4. Follow [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md) with understanding
5. Confident and knowledgeable!

### Path 3: Learn As You Go

1. Start with [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md)
2. When confused about a concept, jump to that section in other guides
3. Come back and continue
4. Perfect balance of practical and understanding

---

## ❓ Common Questions

### "What does 'Private' mean?"

→ See [QUICK-REFERENCE.md](QUICK-REFERENCE.md) (30 seconds)

### "How do I set up the API Connector?"

→ See [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md#part-1) (5 minutes)

### "How do I make a dropdown dynamic?"

→ See [BUBBLE-SETUP-SUMMARY.md](BUBBLE-SETUP-SUMMARY.md#34-configure-dropdowns) (step-by-step)

### "Why is my API call returning 404?"

→ See [PARAMETER-GUIDE.md](PARAMETER-GUIDE.md#cors-configuration) (common issue)

### "What's the complete workflow?"

→ See [VISUAL-GUIDE.md](VISUAL-GUIDE.md#complete-registration-form-flow) (full flowchart)

---

## 🛠 Tech Stack

**Frontend:**
- Bubble (visual builder)
- HTML/CSS (Bubble UI)
- JavaScript/API calls (Bubble workflows)

**Backend:**
- Convex (serverless database)
- HTTP Actions (REST endpoints)
- TypeScript (type safety)

**Database:**
- Convex Cloud
- Tables: companies, users, roles, geographic_locations
- Multi-tenant isolation by organization_id

---

## 📈 Implementation Checklist

- [ ] Read one guide (choose your style)
- [ ] Install API Connector in Bubble
- [ ] Configure base URL (.convex.site)
- [ ] Create 4 API calls
  - [ ] Get Departments
  - [ ] Get Municipalities
  - [ ] Check Email
  - [ ] Register User
- [ ] Build form with 12 elements
- [ ] Configure dropdowns (dynamic)
- [ ] Add workflows
  - [ ] Email validation
  - [ ] Form validation
  - [ ] Registration
- [ ] Test end-to-end
- [ ] Verify data in Convex dashboard

---

## 🚀 Next Steps

After completing Module 1:

1. **Module 2: Email Verification**
   - Send verification email
   - Create verification page
   - Activate account

2. **Module 3: Subscription & Payments**
   - Payment integration
   - Plan selection
   - Billing management

3. **Module 4: Company Profile**
   - Complete user information
   - Upload documents
   - Team member management

---

## 📞 Support

If you get stuck:

1. **Check the guides** - Most answers are here
2. **Read troubleshooting sections** - Common issues covered
3. **Review examples** - Real data and workflows shown
4. **Test each step** - Initialize API calls to verify they work

---

## 📚 Document Files

```
docs/module-1/bubble/
├── README.md                      ← You are here
├── QUICK-REFERENCE.md             ← 5 min TL;DR
├── BUBBLE-SETUP-SUMMARY.md        ← Step-by-step (2-3 hours)
├── PARAMETER-GUIDE.md             ← Deep dive
├── VISUAL-GUIDE.md                ← Diagrams
└── Module-1-Bubble-Guide.md       ← Full technical guide
```

---

## ✨ Key Features of These Guides

✅ **Multiple learning styles** - Choose what works for you
✅ **Copy-paste ready** - Code you can use directly
✅ **Visual diagrams** - Understand the concepts
✅ **Real examples** - Learn from actual workflows
✅ **Checklists** - Don't forget anything
✅ **Troubleshooting** - Common issues solved
✅ **Time estimates** - Know how long each step takes
✅ **Quick reference** - Fast answers to common questions

---

## 🎯 Success Metrics

After completing Module 1 in Bubble:

- ✅ Registration form visible and functional
- ✅ Email validation working (real-time)
- ✅ Department dropdown populated from Convex
- ✅ Municipality dropdown filters correctly
- ✅ Form validation prevents invalid submissions
- ✅ Registration creates user + company in Convex
- ✅ Success message shows confirmation
- ✅ User can navigate to email verification

---

## 📝 Notes

- **Estimated Time**: 2-3 hours total
- **Difficulty**: Beginner-friendly (no coding required)
- **Requirements**: Only Bubble account + Convex deployment
- **Support**: Guides have all answers
- **Next**: Module 2 ready when you finish

---

**Ready to start?** → Pick a guide above and begin! 🚀

---

## Document Legend

| Icon | Meaning |
|------|---------|
| 🏃 | Quick (< 5 minutes) |
| 🎯 | Step-by-step (2-3 hours) |
| 🧠 | Deep understanding |
| 🎨 | Visual/diagrams |
| 📖 | Full technical |

---

**Last Updated**: October 26, 2025
**Status**: ✅ Complete and tested
**Backend**: ✅ All endpoints working
**Ready**: ✅ To implement in Bubble
