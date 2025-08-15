
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
        // This is a simulation, so we just show a success message.
        // In a real app, you would deeplink to the actual app.
        const appName = new URLSearchParams(new URL(redirectTo, 'http://localhost').search).get('appName');
        alert(`Simulating opening ${appName || 'the app'} directly.`);
        // Then redirect to the dashboard.
        router.replace('/');
    }
  }, [isTempAuthenticated, router, redirectTo]);

  const onUnlock = () => {
    // Set temp authenticated state for the session
    setTempAuthenticated(true);
    // Redirect to the originally intended destination after a successful unlock
    if (redirectTo) {
        // This is a simulation. In a real scenario, you'd use a deeplink or other mechanism
        // to open the actual application that was locked.
        const appName = new URLSearchParams(new URL(redirectTo, 'http://localhost').search).get('appName');
        alert(`Success! Simulating opening of ${appName}.`);
        // After "opening" the app, we return to the Fortress dashboard.
        router.replace('/');
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
