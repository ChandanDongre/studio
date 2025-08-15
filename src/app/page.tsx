'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppList from '@/components/app-list';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLock } from '@/hooks/use-lock';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isTempUnlocked, isSetupComplete } = useLock();

  useEffect(() => {
    if (!isSetupComplete) {
      router.replace('/welcome');
      return;
    }

    const unlocked = localStorage.getItem('fortress-unlocked') === 'true' || isTempUnlocked;
    if (!unlocked) {
      router.replace('/lock');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, isTempUnlocked, isSetupComplete]);

  if (!isAuthenticated || !isSetupComplete) {
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
