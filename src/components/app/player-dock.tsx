import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import {
  ChevronUp,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
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
  const navigate = useNavigate()
  const location = useLocation()
  const {
    currentTrackId,
    cycleRepeatMode,
    durationSeconds,
    isPlaying,
    playNextQueue,
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
      playNextQueue: state.playNextQueue,
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

  const VolumeIcon =
    volume === 0 ? VolumeX : volume <= 0.5 ? Volume1 : Volume2

  function toggleNextQueuePage() {
    if (location.pathname === '/next') {
      if (typeof window !== 'undefined') {
        window.history.back()
      }
      return
    }

    void navigate({ to: '/next' })
  }

  return (
    <div className="player-dock border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,black_12%)] px-4 pt-2 pb-3 backdrop-blur-xl">
      <div className="page-wrap flex flex-col gap-3">
        {currentTrack && isLyricsOpen ? (
          <PlayerLyricsPanel
            currentTrack={currentTrack}
            lyricData={lyricData ?? null}
            progressSeconds={progressSeconds}
          />
        ) : null}

        <div className="player-dock__progress-wrap">
          <input
            type="range"
            min="0"
            max={durationSeconds > 0 ? durationSeconds : 1}
            step="0.1"
            value={progressValue}
            onChange={(event) => seekTo(Number(event.target.value))}
            disabled={!hasTrack}
            className="player-dock__progress-slider"
            aria-label="Playback progress"
          />
          <div className="player-dock__progress-meta text-[11px] text-[var(--sea-ink-soft)]">
            <span>{formatTime(progressValue)}</span>
            <span>{formatTime(durationSeconds)}</span>
          </div>
        </div>

        <div className="player-dock__controls-grid">
          <div className="player-dock__playing-block">
            <div className="player-dock__cover-shell">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.name}
                  className="player-dock__cover"
                  loading="lazy"
                />
              ) : (
                <span className="player-dock__cover-placeholder">
                  {currentTrack ? currentTrack.name.slice(0, 1) : '♪'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {currentTrack?.name ?? '还没有正在播放的歌曲'}
              </p>
              <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
                {currentTrack?.artists.join(', ') ?? '从首页、搜索页或详情页点击播放后会出现在这里'}
              </p>
              <p className="mt-1 truncate text-[11px] text-[var(--sea-ink-soft)]/80">
                {currentTrack?.albumName ?? '底部播放器正在继续向旧版结构收口'}
              </p>
              {lyricPreview.length && !isLyricsOpen ? (
                <div className="mt-2 space-y-1">
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
          </div>

          <div className="player-dock__center-controls">
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
          </div>

          <div className="player-dock__right-controls">
            <button
              type="button"
              onClick={toggleNextQueuePage}
              className={`player-dock__button player-dock__queue-button ${location.pathname === '/next' ? 'player-dock__button--active' : ''}`}
              aria-label="Open next up queue"
              disabled={!hasTrack}
            >
              <ListMusic size={16} />
              {playNextQueue.length > 0 ? (
                <span className="player-dock__queue-badge">{playNextQueue.length}</span>
              ) : null}
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
            <label className="player-dock__volume-control">
              <VolumeIcon size={16} className="text-[var(--sea-ink-soft)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="player-dock__volume-slider"
                aria-label="Playback volume"
              />
            </label>
            <button
              type="button"
              onClick={() => setIsLyricsOpen((value) => !value)}
              disabled={!hasTrack}
              className={`player-dock__button ${isLyricsOpen ? 'player-dock__button--active' : ''}`}
              aria-label={isLyricsOpen ? 'Collapse lyrics panel' : 'Open lyrics panel'}
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
