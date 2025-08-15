
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppList from '@/components/app-list';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLock } from '@/hooks/use-lock';

export default function Home() {
  const router = useRouter();
  const { isSetupComplete, isTempAuthenticated, isLoading } = useLock();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isSetupComplete) {
      router.replace('/welcome');
    } else if (!isTempAuthenticated) {
      router.replace('/lock');
    }
  }, [router, isSetupComplete, isTempAuthenticated, isLoading]);

  // If the page is loading, or if the setup isn't complete yet, or if the user is not authenticated for the session
  // show a skeleton loader. This prevents a flash of content and handles all redirection cases.
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
