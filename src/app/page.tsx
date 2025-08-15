
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppList from '@/components/app-list';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLock } from '@/hooks/use-lock';

export default function Home() {
  const router = useRouter();
  const { isSetupComplete, isLoading } = useLock();

  useEffect(() => {
    // Wait until zustand has rehydrated from localStorage
    if (isLoading) {
      return;
    }
    // If setup isn't complete, redirect to the welcome page for the setup flow.
    if (!isSetupComplete) {
      router.replace('/welcome');
    }
  }, [router, isSetupComplete, isLoading]);

  // Show a skeleton loader while waiting for the state to be ready
  if (isLoading || !isSetupComplete) {
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

  // Once loading is complete and setup is done, show the main dashboard.
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-2xl py-8 px-4">
        <AppList />
      </main>
    </div>
  );
}
