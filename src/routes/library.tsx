import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import { useAuthStore } from '#/features/auth/stores/auth-store'
import { userPlaylistsQueryOptions } from '#/features/user/api/user-api'
import type { NeteaseTrack } from '#/features/music/api/types'

export const Route = createFileRoute('/library')({ component: LibraryRoute })

function LoginRequiredState() {
  return (
    <section className="island-shell rounded-[2rem] p-6 sm:p-8">
      <p className="island-kicker mb-3">Library</p>
      <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
        登录后才能查看你的音乐库
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
        这一页现在已经开始接旧版的用户音乐库链路。登录后会优先展示喜欢的歌曲和你的歌单列表。
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/login" className="app-chip">
          去登录
        </Link>
        <Link to="/" className="app-chip">
          返回首页
        </Link>
      </div>
    </section>
  )
}

function LibraryRoute() {
  const location = useLocation()
  const isClient = typeof window !== 'undefined'
  const { profile, rawCookie } = useAuthStore(
    useShallow((state) => ({
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )

  const hasSession = Boolean(rawCookie && profile?.userId)
  const userId = profile?.userId ?? null

  const playlistsQuery = useQuery({
    ...userPlaylistsQueryOptions(userId ?? 0),
    enabled: isClient && hasSession && userId !== null,
  })

  const playlists = playlistsQuery.data?.playlist ?? []
  const likedSongsPlaylist = playlists[0] ?? null

  const likedSongsQuery = useQuery({
    ...playlistDetailQueryOptions(likedSongsPlaylist?.id ?? 0),
    enabled: Boolean(likedSongsPlaylist?.id),
  })

  const likedTracks = useMemo(
    () => (likedSongsQuery.data?.playlist.tracks ?? []) as NeteaseTrack[],
    [likedSongsQuery.data],
  )
  const playlistGroups = playlists.slice(1, 13)

  if (location.pathname !== '/library') {
    return <Outlet />
  }

  if (!hasSession) {
    return <LoginRequiredState />
  }

  return (
    <div className="library-screen py-10">
      <section className="library-header island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="library-header__inner">
          <img
            src={profile?.avatarUrl ? `${profile.avatarUrl}?param=120y120` : 'https://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=120y120'}
            alt={profile?.nickname ?? 'User avatar'}
            className="library-header__avatar"
            loading="lazy"
          />
          <div>
            <p className="island-kicker mb-3">Library</p>
            <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
              {profile?.nickname ?? 'My'} 的音乐库
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
              这一页先恢复旧版音乐库最核心的链路：喜欢的歌曲入口和用户歌单列表。后续继续补专辑、艺人、MV 和播放历史。
            </p>
          </div>
        </div>
      </section>

      <section className="library-section">
        <div className="library-grid">
          <Link to="/library/liked-songs" className="library-liked-card feature-card">
            <div className="library-liked-card__top">
              {likedTracks.length > 0 ? (
                <>
                  {likedTracks.slice(0, 3).map((track) => (
                    <p key={track.id} className="library-liked-card__lyric-line">
                      {track.name}
                    </p>
                  ))}
                </>
              ) : (
                <p className="library-liked-card__lyric-line">喜欢的歌曲会显示在这里</p>
              )}
            </div>
            <div className="library-liked-card__bottom">
              <div>
                <p className="library-liked-card__title">我喜欢的音乐</p>
                <p className="library-liked-card__subtitle">
                  {likedSongsPlaylist?.trackCount ?? likedTracks.length} 首歌曲
                </p>
              </div>
              <span className="library-liked-card__pill">Open</span>
            </div>
          </Link>

          <section className="library-liked-list island-shell rounded-[1.75rem] p-5">
            <div className="library-section__header">
              <h2 className="library-section__title">喜欢的歌曲</h2>
              <Link to="/library/liked-songs" className="home-row__more">
                查看全部
              </Link>
            </div>
            {likedTracks.length > 0 ? (
              <div className="grid gap-3">
                {likedTracks.slice(0, 5).map((track, index) => (
                  <article key={track.id} className="library-track-row">
                    <div className="min-w-0 flex-1">
                      <p className="library-track-row__title">
                        {index + 1}. {track.name}
                      </p>
                      <p className="library-track-row__meta">
                        {track.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
                      </p>
                    </div>
                    <PlayTrackButton
                      track={track}
                      queue={likedTracks}
                      className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </article>
                ))}
              </div>
            ) : (
              <div className="library-empty-state">
                还没有拿到喜欢歌曲的详细列表，可能是接口还在返回空数据。
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="library-section">
        <div className="library-section__header">
          <h2 className="library-section__title">歌单</h2>
          <span className="library-section__count">{playlistGroups.length} 个可见歌单</span>
        </div>
        {playlistsQuery.isLoading ? (
          <div className="library-empty-state">正在加载你的歌单列表…</div>
        ) : playlistGroups.length > 0 ? (
          <div className="library-playlist-grid">
            {playlistGroups.map((playlist) => (
              <Link
                key={playlist.id}
                to="/playlist/$id"
                params={{ id: String(playlist.id) }}
                className="home-cover-card feature-card"
              >
                <div className="home-cover-card__artwork-shell">
                  {playlist.coverImgUrl || playlist.picUrl ? (
                    <img
                      src={playlist.coverImgUrl ?? playlist.picUrl}
                      alt={playlist.name}
                      className="home-cover-card__artwork"
                      loading="lazy"
                    />
                  ) : (
                    <div className="home-cover-card__artwork-placeholder">
                      {playlist.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="home-cover-card__title">{playlist.name}</p>
                  <p className="home-cover-card__subtitle">
                    {playlist.trackCount ?? 0} 首 · {playlist.creator?.name ?? 'Playlist'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="library-empty-state">当前还没有拿到你的歌单列表。</div>
        )}
      </section>
    </div>
  )
}
