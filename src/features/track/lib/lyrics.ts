import type { NeteaseLyricResponse } from '#/features/music/api/types'

export interface ParsedLyricLine {
  time: number
  rawTime: string
  content: string
}

export interface NormalizedTrackLyrics {
  lyric: ParsedLyricLine[]
  translatedLyric: ParsedLyricLine[]
  romanLyric: ParsedLyricLine[]
  lyricUser?: Record<string, {}>
  transUser?: Record<string, {}>
}

const extractLrcRegex =
  /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm
const extractTimestampRegex =
  /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g

function trimContent(content: string) {
  const trimmed = content.trim()
  return trimmed.length > 0 ? trimmed : content
}

export function parseLyricText(rawLyric: string) {
  const parsedLyrics: ParsedLyricLine[] = []

  function binarySearch(lyric: ParsedLyricLine) {
    let low = 0
    let high = parsedLyrics.length - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midTime = parsedLyrics[mid]?.time ?? 0

      if (midTime === lyric.time) {
        return mid
      }

      if (midTime < lyric.time) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return low
  }

  for (const line of rawLyric.trim().matchAll(extractLrcRegex)) {
    const lyricTimestamps = line.groups?.lyricTimestamps
    const content = line.groups?.content

    if (!lyricTimestamps || typeof content !== 'string') {
      continue
    }

    for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
      const min = timestamp.groups?.min
      const sec = timestamp.groups?.sec
      const ms = timestamp.groups?.ms

      if (!min || !sec) {
        continue
      }

      const validMs = ms?.slice(0, 2) ?? '00'
      const rawTime = `[${min}:${sec}.${validMs}]`
      const time = Number(min) * 60 + Number(sec) + Number(validMs) * 0.01
      const parsedLyric = {
        rawTime,
        time,
        content: trimContent(content),
      }

      parsedLyrics.splice(binarySearch(parsedLyric), 0, parsedLyric)
    }
  }

  return parsedLyrics
}

export function normalizeTrackLyricsResponse(
  response: NeteaseLyricResponse,
): NormalizedTrackLyrics {
  return {
    lyric: parseLyricText(response.lrc?.lyric ?? ''),
    translatedLyric: parseLyricText(response.tlyric?.lyric ?? ''),
    romanLyric: parseLyricText(response.romalrc?.lyric ?? ''),
    lyricUser: response.lyricUser,
    transUser: response.transUser,
  }
}
