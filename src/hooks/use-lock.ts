'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const DEFAULT_PIN = "1234";
const DEFAULT_PATTERN = [0, 1, 2, 5, 8, 7, 6, 3];
const DEFAULT_PASSWORD = "password";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 30;
const TEMP_UNLOCK_MINUTES = 15;

interface LockState {
  lockType: 'pin' | 'pattern' | 'password';
  pin: string;
  pattern: number[];
  password: string;
  isSetupComplete: boolean;
  isLoading: boolean;
  failedAttempts: number;
  lockoutUntil: number | null; // Timestamp
  tempUnlockUntil: number | null; // Timestamp
  isLockedOut: boolean;
  remainingLockoutTime: number;
  isTempUnlocked: boolean;
  remainingTempUnlockTime: number;
  setLockType: (type: 'pin' | 'pattern' | 'password') => void;
  setPin: (pin: string) => void;
  setPattern: (pattern: number[]) => void;
  setPassword: (password: string) => void;
  completeSetup: () => void;
  checkPin: (pin: string) => boolean;
  checkPassword: (password: string) => boolean;
  checkPattern: (pattern: number[]) => boolean;
  wrongAttempt: () => void;
  startTempUnlock: () => void;
  _updateLockoutStatus: () => void;
}

export const useLock = create<LockState>()(
  persist(
    (set, get) => ({
      lockType: 'pin',
      pin: DEFAULT_PIN,
      pattern: DEFAULT_PATTERN,
      password: DEFAULT_PASSWORD,
      isSetupComplete: false,
      isLoading: true,
      failedAttempts: 0,
      lockoutUntil: null,
      tempUnlockUntil: null,
      isLockedOut: false,
      remainingLockoutTime: 0,
      isTempUnlocked: false,
      remainingTempUnlockTime: 0,
      
      setLockType: (type) => set({ lockType: type }),
      setPin: (pin) => set({ pin, failedAttempts: 0, lockoutUntil: null }),
      setPattern: (pattern) => set({ pattern, failedAttempts: 0, lockoutUntil: null }),
      setPassword: (password) => set({ password, failedAttempts: 0, lockoutUntil: null }),
      completeSetup: () => set({ isSetupComplete: true }),
      
      checkPin: (pin) => {
        const isCorrect = pin === get().pin;
        if (isCorrect) {
            set({ failedAttempts: 0, lockoutUntil: null });
        }
        return isCorrect;
      },
      checkPassword: (password) => {
        const isCorrect = password === get().password;
        if (isCorrect) {
            set({ failedAttempts: 0, lockoutUntil: null });
        }
        return isCorrect;
      },
      checkPattern: (pattern) => {
        const isCorrect = JSON.stringify(pattern) === JSON.stringify(get().pattern);
        if (isCorrect) {
            set({ failedAttempts: 0, lockoutUntil: null });
        }
        return isCorrect;
      },
      wrongAttempt: () => {
        const newAttemptCount = get().failedAttempts + 1;
        if (newAttemptCount >= MAX_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
          set({ failedAttempts: newAttemptCount, lockoutUntil });
          get()._updateLockoutStatus();
        } else {
          set({ failedAttempts: newAttemptCount });
        }
      },
      startTempUnlock: () => {
        const tempUnlockUntil = Date.now() + TEMP_UNLOCK_MINUTES * 60 * 1000;
        set({ tempUnlockUntil });
        localStorage.setItem('fortress-unlocked', 'true');
      },
      _updateLockoutStatus: () => {
        const { lockoutUntil, tempUnlockUntil } = get();
        const now = Date.now();
        
        // Handle Lockout
        const isLockedOut = lockoutUntil ? now < lockoutUntil : false;
        const remainingLockoutTime = lockoutUntil ? Math.ceil((lockoutUntil - now) / 1000) : 0;
        
        if (isLockedOut) {
          set({ isLockedOut, remainingLockoutTime: Math.max(0, remainingLockoutTime) });
        } else if (get().isLockedOut) {
          // If it was locked out but time expired
          set({ isLockedOut: false, remainingLockoutTime: 0, failedAttempts: 0, lockoutUntil: null });
        }

        // Handle Temp Unlock
        const isTempUnlocked = tempUnlockUntil ? now < tempUnlockUntil : false;
        const remainingTempUnlockTime = tempUnlockUntil ? Math.ceil((tempUnlockUntil - now) / 1000) : 0;
         if (isTempUnlocked) {
          set({ isTempUnlocked, remainingTempUnlockTime: Math.max(0, remainingTempUnlockTime) });
        } else if (get().isTempUnlocked) {
          // If it was temp unlocked but time expired
          set({ isTempUnlocked: false, remainingTempUnlockTime: 0, tempUnlockUntil: null });
          localStorage.removeItem('fortress-unlocked');
        }

      }
    }),
    {
      name: 'fortress-lock-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
          if(state) state.isLoading = false;
      },
    }
  )
);

// This is a bit of a hack to deal with zustand persist + Next.js SSR/hydration
// On first load, we need to make sure the client state is synced before rendering UI
// that depends on the persisted state.
if (typeof window !== 'undefined') {
  useLock.persist.rehydrate();
  // Periodically update lockout status
  setInterval(() => {
    useLock.getState()._updateLockoutStatus();
  }, 1000);
}
