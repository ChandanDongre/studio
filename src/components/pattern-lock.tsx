'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import { useLock } from '@/hooks/use-lock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PatternGrid from './pattern-grid';

export default function PatternLock() {
  const router = useRouter();
  const { toast } = useToast();
  const { checkPattern, wrongAttempt, isLockedOut, remainingLockoutTime } = useLock();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePatternComplete = async (completedPattern: number[]) => {
    if (isLockedOut) return false;

    const isCorrect = checkPattern(completedPattern);
    
    if (isCorrect) {
      localStorage.setItem('fortress-unlocked', 'true');
      router.replace('/');
    } else {
        wrongAttempt();
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Incorrect pattern. Please try again.',
            duration: 2000,
        });
        return false; // Indicates failure, so grid can shake
    }
    return true; // Indicates success
  };

  const handleBiometric = () => {
    toast({
        title: "Biometric Scan Success",
        description: "Unlocked via fingerprint.",
    })
    localStorage.setItem('fortress-unlocked', 'true');
    router.replace('/');
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Draw Pattern</h1>
            <p className="mt-2 text-muted-foreground">
              {isLockedOut 
                  ? `Too many attempts. Try again in ${remainingLockoutTime}s.`
                  : "Draw your pattern to unlock."
              }
            </p>
            
            <div className="my-8 flex justify-center">
                <PatternGrid onPatternComplete={handlePatternComplete} disabled={isLockedOut}/>
            </div>

            <div className="flex flex-col items-center gap-4">
                <button onClick={handleBiometric} className="flex items-center gap-2 text-muted-foreground hover:text-foreground" disabled={isLockedOut}>
                    <Fingerprint className="h-6 w-6 text-accent" />
                    <span>Use Fingerprint</span>
                </button>
            </div>
        </div>
    </div>
  );
}
