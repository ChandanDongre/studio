'use client';

import LockScreen from '@/components/lock-screen';
import PatternLock from '@/components/pattern-lock';
import PasswordLock from '@/components/password-lock';
import { useLock } from '@/hooks/use-lock';
import { Skeleton } from '@/components/ui/skeleton';

export default function LockPage() {
  const { lockType, isLoading } = useLock();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-14 w-full mt-8" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-10 w-1/3 mx-auto" />
        </div>
      </div>
    )
  }

  if (lockType === 'pin') return <LockScreen />;
  if (lockType === 'pattern') return <PatternLock />;
  if (lockType === 'password') return <PasswordLock />;

  return <LockScreen />; // Default fallback
}
