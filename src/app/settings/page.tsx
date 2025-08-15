
'use client';

import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, KeyRound, Lock, ShieldQuestion, Fingerprint, LogOut } from 'lucide-react';
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
const PIN_LENGTH = 4;

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern, setPassword, isBiometricsEnabled, toggleBiometrics, isSetupComplete, reset } = useLock();
  
  const [currentView, setCurrentView] = useState<SecurityView>('main');
  const [nextView, setNextView] = useState<LockMethod | null>(null);
  
  const [newPin, setNewPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  const [confirmNewPin, setConfirmNewPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  const newPinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmNewPinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (currentView === 'pin') {
        newPinInputRefs.current[0]?.focus();
    }
  }, [currentView]);

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

  const handlePinInputChange = (e: ChangeEvent<HTMLInputElement>, index: number, type: 'new' | 'confirm') => {
    const value = e.target.value;
    const set = type === 'new' ? setNewPin : setConfirmNewPin;
    const refs = type === 'new' ? newPinInputRefs : confirmNewPinInputRefs;
    const currentPin = type === 'new' ? newPin : confirmNewPin;

    if (/^[0-9]$/.test(value) || value === '') {
        const newPinValue = [...currentPin];
        newPinValue[index] = value;
        set(newPinValue);

        if (value !== '' && index < PIN_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }
    }
  };

  const handlePinKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number, type: 'new' | 'confirm') => {
      const refs = type === 'new' ? newPinInputRefs : confirmNewPinInputRefs;
      const pinState = type === 'new' ? newPin : confirmNewPin;
      if (e.key === 'Backspace' && !pinState[index] && index > 0) {
          refs.current[index - 1]?.focus();
      }
  };


  const handlePinSet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const newPinString = newPin.join('');
    const confirmPinString = confirmNewPin.join('');

    if (newPinString.length !== PIN_LENGTH) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `PIN must be ${PIN_LENGTH} digits.`,
        });
        setIsLoading(false);
        return;
    }

    if (newPinString !== confirmPinString) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New PINs do not match.',
      });
      setIsLoading(false);
      setConfirmNewPin(new Array(PIN_LENGTH).fill(''));
      confirmNewPinInputRefs.current[0]?.focus();
      return;
    }

    setPin(newPinString);
    setLockType('pin');
    toast({
      title: 'Success!',
      description: 'Your PIN has been set.',
    });
    
    setNewPin(new Array(PIN_LENGTH).fill(''));
    setConfirmNewPin(new Array(PIN_LENGTH).fill(''));
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

  const handleResetApp = () => {
    reset();
    toast({
      title: 'Application Reset',
      description: 'All your settings have been cleared.'
    });
    router.replace('/welcome');
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
                            {'Set a new 4-digit PIN to secure your apps.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePinSet} className="space-y-6">
                             <div className="space-y-2">
                                <Label>New PIN</Label>
                                <div className="mt-2 flex justify-center gap-3">
                                    {newPin.map((digit, index) => (
                                        <input
                                            key={`new-pin-${index}`}
                                            ref={(el) => (newPinInputRefs.current[index] = el)}
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handlePinInputChange(e, index, 'new')}
                                            onKeyDown={(e) => handlePinKeyDown(e, index, 'new')}
                                            className="h-14 w-14 rounded-lg border border-white/20 bg-card text-center text-3xl font-bold text-foreground focus:border-primary focus:ring-primary"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New PIN</Label>
                                <div className="mt-2 flex justify-center gap-3">
                                    {confirmNewPin.map((digit, index) => (
                                        <input
                                            key={`confirm-pin-${index}`}
                                            ref={(el) => (confirmNewPinInputRefs.current[index] = el)}
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handlePinInputChange(e, index, 'confirm')}
                                            onKeyDown={(e) => handlePinKeyDown(e, index, 'confirm')}
                                            className="h-14 w-14 rounded-lg border border-white/20 bg-card text-center text-3xl font-bold text-foreground focus:border-primary focus:ring-primary"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
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
                        <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <LogOut className="mr-2 h-4 w-4" /> Reset App
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete all your Fortress settings, including your PIN, pattern, and locked app configurations.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleResetApp} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Yes, reset everything
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
