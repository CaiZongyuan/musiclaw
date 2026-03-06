import { createJSONStorage, type StateStorage } from 'zustand/middleware'

interface PersistedStoreState<TState> {
  state: TState
  version?: number
}

const noopStateStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export function getBrowserStateStorage(): StateStorage {
  if (typeof window === 'undefined') {
    return noopStateStorage
  }

  return window.localStorage
}

export function createBrowserJsonStorage<TState>() {
  return createJSONStorage<TState>(() => getBrowserStateStorage())
}

export function readStoredJson<TValue>(key: string): TValue | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as TValue
  } catch {
    return null
  }
}

export function readPersistedStoreState<TState>(key: string): TState | null {
  const persistedState = readStoredJson<PersistedStoreState<TState>>(key)
  return persistedState?.state ?? null
}
