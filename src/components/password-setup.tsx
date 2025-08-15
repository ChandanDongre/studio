'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLock } from '@/hooks/use-lock';

interface PasswordSetupProps {
  onPasswordSet: (password: string) => void;
  isChangeMode?: boolean;
  onCancel?: () => void;
}

export default function PasswordSetup({ onPasswordSet, isChangeMode = false, onCancel }: PasswordSetupProps) {
  const { toast } = useToast();
  const { checkPassword } = useLock();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (isChangeMode && !checkPassword(currentPassword)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Current password is incorrect.' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    onPasswordSet(newPassword);
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm text-left">
      {isChangeMode && (
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password (min. 6 characters)</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          autoFocus={!isChangeMode}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <Input
          id="confirm-new-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
       {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="w-full">Cancel</Button>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : isChangeMode ? 'Save Changes' : 'Set Password'}
        </Button>
      </div>
    </form>
  );
}
