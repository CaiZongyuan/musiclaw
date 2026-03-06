import { afterEach, describe, expect, test } from 'vitest'
import {
  defaultPlayerSnapshot,
  usePlayerStore,
  type PlayerTrack,
} from '../../src/features/player/stores/player-store'

const queue: PlayerTrack[] = [
  { id: 1, name: 'Track 1', artists: ['Artist 1'], durationMs: 1000 },
  { id: 2, name: 'Track 2', artists: ['Artist 2'], durationMs: 2000 },
  { id: 3, name: 'Track 3', artists: ['Artist 3'], durationMs: 3000 },
]

afterEach(() => {
  usePlayerStore.setState(defaultPlayerSnapshot)
})

describe('player store', () => {
  test('loadQueueAndPlay primes queue and marks playback active', () => {
    usePlayerStore.getState().loadQueueAndPlay(queue, 2)

    expect(usePlayerStore.getState().queue).toEqual(queue)
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

  test('skipToNext advances to the next track', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 1,
      isPlaying: true,
    })

    usePlayerStore.getState().skipToNext()

    expect(usePlayerStore.getState().currentTrackId).toBe(2)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    expect(usePlayerStore.getState().progressSeconds).toBe(0)
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
  })

  test('skipToPrevious rewinds current track when progress is over three seconds', () => {
    usePlayerStore.setState({
      ...defaultPlayerSnapshot,
      queue,
      currentTrackId: 2,
      progressSeconds: 12,
      isPlaying: true,
    })

    usePlayerStore.getState().skipToPrevious()

    expect(usePlayerStore.getState().currentTrackId).toBe(2)
    expect(usePlayerStore.getState().progressSeconds).toBe(0)
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
})
