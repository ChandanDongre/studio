
'use client';

import { Suspense, useEffect } from 'react';
import LockScreen from '@/components/lock-screen';
import PatternLock from '@/components/pattern-lock';
import PasswordLock from '@/components/password-lock';
import { useLock } from '@/hooks/use-lock';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

function LockPageContent() {
  const { lockType, isLoading, isSetupComplete, isTempAuthenticated } = useLock();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    if (isLoading) return;
    
    // If setup isn't done, user should be at welcome screen.
    if (!isSetupComplete) {
      router.replace('/welcome');
      return;
    }
    
    // If user is already authenticated for this session, send them to their destination.
    // This is a key part of preventing the redirect loop.
    if (isTempAuthenticated) {
      router.replace(redirectTo);
      return;
    }

  }, [isSetupComplete, isTempAuthenticated, isLoading, router, redirectTo]);

  // While loading or if a redirect is happening, show a skeleton.
  if (isLoading || !isSetupComplete || isTempAuthenticated) {
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

  const onUnlock = () => {
    router.replace(redirectTo);
  };

  if (lockType === 'pin') return <LockScreen onUnlock={onUnlock} />;
  if (lockType === 'pattern') return <PatternLock onUnlock={onUnlock} />;
  if (lockType === 'password') return <PasswordLock onUnlock={onUnlock} />;

  return <LockScreen onUnlock={onUnlock} />; // Default fallback
}

export default function LockPage() {
    return (
        <Suspense fallback={
             <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <Skeleton className="mx-auto h-20 w-20 rounded-full" />
                </div>
            </div>
        }>
            <LockPageContent />
        </Suspense>
    )
}
