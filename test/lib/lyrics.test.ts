import { describe, expect, test } from 'vitest'
import {
  getActiveLyricIndex,
  getLyricPreview,
  parseLyricText,
} from '../../src/features/track/lib/lyrics'

const rawLyric = `
[00:01.00]Line one
[00:05.00]Line two
[00:09.00]Line three
[00:12.00]Line four
`

describe('lyrics helpers', () => {
  test('parseLyricText keeps lines ordered by timestamp', () => {
    expect(parseLyricText(rawLyric)).toEqual([
      { rawTime: '[00:01.00]', time: 1, content: 'Line one' },
      { rawTime: '[00:05.00]', time: 5, content: 'Line two' },
      { rawTime: '[00:09.00]', time: 9, content: 'Line three' },
      { rawTime: '[00:12.00]', time: 12, content: 'Line four' },
    ])
  })

  test('getActiveLyricIndex follows playback progress', () => {
    const parsed = parseLyricText(rawLyric)

    expect(getActiveLyricIndex(parsed, 0)).toBe(0)
    expect(getActiveLyricIndex(parsed, 5.2)).toBe(1)
    expect(getActiveLyricIndex(parsed, 99)).toBe(3)
  })

  test('getActiveLyricIndex returns -1 for empty lyric lists', () => {
    expect(getActiveLyricIndex([], 3)).toBe(-1)
  })

  test('getLyricPreview starts from the current active line', () => {
    const parsed = parseLyricText(rawLyric)

    expect(getLyricPreview(parsed, 5.2, 2)).toEqual([
      { rawTime: '[00:05.00]', time: 5, content: 'Line two' },
      { rawTime: '[00:09.00]', time: 9, content: 'Line three' },
    ])
  })
})
