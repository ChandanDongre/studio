'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import { useLock } from '@/hooks/use-lock';
import { useToast } from '@/hooks/use-toast';
import PatternGrid from './pattern-grid';
import { cn } from '@/lib/utils';

interface PatternLockProps {
    onUnlock: () => void;
    isPage?: boolean;
}

export default function PatternLock({ onUnlock, isPage = true }: PatternLockProps) {
  const { toast } = useToast();
  const { checkPattern, wrongAttempt, isLockedOut, remainingLockoutTime, isBiometricsEnabled, setTempAuthenticated } = useLock();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePatternComplete = async (completedPattern: number[]) => {
    if (isLockedOut) return false;

    const isCorrect = checkPattern(completedPattern);
    
    if (isCorrect) {
      setTempAuthenticated();
      onUnlock();
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
    setTempAuthenticated();
    onUnlock();
  }

  if (!isClient) {
    return null;
  }

  const content = (
       <div className="w-full max-w-sm text-center">
            {isPage && (
                <>
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Draw Pattern</h1>
                </>
            )}
            <p className={cn("mt-2 text-muted-foreground", !isPage && "mb-4")}>
              {isLockedOut 
                  ? `Too many attempts. Try again in ${remainingLockoutTime}s.`
                  : "Draw your pattern to unlock."
              }
            </p>
            
            <div className="my-8 flex justify-center">
                <PatternGrid onPatternComplete={handlePatternComplete} disabled={isLockedOut}/>
            </div>

            <div className="flex flex-col items-center gap-4">
                {isBiometricsEnabled && (
                    <button onClick={handleBiometric} className="flex items-center gap-2 text-muted-foreground hover:text-foreground" disabled={isLockedOut}>
                        <Fingerprint className="h-6 w-6 text-accent" />
                        <span>Use Fingerprint</span>
                    </button>
                )}
            </div>
        </div>
  )

  if (!isPage) {
    return content;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       {content}
    </div>
  );
}
