import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './header';
import { useLock } from '@/hooks/use-lock';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Mock the hooks and lucide-react
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  Shield: () => 'ShieldIcon',
  Timer: () => 'TimerIcon',
  Settings: () => 'SettingsIcon',
  XCircle: () => 'XCircleIcon',
  LogOut: () => 'LogOutIcon',
}));

jest.mock('@/hooks/use-lock', () => ({
  useLock: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('Header', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUseLock = {
    isTempUnlocked: false,
    remainingTempUnlockTime: 0,
    startTempUnlock: jest.fn(),
    cancelTempUnlock: jest.fn(),
  };

  const mockUseToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLock as jest.Mock).mockReturnValue(mockUseLock);
    (useToast as jest.Mock).mockReturnValue(mockUseToast);
  });

  it('renders the header with the title', () => {
    render(<Header />);
    expect(screen.getByText('Fortress')).toBeInTheDocument();
  });
});
