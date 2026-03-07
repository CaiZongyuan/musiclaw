import type {
  NeteaseTrack,
  NeteaseTrackPrivilege,
} from '#/features/music/api/types'

interface PlayabilityOptions {
  hasCloudPrivilege?: boolean
  userVipType?: number
}

export function isTrackPlayable(
  track: Pick<NeteaseTrack, 'fee' | 'noCopyrightRcmd' | 'privilege'>,
  options: PlayabilityOptions = {},
) {
  const { hasCloudPrivilege = false, userVipType } = options

  if (track.privilege?.pl && track.privilege.pl > 0) {
    return { playable: true, reason: '' }
  }

  if (hasCloudPrivilege && track.privilege?.cs) {
    return { playable: true, reason: '' }
  }

  if (track.fee === 1 || track.privilege?.fee === 1) {
    if (typeof userVipType === 'number' && userVipType > 0) {
      return { playable: true, reason: '' }
    }

    if (hasCloudPrivilege && userVipType == null) {
      return { playable: true, reason: '' }
    }

    return { playable: false, reason: 'VIP Only' }
  }

  if (track.fee === 4 || track.privilege?.fee === 4) {
    return { playable: false, reason: '付费专辑' }
  }

  if (track.noCopyrightRcmd !== null && track.noCopyrightRcmd !== undefined) {
    return { playable: false, reason: '无版权' }
  }

  if (typeof track.privilege?.st === 'number' && track.privilege.st < 0) {
    return { playable: false, reason: '已下架' }
  }

  return { playable: true, reason: '' }
}

export function mapTrackPlayableStatus<TTrack extends NeteaseTrack>(
  tracks: TTrack[] | undefined,
  privileges: NeteaseTrackPrivilege[] = [],
  options: PlayabilityOptions = {},
) {
  if (!tracks) {
    return []
  }

  return tracks.map((track) => {
    const privilege = privileges.find((item) => item.id === track.id)
    const mergedTrack = {
      ...track,
      privilege: {
        ...(track.privilege ?? {}),
        ...(privilege ?? {}),
      },
    }

    const result = isTrackPlayable(mergedTrack, options)

    return {
      ...mergedTrack,
      playable: result.playable,
      reason: result.reason,
    }
  })
}
