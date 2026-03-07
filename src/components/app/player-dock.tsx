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
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { NEW_ALBUM_AREA_OPTIONS } from '#/features/album/lib/new-album'
import PlayerLyricsPanel from '#/features/player/components/player-lyrics-panel'
import { usePlayerStore, type PlayerQueueSource } from '#/features/player/stores/player-store'
import { trackLyricsQueryOptions } from '#/features/track/api/track-api'
import TrackLikeButton from '#/features/track/components/track-like-button'
import { getLyricPreview } from '#/features/track/lib/lyrics'

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function describeQueueSource(queueSource: PlayerQueueSource | null) {
  if (!queueSource?.to) {
    return null
  }

  if (queueSource.to === '/new-album') {
    const areaLabel =
      NEW_ALBUM_AREA_OPTIONS.find((option) => option.value === queueSource.newAlbumArea)?.label ??
      '新专辑'

    return `${areaLabel} · 新专辑流`
  }

  if (queueSource.to === '/explore') {
    return `${queueSource.exploreCategory ?? '全部'} · Explore`
  }

  if (queueSource.to === '/search') {
    return queueSource.search?.q ? `搜索 “${queueSource.search.q}”` : '搜索结果'
  }

  if (queueSource.to === '/daily/songs') {
    return '每日推荐'
  }

  if (queueSource.to === '/library/liked-songs') {
    return '我喜欢的音乐'
  }

  return queueSource.label
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
    queueSource,
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
      queueSource: state.queueSource,
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

  const currentTrack = queue.find((track) => track.id === currentTrackId) ?? null
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

  const lyricPreview = getLyricPreview(lyricData?.parsed.lyric ?? [], progressSeconds)
  const repeatButtonLabel =
    repeatMode === 'one'
      ? '单曲循环'
      : repeatMode === 'all'
        ? '列表循环'
        : '关闭循环'
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat
  const progressValue =
    durationSeconds > 0
      ? Math.min(progressSeconds, durationSeconds)
      : Math.max(progressSeconds, 0)
  const artistNames = currentTrack?.artists ?? []
  const artistIds = currentTrack?.artistIds ?? []
  const sourceDetail = useMemo(() => describeQueueSource(queueSource), [queueSource])
  const VolumeIcon = volume === 0 ? VolumeX : volume <= 0.5 ? Volume1 : Volume2

  function toggleNextQueuePage() {
    if (location.pathname === '/next') {
      if (typeof window !== 'undefined') {
        window.history.back()
      }
      return
    }

    void navigate({ to: '/next' })
  }

  function goToAlbum() {
    if (!currentTrack?.albumId) {
      return
    }

    void navigate({ to: '/album/$id', params: { id: String(currentTrack.albumId) } })
  }

  function goToArtist(artistId?: number) {
    if (!artistId) {
      return
    }

    void navigate({ to: '/artist/$id', params: { id: String(artistId) } })
  }

  function goToSource() {
    if (!queueSource?.to) {
      return
    }

    if (queueSource.to === '/daily/songs' || queueSource.to === '/library/liked-songs') {
      void navigate({ to: queueSource.to })
      return
    }

    if (queueSource.to === '/explore') {
      void navigate({
        to: '/explore',
        search: { category: queueSource.exploreCategory ?? '全部' },
      })
      return
    }

    if (queueSource.to === '/new-album') {
      void navigate({
        to: '/new-album',
        search: { area: queueSource.newAlbumArea ?? 'EA', page: 1 },
      })
      return
    }

    if (queueSource.to === '/search' && queueSource.search) {
      void navigate({ to: '/search', search: queueSource.search })
      return
    }

    if (queueSource.params?.id) {
      void navigate({ to: queueSource.to, params: { id: queueSource.params.id } })
    }
  }

  return (
    <div className="player-dock border-t border-[var(--line)] bg-[var(--header-bg)] px-4 pt-2 pb-3 backdrop-blur-xl">
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
            aria-label="播放进度"
          />
          <div className="player-dock__progress-meta text-[11px] text-[var(--sea-ink-soft)]">
            <span>{formatTime(progressValue)}</span>
            <span>{formatTime(durationSeconds)}</span>
          </div>
        </div>

        <div className="player-dock__controls-grid">
          <div className="player-dock__playing-block">
            <button
              type="button"
              onClick={goToAlbum}
              className="player-dock__cover-shell player-dock__cover-button"
              disabled={!currentTrack?.albumId}
              aria-label={currentTrack?.albumName ? `打开专辑 ${currentTrack.albumName}` : '打开当前专辑'}
              title={currentTrack?.albumName ? `打开专辑 ${currentTrack.albumName}` : '打开当前专辑'}
            >
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
            </button>
            <div className="min-w-0 flex-1">
              <p className="player-dock__track-name">
                {currentTrack?.name ?? '还没有正在播放的歌曲'}
              </p>
              <p className="player-dock__track-artists">
                {currentTrack ? (
                  artistNames.map((artistName, index) => {
                    const artistId = artistIds[index]

                    return artistId ? (
                      <span key={`${artistId}-${artistName}`}>
                        <button
                          type="button"
                          onClick={() => goToArtist(artistId)}
                          className="player-dock__text-button"
                          title={`打开艺人 ${artistName}`}
                        >
                          {artistName}
                        </button>
                        {index < artistNames.length - 1 ? ', ' : ''}
                      </span>
                    ) : (
                      <span key={`${artistName}-${index}`}>
                        {artistName}
                        {index < artistNames.length - 1 ? ', ' : ''}
                      </span>
                    )
                  })
                ) : (
                  '从首页、搜索页或详情页点击播放后会出现在这里'
                )}
              </p>
              <p className="player-dock__track-source">
                {currentTrack?.albumName ? (
                  <>
                    <button
                      type="button"
                      onClick={goToAlbum}
                      className="player-dock__text-button"
                      disabled={!currentTrack.albumId}
                      title={currentTrack.albumName}
                    >
                      {currentTrack.albumName}
                    </button>
                    {queueSource?.label ? ' · 来自 ' : ''}
                  </>
                ) : null}
                {queueSource?.label ? (
                  <button
                    type="button"
                    onClick={goToSource}
                    className="player-dock__text-button"
                    disabled={!queueSource.to}
                    title={`返回 ${queueSource.label}`}
                  >
                    {queueSource.label}
                  </button>
                ) : !currentTrack?.albumName ? (
                  '当前歌曲会尽量保留来源恢复链路'
                ) : null}
              </p>
              {sourceDetail ? (
                <p className="player-dock__track-context">{sourceDetail}</p>
              ) : currentTrack?.sourceUrl ? (
                <p className="player-dock__track-context">音源已恢复，可继续播放</p>
              ) : null}
              {lyricPreview.length && !isLyricsOpen ? (
                <div className="player-dock__lyric-preview">
                  {lyricPreview.map((line, index) => (
                    <p
                      key={`${line.time}-${line.content}`}
                      className={
                        index === 0
                          ? 'player-dock__lyric-line player-dock__lyric-line--active'
                          : 'player-dock__lyric-line'
                      }
                    >
                      {line.content}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            <TrackLikeButton
              trackId={currentTrack?.id}
              className="player-dock__button player-dock__like-button"
            />
          </div>

          <div className="player-dock__center-controls">
            <button
              type="button"
              onClick={skipToPrevious}
              className="player-dock__button"
              aria-label="上一首"
              title="上一首"
              disabled={!hasTrack}
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="player-dock__button player-dock__button--primary"
              aria-label={isPlaying ? '暂停播放' : '开始播放'}
              title={isPlaying ? '暂停播放' : '开始播放'}
              disabled={!hasTrack}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              type="button"
              onClick={skipToNext}
              className="player-dock__button"
              aria-label="下一首"
              title="下一首"
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
              aria-label="打开待播队列"
              title="打开待播队列"
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
              title={repeatButtonLabel}
              aria-pressed={repeatMode !== 'off'}
              disabled={!hasTrack}
            >
              <RepeatIcon size={16} />
            </button>
            <button
              type="button"
              onClick={toggleShuffleEnabled}
              className={`player-dock__button ${shuffleEnabled ? 'player-dock__button--active' : ''}`}
              aria-label={shuffleEnabled ? '关闭随机播放' : '开启随机播放'}
              title={shuffleEnabled ? '关闭随机播放' : '开启随机播放'}
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
                aria-label="播放音量"
              />
            </label>
            <button
              type="button"
              onClick={() => setIsLyricsOpen((value) => !value)}
              disabled={!hasTrack}
              className={`player-dock__button ${isLyricsOpen ? 'player-dock__button--active player-dock__button--raised' : ''}`}
              aria-label={isLyricsOpen ? '收起歌词层' : '展开歌词层'}
              title={isLyricsOpen ? '收起歌词层' : '展开歌词层'}
            >
              <ChevronUp size={16} className={isLyricsOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
