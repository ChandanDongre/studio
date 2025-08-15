'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/header';

const PIN_STORAGE_KEY = 'fortress-pin';
const DEFAULT_PIN = "1234";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const storedPin = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;

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

    localStorage.setItem(PIN_STORAGE_KEY, newPin);
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

  if (!isAuthenticated) {
    return null; // Or a loading skeleton
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
                <CardTitle>Change PIN</CardTitle>
                <CardDescription>Update your Fortress unlock PIN.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
