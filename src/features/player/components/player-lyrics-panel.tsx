import { useEffect, useMemo, useRef } from 'react'
import { useSettingsStore } from '#/features/settings/stores/settings-store'
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
  const lyricFontSize = useSettingsStore((state) => state.lyricFontSize)
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
  const activeFontSize = Math.max(24, Math.round(lyricFontSize * 0.42))
  const idleFontSize = Math.max(18, activeFontSize - 6)
  const subFontSize = Math.max(13, Math.round(activeFontSize * 0.48))

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
    <section className="player-dock__lyrics-panel">
      {currentTrack.coverUrl ? (
        <div className="player-dock__lyrics-backdrop" aria-hidden>
          <img src={currentTrack.coverUrl} alt="" className="player-dock__lyrics-backdrop-image" />
        </div>
      ) : null}

      <div className="player-dock__lyrics-panel-inner">
        <div className="player-dock__lyrics-header">
          <div className="min-w-0">
            <p className="player-dock__lyrics-kicker">Lyrics View</p>
            <p className="player-dock__lyrics-track">{currentTrack.name}</p>
            <p className="player-dock__lyrics-artists">{currentTrack.artists.join(' / ')}</p>
          </div>
          <div className="player-dock__lyrics-badge">字号 {lyricFontSize}px</div>
        </div>

        {lyricLines.length ? (
          <div className="player-dock__lyrics-scroll player-dock__lyrics-scroll--immersive">
            <div className="player-dock__lyrics-spacer" aria-hidden />
            {lyricLines.map((line, index) => {
              const isActive = index === activeIndex
              const translatedLyric = translatedLyricMap.get(line.rawTime)

              return (
                <div
                  key={`${line.rawTime}-${line.content}`}
                  ref={(element) => {
                    lineRefs.current[index] = element
                  }}
                  className={`player-dock__lyrics-line-block ${
                    isActive
                      ? 'player-dock__lyrics-line-block--active'
                      : 'player-dock__lyrics-line-block--idle'
                  }`}
                >
                  <div className="player-dock__lyrics-line-content">
                    <p
                      className="player-dock__lyrics-line-text"
                      style={{ fontSize: `${isActive ? activeFontSize : idleFontSize}px` }}
                    >
                      {line.content}
                    </p>
                    {translatedLyric ? (
                      <p
                        className="player-dock__lyrics-line-subtext"
                        style={{ fontSize: `${subFontSize}px` }}
                      >
                        {translatedLyric}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
            <div className="player-dock__lyrics-spacer player-dock__lyrics-spacer--end" aria-hidden />
          </div>
        ) : (
          <div className="player-dock__lyrics-empty">
            当前歌曲暂无可显示的歌词，后续还可以继续补逐字和更多翻译细节。
          </div>
        )}
      </div>
    </section>
  )
}
