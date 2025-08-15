'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CORRECT_PIN = "1234";

export default function LockScreen() {
    const [pin, setPin] = useState<string[]>(new Array(CORRECT_PIN.length).fill(''));
    const [isChecking, setIsChecking] = useState(false);
    const [showError, setShowError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handlePinChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value)) {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            if (index < CORRECT_PIN.length - 1) {
                inputRefs.current[index + 1]?.focus();
            } else {
                checkPin(newPin.join(''));
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Backspace') {
            const newPin = [...pin];
            newPin[index] = '';
            setPin(newPin);
        }
    };

    const checkPin = async (fullPin: string) => {
        setIsChecking(true);
        setShowError(false);

        await new Promise(resolve => setTimeout(resolve, 500));

        if (fullPin === CORRECT_PIN) {
            localStorage.setItem('fortress-unlocked', 'true');
            router.replace('/');
        } else {
            setShowError(true);
            setPin(new Array(CORRECT_PIN.length).fill(''));
            setTimeout(() => {
                setShowError(false);
                inputRefs.current[0]?.focus();
            }, 820);
        }
        setIsChecking(false);
    };
    
    const handleBiometric = () => {
        toast({
            title: "Biometric Scan",
            description: "This feature is for demonstration purposes only.",
        })
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Enter PIN</h1>
                <p className="mt-2 text-muted-foreground">Unlock Fortress to continue.</p>
                <div className={cn('my-8 flex justify-center gap-3', showError && 'shake')}>
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            disabled={isChecking}
                            className="h-14 w-14 rounded-lg border bg-card text-center text-3xl font-bold text-foreground focus:border-primary focus:ring-primary disabled:opacity-50"
                        />
                    ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Button variant="ghost" onClick={handleBiometric} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Fingerprint className="h-6 w-6 text-accent" />
                        <span>Use Fingerprint</span>
                    </Button>
                    <Button variant="link" className="text-sm text-muted-foreground">Forgot PIN?</Button>
                </div>
            </div>
        </div>
    );
}
