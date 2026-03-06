import { describe, expect, test } from 'vitest'
import { normalizeTopArtistsResponse } from '../../src/features/artist/api/artist-api'

describe('normalizeTopArtistsResponse', () => {
  test('reads artists from response.list.artists', () => {
    const response = normalizeTopArtistsResponse({
      code: 200,
      list: {
        artists: [{ id: 1, name: 'Artist 1' }],
      },
    })

    expect(response.artists).toEqual([{ id: 1, name: 'Artist 1' }])
  })

  test('reads artists from response.list when list is already an array', () => {
    const response = normalizeTopArtistsResponse({
      code: 200,
      list: [{ id: 2, name: 'Artist 2' }],
    })

    expect(response.artists).toEqual([{ id: 2, name: 'Artist 2' }])
  })
})
