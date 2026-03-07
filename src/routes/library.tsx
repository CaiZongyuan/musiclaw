import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteaseTrack,
} from '#/features/music/api/types'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import {
  likedAlbumsQueryOptions,
  likedArtistsQueryOptions,
  type UserPlayHistoryItem,
  userPlayHistoryQueryOptions,
  userPlaylistsQueryOptions,
} from '#/features/user/api/user-api'
import { usePlayableTracks } from '#/lib/music/playability-client'

export const Route = createFileRoute('/library')({ component: LibraryRoute })

type LibraryTab = 'playlists' | 'albums' | 'artists' | 'playHistory'

const DEFAULT_AVATAR_URL =
  'https://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=120y120'

function LoginRequiredState() {
  return (
    <section className="island-shell rounded-[2rem] p-6 sm:p-8">
      <p className="island-kicker mb-3">Library</p>
      <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
        登录后才能查看你的音乐库
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
        这一页现在已经开始接旧版的用户音乐库链路。登录后会优先展示喜欢的歌曲、歌单、收藏专辑、收藏艺人和播放历史。
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

function AccountOnlyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="library-empty-state">
      <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to="/login/account" className="app-chip">
          账号登录
        </Link>
      </div>
    </div>
  )
}

function CollectionCoverCard({
  title,
  subtitle,
  imageUrl,
  to,
  id,
  variant = 'default',
}: {
  title: string
  subtitle: string
  imageUrl?: string
  to: '/album/$id' | '/artist/$id' | '/playlist/$id'
  id: string
  variant?: 'default' | 'artist'
}) {
  return (
    <Link
      to={to}
      params={{ id }}
      className={`home-cover-card feature-card ${variant === 'artist' ? 'home-cover-card--artist' : ''}`}
    >
      <div className="home-cover-card__artwork-shell">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="home-cover-card__artwork"
            loading="lazy"
          />
        ) : (
          <div className="home-cover-card__artwork-placeholder">{title.slice(0, 1)}</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="home-cover-card__title">{title}</p>
        <p className="home-cover-card__subtitle">{subtitle}</p>
      </div>
    </Link>
  )
}

function PlayHistorySection({ items }: { items: UserPlayHistoryItem[] }) {
  const historyTracks = items.map((item) => item.song).filter(Boolean)

  return items.length > 0 ? (
    <div className="grid gap-3">
      {items.slice(0, 12).map((item, index) => (
        <article key={`${item.song.id}-${index}`} className="library-track-row">
          <div className="library-track-row__cover-shell">
            {item.song.al?.picUrl ?? item.song.album?.picUrl ? (
              <img
                src={item.song.al?.picUrl ?? item.song.album?.picUrl}
                alt={item.song.name}
                className="library-track-row__cover"
                loading="lazy"
              />
            ) : (
              <div className="library-track-row__cover-placeholder">{item.song.name.slice(0, 1)}</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="library-track-row__title">
              {index + 1}. {item.song.name}
            </p>
            <p className="library-track-row__meta">
              {item.song.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
              {item.song.al?.name ? ` · ${item.song.al.name}` : ''}
              {` · 播放 ${item.playCount} 次`}
            </p>
          </div>
          <PlayTrackButton
            track={item.song}
            queue={historyTracks}
            showPlayNext
            className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </article>
      ))}
    </div>
  ) : (
    <div className="library-empty-state">当前还没有拿到最近播放记录。</div>
  )
}

function LibraryRoute() {
  const location = useLocation()
  const isClient = typeof window !== 'undefined'
  const [currentTab, setCurrentTab] = useState<LibraryTab>('playlists')
  const { loginMode, musicU, profile, rawCookie } = useAuthStore(
    useShallow((state) => ({
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )

  const hasSession = Boolean(profile?.userId)
  const hasAccountSession = hasAccountNeteaseSession({
    loginMode,
    profile,
    musicU,
    csrfToken: null,
    rawCookie,
  })
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

  const likedAlbumsQuery = useQuery({
    ...likedAlbumsQueryOptions(8),
    enabled: isClient && hasAccountSession,
  })

  const likedArtistsQuery = useQuery({
    ...likedArtistsQueryOptions(8),
    enabled: isClient && hasAccountSession,
  })

  const playHistoryQuery = useQuery({
    ...userPlayHistoryQueryOptions(userId ?? 0, 1),
    enabled: isClient && hasAccountSession && userId !== null,
  })

  const likedTracks = usePlayableTracks(
    useMemo(
      () => (likedSongsQuery.data?.playlist.tracks ?? []) as NeteaseTrack[],
      [likedSongsQuery.data],
    ),
  )
  const playlistGroups = playlists.slice(1, 13)
  const likedAlbums = useMemo(
    () => (likedAlbumsQuery.data?.data ?? []) as NeteaseAlbumSummary[],
    [likedAlbumsQuery.data],
  )
  const likedArtists = useMemo(
    () => (likedArtistsQuery.data?.data ?? []) as NeteaseArtistSummary[],
    [likedArtistsQuery.data],
  )
  const weeklyHistory = useMemo(
    () => (playHistoryQuery.data?.weekData ?? []) as UserPlayHistoryItem[],
    [playHistoryQuery.data],
  )
  const likedTrackCovers = likedTracks
    .map((track) => track.al?.picUrl ?? track.album?.picUrl)
    .filter((coverUrl): coverUrl is string => Boolean(coverUrl))
    .slice(0, 3)

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
            src={profile?.avatarUrl ? `${profile.avatarUrl}?param=160y160` : DEFAULT_AVATAR_URL}
            alt={profile?.nickname ?? 'User avatar'}
            className="library-header__avatar"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <p className="island-kicker mb-3">Library</p>
            <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
              {profile?.nickname ?? 'My'} 的音乐库
            </h1>
            <p className="library-header__description mt-4 max-w-3xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
              这一页已开始回到旧版 Library 的信息结构：上方保留喜欢的歌曲入口，下方恢复歌单 / 专辑 / 艺人 / 播放历史分区。
            </p>
            {loginMode === 'username' ? (
              <div className="library-mode-note mt-4 rounded-[1rem] border border-[var(--line)] bg-[rgba(255,255,255,0.44)] px-4 py-3 text-sm text-[var(--sea-ink-soft)]">
                当前是用户名只读模式：公开歌单与喜欢歌曲入口可用，收藏专辑、收藏艺人和播放历史需要账号登录。
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="library-section">
        <div className="library-grid">
          <Link to="/library/liked-songs" className="library-liked-card feature-card">
            <div className="library-liked-card__top">
              <div className="library-liked-card__copy">
                {likedTracks.length > 0 ? (
                  likedTracks.slice(0, 3).map((track) => (
                    <p key={track.id} className="library-liked-card__lyric-line">
                      {track.name}
                    </p>
                  ))
                ) : (
                  <p className="library-liked-card__lyric-line">喜欢的歌曲会显示在这里</p>
                )}
              </div>
              <div className="library-liked-card__artwork-stack" aria-hidden>
                {likedTrackCovers.length > 0 ? (
                  likedTrackCovers.map((coverUrl, index) => (
                    <div
                      key={`${coverUrl}-${index}`}
                      className={`library-liked-card__artwork-tile library-liked-card__artwork-tile--${index + 1}`}
                    >
                      <img src={coverUrl} alt="" className="library-liked-card__artwork" loading="lazy" />
                    </div>
                  ))
                ) : (
                  <div className="library-liked-card__artwork-fallback">♪</div>
                )}
              </div>
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
                    <div className="library-track-row__cover-shell">
                      {track.al?.picUrl ?? track.album?.picUrl ? (
                        <img
                          src={track.al?.picUrl ?? track.album?.picUrl}
                          alt={track.name}
                          className="library-track-row__cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="library-track-row__cover-placeholder">{track.name.slice(0, 1)}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="library-track-row__title">
                        {index + 1}. {track.name}
                      </p>
                      <p className="library-track-row__meta">
                        {track.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
                        {track.al?.name ? ` · ${track.al.name}` : ''}
                      </p>
                    </div>
                    <PlayTrackButton
                      track={track}
                      queue={likedTracks}
                      source={{ label: '我喜欢的音乐', to: '/library/liked-songs' }}
                      showPlayNext
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

      <section className="library-panel island-shell rounded-[2rem] p-5 sm:p-6">
        <div className="library-tabs-row">
          <div className="library-tabs" role="tablist" aria-label="Library sections">
            {[
              ['playlists', `歌单 ${playlistGroups.length}`],
              ['albums', `专辑 ${likedAlbums.length}`],
              ['artists', `艺人 ${likedArtists.length}`],
              ['playHistory', `最近播放 ${weeklyHistory.length}`],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={currentTab === value}
                className={`library-tab ${currentTab === value ? 'library-tab--active' : ''}`}
                onClick={() => setCurrentTab(value as LibraryTab)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="library-tab-panel">
          {currentTab === 'playlists' ? (
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
                    <CollectionCoverCard
                      key={playlist.id}
                      id={String(playlist.id)}
                      to="/playlist/$id"
                      imageUrl={playlist.coverImgUrl ?? playlist.picUrl}
                      title={playlist.name}
                      subtitle={`${playlist.trackCount ?? 0} 首 · ${playlist.creator?.name ?? 'Playlist'}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="library-empty-state">当前还没有拿到你的歌单列表。</div>
              )}
            </section>
          ) : null}

          {currentTab === 'albums' ? (
            <section className="library-section">
              <div className="library-section__header">
                <h2 className="library-section__title">收藏专辑</h2>
                <span className="library-section__count">{likedAlbums.length} 张</span>
              </div>
              {!hasAccountSession ? (
                <AccountOnlyState
                  title="收藏专辑需要账号登录"
                  description="用户名只读模式下无法读取收藏专辑列表。使用 `/login/account` 登录后，这里会恢复成旧版的专辑分区。"
                />
              ) : likedAlbumsQuery.isLoading ? (
                <div className="library-empty-state">正在加载收藏专辑…</div>
              ) : likedAlbums.length > 0 ? (
                <div className="home-cover-grid library-collection-grid">
                  {likedAlbums.map((album) => (
                    <CollectionCoverCard
                      key={album.id}
                      id={String(album.id)}
                      to="/album/$id"
                      imageUrl={album.picUrl ?? album.blurPicUrl}
                      title={album.name}
                      subtitle={
                        album.artist?.name ?? album.artists?.map((artist) => artist.name).join(' / ') ?? 'Album'
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="library-empty-state">当前还没有拿到收藏专辑列表。</div>
              )}
            </section>
          ) : null}

          {currentTab === 'artists' ? (
            <section className="library-section">
              <div className="library-section__header">
                <h2 className="library-section__title">收藏艺人</h2>
                <span className="library-section__count">{likedArtists.length} 位</span>
              </div>
              {!hasAccountSession ? (
                <AccountOnlyState
                  title="收藏艺人需要账号登录"
                  description="用户名只读模式下无法读取收藏艺人列表。账号登录后，这里会显示更接近旧版的艺人分区。"
                />
              ) : likedArtistsQuery.isLoading ? (
                <div className="library-empty-state">正在加载收藏艺人…</div>
              ) : likedArtists.length > 0 ? (
                <div className="home-cover-grid home-cover-grid--artists library-collection-grid">
                  {likedArtists.map((artist) => (
                    <CollectionCoverCard
                      key={artist.id}
                      id={String(artist.id)}
                      to="/artist/$id"
                      imageUrl={artist.picUrl ?? artist.img1v1Url ?? artist.cover}
                      title={artist.name}
                      subtitle={artist.alias?.join(' / ') || 'Artist'}
                      variant="artist"
                    />
                  ))}
                </div>
              ) : (
                <div className="library-empty-state">当前还没有拿到收藏艺人列表。</div>
              )}
            </section>
          ) : null}

          {currentTab === 'playHistory' ? (
            <section className="library-section">
              <div className="library-section__header">
                <h2 className="library-section__title">最近播放</h2>
                <span className="library-section__count">{weeklyHistory.length} 首</span>
              </div>
              {!hasAccountSession ? (
                <AccountOnlyState
                  title="播放历史需要账号登录"
                  description="旧版 Library 的播放历史属于账号态内容。完成账号登录后，这里会显示最近一周的播放记录预览。"
                />
              ) : playHistoryQuery.isLoading ? (
                <div className="library-empty-state">正在加载播放历史…</div>
              ) : (
                <PlayHistorySection items={weeklyHistory} />
              )}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}
