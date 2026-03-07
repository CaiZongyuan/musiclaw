import { createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import type { NeteaseTrack } from '#/features/music/api/types'
import { usePlayableTracks } from '#/lib/music/playability-client'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import type { fetchPlaylistDetail } from '#/features/playlist/api/playlist-api'

export const Route = createFileRoute('/playlist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playlistDetailQueryOptions(params.id)),
  errorComponent: PlaylistErrorComponent,
  component: PlaylistRoute,
})

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return '日期待补充'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

function PlaylistRoute() {
  const data: Awaited<ReturnType<typeof fetchPlaylistDetail>> =
    Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const tracks = usePlayableTracks(data.playlist.tracks as NeteaseTrack[])
  const queueSource = {
    label: data.playlist.name,
    to: '/playlist/$id' as const,
    params: { id: String(data.playlist.id) },
  }
  const creator = data.playlist.creator as
    | { nickname?: string; name?: string }
    | undefined
  const creatorName = creator?.nickname ?? creator?.name ?? 'Unknown creator'
  const updateTime = (data.playlist as { updateTime?: number }).updateTime
  const tags = (data.playlist as { tags?: string[] }).tags ?? []
  const coverUrl = data.playlist.coverImgUrl ?? data.playlist.picUrl

  return (
    <div className="detail-screen detail-screen--playlist">
      <section className="detail-hero detail-hero--playlist island-shell">
        <div className="detail-hero__cover-shell">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={data.playlist.name}
              className="detail-hero__cover"
              loading="lazy"
            />
          ) : (
            <div className="detail-hero__cover-placeholder">
              {data.playlist.name.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="detail-hero__main">
          <p className="detail-hero__eyebrow">Playlist</p>
          <h1 className="detail-hero__title">{data.playlist.name}</h1>
          <p className="detail-hero__meta">
            Playlist by {creatorName} · 更新于 {formatDate(updateTime)} · {tracks.length} 首歌曲
          </p>
          {tags.length > 0 ? (
            <div className="detail-hero__tag-row">
              {tags.map((tag) => (
                <span key={tag} className="detail-stat-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="detail-hero__description">
            {data.playlist.description || '歌单详情已开始回到原版结构：上方封面和信息区，下方是完整歌曲列表与播放入口。'}
          </p>
          <div className="detail-hero__actions">
            <button
              type="button"
              onClick={() =>
                loadQueueAndPlay(buildPlayerQueueFromTracks(tracks), undefined, queueSource)
              }
              disabled={tracks.length === 0}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              播放全部
            </button>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">歌曲</h2>
          <span className="detail-section__count">{tracks.length} 首</span>
        </div>

        <div className="detail-track-list">
          {tracks.map((track, index) => (
            <article key={track.id} className="detail-track-row">
              <div className="detail-track-row__index">{index + 1}</div>
              <div className="detail-track-row__cover-shell">
                {track.al?.picUrl ?? track.album?.picUrl ? (
                  <img
                    src={track.al?.picUrl ?? track.album?.picUrl}
                    alt={track.name}
                    className="detail-track-row__cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="detail-track-row__cover-placeholder">{track.name.slice(0, 1)}</div>
                )}
              </div>
              <div className="detail-track-row__main">
                <p className="detail-track-row__title">{track.name}</p>
                <p className="detail-track-row__meta">
                  {track.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
                  {track.al?.name ? ` · ${track.al.name}` : ''}
                </p>
              </div>
              <span className="detail-track-row__status">
                {track.playable === false ? track.reason : 'Playable'}
              </span>
              <PlayTrackButton
                track={track}
                queue={tracks}
                source={queueSource}
                showPlayNext
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlaylistErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="歌单详情加载失败"
      description="歌单信息或曲目列表请求失败时，这里会给出明确提示，并允许你直接重试。"
      error={error}
      reset={reset}
    />
  )
}
