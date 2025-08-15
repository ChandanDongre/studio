
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
import LockScreen from '@/components/lock-screen';
import PatternLock from '@/components/pattern-lock';
import PasswordLock from '@/components/password-lock';
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

type SecurityView = 'main' | 'pin' | 'pattern' | 'password' | 'authenticate';
type LockMethod = 'pin' | 'pattern' | 'password';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern, setPassword, pin, password, pattern, isBiometricsEnabled, toggleBiometrics, isSetupComplete } = useLock();
  
  const [currentView, setCurrentView] = useState<SecurityView>('main');
  const [nextView, setNextView] = useState<LockMethod | null>(null);
  
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

   useEffect(() => {
    if (!isSetupComplete) {
      router.replace('/welcome');
    } else {
      setIsReady(true);
    }
  }, [router, isSetupComplete]);
  
   useEffect(() => {
    setCurrentView('main');
  }, []);

  const handleStartChange = (targetView: LockMethod) => {
    setNextView(targetView);
    setCurrentView('authenticate');
  }

  const handleAuthenticationSuccess = () => {
    if (nextView) {
      setCurrentView(nextView);
      setNextView(null);
    } else {
        // Fallback to main if something went wrong
        setCurrentView('main');
    }
  };


  const handlePinChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

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
      description: 'Your PIN has been set.',
    });
    
    setNewPin('');
    setConfirmNewPin('');
    setIsLoading(false);
    setCurrentView('main');
  };

  const handlePatternSet = (newPattern: number[]) => {
    setPattern(newPattern);
    setLockType('pattern');
    toast({
      title: 'Success!',
      description: 'Your pattern has been set.',
    });
    setCurrentView('main');
  }

  const handlePasswordSet = (newPassword: string) => {
    setPassword(newPassword);
    setLockType('password');
    toast({
      title: 'Success!',
      description: 'Your password has been set.',
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
        case 'authenticate':
            return (
                <>
                    <CardHeader>
                        <CardTitle>Verify It's You</CardTitle>
                        <CardDescription>Please enter your current {getLockTypeDescription()} to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        {lockType === 'pin' && <LockScreen onUnlock={handleAuthenticationSuccess} isPage={false} />}
                        {lockType === 'pattern' && <PatternLock onUnlock={handleAuthenticationSuccess} isPage={false} />}
                        {lockType === 'password' && <PasswordLock onUnlock={handleAuthenticationSuccess} isPage={false} />}
                        <Button type="button" variant="outline" onClick={() => setCurrentView('main')} className="w-full mt-4 max-w-sm">Cancel</Button>
                    </CardContent>
                </>
            );
        case 'pin':
            return (
                <>
                    <CardHeader>
                        <CardTitle>Set New PIN</CardTitle>
                        <CardDescription>
                            {'Set a new PIN to secure your apps.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <form onSubmit={handlePinChange} className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="new-pin">New PIN (min. 4 digits)</Label>
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
                                    {isLoading ? 'Saving...' : 'Set New PIN'}
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
                        <CardTitle>Set New Password</CardTitle>
                        <CardDescription>Set a new password to secure your apps.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <PasswordSetup onPasswordSet={handlePasswordSet} isChangeMode={false} onCancel={() => setCurrentView('main')} />
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
                                           Select your new preferred lock method. You will be asked to verify your identity first.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="grid grid-cols-1 gap-4 py-4">
                                        <AlertDialogAction asChild>
                                            <Button variant={lockType === 'pin' ? 'default' : 'outline'} size="lg" onClick={() => handleStartChange('pin')}>
                                                <KeyRound className="mr-2"/> PIN Code
                                            </Button>
                                        </AlertDialogAction>
                                        <AlertDialogAction asChild>
                                            <Button variant={lockType === 'pattern' ? 'default' : 'outline'} size="lg" onClick={() => handleStartChange('pattern')}>
                                                <Lock className="mr-2"/> Pattern
                                            </Button>
                                        </AlertDialogAction>
                                        <AlertDialogAction asChild>
                                             <Button variant={lockType === 'password' ? 'default' : 'outline'} size="lg" onClick={() => handleStartChange('password')}>
                                                <ShieldQuestion className="mr-2"/> Password
                                            </Button>
                                        </AlertDialogAction>
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
                {currentView !== 'main' ? 'Back to Settings' : 'Back'}
            </Button>
            <Card>
                {renderContent()}
            </Card>
        </main>
    </div>
  );
}
