
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppList from '@/components/app-list';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLock } from '@/hooks/use-lock';

export default function Home() {
  const router = useRouter();
  const { isSetupComplete, isTempAuthenticated } = useLock();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSetupComplete) {
      router.replace('/welcome');
      return;
    }
    
    // If setup is complete but the user is not authenticated for this session,
    // redirect them to the lock screen.
    if (!isTempAuthenticated) {
        router.replace('/lock?redirectTo=/');
        return;
    }

    // If we've made it this far, the user is set up and authenticated.
    setIsLoading(false);

  }, [router, isSetupComplete, isTempAuthenticated]);

  if (isLoading || !isSetupComplete || !isTempAuthenticated) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-2xl py-8 px-4">
        <AppList />
      </main>
    </div>
  );
}
