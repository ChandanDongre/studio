
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockApps, type App } from '@/lib/apps';
import AppListItem from '@/components/app-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLock } from '@/hooks/use-lock';

const LOCKED_APPS_STORAGE_KEY = 'fortress-locked-apps';

export default function AppList() {
    const [lockedApps, setLockedApps] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();
    // isTempUnlocked is for the global 15-min unlock, isTempAuthenticated is for the current session.
    const { isTempUnlocked, isTempAuthenticated } = useLock();

    useEffect(() => {
        try {
            const storedLockedApps = localStorage.getItem(LOCKED_APPS_STORAGE_KEY);
            if (storedLockedApps) {
                setLockedApps(new Set(JSON.parse(storedLockedApps)));
            }
        } catch (error) {
            console.error("Failed to parse locked apps from localStorage", error);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(LOCKED_APPS_STORAGE_KEY, JSON.stringify(Array.from(lockedApps)));
            } catch (error) {
                console.error("Failed to save locked apps to localStorage", error);
            }
        }
    }, [lockedApps, isLoaded]);

    const handleToggleLock = (appId: string) => {
        setLockedApps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(appId)) {
                newSet.delete(appId);
            } else {
                newSet.add(appId);
            }
            return newSet;
        });
    };
    
    const handleAppClick = (app: App) => {
        const isAppIndividuallyLocked = lockedApps.has(app.id);
        
        // A user can open an app directly if:
        // 1. The app isn't locked.
        // 2. The global 15-minute unlock is active.
        // 3. The user has already unlocked something in this session.
        const canOpenDirectly = !isAppIndividuallyLocked || isTempUnlocked || isTempAuthenticated;

        const targetUrl = `/app-launch-success?appName=${encodeURIComponent(app.name)}`;
        
        if (canOpenDirectly) {
            router.push(targetUrl);
        } else {
            // App is locked, and user needs to authenticate for this session.
            // Redirect to the lock screen, and tell it where to go after a successful unlock.
            router.push(`/lock?redirectTo=${encodeURIComponent(targetUrl)}`);
        }
    };

    const filteredApps = useMemo(() => 
        mockApps.filter(app => 
            app.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

    const protectedCount = lockedApps.size;

    return (
        <Card className="border-border/50 bg-card/50">
            <CardHeader>
                <CardTitle>Protect Your Apps</CardTitle>
                <CardDescription>
                    {protectedCount > 0 ? `${protectedCount} app${protectedCount > 1 ? 's' : ''} protected.` : "Select apps to lock below."}
                </CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search apps..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {filteredApps.map(app => (
                        <AppListItem 
                            key={app.id}
                            app={app}
                            isLocked={lockedApps.has(app.id)}
                            onToggleLock={handleToggleLock}
                            onAppClick={handleAppClick}
                        />
                    ))}
                    {filteredApps.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No apps found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
