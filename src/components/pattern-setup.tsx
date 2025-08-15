'use client';

import { useState } from 'react';
import PatternGrid from './pattern-grid';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PatternSetupProps {
  onPatternSet: (pattern: number[]) => void;
}

const MIN_PATTERN_LENGTH = 4;

export default function PatternSetup({ onPatternSet }: PatternSetupProps) {
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState('Draw an unlock pattern.');
  const [isError, setIsError] = useState(false);
  const toast = useToast();

  const handlePatternComplete = (pattern: number[]) => {
    if (pattern.length < MIN_PATTERN_LENGTH) {
      setMessage(`Connect at least ${MIN_PATTERN_LENGTH} dots. Try again.`);
      setIsError(true);
      setTimeout(() => {
        setMessage('Draw an unlock pattern.');
        setIsError(false);
      }, 2000);
      return false; // Indicate failure
    }

    setIsError(false);

    if (!isConfirming) {
      setFirstPattern(pattern);
      setIsConfirming(true);
      setMessage('Draw pattern again to confirm.');
    } else {
      if (JSON.stringify(firstPattern) === JSON.stringify(pattern)) {
        setMessage('Pattern saved!');
        onPatternSet(pattern);
        setTimeout(() => {
            reset();
        }, 1500)
      } else {
        setMessage('Patterns do not match. Try again.');
        setIsError(true);
        setFirstPattern([]);
        setIsConfirming(false);
        setTimeout(() => {
            setMessage('Draw an unlock pattern.');
            setIsError(false);
        }, 2000);
        return false; // Indicate failure
      }
    }
    return true; // Indicate success
  };

  const reset = () => {
    setFirstPattern([]);
    setIsConfirming(false);
    setMessage('Draw an unlock pattern.');
    setIsError(false);
  }

  return (
    <div className="flex flex-col items-center">
      <p className={cn("mb-4 text-center h-5", isError ? 'text-destructive' : 'text-muted-foreground')}>
        {message}
      </p>
      <PatternGrid onPatternComplete={handlePatternComplete} key={isConfirming.toString() + firstPattern.length}/>
      <Button variant="ghost" onClick={reset} className="mt-4">
        Reset
      </Button>
    </div>
  );
}
