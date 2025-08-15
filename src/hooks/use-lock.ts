'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const DEFAULT_PIN = "1234";
const DEFAULT_PATTERN = [0, 1, 3, 5, 4, 2];

interface LockState {
  lockType: 'pin' | 'pattern';
  pin: string;
  pattern: number[];
  isLoading: boolean;
  setLockType: (type: 'pin' | 'pattern') => void;
  setPin: (pin: string) => void;
  setPattern: (pattern: number[]) => void;
  checkPin: (pin: string) => boolean;
  checkPattern: (pattern: number[]) => boolean;
}

export const useLock = create<LockState>()(
  persist(
    (set, get) => ({
      lockType: 'pin',
      pin: DEFAULT_PIN,
      pattern: DEFAULT_PATTERN,
      isLoading: true, // For handling hydration
      setLockType: (type) => set({ lockType: type }),
      setPin: (pin) => set({ pin }),
      setPattern: (pattern) => set({ pattern }),
      checkPin: (pin) => pin === get().pin,
      checkPattern: (pattern) => JSON.stringify(pattern) === JSON.stringify(get().pattern),
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
}
