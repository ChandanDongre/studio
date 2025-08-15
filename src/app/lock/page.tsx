
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
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    // If user is already authenticated (e.g. via a previous unlock), just redirect.
    if (isTempAuthenticated) {
        router.replace(redirectTo);
    }
  }, [isTempAuthenticated, router, redirectTo]);

  const onUnlock = () => {
    // Set temp authenticated state for the session
    setTempAuthenticated(true);
    // Redirect to the originally intended destination
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
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        }>
            <LockPageContent />
        </Suspense>
    )
}
