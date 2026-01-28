import { Suspense } from 'react';
import { UserProfileContent } from '@/components/users/user-profile-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfilePage() {
  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfileContent />
    </Suspense>
  );
}

function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-96" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
