
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppList from '@/components/app-list';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLock } from '@/hooks/use-lock';

export default function Home() {
  const router = useRouter();
  const { isSetupComplete, isLoading, isTempAuthenticated } = useLock();

  useEffect(() => {
    // Wait until the persisted state is loaded.
    if (isLoading) {
      return;
    }

    // If setup isn't done, go to the welcome screen.
    if (!isSetupComplete) {
      router.replace('/welcome');
      return;
    }

    // If setup is done but the user hasn't authenticated this session, go to lock screen.
    if (!isTempAuthenticated) {
      router.replace('/lock');
    }
  }, [router, isSetupComplete, isLoading, isTempAuthenticated]);

  // While loading or if the user needs to be redirected, show a loading skeleton.
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

  // Otherwise, show the main dashboard.
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-2xl py-8 px-4">
        <AppList />
      </main>
    </div>
  );
}
