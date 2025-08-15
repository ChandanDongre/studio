import { MessageSquare, Camera, Mail, Settings, Music, ShoppingCart, Briefcase, Gamepad2, Globe, Shield } from 'lucide-react';
import type { ComponentType } from 'react';

export type App = {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
};

export const mockApps: App[] = [
  { id: 'messages', name: 'Messages', icon: MessageSquare },
  { id: 'camera', name: 'Camera', icon: Camera },
  { id: 'mail', name: 'Mail', icon: Mail },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'store', name: 'App Store', icon: ShoppingCart },
  { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
  { id: 'games', name: 'Games', icon: Gamepad2 },
  { id: 'browser', name: 'Browser', icon: Globe },
  { id: 'authenticator', name: 'Authenticator', icon: Shield },
  { id: 'fortress', name: 'Fortress', icon: Shield },
];
