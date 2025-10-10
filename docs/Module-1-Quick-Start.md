# Module 1: Quick Start Guide

**Ready to implement?** This is your TL;DR version of the full planning doc.

---

## 🎯 What We're Building (MVP)

**Company & Facility Setup Interface** - The first real UI after login

### MVP Features (10-12 hours)
1. ✅ **Company Profile** - View and edit company information
2. ✅ **Facilities List** - Browse all facilities with search/filter
3. ✅ **Create Facility** - 3-step wizard to add new facility
4. ✅ **Facility Details** - Overview and license information
5. ✅ **License Alerts** - Visual indicators for expiring licenses

### Deferred to Later
- Logo upload
- Document management
- Advanced area layouts
- Team member invitations (use Clerk's UI for now)

---

## 📐 Navigation Structure

```
Dashboard (/) - Landing after login
│
├─ Company Profile (/company)
│  └─ Edit company info in-place
│
├─ Facilities (/facilities)
│  ├─ List view with search/filter
│  ├─ Create New (/facilities/new) - 3-step wizard
│  │  ├─ Step 1: Basic Info
│  │  ├─ Step 2: Location
│  │  └─ Step 3: License
│  │
│  └─ Facility Details (/facilities/[id])
│     ├─ Overview Tab
│     ├─ License Tab
│     ├─ Areas Tab (basic list)
│     └─ Team Tab (future)
│
└─ Team (/team) - Future Module
```

---

## 🏗️ File Structure to Create

```
app/(authenticated)/              # NEW: Auth-guarded layout
├─ layout.tsx                     # Sidebar + navigation
├─ dashboard/page.tsx             # UPDATE: Better dashboard
├─ company/page.tsx               # NEW: Company profile
├─ facilities/
│  ├─ page.tsx                    # NEW: List facilities
│  ├─ new/page.tsx               # NEW: Create wizard
│  └─ [facilityId]/
│     ├─ page.tsx                # NEW: Details with tabs
│     └─ edit/page.tsx           # NEW: Edit form

components/
├─ layout/
│  ├─ Sidebar.tsx                # NEW
│  └─ PageHeader.tsx             # NEW
├─ company/
│  └─ CompanyEditForm.tsx        # NEW
├─ facilities/
│  ├─ FacilityCard.tsx           # NEW
│  ├─ FacilityList.tsx           # NEW
│  └─ FacilityWizard/            # NEW: 3 step components
└─ ui/
   └─ EmptyState.tsx             # NEW

lib/hooks/
├─ useCurrentCompany.ts          # NEW
├─ useCurrentUser.ts             # NEW
└─ useFacilities.ts              # NEW
```

---

## 🚀 Implementation Order

### Day 1: Setup & Company Profile (4-5 hours)

**Session 1: Project Setup (1.5 hours)**
```bash
# Install dependencies
npm install react-hook-form @hookform/resolvers zod sonner date-fns

# Add shadcn components
npx shadcn@latest add card button input label form select tabs badge dialog alert
```

**Tasks:**
- [ ] Create `(authenticated)` layout with sidebar
- [ ] Build Sidebar navigation component
- [ ] Create PageHeader reusable component
- [ ] Add useCurrentCompany hook

**Session 2: Company Profile (2.5 hours)**
- [ ] Create `/company/page.tsx` with data display
- [ ] Build CompanyEditForm with validation
- [ ] Test edit flow with real data

---

### Day 2: Facilities List & Details (4-5 hours)

**Session 3: Facilities List (2.5 hours)**
- [ ] Create `/facilities/page.tsx`
- [ ] Build FacilityCard component
- [ ] Add search and filter functionality
- [ ] Empty state for new users
- [ ] Pagination controls

**Session 4: Facility Details (2 hours)**
- [ ] Create `/facilities/[facilityId]/page.tsx`
- [ ] Build tabbed layout (Overview | License)
- [ ] License expiration badge component
- [ ] Edit button routing

---

### Day 3: Create Facility Wizard (4 hours)

**Session 5: Wizard Flow (4 hours)**
- [ ] Create `/facilities/new/page.tsx`
- [ ] Build multi-step form structure
- [ ] Step 1: Basic info (name, type, description)
- [ ] Step 2: Location (address, area sizes)
- [ ] Step 3: License (number, authority, expiration)
- [ ] Submit integration with API
- [ ] Success redirect

---

## 🧪 Testing Checklist

### After Each Session
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Mobile responsive (test at 375px width)
- [ ] Test with actual Clerk user session

### Final Testing
- [ ] Create company via UI
- [ ] Edit company information
- [ ] Create 3 different facility types
- [ ] Search and filter facilities
- [ ] View facility details
- [ ] License expiration colors working
- [ ] Switch Clerk organizations - verify isolation

---

## 💡 Key Patterns to Use

### 1. Convex React Hooks
```typescript
// In your component
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Real-time query
const company = useQuery(api.companies.getByOrganizationId, {
  organizationId: auth.orgId!
});

// Mutation
const updateCompany = useMutation(api.companies.update);
await updateCompany({ id: company._id, name: "New Name" });
```

### 2. React Hook Form + Zod
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  taxId: z.string().regex(/^\d{9}-\d$/, "Invalid NIT format")
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: company
});
```

### 3. Toast Notifications
```typescript
import { toast } from "sonner";

// Success
toast.success("Company updated successfully!");

// Error
toast.error("Failed to update company");
```

---

## 🎨 Design Tokens

### Colors
```css
--primary: Emerald-600 (#059669)
--danger: Red-600 (#dc2626)
--warning: Amber-500 (#f59e0b)
--success: Green-600 (#16a34a)
```

### License Expiration Colors
- **Green**: >60 days remaining
- **Yellow**: 30-60 days remaining
- **Red**: <30 days remaining
- **Gray**: Expired

---

## ❓ Quick Decisions

### Q: Convex or REST API?
**A:** Use Convex hooks in Next.js components for real-time updates. Keep REST API for Bubble integration.

### Q: File uploads for logos/documents?
**A:** Defer to Module 2. Focus on core CRUD first.

### Q: Team management?
**A:** Use Clerk's built-in org member management for MVP. Build custom UI in Module 5.

### Q: Area management?
**A:** Simple list in Facility Details for MVP. Advanced layout view in Module 2.

---

## 🚨 Common Pitfalls to Avoid

1. **Don't forget auth guards** - Use Clerk's `auth()` in every server component
2. **Multi-tenancy everywhere** - Always filter by `companyId`
3. **Loading states** - Use Convex's `useQuery()` return value to show skeletons
4. **Error handling** - Wrap mutations in try-catch, show toast errors
5. **Mobile first** - Design for 375px width, then scale up

---

## 📚 References

- **Full Planning Doc:** [Module-1-Planning.md](Module-1-Planning.md)
- **API Docs:** [API-Integration.md](API-Integration.md)
- **Database Schema:** [Database-Schema.md](Database-Schema.md)
- **Convex Docs:** https://docs.convex.dev/
- **shadcn/ui:** https://ui.shadcn.com/

---

## ✅ Definition of Done

Module 1 is complete when:
- [ ] All 5 MVP features working
- [ ] Manual testing checklist passed
- [ ] Responsive on mobile/tablet/desktop
- [ ] Multi-tenant isolation verified
- [ ] No TypeScript or console errors
- [ ] Screenshots captured for docs
- [ ] Ready to demo to user

---

**Ready to start?**

Pick a session and let's build! 🚀

**Suggested First Command:**
```
@implement module-1-session-1
```

This will start with the layout and project setup.
