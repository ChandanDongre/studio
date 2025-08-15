
'use client';

import { Suspense, useEffect } from 'react';
import LockScreen from '@/components/lock-screen';
import PatternLock from '@/components/pattern-lock';
import PasswordLock from '@/components/password-lock';
import { useLock } from '@/hooks/use-lock';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

function LockPageContent() {
  const { lockType, isSetupComplete, setTempAuthenticated } = useLock();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    if (!isSetupComplete) {
      router.replace('/welcome');
    }
  }, [isSetupComplete, router]);

  const onUnlock = () => {
    // Set temp authenticated state for the session
    setTempAuthenticated(true);
    router.replace(redirectTo);
  };

  if (!isSetupComplete) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        </div>
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
                </div>
            </div>
        }>
            <LockPageContent />
        </Suspense>
    )
}
