import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';
import { useLock } from '@/hooks/use-lock';
import { useRouter } from 'next/navigation';

// Mock the hooks and components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-lock', () => ({
  useLock: jest.fn(),
}));

jest.mock('@/components/header', () => () => <div>Header</div>);
jest.mock('@/components/app-list', () => () => <div>AppList</div>);

describe('Home Page', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('renders a skeleton loader when loading', () => {
    (useLock as jest.Mock).mockReturnValue({ isLoading: true, isSetupComplete: false });
    render(<Home />);
    expect(screen.getAllByRole('generic', { name: '' })).not.toBeNull();
  });

  it('redirects to /welcome if setup is not complete', () => {
    (useLock as jest.Mock).mockReturnValue({ isLoading: false, isSetupComplete: false });
    render(<Home />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/welcome');
  });

  it('renders the main dashboard when setup is complete', () => {
    (useLock as jest.Mock).mockReturnValue({ isLoading: false, isSetupComplete: true });
    render(<Home />);
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('AppList')).toBeInTheDocument();
  });
});
