'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLock } from '@/hooks/use-lock';

export default function PasswordLock() {
    const { checkPassword, wrongAttempt, isLockedOut, remainingLockoutTime, isBiometricsEnabled } = useLock();
    const [password, setPassword] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [showError, setShowError] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const attemptUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLockedOut) return;

        setIsChecking(true);
        setShowError(false);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (checkPassword(password)) {
            localStorage.setItem('fortress-unlocked', 'true');
            router.replace('/');
        } else {
            wrongAttempt();
            setShowError(true);
            setPassword('');
            setTimeout(() => {
                setShowError(false);
            }, 820);
        }
        setIsChecking(false);
    };
    
    const handleBiometric = () => {
        toast({
            title: "Biometric Scan Success",
            description: "Unlocked via fingerprint.",
        });
        localStorage.setItem('fortress-unlocked', 'true');
        router.replace('/');
    }

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className={cn("w-full max-w-sm text-center", showError && 'shake')}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Enter Password</h1>
                <p className="mt-2 text-muted-foreground">
                    {isLockedOut 
                        ? `Too many attempts. Try again in ${remainingLockoutTime}s.`
                        : "Unlock Fortress to continue."
                    }
                </p>
                <form onSubmit={attemptUnlock} className="my-8 space-y-4">
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isChecking || isLockedOut}
                        className="h-12 text-center text-lg"
                        autoFocus
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isChecking || isLockedOut}>
                        {isChecking ? "Unlocking..." : "Unlock"}
                    </Button>
                </form>

                <div className="flex flex-col items-center gap-4">
                    {isBiometricsEnabled && (
                        <Button variant="ghost" onClick={handleBiometric} className="flex items-center gap-2 text-muted-foreground hover:text-foreground" disabled={isLockedOut}>
                            <Fingerprint className="h-6 w-6 text-accent" />
                            <span>Use Fingerprint</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
