'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Lock, ShieldQuestion, CheckCircle } from 'lucide-react';
import { useLock } from '@/hooks/use-lock';
import PatternSetup from '@/components/pattern-setup';
import PasswordSetup from '@/components/password-setup';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type SetupStep = 'choice' | 'pin' | 'pattern' | 'password' | 'done';

export default function SetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern, setPassword, completeSetup } = useLock();
  
  const [step, setStep] = useState<SetupStep>('choice');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleChoice = (type: 'pin' | 'pattern' | 'password') => {
    setLockType(type);
    setStep(type);
  };

  const handlePinSetup = () => {
    if (pin.length < 4) {
      toast({ variant: 'destructive', title: 'Error', description: 'PIN must be at least 4 digits.' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ variant: 'destructive', title: 'Error', description: 'PINs do not match.' });
      return;
    }
    setPin(pin);
    completeSetup();
    setStep('done');
  };

  const handlePatternSetup = (pattern: number[]) => {
    setPattern(pattern);
    completeSetup();
    setStep('done');
  };
  
  const handlePasswordSetup = (password: string) => {
    setPassword(password);
    completeSetup();
    setStep('done');
  }

  const renderStep = () => {
    switch (step) {
      case 'choice':
        return (
          <>
            <ShieldQuestion className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-2xl font-bold">Choose Your Lock Method</h1>
            <p className="text-muted-foreground mb-8">Select how you want to secure your apps.</p>
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
              <Button variant="outline" size="lg" onClick={() => handleChoice('pin')}><KeyRound className="mr-2"/> PIN Code</Button>
              <Button variant="outline" size="lg" onClick={() => handleChoice('pattern')}><Lock className="mr-2"/> Pattern</Button>
              <Button variant="outline" size="lg" onClick={() => handleChoice('password')}><ShieldQuestion className="mr-2"/> Password</Button>
            </div>
          </>
        );
      case 'pin':
        return (
          <>
            <h1 className="text-2xl font-bold">Set Your PIN</h1>
            <p className="text-muted-foreground mb-8">Enter a 4-digit PIN.</p>
            <div className="space-y-4 w-full max-w-xs">
                <input type="password" placeholder="Enter PIN" value={pin} onChange={(e) => setPinValue(e.target.value)} className="w-full p-2 text-center text-lg tracking-[1rem] bg-input rounded-md" maxLength={4} />
                <input type="password" placeholder="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="w-full p-2 text-center text-lg tracking-[1rem] bg-input rounded-md" maxLength={4} />
            </div>
            <Button onClick={handlePinSetup} className="mt-8">Set PIN</Button>
          </>
        );
      case 'pattern':
        return (
          <>
            <h1 className="text-2xl font-bold">Create Your Pattern</h1>
            <PatternSetup onPatternSet={handlePatternSetup} />
          </>
        );
      case 'password':
        return (
          <>
            <h1 className="text-2xl font-bold">Set Your Password</h1>
            <PasswordSetup onPasswordSet={handlePasswordSetup} />
          </>
        )
      case 'done':
        return (
           <>
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold">Setup Complete!</h1>
            <p className="text-muted-foreground mb-8">Fortress is now ready to protect your apps.</p>
            <Button onClick={() => router.replace('/')} className="mt-8">Go to Dashboard</Button>
          </>
        )
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <Card className="w-full max-w-md p-8">
            <CardContent className="flex flex-col items-center justify-center p-0">
                {renderStep()}
            </CardContent>
        </Card>
    </div>
  );
}
