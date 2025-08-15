'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_PIN = "1234";
const PIN_STORAGE_KEY = 'fortress-pin';

export default function LockScreen() {
    const [correctPin, setCorrectPin] = useState(DEFAULT_PIN);
    const [pin, setPin] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [showError, setShowError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
        const currentPin = storedPin || DEFAULT_PIN;
        setCorrectPin(currentPin);
        setPin(new Array(currentPin.length).fill(''));
        inputRefs.current = new Array(currentPin.length).fill(null);
    }, []);

    useEffect(() => {
        if(correctPin) {
            setPin(new Array(correctPin.length).fill(''));
            inputRefs.current = new Array(correctPin.length).fill(null);
            inputRefs.current[0]?.focus();
        }
    }, [correctPin]);

    const handlePinChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        // Only allow numeric input
        if (/^[0-9]$/.test(value)) {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            if (index < correctPin.length - 1) {
                inputRefs.current[index + 1]?.focus();
            } else {
                // Automatically check pin when last digit is entered
                checkPin(newPin.join(''));
            }
        } else if (value === '') {
            // Handle clearing the input
             const newPin = [...pin];
             newPin[index] = '';
             setPin(newPin);
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
        if (fullPin.length !== correctPin.length) return;

        setIsChecking(true);
        setShowError(false);

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));

        if (fullPin === correctPin) {
            localStorage.setItem('fortress-unlocked', 'true');
            router.replace('/');
        } else {
            setShowError(true);
            setPin(new Array(correctPin.length).fill(''));
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

    if (!correctPin) {
        return null; // or a loading state
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
                    {Array.from({ length: correctPin.length }).map((_, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={pin[index] || ''}
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
