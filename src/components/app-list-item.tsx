'use client';
import { Switch } from '@/components/ui/switch';
import { Lock, Unlock } from 'lucide-react';
import type { App } from '@/lib/apps';

interface AppListItemProps {
  app: App;
  isLocked: boolean;
  onToggleLock: (appId: string) => void;
  onAppClick: (app: App) => void;
}

export default function AppListItem({ app, isLocked, onToggleLock, onAppClick }: AppListItemProps) {
    const Icon = app.icon;

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent click from propagating to the switch
        if ((e.target as HTMLElement).closest('[role="switch"]')) {
            return;
        }
        onAppClick(app);
    };

    return (
        <div 
            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer"
            onClick={handleContainerClick}
        >
            <div className="flex items-center gap-4">
                <Icon className="h-8 w-8 text-foreground" />
                <span className="font-medium">{app.name}</span>
            </div>
            <div className="flex items-center gap-3">
                {isLocked ? (
                    <Lock className="h-5 w-5 text-primary" />
                ) : (
                    <Unlock className="h-5 w-5 text-muted-foreground" />
                )}
                <Switch
                    checked={isLocked}
                    onCheckedChange={() => onToggleLock(app.id)}
                    aria-label={`Lock ${app.name}`}
                />
            </div>
        </div>
    );
}
