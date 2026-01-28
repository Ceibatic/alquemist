# Form Loading States Pattern

## Overview

All forms in the settings area follow an optimized loading state pattern that provides better UX by allowing users to continue editing while a save operation is in progress.

## Pattern

### What We Do

1. **Only disable the submit button** - Not the form inputs
2. **Show visual feedback on the button** - Spinner + "Guardando..." text
3. **Let users continue editing** - No blocking of the form during submission

### Implementation

```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  className="bg-[#1B5E20] hover:bg-[#1B5E20]/90"
>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Guardando...
    </>
  ) : (
    'Guardar Cambios'
  )}
</Button>
```

### Why This Pattern

1. **Non-blocking UX** - Users can continue editing other fields while one section saves
2. **Clear feedback** - Visual indicator shows the save is in progress
3. **Prevent double-submission** - Button is disabled during submission
4. **Form remains interactive** - All inputs stay enabled for continuous editing

## Forms Using This Pattern

### Account Settings
- `/components/settings/profile-form.tsx`
- `/components/settings/security-form.tsx`
- `/components/settings/preferences-form.tsx`
- `/components/settings/user-notifications-form.tsx`

### Facility Settings
- `/components/settings/general-info-form.tsx`
- `/components/settings/location-form.tsx`
- `/components/settings/license-form.tsx`
- `/components/settings/operations-form.tsx`
- `/components/settings/facility-notifications-form.tsx`

## Future Enhancement: Optimistic Updates

For even better UX, consider implementing optimistic updates using Convex's `optimisticUpdate` feature:

```tsx
const updateProfile = useMutation(api.users.updateProfile);

// In the future, we could add optimistic updates:
const onSubmit = async (data) => {
  // Optimistically update the UI immediately
  // Then send the mutation to the server
  // Auto-rollback if the mutation fails

  await updateProfile({
    userId,
    ...data,
  });
};
```

This would make the UI feel even more responsive by updating immediately and rolling back only if the server operation fails.

## Anti-Pattern (What We Don't Do)

```tsx
// DON'T DO THIS - Disabling inputs blocks the user
<Input
  {...register('name')}
  disabled={isSubmitting}  // ❌ Bad: User can't edit during save
/>

<Button type="submit" disabled={isSubmitting}>
  Guardar
</Button>
```

## Key Takeaway

**The form stays interactive during submission.** Only the submit button is disabled to prevent double-submission. This provides a smoother, more modern UX that respects the user's time.
