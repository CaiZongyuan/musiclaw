import { describe, expect, test } from 'vitest'
import {
  normalizeTrackLyricsResponse,
  parseLyricText,
} from '../../src/features/track/lib/lyrics'

describe('track lyrics', () => {
  test('parses and sorts lyric lines by time', () => {
    expect(
      parseLyricText('[00:10.00] World\n[00:05.50] Hello\n[00:05.70] Again'),
    ).toEqual([
      { rawTime: '[00:05.50]', time: 5.5, content: 'Hello' },
      { rawTime: '[00:05.70]', time: 5.7, content: 'Again' },
      { rawTime: '[00:10.00]', time: 10, content: 'World' },
    ])
  })

  test('normalizes original, translated and roman lyrics', () => {
    const lyrics = normalizeTrackLyricsResponse({
      code: 200,
      lrc: { lyric: '[00:01.00] 原文' },
      tlyric: { lyric: '[00:01.00] Translation' },
      romalrc: { lyric: '[00:01.00] Roma' },
    })

    expect(lyrics.lyric[0]?.content).toBe('原文')
    expect(lyrics.translatedLyric[0]?.content).toBe('Translation')
    expect(lyrics.romanLyric[0]?.content).toBe('Roma')
  })
})
