'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
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
const PIN_LENGTH = 4;

export default function SetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lockType, setLockType, setPin, setPattern, setPassword, completeSetup } = useLock();
  
  const [step, setStep] = useState<SetupStep>('choice');
  const [pin, setPinValue] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
  
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    pinInputRefs.current[0]?.focus();
  }, [step]);


  const handleChoice = (type: 'pin' | 'pattern' | 'password') => {
    setLockType(type);
    setStep(type);
  };

  const handlePinChange = (e: ChangeEvent<HTMLInputElement>, index: number, type: 'new' | 'confirm') => {
    const value = e.target.value;
    const set = type === 'new' ? setPinValue : setConfirmPin;
    const refs = type === 'new' ? pinInputRefs : confirmPinInputRefs;
    const currentPin = type === 'new' ? pin : confirmPin;

    if (/^[0-9]$/.test(value) || value === '') {
        const newPin = [...currentPin];
        newPin[index] = value;
        set(newPin);

        if (value !== '' && index < PIN_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number, type: 'new' | 'confirm') => {
      const refs = type === 'new' ? pinInputRefs : confirmPinInputRefs;
      const pinState = type === 'new' ? pin : confirmPin;
      if (e.key === 'Backspace' && !pinState[index] && index > 0) {
          refs.current[index - 1]?.focus();
      }
  };

  const handlePinSetup = () => {
    const pinString = pin.join('');
    const confirmPinString = confirmPin.join('');

    if (pinString.length < PIN_LENGTH) {
      toast({ variant: 'destructive', title: 'Error', description: `PIN must be ${PIN_LENGTH} digits.` });
      return;
    }
    if (pinString !== confirmPinString) {
      toast({ variant: 'destructive', title: 'Error', description: 'PINs do not match.' });
      setConfirmPin(new Array(PIN_LENGTH).fill(''));
      confirmPinInputRefs.current[0]?.focus();
      return;
    }
    setPin(pinString);
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
            <p className="text-muted-foreground mb-8">Enter a {PIN_LENGTH}-digit PIN to secure your vault.</p>
            <div className="space-y-6 w-full max-w-xs text-left">
              <div>
                  <label className="text-sm font-medium text-muted-foreground pl-1">New PIN</label>
                  <div className="mt-2 flex justify-center gap-3">
                      {pin.map((digit, index) => (
                          <input
                              key={`pin-${index}`}
                              ref={(el) => (pinInputRefs.current[index] = el)}
                              type="password"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handlePinChange(e, index, 'new')}
                              onKeyDown={(e) => handleKeyDown(e, index, 'new')}
                              className="h-14 w-14 rounded-lg border border-white/20 bg-card text-center text-3xl font-bold text-foreground focus:border-primary focus:ring-primary"
                          />
                      ))}
                  </div>
              </div>
              <div>
                  <label className="text-sm font-medium text-muted-foreground pl-1">Confirm PIN</label>
                  <div className="mt-2 flex justify-center gap-3">
                       {confirmPin.map((digit, index) => (
                          <input
                              key={`confirm-pin-${index}`}
                              ref={(el) => (confirmPinInputRefs.current[index] = el)}
                              type="password"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handlePinChange(e, index, 'confirm')}
                              onKeyDown={(e) => handleKeyDown(e, index, 'confirm')}
                              className="h-14 w-14 rounded-lg border border-white/20 bg-card text-center text-3xl font-bold text-foreground focus:border-primary focus:ring-primary"
                          />
                      ))}
                  </div>
              </div>
            </div>
            <div className="w-full max-w-xs mt-8 flex flex-col gap-2">
                <Button onClick={handlePinSetup}>Set PIN</Button>
                <Button variant="outline" onClick={() => setStep('choice')}>Back</Button>
            </div>
          </>
        );
      case 'pattern':
        return (
          <>
            <h1 className="text-2xl font-bold">Create Your Pattern</h1>
            <PatternSetup onPatternSet={handlePatternSetup} />
             <Button variant="outline" onClick={() => setStep('choice')} className="mt-4">Back</Button>
          </>
        );
      case 'password':
        return (
          <>
            <h1 className="text-2xl font-bold">Set Your Password</h1>
            <PasswordSetup onPasswordSet={handlePasswordSetup} />
             <Button variant="outline" onClick={() => setStep('choice')} className="mt-8">Back</Button>
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
