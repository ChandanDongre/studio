
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const DEFAULT_PIN = "1234";
const DEFAULT_PATTERN = [0, 1, 2, 5, 8, 7, 6, 3];
const DEFAULT_PASSWORD = "password";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;
const TEMP_UNLOCK_MINUTES = 15;

interface LockState {
  lockType: 'pin' | 'pattern' | 'password';
  pin: string;
  pattern: number[];
  password: string;
  isSetupComplete: boolean;
  isBiometricsEnabled: boolean;
  isLoading: boolean; // Flag to check if state has been rehydrated from storage
  failedAttempts: number;
  lockoutUntil: number | null; // Timestamp
  tempUnlockUntil: number | null; // Timestamp for global unlock
  isTempAuthenticated: boolean; // Is user authenticated for this session? Resets on page refresh.
  isLockedOut: boolean;
  remainingLockoutTime: number;
  isTempUnlocked: boolean; // Is the global 15-min unlock active?
  remainingTempUnlockTime: number;
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
  setTempAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void; // Explicitly log out of the session
  _updateStatus: () => void; // Internal function to update timers
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
      isLoading: true, // Start as true until rehydration is complete
      failedAttempts: 0,
      lockoutUntil: null,
      tempUnlockUntil: null,
      isTempAuthenticated: false,
      isLockedOut: false,
      remainingLockoutTime: 0,
      isTempUnlocked: false,
      remainingTempUnlockTime: 0,
      
      setLockType: (type) => set({ lockType: type }),
      setPin: (pin) => set({ pin, failedAttempts: 0, lockoutUntil: null }),
      setPattern: (pattern) => set({ pattern, failedAttempts: 0, lockoutUntil: null }),
      setPassword: (password) => set({ password, failedAttempts: 0, lockoutUntil: null }),
      completeSetup: () => set({ isSetupComplete: true, isTempAuthenticated: true }), // Authenticate after setup
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
          get()._updateStatus();
        } else {
          set({ failedAttempts: newAttemptCount });
        }
      },
      startTempUnlock: () => {
        const tempUnlockUntil = Date.now() + TEMP_UNLOCK_MINUTES * 60 * 1000;
        set({ tempUnlockUntil, isTempAuthenticated: true }); // Also authenticate for the session
      },
      setTempAuthenticated: (isAuthenticated) => {
        set({ isTempAuthenticated: isAuthenticated });
      },
      logout: () => {
        set({ isTempAuthenticated: false, tempUnlockUntil: null, isTempUnlocked: false, remainingTempUnlockTime: 0 });
      },
      _updateStatus: () => {
        const { lockoutUntil, tempUnlockUntil } = get();
        const now = Date.now();
        
        // Handle Lockout
        const isLockedOut = lockoutUntil ? now < lockoutUntil : false;
        const remainingLockoutTime = lockoutUntil ? Math.ceil((lockoutUntil - now) / 1000) : 0;
        
        if (isLockedOut) {
          set({ isLockedOut, remainingLockoutTime: Math.max(0, remainingLockoutTime) });
        } else if (get().isLockedOut) { // If it *was* locked out but time has passed
          set({ isLockedOut: false, remainingLockoutTime: 0, failedAttempts: 0, lockoutUntil: null });
        }

        // Handle Global Temp Unlock
        const isTempUnlocked = tempUnlockUntil ? now < tempUnlockUntil : false;
        const remainingTempUnlockTime = tempUnlockUntil ? Math.ceil((tempUnlockUntil - now) / 1000) : 0;
         if (isTempUnlocked) {
          set({ isTempUnlocked, remainingTempUnlockTime: Math.max(0, remainingTempUnlockTime) });
        } else if (get().isTempUnlocked) { // If it *was* temp unlocked but time has passed
          set({ isTempUnlocked: false, remainingTempUnlockTime: 0, tempUnlockUntil: null, isTempAuthenticated: false });
        }
      }
    }),
    {
      name: 'fortress-lock-storage',
      storage: createJSONStorage(() => localStorage),
      // This function runs after the stored state has been restored.
      onRehydrateStorage: () => (state) => {
          if (state) {
            // This is the key change: ensure tempAuthenticated is always false on app load/refresh
            // and set isLoading to false so the app knows it can render.
            state.isTempAuthenticated = false; 
            state.isLoading = false;
          }
      },
    }
  )
);

// Initialize store and start timers
// This block ensures that the app state is correctly initialized and timers start running
// as soon as the app loads in the browser.
if (typeof window !== 'undefined') {
  // Trigger the rehydration process from localStorage.
  useLock.persist.rehydrate();
  
  // Set isTempAuthenticated to false on the first load of any session.
  // This prevents a user from being stuck in an authenticated state on refresh.
  useLock.getState().setTempAuthenticated(false);

  // Start a timer to check lockout/temp-unlock status every second.
  setInterval(() => {
    useLock.getState()._updateStatus();
  }, 1000);
}
