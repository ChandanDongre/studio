'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';
import Header from '@/components/header';
import { useLock } from '@/hooks/use-lock';
import PatternSetup from '@/components/pattern-setup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern } = useLock();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

   useEffect(() => {
    const unlocked = localStorage.getItem('fortress-unlocked') === 'true';
    if (!unlocked) {
      router.replace('/lock');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handlePinChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const storedPin = localStorage.getItem('fortress-pin') || "1234";

    if (currentPin !== storedPin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Current PIN is incorrect.',
      });
      setIsLoading(false);
      return;
    }

    if (newPin.length < 4) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'New PIN must be at least 4 digits.',
        });
        setIsLoading(false);
        return;
    }

    if (newPin !== confirmNewPin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New PINs do not match.',
      });
      setIsLoading(false);
      return;
    }

    setPin(newPin);
    toast({
      title: 'Success!',
      description: 'Your PIN has been updated.',
    });
    
    // Reset form
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setIsLoading(false);
  };

  const handlePatternSet = (pattern: number[]) => {
    setPattern(pattern);
     toast({
      title: 'Success!',
      description: 'Your pattern has been updated.',
    });
  }

  if (!isAuthenticated) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-2xl space-y-4">
                <div className="h-16" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full mt-4" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto max-w-2xl py-8 px-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your lock type and credentials.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={lockType} onValueChange={(value) => setLockType(value as 'pin' | 'pattern')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pin"><KeyRound className="mr-2"/> PIN Lock</TabsTrigger>
                            <TabsTrigger value="pattern"><Lock className="mr-2"/> Pattern Lock</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pin" className="pt-4">
                            <h3 className="text-lg font-medium mb-4">Change PIN</h3>
                             <form onSubmit={handlePinChange} className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="current-pin">Current PIN</Label>
                                <Input
                                    id="current-pin"
                                    type="password"
                                    inputMode="numeric"
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value)}
                                    required
                                />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="new-pin">New PIN</Label>
                                <Input
                                    id="new-pin"
                                    type="password"
                                    inputMode="numeric"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    required
                                    minLength={4}
                                />
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="confirm-new-pin">Confirm New PIN</Label>
                                <Input
                                    id="confirm-new-pin"
                                    type="password"
                                    inputMode="numeric"
                                    value={confirmNewPin}
                                    onChange={(e) => setConfirmNewPin(e.target.value)}
                                    required
                                    minLength={4}
                                />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="pattern" className="pt-4">
                            <h3 className="text-lg font-medium mb-4">Set New Pattern</h3>
                            <PatternSetup onPatternSet={handlePatternSet} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
