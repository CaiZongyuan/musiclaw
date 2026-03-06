import { describe, expect, test } from 'vitest'
import { normalizeSearchResponse } from '../../src/features/search/api/search-api'

describe('normalizeSearchResponse', () => {
  test('flattens comprehensive search result groups', () => {
    const response = normalizeSearchResponse({
      code: 200,
      result: {
        song: {
          songs: [{ id: 1, name: 'Song 1' }],
          songCount: 1,
        },
        artist: {
          artists: [{ id: 2, name: 'Artist 1' }],
          artistCount: 1,
        },
        album: {
          albums: [{ id: 3, name: 'Album 1' }],
          albumCount: 1,
        },
        playlist: {
          playlists: [{ id: 4, name: 'Playlist 1' }],
          playlistCount: 1,
        },
      },
    })

    expect(response.result.songs).toHaveLength(1)
    expect(response.result.artists).toHaveLength(1)
    expect(response.result.albums).toHaveLength(1)
    expect(response.result.playlists).toHaveLength(1)
    expect(response.result.songCount).toBe(1)
  })

  test('keeps top-level typed results intact', () => {
    const response = normalizeSearchResponse({
      code: 200,
      result: {
        songs: [{ id: 10, name: 'Song 10' }],
        songCount: 1,
      },
    })

    expect(response.result.songs).toEqual([
      { id: 10, name: 'Song 10', playable: true, reason: '', privilege: {} },
    ])
  })
})
