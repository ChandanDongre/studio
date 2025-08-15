
'use client';

import { Suspense, useEffect } from 'react';
import LockScreen from '@/components/lock-screen';
import PatternLock from '@/components/pattern-lock';
import PasswordLock from '@/components/password-lock';
import { useLock } from '@/hooks/use-lock';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

function LockPageContent() {
  const { lockType, setTempAuthenticated, isTempAuthenticated } = useLock();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  // This is a safeguard. If the user is already authenticated for the session
  // and somehow lands on the lock page, immediately send them to their destination.
  useEffect(() => {
    if (isTempAuthenticated && redirectTo) {
        router.replace(redirectTo);
    }
  }, [isTempAuthenticated, router, redirectTo]);

  const onUnlock = () => {
    // Set temp authenticated state for the session
    setTempAuthenticated(true);
    // Redirect to the originally intended destination after a successful unlock
    if (redirectTo) {
        router.replace(redirectTo);
    } else {
        // Fallback to dashboard if redirectTo is missing for some reason
        router.replace('/');
    }
  };
  
  // This check prevents an error if there is no redirectTo param.
  if (!redirectTo) {
      // You can decide what to do here. Redirect to home or show an error.
      // Redirecting to home is a safe fallback.
      if (typeof window !== 'undefined') {
        router.replace('/');
      }
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <p>No redirection target specified. Returning to dashboard...</p>
        </div>
      );
  }

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
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        }>
            <LockPageContent />
        </Suspense>
    )
}
