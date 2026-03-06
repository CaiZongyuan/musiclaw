import { describe, expect, test } from 'vitest'
import {
  isTrackPlayable,
  mapTrackPlayableStatus,
} from '../../src/lib/music/playability'

describe('track playability', () => {
  test('marks vip-only tracks as not playable for non-vip users', () => {
    expect(
      isTrackPlayable({
        fee: 1,
        privilege: { id: 1, fee: 1 },
      }),
    ).toEqual({
      playable: false,
      reason: 'VIP Only',
    })
  })

  test('keeps cloud tracks playable when cloud privilege exists', () => {
    expect(
      isTrackPlayable(
        {
          privilege: { id: 1, cs: true },
        },
        { hasCloudPrivilege: true },
      ),
    ).toEqual({
      playable: true,
      reason: '',
    })
  })

  test('maps privileges onto tracks before resolving playability', () => {
    const [track] = mapTrackPlayableStatus(
      [
        {
          id: 1,
          name: 'Song',
        },
      ],
      [{ id: 1, fee: 4 }],
    )

    expect(track.playable).toBe(false)
    expect(track.reason).toBe('付费专辑')
    expect(track.privilege?.fee).toBe(4)
  })
})
