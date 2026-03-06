import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import {
  fetchTrackLyrics,
  getTrackLyrics,
  getTrackSource,
} from '#/features/track/api/track-api'
import { usePlayerStore } from '#/features/player/stores/player-store'

type TrackLyricsData = Awaited<ReturnType<typeof fetchTrackLyrics>> | null

export default function PlayerDock() {
  const {
    currentTrackId,
    isPlaying,
    queue,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    volume,
    setTrackSource,
    setVolume,
  } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      isPlaying: state.isPlaying,
      queue: state.queue,
      togglePlayback: state.togglePlayback,
      skipToNext: state.skipToNext,
      skipToPrevious: state.skipToPrevious,
      volume: state.volume,
      setTrackSource: state.setTrackSource,
      setVolume: state.setVolume,
    })),
  )

  const currentTrack =
    queue.find((track) => track.id === currentTrackId) ?? null

  const { data: lyricData } = useQuery<TrackLyricsData>({
    queryKey: ['track', 'lyrics-preview', currentTrackId ?? 0],
    queryFn: async () => {
      if (currentTrackId === null) {
        return null
      }

      return getTrackLyrics({
        data: {
          id: currentTrackId,
        },
      }) as Promise<TrackLyricsData>
    },
    enabled: currentTrackId !== null,
  })

  useEffect(() => {
    if (!currentTrack || currentTrack.sourceUrl) {
      return
    }

    void getTrackSource({
      data: {
        id: currentTrack.id,
      },
    }).then((source) => {
      if (source.url) {
        setTrackSource(currentTrack.id, source.url)
      }
    })
  }, [currentTrack, setTrackSource])

  const lyricPreview = lyricData?.parsed.lyric.slice(0, 3) ?? []

  return (
    <div className="player-dock border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_86%,black_14%)] px-4 py-3 backdrop-blur-xl">
      <div className="page-wrap flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="player-dock__eyebrow m-0 text-xs font-semibold tracking-[0.24em] text-[var(--kicker)] uppercase">
            Now Playing
          </p>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[rgba(79,184,178,0.12)] text-sm font-semibold text-[var(--lagoon-deep)]">
              {currentTrack ? currentTrack.name.slice(0, 1) : '♪'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {currentTrack?.name ?? '播放器骨架已就位'}
              </p>
              <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                {currentTrack?.artists.join(' / ') ??
                  '现在已经能从歌单、专辑、艺人和搜索结果入队'}
              </p>
              {currentTrack ? (
                <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
                  {currentTrack.sourceUrl
                    ? '播放地址已解析，下一步接 howler 实播'
                    : '正在解析当前歌曲的播放地址'}
                </p>
              ) : null}
            </div>
          </div>
          {lyricPreview.length ? (
            <div className="mt-3 space-y-1 pl-[3.75rem]">
              {lyricPreview.map((line) => (
                <p
                  key={`${line.time}-${line.content}`}
                  className="m-0 truncate text-xs text-[var(--sea-ink-soft)]"
                >
                  {line.content}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={skipToPrevious}
            className="player-dock__button"
            aria-label="Previous track"
          >
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="player-dock__button player-dock__button--primary"
            aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            onClick={skipToNext}
            className="player-dock__button"
            aria-label="Next track"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <label className="flex min-w-0 items-center gap-3 lg:w-64">
          <Volume2 size={16} className="text-[var(--sea-ink-soft)]" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="player-dock__slider"
          />
        </label>
      </div>
    </div>
  )
}
