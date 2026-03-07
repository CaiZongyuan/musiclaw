import { useEffect, useMemo, useRef } from 'react'
import type { PlayerTrack } from '#/features/player/stores/player-store'
import type { fetchTrackLyrics } from '#/features/track/api/track-api'
import { getActiveLyricIndex } from '#/features/track/lib/lyrics'

type TrackLyricsData = Awaited<ReturnType<typeof fetchTrackLyrics>> | null

interface PlayerLyricsPanelProps {
  currentTrack: PlayerTrack
  lyricData: TrackLyricsData
  progressSeconds: number
}

export default function PlayerLyricsPanel({
  currentTrack,
  lyricData,
  progressSeconds,
}: PlayerLyricsPanelProps) {
  const lyricLines = lyricData?.parsed.lyric ?? []
  const activeIndex = getActiveLyricIndex(lyricLines, progressSeconds)
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const translatedLyricMap = useMemo(
    () =>
      new Map(
        (lyricData?.parsed.translatedLyric ?? []).map((line) => [
          line.rawTime,
          line.content,
        ]),
      ),
    [lyricData?.parsed.translatedLyric],
  )

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }

    lineRefs.current[activeIndex]?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }, [activeIndex])

  return (
    <section className="player-dock__lyrics-panel rounded-[1.75rem] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,white_8%)] p-4 shadow-[0_18px_50px_rgba(7,12,15,0.16)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-3">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold tracking-[0.18em] text-[var(--kicker)] uppercase">
            Lyrics View
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-[var(--sea-ink)]">
            {currentTrack.name}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
            {currentTrack.artists.join(' / ')}
          </p>
        </div>
        <div className="rounded-full border border-[var(--line)] bg-[rgba(79,184,178,0.1)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">
          当前歌词高亮已跟随播放进度
        </div>
      </div>

      {lyricLines.length ? (
        <div className="player-dock__lyrics-scroll mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {lyricLines.map((line, index) => {
            const isActive = index === activeIndex
            const translatedLyric = translatedLyricMap.get(line.rawTime)

            return (
              <div
                key={`${line.rawTime}-${line.content}`}
                ref={(element) => {
                  lineRefs.current[index] = element
                }}
                className={`player-dock__lyrics-line rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? 'player-dock__lyrics-line--active'
                    : 'player-dock__lyrics-line--idle'
                }`}
              >
                <p className="m-0 text-base font-semibold leading-7 text-inherit sm:text-lg">
                  {line.content}
                </p>
                {translatedLyric ? (
                  <p className="mt-1 mb-0 text-sm leading-6 text-inherit/75">
                    {translatedLyric}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-[var(--line)] px-5 py-10 text-sm text-[var(--sea-ink-soft)]">
          当前歌曲暂无可显示的歌词，后续会继续补充逐字/翻译歌词体验。
        </div>
      )}
    </section>
  )
}
