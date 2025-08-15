'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, Lock, ShieldQuestion, Fingerprint } from 'lucide-react';
import Header from '@/components/header';
import { useLock } from '@/hooks/use-lock';
import PatternSetup from '@/components/pattern-setup';
import PasswordSetup from '@/components/password-setup';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type SecurityView = 'main' | 'pin' | 'pattern' | 'password';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern, setPassword, pin, isBiometricsEnabled, toggleBiometrics, isSetupComplete } = useLock();
  
  const [currentView, setCurrentView] = useState<SecurityView>('main');
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

   useEffect(() => {
    // If setup is not complete, redirect to welcome page
    if (!isSetupComplete) {
      router.replace('/welcome');
    } else {
      setIsReady(true);
    }
  }, [router, isSetupComplete]);
  
   useEffect(() => {
    // Reset view if user navigates away and comes back
    setCurrentView('main');
  }, []);

  const handlePinChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const storedPin = pin || "1234";

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
    setLockType('pin');
    toast({
      title: 'Success!',
      description: 'Your PIN has been updated.',
    });
    
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setIsLoading(false);
    setCurrentView('main');
  };

  const handlePatternSet = (pattern: number[]) => {
    setPattern(pattern);
    setLockType('pattern');
    toast({
      title: 'Success!',
      description: 'Your pattern has been updated.',
    });
    setCurrentView('main');
  }

  const handlePasswordSet = (newPassword: string) => {
    setPassword(newPassword);
    setLockType('password');
    toast({
      title: 'Success!',
      description: 'Your password has been updated.',
    });
    setCurrentView('main');
  }
  
  const getLockTypeDescription = () => {
    switch (lockType) {
      case 'pin': return 'PIN Code';
      case 'pattern': return 'Pattern Lock';
      case 'password': return 'Password';
      default: return 'Unknown';
    }
  };

  const renderContent = () => {
    switch(currentView) {
        case 'pin':
            return (
                <>
                    <CardHeader>
                        <CardTitle>Change PIN</CardTitle>
                        <CardDescription>Update your existing PIN.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setCurrentView('main')} className="w-full">Cancel</Button>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </>
            );
        case 'pattern':
            return (
                <>
                    <CardHeader>
                        <CardTitle>Set New Pattern</CardTitle>
                        <CardDescription>Draw your new unlock pattern.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <PatternSetup onPatternSet={handlePatternSet} />
                        <Button type="button" variant="outline" onClick={() => setCurrentView('main')} className="w-full mt-4 max-w-sm">Cancel</Button>
                    </CardContent>
                </>
            );
        case 'password':
            return (
                 <>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Set a new password for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <PasswordSetup onPasswordSet={handlePasswordSet} isChangeMode={true} onCancel={() => setCurrentView('main')} />
                    </CardContent>
                </>
            );
        case 'main':
        default:
            return (
                 <>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage your lock type and credentials.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-medium">Lock Method</h3>
                                <p className="text-sm text-muted-foreground">{getLockTypeDescription()}</p>
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">Change</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Change Lock Method</AlertDialogTitle>
                                        <AlertDialogDescription>
                                           Select your new preferred lock method. You will be asked to set it up in the next step.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="grid grid-cols-1 gap-4 py-4">
                                        <Button variant={lockType === 'pin' ? 'default' : 'outline'} size="lg" onClick={() => { setCurrentView('pin'); }}>
                                            <KeyRound className="mr-2"/> PIN Code
                                        </Button>
                                        <Button variant={lockType === 'pattern' ? 'default' : 'outline'} size="lg" onClick={() => { setCurrentView('pattern'); }}>
                                            <Lock className="mr-2"/> Pattern
                                        </Button>
                                        <Button variant={lockType === 'password' ? 'default' : 'outline'} size="lg" onClick={() => { setCurrentView('password'); }}>
                                            <ShieldQuestion className="mr-2"/> Password
                                        </Button>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-medium">Fingerprint Unlock</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isBiometricsEnabled ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                             <Switch
                                checked={isBiometricsEnabled}
                                onCheckedChange={toggleBiometrics}
                                aria-label="Toggle Fingerprint Unlock"
                            />
                        </div>
                    </CardContent>
                </>
            )
    }
  }


  if (!isReady) {
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
                        <Skeleton className="h-24 w-full mt-4" />
                        <Skeleton className="h-24 w-full mt-4" />
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
            <Button variant="ghost" onClick={() => currentView !== 'main' ? setCurrentView('main') : router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                {renderContent()}
            </Card>
        </main>
    </div>
  );
}
