import { describe, expect, test } from 'vitest'
import {
  buildNewAlbumPlaybackQueue,
  buildNewAlbumQueueSource,
  DEFAULT_NEW_ALBUM_AREA,
  getNewAlbumArtists,
  hydrateNewAlbumTracks,
  normalizeNewAlbumArea,
  normalizeNewAlbumSearch,
} from '../../src/features/album/lib/new-album'

describe('new album helpers', () => {
  test('normalizes unsupported area values to default area', () => {
    expect(normalizeNewAlbumArea('ea')).toBe('EA')
    expect(normalizeNewAlbumArea('unknown')).toBe(DEFAULT_NEW_ALBUM_AREA)
  })

  test('normalizes search payload with fallback page', () => {
    expect(normalizeNewAlbumSearch({ area: 'jp', page: 0 })).toEqual({
      area: 'JP',
      page: 1,
    })
  })

  test('builds queue source and album artist label', () => {
    expect(buildNewAlbumQueueSource('KR')).toEqual({
      label: '韩国新专辑',
      to: '/new-album',
      newAlbumArea: 'KR',
    })

    expect(
      getNewAlbumArtists({
        id: 1,
        name: 'Album',
        artists: [
          { id: 10, name: 'Artist A' },
          { id: 11, name: 'Artist B' },
        ],
      }),
    ).toBe('Artist A / Artist B')
  })

  test('hydrates album cover metadata for new album playback tracks', () => {
    expect(
      hydrateNewAlbumTracks(
        [
          {
            id: 101,
            name: 'Song',
            al: { id: 1, name: 'Album' },
          },
        ],
        {
          id: 1,
          name: 'Album',
          picUrl: 'cover.jpg',
        },
      ),
    ).toEqual([
      {
        id: 101,
        name: 'Song',
        al: { id: 1, name: 'Album', picUrl: 'cover.jpg' },
        album: { id: 1, name: 'Album', picUrl: 'cover.jpg' },
      },
    ])
  })

  test('builds playback queue with explicit cover fallback from album card', () => {
    expect(
      buildNewAlbumPlaybackQueue(
        [
          {
            id: 101,
            name: 'Song',
            ar: [{ id: 10, name: 'Artist A' }],
            playable: true,
          },
        ],
        {
          id: 1,
          name: 'Album',
          picUrl: 'cover.jpg',
        },
      ),
    ).toEqual([
      {
        id: 101,
        name: 'Song',
        artists: ['Artist A'],
        artistIds: [10],
        albumId: 1,
        albumName: 'Album',
        coverUrl: 'cover.jpg',
        durationMs: undefined,
      },
    ])
  })
})
