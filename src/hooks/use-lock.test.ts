import { renderHook, act } from '@testing-library/react';
import { useLock } from './use-lock';

// Mock localStorage for zustand persist middleware
const localStorageMock = (() => {
  let store: { [key: string]: { state: any, version: number } } = {};
  return {
    getItem: (key: string) => JSON.stringify(store[key]) || null,
    setItem: (key: string, value: string) => {
      store[key] = JSON.parse(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


describe('useLock Hook', () => {
  beforeEach(() => {
    // Reset the store and timers before each test
    act(() => {
      useLock.getState().reset();
    });
    localStorageMock.clear();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLock());

    expect(result.current.isSetupComplete).toBe(false);
    expect(result.current.lockType).toBe('pin');
    expect(result.current.failedAttempts).toBe(0);
    expect(result.current.isLockedOut).toBe(false);
  });

  it('should allow setting a password and completing setup', () => {
    const { result } = renderHook(() => useLock());

    act(() => {
      result.current.setPassword('new-password');
    });
    expect(result.current.password).toBe('new-password');

    act(() => {
      result.current.completeSetup();
    });
    expect(result.current.isSetupComplete).toBe(true);
    expect(result.current.isTempAuthenticated).toBe(true);
  });

  it('should successfully check a correct password', () => {
    const { result } = renderHook(() => useLock());

    act(() => {
      result.current.setPassword('correct-password');
      result.current.completeSetup();
    });

    let isCorrect;
    act(() => {
      isCorrect = result.current.checkPassword('correct-password');
    });

    expect(isCorrect).toBe(true);
  });

  it('should handle wrong password attempts and lockout', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useLock());
    const MAX_ATTEMPTS = 5; // As defined in the hook
    const LOCKOUT_DURATION_SECONDS = 30; // As defined in the hook

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      act(() => {
        const isCorrect = result.current.checkPassword('wrong-password');
        expect(isCorrect).toBe(false);
        result.current.wrongAttempt();
      });
      expect(result.current.failedAttempts).toBe(i + 1);
    }

    expect(result.current.isLockedOut).toBe(true);
    expect(result.current.remainingLockoutTime).toBeGreaterThan(0);

    // Advance time to just before the lockout ends
    act(() => {
      jest.advanceTimersByTime((LOCKOUT_DURATION_SECONDS - 1) * 1000);
      result.current._updateStatus();
    });
    expect(result.current.isLockedOut).toBe(true);

    // Advance time past the lockout period
    act(() => {
      jest.advanceTimersByTime(2 * 1000);
       result.current._updateStatus();
    });

    expect(result.current.isLockedOut).toBe(false);
    expect(result.current.failedAttempts).toBe(0);
  });

  it('should handle temporary unlock', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useLock());
    const TEMP_UNLOCK_MINUTES = 15;

    act(() => {
      result.current.startTempUnlock();
      result.current._updateStatus();
    });

    expect(result.current.isTempUnlocked).toBe(true);
    expect(result.current.remainingTempUnlockTime).toBe(TEMP_UNLOCK_MINUTES * 60);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
       result.current._updateStatus();
    });
    expect(result.current.remainingTempUnlockTime).toBeLessThanOrEqual(10 * 60);

    // Advance time past the unlock period
    act(() => {
      jest.advanceTimersByTime(11 * 60 * 1000); // 11 more minutes
       result.current._updateStatus();
    });

    expect(result.current.isTempUnlocked).toBe(false);
  });

  it('should reset the state', () => {
    const { result } = renderHook(() => useLock());

    act(() => {
      result.current.setPassword('some-password');
      result.current.completeSetup();
    });

    expect(result.current.isSetupComplete).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSetupComplete).toBe(false);
    expect(result.current.password).toBe('password'); // Back to default
  });
});
