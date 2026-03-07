import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserJsonStorage } from '#/lib/browser-storage'
import { STORAGE_KEYS } from '#/lib/constants/storage'

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerTrack {
  id: number
  name: string
  artists: string[]
  artistIds?: number[]
  albumId?: number
  albumName?: string
  coverUrl?: string
  sourceUrl?: string
  durationMs?: number
}

export interface PlayerQueueSource {
  label: string
  to?:
    | '/playlist/$id'
    | '/album/$id'
    | '/artist/$id'
    | '/daily/songs'
    | '/library/liked-songs'
    | '/explore'
    | '/new-album'
    | '/search'
  params?: { id: string }
  exploreCategory?: string
  newAlbumArea?: string
  search?: {
    q: string
    type: number
    page: number
  }
}

export interface PlayerStoreSnapshot {
  queue: PlayerTrack[]
  queueSource: PlayerQueueSource | null
  playNextQueue: PlayerTrack[]
  currentTrackId: number | null
  isPlaying: boolean
  volume: number
  progressSeconds: number
  durationSeconds: number
  repeatMode: RepeatMode
  shuffleEnabled: boolean
}

interface PlayerStoreActions {
  clearPlayNextQueue: () => void
  cycleRepeatMode: () => void
  enqueueToPlayNext: (track: PlayerTrack) => void
  loadQueueAndPlay: (queue: PlayerTrack[], currentTrackId?: number | null, source?: PlayerQueueSource | null) => void
  pause: () => void
  play: () => void
  playTrack: (trackId: number) => void
  removeTrackFromPlayNext: (trackId: number) => void
  removeTrackFromQueue: (trackId: number) => void
  resetPlayer: () => void
  seekTo: (progressSeconds: number) => void
  setDurationSeconds: (durationSeconds: number) => void
  setProgressSeconds: (progressSeconds: number) => void
  setQueue: (queue: PlayerTrack[], currentTrackId?: number | null, source?: PlayerQueueSource | null) => void
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
  playNextQueue: [],
  queueSource: null,
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

function getNextRepeatMode(repeatMode: RepeatMode) {
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
    (queue.find((track) => track.id === currentTrackId)?.durationMs ?? 0) / 1000,
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

function upsertTrack(queue: PlayerTrack[], track: PlayerTrack) {
  const index = queue.findIndex((item) => item.id === track.id)

  if (index === -1) {
    return [...queue, track]
  }

  return queue.map((item) => (item.id === track.id ? { ...item, ...track } : item))
}

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set) => ({
      ...defaultPlayerSnapshot,
      clearPlayNextQueue: () => set({ playNextQueue: [] }),
      cycleRepeatMode: () =>
        set((state) => ({ repeatMode: getNextRepeatMode(state.repeatMode) })),
      enqueueToPlayNext: (track) =>
        set((state) => {
          if (state.queue.length === 0 || state.currentTrackId === null) {
            return {
              queue: [track],
              playNextQueue: [],
              queueSource: null,
              currentTrackId: track.id,
              isPlaying: true,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds([track], track.id),
            }
          }

          return {
            queue: upsertTrack(state.queue, track),
            playNextQueue: [
              ...state.playNextQueue.filter(
                (item) => item.id !== track.id && item.id !== state.currentTrackId,
              ),
              track,
            ],
          }
        }),
      loadQueueAndPlay: (queue, currentTrackId = queue[0]?.id ?? null, source = null) =>
        set({
          queue,
          queueSource: source,
          playNextQueue: [],
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
      removeTrackFromPlayNext: (trackId) =>
        set((state) => ({
          playNextQueue: state.playNextQueue.filter((track) => track.id !== trackId),
        })),
      removeTrackFromQueue: (trackId) =>
        set((state) => {
          const removedIndex = state.queue.findIndex((track) => track.id === trackId)

          if (removedIndex === -1) {
            return {
              playNextQueue: state.playNextQueue.filter((track) => track.id !== trackId),
            }
          }

          const nextQueue = state.queue.filter((track) => track.id !== trackId)
          const nextPlayNextQueue = state.playNextQueue.filter((track) => track.id !== trackId)

          if (nextQueue.length === 0) {
            return {
              queue: [],
              playNextQueue: [],
              queueSource: null,
              currentTrackId: null,
              isPlaying: false,
              progressSeconds: 0,
              durationSeconds: 0,
            }
          }

          if (state.currentTrackId !== trackId) {
            return {
              queue: nextQueue,
              playNextQueue: nextPlayNextQueue,
            }
          }

          const fallbackTrack =
            nextQueue[Math.min(removedIndex, nextQueue.length - 1)] ?? nextQueue[0]

          return {
            queue: nextQueue,
            playNextQueue: nextPlayNextQueue,
            currentTrackId: fallbackTrack?.id ?? null,
            isPlaying: fallbackTrack ? state.isPlaying : false,
            progressSeconds: 0,
            durationSeconds: resolveDurationSeconds(nextQueue, fallbackTrack?.id ?? null),
          }
        }),
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
      setQueue: (queue, currentTrackId = queue[0]?.id ?? null, source = null) =>
        set({
          queue,
          queueSource: source,
          playNextQueue: [],
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
          playNextQueue: state.playNextQueue.map((track) =>
            track.id === trackId ? { ...track, sourceUrl } : track,
          ),
        })),
      setVolume: (volume) => set({ volume: clampVolume(volume) }),
      skipToNext: () =>
        set((state) => {
          if (state.queue.length === 0) {
            return state
          }

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

          if (state.playNextQueue.length > 0) {
            const [nextPlayTrack, ...restPlayNextQueue] = state.playNextQueue
            const nextQueue = upsertTrack(state.queue, nextPlayTrack)

            return {
              queue: nextQueue,
              playNextQueue: restPlayNextQueue,
              currentTrackId: nextPlayTrack.id,
              progressSeconds: 0,
              durationSeconds: resolveDurationSeconds(nextQueue, nextPlayTrack.id),
              isPlaying: true,
            }
          }

          const currentIndex = getCurrentTrackIndex(
            state.queue,
            state.currentTrackId,
          )

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
        queueSource: state.queueSource,
        playNextQueue: state.playNextQueue,
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
