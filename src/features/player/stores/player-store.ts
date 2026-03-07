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
  cycleRepeatMode: () => void
  loadQueueAndPlay: (queue: PlayerTrack[], currentTrackId?: number | null) => void
  pause: () => void
  play: () => void
  playTrack: (trackId: number) => void
  resetPlayer: () => void
  seekTo: (progressSeconds: number) => void
  setDurationSeconds: (durationSeconds: number) => void
  setProgressSeconds: (progressSeconds: number) => void
  setQueue: (queue: PlayerTrack[], currentTrackId?: number | null) => void
  setRepeatMode: (repeatMode: RepeatMode) => void
  setShuffleEnabled: (shuffleEnabled: boolean) => void
  setTrackSource: (trackId: number, sourceUrl: string) => void
  setVolume: (volume: number) => void
  skipToNext: () => void
  skipToPrevious: () => void
  toggleShuffleEnabled: () => void
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

function clampDuration(durationSeconds: number) {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return 0
  }

  return durationSeconds
}

function clampProgress(progressSeconds: number, durationSeconds: number) {
  if (!Number.isFinite(progressSeconds) || progressSeconds < 0) {
    return 0
  }

  if (durationSeconds <= 0) {
    return progressSeconds
  }

  return Math.min(progressSeconds, durationSeconds)
}

function getNextRepeatMode(repeatMode: RepeatMode): RepeatMode {
  if (repeatMode === 'off') {
    return 'all'
  }

  if (repeatMode === 'all') {
    return 'one'
  }

  return 'off'
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
  return clampDuration(
    (queue.find((track) => track.id === currentTrackId)?.durationMs ?? 0) / 1000
  )
}

function getRandomTrackId(
  queue: PlayerTrack[],
  currentTrackId: number | null,
  fallbackTrackId: number,
) {
  const availableTrackIds = queue
    .map((track) => track.id)
    .filter((trackId) => trackId !== currentTrackId)

  if (availableTrackIds.length === 0) {
    return fallbackTrackId
  }

  const randomIndex = Math.floor(Math.random() * availableTrackIds.length)
  return availableTrackIds[randomIndex] ?? fallbackTrackId
}

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set) => ({
      ...defaultPlayerSnapshot,
      cycleRepeatMode: () =>
        set((state) => ({ repeatMode: getNextRepeatMode(state.repeatMode) })),
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
      seekTo: (progressSeconds) =>
        set((state) => ({
          progressSeconds: clampProgress(progressSeconds, state.durationSeconds),
        })),
      setDurationSeconds: (durationSeconds) =>
        set((state) => {
          const nextDurationSeconds = clampDuration(durationSeconds)

          return {
            durationSeconds: nextDurationSeconds,
            progressSeconds: clampProgress(
              state.progressSeconds,
              nextDurationSeconds,
            ),
          }
        }),
      setProgressSeconds: (progressSeconds) =>
        set((state) => ({
          progressSeconds: clampProgress(progressSeconds, state.durationSeconds),
        })),
      setQueue: (queue, currentTrackId = queue[0]?.id ?? null) =>
        set({
          queue,
          currentTrackId,
          progressSeconds: 0,
          durationSeconds: resolveDurationSeconds(queue, currentTrackId),
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
              durationSeconds: resolveDurationSeconds(
                state.queue,
                state.currentTrackId,
              ),
              isPlaying: true,
            }
          }

          if (state.shuffleEnabled && state.queue.length > 1) {
            const nextTrackId = getRandomTrackId(
              state.queue,
              state.currentTrackId,
              fallbackTrack.id,
            )

            return {
              currentTrackId: nextTrackId,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(state.queue, nextTrackId),
              isPlaying: true,
            }
          }

          const nextIndex = currentIndex + 1
          const nextTrackId = state.queue[nextIndex]?.id ?? fallbackTrack.id

          if (nextIndex < state.queue.length) {
            return {
              currentTrackId: nextTrackId,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(state.queue, nextTrackId),
              isPlaying: true,
            }
          }

          if (state.repeatMode === 'all') {
            return {
              currentTrackId: fallbackTrack.id,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(
                state.queue,
                fallbackTrack.id,
              ),
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
              durationSeconds: resolveDurationSeconds(
                state.queue,
                state.currentTrackId,
              ),
            }
          }

          if (state.shuffleEnabled && state.queue.length > 1) {
            const nextTrackId = getRandomTrackId(
              state.queue,
              state.currentTrackId,
              fallbackTrack.id,
            )

            return {
              currentTrackId: nextTrackId,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(state.queue, nextTrackId),
              isPlaying: true,
            }
          }

          const previousIndex = currentIndex - 1
          const previousTrackId =
            state.queue[previousIndex]?.id ?? fallbackTrack.id

          if (previousIndex >= 0) {
            return {
              currentTrackId: previousTrackId,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(
                state.queue,
                previousTrackId,
              ),
              isPlaying: true,
            }
          }

          return {
            currentTrackId: fallbackTrack.id,
            progressSeconds: 0,
            durationSeconds: resolveDurationSeconds(state.queue, fallbackTrack.id),
            isPlaying: true,
          }
        }),
      toggleShuffleEnabled: () =>
        set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),
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
