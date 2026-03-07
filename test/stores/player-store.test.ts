import { afterEach, describe, expect, test, vi } from 'vitest'
import type { PlayerTrack } from '../../src/features/player/stores/player-store'
import {
  defaultPlayerSnapshot,
  usePlayerStore,
} from '../../src/features/player/stores/player-store'

const queue: PlayerTrack[] = [
  { id: 1, name: 'Track 1', artists: ['Artist 1'], durationMs: 1000 },
  { id: 2, name: 'Track 2', artists: ['Artist 2'], durationMs: 2000 },
  { id: 3, name: 'Track 3', artists: ['Artist 3'], durationMs: 3000 },
]

afterEach(() => {
  usePlayerStore.setState(defaultPlayerSnapshot)
  vi.restoreAllMocks()
})

describe('player store', () => {
  test('loadQueueAndPlay primes queue and marks playback active', () => {
    usePlayerStore.getState().loadQueueAndPlay(queue, 2)

    expect(usePlayerStore.getState().queue).toEqual(queue)
    expect(usePlayerStore.getState().playNextQueue).toEqual([])
    expect(usePlayerStore.getState().currentTrackId).toBe(2)
    expect(usePlayerStore.getState().durationSeconds).toBe(2)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  test('setTrackSource updates the queued track source url', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 1,
    })

    usePlayerStore.getState().setTrackSource(1, 'https://example.com/song.mp3')

    expect(usePlayerStore.getState().queue[0]?.sourceUrl).toBe(
      'https://example.com/song.mp3',
    )
  })

  test('skipToNext advances to the next track and updates duration', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 1,
      isPlaying: true,
      durationSeconds: 1,
    })

    usePlayerStore.getState().skipToNext()

    expect(usePlayerStore.getState().currentTrackId).toBe(2)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    expect(usePlayerStore.getState().progressSeconds).toBe(0)
    expect(usePlayerStore.getState().durationSeconds).toBe(2)
  })

  test('skipToNext prefers play-next queue before main queue', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 1,
      isPlaying: true,
      playNextQueue: [queue[2]],
    })

    usePlayerStore.getState().skipToNext()

    expect(usePlayerStore.getState().currentTrackId).toBe(3)
    expect(usePlayerStore.getState().playNextQueue).toEqual([])
    expect(usePlayerStore.getState().durationSeconds).toBe(3)
  })

  test('skipToNext loops when repeatMode is all', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 3,
      repeatMode: 'all',
      isPlaying: true,
    })

    usePlayerStore.getState().skipToNext()

    expect(usePlayerStore.getState().currentTrackId).toBe(1)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    expect(usePlayerStore.getState().durationSeconds).toBe(1)
  })

  test('skipToPrevious rewinds current track when progress is over three seconds', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 2,
      progressSeconds: 12,
      durationSeconds: 2,
      isPlaying: true,
    })

    usePlayerStore.getState().skipToPrevious()

    expect(usePlayerStore.getState().currentTrackId).toBe(2)
    expect(usePlayerStore.getState().progressSeconds).toBe(0)
    expect(usePlayerStore.getState().durationSeconds).toBe(2)
  })

  test('playTrack updates duration in seconds', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
    })

    usePlayerStore.getState().playTrack(3)

    expect(usePlayerStore.getState().currentTrackId).toBe(3)
    expect(usePlayerStore.getState().durationSeconds).toBe(3)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  test('seekTo clamps progress within track duration', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 2,
      durationSeconds: 2,
    })

    usePlayerStore.getState().seekTo(3.7)

    expect(usePlayerStore.getState().progressSeconds).toBe(2)
  })

  test('cycleRepeatMode rotates off, all, one', () => {
    usePlayerStore.getState().cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('all')

    usePlayerStore.getState().cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('one')

    usePlayerStore.getState().cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('off')
  })

  test('skipToNext in shuffle mode chooses another track when possible', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 2,
      shuffleEnabled: true,
      isPlaying: true,
    })

    usePlayerStore.getState().skipToNext()

    expect(usePlayerStore.getState().currentTrackId).toBe(1)
    expect(usePlayerStore.getState().durationSeconds).toBe(1)
  })

  test('enqueueToPlayNext appends a track to the insert queue', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 1,
      isPlaying: true,
    })

    usePlayerStore.getState().enqueueToPlayNext(queue[2])

    expect(usePlayerStore.getState().playNextQueue).toEqual([queue[2]])
  })
})
