import { describe, expect, test } from 'vitest'
import {
  buildPlayerQueueFromTracks,
  mapNeteaseTrackToPlayerTrack,
} from '../../src/features/player/lib/player-track'

describe('player track mapping', () => {
  test('maps a netease track into player queue shape', () => {
    expect(
      mapNeteaseTrackToPlayerTrack({
        id: 1,
        name: 'Track',
        ar: [{ id: 2, name: 'Artist' }],
        al: { id: 3, name: 'Album', picUrl: 'cover.jpg' },
        dt: 1000,
      }),
    ).toEqual({
      id: 1,
      name: 'Track',
      artists: ['Artist'],
      artistIds: [2],
      albumId: 3,
      albumName: 'Album',
      coverUrl: 'cover.jpg',
      durationMs: 1000,
    })
  })

  test('builds a queue from multiple tracks', () => {
    expect(
      buildPlayerQueueFromTracks([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]),
    ).toHaveLength(2)
  })
})
