
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function AppLaunchSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appName = searchParams.get('appName');

  if (!appName) {
    return (
       <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Error</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-6">App name not provided.</p>
            <Button onClick={() => router.replace('/')}>
              <Home className="mr-2" /> Go to Dashboard
            </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
       <CardHeader className="items-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="text-3xl">Success!</CardTitle>
       </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center">
        <p className="text-xl text-muted-foreground mb-1">
            You have successfully launched
        </p>
        <p className="text-2xl font-bold text-primary mb-6">{appName}</p>
        <p className="text-sm text-muted-foreground max-w-xs mb-8">
            This is a demonstration. In a real scenario, the {appName} app would now open.
        </p>
        <Button onClick={() => router.replace('/')} size="lg">
          <Home className="mr-2" /> Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}


export default function AppLaunchSuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Suspense fallback={<Skeleton className="h-96 w-full max-w-md" />}>
                <AppLaunchSuccessContent />
            </Suspense>
        </div>
    )
}
