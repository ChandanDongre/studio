'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Shield className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-foreground">Welcome to Fortress</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The ultimate tool to secure your applications. Let's get your digital vault set up.
      </p>
      <Button
        onClick={() => router.push('/setup')}
        size="lg"
        className="mt-8"
      >
        Get Started
      </Button>
    </div>
  );
}
