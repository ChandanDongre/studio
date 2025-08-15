'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const DEFAULT_PIN = "1234";
const DEFAULT_PATTERN = [0, 1, 2, 5, 8, 7, 6, 3];
const DEFAULT_PASSWORD = "password";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 30;
const TEMP_UNLOCK_MINUTES = 15;
const TEMP_AUTH_MINUTES = 1; // How long user stays authenticated after one successful unlock

interface LockState {
  lockType: 'pin' | 'pattern' | 'password';
  pin: string;
  pattern: number[];
  password: string;
  isSetupComplete: boolean;
  isBiometricsEnabled: boolean;
  isLoading: boolean;
  failedAttempts: number;
  lockoutUntil: number | null; // Timestamp
  tempUnlockUntil: number | null; // Timestamp for global unlock
  tempAuthenticatedUntil: number | null; // Timestamp for single-session unlock
  isLockedOut: boolean;
  remainingLockoutTime: number;
  isTempUnlocked: boolean;
  remainingTempUnlockTime: number;
  isTempAuthenticated: boolean;
  setLockType: (type: 'pin' | 'pattern' | 'password') => void;
  setPin: (pin: string) => void;
  setPattern: (pattern: number[]) => void;
  setPassword: (password: string) => void;
  completeSetup: () => void;
  toggleBiometrics: () => void;
  checkPin: (pin: string) => boolean;
  checkPassword: (password: string) => boolean;
  checkPattern: (pattern: number[]) => boolean;
  wrongAttempt: () => void;
  startTempUnlock: () => void;
  setTempAuthenticated: () => void;
  clearTempAuthentication: () => void;
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
      isBiometricsEnabled: true,
      isLoading: true,
      failedAttempts: 0,
      lockoutUntil: null,
      tempUnlockUntil: null,
      tempAuthenticatedUntil: null,
      isLockedOut: false,
      remainingLockoutTime: 0,
      isTempUnlocked: false,
      remainingTempUnlockTime: 0,
      isTempAuthenticated: false,
      
      setLockType: (type) => set({ lockType: type }),
      setPin: (pin) => set({ pin, failedAttempts: 0, lockoutUntil: null }),
      setPattern: (pattern) => set({ pattern, failedAttempts: 0, lockoutUntil: null }),
      setPassword: (password) => set({ password, failedAttempts: 0, lockoutUntil: null }),
      completeSetup: () => set({ isSetupComplete: true }),
      toggleBiometrics: () => set(state => ({ isBiometricsEnabled: !state.isBiometricsEnabled })),
      
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
        set({ tempUnlockUntil, tempAuthenticatedUntil: null });
      },
      setTempAuthenticated: () => {
        const tempAuthenticatedUntil = Date.now() + TEMP_AUTH_MINUTES * 60 * 1000;
        set({ tempAuthenticatedUntil });
      },
      clearTempAuthentication: () => {
        set({ tempAuthenticatedUntil: null });
      },
      _updateLockoutStatus: () => {
        const { lockoutUntil, tempUnlockUntil, tempAuthenticatedUntil } = get();
        const now = Date.now();
        
        // Handle Lockout
        const isLockedOut = lockoutUntil ? now < lockoutUntil : false;
        const remainingLockoutTime = lockoutUntil ? Math.ceil((lockoutUntil - now) / 1000) : 0;
        
        if (isLockedOut) {
          set({ isLockedOut, remainingLockoutTime: Math.max(0, remainingLockoutTime) });
        } else if (get().isLockedOut) {
          set({ isLockedOut: false, remainingLockoutTime: 0, failedAttempts: 0, lockoutUntil: null });
        }

        // Handle Global Temp Unlock
        const isTempUnlocked = tempUnlockUntil ? now < tempUnlockUntil : false;
        const remainingTempUnlockTime = tempUnlockUntil ? Math.ceil((tempUnlockUntil - now) / 1000) : 0;
         if (isTempUnlocked) {
          set({ isTempUnlocked, remainingTempUnlockTime: Math.max(0, remainingTempUnlockTime) });
        } else if (get().isTempUnlocked) {
          set({ isTempUnlocked: false, remainingTempUnlockTime: 0, tempUnlockUntil: null });
        }

        // Handle Session Authentication
        const isTempAuthenticated = tempAuthenticatedUntil ? now < tempAuthenticatedUntil : false;
         if (!isTempAuthenticated && get().isTempAuthenticated) {
            set({ isTempAuthenticated: false, tempAuthenticatedUntil: null });
         } else if (isTempAuthenticated && !get().isTempAuthenticated) {
            set({ isTempAuthenticated: true });
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

if (typeof window !== 'undefined') {
  useLock.persist.rehydrate();
  setInterval(() => {
    useLock.getState()._updateLockoutStatus();
  }, 1000);
}
