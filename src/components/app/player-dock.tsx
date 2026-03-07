import { useQuery } from '@tanstack/react-query'
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PlayerLyricsPanel from '#/features/player/components/player-lyrics-panel'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { trackLyricsQueryOptions } from '#/features/track/api/track-api'
import { getLyricPreview } from '#/features/track/lib/lyrics'

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function PlayerDock() {
  const {
    currentTrackId,
    cycleRepeatMode,
    durationSeconds,
    isPlaying,
    progressSeconds,
    queue,
    repeatMode,
    seekTo,
    shuffleEnabled,
    skipToNext,
    skipToPrevious,
    togglePlayback,
    toggleShuffleEnabled,
    volume,
    setVolume,
  } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      cycleRepeatMode: state.cycleRepeatMode,
      durationSeconds: state.durationSeconds,
      isPlaying: state.isPlaying,
      progressSeconds: state.progressSeconds,
      queue: state.queue,
      repeatMode: state.repeatMode,
      seekTo: state.seekTo,
      shuffleEnabled: state.shuffleEnabled,
      skipToNext: state.skipToNext,
      skipToPrevious: state.skipToPrevious,
      togglePlayback: state.togglePlayback,
      toggleShuffleEnabled: state.toggleShuffleEnabled,
      volume: state.volume,
      setVolume: state.setVolume,
    })),
  )
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)

  const currentTrack =
    queue.find((track) => track.id === currentTrackId) ?? null
  const hasTrack = currentTrack !== null

  const { data: lyricData } = useQuery({
    ...trackLyricsQueryOptions(currentTrackId ?? 0),
    enabled: currentTrackId !== null,
  })

  useEffect(() => {
    if (!currentTrack) {
      setIsLyricsOpen(false)
    }
  }, [currentTrack])

  const lyricPreview = getLyricPreview(
    lyricData?.parsed.lyric ?? [],
    progressSeconds,
  )
  const repeatButtonLabel =
    repeatMode === 'one'
      ? 'Repeat current track'
      : repeatMode === 'all'
        ? 'Repeat queue'
        : 'Repeat off'
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat
  const progressValue =
    durationSeconds > 0
      ? Math.min(progressSeconds, durationSeconds)
      : Math.max(progressSeconds, 0)

  return (
    <div className="player-dock border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_86%,black_14%)] px-4 py-3 backdrop-blur-xl">
      <div className="page-wrap flex flex-col gap-4">
        {currentTrack && isLyricsOpen ? (
          <PlayerLyricsPanel
            currentTrack={currentTrack}
            lyricData={lyricData ?? null}
            progressSeconds={progressSeconds}
          />
        ) : null}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 xl:max-w-[32rem]">
            <div className="flex items-center justify-between gap-3">
              <p className="player-dock__eyebrow m-0 text-xs font-semibold tracking-[0.24em] text-[var(--kicker)] uppercase">
                Now Playing
              </p>
              <button
                type="button"
                onClick={() => setIsLyricsOpen((value) => !value)}
                disabled={!hasTrack}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  isLyricsOpen
                    ? 'border-[rgba(79,184,178,0.42)] bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]'
                    : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isLyricsOpen ? '收起歌词' : '展开歌词'}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[rgba(79,184,178,0.12)] text-sm font-semibold text-[var(--lagoon-deep)]">
                {currentTrack ? currentTrack.name.slice(0, 1) : '♪'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                  {currentTrack?.name ?? '播放器骨架已就位'}
                </p>
                <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                  {currentTrack?.artists.join(' / ') ??
                    '现在已经能从歌单、专辑、艺人和搜索结果实播'}
                </p>
                <p className="truncate text-[11px] text-[var(--sea-ink-soft)]/80">
                  {currentTrack?.albumName ??
                    '拖动进度条、切换循环/随机和滚动歌词现在已可用'}
                </p>
              </div>
            </div>
            {lyricPreview.length && !isLyricsOpen ? (
              <div className="mt-3 space-y-1 pl-[3.75rem]">
                {lyricPreview.map((line, index) => (
                  <p
                    key={`${line.time}-${line.content}`}
                    className={
                      index === 0
                        ? 'm-0 truncate text-xs font-medium text-[var(--sea-ink)]'
                        : 'm-0 truncate text-xs text-[var(--sea-ink-soft)]'
                    }
                  >
                    {line.content}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-3 xl:max-w-[34rem]">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={toggleShuffleEnabled}
                className={`player-dock__button ${shuffleEnabled ? 'player-dock__button--active' : ''}`}
                aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
                aria-pressed={shuffleEnabled}
                disabled={!hasTrack || queue.length < 2}
              >
                <Shuffle size={16} />
              </button>
              <button
                type="button"
                onClick={skipToPrevious}
                className="player-dock__button"
                aria-label="Previous track"
                disabled={!hasTrack}
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                onClick={togglePlayback}
                className="player-dock__button player-dock__button--primary"
                aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
                disabled={!hasTrack}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                type="button"
                onClick={skipToNext}
                className="player-dock__button"
                aria-label="Next track"
                disabled={!hasTrack}
              >
                <SkipForward size={18} />
              </button>
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`player-dock__button ${repeatMode !== 'off' ? 'player-dock__button--active' : ''}`}
                aria-label={repeatButtonLabel}
                aria-pressed={repeatMode !== 'off'}
                disabled={!hasTrack}
              >
                <RepeatIcon size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[var(--sea-ink-soft)]">
              <span className="w-9 text-right tabular-nums">
                {formatTime(progressValue)}
              </span>
              <input
                type="range"
                min="0"
                max={durationSeconds > 0 ? durationSeconds : 1}
                step="0.1"
                value={progressValue}
                onChange={(event) => seekTo(Number(event.target.value))}
                disabled={!hasTrack}
                className="player-dock__slider"
                aria-label="Playback progress"
              />
              <span className="w-9 tabular-nums">{formatTime(durationSeconds)}</span>
            </div>
          </div>

          <label className="flex min-w-0 items-center gap-3 xl:w-56">
            <Volume2 size={16} className="text-[var(--sea-ink-soft)]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="player-dock__slider"
              aria-label="Playback volume"
            />
            <span className="w-10 text-right text-xs text-[var(--sea-ink-soft)] tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
