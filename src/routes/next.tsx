import { Link, createFileRoute } from '@tanstack/react-router'
import { Play, Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore } from '#/features/player/stores/player-store'

export const Route = createFileRoute('/next')({
  component: NextRoute,
})

function formatTrackTime(durationMs?: number) {
  if (!durationMs || durationMs < 1000) {
    return '0:00'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function QueueTrackCard({
  track,
  indexLabel,
  isCurrent = false,
  onPlay,
  onRemove,
}: {
  track: {
    id: number
    name: string
    artists: string[]
    albumName?: string
    coverUrl?: string
    durationMs?: number
  }
  indexLabel: string
  isCurrent?: boolean
  onPlay: () => void
  onRemove?: () => void
}) {
  return (
    <article className={`queue-card ${isCurrent ? 'queue-card--current' : ''}`}>
      <div className="queue-card__index">{indexLabel}</div>
      <div className="queue-card__cover-shell">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.name}
            className="queue-card__cover"
            loading="lazy"
          />
        ) : (
          <div className="queue-card__cover-placeholder">{track.name.slice(0, 1)}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="queue-card__title">{track.name}</p>
        <p className="queue-card__meta">
          {track.artists.join(' / ')}
          {track.albumName ? ` · ${track.albumName}` : ''}
        </p>
      </div>
      <div className="queue-card__time">{formatTrackTime(track.durationMs)}</div>
      <div className="queue-card__actions">
        <button
          type="button"
          onClick={onPlay}
          className="queue-card__button"
          aria-label={`Play ${track.name} now`}
        >
          <Play size={16} />
          <span>播放</span>
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="queue-card__button queue-card__button--ghost"
            aria-label={`Remove ${track.name} from queue`}
          >
            <Trash2 size={15} />
            <span>移除</span>
          </button>
        ) : null}
      </div>
    </article>
  )
}

function NextRoute() {
  const { currentTrackId, playTrack, queue, removeTrackFromQueue } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      playTrack: state.playTrack,
      queue: state.queue,
      removeTrackFromQueue: state.removeTrackFromQueue,
    })),
  )

  const currentIndex = queue.findIndex((track) => track.id === currentTrackId)
  const currentTrack =
    queue.find((track) => track.id === currentTrackId) ?? queue[0] ?? null
  const upcomingTracks =
    currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 101) : queue.slice(1, 101)

  if (!currentTrack) {
    return (
      <main className="py-10">
        <section className="island-shell rounded-[2rem] p-6 sm:p-8">
          <p className="island-kicker mb-3">Next Up</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            当前播放队列还是空的
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            从首页、搜索页、歌单页或专辑页点击播放后，这里会显示当前播放歌曲和接下来的队列。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="app-chip">
              回到首页
            </Link>
            <Link
              to="/search"
              search={{ q: '', type: 1018, page: 1 }}
              className="app-chip"
            >
              去搜索
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="queue-page py-10">
      <section className="queue-page__section">
        <div className="queue-page__header">
          <h1 className="queue-page__title">Now Playing</h1>
          <span className="queue-page__count">1 首</span>
        </div>
        <QueueTrackCard
          track={currentTrack}
          indexLabel="Now"
          isCurrent
          onPlay={() => playTrack(currentTrack.id)}
        />
      </section>

      <section className="queue-page__section">
        <div className="queue-page__header">
          <h2 className="queue-page__title">Next Up</h2>
          <span className="queue-page__count">{upcomingTracks.length} 首</span>
        </div>

        {upcomingTracks.length > 0 ? (
          <div className="queue-page__list">
            {upcomingTracks.map((track, index) => (
              <QueueTrackCard
                key={`${track.id}-${index}`}
                track={track}
                indexLabel={String(index + 1).padStart(2, '0')}
                onPlay={() => playTrack(track.id)}
                onRemove={() => removeTrackFromQueue(track.id)}
              />
            ))}
          </div>
        ) : (
          <div className="queue-page__empty rounded-[1.5rem] border border-dashed border-[var(--line)] px-6 py-10 text-sm text-[var(--sea-ink-soft)]">
            当前队列里还没有更多歌曲。继续在歌单、专辑或搜索结果里点播，就会按顺序出现在这里。
          </div>
        )}
      </section>
    </main>
  )
}
