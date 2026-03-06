import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserJsonStorage } from '#/lib/browser-storage'
import { STORAGE_KEYS } from '#/lib/constants/storage'

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerTrack {
  id: number
  name: string
  artists: string[]
  albumName?: string
  coverUrl?: string
  sourceUrl?: string
  durationMs?: number
}

export interface PlayerStoreSnapshot {
  queue: PlayerTrack[]
  currentTrackId: number | null
  isPlaying: boolean
  volume: number
  progressSeconds: number
  durationSeconds: number
  repeatMode: RepeatMode
  shuffleEnabled: boolean
}

interface PlayerStoreActions {
  loadQueueAndPlay: (queue: PlayerTrack[], currentTrackId?: number | null) => void
  pause: () => void
  play: () => void
  playTrack: (trackId: number) => void
  resetPlayer: () => void
  setDurationSeconds: (durationSeconds: number) => void
  setProgressSeconds: (progressSeconds: number) => void
  setQueue: (queue: PlayerTrack[], currentTrackId?: number | null) => void
  setRepeatMode: (repeatMode: RepeatMode) => void
  setShuffleEnabled: (shuffleEnabled: boolean) => void
  setTrackSource: (trackId: number, sourceUrl: string) => void
  setVolume: (volume: number) => void
  skipToNext: () => void
  skipToPrevious: () => void
  togglePlayback: () => void
}

export type PlayerStoreState = PlayerStoreSnapshot & PlayerStoreActions

export const defaultPlayerSnapshot: PlayerStoreSnapshot = {
  queue: [],
  currentTrackId: null,
  isPlaying: false,
  volume: 1,
  progressSeconds: 0,
  durationSeconds: 0,
  repeatMode: 'off',
  shuffleEnabled: false,
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume))
}

function getCurrentTrackIndex(
  queue: PlayerTrack[],
  currentTrackId: number | null,
) {
  if (currentTrackId === null) {
    return -1
  }

  return queue.findIndex((track) => track.id === currentTrackId)
}

function resolveDurationSeconds(
  queue: PlayerTrack[],
  currentTrackId: number | null,
) {
  return (
    (queue.find((track) => track.id === currentTrackId)?.durationMs ?? 0) / 1000
  )
}

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set) => ({
      ...defaultPlayerSnapshot,
      loadQueueAndPlay: (queue, currentTrackId = queue[0]?.id ?? null) =>
        set({
          queue,
          currentTrackId,
          isPlaying: currentTrackId !== null,
          progressSeconds: 0,
          durationSeconds: resolveDurationSeconds(queue, currentTrackId),
        }),
      pause: () => set({ isPlaying: false }),
      play: () => set({ isPlaying: true }),
      playTrack: (trackId) =>
        set((state) => ({
          currentTrackId: trackId,
          isPlaying: true,
          progressSeconds: 0,
          durationSeconds: resolveDurationSeconds(state.queue, trackId),
        })),
      resetPlayer: () => set(defaultPlayerSnapshot),
      setDurationSeconds: (durationSeconds) => set({ durationSeconds }),
      setProgressSeconds: (progressSeconds) => set({ progressSeconds }),
      setQueue: (queue, currentTrackId = queue[0]?.id ?? null) =>
        set({
          queue,
          currentTrackId,
          progressSeconds: 0,
          durationSeconds: 0,
        }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      setShuffleEnabled: (shuffleEnabled) => set({ shuffleEnabled }),
      setTrackSource: (trackId, sourceUrl) =>
        set((state) => ({
          queue: state.queue.map((track) =>
            track.id === trackId ? { ...track, sourceUrl } : track,
          ),
        })),
      setVolume: (volume) => set({ volume: clampVolume(volume) }),
      skipToNext: () =>
        set((state) => {
          if (state.queue.length === 0) {
            return state
          }

          const currentIndex = getCurrentTrackIndex(
            state.queue,
            state.currentTrackId,
          )
          const fallbackTrack = state.queue[0]

          if (state.repeatMode === 'one' && state.currentTrackId !== null) {
            return {
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          if (state.shuffleEnabled && state.queue.length > 1) {
            const randomIndex = Math.floor(Math.random() * state.queue.length)
            return {
              currentTrackId: state.queue[randomIndex]?.id ?? fallbackTrack.id,
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          const nextIndex = currentIndex + 1
          if (nextIndex < state.queue.length) {
            return {
              currentTrackId: state.queue[nextIndex]?.id ?? fallbackTrack.id,
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          if (state.repeatMode === 'all') {
            return {
              currentTrackId: fallbackTrack.id,
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          return {
            isPlaying: false,
            progressSeconds: 0,
          }
        }),
      skipToPrevious: () =>
        set((state) => {
          if (state.queue.length === 0) {
            return state
          }

          const currentIndex = getCurrentTrackIndex(
            state.queue,
            state.currentTrackId,
          )
          const fallbackTrack = state.queue[0]

          if (state.progressSeconds > 3) {
            return {
              progressSeconds: 0,
            }
          }

          if (state.shuffleEnabled && state.queue.length > 1) {
            const randomIndex = Math.floor(Math.random() * state.queue.length)
            return {
              currentTrackId: state.queue[randomIndex]?.id ?? fallbackTrack.id,
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          const previousIndex = currentIndex - 1
          if (previousIndex >= 0) {
            return {
              currentTrackId:
                state.queue[previousIndex]?.id ?? fallbackTrack.id,
              progressSeconds: 0,
              isPlaying: true,
            }
          }

          return {
            currentTrackId: fallbackTrack.id,
            progressSeconds: 0,
            isPlaying: true,
          }
        }),
      togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
    }),
    {
      name: STORAGE_KEYS.player,
      storage: createBrowserJsonStorage<PlayerStoreSnapshot>(),
      partialize: (state) => ({
        queue: state.queue,
        currentTrackId: state.currentTrackId,
        volume: state.volume,
        progressSeconds: state.progressSeconds,
        durationSeconds: state.durationSeconds,
        repeatMode: state.repeatMode,
        shuffleEnabled: state.shuffleEnabled,
        isPlaying: false,
      }),
    },
  ),
)
