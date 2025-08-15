'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Timer, Settings } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function Header() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLock = () => {
        localStorage.removeItem('fortress-unlocked');
        router.replace('/lock');
    };

    const handleTempUnlock = () => {
        toast({
            title: "Temporary Unlock Activated",
            description: "Security is paused for 15 minutes. This is a demo feature.",
            duration: 5000,
        });
    };

    return (
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-10">
            <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold">Fortress</h1>
                </div>

                <div className="flex items-center gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Temporary Unlock">
                                <Timer className="h-5 w-5 text-accent" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Temporary Unlock?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will disable all app locks for 15 minutes. Are you sure you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleTempUnlock} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Proceed
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button onClick={() => router.push('/settings')} variant="ghost" size="icon" aria-label="Settings">
                        <Settings className="h-5 w-5" />
                    </Button>

                    <Button onClick={handleLock} variant="ghost" size="icon" aria-label="Lock App">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
